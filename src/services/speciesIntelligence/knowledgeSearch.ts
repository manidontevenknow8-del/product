import type {
  Breed,
  CareGuideline,
  Species,
  SpeciesKnowledgeSearchResult,
} from '@/types/speciesIntelligence';

type SearchableEntry = {
  species: Species;
  breed: Breed | null;
  care: CareGuideline;
  corpus: string;
};

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

export function scoreKnowledgeMatch(corpus: string, terms: string[]): { score: number; matched: string[] } {
  const lower = corpus.toLowerCase();
  const matched: string[] = [];
  let score = 0;

  for (const term of terms) {
    if (lower.includes(term)) {
      matched.push(term);
      score += term.length > 4 ? 2 : 1;
    }
  }

  return { score, matched };
}

export function buildSearchCorpus(species: Species, breed: Breed | null, care: CareGuideline): string {
  return [
    species.name,
    species.slug,
    species.description,
    breed?.name,
    breed?.slug,
    breed?.description,
    care.diet.summary,
    care.diet.notes,
    care.exerciseNeeds.notes,
    ...care.commonConditions.map((c) => `${c.name} ${c.description}`),
    ...care.vaccinationGuidance.core,
    ...(care.vaccinationGuidance.optional ?? []),
    care.vaccinationGuidance.scheduleNotes,
    ...care.seasonalConsiderations.flatMap((s) => [s.title, ...s.considerations]),
  ]
    .filter(Boolean)
    .join(' ');
}

export function searchKnowledgeEntries(
  entries: SearchableEntry[],
  query: string,
  speciesSlug?: string,
  limit = 10,
): SpeciesKnowledgeSearchResult[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const filtered = speciesSlug
    ? entries.filter((e) => e.species.slug === speciesSlug)
    : entries;

  const results: SpeciesKnowledgeSearchResult[] = [];

  for (const entry of filtered) {
    const { score, matched } = scoreKnowledgeMatch(entry.corpus, terms);
    if (score > 0) {
      results.push({
        species: entry.species,
        breed: entry.breed,
        care: entry.care,
        matchedTerms: matched,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
