import type { RelatedLinkItem } from '@/components/content';
import type { BreedRecord } from '@content-types/breed';
import type { SymptomRecord, SymptomGuidePageRecord } from '@content-types/symptom';
import type { ComparisonRecord } from '@content-types/comparison';
import type { LifeStageRecord } from '@content-types/life-stage';
import type { ToolRecord } from '@content-types/tool';
import { breeds, comparisons, lifeStages, tools } from '@/content/loadContentData';
import { listBreedHealthIndex } from '@/content/breedHealthPages';
import { listLoadedSymptomGuidePages } from '@/content/loadSymptomGuidePages';
import { emergencyGuidePages } from '@/content/loadEmergencyGuides';
import { listVaultPages, getVaultRelatedPages } from '@/content/vaultPages';
import {
  lifeLogisticsPages,
} from '@/content/loadLifeLogistics';
import {
  buildSymptomCrossPillarRelated,
  buildVaccinationRelated,
  pathExists,
  resolveBreedHealthHref,
  resolveEmergencyHref,
  resolveSymptomHref,
} from '@/content/internalPaths';
import { pickRingNeighborsByKey } from '@/content/pickRingNeighbors';

function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function emergencySpeciesHint(slug: string, coreSlug: string): 'dog' | 'cat' | 'both' {
  const hay = `${slug} ${coreSlug}`;
  if (/\bcat\b|feline|kitten/.test(hay)) return 'cat';
  if (/\bdog\b|canine|puppy/.test(hay)) return 'dog';
  return 'both';
}

export function filterValidRelated(items: RelatedLinkItem[]): RelatedLinkItem[] {
  const seen = new Set<string>();
  const out: RelatedLinkItem[] = [];
  for (const item of items) {
    if (!item.href || seen.has(item.href) || !pathExists(item.href)) continue;
    seen.add(item.href);
    out.push(item);
  }
  return out;
}

/** Peer breeds → production adult health guides. */
export function getRelatedBreeds(breed: BreedRecord, limit = 5): RelatedLinkItem[] {
  const peers = pickRingNeighborsByKey(
    breeds.filter((b) => b.species === breed.species),
    (b) => b.slug,
    breed.slug,
    limit,
  );
  return filterValidRelated(
    peers.map((b) => {
      const href = resolveBreedHealthHref(b.slug, 'adult');
      return href
        ? {
            href,
            label: `${b.name} health guide`,
            description: `${b.size_category} ${b.species} · ${b.avg_weight_range}`,
          }
        : { href: '', label: '' };
    }),
  );
}

/** Other life-stage guides for the same breed. */
export function getRelatedLifeStages(
  breed: BreedRecord,
  currentStage: LifeStageRecord | string,
  limit = 4,
): RelatedLinkItem[] {
  const currentSlug = typeof currentStage === 'string' ? currentStage : currentStage.stage;
  const stages = listBreedHealthIndex()
    .filter((e) => e.breedSlug === breed.slug && e.stage !== currentSlug)
    .slice(0, limit);

  return filterValidRelated(
    stages.map((e) => {
      const meta = lifeStages.find((s) => s.stage === e.stage && s.species === breed.species);
      return {
        href: e.path,
        label: `${breed.name} ${meta?.name ?? e.stage} guide`,
        description: meta?.typical_age_range ?? e.stage,
      };
    }),
  );
}

/** Breed health issues → real symptom guide paths. */
export function getRelatedSymptomsForBreed(breed: BreedRecord, limit = 4): RelatedLinkItem[] {
  const speciesPages = listLoadedSymptomGuidePages().filter((p) => p.species === breed.species);
  const out: RelatedLinkItem[] = [];

  for (const issue of breed.common_health_issues) {
    if (out.length >= limit) break;
    const base = issue
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const candidates = [
      `/symptoms/${breed.species}/${base}-when-to-worry`,
      ...speciesPages
        .filter(
          (p) =>
            p.symptomSlug.includes(base.slice(0, 12)) ||
            base.includes(p.symptomSlug.slice(0, 12)),
        )
        .map((p) => p.path),
    ];
    for (const c of candidates) {
      const href = resolveSymptomHref(c);
      if (href && !out.some((o) => o.href === href)) {
        out.push({
          href,
          label: `${issue} when to worry`,
          description: `${breed.species} symptom guide`,
        });
        break;
      }
    }
  }

  if (out.length < 2) {
    const fillers = pickRingNeighborsByKey(
      speciesPages,
      (p) => p.path,
      `breed:${breed.slug}`,
      limit,
    );
    for (const p of fillers) {
      if (out.length >= limit) break;
      if (out.some((o) => o.href === p.path)) continue;
      out.push({
        href: p.path,
        label: p.h1,
        description: `${p.urgency_level} · ${p.species}`,
      });
    }
  }

  return filterValidRelated(out).slice(0, limit);
}

/** Full RelatedLinks block for breed × life-stage pages. */
export function getBreedHealthRelated(
  breed: BreedRecord,
  lifeStage: LifeStageRecord,
  limit = 8,
): RelatedLinkItem[] {
  return filterValidRelated([
    ...getRelatedLifeStages(breed, lifeStage, 3),
    ...getRelatedSymptomsForBreed(breed, 3),
    ...getRelatedBreeds(breed, 3),
  ]).slice(0, limit);
}

export function getRelatedSymptoms(symptom: SymptomRecord, limit = 5): RelatedLinkItem[] {
  return buildSymptomCrossPillarRelated(symptom, undefined, limit);
}

export function getSymptomGuideRelated(
  symptom: SymptomRecord,
  page?: SymptomGuidePageRecord,
  limit = 6,
): RelatedLinkItem[] {
  return filterValidRelated(buildSymptomCrossPillarRelated(symptom, page, limit));
}

export function getRelatedBreedsForSymptom(
  symptom: SymptomRecord,
  limit = 4,
): RelatedLinkItem[] {
  return filterValidRelated(
    symptom.related_breed_predispositions.slice(0, limit).map((slug) => {
      const href = resolveBreedHealthHref(slug, 'adult');
      const breed = breeds.find((b) => b.slug === slug);
      return href
        ? {
            href,
            label: `${breed?.name ?? titleCase(slug)} adult health guide`,
            description: 'Breed predisposition context',
          }
        : { href: '', label: '' };
    }),
  );
}

export function getRelatedEmergencies(symptom: SymptomRecord, limit = 3): RelatedLinkItem[] {
  if (symptom.urgency_level !== 'emergency' && !symptom.related_emergency_slug) {
    return [];
  }
  const items: RelatedLinkItem[] = [];
  const primary = resolveEmergencyHref(symptom.related_emergency_slug);
  if (primary) {
    const page = emergencyGuidePages.find((p) => `/emergency/${p.slug}` === primary);
    items.push({
      href: primary,
      label: page?.h1 ?? 'Emergency first-aid guide',
      description: 'What to do before you reach care',
    });
  }
  const pool = emergencyGuidePages.filter((p) => {
    const hint = emergencySpeciesHint(p.slug, p.core_slug);
    if (hint === 'both' || symptom.species === 'both') return true;
    return hint === symptom.species;
  });
  const peers = pickRingNeighborsByKey(
    pool,
    (p) => p.slug,
    symptom.related_emergency_slug || symptom.slug,
    limit,
  );
  for (const p of peers) {
    if (items.length >= limit) break;
    const href = `/emergency/${p.slug}`;
    if (items.some((i) => i.href === href)) continue;
    items.push({
      href,
      label: p.h1,
      description: `${emergencySpeciesHint(p.slug, p.core_slug)} emergency`,
    });
  }
  return filterValidRelated(items).slice(0, limit);
}

export function getRelatedVaccineBreeds(breed: BreedRecord, limit = 5): RelatedLinkItem[] {
  return filterValidRelated(
    buildVaccinationRelated(breed.slug, `/vaccinations/${breed.slug}-vaccine-schedule`, limit),
  );
}

export function getVaccinationScheduleRelated(
  breedSlug: string | null | undefined,
  currentPath: string,
  limit = 5,
): RelatedLinkItem[] {
  return filterValidRelated(buildVaccinationRelated(breedSlug, currentPath, limit));
}

export function getRelatedEmergencyPages(
  currentSlug: string,
  coreSlug: string,
  limit = 5,
): RelatedLinkItem[] {
  const sameCore = emergencyGuidePages
    .filter((p) => p.core_slug === coreSlug)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const fromCore = pickRingNeighborsByKey(sameCore, (p) => p.slug, currentSlug, limit);
  const need = limit - fromCore.length;
  const fromAll =
    need > 0
      ? pickRingNeighborsByKey(
          emergencyGuidePages,
          (p) => p.slug,
          currentSlug,
          need + fromCore.length,
        ).filter((p) => !fromCore.some((c) => c.slug === p.slug))
      : [];
  return filterValidRelated(
    [...fromCore, ...fromAll].slice(0, limit).map((p) => ({
      href: `/emergency/${p.slug}`,
      label: p.h1,
      description: `${emergencySpeciesHint(p.slug, p.core_slug)} · ${p.core_slug}`,
    })),
  );
}

export function getRelatedComparisons(
  competitor: ComparisonRecord,
  limit = 5,
): RelatedLinkItem[] {
  const peers = pickRingNeighborsByKey(comparisons, (c) => c.slug, competitor.slug, limit);
  return filterValidRelated(
    peers.map((c) => ({
      href: `/compare/petclues-vs-${c.slug}`,
      label: `PetClues vs ${c.name}`,
      description: c.category.replace(/-/g, ' '),
    })),
  );
}

export function getVaultRelatedLinks(limit = 5): RelatedLinkItem[] {
  return filterValidRelated(
    pickRingNeighborsByKey(listVaultPages(), (p) => p.slug, 'hub', limit).map((p) => ({
      href: `/guides/${p.slug}`,
      label: p.h1,
      description: p.cluster,
    })),
  );
}

export function getVaultRelatedLinksForPage(
  slug: string,
  cluster: string,
  limit = 5,
): RelatedLinkItem[] {
  const page = listVaultPages().find((p) => p.slug === slug);
  if (page) {
    return filterValidRelated(
      getVaultRelatedPages(page, limit).map((p) => ({
        href: `/guides/${p.slug}`,
        label: p.h1,
        description: p.cluster,
      })),
    );
  }
  const same = listVaultPages().filter((p) => p.cluster === cluster);
  return filterValidRelated(
    pickRingNeighborsByKey(same.length ? same : listVaultPages(), (p) => p.slug, slug, limit).map(
      (p) => ({
        href: `/guides/${p.slug}`,
        label: p.h1,
        description: p.cluster,
      }),
    ),
  );
}

export function getLogisticsRelatedLinks(limit = 5): RelatedLinkItem[] {
  return filterValidRelated(
    pickRingNeighborsByKey(lifeLogisticsPages, (p) => p.slug, 'hub', limit).map((p) => ({
      href: `/guides/${p.slug}`,
      label: p.h1,
      description: p.cluster,
    })),
  );
}

export function getLogisticsRelatedLinksForPage(
  slug: string,
  cluster: string,
  limit = 5,
): RelatedLinkItem[] {
  const fromSame = pickRingNeighborsByKey(
    lifeLogisticsPages.filter((p) => p.cluster === cluster),
    (p) => p.slug,
    slug,
    limit,
  );
  const need = limit - fromSame.length;
  const fromOthers =
    need > 0
      ? pickRingNeighborsByKey(
          lifeLogisticsPages.filter((p) => p.cluster !== cluster),
          (p) => p.slug,
          slug,
          need,
        )
      : [];
  return filterValidRelated(
    [...fromSame, ...fromOthers].slice(0, limit).map((p) => ({
      href: `/guides/${p.slug}`,
      label: p.h1,
      description: p.cluster,
    })),
  );
}

export function getToolRelatedLinks(tool?: ToolRecord, limit = 5): RelatedLinkItem[] {
  if (!tool) {
    return filterValidRelated(
      pickRingNeighborsByKey(tools, (t) => t.slug, 'hub', limit).map((t) => ({
        href: `/tools/${t.slug}`,
        label: t.h1,
        description: t.family,
      })),
    );
  }
  const sameFamily = tools.filter((t) => t.family === tool.family);
  const fromFamily = pickRingNeighborsByKey(sameFamily, (t) => t.slug, tool.slug, limit);
  const need = limit - fromFamily.length;
  const fromOthers =
    need > 0
      ? pickRingNeighborsByKey(
          tools.filter((t) => t.family !== tool.family),
          (t) => t.slug,
          tool.slug,
          need,
        )
      : [];
  return filterValidRelated(
    [...fromFamily, ...fromOthers].slice(0, limit).map((t) => ({
      href: `/tools/${t.slug}`,
      label: t.h1,
      description: t.family,
    })),
  );
}

export function getPillarHubLinks(): RelatedLinkItem[] {
  return [
    { href: '/breeds', label: 'Breed health guides', description: 'Species × size × life-stage' },
    { href: '/symptoms', label: 'Symptom guides', description: 'Grouped by urgency' },
    { href: '/vaccinations', label: 'Vaccination schedules', description: 'Breed + general' },
    { href: '/emergency', label: 'Emergency guides', description: 'First-aid by scenario' },
    { href: '/vault', label: 'Records vault guides', description: 'By document cluster' },
    { href: '/life-logistics', label: 'Life logistics guides', description: 'Sitters, travel, moves' },
    { href: '/compare', label: 'Comparisons', description: 'PetClues vs alternatives' },
    { href: '/tools', label: 'Printable tools', description: 'Checklists and templates' },
  ];
}

export { resolveSymptomHref, resolveEmergencyHref, resolveBreedHealthHref };
