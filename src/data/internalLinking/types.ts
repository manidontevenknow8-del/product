import type { BlogCategoryId } from '@/data/blogCategories';

export type InternalLinkKind = 'blog' | 'learn' | 'faq' | 'pricing' | 'homepage';

export type InternalLink = {
  kind: InternalLinkKind;
  label: string;
  href: string;
};

export type BlogInternalLinkPlan = {
  slug: string;
  blogs: InternalLink[];
  learn: InternalLink;
  faq: InternalLink;
  pricing: InternalLink;
  homepage: InternalLink;
};

export type BlogLinkCandidate = {
  slug: string;
  title: string;
  category: BlogCategoryId;
  tags: string[];
  cluster?: string;
};
