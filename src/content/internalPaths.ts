/**
 * Resolves pillar-internal paths so RelatedLinks and cross-links hit real routes.
 */
import { listBreedHealthIndex } from '@/content/breedHealthPages';
import { listLoadedSymptomGuidePages } from '@/content/loadSymptomGuidePages';
import { emergencyGuidePages } from '@/content/loadEmergencyGuides';
import { listVaultPages } from '@/content/vaultPages';
import { listLifeLogisticsPaths, lifeLogisticsPages } from '@/content/loadLifeLogistics';
import { comparisons } from '@/content/loadContentData';
import { tools } from '@/content/loadContentData';
import vaccinationManifest from '@content-data/generated/vaccinations/_manifest.json';
import { pickRingNeighborsByKey } from '@/content/pickRingNeighbors';
import type { RelatedLinkItem } from '@/components/content';
import type { SymptomRecord } from '@content-types/symptom';
import type { SymptomGuidePageRecord } from '@content-types/symptom';

type VacManifest = {
  pages: { slug: string; path: string; kind: string; breedSlug: string | null }[];
};

const vacPages = (vaccinationManifest as VacManifest).pages;

const EMERGENCY_ALIAS: Record<string, string> = {
  'difficulty-breathing': 'choking',
  'urinary-blockage': 'cat-urinary-blockage',
  seizure: 'seizure',
  'bloat-gdv': 'bloat-gdv',
  'heatstroke': 'heatstroke',
  'hit-by-car': 'hit-by-car',
  'chocolate-toxicity': 'chocolate-toxicity',
  'eye-injury': 'eye-injury',
  choking: 'choking',
  'severe-bleeding': 'severe-bleeding',
  'insect-sting-anaphylaxis': 'insect-sting-anaphylaxis',
  'allergic-facial-swelling': 'allergic-facial-swelling',
};

/** Legacy short paths from early breed generators → real symptom guide paths. */
const LEGACY_SYMPTOM_PATH: Record<string, string> = {
  '/symptoms/limping-dog': '/symptoms/dog/limping-when-to-worry',
  '/symptoms/limping-cat': '/symptoms/cat/limping-when-to-worry',
  '/symptoms/lethargy-dog': '/symptoms/dog/lethargy-when-to-worry',
  '/symptoms/lethargy-cat': '/symptoms/cat/lethargy-when-to-worry',
  '/symptoms/vomiting-dog': '/symptoms/dog/vomiting-when-to-worry',
  '/symptoms/vomiting-cat': '/symptoms/cat/vomiting-when-to-worry',
  '/symptoms/difficulty-breathing-dog': '/symptoms/dog/difficulty-breathing-when-to-worry',
  '/symptoms/difficulty-breathing-cat': '/symptoms/cat/difficulty-breathing-when-to-worry',
  '/symptoms/dental-pain-dog': '/symptoms/dog/dental-pain-when-to-worry',
  '/symptoms/dental-pain-cat': '/symptoms/cat/dental-pain-when-to-worry',
  '/symptoms/weight-gain-dog': '/symptoms/dog/weight-gain-when-to-worry',
  '/symptoms/weight-gain-cat': '/symptoms/cat/weight-gain-when-to-worry',
  '/symptoms/weight-loss-dog': '/symptoms/dog/weight-loss-when-to-worry',
  '/symptoms/weight-loss-cat': '/symptoms/cat/weight-loss-when-to-worry',
  '/symptoms/ear-scratching-dog': '/symptoms/dog/ear-scratching-when-to-worry',
  '/symptoms/ear-scratching-cat': '/symptoms/cat/ear-scratching-when-to-worry',
  '/symptoms/itching-dog': '/symptoms/dog/itching-when-to-worry',
  '/symptoms/itching-cat': '/symptoms/cat/itching-when-to-worry',
  '/symptoms/excessive-thirst-dog': '/symptoms/dog/excessive-thirst-when-to-worry',
  '/symptoms/excessive-thirst-cat': '/symptoms/cat/excessive-thirst-when-to-worry',
  '/symptoms/straining-to-urinate-dog': '/symptoms/dog/straining-to-urinate-when-to-worry',
  '/symptoms/straining-to-urinate-cat': '/symptoms/cat/straining-to-urinate-when-to-worry',
  '/symptoms/red-eyes-dog': '/symptoms/dog/red-eyes-when-to-worry',
  '/symptoms/red-eyes-cat': '/symptoms/cat/red-eyes-when-to-worry',
  '/symptoms/seizures-dog': '/symptoms/dog/seizures-when-to-worry',
  '/symptoms/seizures-cat': '/symptoms/cat/seizures-when-to-worry',
  '/symptoms/lumps-bumps-dog': '/symptoms/dog/lumps-bumps-when-to-worry',
  '/symptoms/lumps-bumps-cat': '/symptoms/cat/lumps-bumps-when-to-worry',
};

let cachedPaths: Set<string> | null = null;

export function listAllPillarPaths(): string[] {
  const paths = new Set<string>();

  paths.add('/breeds');
  paths.add('/symptoms');
  paths.add('/vaccinations');
  paths.add('/emergency');
  paths.add('/vault');
  paths.add('/life-logistics');
  paths.add('/compare');
  paths.add('/tools');

  for (const e of listBreedHealthIndex()) paths.add(e.path);
  for (const p of listLoadedSymptomGuidePages()) paths.add(p.path);
  for (const p of vacPages) paths.add(p.path);
  for (const p of emergencyGuidePages) paths.add(`/emergency/${p.slug}`);
  for (const p of listVaultPages()) paths.add(`/guides/${p.slug}`);
  for (const p of listLifeLogisticsPaths()) paths.add(p);
  for (const c of comparisons) {
    paths.add(`/compare/petclues-vs-${c.slug}`);
    paths.add(`/compare/${c.slug}`);
  }
  for (const t of tools) paths.add(`/tools/${t.slug}`);

  return [...paths];
}

export function getKnownPathSet(): Set<string> {
  if (!cachedPaths) cachedPaths = new Set(listAllPillarPaths());
  return cachedPaths;
}

export function pathExists(path: string): boolean {
  return getKnownPathSet().has(path);
}

export function resolveSymptomHref(href: string): string | null {
  if (LEGACY_SYMPTOM_PATH[href]) {
    const mapped = LEGACY_SYMPTOM_PATH[href];
    return pathExists(mapped) ? mapped : null;
  }
  if (pathExists(href)) return href;

  // /symptoms/{species}/{slug} already
  const m = href.match(/^\/symptoms\/(dog|cat)\/([a-z0-9-]+)$/);
  if (m) {
    const candidate = href.endsWith('-when-to-worry') ? href : `${href}-when-to-worry`;
    if (pathExists(candidate)) return candidate;
  }

  // /symptoms/{legacy-slug}
  const short = href.match(/^\/symptoms\/([a-z0-9-]+)$/);
  if (short) {
    const slug = short[1];
    if (slug.endsWith('-dog')) {
      const base = slug.replace(/-dog$/, '');
      const candidate = `/symptoms/dog/${base}-when-to-worry`;
      if (pathExists(candidate)) return candidate;
    }
    if (slug.endsWith('-cat')) {
      const base = slug.replace(/-cat$/, '');
      const candidate = `/symptoms/cat/${base}-when-to-worry`;
      if (pathExists(candidate)) return candidate;
    }
  }
  return pathExists(href) ? href : null;
}

export function resolveEmergencyHref(coreOrSlug: string | undefined | null): string | null {
  if (!coreOrSlug) return null;
  const exact = emergencyGuidePages.find((p) => p.slug === coreOrSlug);
  if (exact) return `/emergency/${exact.slug}`;

  const aliased = EMERGENCY_ALIAS[coreOrSlug] ?? coreOrSlug;
  const byCore = emergencyGuidePages.find((p) => p.core_slug === aliased);
  if (byCore) return `/emergency/${byCore.slug}`;

  const fuzzy = emergencyGuidePages.find(
    (p) => p.slug.includes(coreOrSlug) || p.core_slug.includes(coreOrSlug),
  );
  return fuzzy ? `/emergency/${fuzzy.slug}` : null;
}

export function resolveBreedHealthHref(breedSlug: string, stage = 'adult'): string | null {
  const path = `/breeds/${breedSlug}/${stage}-health-guide`;
  return pathExists(path) ? path : null;
}

export function resolveIssueLinks(
  links: { issue: string; href: string }[],
): { issue: string; href: string }[] {
  const out: { issue: string; href: string }[] = [];
  const seen = new Set<string>();
  for (const link of links) {
    const href = resolveSymptomHref(link.href);
    if (!href || seen.has(href)) continue;
    seen.add(href);
    out.push({ issue: link.issue, href });
  }
  return out;
}

/** RelatedLinks for symptom pages: peer symptoms + breeds + emergency when applicable. */
export function buildSymptomCrossPillarRelated(
  symptom: SymptomRecord,
  page?: SymptomGuidePageRecord,
  limit = 6,
): RelatedLinkItem[] {
  const items: RelatedLinkItem[] = [];
  const species = page?.species ?? (symptom.species === 'both' ? 'dog' : symptom.species);
  const urgency = page?.urgency_level ?? symptom.urgency_level;
  const currentPath = page?.path;

  const speciesPool = listLoadedSymptomGuidePages()
    .filter((p) => p.species === species)
    .sort((a, b) => {
      const aU = a.urgency_level === urgency ? 0 : 1;
      const bU = b.urgency_level === urgency ? 0 : 1;
      return aU - bU || a.path.localeCompare(b.path);
    });

  const currentKey = currentPath ?? `synthetic:${symptom.slug}:${species}`;
  const peerPages = pickRingNeighborsByKey(
    speciesPool,
    (p) => p.path,
    currentKey,
    Math.min(3, limit),
  );

  items.push(
    ...peerPages.map((p) => ({
      href: p.path,
      label: p.h1,
      description: `${p.urgency_level} · ${p.species}`,
    })),
  );

  const breedSlugs =
    page?.related_breed_predispositions?.length
      ? page.related_breed_predispositions
      : symptom.related_breed_predispositions;

  for (const slug of breedSlugs.slice(0, 2)) {
    const href = resolveBreedHealthHref(slug, 'adult');
    if (!href) continue;
    items.push({
      href,
      label: `${slug.replace(/-/g, ' ')} adult health guide`,
      description: 'Breed × life-stage guide',
    });
  }

  if (urgency === 'emergency') {
    const emHref = resolveEmergencyHref(
      page?.related_emergency_slug || symptom.related_emergency_slug,
    );
    if (emHref) {
      items.push({
        href: emHref,
        label: 'Related emergency guide',
        description: 'First actions and when to call the ER',
      });
    }
  }

  return items.slice(0, limit);
}

export function buildVaccinationRelated(
  breedSlug: string | null | undefined,
  currentPath: string,
  limit = 5,
): RelatedLinkItem[] {
  const items: RelatedLinkItem[] = [];
  if (breedSlug) {
    const health = resolveBreedHealthHref(breedSlug, 'adult');
    if (health) {
      items.push({
        href: health,
        label: 'Matching breed health guide',
        description: 'Life-stage care context for this breed',
      });
    }
    const puppy =
      resolveBreedHealthHref(breedSlug, 'puppy') || resolveBreedHealthHref(breedSlug, 'kitten');
    if (puppy) {
      items.push({
        href: puppy,
        label: 'Growth-stage health guide',
        description: 'Puppy/kitten companion to the vaccine series',
      });
    }
  }

  const pool = vacPages
    .filter((p) => (breedSlug ? p.kind === 'breed' : p.kind === 'general'))
    .sort((a, b) => a.path.localeCompare(b.path));
  const peerVac = pickRingNeighborsByKey(
    pool,
    (p) => p.path,
    currentPath,
    Math.max(0, limit - items.length),
  ).map((p) => ({
    href: p.path,
    label: p.slug.replace(/-/g, ' '),
    description: p.kind === 'breed' ? 'Breed vaccine schedule' : 'General schedule',
  }));

  return [...items, ...peerVac].slice(0, limit);
}

export function pillarHubSummary() {
  return {
    breeds: listBreedHealthIndex().length,
    symptoms: listLoadedSymptomGuidePages().length,
    vaccinations: vacPages.length,
    emergencies: emergencyGuidePages.length,
    vault: listVaultPages().length,
    lifeLogistics: lifeLogisticsPages.length,
    comparisons: comparisons.length,
    tools: tools.length,
  };
}
