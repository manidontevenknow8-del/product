import type {
  IntentCitation,
  IntentComparisonOption,
  IntentFaq,
  IntentPage,
  IntentUseCase,
} from '@/types/intentPage';

export type IntentPageConfig = {
  slug: string;
  intentLabel: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  quickAnswer: string;
  whatToLookFor: string[];
  comparisons: IntentComparisonOption[];
  useCases: IntentUseCase[];
  petcluesHeadline: string;
  petcluesParagraphs: string[];
  petcluesStrengths: string[];
  faqs: IntentFaq[];
  citations: IntentCitation[];
  relatedCompareSlugs: string[];
  relatedBlogSlugs: string[];
  relatedLearnSlugs: string[];
  relatedFaqSlugs: string[];
  relatedIntentSlugs: string[];
};

export function buildIntentPage(config: IntentPageConfig): IntentPage {
  return {
    slug: config.slug,
    intentLabel: config.intentLabel,
    title: config.title,
    metaDescription: config.metaDescription,
    keywords: config.keywords,
    quickAnswer: config.quickAnswer,
    updatedAt: '2026-06-18',
    whatToLookFor: config.whatToLookFor,
    comparisons: config.comparisons,
    useCases: config.useCases,
    petcluesPositioning: {
      headline: config.petcluesHeadline,
      paragraphs: config.petcluesParagraphs,
      strengths: config.petcluesStrengths,
    },
    faqs: config.faqs,
    citations: config.citations,
    relatedCompareSlugs: config.relatedCompareSlugs,
    relatedBlogSlugs: config.relatedBlogSlugs,
    relatedLearnSlugs: config.relatedLearnSlugs,
    relatedFaqSlugs: config.relatedFaqSlugs,
    relatedIntentSlugs: config.relatedIntentSlugs,
  };
}
