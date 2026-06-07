import { FUTURE_PET_CARE_FEATURES } from '@/data/petCareScoreData';
import styles from './FuturePetCareIntelligence.module.css';

export function FuturePetCareIntelligence() {
  return (
    <section className={styles.section} aria-label="Coming soon">
      <h2 className={styles.title}>Smarter scoring ahead</h2>
      <p className={styles.subtitle}>
        PetCare Score will grow with AI-powered insights and deeper personalization.
      </p>
      <div className={styles.grid}>
        {FUTURE_PET_CARE_FEATURES.map((feature) => (
          <div key={feature.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardText}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
