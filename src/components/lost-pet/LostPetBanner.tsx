import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLostPet } from '@/lostPet';
import { formatMissingSince } from '@/utils/lostPetUtils';
import { ROUTES } from '@/routes/paths';
import styles from './LostPetBanner.module.css';

export function LostPetBanner() {
  const { isActive, activeCase } = useLostPet();
  const [missingSince, setMissingSince] = useState('');

  useEffect(() => {
    if (!activeCase) return;
    const update = () => setMissingSince(formatMissingSince(activeCase.activatedAt));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [activeCase]);

  if (!isActive || !activeCase) return null;

  return (
    <div className={styles.banner} role="alert" aria-live="polite">
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.pulse} aria-hidden="true" />
          <div>
            <span className={styles.label}>Lost pet mode active</span>
            <p className={styles.text}>
              {activeCase.petName} missing ·{' '}
              <span className={styles.timer}>{missingSince}</span>
            </p>
          </div>
        </div>
        <div className={styles.actions}>
          <Link to={ROUTES.LOST_PET} className={`${styles.link} ${styles.linkPrimary}`}>
            Recovery dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
