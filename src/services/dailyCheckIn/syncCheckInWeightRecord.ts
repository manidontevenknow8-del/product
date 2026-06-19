import type { CreateHealthRecordInput, HealthRecord, IHealthRecordService } from '@/services/healthRecords/healthRecordService';

export function formatCheckInWeightLabel(weightKg: number): string {
  const rounded = Math.round(weightKg * 10) / 10;
  return `${rounded} kg`;
}

export async function syncCheckInWeightRecord(args: {
  ownerId: string;
  petId: string;
  checkInDate: string;
  weightKg: number | null | undefined;
  existingRecords: HealthRecord[];
  healthRecordService: IHealthRecordService;
}): Promise<HealthRecord | null> {
  const { ownerId, petId, checkInDate, weightKg, existingRecords, healthRecordService } = args;

  const sameDayWeight = existingRecords.find(
    (record) =>
      record.petId === petId &&
      record.recordType === 'weight' &&
      record.dateRecorded === checkInDate,
  );

  if (weightKg == null || !Number.isFinite(weightKg) || weightKg <= 0) {
    return null;
  }

  const description = formatCheckInWeightLabel(weightKg);
  const payload: CreateHealthRecordInput = {
    petId,
    recordType: 'weight',
    title: 'Daily weigh-in',
    description,
    dateRecorded: checkInDate,
    sourceDocumentId: null,
    nextDueDate: null,
    severity: null,
  };

  if (sameDayWeight) {
    return healthRecordService.updateRecord(ownerId, sameDayWeight.id, {
      title: payload.title,
      description: payload.description,
      dateRecorded: payload.dateRecorded,
    });
  }

  return healthRecordService.createRecord(ownerId, payload);
}
