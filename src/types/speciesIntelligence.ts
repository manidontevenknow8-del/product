/** Structured care knowledge fields (Phase 4) */

export type LifespanGuidance = {
  minYears: number;
  maxYears: number;
  unit?: 'years';
  notes?: string | null;
};

export type DietGuidance = {
  summary: string;
  feedingFrequency?: string | null;
  portions?: string | null;
  restrictions?: string[] | null;
  notes?: string | null;
};

export type ExerciseLevel = 'low' | 'moderate' | 'high';

export type ExerciseGuidance = {
  level: ExerciseLevel;
  minutesPerDay?: number | null;
  activities?: string[] | null;
  notes?: string | null;
};

export type ConditionPrevalence = 'common' | 'occasional' | 'rare';

export type CommonCondition = {
  name: string;
  description: string;
  prevalence?: ConditionPrevalence | null;
};

export type VaccinationGuidance = {
  core: string[];
  optional?: string[] | null;
  scheduleNotes?: string | null;
  boosterNotes?: string | null;
};

export type SeasonName = 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';

export type SeasonalConsideration = {
  season: SeasonName;
  title: string;
  considerations: string[];
};

export type Species = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BreedSizeCategory = 'small' | 'medium' | 'large' | 'giant' | 'variable';

export type Breed = {
  id: string;
  speciesId: string;
  slug: string;
  name: string;
  description: string | null;
  sizeCategory: BreedSizeCategory | null;
  createdAt: string;
  updatedAt: string;
};

export type CareGuidelineStatus = 'draft' | 'published';

export type CareGuideline = {
  id: string;
  speciesId: string;
  breedId: string | null;
  lifespan: LifespanGuidance;
  diet: DietGuidance;
  exerciseNeeds: ExerciseGuidance;
  commonConditions: CommonCondition[];
  vaccinationGuidance: VaccinationGuidance;
  seasonalConsiderations: SeasonalConsideration[];
  source: string | null;
  version: number;
  status: CareGuidelineStatus;
  createdAt: string;
  updatedAt: string;
};

/** AI-ready bundled retrieval result */
export type SpeciesKnowledgeContext = {
  species: Species;
  breed: Breed | null;
  care: CareGuideline;
  scope: 'breed' | 'species';
  retrievedAt: string;
  /** Plain-text block for LLM system/context injection */
  contextText: string;
};

export type SpeciesKnowledgeSearchResult = {
  species: Species;
  breed: Breed | null;
  care: CareGuideline;
  matchedTerms: string[];
  score: number;
};

export type KnowledgeRetrievalQuery = {
  speciesSlug: string;
  breedSlug?: string;
};

export type KnowledgeSearchQuery = {
  query: string;
  speciesSlug?: string;
  limit?: number;
};
