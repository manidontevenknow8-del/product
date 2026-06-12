import { isSupabaseConfigured } from '@/services/supabase/config';
import type { SpeciesKnowledgeRepository } from './speciesKnowledgeRepository';
import { mockSpeciesKnowledgeRepository } from './mockSpeciesKnowledgeRepository';
import { supabaseSpeciesKnowledgeRepository } from './supabaseSpeciesKnowledgeRepository';

export type { SpeciesKnowledgeRepository } from './speciesKnowledgeRepository';
export { mockSpeciesKnowledgeRepository, supabaseSpeciesKnowledgeRepository };

export { buildKnowledgeContextText, assembleKnowledgeContext } from './knowledgeContextBuilder';
export { resolveCareGuideline, buildKnowledgeContextFromParts } from './knowledgeRetrieval';
export { buildSearchCorpus, searchKnowledgeEntries } from './knowledgeSearch';

/**
 * Species Intelligence retrieval entry point.
 * Future AI pipelines call `retrieveKnowledgeContext` - no chatbot UI in V1.
 */
export function getSpeciesKnowledgeRepository(): SpeciesKnowledgeRepository {
  return isSupabaseConfigured()
    ? supabaseSpeciesKnowledgeRepository
    : mockSpeciesKnowledgeRepository;
}

/** Convenience wrapper for AI context injection */
export async function retrieveSpeciesKnowledge(
  speciesSlug: string,
  breedSlug?: string,
) {
  return getSpeciesKnowledgeRepository().retrieveKnowledgeContext({
    speciesSlug,
    breedSlug,
  });
}
