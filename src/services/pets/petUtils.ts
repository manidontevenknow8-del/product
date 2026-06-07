import type { OnboardingPetData } from '@/types/onboarding';
import type { Pet } from '@/types';
import type { PetProfile } from '@/types/profile';
import type { PassportMeta } from '@/types/passport';
import type { PetAgeProfile } from '@/types/ageTranslator';
import { parseAgeString } from '@/utils/ageTranslatorUtils';
import type { EditPetForm, UpdatePetInput, PetRecord, PetSpecies, CreatePetInput } from './petTypes';

export function getAvatarInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/** Approximate birth date from free-text age (e.g. "4 years", "6 months"). */
export function parseAgeToBirthDate(age: string): string | null {
  const normalized = age.trim().toLowerCase();
  if (!normalized) return null;

  const now = new Date();
  let years = 0;
  let months = 0;

  const yearMatch = normalized.match(/(\d+)\s*(?:year|yr|y)/);
  const monthMatch = normalized.match(/(\d+)\s*(?:month|mo|m)/);

  if (yearMatch) years = Number.parseInt(yearMatch[1], 10);
  if (monthMatch) months = Number.parseInt(monthMatch[1], 10);

  if (!yearMatch && !monthMatch) {
    const numeric = normalized.match(/^(\d+)$/);
    if (numeric) years = Number.parseInt(numeric[1], 10);
  }

  if (years === 0 && months === 0) return null;

  const birth = new Date(now);
  birth.setFullYear(birth.getFullYear() - years);
  birth.setMonth(birth.getMonth() - months);
  return birth.toISOString().slice(0, 10);
}

export function formatPetAge(birthDate: string | null): string {
  if (!birthDate) return 'Age not set';

  const birth = new Date(`${birthDate}T00:00:00`);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) return 'Less than 1 month';
  if (years <= 0) return `${months} month${months === 1 ? '' : 's'}`;
  if (months === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'}, ${months} mo`;
}

export function petRecordToAgeProfile(record: PetRecord): PetAgeProfile {
  const ageLabel = formatPetAge(record.birthDate);
  const { years, months } = parseAgeString(ageLabel);
  return {
    id: record.id,
    name: record.name,
    species: record.species,
    breed: record.breed ?? 'Mixed breed',
    ageYears: years,
    ageMonths: months,
    avatarInitials: getAvatarInitials(record.name),
    dateOfBirth: record.birthDate ?? undefined,
  };
}

export function formatBirthDateDisplay(birthDate: string | null): string {
  if (!birthDate) return 'Not recorded';
  const date = new Date(`${birthDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatPassportUpdatedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function onboardingToCreatePetInput(data: OnboardingPetData): CreatePetInput {
  const species = data.species as PetSpecies;
  return {
    name: data.name.trim(),
    species: species || 'other',
    breed: data.breed.trim() || null,
    birthDate: parseAgeToBirthDate(data.age),
    weight: data.weight.trim() || null,
    gender: null,
    photoUrl: data.photo,
  };
}

export function petRecordToEditPetForm(record: PetRecord): EditPetForm {
  return {
    name: record.name,
    species: record.species,
    breed: record.breed ?? '',
    age: record.birthDate ? formatPetAge(record.birthDate) : '',
    weight: record.weight ?? '',
    gender: record.gender ?? '',
    photo: record.photoUrl,
  };
}

export function editPetFormToUpdateInput(form: EditPetForm): UpdatePetInput {
  const gender =
    form.gender === 'male' || form.gender === 'female' || form.gender === 'unknown'
      ? form.gender
      : null;

  return {
    name: form.name.trim(),
    species: form.species,
    breed: form.breed.trim() || null,
    birthDate: parseAgeToBirthDate(form.age),
    weight: form.weight.trim() || null,
    gender,
    photoUrl: form.photo,
  };
}

export function petRecordToPet(record: PetRecord): Pet & { photo: string | null } {
  return {
    id: record.id,
    name: record.name,
    species: record.species,
    breed: record.breed ?? '',
    age: formatPetAge(record.birthDate),
    weight: record.weight ?? 'Not recorded',
    avatarInitials: getAvatarInitials(record.name),
    photo: record.photoUrl,
  };
}

export function petRecordToPetProfile(record: PetRecord): PetProfile {
  const base = petRecordToPet(record);
  return {
    ...base,
    diet: 'Not recorded',
    vaccinationStatus: 'Not recorded',
    allergies: 'Not recorded',
    microchipId: null,
    gender: record.gender
      ? record.gender.charAt(0).toUpperCase() + record.gender.slice(1)
      : 'Not specified',
    dateOfBirth: formatBirthDateDisplay(record.birthDate),
    color: 'Not recorded',
    conditionsNotes: 'Not recorded',
    photo: record.photoUrl,
  };
}

export function petRecordToPassportMeta(record: PetRecord): PassportMeta {
  const pet = petRecordToPet(record);
  return {
    petName: pet.name,
    breed: pet.breed || 'Breed not set',
    age: pet.age,
    avatarInitials: pet.avatarInitials,
    photo: record.photoUrl,
    lastUpdated: formatPassportUpdatedAt(record.updatedAt),
    secureLink: `https://petclues.app/passport/${record.id}`,
  };
}

export function mapPetRow(row: {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight: string | null;
  gender: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}): PetRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    species: row.species as PetSpecies,
    breed: row.breed,
    birthDate: row.birth_date,
    weight: row.weight,
    gender: (row.gender as PetRecord['gender']) ?? null,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function petInputToRow(input: CreatePetInput, ownerId: string) {
  return {
    owner_id: ownerId,
    name: input.name,
    species: input.species,
    breed: input.breed ?? null,
    birth_date: input.birthDate ?? null,
    weight: input.weight ?? null,
    gender: input.gender ?? null,
    photo_url: input.photoUrl ?? null,
  };
}

export function petUpdateToRow(input: UpdatePetInput): Partial<{
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight: string | null;
  gender: string | null;
  photo_url: string | null;
}> {
  const patch: Partial<{
    name: string;
    species: string;
    breed: string | null;
    birth_date: string | null;
    weight: string | null;
    gender: string | null;
    photo_url: string | null;
  }> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.species !== undefined) patch.species = input.species;
  if (input.breed !== undefined) patch.breed = input.breed;
  if (input.birthDate !== undefined) patch.birth_date = input.birthDate;
  if (input.weight !== undefined) patch.weight = input.weight;
  if (input.gender !== undefined) patch.gender = input.gender;
  if (input.photoUrl !== undefined) patch.photo_url = input.photoUrl;
  return patch;
}
