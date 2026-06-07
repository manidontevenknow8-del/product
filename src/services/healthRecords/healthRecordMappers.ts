import { INPUT_LIMITS, trimField, validateRequiredText } from '@/utils/inputValidation';
import type {
  CreateHealthRecordInput,
  HealthRecord,
  HealthRecordRowWithDocument,
  HealthRecordType,
  UpdateHealthRecordInput,
} from './healthRecordTypes';
import { HEALTH_RECORD_TYPES } from './healthRecordTypes';

const RECORD_TYPES = new Set<string>(HEALTH_RECORD_TYPES);

function assertIsoDate(value: string, field: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${field} date.`);
  }
}

export function mapHealthRecordRow(row: HealthRecordRowWithDocument): HealthRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    sourceDocumentId: row.source_document_id,
    sourceDocumentName: row.pet_documents?.file_name ?? null,
    sourceDocumentUploadedAt: row.pet_documents?.uploaded_at ?? null,
    recordType: row.record_type as HealthRecord['recordType'],
    title: row.title,
    description: row.description,
    dateRecorded: row.date_recorded,
    nextDueDate: row.next_due_date,
    severity: (row.severity as HealthRecord['severity']) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function healthRecordInputToRow(input: CreateHealthRecordInput) {
  const titleError = validateRequiredText(input.title, 'Title', INPUT_LIMITS.title);
  if (titleError) throw new Error(titleError);
  if (!RECORD_TYPES.has(input.recordType)) throw new Error('Invalid record type.');
  assertIsoDate(input.dateRecorded, 'recorded');
  if (input.nextDueDate) assertIsoDate(input.nextDueDate, 'due');

  return {
    pet_id: input.petId,
    source_document_id: input.sourceDocumentId ?? null,
    record_type: input.recordType as HealthRecordType,
    title: trimField(input.title, INPUT_LIMITS.title),
    description: input.description
      ? trimField(input.description, INPUT_LIMITS.description) || null
      : null,
    date_recorded: input.dateRecorded,
    next_due_date: input.nextDueDate ?? null,
    severity: input.severity ?? null,
  };
}

export function healthRecordUpdateToRow(input: UpdateHealthRecordInput) {
  const patch: Partial<{
    source_document_id: string | null;
    record_type: string;
    title: string;
    description: string | null;
    date_recorded: string;
    next_due_date: string | null;
    severity: string | null;
  }> = {};

  if (input.sourceDocumentId !== undefined) {
    patch.source_document_id = input.sourceDocumentId;
  }
  if (input.recordType !== undefined) patch.record_type = input.recordType;
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description?.trim() || null;
  if (input.dateRecorded !== undefined) patch.date_recorded = input.dateRecorded;
  if (input.nextDueDate !== undefined) patch.next_due_date = input.nextDueDate;
  if (input.severity !== undefined) patch.severity = input.severity;

  return patch;
}

export function formatHealthRecordDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function defaultCreateHealthRecordInput(petId: string): CreateHealthRecordInput {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');

  return {
    petId,
    recordType: 'wellness',
    title: '',
    description: '',
    dateRecorded: `${y}-${m}-${d}`,
    sourceDocumentId: null,
    nextDueDate: null,
    severity: null,
  };
}

export type ProfileHealthSummary = {
  vaccinationStatus: string;
  allergies: string;
  latestWeight: string | null;
  recordCount: number;
};

export function deriveProfileHealthSummary(records: HealthRecord[]): ProfileHealthSummary {
  const vaccinations = records.filter((r) => r.recordType === 'vaccination');
  const allergies = records.filter((r) => r.recordType === 'allergy');
  const weights = records
    .filter((r) => r.recordType === 'weight')
    .sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded));

  let vaccinationStatus = 'Not recorded';
  if (vaccinations.length > 0) {
    const latest = [...vaccinations].sort((a, b) =>
      b.dateRecorded.localeCompare(a.dateRecorded),
    )[0];
    vaccinationStatus =
      latest.nextDueDate && latest.nextDueDate >= todayIso()
        ? `Current · next due ${formatHealthRecordDate(latest.nextDueDate)}`
        : `${vaccinations.length} on file · latest ${formatHealthRecordDate(latest.dateRecorded)}`;
  }

  let allergySummary = 'None recorded';
  if (allergies.length > 0) {
    allergySummary = allergies.map((a) => a.title).join(', ');
  }

  const latestWeight = weights[0]
    ? weights[0].description?.trim() || weights[0].title
    : null;

  return {
    vaccinationStatus,
    allergies: allergySummary,
    latestWeight,
    recordCount: records.length,
  };
}

function todayIso(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
