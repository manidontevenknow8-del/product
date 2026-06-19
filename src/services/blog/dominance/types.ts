import type { BlogCategoryId } from '@/data/blogCategories';

export type DominanceEngine = 1 | 2 | 3 | 4 | 5;

export type DominanceTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

export type DominanceSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  ordered?: string[];
};

export type DominanceImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type DominanceFaq = {
  question: string;
  answer: string;
};

export type DominanceInternalLink = {
  phrase: string;
  slug: string;
};

export type DominanceTopic = {
  num: number;
  slug: string;
  title: string;
  engine: DominanceEngine;
  category: BlogCategoryId;
  excerpt: string;
  tags: string[];
  hook: string;
  table: DominanceTable;
  sections: DominanceSection[];
  images: DominanceImage[];
  faqs: DominanceFaq[];
  relatedSlugs: string[];
  internalLinks: DominanceInternalLink[];
  facts?: Record<string, unknown>;
};

export type DominanceCtaKind =
  | 'vet-bill-decoder'
  | 'pet-match'
  | 'health-foresight'
  | 'emergency-passport'
  | 'digital-pet-os';
