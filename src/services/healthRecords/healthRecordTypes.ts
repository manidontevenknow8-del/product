export type HealthRecordType =
  | 'vaccination'
  | 'allergy'
  | 'medication'
  | 'diagnosis'
  | 'surgery'
  | 'weight'
  | 'wellness';

export type HealthRecordSeverity = 'low' | 'medium' | 'high';

export type HealthRecord = {
  id: string;
  petId: string;
  sourceDocumentId: string | null;
  sourceDocumentName: string | null;
  sourceDocumentUploadedAt: string | null;
  recordType: HealthRecordType;
  title: string;
  description: string | null;
  dateRecorded: string;
  nextDueDate: string | null;
  severity: HealthRecordSeverity | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateHealthRecordInput = {
  petId: string;
  sourceDocumentId?: string | null;
  recordType: HealthRecordType;
  title: string;
  description?: string | null;
  dateRecorded: string;
  nextDueDate?: string | null;
  severity?: HealthRecordSeverity | null;
};

export type UpdateHealthRecordInput = Partial<
  Omit<CreateHealthRecordInput, 'petId'>
>;

export type HealthRecordRow = {
  id: string;
  pet_id: string;
  source_document_id: string | null;
  record_type: string;
  title: string;
  description: string | null;
  date_recorded: string;
  next_due_date: string | null;
  severity: string | null;
  created_at: string;
  updated_at: string;
};

export type HealthRecordRowWithDocument = HealthRecordRow & {
  pet_documents: { file_name: string; uploaded_at: string } | null;
};

export interface IHealthRecordService {
  getRecordsByPet(ownerId: string, petId: string): Promise<HealthRecord[]>;
  getRecordsByType(
    ownerId: string,
    petId: string,
    recordType: HealthRecordType,
  ): Promise<HealthRecord[]>;
  createRecord(ownerId: string, input: CreateHealthRecordInput): Promise<HealthRecord>;
  updateRecord(
    ownerId: string,
    recordId: string,
    input: UpdateHealthRecordInput,
  ): Promise<HealthRecord>;
  deleteRecord(ownerId: string, recordId: string): Promise<void>;
}

export const HEALTH_RECORD_TYPES: HealthRecordType[] = [
  'vaccination',
  'allergy',
  'medication',
  'diagnosis',
  'surgery',
  'weight',
  'wellness',
];

export const healthRecordTypeLabels: Record<HealthRecordType, string> = {
  vaccination: 'Vaccination',
  allergy: 'Allergy',
  medication: 'Medication',
  diagnosis: 'Diagnosis',
  surgery: 'Surgery',
  weight: 'Weight',
  wellness: 'Wellness',
};

export const healthRecordSeverityLabels: Record<HealthRecordSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
