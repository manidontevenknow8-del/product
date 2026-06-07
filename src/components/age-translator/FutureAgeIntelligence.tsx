import { FUTURE_AGE_FEATURES } from '@/data/ageTranslatorData';
import styles from './FutureAgeIntelligence.module.css';

export function FutureAgeIntelligence() {
  return (
    <section className={styles.section} aria-label="Coming soon">
      <h2 className={styles.title}>Smarter insights ahead</h2>
      <p className={styles.subtitle}>
        PetClues will go deeper with personalised, AI-powered life stage intelligence.
      </p>
      <div className={styles.grid}>
        {FUTURE_AGE_FEATURES.map((feature) => (
          <div key={feature.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardText}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
