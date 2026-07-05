import type { CreatePetMomentInput, IPetMomentService, PetMoment, PetMomentRow } from './petMomentTypes';
import { mapPetMomentRow } from './petMomentTypes';

const STORAGE_KEY = 'petclues_pet_moments';

function loadRows(): PetMomentRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PetMomentRow[]) : [];
  } catch {
    return [];
  }
}

function saveRows(rows: PetMomentRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export const mockPetMomentService: IPetMomentService = {
  async getMomentsByPet(_ownerId, petId) {
    return loadRows()
      .filter((row) => row.pet_id === petId)
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
      .map(mapPetMomentRow);
  },

  async createMoment(ownerId, input: CreatePetMomentInput): Promise<PetMoment> {
    const rows = loadRows();
    const created: PetMomentRow = {
      id: crypto.randomUUID(),
      pet_id: input.petId,
      household_id: 'mock-household',
      created_by: ownerId,
      caption: input.caption.trim(),
      photo_url: input.photoUrl?.trim() || null,
      occurred_at: input.occurredAt,
      type: input.type ?? 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    rows.push(created);
    saveRows(rows);
    return mapPetMomentRow(created);
  },
};
