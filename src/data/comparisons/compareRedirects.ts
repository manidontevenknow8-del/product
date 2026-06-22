import { ROUTES } from '@/routes/paths';

/**
 * Compare slugs that 301 to /best/:slug. Keep redirects for backlinks; link internally to /best/.
 */
export const COMPARE_REDIRECTS_TO_BEST: Readonly<Record<string, string>> = {
  'best-pet-health-record-app': 'best-pet-health-record-app',
};

export const COMPARE_SITEMAP_EXCLUDED_SLUGS = new Set(Object.keys(COMPARE_REDIRECTS_TO_BEST));

export function resolveCompareHref(slug: string): string {
  const bestSlug = COMPARE_REDIRECTS_TO_BEST[slug];
  if (bestSlug) return `${ROUTES.BEST}/${bestSlug}`;
  return `${ROUTES.COMPARE}/${slug}`;
}
