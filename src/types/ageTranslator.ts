export type LifeStage = 'puppy' | 'young_adult' | 'adult' | 'mature' | 'senior';

export type PetSpecies = 'dog' | 'cat' | 'other';

export type PetAgeProfile = {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  ageYears: number;
  ageMonths: number;
  avatarInitials: string;
  dateOfBirth?: string;
};

export type AgeTranslation = {
  petAge: {
    years: number;
    months: number;
    label: string;
  };
  humanEquivalent: number;
  humanEquivalentLabel: string;
  lifeStage: LifeStage;
  lifeStageLabel: string;
  lifeStageTagline: string;
  shareMessage: string;
  storyHeadline: string;
};

export type LifeStageInsight = {
  stage: LifeStage;
  title: string;
  meaning: string;
  carePriorities: string[];
  watchFor: string[];
  checkups: string[];
};

export type BreedInsight = {
  id: string;
  category: 'joints' | 'weight' | 'dental' | 'activity' | 'coat' | 'general';
  title: string;
  description: string;
  tip: string;
};

export type HealthFocus = {
  title: string;
  description: string;
  priority: 'primary' | 'secondary';
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  eta: string;
  type: 'birthday' | 'life_stage' | 'vaccine' | 'preventative';
};

export type ShareFormat = 'instagram' | 'whatsapp' | 'general';
