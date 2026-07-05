export {
  computePetCareScore,
  computePetCareScoreFromSources,
  type PetCareScoreComputeResult,
} from './petCareScoreEngine';
export {
  appendScoreSnapshotIfNeeded,
  clearScoreHistory,
  clearScoreSnapshotsForPet,
  getScoreSnapshotsForPet,
  loadPetCareScoreHistory,
} from './petCareScoreSnapshotService';
export type { PetCareScoreInput, StoredScoreSnapshot } from './petCareScoreTypes';
export {
  buildScoreDisplayMetrics,
  getFactorScore,
  type ScoreDisplayMetric,
} from './scoreDisplayMetrics';
