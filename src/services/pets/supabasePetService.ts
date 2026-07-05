import { getSupabaseClient } from '@/services/supabase/client';
import { INPUT_LIMITS, trimField, validateRequiredText } from '@/utils/inputValidation';
import { normalizePhotoUrlFromDb } from './petPhotoService';
import type { CreatePetInput, IPetService, PetSpecies, UpdatePetInput } from './petTypes';
import { mapPetRow, petInputToRow, petUpdateToRow } from './petUtils';

function sanitizeStoredPhotoUrl(
  url: string | null | undefined,
): string | null | undefined {
  if (url === undefined) return undefined;
  const normalized = normalizePhotoUrlFromDb(url);
  if (!normalized) return null;
  return trimField(normalized, 2048) || null;
}

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
    diet: input.diet ? trimField(input.diet, 200) : input.diet,
    coatColor: input.coatColor ? trimField(input.coatColor, 80) : input.coatColor,
    microchipId: input.microchipId ? trimField(input.microchipId, 32) : input.microchipId,
    conditionsNotes: input.conditionsNotes
      ? trimField(input.conditionsNotes, INPUT_LIMITS.notes)
      : input.conditionsNotes,
    photoUrl: sanitizeStoredPhotoUrl(input.photoUrl) ?? null,
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
  if (input.diet != null) next.diet = trimField(input.diet, 200);
  if (input.coatColor != null) next.coatColor = trimField(input.coatColor, 80);
  if (input.microchipId != null) next.microchipId = trimField(input.microchipId, 32);
  if (input.conditionsNotes != null) {
    next.conditionsNotes = trimField(input.conditionsNotes, INPUT_LIMITS.notes);
  }
  if (input.photoUrl !== undefined) next.photoUrl = sanitizeStoredPhotoUrl(input.photoUrl) ?? null;
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
