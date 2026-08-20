/** Breed record shape for content-data/breeds.json */

export type Species = 'dog' | 'cat';

export type SizeCategory = 'toy' | 'small' | 'medium' | 'large' | 'giant' | 'n/a';

export type VaccineScheduleEntry = {
  vaccine: string;
  /** Typical first or series age in weeks (AAHA/AAFP style windows). */
  age_weeks: number;
};

export type BreedRecord = {
  slug: string;
  name: string;
  species: Species;
  size_category: SizeCategory;
  avg_weight_range: string;
  avg_lifespan: string;
  /** 3-5 documented predispositions. Prefer breed-club / textbook sources. */
  common_health_issues: string[];
  core_vaccines_schedule: VaccineScheduleEntry[];
  grooming_needs: string;
  temperament_summary: string;
  /**
   * Set when any field on this record is approximate or needs clinical sign-off.
   * Do not invent health issues or vaccine ages; flag instead.
   */
  NEEDS_VET_REVIEW?: true;
  /** Optional provenance notes for editors (not for page copy). */
  source_notes?: string;
};
