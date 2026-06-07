import { Link } from 'react-router-dom';
import { useFamilySharing } from '@/familySharing';
import { usePets } from '@/pets';
import { ROUTES } from '@/routes/paths';
import styles from './FamilySharingWidget.module.css';

export function FamilySharingWidget() {
  const { activePet } = usePets();
  const { caretakers } = useFamilySharing();
  const petLabel = activePet?.name ?? 'your pet';
  const activeCount = caretakers.filter((c) => c.status === 'active').length;
  const pendingCount = caretakers.filter((c) => c.status === 'pending').length;

  return (
    <Link to={ROUTES.FAMILY_ACCESS} className={styles.card}>
      <span className={styles.eyebrow}>Shared care</span>
      <h2 className={styles.title}>Family & caretakers</h2>
      <p className={styles.desc}>
        Invite partners, family, or pet sitters to help manage {petLabel}&apos;s care together.
      </p>
      <div className={styles.meta}>
        <span className={styles.count}>
          {activeCount} active
          {pendingCount > 0 && ` · ${pendingCount} pending`}
        </span>
        <span className={styles.link}>Manage access →</span>
      </div>
    </Link>
  );
}
