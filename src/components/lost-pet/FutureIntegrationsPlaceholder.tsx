import { FUTURE_INTEGRATIONS } from '@/data/lostPetData';
import styles from './FutureIntegrationsPlaceholder.module.css';

export function FutureIntegrationsPlaceholder() {
  return (
    <section className={styles.section} aria-label="Future recovery integrations">
      <h2 className={styles.title}>Recovery network expansion</h2>
      <p className={styles.subtitle}>
        Planned integrations to extend reach when every minute matters.
      </p>
      <div className={styles.grid}>
        {FUTURE_INTEGRATIONS.map((item) => (
          <div key={item.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardText}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
