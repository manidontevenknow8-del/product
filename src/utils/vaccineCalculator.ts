/**
 * Deterministic puppy/kitten immunization schedule calculator.
 * Educational planning aid - not a substitute for veterinary advice.
 */

export type VaccineSpecies = 'dog' | 'cat';
export type BreedSize = 'small' | 'medium' | 'large';
export type LifestyleRisk = 'indoor' | 'social' | 'international';

export type VaccineCategory = 'core' | 'non-core';

export type VaccineUrgency = 'overdue' | 'due_soon' | 'upcoming';

export type VaccineScheduleInput = {
  species: VaccineSpecies;
  dateOfBirth: string; // YYYY-MM-DD
  breedSize: BreedSize;
  lifestyle: LifestyleRisk;
  /** Optional as-of date for status tags (defaults to today). */
  asOfDate?: string;
};

export type VaccineScheduleItem = {
  id: string;
  vaccineName: string;
  category: VaccineCategory;
  /** ISO date YYYY-MM-DD */
  dueDate: string;
  /** Human milestone label, e.g. "8-week core" */
  milestone: string;
  notes: string;
  status: VaccineUrgency;
  daysUntilDue: number;
};

export type VaccineScheduleResult = {
  input: VaccineScheduleInput;
  items: VaccineScheduleItem[];
  summary: {
    coreCount: number;
    nonCoreCount: number;
    overdueCount: number;
    dueSoonCount: number;
  };
};

const MS_PER_DAY = 86_400_000;
const DUE_SOON_WINDOW_DAYS = 14;

function parseDateKey(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateKey(date);
}

function addWeeks(dateKey: string, weeks: number): string {
  return addDays(dateKey, weeks * 7);
}

function todayKey(): string {
  const now = new Date();
  return formatDateKey(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
  );
}

function daysBetween(fromKey: string, toKey: string): number {
  return Math.round(
    (parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / MS_PER_DAY,
  );
}

function urgency(dueDate: string, asOf: string): { status: VaccineUrgency; daysUntilDue: number } {
  const daysUntilDue = daysBetween(asOf, dueDate);
  if (daysUntilDue < 0) return { status: 'overdue', daysUntilDue };
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) return { status: 'due_soon', daysUntilDue };
  return { status: 'upcoming', daysUntilDue };
}

type DraftDose = {
  id: string;
  vaccineName: string;
  category: VaccineCategory;
  dueDate: string;
  milestone: string;
  notes: string;
};

/**
 * Final puppy/kitten core visit age in weeks - large-breed dogs often finish later.
 */
function finalCoreWeek(species: VaccineSpecies, breedSize: BreedSize): number {
  if (species === 'cat') return 16;
  if (breedSize === 'large') return 18;
  if (breedSize === 'small') return 16;
  return 16;
}

function buildDraftDoses(input: VaccineScheduleInput): DraftDose[] {
  const { species, dateOfBirth, breedSize, lifestyle } = input;
  const finalWeek = finalCoreWeek(species, breedSize);
  const doses: DraftDose[] = [];

  const week8 = addWeeks(dateOfBirth, 8);
  const week12 = addWeeks(dateOfBirth, 12);
  const weekFinal = addWeeks(dateOfBirth, finalWeek);
  const year1 = addWeeks(dateOfBirth, 52);
  const year1Plus = addDays(year1, 0);

  if (species === 'dog') {
    doses.push({
      id: 'dog-dhpp-8',
      vaccineName: 'DHPP (Distemper / Hepatitis / Parvo / Parainfluenza)',
      category: 'core',
      dueDate: week8,
      milestone: '8-week core',
      notes: 'First puppy DHPP series dose. Keep away from high-traffic dog areas until series complete.',
    });
    doses.push({
      id: 'dog-dhpp-12',
      vaccineName: 'DHPP booster',
      category: 'core',
      dueDate: week12,
      milestone: '12-week core',
      notes: 'Second DHPP dose in the primary series.',
    });
    doses.push({
      id: 'dog-rabies-12',
      vaccineName: 'Rabies',
      category: 'core',
      dueDate: week12,
      milestone: '12-week rabies',
      notes: 'Initial rabies vaccination - confirm local municipal age requirements with your clinic.',
    });

    if (lifestyle === 'social' || lifestyle === 'international') {
      doses.push({
        id: 'dog-lepto-12',
        vaccineName: 'Leptospirosis',
        category: 'non-core',
        dueDate: week12,
        milestone: '12-week lifestyle',
        notes: 'Recommended for dogs with park, boarding, or wildlife exposure risk.',
      });
      doses.push({
        id: 'dog-bordetella-12',
        vaccineName: 'Bordetella (Kennel cough)',
        category: 'non-core',
        dueDate: week12,
        milestone: '12-week lifestyle',
        notes: 'Useful before daycare, boarding, or dog-park socialization.',
      });
    }

    if (lifestyle === 'international' || lifestyle === 'social') {
      doses.push({
        id: 'dog-influenza-12',
        vaccineName: 'Canine influenza',
        category: 'non-core',
        dueDate: week12,
        milestone: '12-week lifestyle',
        notes: 'Consider for dogs with frequent boarding or multi-dog travel exposure.',
      });
    }

    doses.push({
      id: 'dog-dhpp-final',
      vaccineName: 'DHPP final puppy booster',
      category: 'core',
      dueDate: weekFinal,
      milestone: `${finalWeek}-week boosters`,
      notes:
        breedSize === 'large'
          ? 'Large-breed finish often lands at 16-18 weeks to close maternal antibody interference.'
          : 'Final primary-series DHPP before adult intervals begin.',
    });

    if (lifestyle === 'social' || lifestyle === 'international') {
      doses.push({
        id: 'dog-lepto-final',
        vaccineName: 'Leptospirosis booster',
        category: 'non-core',
        dueDate: weekFinal,
        milestone: `${finalWeek}-week boosters`,
        notes: 'Complete the Lepto primary series (typically two doses 2-4 weeks apart).',
      });
    }

    doses.push({
      id: 'dog-dhpp-1y',
      vaccineName: 'DHPP 1-year booster / titer',
      category: 'core',
      dueDate: year1Plus,
      milestone: '1-year titer / booster',
      notes: 'Adult booster or titer discussion with your veterinarian one year after the puppy series.',
    });
    doses.push({
      id: 'dog-rabies-1y',
      vaccineName: 'Rabies 1-year booster',
      category: 'core',
      dueDate: year1Plus,
      milestone: '1-year titer / booster',
      notes: 'Many jurisdictions require a 1-year rabies booster after the initial dose.',
    });

    if (lifestyle === 'social' || lifestyle === 'international') {
      doses.push({
        id: 'dog-lepto-1y',
        vaccineName: 'Leptospirosis annual booster',
        category: 'non-core',
        dueDate: year1Plus,
        milestone: '1-year titer / booster',
        notes: 'Annual lifestyle booster for ongoing exposure risk.',
      });
    }

    if (lifestyle === 'international') {
      doses.push({
        id: 'dog-rabies-titer-plan',
        vaccineName: 'Rabies neutralizing antibody titer (travel)',
        category: 'non-core',
        dueDate: addDays(week12, 30),
        milestone: 'Travel titer window',
        notes:
          'International travelers often need a titer 30+ days after rabies vaccination and a waiting period before entry. Confirm destination rules early.',
      });
    }
  } else {
    doses.push({
      id: 'cat-fvrcp-8',
      vaccineName: 'FVRCP (Feline viral rhinotracheitis / Calici / Panleukopenia)',
      category: 'core',
      dueDate: week8,
      milestone: '8-week core',
      notes: 'First kitten FVRCP series dose.',
    });
    doses.push({
      id: 'cat-fvrcp-12',
      vaccineName: 'FVRCP booster',
      category: 'core',
      dueDate: week12,
      milestone: '12-week core',
      notes: 'Second FVRCP dose in the primary series.',
    });
    doses.push({
      id: 'cat-rabies-12',
      vaccineName: 'Rabies',
      category: 'core',
      dueDate: week12,
      milestone: '12-week rabies',
      notes: 'Initial feline rabies vaccination - verify local licensing rules.',
    });

    if (lifestyle === 'social' || lifestyle === 'international') {
      doses.push({
        id: 'cat-felv-12',
        vaccineName: 'FeLV (Feline leukemia)',
        category: 'non-core',
        dueDate: week12,
        milestone: '12-week lifestyle',
        notes: 'Strongly considered for kittens with outdoor access or multi-cat exposure.',
      });
    }

    doses.push({
      id: 'cat-fvrcp-final',
      vaccineName: 'FVRCP final kitten booster',
      category: 'core',
      dueDate: weekFinal,
      milestone: '16-week boosters',
      notes: 'Final primary-series FVRCP before adult intervals.',
    });

    if (lifestyle === 'social' || lifestyle === 'international') {
      doses.push({
        id: 'cat-felv-final',
        vaccineName: 'FeLV booster',
        category: 'non-core',
        dueDate: weekFinal,
        milestone: '16-week boosters',
        notes: 'Complete FeLV primary series when indicated by lifestyle risk.',
      });
    }

    doses.push({
      id: 'cat-fvrcp-1y',
      vaccineName: 'FVRCP 1-year booster / titer',
      category: 'core',
      dueDate: year1Plus,
      milestone: '1-year titer / booster',
      notes: 'Adult booster or titer discussion one year after the kitten series.',
    });
    doses.push({
      id: 'cat-rabies-1y',
      vaccineName: 'Rabies 1-year booster',
      category: 'core',
      dueDate: year1Plus,
      milestone: '1-year titer / booster',
      notes: 'Confirm whether your region uses 1-year or 3-year rabies products after the first dose.',
    });

    if (lifestyle === 'international') {
      doses.push({
        id: 'cat-rabies-titer-plan',
        vaccineName: 'Rabies neutralizing antibody titer (travel)',
        category: 'non-core',
        dueDate: addDays(week12, 30),
        milestone: 'Travel titer window',
        notes:
          'Many import corridors require a rabies titer and waiting period. Plan destination paperwork before booking travel.',
      });
    }
  }

  return doses;
}

/**
 * Build a chronological custom clinical immunization roadmap.
 */
export function calculateVaccineSchedule(input: VaccineScheduleInput): VaccineScheduleResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) {
    throw new Error('Date of birth must be YYYY-MM-DD.');
  }

  const asOf = input.asOfDate && /^\d{4}-\d{2}-\d{2}$/.test(input.asOfDate)
    ? input.asOfDate
    : todayKey();

  const drafts = buildDraftDoses(input);
  const items = drafts
    .map((draft) => {
      const { status, daysUntilDue } = urgency(draft.dueDate, asOf);
      return { ...draft, status, daysUntilDue };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.vaccineName.localeCompare(b.vaccineName));

  return {
    input: { ...input, asOfDate: asOf },
    items,
    summary: {
      coreCount: items.filter((item) => item.category === 'core').length,
      nonCoreCount: items.filter((item) => item.category === 'non-core').length,
      overdueCount: items.filter((item) => item.status === 'overdue').length,
      dueSoonCount: items.filter((item) => item.status === 'due_soon').length,
    },
  };
}

export function formatVaccineDueLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const VACCINE_SCHEDULE_STORAGE_KEY = 'petclues_vaccine_roadmap';

export function persistVaccineRoadmap(result: VaccineScheduleResult): void {
  try {
    sessionStorage.setItem(
      VACCINE_SCHEDULE_STORAGE_KEY,
      JSON.stringify({ ...result, savedAt: Date.now() }),
    );
  } catch {
    // ignore quota / private mode
  }
}
