import {
  listBreedConditions,
  getBreedConditionPath,
  type BreedConditionMeta,
  type BreedConditionRiskLevel,
} from '@/data/breedConditions';

export type RelatedBreedConditionLink = {
  href: string;
  label: string;
  riskLevel: BreedConditionRiskLevel;
};

export type BreedConditionMatchInput = {
  title?: string;
  slug?: string;
  tags?: string[];
  excerpt?: string;
};

/**
 * Generic tokens that appear across many clinical names and would otherwise
 * create noisy, low-signal matches (e.g. "disease" matching every heart page).
 */
const STOPWORDS = new Set([
  'disease',
  'syndrome',
  'disorder',
  'canine',
  'feline',
  'the',
  'and',
  'obstructive',
  'idiopathic',
]);

const RISK_WEIGHT: Record<BreedConditionRiskLevel, number> = {
  Severe: 3,
  High: 2,
  Moderate: 1,
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toTokens(value: string): string[] {
  return normalize(value)
    .split(' ')
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function buildHaystack(input: BreedConditionMatchInput): Set<string> {
  const parts = [
    input.title ?? '',
    input.slug ?? '',
    input.excerpt ?? '',
    ...(input.tags ?? []),
  ];
  const tokens = new Set<string>();
  for (const part of parts) {
    for (const token of toTokens(part)) {
      tokens.add(token);
    }
  }
  return tokens;
}

function breedTokens(meta: BreedConditionMeta): string[] {
  return toTokens(meta.breed);
}

function conditionTokens(meta: BreedConditionMeta): string[] {
  return Array.from(new Set([...toTokens(meta.condition), ...toTokens(meta.scientificName)]));
}

function hasOverlap(tokens: string[], haystack: Set<string>): boolean {
  return tokens.some((token) => haystack.has(token));
}

/**
 * Find breed–condition pSEO guides related to a blog post by matching breed
 * and clinical-condition tokens (case-insensitive) across title, slug, tags,
 * and excerpt. Returns the strongest matches for internal linking.
 */
export function findRelatedBreedConditions(
  input: BreedConditionMatchInput,
  limit = 4,
): RelatedBreedConditionLink[] {
  const haystack = buildHaystack(input);
  if (haystack.size === 0) return [];

  const scored = listBreedConditions()
    .map((meta) => {
      const breedHit = hasOverlap(breedTokens(meta), haystack);
      const conditionHit = hasOverlap(conditionTokens(meta), haystack);
      let score = 0;
      if (breedHit) score += 2;
      if (conditionHit) score += 3;
      if (breedHit && conditionHit) score += 2;
      return { meta, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const riskDelta = RISK_WEIGHT[b.meta.riskLevel] - RISK_WEIGHT[a.meta.riskLevel];
      if (riskDelta !== 0) return riskDelta;
      return a.meta.breed.localeCompare(b.meta.breed);
    });

  return scored.slice(0, Math.max(0, limit)).map(({ meta }) => ({
    href: getBreedConditionPath(meta),
    label: `${meta.condition} in ${meta.breed}s`,
    riskLevel: meta.riskLevel,
  }));
}

export function getRelatedClinicalProfiles(meta: BreedConditionMeta, limit = 8): {
  sameBreed: RelatedBreedConditionLink[];
  sameCondition: RelatedBreedConditionLink[];
} {
  const all = listBreedConditions();
  const sameBreed = all
    .filter((entry) => entry.breed === meta.breed && entry.slug !== meta.slug)
    .slice(0, limit)
    .map((entry) => ({
      href: getBreedConditionPath(entry),
      label: `${entry.condition} in ${entry.breed}s`,
      riskLevel: entry.riskLevel,
    }));
  const sameCondition = all
    .filter((entry) => entry.condition === meta.condition && entry.slug !== meta.slug)
    .slice(0, limit)
    .map((entry) => ({
      href: getBreedConditionPath(entry),
      label: `${entry.condition} in ${entry.breed}s`,
      riskLevel: entry.riskLevel,
    }));
  return { sameBreed, sameCondition };
}
