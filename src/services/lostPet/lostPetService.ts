import type {
  ActivateLostPetInput,
  LostPetCase,
  ReportSightingInput,
  Sighting,
} from '@/types/lostPet';
import { getSeedSightings } from '@/data/lostPetData';
import { buildRecoveryLink } from '@/utils/lostPetUtils';
import { mockPet } from '@/data/mockData';

const CASES_KEY = 'petclues_lost_pet_cases';
const SIGHTINGS_KEY = 'petclues_lost_pet_sightings';

function loadCases(): LostPetCase[] {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    return raw ? (JSON.parse(raw) as LostPetCase[]) : [];
  } catch {
    return [];
  }
}

function saveCases(cases: LostPetCase[]): void {
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
}

function loadSightings(): Sighting[] {
  try {
    const raw = localStorage.getItem(SIGHTINGS_KEY);
    return raw ? (JSON.parse(raw) as Sighting[]) : [];
  } catch {
    return [];
  }
}

function saveSightings(sightings: Sighting[]): void {
  localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(sightings));
}

/**
 * Lost pet service - swap for Supabase + edge functions in production.
 *
 * Backend requirements:
 * - lost_pet_cases table with status workflow
 * - sightings table with geo coordinates + moderation
 * - Real-time subscriptions for new sightings
 * - Push/SMS notifications to owner on new reports
 * - Recovery link resolution + public report API
 * - Photo storage (S3/Supabase storage)
 * - Audit log for activate/resolve events
 */
export interface ILostPetService {
  getActiveCase(userId: string, petId?: string): Promise<LostPetCase | null>;
  getCaseById(caseId: string): Promise<LostPetCase | null>;
  activate(userId: string, petId: string, input: ActivateLostPetInput): Promise<LostPetCase>;
  resolve(userId: string, caseId: string): Promise<LostPetCase>;
  deactivate(userId: string, caseId: string): Promise<void>;
  getSightings(caseId: string): Promise<Sighting[]>;
  reportSighting(caseId: string, input: ReportSightingInput): Promise<Sighting>;
  markSightingReviewed(caseId: string, sightingId: string): Promise<void>;
}

export const mockLostPetService: ILostPetService = {
  async getActiveCase(userId, petId = mockPet.id) {
    const cases = loadCases();
    return (
      cases.find(
        (c) =>
          c.userId === userId &&
          c.petId === petId &&
          c.status === 'active',
      ) ?? null
    );
  },

  async getCaseById(caseId) {
    return loadCases().find((c) => c.id === caseId) ?? null;
  },

  async activate(userId, petId, input) {
    const cases = loadCases();
    const existing = cases.find(
      (c) => c.userId === userId && c.petId === petId && c.status === 'active',
    );
    if (existing) return existing;

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const petName = input.petName?.trim() || mockPet.name;
    const breed = input.breed?.trim() || mockPet.breed;
    const avatarInitials = input.avatarInitials?.trim() || mockPet.avatarInitials;

    const newCase: LostPetCase = {
      id,
      userId,
      petId,
      petName,
      breed,
      avatarInitials,
      photoUrl: input.photoUrl,
      status: 'active',
      lastSeenLocation: input.lastSeenLocation,
      lastSeenAt: input.lastSeenAt,
      notes: input.notes,
      activatedAt: now,
      recoveryLink: buildRecoveryLink(
        petName,
        id,
        typeof window !== 'undefined' ? window.location.origin : undefined,
      ),
      sightingsCount: 0,
      reportsReceived: 0,
      lastUpdatedAt: now,
    };

    const updated = [...cases.filter((c) => !(c.userId === userId && c.petId === petId && c.status === 'active')), newCase];
    saveCases(updated);

    const seedSightings = getSeedSightings(id);
    const allSightings = [...loadSightings(), ...seedSightings];
    saveSightings(allSightings);

    newCase.sightingsCount = seedSightings.length;
    newCase.reportsReceived = seedSightings.length;
    const caseIndex = updated.findIndex((c) => c.id === id);
    updated[caseIndex] = newCase;
    saveCases(updated);

    return newCase;
  },

  async resolve(userId, caseId) {
    const cases = loadCases();
    const index = cases.findIndex((c) => c.id === caseId && c.userId === userId);
    if (index === -1) throw new Error('Case not found');

    const resolved: LostPetCase = {
      ...cases[index],
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };
    cases[index] = resolved;
    saveCases(cases);
    return resolved;
  },

  async deactivate(userId, caseId) {
    const cases = loadCases();
    const filtered = cases.filter((c) => !(c.id === caseId && c.userId === userId));
    saveCases(filtered);
  },

  async getSightings(caseId) {
    return loadSightings()
      .filter((s) => s.caseId === caseId)
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  },

  async reportSighting(caseId, input) {
    const cases = loadCases();
    const index = cases.findIndex((c) => c.id === caseId);
    if (index === -1) throw new Error('Case not found');

    const sighting: Sighting = {
      id: crypto.randomUUID(),
      caseId,
      location: input.location,
      reportedAt: new Date().toISOString(),
      notes: input.notes,
      hasPhoto: input.hasPhoto ?? false,
      reporterName: input.reporterName ?? 'Community member',
      status: 'new',
    };

    const sightings = [...loadSightings(), sighting];
    saveSightings(sightings);

    const updatedCase: LostPetCase = {
      ...cases[index],
      sightingsCount: cases[index].sightingsCount + 1,
      reportsReceived: cases[index].reportsReceived + 1,
      lastUpdatedAt: new Date().toISOString(),
    };
    cases[index] = updatedCase;
    saveCases(cases);

    return sighting;
  },

  async markSightingReviewed(caseId, sightingId) {
    const sightings = loadSightings();
    const index = sightings.findIndex((s) => s.id === sightingId && s.caseId === caseId);
    if (index === -1) return;
    sightings[index] = { ...sightings[index], status: 'reviewed' };
    saveSightings(sightings);
  },
};
