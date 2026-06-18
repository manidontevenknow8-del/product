export type ProgrammaticCollectionId =
  | 'dog-vaccination-schedule'
  | 'cat-vaccination-schedule'
  | 'pet-travel-checklist'
  | 'pet-emergency-checklist'
  | 'medication-tracking-template'
  | 'health-record-template'
  | 'pet-care-checklist';

export type ProgrammaticFaq = {
  question: string;
  answer: string;
};

export type ProgrammaticScheduleRow = {
  age: string;
  vaccines: string[];
  notes: string;
};

export type ProgrammaticChecklistGroup = {
  title: string;
  items: string[];
};

export type ProgrammaticSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type ProgrammaticPage = {
  collectionId: ProgrammaticCollectionId;
  slug: string;
  subjectName: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  quickAnswer: string;
  updatedAt: string;
  intro: string[];
  sections: ProgrammaticSection[];
  schedule?: ProgrammaticScheduleRow[];
  checklist?: ProgrammaticChecklistGroup[];
  faqs: ProgrammaticFaq[];
  petcluesWorkflow: {
    headline: string;
    steps: string[];
  };
  relatedLearnSlugs: string[];
  relatedBlogSlugs: string[];
  relatedFaqSlugs: string[];
  relatedPageKeys: string[];
};

export type ProgrammaticListItem = Pick<
  ProgrammaticPage,
  'collectionId' | 'slug' | 'subjectName' | 'title' | 'metaDescription' | 'quickAnswer' | 'updatedAt'
>;

export type ProgrammaticPageKey = `${ProgrammaticCollectionId}/${string}`;
