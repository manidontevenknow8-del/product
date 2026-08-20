/** Gated downloadable tool / template pages for content-data/tools.json */

export type ToolFamily =
  | 'vaccination-record'
  | 'emergency-card'
  | 'vet-visit-log'
  | 'pet-sitter-instructions';

export type ToolSpecies =
  | 'dog'
  | 'cat'
  | 'puppy'
  | 'kitten'
  | 'senior-dog'
  | 'senior-cat'
  | 'multi-pet'
  | 'rabbit'
  | 'bird'
  | 'ferret'
  | 'pet';

export type ToolSection = {
  heading: string;
  paragraphs: string[];
};

export type ToolFaq = {
  question: string;
  answer: string;
};

export type ToolRecord = {
  /** URL slug under /tools/{slug} */
  slug: string;
  family: ToolFamily;
  species: ToolSpecies;
  /** Short use-case label for filters and related links */
  use_case: string;
  h1: string;
  primary_keyword: string;
  meta_description: string;
  lead: string;
  /** Shown in data facts */
  format: string;
  includes: string;
  /** Rows that appear in the gated download preview */
  download_rows: string[];
  /** How to fill / use the printable */
  how_to_use: string[];
  sections: ToolSection[];
  faqs: ToolFaq[];
  gated: true;
  NEEDS_VET_REVIEW?: true;
  source_notes?: string;
};

export const TOOL_FAMILY_LABELS: Record<ToolFamily, string> = {
  'vaccination-record': 'Vaccination record sheets',
  'emergency-card': 'Emergency cards',
  'vet-visit-log': 'Vet visit logs',
  'pet-sitter-instructions': 'Pet sitter templates',
};
