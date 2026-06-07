import type {
  Breed,
  CareGuideline,
  KnowledgeRetrievalQuery,
  KnowledgeSearchQuery,
  Species,
  SpeciesKnowledgeContext,
  SpeciesKnowledgeSearchResult,
} from '@/types/speciesIntelligence';

/**
 * Species Intelligence retrieval contract — future AI features inject context via
 * `retrieveKnowledgeContext` without coupling to Supabase or mock storage.
 */
export interface SpeciesKnowledgeRepository {
  listSpecies(): Promise<Species[]>;
  getSpeciesBySlug(slug: string): Promise<Species | null>;

  listBreedsBySpeciesSlug(speciesSlug: string): Promise<Breed[]>;
  getBreed(speciesSlug: string, breedSlug: string): Promise<Breed | null>;

  getCareGuidelines(speciesSlug: string, breedSlug?: string): Promise<CareGuideline | null>;

  /** Primary AI-ready entry: species default with optional breed override */
  retrieveKnowledgeContext(query: KnowledgeRetrievalQuery): Promise<SpeciesKnowledgeContext | null>;

  /** Keyword search across names, conditions, diet — RAG/vector upgrade later */
  searchKnowledge(query: KnowledgeSearchQuery): Promise<SpeciesKnowledgeSearchResult[]>;
}
