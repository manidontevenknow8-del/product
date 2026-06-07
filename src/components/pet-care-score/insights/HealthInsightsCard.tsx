import type { HealthInsight } from '@/types/petCareScore';
import styles from './HealthInsightsCard.module.css';

type HealthInsightsCardProps = {
  insights: HealthInsight[];
};

export function HealthInsightsCard({ insights }: HealthInsightsCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Health insights</h2>
      <div className={styles.list}>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`${styles.item} ${styles[insight.type]}`}
          >
            <span className={styles.icon} aria-hidden="true" />
            <div className={styles.content}>
              <p className={styles.message}>{insight.message}</p>
              <span className={styles.category}>{insight.category}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
