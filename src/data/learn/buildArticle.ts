import type { LearnArticle, LearnFaq } from '@/types/learn';
import type { LearnCategoryId } from './categories';
import { getLearnCategoryLabel } from './categories';

export type LearnArticleConfig = {
  slug: string;
  title: string;
  categoryId: LearnCategoryId;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  whatParagraphs: string[];
  whyParagraphs: string[];
  howSteps: string[];
  bestPractices: string[];
  commonMistakes: string[];
  workflowParagraphs: string[];
  workflowSteps: string[];
  faqs: LearnFaq[];
  relatedSlugs: string[];
  relatedBlogSlugs: string[];
  relatedCompareSlugs: string[];
};

function estimateReadMinutes(config: LearnArticleConfig): number {
  const words = [
    config.title,
    config.excerpt,
    ...config.whatParagraphs,
    ...config.whyParagraphs,
    ...config.howSteps,
    ...config.bestPractices,
    ...config.commonMistakes,
    ...config.workflowParagraphs,
    ...config.workflowSteps,
    ...config.faqs.flatMap((f) => [f.question, f.answer]),
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(4, Math.round(words / 220));
}

export function buildLearnArticle(config: LearnArticleConfig): LearnArticle {
  const categoryLabel = getLearnCategoryLabel(config.categoryId);

  return {
    slug: config.slug,
    title: `${config.title} | PetClues Learn`,
    categoryId: config.categoryId,
    excerpt: config.excerpt,
    metaDescription: config.metaDescription,
    keywords: config.keywords,
    updatedAt: '2026-06-16',
    readMinutes: estimateReadMinutes(config),
    what: {
      headline: `What is ${config.title.replace(/\?$/, '')}?`,
      paragraphs: config.whatParagraphs,
    },
    why: {
      headline: `Why ${categoryLabel.toLowerCase()} matters for pet parents`,
      paragraphs: config.whyParagraphs,
    },
    how: {
      headline: 'How to do it step by step',
      steps: config.howSteps,
    },
    bestPractices: config.bestPractices,
    commonMistakes: config.commonMistakes,
    petcluesWorkflow: {
      headline: 'PetClues workflow',
      paragraphs: config.workflowParagraphs,
      steps: config.workflowSteps,
    },
    faqs: config.faqs,
    relatedSlugs: config.relatedSlugs,
    relatedBlogSlugs: config.relatedBlogSlugs,
    relatedCompareSlugs: config.relatedCompareSlugs,
  };
}
