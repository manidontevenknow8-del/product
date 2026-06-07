import type {
  Breed,
  CareGuideline,
  Species,
  SpeciesKnowledgeContext,
} from '@/types/speciesIntelligence';

function section(title: string, lines: string[]): string {
  const body = lines.filter(Boolean).join('\n');
  return body ? `## ${title}\n${body}` : '';
}

export function buildKnowledgeContextText(
  species: Species,
  care: CareGuideline,
  breed: Breed | null,
): string {
  const scopeLabel = breed ? `${breed.name} (${species.name})` : species.name;
  const parts: string[] = [
    `# PetClues Species Knowledge: ${scopeLabel}`,
    species.description ? `_${species.description}_` : '',
    '',
    section('Lifespan', [
      `Typical range: ${care.lifespan.minYears}–${care.lifespan.maxYears} years`,
      care.lifespan.notes ?? '',
    ]),
    section('Diet', [
      care.diet.summary,
      care.diet.feedingFrequency ? `Feeding: ${care.diet.feedingFrequency}` : '',
      care.diet.portions ? `Portions: ${care.diet.portions}` : '',
      care.diet.restrictions?.length
        ? `Avoid: ${care.diet.restrictions.join(', ')}`
        : '',
      care.diet.notes ?? '',
    ]),
    section('Exercise needs', [
      `Level: ${care.exerciseNeeds.level}`,
      care.exerciseNeeds.minutesPerDay != null
        ? `Target: ~${care.exerciseNeeds.minutesPerDay} minutes/day`
        : '',
      care.exerciseNeeds.activities?.length
        ? `Activities: ${care.exerciseNeeds.activities.join(', ')}`
        : '',
      care.exerciseNeeds.notes ?? '',
    ]),
    section('Common conditions', care.commonConditions.map(
      (c) =>
        `- **${c.name}** (${c.prevalence ?? 'unspecified'}): ${c.description}`,
    )),
    section('Vaccination guidance', [
      care.vaccinationGuidance.core.length
        ? `Core: ${care.vaccinationGuidance.core.join(', ')}`
        : 'Core: consult species-specific vet protocol',
      care.vaccinationGuidance.optional?.length
        ? `Optional: ${care.vaccinationGuidance.optional.join(', ')}`
        : '',
      care.vaccinationGuidance.scheduleNotes ?? '',
      care.vaccinationGuidance.boosterNotes ?? '',
    ]),
    section('Seasonal considerations', care.seasonalConsiderations.flatMap((s) => [
      `### ${s.title} (${s.season})`,
      ...s.considerations.map((c) => `- ${c}`),
    ])),
    care.source ? `_Source: ${care.source} (v${care.version})_` : '',
  ];

  return parts.filter((p) => p !== '').join('\n\n').trim();
}

export function assembleKnowledgeContext(
  species: Species,
  care: CareGuideline,
  breed: Breed | null,
): SpeciesKnowledgeContext {
  const scope = breed ? 'breed' : 'species';
  return {
    species,
    breed,
    care,
    scope,
    retrievedAt: new Date().toISOString(),
    contextText: buildKnowledgeContextText(species, care, breed),
  };
}
