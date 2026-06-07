export type PetSpecies = 'dog' | 'cat' | 'other';

export type PetGender = 'male' | 'female' | 'unknown';

export type PetRecord = {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  birthDate: string | null;
  weight: string | null;
  gender: PetGender | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePetInput = {
  name: string;
  species: PetSpecies;
  breed?: string | null;
  birthDate?: string | null;
  weight?: string | null;
  gender?: PetGender | null;
  photoUrl?: string | null;
};

export type UpdatePetInput = Partial<CreatePetInput>;

export type EditPetForm = {
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  weight: string;
  gender: PetGender | '';
  photo: string | null;
};

export interface IPetService {
  createPet(ownerId: string, input: CreatePetInput): Promise<PetRecord>;
  getPets(ownerId: string): Promise<PetRecord[]>;
  getPetById(ownerId: string, petId: string): Promise<PetRecord | null>;
  updatePet(ownerId: string, petId: string, input: UpdatePetInput): Promise<PetRecord>;
  deletePet(ownerId: string, petId: string): Promise<void>;
}
