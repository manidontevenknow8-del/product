import type { IntentListItem, IntentPage } from '@/types/intentPage';
import { INTENT_PAGES } from './intentConfigs';

const BY_SLUG = new Map(INTENT_PAGES.map((page) => [page.slug, page]));

export function listIntentPages(): IntentListItem[] {
  return INTENT_PAGES.map((page) => ({
    slug: page.slug,
    intentLabel: page.intentLabel,
    title: page.title,
    metaDescription: page.metaDescription,
    quickAnswer: page.quickAnswer,
    updatedAt: page.updatedAt,
  }));
}

export function getIntentPageBySlug(slug: string): IntentPage | null {
  return BY_SLUG.get(slug) ?? null;
}

export function getRelatedIntentPages(page: IntentPage, limit = 4): IntentPage[] {
  const picked = new Set<string>();
  const related: IntentPage[] = [];

  for (const slug of page.relatedIntentSlugs) {
    const match = BY_SLUG.get(slug);
    if (match && !picked.has(match.slug)) {
      picked.add(match.slug);
      related.push(match);
    }
    if (related.length >= limit) return related;
  }

  for (const candidate of INTENT_PAGES) {
    if (candidate.slug === page.slug || picked.has(candidate.slug)) continue;
    related.push(candidate);
    if (related.length >= limit) break;
  }

  return related;
}

export const INTENT_PAGE_COUNT = INTENT_PAGES.length;
