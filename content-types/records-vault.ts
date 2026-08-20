/** Hand-authored long-tail vault / document-storage guide pages */

export type RecordsVaultCluster =
  | 'organize'
  | 'lost'
  | 'transfer'
  | 'new-pet'
  | 'boarding'
  | 'sitter'
  | 'document-type'
  | 'emergency'
  | 'travel'
  | 'insurance'
  | 'sharing'
  | 'chronic';

export type RecordsVaultSection = {
  heading: string;
  paragraphs: string[];
};

export type RecordsVaultFaq = {
  question: string;
  answer: string;
};

export type RecordsVaultFactRow = {
  label: string;
  value: string;
};

export type RecordsVaultCta = {
  headline: string;
  subtext: string;
  button_text: string;
};

export type RecordsVaultPageRecord = {
  /** URL: /guides/{slug} */
  slug: string;
  cluster: RecordsVaultCluster;
  primary_keyword: string;
  h1: string;
  meta_description: string;
  lead: string;
  /** Named pain point for conversion copy */
  pain_point: string;
  data_rows: RecordsVaultFactRow[];
  checklist_heading: string;
  checklist: string[];
  sections: RecordsVaultSection[];
  faqs: RecordsVaultFaq[];
  cta: RecordsVaultCta;
};
