import type { IPetService, PetRecord } from './petTypes';

const STORAGE_KEY = 'petclues_pets';

type PetStore = Record<string, PetRecord[]>;

function loadStore(): PetStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: PetStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getOwnerPets(store: PetStore, ownerId: string): PetRecord[] {
  return store[ownerId] ?? [];
}

export const mockPetService: IPetService = {
  async createPet(ownerId, input) {
    const store = loadStore();
    const now = new Date().toISOString();
    const pet: PetRecord = {
      id: crypto.randomUUID(),
      ownerId,
      name: input.name,
      species: input.species,
      breed: input.breed ?? null,
      birthDate: input.birthDate ?? null,
      weight: input.weight ?? null,
      gender: input.gender ?? null,
      photoUrl: input.photoUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };
    store[ownerId] = [...getOwnerPets(store, ownerId), pet];
    saveStore(store);
    return pet;
  },

  async getPets(ownerId) {
    return getOwnerPets(loadStore(), ownerId);
  },

  async getPetById(ownerId, petId) {
    return getOwnerPets(loadStore(), ownerId).find((p) => p.id === petId) ?? null;
  },

  async updatePet(ownerId, petId, input) {
    const store = loadStore();
    const pets = getOwnerPets(store, ownerId);
    const idx = pets.findIndex((p) => p.id === petId);
    if (idx < 0) throw new Error('Pet not found');

    const updated: PetRecord = {
      ...pets[idx],
      ...input,
      breed: input.breed !== undefined ? input.breed : pets[idx].breed,
      birthDate: input.birthDate !== undefined ? input.birthDate : pets[idx].birthDate,
      weight: input.weight !== undefined ? input.weight : pets[idx].weight,
      gender: input.gender !== undefined ? input.gender : pets[idx].gender,
      photoUrl: input.photoUrl !== undefined ? input.photoUrl : pets[idx].photoUrl,
      updatedAt: new Date().toISOString(),
    };

    pets[idx] = updated;
    store[ownerId] = pets;
    saveStore(store);
    return updated;
  },

  async deletePet(ownerId, petId) {
    const store = loadStore();
    store[ownerId] = getOwnerPets(store, ownerId).filter((p) => p.id !== petId);
    saveStore(store);
  },
};
