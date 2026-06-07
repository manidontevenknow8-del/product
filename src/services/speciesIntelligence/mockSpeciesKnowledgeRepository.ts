import type { KnowledgeRetrievalQuery, KnowledgeSearchQuery } from '@/types/speciesIntelligence';
import type { SpeciesKnowledgeRepository } from './speciesKnowledgeRepository';
import { MOCK_BREEDS, MOCK_CARE_GUIDELINES, MOCK_SPECIES } from './mockSpeciesData';
import { buildKnowledgeContextFromParts, resolveCareGuideline } from './knowledgeRetrieval';
import { buildSearchCorpus, searchKnowledgeEntries } from './knowledgeSearch';

function getSearchableEntries() {
  return MOCK_CARE_GUIDELINES.filter((g) => g.status === 'published').map((care) => {
    const species = MOCK_SPECIES.find((s) => s.id === care.speciesId)!;
    const breed = care.breedId ? MOCK_BREEDS.find((b) => b.id === care.breedId) ?? null : null;
    return {
      species,
      breed,
      care,
      corpus: buildSearchCorpus(species, breed, care),
    };
  });
}

export const mockSpeciesKnowledgeRepository: SpeciesKnowledgeRepository = {
  async listSpecies() {
    return [...MOCK_SPECIES];
  },

  async getSpeciesBySlug(slug) {
    return MOCK_SPECIES.find((s) => s.slug === slug) ?? null;
  },

  async listBreedsBySpeciesSlug(speciesSlug) {
    const species = MOCK_SPECIES.find((s) => s.slug === speciesSlug);
    if (!species) return [];
    return MOCK_BREEDS.filter((b) => b.speciesId === species.id);
  },

  async getBreed(speciesSlug, breedSlug) {
    const species = MOCK_SPECIES.find((s) => s.slug === speciesSlug);
    if (!species) return null;
    return MOCK_BREEDS.find((b) => b.speciesId === species.id && b.slug === breedSlug) ?? null;
  },

  async getCareGuidelines(speciesSlug, breedSlug) {
    const species = await this.getSpeciesBySlug(speciesSlug);
    if (!species) return null;
    const breed = breedSlug ? await this.getBreed(speciesSlug, breedSlug) : null;
    if (breedSlug && !breed) return null;
    return resolveCareGuideline(species.id, breed?.id, MOCK_CARE_GUIDELINES);
  },

  async retrieveKnowledgeContext(query: KnowledgeRetrievalQuery) {
    const species = await this.getSpeciesBySlug(query.speciesSlug);
    if (!species) return null;
    const breeds = await this.listBreedsBySpeciesSlug(query.speciesSlug);
    return buildKnowledgeContextFromParts(
      species,
      breeds,
      MOCK_CARE_GUIDELINES,
      query.breedSlug,
    );
  },

  async searchKnowledge({ query, speciesSlug, limit }: KnowledgeSearchQuery) {
    return searchKnowledgeEntries(getSearchableEntries(), query, speciesSlug, limit ?? 10);
  },
};
