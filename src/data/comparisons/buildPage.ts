import type {
  ComparisonFaq,
  ComparisonPage,
  ComparisonRating,
  ComparisonFeatureId,
} from '@/types/comparison';
import { COMPARISON_FEATURE_IDS } from './features';

export type CompetitorCategory =
  | 'spreadsheet'
  | 'cloud-storage'
  | 'notes'
  | 'manual'
  | 'calendar'
  | 'messaging'
  | 'pet-app'
  | 'vet-tech'
  | 'insurance'
  | 'hub';

export type CompetitorConfig = {
  slug: string;
  competitorName: string;
  competitorShortName: string;
  category: CompetitorCategory;
  keywords: string[];
  problemHeadline: string;
  problemParagraphs: string[];
  comparisonIntro: string;
  ratingOverrides?: Partial<Record<ComparisonFeatureId, ComparisonRating>>;
  competitorPros: string[];
  competitorCons: string[];
  petcluesPros?: string[];
  petcluesCons?: string[];
  bestForCompetitor: string;
  bestForPetClues?: string;
  whyHeadline?: string;
  whyParagraphs?: string[];
  faqs: ComparisonFaq[];
  relatedSlugs: string[];
  relatedBlogSlugs: string[];
};

const DEFAULT_PETCLUES_PROS = [
  'Purpose-built for pet vaccinations, medications, and vet visits, not generic folders.',
  'Emergency passport and reminders stay linked to each pet profile.',
  'Free tier covers one pet with records, reminders, and passport basics.',
  'AI vet bill decoder on paid plans saves time after every clinic visit.',
];

const DEFAULT_PETCLUES_CONS = [
  'Requires creating an account and moving records out of your old system once.',
  'Advanced AI decoding and multi-pet features need a paid plan.',
];

const CATEGORY_RATINGS: Record<CompetitorCategory, Record<ComparisonFeatureId, ComparisonRating>> = {
  spreadsheet: {
    health_records: 'partial',
    vaccination_reminders: 'no',
    medication_reminders: 'no',
    vet_bill_storage: 'partial',
    emergency_passport: 'no',
    multi_pet: 'partial',
    ai_vet_decoder: 'no',
    mobile_access: 'partial',
    sitter_vet_sharing: 'partial',
    pet_specific_workflows: 'no',
  },
  'cloud-storage': {
    health_records: 'partial',
    vaccination_reminders: 'no',
    medication_reminders: 'no',
    vet_bill_storage: 'yes',
    emergency_passport: 'no',
    multi_pet: 'partial',
    ai_vet_decoder: 'no',
    mobile_access: 'yes',
    sitter_vet_sharing: 'partial',
    pet_specific_workflows: 'no',
  },
  notes: {
    health_records: 'partial',
    vaccination_reminders: 'no',
    medication_reminders: 'no',
    vet_bill_storage: 'partial',
    emergency_passport: 'no',
    multi_pet: 'partial',
    ai_vet_decoder: 'no',
    mobile_access: 'yes',
    sitter_vet_sharing: 'no',
    pet_specific_workflows: 'no',
  },
  manual: {
    health_records: 'partial',
    vaccination_reminders: 'no',
    medication_reminders: 'no',
    vet_bill_storage: 'partial',
    emergency_passport: 'partial',
    multi_pet: 'partial',
    ai_vet_decoder: 'no',
    mobile_access: 'no',
    sitter_vet_sharing: 'no',
    pet_specific_workflows: 'no',
  },
  calendar: {
    health_records: 'no',
    vaccination_reminders: 'partial',
    medication_reminders: 'partial',
    vet_bill_storage: 'no',
    emergency_passport: 'no',
    multi_pet: 'partial',
    ai_vet_decoder: 'no',
    mobile_access: 'yes',
    sitter_vet_sharing: 'no',
    pet_specific_workflows: 'no',
  },
  messaging: {
    health_records: 'no',
    vaccination_reminders: 'no',
    medication_reminders: 'no',
    vet_bill_storage: 'partial',
    emergency_passport: 'no',
    multi_pet: 'no',
    ai_vet_decoder: 'no',
    mobile_access: 'yes',
    sitter_vet_sharing: 'partial',
    pet_specific_workflows: 'no',
  },
  'pet-app': {
    health_records: 'yes',
    vaccination_reminders: 'yes',
    medication_reminders: 'partial',
    vet_bill_storage: 'partial',
    emergency_passport: 'partial',
    multi_pet: 'yes',
    ai_vet_decoder: 'no',
    mobile_access: 'yes',
    sitter_vet_sharing: 'partial',
    pet_specific_workflows: 'yes',
  },
  'vet-tech': {
    health_records: 'partial',
    vaccination_reminders: 'no',
    medication_reminders: 'no',
    vet_bill_storage: 'partial',
    emergency_passport: 'no',
    multi_pet: 'partial',
    ai_vet_decoder: 'no',
    mobile_access: 'yes',
    sitter_vet_sharing: 'partial',
    pet_specific_workflows: 'partial',
  },
  insurance: {
    health_records: 'partial',
    vaccination_reminders: 'no',
    medication_reminders: 'no',
    vet_bill_storage: 'partial',
    emergency_passport: 'no',
    multi_pet: 'partial',
    ai_vet_decoder: 'no',
    mobile_access: 'yes',
    sitter_vet_sharing: 'no',
    pet_specific_workflows: 'partial',
  },
  hub: {
    health_records: 'yes',
    vaccination_reminders: 'yes',
    medication_reminders: 'yes',
    vet_bill_storage: 'yes',
    emergency_passport: 'yes',
    multi_pet: 'yes',
    ai_vet_decoder: 'yes',
    mobile_access: 'yes',
    sitter_vet_sharing: 'yes',
    pet_specific_workflows: 'yes',
  },
};

const DEFAULT_WHY: { headline: string; paragraphs: string[] } = {
  headline: 'Why PetClues exists',
  paragraphs: [
    'Pet parents should not need a computer science degree to keep vaccines, medications, and emergency info organized. PetClues connects records, reminders, and passports in one calm app built for real clinic visits and busy households.',
    'If you have outgrown folders, spreadsheets, or apps that were never designed for pet health, PetClues gives you a structured next step without losing the simplicity you want.',
  ],
};

export function buildComparisonPage(config: CompetitorConfig): ComparisonPage {
  const title =
    config.category === 'hub'
      ? config.problemHeadline
      : `PetClues vs ${config.competitorName} for Pet Health Records`;

  const metaDescription =
    config.category === 'hub'
      ? config.problemParagraphs[0]
      : `Compare PetClues and ${config.competitorName} for pet health records, vaccination reminders, vet bills, and emergency info. See pros, cons, and which option fits your household.`;

  const featureRatings = {
    ...CATEGORY_RATINGS[config.category],
    ...config.ratingOverrides,
  } as Record<ComparisonFeatureId, ComparisonRating>;

  for (const id of COMPARISON_FEATURE_IDS) {
    if (!featureRatings[id]) featureRatings[id] = 'no';
  }

  return {
    slug: config.slug,
    competitorName: config.competitorName,
    competitorShortName: config.competitorShortName,
    title: `${title} | PetClues`,
    metaDescription,
    keywords: config.keywords,
    updatedAt: '2026-06-16',
    problem: {
      headline: config.problemHeadline,
      paragraphs: config.problemParagraphs,
    },
    comparisonIntro: config.comparisonIntro,
    featureRatings,
    competitorPros: config.competitorPros,
    competitorCons: config.competitorCons,
    petcluesPros: config.petcluesPros ?? DEFAULT_PETCLUES_PROS,
    petcluesCons: config.petcluesCons ?? DEFAULT_PETCLUES_CONS,
    bestForCompetitor: config.bestForCompetitor,
    bestForPetClues:
      config.bestForPetClues ??
      'Pet parents who want vaccination reminders, medication alerts, vet bill organization, and an emergency passport in one pet-specific app.',
    whyPetCluesExists: {
      headline: config.whyHeadline ?? DEFAULT_WHY.headline,
      paragraphs: config.whyParagraphs ?? DEFAULT_WHY.paragraphs,
    },
    faqs: config.faqs,
    relatedSlugs: config.relatedSlugs,
    relatedBlogSlugs: config.relatedBlogSlugs,
  };
}
