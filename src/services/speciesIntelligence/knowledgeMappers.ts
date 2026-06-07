import type {
  BreedRow,
  CareGuidelineRow,
  SpeciesRow,
} from '@/services/supabase/database.types';
import type {
  Breed,
  BreedSizeCategory,
  CareGuideline,
  CommonCondition,
  DietGuidance,
  ExerciseGuidance,
  LifespanGuidance,
  SeasonalConsideration,
  Species,
  VaccinationGuidance,
} from '@/types/speciesIntelligence';

function mapLifespan(raw: unknown): LifespanGuidance {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    minYears: Number(o.min_years ?? o.minYears ?? 0),
    maxYears: Number(o.max_years ?? o.maxYears ?? 0),
    unit: 'years',
    notes: (o.notes as string | null) ?? null,
  };
}

function mapDiet(raw: unknown): DietGuidance {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    summary: String(o.summary ?? ''),
    feedingFrequency: (o.feeding_frequency ?? o.feedingFrequency) as string | null,
    portions: (o.portions as string | null) ?? null,
    restrictions: (o.restrictions as string[] | null) ?? null,
    notes: (o.notes as string | null) ?? null,
  };
}

function mapExercise(raw: unknown): ExerciseGuidance {
  const o = (raw ?? {}) as Record<string, unknown>;
  const level = String(o.level ?? 'moderate') as ExerciseGuidance['level'];
  return {
    level: level === 'low' || level === 'high' ? level : 'moderate',
    minutesPerDay: o.minutes_per_day != null ? Number(o.minutes_per_day) : o.minutesPerDay != null ? Number(o.minutesPerDay) : null,
    activities: (o.activities as string[] | null) ?? null,
    notes: (o.notes as string | null) ?? null,
  };
}

function mapConditions(raw: unknown): CommonCondition[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item as Record<string, unknown>;
    return {
      name: String(o.name ?? ''),
      description: String(o.description ?? ''),
      prevalence: (o.prevalence as CommonCondition['prevalence']) ?? null,
    };
  });
}

function mapVaccination(raw: unknown): VaccinationGuidance {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    core: Array.isArray(o.core) ? o.core.map(String) : [],
    optional: Array.isArray(o.optional) ? o.optional.map(String) : null,
    scheduleNotes: (o.schedule_notes ?? o.scheduleNotes) as string | null,
    boosterNotes: (o.booster_notes ?? o.boosterNotes) as string | null,
  };
}

function mapSeasonal(raw: unknown): SeasonalConsideration[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item as Record<string, unknown>;
    return {
      season: String(o.season ?? 'year-round') as SeasonalConsideration['season'],
      title: String(o.title ?? ''),
      considerations: Array.isArray(o.considerations) ? o.considerations.map(String) : [],
    };
  });
}

export function mapSpeciesRow(row: SpeciesRow): Species {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBreedRow(row: BreedRow): Breed {
  return {
    id: row.id,
    speciesId: row.species_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    sizeCategory: row.size_category as BreedSizeCategory | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCareGuidelineRow(row: CareGuidelineRow): CareGuideline {
  return {
    id: row.id,
    speciesId: row.species_id,
    breedId: row.breed_id,
    lifespan: mapLifespan(row.lifespan),
    diet: mapDiet(row.diet),
    exerciseNeeds: mapExercise(row.exercise_needs),
    commonConditions: mapConditions(row.common_conditions),
    vaccinationGuidance: mapVaccination(row.vaccination_guidance),
    seasonalConsiderations: mapSeasonal(row.seasonal_considerations),
    source: row.source,
    version: row.version,
    status: row.status as CareGuideline['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
