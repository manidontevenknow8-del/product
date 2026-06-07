import { useEffect, useState } from 'react';
import { LAUNCH_DATE } from '@/data/growthData';
import { getCountdownParts } from '@/utils/growthUtils';
import styles from './LaunchCountdown.module.css';

export function LaunchCountdown() {
  const [parts, setParts] = useState(() => getCountdownParts(LAUNCH_DATE));

  useEffect(() => {
    const interval = setInterval(() => {
      setParts(getCountdownParts(LAUNCH_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (parts.isPast) {
    return (
      <section className={styles.card} aria-label="Launch status">
        <span className={styles.eyebrow}>PetClues is live</span>
        <p className={styles.launched}>Welcome to the future of pet care</p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label="Launch countdown">
      <span className={styles.eyebrow}>Launch countdown</span>
      <div className={styles.grid}>
        <div className={styles.unit}>
          <span className={styles.value}>{parts.days}</span>
          <span className={styles.label}>Days</span>
        </div>
        <div className={styles.unit}>
          <span className={styles.value}>{String(parts.hours).padStart(2, '0')}</span>
          <span className={styles.label}>Hours</span>
        </div>
        <div className={styles.unit}>
          <span className={styles.value}>{String(parts.minutes).padStart(2, '0')}</span>
          <span className={styles.label}>Minutes</span>
        </div>
        <div className={styles.unit}>
          <span className={styles.value}>{String(parts.seconds).padStart(2, '0')}</span>
          <span className={styles.label}>Seconds</span>
        </div>
      </div>
    </section>
  );
}
