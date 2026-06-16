export type LivingSpaceAnswer = 'apartment' | 'house_yard';
export type ExperienceAnswer = 'first_time' | 'experienced';
export type ActivityAnswer = 'couch' | 'marathon';
export type BudgetAnswer = 'lean' | 'balanced' | 'generous';

export type EditorialQuizAnswers = {
  livingSpace: LivingSpaceAnswer;
  experience: ExperienceAnswer;
  activity: ActivityAnswer;
  budget: BudgetAnswer;
};

export type EditorialQuizOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  imageUrl: string;
};

export type EditorialQuizQuestion<T extends keyof EditorialQuizAnswers> = {
  key: T;
  prompt: string;
  subtitle?: string;
  heroImageUrl: string;
  options: EditorialQuizOption<EditorialQuizAnswers[T]>[];
};

export type EditorialBreedMatch = {
  id: string;
  breed: string;
  species: 'dog' | 'cat';
  imageUrl: string;
  careDifficulty: 'Low' | 'Moderate' | 'High';
  monthlyCostLabel: string;
  matchReason: string;
  matchScore: number;
};

export type EditorialMatchResult = {
  matches: EditorialBreedMatch[];
  analyzedAt: string;
};
