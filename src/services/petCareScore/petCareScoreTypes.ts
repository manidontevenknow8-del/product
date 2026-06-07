import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PassportData } from '@/services/passport/passportSummaryService';
import type { PetRecord } from '@/services/pets/petTypes';
import type { Reminder } from '@/types/reminder';

export type PetCareScoreInput = {
  pet: PetRecord;
  healthRecords: HealthRecord[];
  documents: PetDocumentRecord[];
  reminders: Reminder[];
  passport: PassportData;
  previousFactorScores?: Partial<Record<string, number>>;
  previousOverallScore?: number;
};

export type StoredScoreSnapshot = {
  date: string;
  score: number;
  factorScores: Record<string, number>;
};
