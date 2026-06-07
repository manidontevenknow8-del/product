import type { BreedInsight } from '@/types/ageTranslator';
import styles from './BreedSpecificInsights.module.css';

const categoryLabels: Record<BreedInsight['category'], string> = {
  joints: 'Joint health',
  weight: 'Weight',
  dental: 'Dental',
  activity: 'Activity',
  coat: 'Coat',
  general: 'General',
};

type BreedSpecificInsightsProps = {
  insights: BreedInsight[];
  breed: string;
};

export function BreedSpecificInsights({ insights, breed }: BreedSpecificInsightsProps) {
  return (
    <section className={styles.section} aria-label="Breed-specific insights">
      <h2 className={styles.title}>Insights for {breed}</h2>
      <p className={styles.subtitle}>
        Educational tips tailored to your companion&apos;s breed — always consult your vet for personalised advice.
      </p>
      <div className={styles.grid}>
        {insights.map((insight) => (
          <article key={insight.id} className={styles.card}>
            <span className={styles.category}>{categoryLabels[insight.category]}</span>
            <h3 className={styles.cardTitle}>{insight.title}</h3>
            <p className={styles.cardDesc}>{insight.description}</p>
            <p className={styles.tip}>{insight.tip}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
