import type { LifeLogisticsPageRecord } from '@content-types/life-logistics';
import batch01 from '@content-data/generated/life-logistics/batch-01.json';
import batch02 from '@content-data/generated/life-logistics/batch-02.json';
import batch03 from '@content-data/generated/life-logistics/batch-03.json';
import batch04 from '@content-data/generated/life-logistics/batch-04.json';
import batch05 from '@content-data/generated/life-logistics/batch-05.json';

const batches: LifeLogisticsPageRecord[][] = [
  batch01 as LifeLogisticsPageRecord[],
  batch02 as LifeLogisticsPageRecord[],
  batch03 as LifeLogisticsPageRecord[],
  batch04 as LifeLogisticsPageRecord[],
  batch05 as LifeLogisticsPageRecord[],
];

export const lifeLogisticsPages: LifeLogisticsPageRecord[] = batches.flat();

export function getLifeLogisticsPageBySlug(slug: string): LifeLogisticsPageRecord | undefined {
  return lifeLogisticsPages.find((p) => p.slug === slug);
}

export function listLifeLogisticsPaths(): string[] {
  return lifeLogisticsPages.map((p) => `/guides/${p.slug}`);
}

export function listLifeLogisticsPagesByCluster(
  cluster: LifeLogisticsPageRecord['cluster'],
  excludeSlug?: string,
): LifeLogisticsPageRecord[] {
  return lifeLogisticsPages.filter((p) => p.cluster === cluster && p.slug !== excludeSlug);
}
