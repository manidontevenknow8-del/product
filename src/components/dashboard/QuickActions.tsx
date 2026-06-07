import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import styles from './QuickActions.module.css';

const actions = [
  { label: 'PetCare Score', path: ROUTES.PET_CARE_SCORE },
  { label: 'Monthly report', path: ROUTES.MONTHLY_REPORT },
  { label: 'Timeline', path: ROUTES.TIMELINE },
  { label: 'Settings', path: ROUTES.SETTINGS },
  { label: 'Scan record', path: ROUTES.SCAN },
  { label: 'View passport', path: ROUTES.EMERGENCY_PASSPORT },
  { label: 'Add reminder', path: `${ROUTES.REMINDERS}?create=true` },
];

export function QuickActions() {
  return (
    <section className={styles.section}>
      <SectionHeader title="Quick actions" />
      <div className={styles.grid}>
        {actions.map((action) => (
          <Link key={action.label} to={action.path} className={styles.action}>
            <div className={styles.icon}>
              <div className={styles.iconInner} />
            </div>
            <span className={styles.label}>{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
