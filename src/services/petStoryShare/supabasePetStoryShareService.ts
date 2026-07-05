import { getSupabaseClient } from '@/services/supabase/client';
import type {
  PetStoryShareRecord,
  PetStoryShareRow,
  PetStorySnapshot,
  PublicPetStory,
} from './petStoryShareTypes';
import {
  generatePublicToken,
  mapPetStoryShareRow,
  normalizeStorySnapshot,
} from './petStoryShareTypes';

const SELECT =
  'id, pet_id, public_token, story_snapshot_json, shared_with_full_history, updated_at, revoked_at';

export interface IPetStoryShareService {
  getForPet(petId: string): Promise<PetStoryShareRecord | null>;
  ensureForPet(
    petId: string,
    snapshot: PetStorySnapshot,
    sharedWithFullHistory: boolean,
  ): Promise<PetStoryShareRecord>;
  updateSnapshot(
    petId: string,
    snapshot: PetStorySnapshot,
    sharedWithFullHistory: boolean,
  ): Promise<PetStoryShareRecord>;
  regenerateToken(petId: string): Promise<PetStoryShareRecord>;
  revoke(petId: string): Promise<void>;
  getPublicByToken(token: string): Promise<PublicPetStory | null>;
}

export const supabasePetStoryShareService: IPetStoryShareService = {
  async getForPet(petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pet_story_shares')
      .select(SELECT)
      .eq('pet_id', petId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapPetStoryShareRow(data as PetStoryShareRow);
  },

  async ensureForPet(petId, snapshot, sharedWithFullHistory) {
    const existing = await supabasePetStoryShareService.getForPet(petId);
    if (existing && !existing.revokedAt) {
      return supabasePetStoryShareService.updateSnapshot(petId, snapshot, sharedWithFullHistory);
    }

    const supabase = getSupabaseClient();
    const payload = {
      pet_id: petId,
      public_token: generatePublicToken(),
      story_snapshot_json: snapshot,
      shared_with_full_history: sharedWithFullHistory,
      revoked_at: null,
    };

    const { data, error } = await supabase
      .from('pet_story_shares')
      .upsert(payload, { onConflict: 'pet_id' })
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapPetStoryShareRow(data as PetStoryShareRow);
  },

  async updateSnapshot(petId, snapshot, sharedWithFullHistory) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pet_story_shares')
      .update({
        story_snapshot_json: snapshot,
        shared_with_full_history: sharedWithFullHistory,
        revoked_at: null,
      })
      .eq('pet_id', petId)
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapPetStoryShareRow(data as PetStoryShareRow);
  },

  async regenerateToken(petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pet_story_shares')
      .update({
        public_token: generatePublicToken(),
        revoked_at: null,
      })
      .eq('pet_id', petId)
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapPetStoryShareRow(data as PetStoryShareRow);
  },

  async revoke(petId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('pet_story_shares')
      .update({ revoked_at: new Date().toISOString() })
      .eq('pet_id', petId);

    if (error) throw new Error(error.message);
  },

  async getPublicByToken(token) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_pet_story_public', {
      p_token: token,
    });

    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') return null;

    const payload = data as {
      petName?: string;
      species?: string;
      breed?: string;
      photoUrl?: string | null;
      updatedAt?: string;
      sharedWithFullHistory?: boolean;
      snapshot?: Partial<PetStorySnapshot>;
    };

    return {
      petName: payload.petName ?? 'Pet',
      species: payload.species ?? '',
      breed: payload.breed ?? '',
      photoUrl: payload.photoUrl ?? null,
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
      sharedWithFullHistory: Boolean(payload.sharedWithFullHistory),
      snapshot: normalizeStorySnapshot(payload.snapshot),
    };
  },
};
