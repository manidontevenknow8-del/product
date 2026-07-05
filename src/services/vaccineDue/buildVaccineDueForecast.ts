import { shiftDateKey, todayDateKey } from '@/services/dailyCheckIn/checkInUtils';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';

const DUE_SOON_DAYS = 45;
const MIN_REASONABLE_INTERVAL_DAYS = 30;
const MAX_REASONABLE_INTERVAL_DAYS = 365 * 5;
const DEFAULT_INTERVAL_DAYS = 365;

type VaccineIntervalRule = {
  key: string;
  label: string;
  keywords: string[];
  defaultIntervalDays: number;
  estimateNote: string;
};

const VACCINE_INTERVAL_RULES: VaccineIntervalRule[] = [
  {
    key: 'rabies',
    label: 'Rabies',
    keywords: ['rabies'],
    defaultIntervalDays: 365 * 3,
    estimateNote: 'typical 3-year booster interval',
  },
  {
    key: 'bordetella',
    label: 'Bordetella',
    keywords: ['bordetella', 'kennel cough'],
    defaultIntervalDays: 365,
    estimateNote: 'typical annual booster',
  },
  {
    key: 'dhpp',
    label: 'DHPP',
    keywords: ['dhpp', 'dapp', 'dap', 'distemper-parvo', 'distemper parvo'],
    defaultIntervalDays: 365 * 3,
    estimateNote: 'typical 3-year booster interval',
  },
  {
    key: 'distemper',
    label: 'Distemper',
    keywords: ['distemper'],
    defaultIntervalDays: 365 * 3,
    estimateNote: 'typical 3-year booster interval',
  },
  {
    key: 'parvovirus',
    label: 'Parvovirus',
    keywords: ['parvo', 'parvovirus'],
    defaultIntervalDays: 365 * 3,
    estimateNote: 'typical 3-year booster interval',
  },
  {
    key: 'lepto',
    label: 'Leptospirosis',
    keywords: ['lepto', 'leptospirosis'],
    defaultIntervalDays: 365,
    estimateNote: 'typical annual booster',
  },
  {
    key: 'lyme',
    label: 'Lyme',
    keywords: ['lyme'],
    defaultIntervalDays: 365,
    estimateNote: 'typical annual booster',
  },
  {
    key: 'fvrcp',
    label: 'FVRCP',
    keywords: ['fvrcp', 'feline viral rhinotracheitis', 'feline distemper'],
    defaultIntervalDays: 365 * 3,
    estimateNote: 'typical 3-year booster interval',
  },
  {
    key: 'felv',
    label: 'FeLV',
    keywords: ['felv', 'feline leukemia', 'leukemia vaccine'],
    defaultIntervalDays: 365,
    estimateNote: 'typical annual booster',
  },
  {
    key: 'influenza',
    label: 'Canine influenza',
    keywords: ['canine influenza', 'dog flu', 'hound flu'],
    defaultIntervalDays: 365,
    estimateNote: 'typical annual booster',
  },
];

export type VaccineDueBasis = 'recorded_due_date' | 'observed_interval' | 'default_interval';

export type VaccineDueStatus = 'overdue' | 'due_soon' | 'upcoming';

export type VaccineDuePrediction = {
  id: string;
  vaccineLabel: string;
  lastDoseDate: string;
  estimatedDueDate: string;
  status: VaccineDueStatus;
  summary: string;
  basis: VaccineDueBasis;
};

export type VaccineDueForecast = {
  predictions: VaccineDuePrediction[];
  hasVaccinations: boolean;
};

function daysBetween(start: string, end: string): number {
  const startMs = new Date(`${start}T12:00:00`).getTime();
  const endMs = new Date(`${end}T12:00:00`).getTime();
  return Math.round((endMs - startMs) / (24 * 60 * 60 * 1000));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
  }
  return sorted[mid]!;
}

function matchVaccineRule(title: string, description: string | null): VaccineIntervalRule | null {
  const haystack = `${title} ${description ?? ''}`.toLowerCase();
  return VACCINE_INTERVAL_RULES.find((rule) => rule.keywords.some((keyword) => haystack.includes(keyword))) ?? null;
}

function normalizeVaccineTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getVaccineGroupKey(record: HealthRecord): string {
  const rule = matchVaccineRule(record.title, record.description);
  return rule?.key ?? normalizeVaccineTitle(record.title);
}

function getVaccineLabel(records: HealthRecord[]): string {
  const latest = records[records.length - 1]!;
  const rule = matchVaccineRule(latest.title, latest.description);
  return rule?.label ?? latest.title.trim();
}

function computeObservedIntervalDays(doses: HealthRecord[]): number | null {
  const sorted = [...doses].sort((a, b) => a.dateRecorded.localeCompare(b.dateRecorded));
  if (sorted.length < 2) return null;

  const intervals = sorted
    .slice(1)
    .map((dose, index) => daysBetween(sorted[index]!.dateRecorded, dose.dateRecorded))
    .filter(
      (days) => days >= MIN_REASONABLE_INTERVAL_DAYS && days <= MAX_REASONABLE_INTERVAL_DAYS,
    );

  return intervals.length > 0 ? median(intervals) : null;
}

function formatIntervalDays(days: number): string {
  if (days >= 365 * 2) {
    const years = Math.round(days / 365);
    return years === 1 ? '~1 year' : `~${years} years`;
  }
  if (days >= 60) {
    const months = Math.round(days / 30);
    return months === 1 ? '~1 month' : `~${months} months`;
  }
  return `~${days} days`;
}

function classifyStatus(estimatedDueDate: string, today = todayDateKey()): VaccineDueStatus {
  const daysUntilDue = daysBetween(today, estimatedDueDate);
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= DUE_SOON_DAYS) return 'due_soon';
  return 'upcoming';
}

function buildSummary(
  vaccineLabel: string,
  estimatedDueDate: string,
  basis: VaccineDueBasis,
  status: VaccineDueStatus,
  options: { intervalDays?: number; estimateNote?: string },
): string {
  const dateLabel = formatHealthRecordDate(estimatedDueDate);
  const noun = vaccineLabel.toLowerCase().includes('booster') ? vaccineLabel : `${vaccineLabel} booster`;

  if (status === 'overdue') {
    if (basis === 'recorded_due_date') {
      return `${noun} was likely due around ${dateLabel}, based on your recorded due date — confirm with your vet.`;
    }
    return `${noun} may be overdue (estimated around ${dateLabel}) — confirm timing with your vet.`;
  }

  switch (basis) {
    case 'recorded_due_date':
      return `${noun} likely due around ${dateLabel}, based on your recorded due date.`;
    case 'observed_interval':
      return `${noun} likely due around ${dateLabel}, based on your pet's vaccination pattern (${formatIntervalDays(options.intervalDays ?? DEFAULT_INTERVAL_DAYS)} between doses).`;
    default:
      return `${noun} likely due around ${dateLabel}, based on last dose and a ${options.estimateNote ?? 'typical booster interval'} (estimate — confirm with your vet).`;
  }
}

function predictForGroup(groupKey: string, doses: HealthRecord[]): VaccineDuePrediction | null {
  if (doses.length === 0) return null;

  const sorted = [...doses].sort((a, b) => a.dateRecorded.localeCompare(b.dateRecorded));
  const latest = sorted[sorted.length - 1]!;
  const vaccineLabel = getVaccineLabel(sorted);
  const rule = matchVaccineRule(latest.title, latest.description);

  let estimatedDueDate: string;
  let basis: VaccineDueBasis;
  let intervalDays: number | undefined;

  const recordedDue = latest.nextDueDate;
  if (recordedDue) {
    estimatedDueDate = recordedDue;
    basis = 'recorded_due_date';
  } else {
    const observedInterval = computeObservedIntervalDays(sorted);
    if (observedInterval != null) {
      intervalDays = observedInterval;
      estimatedDueDate = shiftDateKey(latest.dateRecorded, observedInterval);
      basis = 'observed_interval';
    } else {
      intervalDays = rule?.defaultIntervalDays ?? DEFAULT_INTERVAL_DAYS;
      estimatedDueDate = shiftDateKey(latest.dateRecorded, intervalDays);
      basis = 'default_interval';
    }
  }

  const status = classifyStatus(estimatedDueDate);

  return {
    id: groupKey,
    vaccineLabel,
    lastDoseDate: latest.dateRecorded,
    estimatedDueDate,
    status,
    basis,
    summary: buildSummary(vaccineLabel, estimatedDueDate, basis, status, {
      intervalDays,
      estimateNote: rule?.estimateNote,
    }),
  };
}

function sortPredictions(predictions: VaccineDuePrediction[]): VaccineDuePrediction[] {
  const statusRank: Record<VaccineDueStatus, number> = {
    overdue: 0,
    due_soon: 1,
    upcoming: 2,
  };

  return [...predictions].sort((a, b) => {
    const rankDiff = statusRank[a.status] - statusRank[b.status];
    if (rankDiff !== 0) return rankDiff;
    return a.estimatedDueDate.localeCompare(b.estimatedDueDate);
  });
}

export function buildVaccineDueForecast(records: HealthRecord[]): VaccineDueForecast {
  const vaccinations = records.filter((record) => record.recordType === 'vaccination');
  if (vaccinations.length === 0) {
    return { predictions: [], hasVaccinations: false };
  }

  const groups = new Map<string, HealthRecord[]>();
  for (const record of vaccinations) {
    const key = getVaccineGroupKey(record);
    const existing = groups.get(key) ?? [];
    existing.push(record);
    groups.set(key, existing);
  }

  const predictions = [...groups.entries()]
    .map(([key, doses]) => predictForGroup(key, doses))
    .filter((prediction): prediction is VaccineDuePrediction => prediction != null);

  return {
    predictions: sortPredictions(predictions),
    hasVaccinations: true,
  };
}
