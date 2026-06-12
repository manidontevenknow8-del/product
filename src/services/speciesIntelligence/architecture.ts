/**
 * Species Intelligence architecture (infrastructure only - no chatbot/companion UI)
 *
 * Data layer (Supabase):
 *   species → breeds → care_guidelines (JSONB care fields)
 *
 * Retrieval layer:
 *   getSpeciesKnowledgeRepository() → SpeciesKnowledgeRepository
 *
 * AI integration (future):
 *   const ctx = await retrieveSpeciesKnowledge('dog', 'labrador-retriever');
 *   // inject ctx.contextText into system prompt or RAG chunk
 *
 * Upgrades without breaking contract:
 *   - pgvector on care_guidelines for semantic search
 *   - Edge function `retrieve-species-knowledge` for server-side AI
 *   - Versioned guidelines (`version` column) with effective dates
 */

export const SPECIES_INTELLIGENCE_VERSION = '1.0.0';
