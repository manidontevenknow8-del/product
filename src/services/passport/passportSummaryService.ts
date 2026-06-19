import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import { formatPetAge, formatPassportUpdatedAt, getAvatarInitials } from '@/services/pets/petUtils';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { ROUTES } from '@/routes/paths';
import type { DailyCheckIn } from '@/types/dailyCheckIn';
import { buildPassportCareContext, type PassportCareContext } from './passportCareContext';

export type { PassportCareContext, PassportDailyCareEntry, PassportWeightEntry } from './passportCareContext';

function passportShareUrl(): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (import.meta.env.VITE_APP_URL as string | undefined) ?? '';
  const base = origin.replace(/\/$/, '');
  return base ? `${base}${ROUTES.EMERGENCY_PASSPORT}` : ROUTES.EMERGENCY_PASSPORT;
}

export type PassportIdentity = {
  petName: string;
  breed: string;
  age: string;
  species: string;
  gender: string | null;
  weight: string | null;
  avatarInitials: string;
  photo: string | null;
  lastUpdated: string;
  secureLink: string;
};

export type PassportSummaryStats = {
  totalRecords: number;
  activeMedicationsCount: number;
  allergiesCount: number;
  latestVaccination: HealthRecord | null;
  documentCount: number;
};

export type PassportData = {
  identity: PassportIdentity;
  stats: PassportSummaryStats;
  careContext: PassportCareContext;
  vaccinations: HealthRecord[];
  allergies: HealthRecord[];
  medications: HealthRecord[];
  conditions: HealthRecord[];
  weightRecords: HealthRecord[];
  emergencyNotes: string;
  documents: PetDocumentRecord[];
};

const speciesLabels: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

function formatGender(gender: PetRecord['gender']): string | null {
  if (!gender) return null;
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

function sortByDateDesc(records: HealthRecord[]): HealthRecord[] {
  return [...records].sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded));
}

function buildEmergencyNotes(records: HealthRecord[]): string {
  const wellness = records.filter((r) => r.recordType === 'wellness');
  const highSeverity = records.filter((r) => r.severity === 'high');

  const lines: string[] = [];

  for (const record of wellness) {
    const detail = record.description?.trim();
    lines.push(detail ? `${record.title}: ${detail}` : record.title);
  }

  for (const record of highSeverity) {
    if (record.recordType === 'wellness') continue;
    const detail = record.description?.trim();
    lines.push(
      detail
        ? `[${record.title}] ${detail}`
        : `[High priority] ${record.title} (${formatHealthRecordDate(record.dateRecorded)})`,
    );
  }

  if (lines.length === 0) return 'No emergency notes recorded.';
  return lines.join('\n\n');
}

function resolveLastUpdated(
  pet: PetRecord,
  records: HealthRecord[],
  documents: PetDocumentRecord[],
): string {
  const timestamps = [
    pet.updatedAt,
    ...records.map((r) => r.updatedAt),
    ...documents.map((d) => d.uploadedAt),
  ].filter(Boolean);

  if (timestamps.length === 0) return formatPassportUpdatedAt(new Date().toISOString());

  const latest = timestamps.sort((a, b) => b.localeCompare(a))[0];
  return formatPassportUpdatedAt(latest);
}

export function buildPassportIdentity(pet: PetRecord): PassportIdentity {
  const lastUpdated = resolveLastUpdated(pet, [], []);

  return {
    petName: pet.name,
    breed: pet.breed ?? 'Breed not set',
    age: formatPetAge(pet.birthDate),
    species: speciesLabels[pet.species] ?? pet.species,
    gender: formatGender(pet.gender),
    weight: pet.weight,
    avatarInitials: getAvatarInitials(pet.name),
    photo: pet.photoUrl,
    lastUpdated,
    secureLink: passportShareUrl(),
  };
}

export function buildPassportSummary(
  pet: PetRecord,
  records: HealthRecord[],
  documents: PetDocumentRecord[],
  dailyCheckIns: DailyCheckIn[] = [],
): PassportData {
  const vaccinations = sortByDateDesc(records.filter((r) => r.recordType === 'vaccination'));
  const allergies = sortByDateDesc(records.filter((r) => r.recordType === 'allergy'));
  const medications = sortByDateDesc(records.filter((r) => r.recordType === 'medication'));
  const conditions = sortByDateDesc(
    records.filter((r) => r.recordType === 'diagnosis' || r.recordType === 'surgery'),
  );
  const weightRecords = sortByDateDesc(records.filter((r) => r.recordType === 'weight'));
  const careContext = buildPassportCareContext(pet, records, dailyCheckIns);

  const identity: PassportIdentity = {
    ...buildPassportIdentity(pet),
    weight: careContext.latestWeight,
    lastUpdated: resolveLastUpdated(pet, records, documents),
  };

  return {
    identity,
    stats: {
      totalRecords: records.length,
      activeMedicationsCount: medications.length,
      allergiesCount: allergies.length,
      latestVaccination: vaccinations[0] ?? null,
      documentCount: documents.length,
    },
    careContext,
    vaccinations,
    allergies,
    medications,
    conditions,
    weightRecords,
    emergencyNotes: buildEmergencyNotes(records),
    documents,
  };
}

export function formatPassportRecordLine(record: HealthRecord): string {
  const date = formatHealthRecordDate(record.dateRecorded);
  const detail = record.description?.trim();
  const due = record.nextDueDate
    ? ` · Next due ${formatHealthRecordDate(record.nextDueDate)}`
    : '';

  if (detail) return `${record.title} (${date}) - ${detail}${due}`;
  return `${record.title} · ${date}${due}`;
}
