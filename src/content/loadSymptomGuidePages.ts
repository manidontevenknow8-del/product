import type { SymptomGuidePageRecord } from '@content-types/symptom';
import manifestJson from '@content-data/generated/symptoms/manifest.json';

type BatchFile = {
  batch: number;
  count: number;
  pages: SymptomGuidePageRecord[];
};

const batchModules = import.meta.glob('@content-data/generated/symptoms/batch-*.json', {
  eager: true,
}) as Record<string, { default: BatchFile } | BatchFile>;

const batches: BatchFile[] = Object.values(batchModules)
  .map((mod) => ('default' in mod ? mod.default : mod))
  .sort((a, b) => a.batch - b.batch);

const pagesByPath = new Map<string, SymptomGuidePageRecord>();
const pagesBySpeciesSlug = new Map<string, SymptomGuidePageRecord>();

for (const batch of batches) {
  for (const page of batch.pages) {
    pagesByPath.set(page.path, page);
    pagesBySpeciesSlug.set(`${page.species}/${page.pageSlug}`, page);
  }
}

export const symptomGuideManifest = manifestJson as {
  totalPages: number;
  batchSize: number;
  batchCount: number;
  pages: { path: string; batch: number; species: string; pageSlug: string }[];
};

export function getSymptomGuidePage(
  species: string,
  pageSlug: string,
): SymptomGuidePageRecord | undefined {
  return pagesBySpeciesSlug.get(`${species}/${pageSlug}`);
}

export function getSymptomGuidePageByPath(path: string): SymptomGuidePageRecord | undefined {
  return pagesByPath.get(path);
}

export function listLoadedSymptomGuidePages(): SymptomGuidePageRecord[] {
  return [...pagesByPath.values()];
}

export function listLoadedSymptomGuideBatchCount(): number {
  return batches.length;
}
