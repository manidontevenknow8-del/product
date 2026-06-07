import { FUTURE_ACCESS_TYPES } from '@/data/familySharingData';
import styles from './FutureAccessPlaceholder.module.css';

export function FutureAccessPlaceholder() {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Coming soon: specialized access</h2>
      <p className={styles.subtitle}>
        PetClues will support tailored access for vets, groomers, boarding facilities,
        and emergency situations.
      </p>
      <div className={styles.grid}>
        {FUTURE_ACCESS_TYPES.map((type) => (
          <div key={type.id} className={styles.item}>
            <div className={styles.itemTitle}>{type.title}</div>
            <div className={styles.itemDesc}>{type.description}</div>
            <span className={styles.badge}>Planned</span>
          </div>
        ))}
      </div>
    </article>
  );
}
