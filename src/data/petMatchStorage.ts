/** localStorage key for breed pre-fill after Pet Match → signup → onboarding */
export const PENDING_PET_MATCH_STORAGE_KEY = 'petclues_pending_match';

export function savePendingPetMatch(breedName: string): void {
  if (!breedName.trim()) return;
  localStorage.setItem(PENDING_PET_MATCH_STORAGE_KEY, breedName.trim());
}

export function readPendingPetMatch(): string | null {
  try {
    return localStorage.getItem(PENDING_PET_MATCH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearPendingPetMatch(): void {
  try {
    localStorage.removeItem(PENDING_PET_MATCH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function consumePendingPetMatch(): string | null {
  const value = readPendingPetMatch();
  if (value) clearPendingPetMatch();
  return value;
}
