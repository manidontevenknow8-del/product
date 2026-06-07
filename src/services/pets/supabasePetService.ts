import { getSupabaseClient } from '@/services/supabase/client';
import { INPUT_LIMITS, trimField, validateRequiredText } from '@/utils/inputValidation';
import type { CreatePetInput, IPetService, PetSpecies, UpdatePetInput } from './petTypes';
import { mapPetRow, petInputToRow, petUpdateToRow } from './petUtils';

const SPECIES: PetSpecies[] = ['dog', 'cat', 'other'];

function sanitizePetInput(input: CreatePetInput): CreatePetInput {
  const nameError = validateRequiredText(input.name, 'Pet name', INPUT_LIMITS.name);
  if (nameError) throw new Error(nameError);
  if (!SPECIES.includes(input.species)) throw new Error('Invalid species.');

  return {
    ...input,
    name: trimField(input.name, INPUT_LIMITS.name),
    breed: input.breed ? trimField(input.breed, INPUT_LIMITS.breed) : input.breed,
    weight: input.weight ? trimField(input.weight, 40) : input.weight,
    photoUrl: input.photoUrl ? trimField(input.photoUrl, 2048) : input.photoUrl,
  };
}

function sanitizePetUpdate(input: UpdatePetInput): UpdatePetInput {
  const next: UpdatePetInput = { ...input };
  if (input.name != null) {
    const nameError = validateRequiredText(input.name, 'Pet name', INPUT_LIMITS.name);
    if (nameError) throw new Error(nameError);
    next.name = trimField(input.name, INPUT_LIMITS.name);
  }
  if (input.species != null && !SPECIES.includes(input.species)) {
    throw new Error('Invalid species.');
  }
  if (input.breed != null) next.breed = trimField(input.breed, INPUT_LIMITS.breed);
  if (input.weight != null) next.weight = trimField(input.weight, 40);
  if (input.photoUrl != null) next.photoUrl = trimField(input.photoUrl, 2048);
  return next;
}

export const supabasePetService: IPetService = {
  async createPet(ownerId, input) {
    const safe = sanitizePetInput(input);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pets')
      .insert(petInputToRow(safe, ownerId))
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapPetRow(data);
  },

  async getPets(ownerId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPetRow);
  },

  async getPetById(ownerId, petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('id', petId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapPetRow(data) : null;
  },

  async updatePet(ownerId, petId, input) {
    const safe = sanitizePetUpdate(input);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pets')
      .update(petUpdateToRow(safe))
      .eq('owner_id', ownerId)
      .eq('id', petId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapPetRow(data);
  },

  async deletePet(ownerId, petId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('owner_id', ownerId)
      .eq('id', petId);

    if (error) throw new Error(error.message);
  },
};
