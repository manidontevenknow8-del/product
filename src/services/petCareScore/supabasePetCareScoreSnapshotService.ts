import { getSupabaseClient } from '@/services/supabase/client';
import type {
  IPetCareScoreSnapshotService,
  PetCareScoreSnapshotRow,
} from './petCareScoreSnapshotTypes';
import {
  HISTORY_KEY_PREFIX,
  loadLegacyScoreHistory,
  mapSnapshotRow,
  MAX_SNAPSHOTS,
  MIGRATION_FLAG_KEY,
  recordedAtFromDate,
  shouldAppendScoreSnapshot,
} from './petCareScoreSnapshotTypes';

const SELECT = 'id, pet_id, score, factors_json, recorded_at';

async function fetchRows(petId: string, limit = MAX_SNAPSHOTS): Promise<PetCareScoreSnapshotRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pet_care_score_snapshots')
    .select(SELECT)
    .eq('pet_id', petId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return [...((data ?? []) as PetCareScoreSnapshotRow[])].reverse();
}

export const supabasePetCareScoreSnapshotService: IPetCareScoreSnapshotService = {
  async getForPet(petId, limit = MAX_SNAPSHOTS) {
    const rows = await fetchRows(petId, limit);
    return rows.map(mapSnapshotRow);
  },

  async appendIfNeeded(petId, input) {
    const history = await supabasePetCareScoreSnapshotService.getForPet(petId);
    if (!shouldAppendScoreSnapshot(history, input.score, input.date)) {
      return history;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('pet_care_score_snapshots').insert({
      pet_id: petId,
      score: input.score,
      factors_json: input.factorScores,
      recorded_at: recordedAtFromDate(input.date),
    });

    if (error) throw new Error(error.message);
    return supabasePetCareScoreSnapshotService.getForPet(petId);
  },

  async clearForPet(petId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('pet_care_score_snapshots')
      .delete()
      .eq('pet_id', petId);

    if (error) throw new Error(error.message);
  },

  async migrateFromLocalStorage(petIds) {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;

    const petIdSet = new Set(petIds);
    let migratedAny = false;

    try {
      for (const petId of petIdSet) {
        const legacy = loadLegacyScoreHistory(petId);
        if (legacy.length === 0) continue;

        for (const snapshot of legacy) {
          const supabase = getSupabaseClient();
          const { error } = await supabase.from('pet_care_score_snapshots').insert({
            pet_id: petId,
            score: snapshot.score,
            factors_json: snapshot.factorScores,
            recorded_at: recordedAtFromDate(snapshot.date),
          });

          if (error) throw new Error(error.message);
        }

        localStorage.removeItem(`${HISTORY_KEY_PREFIX}${petId}`);
        migratedAny = true;
      }

      if (migratedAny || petIdSet.size > 0) {
        localStorage.setItem(MIGRATION_FLAG_KEY, '1');
      }
    } catch {
      // Best-effort: legacy keys remain for a later attempt.
    }
  },
};
