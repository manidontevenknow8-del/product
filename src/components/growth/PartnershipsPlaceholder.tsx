import { PARTNERSHIP_PLACEHOLDERS } from '@/data/growthData';
import styles from './PartnershipsPlaceholder.module.css';

export function PartnershipsPlaceholder() {
  return (
    <section className={styles.section} aria-label="Future partnerships">
      <h2 className={styles.title}>Partnership programs</h2>
      <p className={styles.subtitle}>
        Future ways to grow PetClues together - without compromising what makes it special.
      </p>

      <div className={styles.grid}>
        {PARTNERSHIP_PLACEHOLDERS.map((item) => (
          <div key={item.id} className={styles.card}>
            <span className={styles.label}>Coming soon</span>
            <h3 className={styles.cardTitle}>{item.label}</h3>
            <p className={styles.cardText}>{item.description}</p>
            <span className={styles.comingSoon}>Integration point: partnerships API</span>
          </div>
        ))}
      </div>
    </section>
  );
}
