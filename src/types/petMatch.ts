export type HomeType = 'apartment' | 'house';
export type YesNo = 'yes' | 'no';
export type ExperienceLevel = 'first_time' | 'some_experience' | 'experienced';
export type BudgetTier = 'low' | 'medium' | 'high';
export type FreeTimeLevel = 'low' | 'medium' | 'high';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type NoiseTolerance = 'low' | 'medium' | 'high';
export type TravelFrequency = 'rarely' | 'sometimes' | 'often';
export type PreferredPetSize = 'small' | 'medium' | 'large' | 'any';
export type Species = 'dog' | 'cat' | 'rabbit';
export type CareDifficulty = 'Low' | 'Moderate' | 'High';

export type PetMatchAnswers = {
  homeType: HomeType;
  children: YesNo;
  existingPets: YesNo;
  experienceLevel: ExperienceLevel;
  budget: BudgetTier;
  freeTime: FreeTimeLevel;
  activityLevel: ActivityLevel;
  noiseTolerance: NoiseTolerance;
  travelFrequency: TravelFrequency;
  preferredPetSize: PreferredPetSize;
};

export type BreedRecommendation = {
  breed: string;
  species: Species;
  matchScore: number;
  reasons: string[];
  careDifficulty: CareDifficulty;
  estimatedMonthlyCost: {
    min: number;
    max: number;
  };
};

export type PetMatchResult = {
  compatibilityScore: number;
  recommendedSpecies: Species;
  recommendedBreeds: BreedRecommendation[];
  careDifficulty: CareDifficulty;
  estimatedMonthlyCost: {
    min: number;
    max: number;
  };
  fitSummary: string[];
};

export type PetMatchQuestionOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

export type PetMatchQuestion<T extends keyof PetMatchAnswers> = {
  key: T;
  prompt: string;
  options: PetMatchQuestionOption<PetMatchAnswers[T]>[];
};
