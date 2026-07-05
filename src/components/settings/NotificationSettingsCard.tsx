import { useState } from 'react';
import { Button } from '@/components/ui';
import { SettingsToggle } from './SettingsToggle';
import { useSettings } from '@/settings';
import { usePets } from '@/pets';
import { NOTIFICATION_PREFERENCE_LABELS } from '@/data/settingsData';
import {
  getStreakRiskPushSupport,
  subscribeStreakRiskPush,
  unsubscribeStreakRiskPush,
} from '@/services/push';
import type { NotificationPreferenceKey, NotificationSettings } from '@/types/settings';
import styles from './SettingsCard.module.css';

type NotificationSettingsCardProps = {
  onSave?: () => void;
};

const IN_APP_KEYS: NotificationPreferenceKey[] = [
  'reminderNotifications',
  'upcomingCareAlerts',
  'productUpdates',
  'monthlyRecap',
];

const EMAIL_KEYS: NotificationPreferenceKey[] = [
  'emailUpcomingReminders',
  'emailOverdueReminders',
  'emailWeeklySummary',
];

const PUSH_KEYS: NotificationPreferenceKey[] = ['pushStreakReminders'];

export function NotificationSettingsCard({ onSave }: NotificationSettingsCardProps) {
  const { settings, updateSettings, isSaving } = useSettings();
  const { activePet } = usePets();
  const [local, setLocal] = useState<NotificationSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const pushSupport = getStreakRiskPushSupport();

  const notifications = local ?? settings?.notifications;
  if (!notifications || !settings) return null;

  const handleToggle = (key: NotificationPreferenceKey, value: boolean) => {
    setPushError(null);
    setLocal((prev) => ({
      ...(prev ?? notifications),
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setPushError(null);
    const nextNotifications = local ?? notifications;
    const wasPushEnabled = settings.notifications.pushStreakReminders;
    const willPushEnable = nextNotifications.pushStreakReminders;

    await updateSettings({
      ...settings,
      notifications: nextNotifications,
    });

    try {
      if (willPushEnable && !wasPushEnabled) {
        await subscribeStreakRiskPush(activePet?.id ?? null);
      } else if (!willPushEnable && wasPushEnabled) {
        await unsubscribeStreakRiskPush();
      } else if (willPushEnable && wasPushEnabled) {
        await subscribeStreakRiskPush(activePet?.id ?? null);
      }
    } catch (err) {
      setPushError(err instanceof Error ? err.message : 'Could not update push subscription.');
    }

    setLocal(null);
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2500);
  };

  const renderToggles = (keys: NotificationPreferenceKey[]) =>
    keys.map((key) => {
      const { label, description } = NOTIFICATION_PREFERENCE_LABELS[key];
      const disabled = key === 'pushStreakReminders' && !pushSupport.supported;
      return (
        <SettingsToggle
          key={key}
          label={label}
          description={
            disabled && pushSupport.reason ? `${description} (${pushSupport.reason})` : description
          }
          checked={notifications[key]}
          disabled={disabled}
          onChange={(v) => handleToggle(key, v)}
        />
      );
    });

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Notification preferences</h2>
      <p className={styles.subtitle}>
        Control in-app alerts, email delivery, and optional browser push for check-in streaks.
      </p>

      <div className={styles.section}>
        <h3 className={styles.sectionLabel}>In-app</h3>
        {renderToggles(IN_APP_KEYS)}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionLabel}>Email (Resend)</h3>
        <p className={styles.sectionHint}>
          Care reminder emails are sent from PetClues via Resend.
        </p>
        {renderToggles(EMAIL_KEYS)}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionLabel}>Browser push</h3>
        <p className={styles.sectionHint}>
          Streak reminders only — a gentle nudge in the evening if today&apos;s check-in is still
          open. No other push types yet.
        </p>
        {renderToggles(PUSH_KEYS)}
      </div>

      <div className={styles.actions}>
        {pushError && <span className={styles.error}>{pushError}</span>}
        {saved && <span className={styles.saved}>Preferences saved</span>}
        <Button variant="primary" onClick={() => void handleSave()} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>
    </article>
  );
}
