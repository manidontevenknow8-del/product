import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Avatar } from '@/components/ui';
import { useSettings } from '@/settings';
import { ROUTES } from '@/routes/paths';
import type { AccountSettings } from '@/types/settings';
import styles from './SettingsCard.module.css';

type AccountSettingsCardProps = {
  onSave?: () => void;
};

export function AccountSettingsCard({ onSave }: AccountSettingsCardProps) {
  const { settings, updateSettings, isSaving } = useSettings();
  const [local, setLocal] = useState<AccountSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const account = local ?? settings?.account;
  if (!account || !settings) return null;

  const handleSave = async () => {
    await updateSettings({ ...settings, account: local ?? account });
    setLocal(null);
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (patch: Partial<AccountSettings>) => {
    setLocal((prev) => ({ ...(prev ?? account), ...patch }));
  };

  const initials = account.name.slice(0, 2).toUpperCase();

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Account settings</h2>
      <p className={styles.subtitle}>
        Your personal information and account management.
      </p>

      <div className={styles.section}>
        <div className={styles.photoRow}>
          <Avatar initials={initials} size="lg" />
          <div>
            <Button variant="secondary" size="sm" disabled>
              Change photo
            </Button>
            <p className={styles.photoHint}>Profile photo upload coming soon</p>
          </div>
        </div>

        <Input
          label="Name"
          value={local?.name ?? account.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={account.email}
          readOnly
          hint="Email is tied to your sign-in. Contact support if you need to change it."
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Password</div>
        <div className={styles.placeholderDesc}>
          Reset your password securely via email.
        </div>
        <div className={styles.actions}>
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button variant="secondary" size="sm">
              Reset password
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Your data</div>
        <div className={styles.placeholderDesc}>
          Export a copy of your records or request account deletion.
        </div>
        <div className={styles.actions}>
          <Link to={ROUTES.DATA_EXPORT}>
            <Button variant="secondary" size="sm">
              Export data
            </Button>
          </Link>
          <Link to={ROUTES.DATA_DELETION}>
            <Button variant="destructive" size="sm">
              Delete account
            </Button>
          </Link>
        </div>
      </div>

      <div className={styles.actions}>
        {saved && <span className={styles.saved}>Changes saved</span>}
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </article>
  );
}
