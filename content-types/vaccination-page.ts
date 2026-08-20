/** Generated vaccination schedule page content shape */

export type VaccinationPageKind = 'breed' | 'general';

export type VaccinationPageFaq = {
  question: string;
  answer: string;
};

export type VaccinationPageBodySection = {
  heading: string;
  paragraphs: string[];
};

/** Inline schedule for general (non-breed) pages */
export type VaccinationPageScheduleEntry = {
  vaccine: string;
  age_weeks: number;
  /** Optional label override, e.g. "Adult annual" */
  age_label?: string;
};

export type VaccinationPageRecord = {
  slug: string;
  path: string;
  kind: VaccinationPageKind;
  /** Present for breed pages */
  breedSlug?: string;
  /** Display subject for H1 / meta when not a breed page */
  subjectName: string;
  species: 'dog' | 'cat' | 'both';
  primaryKeyword: string;
  metaDescription: string;
  /** Vaccine name injected into reminder CTA copy */
  reminderVaccine: string;
  /** Cross-link to BreedHealthTemplate when breed-specific */
  breedHealthHref?: string;
  breedHealthLabel?: string;
  bodySections: VaccinationPageBodySection[];
  faqs: VaccinationPageFaq[];
  /** Required for general pages; breed pages use breeds.json schedule */
  schedule?: VaccinationPageScheduleEntry[];
  size_category?: string;
  avg_weight_range?: string;
  common_health_issues?: string[];
};
