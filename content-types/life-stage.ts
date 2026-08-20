/** Life-stage care checklist shape for content-data/life_stages.json */

import type { Species } from './breed';

export type LifeStageId = 'puppy' | 'kitten' | 'adult' | 'senior';

export type LifeStageRecord = {
  slug: string;
  name: string;
  species: Species;
  stage: LifeStageId;
  /** Typical age band for this stage (editorial; not a diagnosis cutoff). */
  typical_age_range: string;
  care_checklist: string[];
  NEEDS_VET_REVIEW?: true;
  source_notes?: string;
};
