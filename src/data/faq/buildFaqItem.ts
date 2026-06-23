import type { FaqCategoryId } from './categories';
import { getFaqCategoryLabel } from './categories';
import type { FaqHubItem } from '@/types/faqHub';

export type FaqSeed = {
  question: string;
  categoryId: FaqCategoryId;
  shortAnswer: string;
  focus: string;
  keywords?: string[];
  relatedBlogSlugs?: string[];
  relatedLearnSlugs?: string[];
};

const BLOG_POOL = [
  'organize-pet-medical-records-online',
  'puppy-vaccination-schedule-2026',
  'pet-emergency-information-card-guide',
  'pet-medication-reminder-guide',
  'traveling-with-pets-health-documents-checklist',
  'senior-dog-care-health-records-medication-tracker',
  'new-puppy-checklist-health-records-vaccines',
  'digital-pet-health-record-template-guide',
];

const LEARN_POOL = [
  'build-a-pet-health-record-timeline',
  'create-a-pet-passport-for-sitters',
  'daily-medication-log-for-chronic-pet-care',
  'domestic-flight-pet-document-checklist',
  'puppy-vaccine-booster-tracker',
];

export function slugifyFaqQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
}

function linkBlog(slug: string): string {
  return `[${slug.replace(/-/g, ' ')}](/blog/${slug})`;
}

function linkLearn(slug: string): string {
  return `[${slug.replace(/-/g, ' ')}](/learn/${slug})`;
}

function linkCompare(slug: string): string {
  return `[${slug.replace(/-/g, ' ')}](/compare/${slug})`;
}

export function buildFaqItem(seed: FaqSeed, index: number, categorySlugs: string[]): FaqHubItem {
  const categoryLabel = getFaqCategoryLabel(seed.categoryId);
  const blogSlugs = seed.relatedBlogSlugs ?? [
    BLOG_POOL[index % BLOG_POOL.length],
    BLOG_POOL[(index + 2) % BLOG_POOL.length],
  ];
  const learnSlugs = seed.relatedLearnSlugs ?? [LEARN_POOL[index % LEARN_POOL.length]];
  const relatedSlugs = categorySlugs.filter((s) => s !== slugifyFaqQuestion(seed.question)).slice(0, 4);

  const answer = `${seed.shortAnswer}

**Quick steps for ${seed.focus}:**
1. Gather your latest documents and note the next due date from your vet.
2. Upload PDFs or photos the same day you receive them so dates stay accurate.
3. Turn every follow-up into a reminder with a 7-day early alert.
4. Keep a one-page emergency summary with allergies, meds, and contacts.
5. Share access with anyone who may care for your pet while you are away.

**Why this matters:** ${categoryLabel} questions usually surface when you are rushed, before boarding, during travel, or at an after-hours clinic. A single searchable timeline prevents conflicting notes and duplicate tests.

**Common mistakes:** Waiting until an emergency to compile records, storing files only in email, forgetting to update medications after vet visits, and not sharing records with co-parents or sitters.

**PetClues workflow:** PetClues stores documents, sends vaccination and medication reminders, and keeps an emergency pet passport ready to share. [Start free](/signup) or see [pricing](/pricing) for multi-pet households.

**Related resources:** ${linkBlog(blogSlugs[0])} · ${linkLearn(learnSlugs[0])} · ${linkCompare('petclues-vs-paper-records')}`;

  const keywords = seed.keywords ?? [
    seed.focus,
    categoryLabel.toLowerCase(),
    'pet health records',
    'petclues',
  ];

  return {
    slug: slugifyFaqQuestion(seed.question),
    question: seed.question,
    shortAnswer: seed.shortAnswer,
    answer,
    categoryId: seed.categoryId,
    keywords,
    relatedSlugs,
    relatedBlogSlugs: blogSlugs,
    relatedLearnSlugs: learnSlugs,
    updatedAt: '2026-06-18',
  };
}
