import { useState } from 'react';
import { Button } from '@/components/ui';
import { SettingsToggle } from './SettingsToggle';
import { useSettings } from '@/settings';
import { NOTIFICATION_PREFERENCE_LABELS } from '@/data/settingsData';
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

export function NotificationSettingsCard({ onSave }: NotificationSettingsCardProps) {
  const { settings, updateSettings, isSaving } = useSettings();
  const [local, setLocal] = useState<NotificationSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const notifications = local ?? settings?.notifications;
  if (!notifications || !settings) return null;

  const handleToggle = (key: NotificationPreferenceKey, value: boolean) => {
    setLocal((prev) => ({
      ...(prev ?? notifications),
      [key]: value,
    }));
  };

  const handleSave = async () => {
    await updateSettings({
      ...settings,
      notifications: local ?? notifications,
    });
    setLocal(null);
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2500);
  };

  const renderToggles = (keys: NotificationPreferenceKey[]) =>
    keys.map((key) => {
      const { label, description } = NOTIFICATION_PREFERENCE_LABELS[key];
      return (
        <SettingsToggle
          key={key}
          label={label}
          description={description}
          checked={notifications[key]}
          onChange={(v) => handleToggle(key, v)}
        />
      );
    });

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Notification preferences</h2>
      <p className={styles.subtitle}>
        Control in-app alerts and email delivery. Push notifications are not available yet.
      </p>

      <div className={styles.section}>
        <h3 className={styles.sectionLabel}>In-app</h3>
        {renderToggles(IN_APP_KEYS)}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionLabel}>Email (Resend)</h3>
        <p className={styles.sectionHint}>
          Care reminder emails are sent from PetClues via Resend. No push notifications.
        </p>
        {renderToggles(EMAIL_KEYS)}
      </div>

      <div className={styles.actions}>
        {saved && <span className={styles.saved}>Preferences saved</span>}
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>
    </article>
  );
}
