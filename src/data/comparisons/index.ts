import type { ComparisonListItem, ComparisonPage } from '@/types/comparison';
import { buildComparisonPage } from './buildPage';
import { COMPETITOR_CONFIGS } from './competitorConfigs';

const COMPARISON_PAGES: ComparisonPage[] = COMPETITOR_CONFIGS.map(buildComparisonPage);

const BY_SLUG = new Map(COMPARISON_PAGES.map((page) => [page.slug, page]));

export function listComparisonPages(): ComparisonListItem[] {
  return COMPARISON_PAGES.map((page) => ({
    slug: page.slug,
    competitorName: page.competitorName,
    title: page.title,
    metaDescription: page.metaDescription,
    updatedAt: page.updatedAt,
  }));
}

export function getComparisonBySlug(slug: string): ComparisonPage | null {
  return BY_SLUG.get(slug) ?? null;
}

export function getRelatedComparisons(page: ComparisonPage, limit = 6): ComparisonPage[] {
  const picked = new Set<string>();
  const related: ComparisonPage[] = [];

  for (const relatedSlug of page.relatedSlugs) {
    const match = BY_SLUG.get(relatedSlug);
    if (match && !picked.has(match.slug)) {
      picked.add(match.slug);
      related.push(match);
    }
    if (related.length >= limit) return related;
  }

  for (const candidate of COMPARISON_PAGES) {
    if (candidate.slug === page.slug || picked.has(candidate.slug)) continue;
    related.push(candidate);
    if (related.length >= limit) break;
  }

  return related;
}

export const COMPARISON_PAGE_COUNT = COMPARISON_PAGES.length;
