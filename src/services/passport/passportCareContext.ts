import type { DailyCheckIn, DailyCheckInWeekSummary } from '@/types/dailyCheckIn';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { shiftDateKey, summarizeCheckInWeek, todayDateKey } from '@/services/dailyCheckIn/checkInUtils';
import { formatCheckInWeightLabel } from '@/services/dailyCheckIn/syncCheckInWeightRecord';

export type PassportWeightEntry = {
  id: string;
  dateLabel: string;
  isoDate: string;
  value: string;
};

export type PassportDailyCareEntry = {
  id: string;
  dateLabel: string;
  isoDate: string;
  feeding: string;
  walkLabel: string;
  weightLabel: string | null;
};

export type PassportCareContext = {
  latestWeight: string | null;
  profileWeight: string | null;
  weightHistory: PassportWeightEntry[];
  recentDailyCare: PassportDailyCareEntry[];
  weekSummary: DailyCheckInWeekSummary;
  daysLoggedLast14: number;
};

function formatShortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatWeightValue(record: HealthRecord): string {
  const detail = record.description?.trim();
  return detail || record.title;
}

export function buildPassportCareContext(
  pet: PetRecord,
  records: HealthRecord[],
  dailyCheckIns: DailyCheckIn[],
  options?: { careLogDays?: number; maxWeightEntries?: number },
): PassportCareContext {
  const careLogDays = options?.careLogDays ?? 14;
  const maxWeightEntries = options?.maxWeightEntries ?? 12;

  const weightRecords = records
    .filter((r) => r.recordType === 'weight')
    .sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded));

  const weightHistory: PassportWeightEntry[] = weightRecords.slice(0, maxWeightEntries).map((r) => ({
    id: r.id,
    dateLabel: formatHealthRecordDate(r.dateRecorded),
    isoDate: r.dateRecorded,
    value: formatWeightValue(r),
  }));

  const latestCheckInWeight = [...dailyCheckIns]
    .filter((c) => c.weightKg != null && Number.isFinite(c.weightKg) && c.weightKg > 0)
    .sort((a, b) => b.checkInDate.localeCompare(a.checkInDate))[0];

  let latestWeight = weightHistory[0]?.value ?? pet.weight ?? null;
  if (
    latestCheckInWeight &&
    (!weightHistory[0] || latestCheckInWeight.checkInDate >= weightHistory[0].isoDate)
  ) {
    latestWeight = formatCheckInWeightLabel(latestCheckInWeight.weightKg!);
  }

  const today = todayDateKey();
  const windowStart = shiftDateKey(today, -(careLogDays - 1));
  const recentDailyCare: PassportDailyCareEntry[] = [...dailyCheckIns]
    .filter((c) => c.checkInDate >= windowStart && c.checkInDate <= today)
    .sort((a, b) => b.checkInDate.localeCompare(a.checkInDate))
    .map((c) => ({
      id: c.id,
      dateLabel: formatShortDate(c.checkInDate),
      isoDate: c.checkInDate,
      feeding: c.feeding,
      walkLabel:
        c.walkDistanceKm != null && Number.isFinite(c.walkDistanceKm)
          ? `${c.walkDistanceKm} km`
          : 'Not recorded',
      weightLabel:
        c.weightKg != null && Number.isFinite(c.weightKg) && c.weightKg > 0
          ? formatCheckInWeightLabel(c.weightKg)
          : null,
    }));

  const daysLoggedLast14 = recentDailyCare.length;

  return {
    latestWeight,
    profileWeight: pet.weight,
    weightHistory,
    recentDailyCare,
    weekSummary: summarizeCheckInWeek(dailyCheckIns),
    daysLoggedLast14,
  };
}
