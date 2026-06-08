import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { SettingsToggle } from './SettingsToggle';
import { useSettings } from '@/settings';
import { ROUTES } from '@/routes/paths';
import type { PrivacySettings } from '@/types/settings';
import styles from './SettingsCard.module.css';

type PrivacySettingsCardProps = {
  onSave?: () => void;
};

export function PrivacySettingsCard({ onSave }: PrivacySettingsCardProps) {
  const { settings, updateSettings, isSaving } = useSettings();
  const [local, setLocal] = useState<PrivacySettings | null>(null);
  const [saved, setSaved] = useState(false);

  const privacy = local ?? settings?.privacy;
  if (!privacy || !settings) return null;

  const update = (patch: Partial<PrivacySettings>) => {
    setLocal((prev) => ({ ...(prev ?? privacy), ...patch }));
  };

  const handleSave = async () => {
    await updateSettings({ ...settings, privacy: local ?? privacy });
    setLocal(null);
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Privacy settings</h2>
      <p className={styles.subtitle}>
        Control how your information is shared and accessed.
      </p>

      <div className={styles.section}>
        <SettingsToggle
          label="Passport sharing preference"
          description="When secure sharing launches, this controls whether trusted contacts can view your emergency passport via link"
          checked={privacy.passportSharingEnabled}
          onChange={(v) => update({ passportSharingEnabled: v })}
        />
      </div>

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Public profile</div>
        <div className={styles.placeholderDesc}>
          A limited public view of your pet profile is on our roadmap. We will notify you before it launches.
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Data export</div>
        <div className={styles.placeholderDesc}>
          Request a copy of your pet records and account data.
        </div>
        <div className={styles.actions}>
          <Link to={ROUTES.DATA_EXPORT}>
            <Button variant="secondary" size="sm">
              Request export
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Delete account</div>
        <div className={styles.placeholderDesc}>
          Permanently remove your account and all associated pet data. This cannot be undone.
        </div>
        <div className={styles.actions}>
          <Link to={ROUTES.DATA_DELETION}>
            <Button variant="destructive" size="sm">
              Request deletion
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.actions}>
        {saved && <span className={styles.saved}>Privacy settings saved</span>}
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save privacy settings'}
        </Button>
      </div>
    </article>
  );
}
