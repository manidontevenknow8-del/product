import { Button } from '@/components/ui';
import { SettingsToggle } from './SettingsToggle';
import { useSettings } from '@/settings';
import styles from './SettingsCard.module.css';

export function SecuritySettingsCard() {
  const { settings, updateSettings } = useSettings();
  if (!settings) return null;

  const handleTwoFactor = async (enabled: boolean) => {
    await updateSettings({
      ...settings,
      security: { ...settings.security, twoFactorEnabled: enabled },
    });
  };

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Security settings</h2>
      <p className={styles.subtitle}>
        Keep your account safe with additional security options.
      </p>

      <div className={styles.section}>
        <SettingsToggle
          label="Two-factor authentication"
          description="Add an extra layer of protection to your account (coming soon)"
          checked={settings.security.twoFactorEnabled}
          onChange={handleTwoFactor}
          disabled
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Active login sessions</div>
        <div className={styles.placeholderDesc}>
          Review devices where you&apos;re currently signed in and sign out remotely.
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" disabled>
            View sessions (coming soon)
          </Button>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Device management</div>
        <div className={styles.placeholderDesc}>
          Manage trusted devices and notification permissions per device.
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" disabled>
            Manage devices (coming soon)
          </Button>
        </div>
      </div>
    </article>
  );
}
