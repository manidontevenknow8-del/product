const HAS_ACTIVE_PET_KEY = 'petclues_has_active_pet';

/** Whether the user has completed pet setup - replace with backend pet query */
export function getHasActivePet(): boolean {
  const stored = localStorage.getItem(HAS_ACTIVE_PET_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

export function setHasActivePet(value: boolean): void {
  localStorage.setItem(HAS_ACTIVE_PET_KEY, value ? 'true' : 'false');
}

/** @deprecated Use getHasActivePet() - kept for gradual migration */
export const appState = {
  get hasActivePet() {
    return getHasActivePet();
  },
};
