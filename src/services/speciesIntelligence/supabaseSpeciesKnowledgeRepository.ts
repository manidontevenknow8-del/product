import { getSupabaseClient } from '@/services/supabase/client';
import type {
  BreedRow,
  CareGuidelineRow,
  SpeciesRow,
} from '@/services/supabase/database.types';
import type {
  KnowledgeRetrievalQuery,
  KnowledgeSearchQuery,
  SpeciesKnowledgeContext,
  SpeciesKnowledgeSearchResult,
} from '@/types/speciesIntelligence';
import type { SpeciesKnowledgeRepository } from './speciesKnowledgeRepository';
import { mapBreedRow, mapCareGuidelineRow, mapSpeciesRow } from './knowledgeMappers';
import { buildKnowledgeContextFromParts, resolveCareGuideline } from './knowledgeRetrieval';
import { buildSearchCorpus, searchKnowledgeEntries } from './knowledgeSearch';

async function fetchAllPublishedGuidelines() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('care_guidelines')
    .select('*')
    .eq('status', 'published');

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapCareGuidelineRow(row as CareGuidelineRow));
}

export const supabaseSpeciesKnowledgeRepository: SpeciesKnowledgeRepository = {
  async listSpecies() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('species').select('*').order('name');
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapSpeciesRow(row as SpeciesRow));
  },

  async getSpeciesBySlug(slug) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('species').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSpeciesRow(data as SpeciesRow) : null;
  },

  async listBreedsBySpeciesSlug(speciesSlug) {
    const species = await this.getSpeciesBySlug(speciesSlug);
    if (!species) return [];

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('breeds')
      .select('*')
      .eq('species_id', species.id)
      .order('name');

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapBreedRow(row as BreedRow));
  },

  async getBreed(speciesSlug, breedSlug) {
    const species = await this.getSpeciesBySlug(speciesSlug);
    if (!species) return null;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('breeds')
      .select('*')
      .eq('species_id', species.id)
      .eq('slug', breedSlug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapBreedRow(data as BreedRow) : null;
  },

  async getCareGuidelines(speciesSlug, breedSlug) {
    const species = await this.getSpeciesBySlug(speciesSlug);
    if (!species) return null;
    const breed = breedSlug ? await this.getBreed(speciesSlug, breedSlug) : null;
    if (breedSlug && !breed) return null;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('care_guidelines')
      .select('*')
      .eq('species_id', species.id)
      .eq('status', 'published');

    if (error) throw new Error(error.message);
    const guidelines = (data ?? []).map((row) => mapCareGuidelineRow(row as CareGuidelineRow));
    return resolveCareGuideline(species.id, breed?.id, guidelines);
  },

  async retrieveKnowledgeContext(query: KnowledgeRetrievalQuery): Promise<SpeciesKnowledgeContext | null> {
    const species = await this.getSpeciesBySlug(query.speciesSlug);
    if (!species) return null;
    const breeds = await this.listBreedsBySpeciesSlug(query.speciesSlug);
    const guidelines = await fetchAllPublishedGuidelines();
    const speciesGuidelines = guidelines.filter((g) => g.speciesId === species.id);

    return buildKnowledgeContextFromParts(
      species,
      breeds,
      speciesGuidelines,
      query.breedSlug,
    );
  },

  async searchKnowledge({ query, speciesSlug, limit }: KnowledgeSearchQuery): Promise<SpeciesKnowledgeSearchResult[]> {
    const [speciesList, guidelines] = await Promise.all([
      this.listSpecies(),
      fetchAllPublishedGuidelines(),
    ]);

    const breedsBySpecies = await Promise.all(
      speciesList.map(async (s) => ({
        species: s,
        breeds: await this.listBreedsBySpeciesSlug(s.slug),
      })),
    );

    const breedLookup = new Map<string, (typeof breedsBySpecies)[0]['breeds'][0]>();
    for (const { breeds } of breedsBySpecies) {
      for (const b of breeds) breedLookup.set(b.id, b);
    }

    const entries = guidelines.map((care) => {
      const species = speciesList.find((s) => s.id === care.speciesId)!;
      const breed = care.breedId ? breedLookup.get(care.breedId) ?? null : null;
      return {
        species,
        breed,
        care,
        corpus: buildSearchCorpus(species, breed, care),
      };
    });

    return searchKnowledgeEntries(entries, query, speciesSlug, limit ?? 10);
  },
};
