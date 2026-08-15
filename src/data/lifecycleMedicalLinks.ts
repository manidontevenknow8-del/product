import {
  getBreedConditionPath,
  listBreedConditions,
  type BreedConditionMeta,
} from './breedConditions';
import type { LifecycleBreed } from './lifecycleMatrix';

function breedKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function matchesBreed(entry: BreedConditionMeta, breed: LifecycleBreed): boolean {
  const conditionBreedSlug = entry.slug.split('/')[0] ?? '';
  if (conditionBreedSlug === breed.slug) return true;
  if (breed.aliases.includes(conditionBreedSlug)) return true;

  const entryKey = breedKey(entry.breed);
  const nameKey = breedKey(breed.name);
  if (entryKey === nameKey) return true;
  if (nameKey.includes(entryKey) || entryKey.includes(nameKey)) return true;
  return breed.aliases.some((alias) => breedKey(alias) === entryKey);
}

export function listMedicalGuidesForBreed(breed: LifecycleBreed): readonly BreedConditionMeta[] {
  return listBreedConditions().filter((entry) => matchesBreed(entry, breed));
}

/**
 * Internal PageRank distribution: all same-breed clinical briefs, then a
 * rotated slice of the remaining 405 so every medical URL receives inbound
 * links across the 3,000 lifecycle pages without dumping 405 nodes into
 * every prerendered HTML file.
 */
export function listPagerankMedicalGuides(
  breed: LifecycleBreed,
  extraLimit = 36,
): readonly BreedConditionMeta[] {
  const all = listBreedConditions();
  const sameBreed = listMedicalGuidesForBreed(breed);
  const sameSlugs = new Set(sameBreed.map((entry) => entry.slug));
  const rest = all.filter((entry) => !sameSlugs.has(entry.slug));

  let hash = 0;
  for (let i = 0; i < breed.slug.length; i += 1) {
    hash = (hash * 33 + breed.slug.charCodeAt(i)) >>> 0;
  }
  const start = rest.length === 0 ? 0 : hash % rest.length;
  const rotated = [...rest.slice(start), ...rest.slice(0, start)];
  const extras = rotated.slice(0, Math.max(0, extraLimit));

  return [...sameBreed, ...extras];
}

export function toMedicalGuideLink(entry: BreedConditionMeta) {
  return {
    href: getBreedConditionPath(entry),
    label: `${entry.condition} in ${entry.breed}s`,
    riskLevel: entry.riskLevel,
  };
}
