/** Symptom record shape for content-data/symptoms.json */

import type { Species } from './breed';

export type UrgencyLevel = 'emergency' | 'urgent' | 'monitor';

export type SymptomRecord = {
  slug: string;
  name: string;
  /** Primary species this symptom page targets; use both via separate records if needed. */
  species: Species | 'both';
  urgency_level: UrgencyLevel;
  common_causes: string[];
  when_to_see_vet_immediately: string[];
  /** Breed slugs from breeds.json that are predisposed where documented. */
  related_breed_predispositions: string[];
  /** Matching emergencies.json slug when urgency is emergency (cross-pillar). */
  related_emergency_slug?: string;
  NEEDS_VET_REVIEW?: true;
  source_notes?: string;
};

/** Generated symptom guide page payload (content-data/generated/symptoms/batch-*.json). */
export type SymptomPageSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  breedLinks?: string[];
  emergencySlug?: string;
};

export type SymptomGuidePageRecord = {
  id: string;
  kind: 'single' | 'combination';
  species: Species;
  pageSlug: string;
  path: string;
  symptomSlug: string;
  symptomSlugs: string[];
  angle: string;
  combination?: { a: string; b: string };
  h1: string;
  primaryKeyword: string;
  metaDescription: string;
  urgency_level: UrgencyLevel;
  lead: string;
  disclaimer: string;
  productTieIn: string;
  sections: SymptomPageSection[];
  faqs: { question: string; answer: string }[];
  related_breed_predispositions: string[];
  related_emergency_slug: string | null;
};
