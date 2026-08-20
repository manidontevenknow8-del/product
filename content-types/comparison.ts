/** Competitor comparison shape for content-data/comparisons.json */

export type ComparisonFeature = {
  /** Short feature label used in comparison tables. */
  feature: string;
  /** Verified presence/absence or short fact. Do not invent. */
  value: string;
  /** Where this was confirmed (URL or product surface). */
  source: string;
};

export type ComparisonRecord = {
  slug: string;
  name: string;
  /** Competitor product category for framing vs PetClues. */
  category: 'pet-records-app' | 'clinic-connected-app' | 'insurance-marketplace' | 'non-app-baseline';
  website?: string;
  /** Verified differentiators only. */
  features: ComparisonFeature[];
  /**
   * Optional disambiguation when brand names collide across App Store listings.
   */
  identity_note?: string;
  NEEDS_VET_REVIEW?: true;
  source_notes?: string;
};
