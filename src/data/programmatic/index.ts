import type {
  ProgrammaticCollectionId,
  ProgrammaticListItem,
  ProgrammaticPage,
  ProgrammaticPageKey,
} from '@/types/programmaticPage';
import { listProgrammaticCollections } from './collections';
import {
  buildAllProgrammaticPages,
  EXPECTED_PROGRAMMATIC_PAGE_COUNT,
} from './buildProgrammaticPage';

const ALL_PAGES = buildAllProgrammaticPages();

if (ALL_PAGES.length !== EXPECTED_PROGRAMMATIC_PAGE_COUNT) {
  throw new Error(`Expected ${EXPECTED_PROGRAMMATIC_PAGE_COUNT} programmatic pages, got ${ALL_PAGES.length}`);
}

const BY_KEY = new Map<ProgrammaticPageKey, ProgrammaticPage>(
  ALL_PAGES.map((page) => [`${page.collectionId}/${page.slug}`, page]),
);

const BY_COLLECTION = new Map<ProgrammaticCollectionId, ProgrammaticPage[]>();

for (const page of ALL_PAGES) {
  const list = BY_COLLECTION.get(page.collectionId) ?? [];
  list.push(page);
  BY_COLLECTION.set(page.collectionId, list);
}

for (const [, pages] of BY_COLLECTION) {
  pages.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
}

export function toPageKey(collectionId: ProgrammaticCollectionId, slug: string): ProgrammaticPageKey {
  return `${collectionId}/${slug}`;
}

export function listProgrammaticPages(collectionId?: ProgrammaticCollectionId): ProgrammaticListItem[] {
  const pages = collectionId ? (BY_COLLECTION.get(collectionId) ?? []) : ALL_PAGES;

  return pages.map((page) => ({
    collectionId: page.collectionId,
    slug: page.slug,
    subjectName: page.subjectName,
    title: page.title,
    metaDescription: page.metaDescription,
    quickAnswer: page.quickAnswer,
    updatedAt: page.updatedAt,
  }));
}

export function getProgrammaticPage(
  collectionId: ProgrammaticCollectionId,
  slug: string,
): ProgrammaticPage | null {
  return BY_KEY.get(toPageKey(collectionId, slug)) ?? null;
}

export function getRelatedProgrammaticPages(page: ProgrammaticPage, limit = 6): ProgrammaticPage[] {
  const picked = new Set<ProgrammaticPageKey>();
  const related: ProgrammaticPage[] = [];

  for (const key of page.relatedPageKeys) {
    const match = BY_KEY.get(key as ProgrammaticPageKey);
    if (match && !picked.has(key as ProgrammaticPageKey)) {
      picked.add(key as ProgrammaticPageKey);
      related.push(match);
    }
    if (related.length >= limit) return related;
  }

  const sameCollection = BY_COLLECTION.get(page.collectionId) ?? [];
  for (const candidate of sameCollection) {
    const key = toPageKey(candidate.collectionId, candidate.slug);
    if (key === toPageKey(page.collectionId, page.slug) || picked.has(key)) continue;
    picked.add(key);
    related.push(candidate);
    if (related.length >= limit) break;
  }

  return related;
}

export function isProgrammaticCollectionId(value: string): value is ProgrammaticCollectionId {
  return listProgrammaticCollections().some((collection) => collection.id === value);
}

export const PROGRAMMATIC_PAGE_COUNT = ALL_PAGES.length;
export const PROGRAMMATIC_COLLECTION_COUNT = listProgrammaticCollections().length;
