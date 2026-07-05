import { Link } from 'react-router-dom';
import type { CareRecommendation } from '@/types/petCareScore';
import styles from './CareRecommendationsSection.module.css';

type CareRecommendationsSectionProps = {
  recommendations: CareRecommendation[];
};

const IMPACT_LABELS: Record<CareRecommendation['impact'], string> = {
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
};

export function CareRecommendationsSection({ recommendations }: CareRecommendationsSectionProps) {
  if (recommendations.length === 0) {
    return (
      <section className={styles.wrap} data-reveal aria-labelledby="care-recs-heading">
        <p className={styles.eyebrow}>Recommended actions</p>
        <h2 id="care-recs-heading" className={styles.title}>
          You&apos;re in strong shape
        </h2>
        <p className={styles.empty}>
          No urgent score improvements right now. Keep logging check-ins and records to maintain
          momentum.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} data-reveal aria-labelledby="care-recs-heading">
      <p className={styles.eyebrow}>Recommended actions</p>
      <h2 id="care-recs-heading" className={styles.title}>
        What will move the score next
      </h2>
      <p className={styles.lead}>
        Targeted steps from your PetCare Score — each links to the right place to act.
      </p>
      <ul className={styles.list}>
        {recommendations.map((rec) => (
          <li key={rec.id} className={styles.item}>
            <div className={styles.itemHead}>
              <h3 className={styles.itemTitle}>{rec.title}</h3>
              <span className={`${styles.impact} ${styles[`impact_${rec.impact}`]}`}>
                {IMPACT_LABELS[rec.impact]}
              </span>
            </div>
            <p className={styles.desc}>{rec.description}</p>
            {rec.actionLabel && rec.actionPath && (
              <Link to={rec.actionPath} className={styles.action}>
                {rec.actionLabel}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
