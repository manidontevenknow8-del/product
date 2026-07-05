import { getSupabaseClient } from '@/services/supabase/client';
import type { CreatePetMomentInput, IPetMomentService, PetMomentRow } from './petMomentTypes';
import { mapPetMomentRow } from './petMomentTypes';
import { resolvePetMomentPhotoUrl } from './petMomentPhotoService';

const SELECT =
  'id, pet_id, household_id, created_by, caption, photo_url, occurred_at, type, created_at, updated_at';

export const supabasePetMomentService: IPetMomentService = {
  async getMomentsByPet(_ownerId, petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pet_moments')
      .select(SELECT)
      .eq('pet_id', petId)
      .order('occurred_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as PetMomentRow[]).map(mapPetMomentRow);
  },

  async createMoment(ownerId, input: CreatePetMomentInput) {
    const supabase = getSupabaseClient();
    const momentId = crypto.randomUUID();
    const photoUrl = await resolvePetMomentPhotoUrl(ownerId, input.petId, momentId, input.photoUrl);

    const payload = {
      id: momentId,
      pet_id: input.petId,
      caption: input.caption.trim(),
      photo_url: photoUrl,
      occurred_at: input.occurredAt,
      type: input.type ?? 'manual',
      created_by: ownerId,
    };

    const { data, error } = await supabase
      .from('pet_moments')
      .insert(payload)
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapPetMomentRow(data as PetMomentRow);
  },
};
