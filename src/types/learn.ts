import type { LearnCategoryId } from '@/data/learn/categories';

export type LearnFaq = {
  question: string;
  answer: string;
};

export type LearnSection = {
  headline: string;
  paragraphs: string[];
};

export type LearnHowSection = {
  headline: string;
  steps: string[];
};

export type LearnWorkflowSection = {
  headline: string;
  paragraphs: string[];
  steps: string[];
};

export type LearnArticle = {
  slug: string;
  title: string;
  categoryId: LearnCategoryId;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  updatedAt: string;
  readMinutes: number;
  what: LearnSection;
  why: LearnSection;
  how: LearnHowSection;
  bestPractices: string[];
  commonMistakes: string[];
  petcluesWorkflow: LearnWorkflowSection;
  faqs: LearnFaq[];
  relatedSlugs: string[];
  relatedBlogSlugs: string[];
  relatedCompareSlugs: string[];
};

export type LearnArticleListItem = Pick<
  LearnArticle,
  'slug' | 'title' | 'categoryId' | 'excerpt' | 'metaDescription' | 'updatedAt' | 'readMinutes'
>;
