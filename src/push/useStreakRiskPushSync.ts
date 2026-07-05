import { useEffect } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useSettings } from '@/settings';
import { syncStreakRiskPushSubscription } from '@/services/push';

/**
 * Keeps the server-side push subscription aligned with the active pet
 * when streak-risk reminders are enabled.
 */
export function useStreakRiskPushSync(activePetId: string | null | undefined) {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const enabled = settings?.notifications.pushStreakReminders === true;

  useEffect(() => {
    if (!isAuthenticated || !enabled || !activePetId) return;
    void syncStreakRiskPushSubscription(activePetId).catch(() => {
      // Non-blocking — subscription may not exist yet until user opts in from Settings.
    });
  }, [isAuthenticated, enabled, activePetId]);
}
