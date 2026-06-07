import { Link } from 'react-router-dom';
import type { CareRecommendation } from '@/types/petCareScore';
import styles from './CareRecommendationsCard.module.css';

type CareRecommendationsCardProps = {
  recommendations: CareRecommendation[];
};

export function CareRecommendationsCard({ recommendations }: CareRecommendationsCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Care recommendations</h2>
      <div className={styles.list}>
        {recommendations.map((rec) => (
          <div key={rec.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>{rec.title}</span>
              <span className={styles.impact}>{rec.impact} impact</span>
            </div>
            <p className={styles.desc}>{rec.description}</p>
            {rec.actionLabel && rec.actionPath && (
              <Link to={rec.actionPath} className={styles.action}>
                {rec.actionLabel} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}
