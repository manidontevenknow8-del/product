import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import { formatPassportRecordLine } from '@/services/passport/passportSummaryService';
import type { EmergencyCriticalFields } from './emergencyPassportTypes';
import { normalizeCriticalFields } from './emergencyPassportTypes';

export function buildCriticalFieldsFromSources(
  pet: PetRecord,
  records: HealthRecord[],
  existing?: Partial<EmergencyCriticalFields> | null,
): EmergencyCriticalFields {
  const allergies = records
    .filter((record) => record.recordType === 'allergy')
    .map((record) => formatPassportRecordLine(record));

  const medications = records
    .filter((record) => record.recordType === 'medication')
    .map((record) => formatPassportRecordLine(record));

  return normalizeCriticalFields({
    allergies: existing?.allergies?.length ? existing.allergies : allergies,
    medications: existing?.medications?.length ? existing.medications : medications,
    vetName: existing?.vetName ?? null,
    vetPhone: existing?.vetPhone ?? null,
    insuranceProvider: existing?.insuranceProvider ?? null,
    insurancePolicyNumber: existing?.insurancePolicyNumber ?? null,
    microchipId: existing?.microchipId ?? pet.microchipId ?? null,
    ownerPhonePrimary: existing?.ownerPhonePrimary ?? null,
    ownerPhoneSecondary: existing?.ownerPhoneSecondary ?? null,
    rabiesTagNumber: existing?.rabiesTagNumber ?? null,
  });
}
