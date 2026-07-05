import { isSupabaseConfigured } from '@/services/supabase/config';
import type { StoredScoreSnapshot } from './petCareScoreTypes';
import { mockPetCareScoreSnapshotService } from './mockPetCareScoreSnapshotService';
import { supabasePetCareScoreSnapshotService } from './supabasePetCareScoreSnapshotService';
import type { AppendScoreSnapshotInput } from './petCareScoreSnapshotTypes';

function getPetCareScoreSnapshotService() {
  return isSupabaseConfigured()
    ? supabasePetCareScoreSnapshotService
    : mockPetCareScoreSnapshotService;
}

export async function getScoreSnapshotsForPet(
  petId: string,
  options?: { limit?: number; migratePetIds?: string[] },
): Promise<StoredScoreSnapshot[]> {
  const service = getPetCareScoreSnapshotService();
  if (options?.migratePetIds?.length) {
    await service.migrateFromLocalStorage(options.migratePetIds);
  }
  return service.getForPet(petId, options?.limit);
}

export async function appendScoreSnapshotIfNeeded(
  petId: string,
  input: AppendScoreSnapshotInput,
): Promise<StoredScoreSnapshot[]> {
  return getPetCareScoreSnapshotService().appendIfNeeded(petId, input);
}

export async function clearScoreSnapshotsForPet(petId: string): Promise<void> {
  return getPetCareScoreSnapshotService().clearForPet(petId);
}

/** @deprecated Use clearScoreSnapshotsForPet */
export async function clearScoreHistory(petId: string): Promise<void> {
  return clearScoreSnapshotsForPet(petId);
}

export async function loadPetCareScoreHistory(petId: string): Promise<StoredScoreSnapshot[]> {
  return getScoreSnapshotsForPet(petId);
}
