import type { RecordsVaultPageRecord } from '@content-types/records-vault';
import vaultPagesJson from '@content-data/generated/vault/pages.json';
import { pickRingNeighborsByKey } from '@/content/pickRingNeighbors';

export const vaultPages = vaultPagesJson as RecordsVaultPageRecord[];

const BY_SLUG = new Map(vaultPages.map((page) => [page.slug, page]));

export function getVaultPageBySlug(slug: string): RecordsVaultPageRecord | undefined {
  return BY_SLUG.get(slug);
}

export function listVaultPages(): RecordsVaultPageRecord[] {
  return vaultPages;
}

export function listVaultPagesByCluster(
  cluster: RecordsVaultPageRecord['cluster'],
): RecordsVaultPageRecord[] {
  return vaultPages.filter((page) => page.cluster === cluster);
}

export function isVaultGuideSlug(slug: string): boolean {
  return BY_SLUG.has(slug);
}

export function getVaultRelatedPages(
  page: RecordsVaultPageRecord,
  limit = 5,
): RecordsVaultPageRecord[] {
  const sameCluster = vaultPages
    .filter((p) => p.cluster === page.cluster)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const fromCluster = pickRingNeighborsByKey(sameCluster, (p) => p.slug, page.slug, limit);
  if (fromCluster.length >= limit) return fromCluster;

  const others = vaultPages
    .filter((p) => p.cluster !== page.cluster)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const fromOthers = pickRingNeighborsByKey(
    others,
    (p) => p.slug,
    page.slug,
    limit - fromCluster.length,
  );
  return [...fromCluster, ...fromOthers].slice(0, limit);
}
