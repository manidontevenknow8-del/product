import type { DailyCheckInRow, IDailyCheckInService } from './dailyCheckInTypes';
import { mapDailyCheckInRow } from './dailyCheckInTypes';
import type { UpsertDailyCheckInInput } from '@/types/dailyCheckIn';

const STORAGE_KEY = 'petclues_daily_check_ins';

function loadRows(): DailyCheckInRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DailyCheckInRow[]) : [];
  } catch {
    return [];
  }
}

function saveRows(rows: DailyCheckInRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export const mockDailyCheckInService: IDailyCheckInService = {
  async getCheckInsByPet(_ownerId, petId) {
    return loadRows()
      .filter((row) => row.pet_id === petId)
      .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date))
      .map(mapDailyCheckInRow);
  },

  async upsertCheckIn(_ownerId, input: UpsertDailyCheckInInput) {
    const now = new Date().toISOString();
    const rows = loadRows();
    const index = rows.findIndex(
      (row) => row.pet_id === input.petId && row.check_in_date === input.checkInDate,
    );

    if (index >= 0) {
      const updated: DailyCheckInRow = {
        ...rows[index]!,
        feeding: input.feeding.trim(),
        walk_distance_km: input.walkDistanceKm ?? null,
        weight_kg: input.weightKg ?? null,
        notes: input.notes?.trim() || null,
        updated_at: now,
      };
      rows[index] = updated;
      saveRows(rows);
      return mapDailyCheckInRow(updated);
    }

    const created: DailyCheckInRow = {
      id: crypto.randomUUID(),
      pet_id: input.petId,
      check_in_date: input.checkInDate,
      feeding: input.feeding.trim(),
      walk_distance_km: input.walkDistanceKm ?? null,
      weight_kg: input.weightKg ?? null,
      notes: input.notes?.trim() || null,
      created_at: now,
      updated_at: now,
    };
    rows.push(created);
    saveRows(rows);
    return mapDailyCheckInRow(created);
  },

  async deleteCheckIn(_ownerId, checkInId) {
    saveRows(loadRows().filter((row) => row.id !== checkInId));
  },
};
