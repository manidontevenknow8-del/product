import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import type { DailyCheckIn } from '@/types/dailyCheckIn';
import { formatPetAge, getAvatarInitials } from '@/services/pets/petUtils';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { formatPassportRecordLine } from '@/services/passport/passportSummaryService';
import { formatCheckInWeightLabel } from '@/services/dailyCheckIn/syncCheckInWeightRecord';
import type { SymptomLog } from '@/services/symptomLog';
import {
  formatSymptomLogDate,
  formatSymptomLogSummary,
} from '@/services/symptomLog';

export type VetVisitWeightPoint = {
  id: string;
  isoDate: string;
  dateLabel: string;
  value: string;
  source: 'record' | 'check-in';
};

export type VetVisitWellnessNote = {
  id: string;
  dateLabel: string;
  title: string;
  detail: string | null;
};

export type VetVisitSymptomLog = {
  id: string;
  dateLabel: string;
  symptoms: string[];
  note: string | null;
  hasPhoto: boolean;
  summary: string;
};

export type VetVisitExportData = {
  generatedAt: string;
  generatedAtLabel: string;
  petName: string;
  species: string;
  breed: string;
  age: string;
  avatarInitials: string;
  vaccinations: HealthRecord[];
  medications: HealthRecord[];
  allergies: HealthRecord[];
  weightTrend: {
    summary: string;
    points: VetVisitWeightPoint[];
  };
  wellnessNotes: VetVisitWellnessNote[];
  symptomLogs: VetVisitSymptomLog[];
};

const SPECIES_LABELS: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

function shiftDateKey(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function sortByDateDesc(records: HealthRecord[]): HealthRecord[] {
  return [...records].sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded));
}

function parseKg(value: string): number | null {
  const match = value.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (match) return Number.parseFloat(match[1]!);
  const bare = Number.parseFloat(value);
  return Number.isFinite(bare) ? bare : null;
}

function buildWeightTrend(
  records: HealthRecord[],
  checkIns: DailyCheckIn[],
  profileWeight: string | null,
): VetVisitExportData['weightTrend'] {
  const today = todayDateKey();
  const cutoff = shiftDateKey(today, -90);

  const recordPoints: VetVisitWeightPoint[] = records
    .filter((record) => record.recordType === 'weight' && record.dateRecorded >= cutoff)
    .map((record) => ({
      id: record.id,
      isoDate: record.dateRecorded,
      dateLabel: formatHealthRecordDate(record.dateRecorded),
      value: record.description?.trim() || record.title,
      source: 'record' as const,
    }));

  const checkInPoints: VetVisitWeightPoint[] = checkIns
    .filter(
      (checkIn) =>
        checkIn.checkInDate >= cutoff &&
        checkIn.weightKg != null &&
        Number.isFinite(checkIn.weightKg) &&
        checkIn.weightKg > 0,
    )
    .map((checkIn) => ({
      id: checkIn.id,
      isoDate: checkIn.checkInDate,
      dateLabel: formatHealthRecordDate(checkIn.checkInDate),
      value: formatCheckInWeightLabel(checkIn.weightKg!),
      source: 'check-in' as const,
    }));

  const points = [...recordPoints, ...checkInPoints].sort((a, b) =>
    b.isoDate.localeCompare(a.isoDate),
  );

  if (points.length === 0) {
    return {
      summary: profileWeight
        ? `No dated weigh-ins in the last 90 days. Profile weight: ${profileWeight}.`
        : 'No weight entries in the last 90 days.',
      points: [],
    };
  }

  const kgValues = points
    .map((point) => parseKg(point.value))
    .filter((value): value is number => value != null);

  const latest = points[0]!.value;
  let summary = `${points.length} weight ${points.length === 1 ? 'entry' : 'entries'} in the last 90 days · Latest ${latest}`;

  if (kgValues.length >= 2) {
    const min = Math.min(...kgValues);
    const max = Math.max(...kgValues);
    const delta = kgValues[0]! - kgValues[kgValues.length - 1]!;
    const deltaLabel =
      Math.abs(delta) < 0.05
        ? 'stable'
        : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg vs earliest entry`;
    summary += ` · Range ${min.toFixed(1)}–${max.toFixed(1)} kg · ${deltaLabel}`;
  }

  return { summary, points };
}

function buildWellnessNotes(records: HealthRecord[]): VetVisitWellnessNote[] {
  const today = todayDateKey();
  const cutoff = shiftDateKey(today, -90);

  return sortByDateDesc(records.filter((record) => record.recordType === 'wellness'))
    .filter((record) => record.dateRecorded >= cutoff)
    .slice(0, 12)
    .map((record) => ({
      id: record.id,
      dateLabel: formatHealthRecordDate(record.dateRecorded),
      title: record.title,
      detail: record.description?.trim() || null,
    }));
}

function buildSymptomLogs(symptomLogs: SymptomLog[]): VetVisitSymptomLog[] {
  const today = todayDateKey();
  const cutoff = shiftDateKey(today, -90);

  return symptomLogs
    .filter((log) => log.loggedAt.slice(0, 10) >= cutoff)
    .slice(0, 12)
    .map((log) => ({
      id: log.id,
      dateLabel: formatSymptomLogDate(log),
      symptoms: log.symptoms,
      note: log.note,
      hasPhoto: Boolean(log.photoUrl),
      summary: formatSymptomLogSummary(log),
    }));
}

export function buildVetVisitExportData(
  pet: PetRecord,
  records: HealthRecord[],
  checkIns: DailyCheckIn[] = [],
  symptomLogs: SymptomLog[] = [],
): VetVisitExportData {
  const generatedAt = new Date().toISOString();
  const generatedAtLabel = new Date(generatedAt).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const vaccinations = sortByDateDesc(records.filter((r) => r.recordType === 'vaccination'));
  const medications = sortByDateDesc(records.filter((r) => r.recordType === 'medication'));
  const allergies = sortByDateDesc(records.filter((r) => r.recordType === 'allergy'));

  return {
    generatedAt,
    generatedAtLabel,
    petName: pet.name,
    species: SPECIES_LABELS[pet.species] ?? pet.species,
    breed: pet.breed ?? 'Breed not set',
    age: formatPetAge(pet.birthDate),
    avatarInitials: getAvatarInitials(pet.name),
    vaccinations,
    medications,
    allergies,
    weightTrend: buildWeightTrend(records, checkIns, pet.weight),
    wellnessNotes: buildWellnessNotes(records),
    symptomLogs: buildSymptomLogs(symptomLogs),
  };
}

export function formatVetVisitRecordLine(record: HealthRecord): string {
  return formatPassportRecordLine(record);
}
