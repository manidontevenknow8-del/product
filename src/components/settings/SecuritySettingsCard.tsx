import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import styles from './SettingsCard.module.css';

export function SecuritySettingsCard() {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Security settings</h2>
      <p className={styles.subtitle}>
        Keep your account safe with password resets and future security options.
      </p>

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Password</div>
        <div className={styles.placeholderDesc}>
          Reset your password securely via a link sent to your registered email.
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
        <div className={styles.placeholderTitle}>Two-factor authentication</div>
        <div className={styles.placeholderDesc}>
          An extra layer of protection for your account is coming soon. You will be able to enable it here when it launches.
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>Active login sessions</div>
        <div className={styles.placeholderDesc}>
          Review devices where you are signed in and sign out remotely - planned for a future release.
        </div>
      </div>
    </article>
  );
}
