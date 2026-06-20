import type { FaqCategoryId } from './categories';
import { FAQ_QUESTIONS_BY_CATEGORY, FAQ_HUB_QUESTION_COUNT } from './faqQuestionBank';
import { buildFaqItem, slugifyFaqQuestion, type FaqSeed } from './buildFaqItem';
import type { FaqHubItem } from '@/types/faqHub';

function focusFromQuestion(question: string): string {
  return question
    .replace(/\?$/g, '')
    .replace(/^(how do i|how does|how can i|how should i|what is|what are|what should|what if|when should|when do|do i|does|can i|can|should i|should|are|is)\s+/i, '')
    .toLowerCase();
}

function shortAnswerFor(question: string, categoryId: FaqCategoryId): string {
  const focus = focusFromQuestion(question);

  if (categoryId === 'petclues-app') {
    if (question.includes('veterinary advice')) {
      return 'No. PetClues organizes records and reminders but does not diagnose or replace a licensed veterinarian.';
    }
    if (question.includes('free')) {
      return 'Yes. PetClues offers a free plan for one pet with records, reminders, daily check-ins, and an emergency passport.';
    }
    if (question.includes('What is PetClues')) {
      return 'PetClues is a pet health records app for vaccination reminders, document storage, emergency passports, and care organization.';
    }
    return `PetClues helps with ${focus} through organized records, smart reminders, and shareable emergency summaries.`;
  }

  if (question.startsWith('What records should')) {
    return `Keep vaccines, prescriptions, lab results, visit summaries, dental notes, and follow-up dates in one searchable timeline for ${focus}.`;
  }

  if (question.startsWith('How do I') || question.startsWith('How can I')) {
    return `For ${focus}, gather documents immediately after each visit, store them in one app, and set reminders for every next due date.`;
  }

  if (question.startsWith('What is') || question.startsWith('What are')) {
    return `${focus.charAt(0).toUpperCase()}${focus.slice(1)} is easiest when records are dated, searchable, and paired with reminders before deadlines.`;
  }

  if (question.startsWith('Should') || question.startsWith('Do ') || question.startsWith('Can ')) {
    return `In most cases, yes—${focus} is safer when documented in one place your vet, sitter, or family can access quickly.`;
  }

  if (question.startsWith('When')) {
    return `Timing for ${focus} depends on your veterinarian, but set reminders as soon as you receive a due date at the clinic.`;
  }

  return `The best approach to ${focus} is consistent documentation, proactive reminders, and a one-page emergency summary.`;
}

const CATEGORY_LINK_OVERRIDES: Partial<Record<FaqCategoryId, Partial<FaqSeed>>> = {
  'pet-records': {
    relatedBlogSlugs: ['organize-pet-medical-records-online', 'digital-pet-health-record-template-guide'],
    relatedLearnSlugs: ['build-a-pet-health-record-timeline'],
  },
  vaccinations: {
    relatedBlogSlugs: ['puppy-vaccination-schedule-2026', 'dog-vaccination-schedule-guide'],
    relatedLearnSlugs: ['puppy-vaccine-booster-tracker'],
  },
  'pet-passports': {
    relatedBlogSlugs: ['pet-emergency-information-card-guide', 'pet-sitter-instructions-medical-emergency-info'],
    relatedLearnSlugs: ['create-a-pet-passport-for-sitters'],
  },
  'pet-travel': {
    relatedBlogSlugs: ['traveling-with-pets-health-documents-checklist', 'international-pet-travel-health-certificate-guide'],
    relatedLearnSlugs: ['domestic-flight-pet-document-checklist'],
  },
  'medication-management': {
    relatedBlogSlugs: ['pet-medication-reminder-guide', 'split-dose-pet-medication-schedule-guide'],
    relatedLearnSlugs: ['daily-medication-log-for-chronic-pet-care'],
  },
  'emergency-preparedness': {
    relatedBlogSlugs: ['pet-emergency-information-card-guide', 'pet-first-aid-kit-records-checklist'],
    relatedLearnSlugs: ['build-a-pet-emergency-info-card'],
  },
};

function buildAllFaqs(): FaqHubItem[] {
  const items: FaqHubItem[] = [];

  for (const [categoryId, questions] of Object.entries(FAQ_QUESTIONS_BY_CATEGORY) as [
    FaqCategoryId,
    readonly string[],
  ][]) {
    const overrides = CATEGORY_LINK_OVERRIDES[categoryId];
    const categorySlugs = questions.map((question) => slugifyFaqQuestion(question));

    questions.forEach((question, index) => {
      const seed: FaqSeed = {
        question,
        categoryId,
        shortAnswer: shortAnswerFor(question, categoryId),
        focus: focusFromQuestion(question),
        ...overrides,
      };
      items.push(buildFaqItem(seed, index, categorySlugs));
    });
  }

  return items;
}

const FAQ_ITEMS = buildAllFaqs();

if (FAQ_ITEMS.length !== FAQ_HUB_QUESTION_COUNT) {
  throw new Error(`FAQ count mismatch: expected ${FAQ_HUB_QUESTION_COUNT}, got ${FAQ_ITEMS.length}`);
}

const slugSet = new Set(FAQ_ITEMS.map((item) => item.slug));
if (slugSet.size !== FAQ_ITEMS.length) {
  throw new Error('Duplicate FAQ slugs detected');
}

export const FAQ_HUB_COUNT = FAQ_ITEMS.length;

export type FaqListFilters = {
  category?: FaqCategoryId;
  search?: string;
};

export function listFaqItems(filters?: FaqListFilters): FaqHubItem[] {
  let items = FAQ_ITEMS;

  if (filters?.category) {
    items = items.filter((item) => item.categoryId === filters.category);
  }

  if (filters?.search) {
    const query = filters.search.trim().toLowerCase();
    if (query) {
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.shortAnswer.toLowerCase().includes(query) ||
          item.keywords.some((keyword) => keyword.toLowerCase().includes(query)),
      );
    }
  }

  return items;
}

export function getFaqItemBySlug(slug: string): FaqHubItem | null {
  return FAQ_ITEMS.find((item) => item.slug === slug) ?? null;
}

export function getRelatedFaqItems(item: FaqHubItem, limit = 5): FaqHubItem[] {
  const related = new Set(item.relatedSlugs);
  return FAQ_ITEMS.filter((candidate) => related.has(candidate.slug) || candidate.categoryId === item.categoryId)
    .filter((candidate) => candidate.slug !== item.slug)
    .slice(0, limit);
}

export function getAllFaqItems(): readonly FaqHubItem[] {
  return FAQ_ITEMS;
}
