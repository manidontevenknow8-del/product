import type { BreedRecord } from '@content-types/breed';
import type { LifeStageRecord } from '@content-types/life-stage';
import breedsJson from '@content-data/breeds.json';
import lifeStagesJson from '@content-data/life_stages.json';
import breedHealthIndex from '@content-data/generated/breed-health/index.json';

export type BreedHealthGeneratedPage = {
  key: string;
  path: string;
  breedSlug: string;
  stage: string;
  lifeStageSlug: string;
  primaryKeyword: string;
  metaDescription: string;
  wordCount: number;
  markdown: string;
  issueLinks: { issue: string; href: string }[];
  faqs: { question: string; answer: string }[];
  generatorVersion?: number;
};

export type BreedHealthIndexEntry = {
  key: string;
  path: string;
  breedSlug: string;
  stage: string;
  wordCount: number;
  file: string;
};

const breeds = breedsJson as BreedRecord[];
const lifeStages = lifeStagesJson as LifeStageRecord[];
const index = breedHealthIndex as BreedHealthIndexEntry[];

const modules = import.meta.glob('@content-data/generated/breed-health/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, BreedHealthGeneratedPage>;

function moduleForKey(key: string): BreedHealthGeneratedPage | undefined {
  const hit = Object.entries(modules).find(([path]) => path.endsWith(`${key}.json`));
  return hit?.[1];
}

export function listBreedHealthIndex(): BreedHealthIndexEntry[] {
  return index;
}

export function getBreedHealthPage(breedSlug: string, stage: string): {
  breed: BreedRecord;
  lifeStage: LifeStageRecord;
  content: BreedHealthGeneratedPage;
} | null {
  const breed = breeds.find((b) => b.slug === breedSlug);
  if (!breed || breed.NEEDS_VET_REVIEW) return null;
  const lifeStage = lifeStages.find((s) => s.species === breed.species && s.stage === stage);
  if (!lifeStage) return null;
  const key = `${breedSlug}__${stage}`;
  const content = moduleForKey(key);
  if (!content) return null;
  return { breed, lifeStage, content };
}

export function stagesForBreedSlug(breedSlug: string): string[] {
  return index.filter((e) => e.breedSlug === breedSlug).map((e) => e.stage);
}
