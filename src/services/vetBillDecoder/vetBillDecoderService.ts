import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { parseFunctionInvokeError } from '@/services/supabase/parseFunctionInvokeError';
import { sanitizeUserFacingError, throwUserFacingError } from '@/utils/userFacingErrors';
import { buildMockExtractionRecord } from './mockVetBillDecoder';
import type {
  ApplyExtractionResult,
  VetBillExtractionRecord,
  VetBillExtractionResult,
  VetBillExtractionStatus,
} from './vetBillDecoderTypes';
import { normalizeExtractionStatus } from './vetBillDecoderTypes';
import type { CreateHealthRecordInput } from '@/services/healthRecords/healthRecordService';
import type { CreateReminderInput } from '@/types/reminder';
import type { IHealthRecordService } from '@/services/healthRecords/healthRecordTypes';
import type { IReminderService } from '@/services/reminders/reminderTypes';

type VetBillExtractionRow = {
  id: string;
  user_id: string;
  pet_id: string;
  document_id: string;
  status: string;
  extraction_result: VetBillExtractionResult;
  approved_snapshot: VetBillExtractionResult | null;
  model_used: string | null;
  created_at: string;
  reviewed_at: string | null;
};

function mapRow(row: VetBillExtractionRow): VetBillExtractionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    petId: row.pet_id,
    documentId: row.document_id,
    status: normalizeExtractionStatus(row.status),
    extractionResult: row.extraction_result,
    approvedSnapshot: row.approved_snapshot,
    modelUsed: row.model_used,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  };
}

/** Edge function returns camelCase JSON - normalize status before UI. */
function mapApiRecord(raw: Record<string, unknown>): VetBillExtractionRecord {
  const status = String(raw.status ?? 'saved');
  return {
    id: String(raw.id),
    userId: String(raw.userId ?? raw.user_id),
    petId: String(raw.petId ?? raw.pet_id),
    documentId: String(raw.documentId ?? raw.document_id),
    status: normalizeExtractionStatus(status),
    extractionResult: (raw.extractionResult ?? raw.extraction_result) as VetBillExtractionResult,
    approvedSnapshot: (raw.approvedSnapshot ?? raw.approved_snapshot ?? null) as VetBillExtractionResult | null,
    modelUsed: (raw.modelUsed ?? raw.model_used ?? null) as string | null,
    createdAt: String(raw.createdAt ?? raw.created_at),
    reviewedAt: (raw.reviewedAt ?? raw.reviewed_at ?? null) as string | null,
  };
}

export interface IVetBillDecoderService {
  decodeDocument(
    userId: string,
    petId: string,
    documentId: string,
    fileName: string,
  ): Promise<VetBillExtractionRecord>;
  getExtractionByDocumentId(
    userId: string,
    petId: string,
    documentId: string,
  ): Promise<VetBillExtractionRecord | null>;
  listExtractions(userId: string, petId: string): Promise<VetBillExtractionRecord[]>;
  updateExtractionReview(
    userId: string,
    extractionId: string,
    result: VetBillExtractionResult,
    status: VetBillExtractionStatus,
  ): Promise<VetBillExtractionRecord>;
  deleteExtraction(userId: string, extractionId: string): Promise<void>;
}

const MOCK_STORAGE_KEY = 'petclues_vet_bill_extractions';

function loadMock(): VetBillExtractionRecord[] {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VetBillExtractionRecord[]) : [];
  } catch {
    return [];
  }
}

function saveMock(records: VetBillExtractionRecord[]) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(records.slice(0, 50)));
}

export class SupabaseVetBillDecoderService implements IVetBillDecoderService {
  async decodeDocument(
    _userId: string,
    petId: string,
    documentId: string,
    _fileName: string,
  ): Promise<VetBillExtractionRecord> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('decode-vet-document', {
      body: { documentId, petId },
    });

    if (error) {
      throw new Error(await parseFunctionInvokeError(error, 'Vet bill decode failed', 'decode'));
    }
    if (data?.error) throw new Error(sanitizeUserFacingError(String(data.error), 'decode'));
    return mapApiRecord(data as Record<string, unknown>);
  }

  async getExtractionByDocumentId(
    _userId: string,
    petId: string,
    documentId: string,
  ): Promise<VetBillExtractionRecord | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vet_bill_extractions')
      .select('*')
      .eq('pet_id', petId)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throwUserFacingError(error.message, 'decode');
    return data ? mapRow(data as VetBillExtractionRow) : null;
  }

  async listExtractions(_userId: string, petId: string): Promise<VetBillExtractionRecord[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vet_bill_extractions')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) throwUserFacingError(error.message, 'decode');
    return (data as VetBillExtractionRow[]).map(mapRow);
  }

  async updateExtractionReview(
    _userId: string,
    extractionId: string,
    result: VetBillExtractionResult,
    status: VetBillExtractionStatus,
  ): Promise<VetBillExtractionRecord> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('vet_bill_extractions')
      .update({
        extraction_result: result,
        approved_snapshot: result,
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', extractionId)
      .select('*')
      .single();

    if (error) throwUserFacingError(error.message, 'decode');
    return mapRow(data as VetBillExtractionRow);
  }

  async deleteExtraction(_userId: string, extractionId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('vet_bill_extractions').delete().eq('id', extractionId);
    if (error) throwUserFacingError(error.message, 'decode');
  }
}

export class MockVetBillDecoderService implements IVetBillDecoderService {
  async decodeDocument(
    userId: string,
    petId: string,
    documentId: string,
    fileName: string,
  ): Promise<VetBillExtractionRecord> {
    const cached = await this.getExtractionByDocumentId(userId, petId, documentId);
    if (cached) return cached;
    const record = buildMockExtractionRecord(documentId, petId, userId, fileName);
    const all = loadMock();
    saveMock([record, ...all]);
    return record;
  }

  async getExtractionByDocumentId(
    _userId: string,
    petId: string,
    documentId: string,
  ): Promise<VetBillExtractionRecord | null> {
    const match = loadMock().find((r) => r.petId === petId && r.documentId === documentId);
    return match ?? null;
  }

  async listExtractions(_userId: string, petId: string): Promise<VetBillExtractionRecord[]> {
    return loadMock().filter((r) => r.petId === petId);
  }

  async updateExtractionReview(
    _userId: string,
    extractionId: string,
    result: VetBillExtractionResult,
    status: VetBillExtractionStatus,
  ): Promise<VetBillExtractionRecord> {
    const all = loadMock();
    const index = all.findIndex((r) => r.id === extractionId);
    if (index < 0) throw new Error('Extraction not found');
    const updated: VetBillExtractionRecord = {
      ...all[index],
      extractionResult: result,
      approvedSnapshot: result,
      status,
      reviewedAt: new Date().toISOString(),
    };
    all[index] = updated;
    saveMock(all);
    return updated;
  }

  async deleteExtraction(_userId: string, extractionId: string): Promise<void> {
    saveMock(loadMock().filter((r) => r.id !== extractionId));
  }
}

export function isVetBillDecoderMockMode(): boolean {
  return !isSupabaseConfigured();
}

export function getVetBillDecoderService(): IVetBillDecoderService {
  return isSupabaseConfigured()
    ? new SupabaseVetBillDecoderService()
    : new MockVetBillDecoderService();
}

function reminderCategoryFromHint(hint?: string): CreateReminderInput['category'] {
  const value = hint?.toLowerCase() ?? '';
  if (value.includes('vaccin')) return 'vaccinations';
  if (value.includes('med')) return 'medication';
  if (value.includes('groom')) return 'grooming';
  if (value.includes('vet') || value.includes('visit')) return 'vet_visits';
  return 'custom';
}

export async function applyApprovedExtraction(params: {
  ownerId: string;
  petId: string;
  petName: string;
  documentId: string;
  result: VetBillExtractionResult;
  healthRecordService: IHealthRecordService;
  reminderService: IReminderService;
}): Promise<ApplyExtractionResult> {
  let healthRecordsCreated = 0;
  let remindersCreated = 0;

  for (const item of params.result.vaccinations) {
    if (!item.approved) continue;
    const input: CreateHealthRecordInput = {
      petId: params.petId,
      sourceDocumentId: params.documentId,
      recordType: 'vaccination',
      title: item.title,
      description: item.description ?? null,
      dateRecorded: item.dateRecorded ?? new Date().toISOString().slice(0, 10),
      nextDueDate: item.nextDueDate ?? null,
    };
    await params.healthRecordService.createRecord(params.ownerId, input);
    healthRecordsCreated += 1;
  }

  for (const item of params.result.medications) {
    if (!item.approved) continue;
    const input: CreateHealthRecordInput = {
      petId: params.petId,
      sourceDocumentId: params.documentId,
      recordType: 'medication',
      title: item.title,
      description: item.description ?? null,
      dateRecorded: item.dateRecorded ?? new Date().toISOString().slice(0, 10),
      nextDueDate: item.endDate ?? null,
    };
    await params.healthRecordService.createRecord(params.ownerId, input);
    healthRecordsCreated += 1;
  }

  for (const item of params.result.diagnoses) {
    if (!item.approved) continue;
    const input: CreateHealthRecordInput = {
      petId: params.petId,
      sourceDocumentId: params.documentId,
      recordType: 'diagnosis',
      title: item.title,
      description: item.description ?? null,
      dateRecorded: item.dateRecorded ?? new Date().toISOString().slice(0, 10),
    };
    await params.healthRecordService.createRecord(params.ownerId, input);
    healthRecordsCreated += 1;
  }

  for (const item of params.result.followUpDates) {
    if (!item.approved) continue;
    const input: CreateHealthRecordInput = {
      petId: params.petId,
      sourceDocumentId: params.documentId,
      recordType: 'wellness',
      title: item.title,
      description: item.description ?? null,
      dateRecorded: new Date().toISOString().slice(0, 10),
      nextDueDate: item.followUpDate,
    };
    await params.healthRecordService.createRecord(params.ownerId, input);
    healthRecordsCreated += 1;
  }

  for (const item of params.result.reminderDates) {
    if (!item.approved) continue;
    const reminder: CreateReminderInput = {
      petId: params.petId,
      petName: params.petName,
      title: item.title,
      category: reminderCategoryFromHint(item.category ?? item.title),
      dueDate: item.dueDate,
      repeatFrequency: 'none',
      notes: item.description,
      priority: 'medium',
    };
    await params.reminderService.create(params.ownerId, reminder);
    remindersCreated += 1;
  }

  return { healthRecordsCreated, remindersCreated };
}

export function countApprovedItems(result: VetBillExtractionResult): number {
  return [
    ...result.vaccinations,
    ...result.medications,
    ...result.diagnoses,
    ...result.followUpDates,
    ...result.reminderDates,
  ].filter((item) => item.approved).length;
}

export function resolveReviewStatus(
  result: VetBillExtractionResult,
): VetBillExtractionStatus {
  const approved = countApprovedItems(result);
  const total =
    result.vaccinations.length +
    result.medications.length +
    result.diagnoses.length +
    result.followUpDates.length +
    result.reminderDates.length;

  if (approved === 0) return 'rejected';
  if (approved === total) return 'approved';
  return 'partially_approved';
}
