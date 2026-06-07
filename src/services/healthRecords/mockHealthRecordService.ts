import type { HealthRecord, HealthRecordRow, IHealthRecordService } from './healthRecordTypes';
import {
  healthRecordInputToRow,
  healthRecordUpdateToRow,
  mapHealthRecordRow,
} from './healthRecordMappers';

const STORAGE_KEY = 'petclues_health_records';

function loadRows(): HealthRecordRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HealthRecordRow[]) : [];
  } catch {
    return [];
  }
}

function saveRows(rows: HealthRecordRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function toRecord(row: HealthRecordRow): HealthRecord {
  return mapHealthRecordRow({ ...row, pet_documents: null });
}

export const mockHealthRecordService: IHealthRecordService = {
  async getRecordsByPet(_ownerId, petId) {
    return loadRows()
      .filter((row) => row.pet_id === petId)
      .sort((a, b) => b.date_recorded.localeCompare(a.date_recorded))
      .map(toRecord);
  },

  async getRecordsByType(_ownerId, petId, recordType) {
    const records = await this.getRecordsByPet(_ownerId, petId);
    return records.filter((record) => record.recordType === recordType);
  },

  async createRecord(_ownerId, input) {
    const now = new Date().toISOString();
    const row: HealthRecordRow = {
      id: crypto.randomUUID(),
      ...healthRecordInputToRow(input),
      created_at: now,
      updated_at: now,
    };
    const rows = loadRows();
    rows.push(row);
    saveRows(rows);
    return toRecord(row);
  },

  async updateRecord(_ownerId, recordId, input) {
    const rows = loadRows();
    const index = rows.findIndex((row) => row.id === recordId);
    if (index < 0) throw new Error('Health record not found');

    const updated: HealthRecordRow = {
      ...rows[index],
      ...healthRecordUpdateToRow(input),
      updated_at: new Date().toISOString(),
    };
    rows[index] = updated;
    saveRows(rows);
    return toRecord(updated);
  },

  async deleteRecord(_ownerId, recordId) {
    saveRows(loadRows().filter((row) => row.id !== recordId));
  },
};
