import { isSupabaseConfigured } from '@/services/supabase/config';
import type { PublicPetStory } from './petStoryShareTypes';
import { mapPetStoryShareRow, type PetStoryShareRow } from './petStoryShareTypes';
import { generatePublicToken } from './petStoryShareTypes';
import type { IPetStoryShareService } from './supabasePetStoryShareService';
import { supabasePetStoryShareService } from './supabasePetStoryShareService';

const STORAGE_KEY = 'petclues_pet_story_shares';

function loadRows(): PetStoryShareRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PetStoryShareRow[]) : [];
  } catch {
    return [];
  }
}

function saveRows(rows: PetStoryShareRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export const mockPetStoryShareService: IPetStoryShareService = {
  async getForPet(petId) {
    const row = loadRows().find((entry) => entry.pet_id === petId && !entry.revoked_at);
    return row ? mapPetStoryShareRow(row) : null;
  },

  async ensureForPet(petId, snapshot, sharedWithFullHistory) {
    const rows = loadRows();
    const index = rows.findIndex((entry) => entry.pet_id === petId);
    const now = new Date().toISOString();

    if (index >= 0) {
      rows[index] = {
        ...rows[index]!,
        story_snapshot_json: snapshot,
        shared_with_full_history: sharedWithFullHistory,
        revoked_at: null,
        updated_at: now,
      };
      saveRows(rows);
      return mapPetStoryShareRow(rows[index]!);
    }

    const created: PetStoryShareRow = {
      id: crypto.randomUUID(),
      pet_id: petId,
      public_token: generatePublicToken(),
      story_snapshot_json: snapshot,
      shared_with_full_history: sharedWithFullHistory,
      updated_at: now,
      revoked_at: null,
    };
    rows.push(created);
    saveRows(rows);
    return mapPetStoryShareRow(created);
  },

  async updateSnapshot(petId, snapshot, sharedWithFullHistory) {
    return mockPetStoryShareService.ensureForPet(petId, snapshot, sharedWithFullHistory);
  },

  async regenerateToken(petId) {
    const rows = loadRows();
    const index = rows.findIndex((entry) => entry.pet_id === petId);
    if (index < 0) throw new Error('No story share found for this pet.');
    rows[index] = {
      ...rows[index]!,
      public_token: generatePublicToken(),
      revoked_at: null,
      updated_at: new Date().toISOString(),
    };
    saveRows(rows);
    return mapPetStoryShareRow(rows[index]!);
  },

  async revoke(petId) {
    const rows = loadRows();
    const index = rows.findIndex((entry) => entry.pet_id === petId);
    if (index < 0) return;
    rows[index] = { ...rows[index]!, revoked_at: new Date().toISOString() };
    saveRows(rows);
  },

  async getPublicByToken(token) {
    const row = loadRows().find(
      (entry) => entry.public_token === token.trim() && !entry.revoked_at,
    );
    if (!row) return null;

    return {
      petName: 'Preview pet',
      species: 'dog',
      breed: '',
      photoUrl: null,
      updatedAt: row.updated_at,
      sharedWithFullHistory: row.shared_with_full_history,
      snapshot: row.story_snapshot_json,
    } satisfies PublicPetStory;
  },
};

export function getPetStoryShareService(): IPetStoryShareService {
  return isSupabaseConfigured() ? supabasePetStoryShareService : mockPetStoryShareService;
}

export type { IPetStoryShareService };
