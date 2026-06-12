import type { AgeTranslation, HealthFocus, Milestone, PetAgeProfile } from '@/types/ageTranslator';
import type { BreedInsight, LifeStageInsight } from '@/types/ageTranslator';
import {
  buildAgeTranslation,
  getBreedInsights,
  getHealthFocus,
  getLifeStageInsight,
} from '@/utils/ageTranslatorUtils';
import { getMilestonesForPet } from '@/data/ageTranslatorData';
import { mockPetProfile } from '@/data/profileData';
import { parseAgeString } from '@/utils/ageTranslatorUtils';

/**
 * Age translator service - swap for AI/breed intelligence API in production.
 *
 * Future integrations:
 * - Breed-specific longevity databases
 * - Personalized recommendations from health records
 * - AI-generated personality and life-stage narratives
 * - Monthly update notifications
 */
export interface IAgeTranslatorService {
  getAvailablePets(userId: string): Promise<PetAgeProfile[]>;
  translate(pet: PetAgeProfile): Promise<AgeTranslation>;
  getLifeStageInsight(pet: PetAgeProfile): Promise<LifeStageInsight>;
  getBreedInsights(pet: PetAgeProfile): Promise<BreedInsight[]>;
  getHealthFocus(pet: PetAgeProfile): Promise<HealthFocus[]>;
  getMilestones(pet: PetAgeProfile): Promise<Milestone[]>;
}

function profileToAgeProfile(): PetAgeProfile {
  const { years, months } = parseAgeString(mockPetProfile.age);
  return {
    id: mockPetProfile.id,
    name: mockPetProfile.name,
    species: mockPetProfile.species as PetAgeProfile['species'],
    breed: mockPetProfile.breed,
    ageYears: years,
    ageMonths: months,
    avatarInitials: mockPetProfile.avatarInitials,
    dateOfBirth: mockPetProfile.dateOfBirth,
  };
}

export const mockAgeTranslatorService: IAgeTranslatorService = {
  async getAvailablePets(_userId) {
    return [profileToAgeProfile()];
  },

  async translate(pet) {
    return buildAgeTranslation(pet);
  },

  async getLifeStageInsight(pet) {
    const translation = buildAgeTranslation(pet);
    return getLifeStageInsight(translation.lifeStage);
  },

  async getBreedInsights(pet) {
    return getBreedInsights(pet.breed, pet.species);
  },

  async getHealthFocus(pet) {
    const translation = buildAgeTranslation(pet);
    return getHealthFocus(translation.lifeStage, pet.breed);
  },

  async getMilestones(pet) {
    const translation = buildAgeTranslation(pet);
    return getMilestonesForPet(pet.name, pet.ageYears, translation.lifeStageLabel);
  },
};
