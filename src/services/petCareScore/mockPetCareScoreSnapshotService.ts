import type { StoredScoreSnapshot } from './petCareScoreTypes';
import type {
  AppendScoreSnapshotInput,
  IPetCareScoreSnapshotService,
  PetCareScoreSnapshotRow,
} from './petCareScoreSnapshotTypes';
import {
  HISTORY_KEY_PREFIX,
  mapSnapshotRow,
  MAX_SNAPSHOTS,
  shouldAppendScoreSnapshot,
} from './petCareScoreSnapshotTypes';

function loadRows(petId: string): PetCareScoreSnapshotRow[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY_PREFIX}${petId}`);
    if (!raw) return [];
    const snapshots = JSON.parse(raw) as StoredScoreSnapshot[];
    return snapshots.map((snapshot, index) => ({
      id: `${petId}-${index}`,
      pet_id: petId,
      score: snapshot.score,
      factors_json: snapshot.factorScores,
      recorded_at: `${snapshot.date}T12:00:00.000Z`,
    }));
  } catch {
    return [];
  }
}

function saveRows(petId: string, rows: PetCareScoreSnapshotRow[]) {
  if (typeof localStorage === 'undefined') return;
  const snapshots = rows.slice(-MAX_SNAPSHOTS).map((row) => mapSnapshotRow(row));
  localStorage.setItem(`${HISTORY_KEY_PREFIX}${petId}`, JSON.stringify(snapshots));
}

export const mockPetCareScoreSnapshotService: IPetCareScoreSnapshotService = {
  async getForPet(petId, limit = MAX_SNAPSHOTS) {
    return loadRows(petId)
      .slice(-limit)
      .map(mapSnapshotRow);
  },

  async appendIfNeeded(petId, input: AppendScoreSnapshotInput) {
    const history = await mockPetCareScoreSnapshotService.getForPet(petId);
    if (!shouldAppendScoreSnapshot(history, input.score, input.date)) {
      return history;
    }

    const rows = loadRows(petId);
    rows.push({
      id: crypto.randomUUID(),
      pet_id: petId,
      score: input.score,
      factors_json: input.factorScores,
      recorded_at: `${input.date}T12:00:00.000Z`,
    });
    saveRows(petId, rows);
    return mockPetCareScoreSnapshotService.getForPet(petId);
  },

  async clearForPet(petId) {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(`${HISTORY_KEY_PREFIX}${petId}`);
  },

  async migrateFromLocalStorage() {
    // Mock mode already reads legacy storage in loadRows().
  },
};
