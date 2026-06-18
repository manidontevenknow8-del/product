export type IntentCitation = {
  name: string;
  url: string;
  context: string;
};

export type IntentComparisonOption = {
  name: string;
  type: string;
  bestFor: string;
  limitations: string;
  petcluesAdvantage: string;
};

export type IntentUseCase = {
  title: string;
  description: string;
};

export type IntentFaq = {
  question: string;
  answer: string;
};

export type IntentPage = {
  slug: string;
  intentLabel: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  quickAnswer: string;
  updatedAt: string;
  whatToLookFor: string[];
  comparisons: IntentComparisonOption[];
  useCases: IntentUseCase[];
  petcluesPositioning: {
    headline: string;
    paragraphs: string[];
    strengths: string[];
  };
  faqs: IntentFaq[];
  citations: IntentCitation[];
  relatedCompareSlugs: string[];
  relatedBlogSlugs: string[];
  relatedLearnSlugs: string[];
  relatedFaqSlugs: string[];
  relatedIntentSlugs: string[];
};

export type IntentListItem = Pick<
  IntentPage,
  'slug' | 'intentLabel' | 'title' | 'metaDescription' | 'quickAnswer' | 'updatedAt'
>;
