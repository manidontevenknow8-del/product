export const COMMON_PET_SYMPTOMS = [
  'Vomiting',
  'Diarrhea',
  'Low appetite',
  'Lethargy',
  'Coughing',
  'Itching / scratching',
  'Limping',
  'Increased thirst',
  'Sneezing',
] as const;

export type CommonPetSymptom = (typeof COMMON_PET_SYMPTOMS)[number];

export type SymptomLog = {
  id: string;
  petId: string;
  symptoms: string[];
  note: string | null;
  photoUrl: string | null;
  loggedAt: string;
  loggedByUserId: string | null;
  createdAt: string;
};

export type CreateSymptomLogInput = {
  petId: string;
  symptoms: string[];
  note?: string | null;
  photoUrl?: string | null;
};

export type SymptomLogRow = {
  id: string;
  pet_id: string;
  symptoms_json: unknown;
  note: string | null;
  photo_url: string | null;
  logged_at: string;
  logged_by_user_id: string | null;
  created_at: string;
};

export interface ISymptomLogService {
  getLogsByPet(ownerId: string, petId: string): Promise<SymptomLog[]>;
  createLog(ownerId: string, input: CreateSymptomLogInput): Promise<SymptomLog>;
  deleteLog(ownerId: string, logId: string): Promise<void>;
}

export function mapSymptomLogRow(row: SymptomLogRow): SymptomLog {
  const symptoms = Array.isArray(row.symptoms_json)
    ? row.symptoms_json.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : [];

  return {
    id: row.id,
    petId: row.pet_id,
    symptoms,
    note: row.note,
    photoUrl: row.photo_url,
    loggedAt: row.logged_at,
    loggedByUserId: row.logged_by_user_id,
    createdAt: row.created_at,
  };
}
