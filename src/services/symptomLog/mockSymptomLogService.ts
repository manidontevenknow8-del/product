import type { CreateSymptomLogInput, ISymptomLogService, SymptomLogRow } from './symptomLogTypes';
import { mapSymptomLogRow } from './symptomLogTypes';

const STORAGE_KEY = 'petclues_symptom_logs';

function loadRows(): SymptomLogRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SymptomLogRow[]) : [];
  } catch {
    return [];
  }
}

function saveRows(rows: SymptomLogRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export const mockSymptomLogService: ISymptomLogService = {
  async getLogsByPet(_ownerId, petId) {
    return loadRows()
      .filter((row) => row.pet_id === petId)
      .sort((a, b) => b.logged_at.localeCompare(a.logged_at))
      .map(mapSymptomLogRow);
  },

  async createLog(ownerId, input: CreateSymptomLogInput) {
    const now = new Date().toISOString();
    const created: SymptomLogRow = {
      id: crypto.randomUUID(),
      pet_id: input.petId,
      symptoms_json: input.symptoms,
      note: input.note?.trim() || null,
      photo_url: input.photoUrl?.trim() || null,
      logged_at: now,
      logged_by_user_id: ownerId,
      created_at: now,
    };
    const rows = loadRows();
    rows.push(created);
    saveRows(rows);
    return mapSymptomLogRow(created);
  },

  async deleteLog(_ownerId, logId) {
    saveRows(loadRows().filter((row) => row.id !== logId));
  },
};
