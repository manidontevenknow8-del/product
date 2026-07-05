export type PetMomentType = 'manual';

export type PetMoment = {
  id: string;
  petId: string;
  householdId: string;
  createdBy: string | null;
  caption: string;
  photoUrl: string | null;
  occurredAt: string;
  type: PetMomentType;
  createdAt: string;
  updatedAt: string;
};

export type CreatePetMomentInput = {
  petId: string;
  caption: string;
  photoUrl?: string | null;
  occurredAt: string;
  type?: PetMomentType;
};

export type PetMomentRow = {
  id: string;
  pet_id: string;
  household_id: string;
  created_by: string | null;
  caption: string;
  photo_url: string | null;
  occurred_at: string;
  type: string;
  created_at: string;
  updated_at: string;
};

export interface IPetMomentService {
  getMomentsByPet(ownerId: string, petId: string): Promise<PetMoment[]>;
  createMoment(ownerId: string, input: CreatePetMomentInput): Promise<PetMoment>;
}

export function mapPetMomentRow(row: PetMomentRow): PetMoment {
  return {
    id: row.id,
    petId: row.pet_id,
    householdId: row.household_id,
    createdBy: row.created_by,
    caption: row.caption,
    photoUrl: row.photo_url,
    occurredAt: row.occurred_at,
    type: row.type as PetMomentType,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
