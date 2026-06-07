import { Link } from 'react-router-dom';
import { NotificationSettingsCard } from '@/components/settings';
import { ROUTES } from '@/routes/paths';
import styles from './NotificationPreferences.module.css';

export function NotificationPreferences() {
  return (
    <div className={styles.wrapper}>
      <NotificationSettingsCard />
      <p className={styles.hint}>
        Email reminders (upcoming, overdue, weekly summary) are delivered via Resend when enabled above.
        {' '}
        <Link to={ROUTES.SETTINGS} className={styles.link}>
          Manage all settings →
        </Link>
      </p>
    </div>
  );
}
