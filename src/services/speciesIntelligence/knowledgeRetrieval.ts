import type { Breed, CareGuideline, Species } from '@/types/speciesIntelligence';
import { assembleKnowledgeContext } from './knowledgeContextBuilder';
import type { SpeciesKnowledgeContext } from '@/types/speciesIntelligence';

export function resolveCareGuideline(
  speciesId: string,
  breedId: string | undefined,
  guidelines: CareGuideline[],
): CareGuideline | null {
  const published = guidelines.filter((g) => g.status === 'published');

  if (breedId) {
    const breedSpecific = published.find((g) => g.breedId === breedId);
    if (breedSpecific) return breedSpecific;
  }

  return published.find((g) => g.speciesId === speciesId && g.breedId === null) ?? null;
}

export function buildKnowledgeContextFromParts(
  species: Species,
  breeds: Breed[],
  guidelines: CareGuideline[],
  breedSlug?: string,
): SpeciesKnowledgeContext | null {
  const breed = breedSlug
    ? breeds.find((b) => b.slug === breedSlug && b.speciesId === species.id) ?? null
    : null;

  if (breedSlug && !breed) return null;

  const care = resolveCareGuideline(species.id, breed?.id, guidelines);
  if (!care) return null;

  return assembleKnowledgeContext(species, care, breed);
}
