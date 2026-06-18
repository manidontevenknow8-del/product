export type ComparisonRating = 'yes' | 'partial' | 'no';

export type ComparisonFeatureId =
  | 'health_records'
  | 'vaccination_reminders'
  | 'medication_reminders'
  | 'vet_bill_storage'
  | 'emergency_passport'
  | 'multi_pet'
  | 'ai_vet_decoder'
  | 'mobile_access'
  | 'sitter_vet_sharing'
  | 'pet_specific_workflows';

export type ComparisonFeature = {
  id: ComparisonFeatureId;
  label: string;
  petcluesDescription: string;
};

export type ComparisonFaq = {
  question: string;
  answer: string;
};

export type ComparisonPage = {
  slug: string;
  competitorName: string;
  competitorShortName: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  updatedAt: string;
  problem: {
    headline: string;
    paragraphs: string[];
  };
  comparisonIntro: string;
  featureRatings: Record<ComparisonFeatureId, ComparisonRating>;
  competitorPros: string[];
  competitorCons: string[];
  petcluesPros: string[];
  petcluesCons: string[];
  bestForCompetitor: string;
  bestForPetClues: string;
  whyPetCluesExists: {
    headline: string;
    paragraphs: string[];
  };
  faqs: ComparisonFaq[];
  relatedSlugs: string[];
  relatedBlogSlugs: string[];
};

export type ComparisonListItem = Pick<
  ComparisonPage,
  'slug' | 'competitorName' | 'title' | 'metaDescription' | 'updatedAt'
>;
