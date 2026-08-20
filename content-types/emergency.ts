/** Emergency scenario shape for content-data/emergencies.json */

export type EmergencyRecord = {
  slug: string;
  name: string;
  immediate_action_steps: string[];
  when_to_call_vet_vs_poison_control: string;
  NEEDS_VET_REVIEW?: true;
  source_notes?: string;
};

/** Long-tail / angle page generated under /emergency/{slug} */
export type EmergencyGuideAngle =
  | 'primary'
  | 'toxicity-dose'
  | 'symptoms-timeline'
  | 'species'
  | 'product-type'
  | 'scenario'
  | 'transport'
  | 'complications'
  | 'cooling'
  | 'triage-er'
  | 'breed-risk'
  | 'comparison';

export type EmergencyGuideSection = {
  heading: string;
  paragraphs: string[];
};

export type EmergencyGuideFaq = {
  question: string;
  answer: string;
};

export type EmergencyGuidePageRecord = {
  /** URL slug: /emergency/{slug} */
  slug: string;
  /** Parent row in emergencies.json */
  core_slug: string;
  angle: EmergencyGuideAngle;
  h1: string;
  primary_keyword: string;
  meta_description: string;
  lead: string;
  /** When set, replaces core immediate_action_steps for this URL */
  immediate_action_steps?: string[];
  /** When set, replaces core when_to_call_vet_vs_poison_control */
  when_to_call_vet_vs_poison_control?: string;
  sections: EmergencyGuideSection[];
  faqs: EmergencyGuideFaq[];
  NEEDS_VET_REVIEW?: true;
};
