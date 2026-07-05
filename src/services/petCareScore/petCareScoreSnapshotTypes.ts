import type { StoredScoreSnapshot } from '@/services/petCareScore/petCareScoreTypes';

export type PetCareScoreSnapshotRow = {
  id: string;
  pet_id: string;
  score: number;
  factors_json: Record<string, number>;
  recorded_at: string;
};

export type AppendScoreSnapshotInput = {
  date: string;
  score: number;
  factorScores: Record<string, number>;
};

export interface IPetCareScoreSnapshotService {
  getForPet(petId: string, limit?: number): Promise<StoredScoreSnapshot[]>;
  appendIfNeeded(petId: string, input: AppendScoreSnapshotInput): Promise<StoredScoreSnapshot[]>;
  clearForPet(petId: string): Promise<void>;
  migrateFromLocalStorage(petIds: string[]): Promise<void>;
}

const HISTORY_KEY_PREFIX = 'petclues_score_history_';
const MIGRATION_FLAG_KEY = 'petclues_score_history_migrated_v1';
const MAX_SNAPSHOTS = 12;

export function snapshotDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function mapSnapshotRow(row: PetCareScoreSnapshotRow): StoredScoreSnapshot {
  return {
    date: snapshotDateKey(row.recorded_at),
    score: row.score,
    factorScores: row.factors_json ?? {},
  };
}

export function shouldAppendScoreSnapshot(
  history: StoredScoreSnapshot[],
  score: number,
  date = new Date().toISOString().slice(0, 10),
): boolean {
  const last = history[history.length - 1];
  return !(last?.date === date && last.score === score);
}

export function recordedAtFromDate(date: string): string {
  return `${date}T12:00:00.000Z`;
}

export function loadLegacyScoreHistory(petId: string): StoredScoreSnapshot[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY_PREFIX}${petId}`);
    return raw ? (JSON.parse(raw) as StoredScoreSnapshot[]) : [];
  } catch {
    return [];
  }
}

export function clearLegacyScoreHistory(petId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(`${HISTORY_KEY_PREFIX}${petId}`);
}

export { HISTORY_KEY_PREFIX, MIGRATION_FLAG_KEY, MAX_SNAPSHOTS };
