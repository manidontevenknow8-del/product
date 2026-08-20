/**
 * Compare data bridge.
 *
 * Production compare pages are driven by content-data/comparisons.json
 * (verified features only) via @/content/comparisons.
 *
 * Legacy COMPETITOR_CONFIGS remain available for any leftover callers that
 * still expect ComparisonPage shapes, but list/get for routes + sitemap
 * prefer the publishable verified set.
 */
import type { ComparisonListItem, ComparisonPage } from '@/types/comparison';
import { buildComparisonPage } from './buildPage';
import { COMPETITOR_CONFIGS } from './competitorConfigs';
import { COMPARE_SITEMAP_EXCLUDED_SLUGS } from './compareRedirects';
import {
  buildComparisonMetaDescription,
  getPublishableComparisonByPageSlug,
  getPublishableComparisonBySlug,
  listPublishableComparisons,
  toComparePageSlug,
} from '@/content/comparisons';

const LEGACY_PAGES: ComparisonPage[] = COMPETITOR_CONFIGS.map(buildComparisonPage);
const LEGACY_BY_SLUG = new Map(LEGACY_PAGES.map((page) => [page.slug, page]));

const CONTENT_UPDATED_AT = '2026-08-20';

function listItemFromRecord(slug: string, name: string, metaDescription: string): ComparisonListItem {
  return {
    slug,
    competitorName: name,
    title: `PetClues vs ${name} | PetClues`,
    metaDescription,
    updatedAt: CONTENT_UPDATED_AT,
  };
}

/** Indexable compare URLs from verified comparisons.json only. */
export function listComparisonPages(): ComparisonListItem[] {
  return listPublishableComparisons().map((record) =>
    listItemFromRecord(
      toComparePageSlug(record.slug),
      record.name,
      buildComparisonMetaDescription(record),
    ),
  );
}

export function listIndexableComparisonPages(): ComparisonListItem[] {
  return listComparisonPages().filter((page) => !COMPARE_SITEMAP_EXCLUDED_SLUGS.has(page.slug));
}

/**
 * Resolve a compare page slug (petclues-vs-*).
 * Prefer verified content-data; fall back to legacy configs for deep links
 * that still point at older invented pages.
 */
export function getComparisonBySlug(slug: string): ComparisonPage | null {
  const verified = getPublishableComparisonByPageSlug(slug);
  if (verified) {
    return {
      slug: toComparePageSlug(verified.slug),
      competitorName: verified.name,
      competitorShortName: verified.name,
      title: `PetClues vs ${verified.name}`,
      metaDescription: buildComparisonMetaDescription(verified),
      keywords: [`petclues vs ${verified.name.toLowerCase()}`, verified.category],
      updatedAt: CONTENT_UPDATED_AT,
      problem: {
        headline: `PetClues vs ${verified.name}`,
        paragraphs: [
          verified.identity_note ??
            `${verified.name} is categorized as ${verified.category.replace(/-/g, ' ')}.`,
        ],
      },
      comparisonIntro: `Feature rows below are limited to claims verified in comparisons.json for ${verified.name}.`,
      featureRatings: {
        health_records: 'partial',
        vaccination_reminders: 'partial',
        medication_reminders: 'partial',
        vet_bill_storage: 'partial',
        emergency_passport: 'partial',
        multi_pet: 'partial',
        ai_vet_decoder: 'partial',
        mobile_access: 'partial',
        sitter_vet_sharing: 'partial',
        pet_specific_workflows: 'partial',
      },
      competitorPros: verified.features
        .filter((f) => f.value.toLowerCase().startsWith('yes'))
        .map((f) => `${f.feature}: ${f.value}`),
      competitorCons: verified.features
        .filter((f) => {
          const v = f.value.toLowerCase();
          return v.startsWith('no') || v.startsWith('not') || v.startsWith('poor');
        })
        .map((f) => `${f.feature}: ${f.value}`),
      petcluesPros: [
        'Owner-owned vault for certificates, meds, and vaccines',
        'Founding member pricing path on comparison CTAs',
      ],
      petcluesCons: [
        'Not a clinic PIMS replacement — PetClues is owner-controlled records',
      ],
      bestForCompetitor: `Best when ${verified.name}'s verified strengths match your workflow (see feature table).`,
      bestForPetClues:
        'Best when you want an owner-owned vault with reminders and founding member pricing clarity.',
      whyPetCluesExists: {
        headline: 'Why PetClues exists',
        paragraphs: [
          'PetClues organizes pet health records you control — without inventing competitor claims beyond verified sources.',
        ],
      },
      faqs: [
        {
          question: `What category is ${verified.name}?`,
          answer: verified.category.replace(/-/g, ' '),
        },
      ],
      relatedSlugs: listPublishableComparisons()
        .filter((r) => r.slug !== verified.slug)
        .slice(0, 6)
        .map((r) => toComparePageSlug(r.slug)),
      relatedBlogSlugs: [],
    };
  }

  // Also accept bare competitor slug from content-data
  const byBare = getPublishableComparisonBySlug(slug);
  if (byBare) return getComparisonBySlug(toComparePageSlug(byBare.slug));

  return LEGACY_BY_SLUG.get(slug) ?? null;
}

export function getRelatedComparisons(page: ComparisonPage, limit = 6): ComparisonPage[] {
  const related: ComparisonPage[] = [];
  for (const relatedSlug of page.relatedSlugs) {
    const match = getComparisonBySlug(relatedSlug);
    if (match) related.push(match);
    if (related.length >= limit) return related;
  }
  for (const item of listComparisonPages()) {
    if (item.slug === page.slug) continue;
    if (related.some((r) => r.slug === item.slug)) continue;
    const full = getComparisonBySlug(item.slug);
    if (full) related.push(full);
    if (related.length >= limit) break;
  }
  return related;
}

export const COMPARISON_PAGE_COUNT = listComparisonPages().length;
