import type { FaqCategoryId } from '@/data/faq/categories';

export type FaqHubItem = {
  slug: string;
  question: string;
  shortAnswer: string;
  answer: string;
  categoryId: FaqCategoryId;
  keywords: string[];
  relatedSlugs: string[];
  relatedBlogSlugs: string[];
  relatedLearnSlugs: string[];
  updatedAt: string;
};
