import type { ScoreSnapshot } from '@/types/petCareScore';
import { getTrendLabel } from '@/utils/petCareScoreUtils';
import styles from './PetCareScoreCard.module.css';

type PetCareScoreCardProps = {
  snapshot: ScoreSnapshot;
  compact?: boolean;
};

export function PetCareScoreCard({ snapshot, compact = false }: PetCareScoreCardProps) {
  const trendClass =
    snapshot.trend === 'up'
      ? styles.trend
      : snapshot.trend === 'down'
        ? `${styles.trend} ${styles.trendDown}`
        : `${styles.trend} ${styles.trendStable}`;

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.header}>
        <div>
          <span className={styles.label}>PetCare Score</span>
          <div className={styles.scoreRow}>
            <span className={styles.score}>{snapshot.score}</span>
            <span className={styles.badge}>{snapshot.label}</span>
          </div>
        </div>
        <div className={styles.meta}>
          <span className={trendClass}>
            {snapshot.trend === 'up' && '↑ '}
            {snapshot.trend === 'down' && '↓ '}
            {getTrendLabel(snapshot.trend, snapshot.trendDelta)}
          </span>
          <p className={styles.updated}>Updated {snapshot.lastUpdated}</p>
        </div>
      </div>

      <div className={styles.meter} aria-hidden="true">
        <div className={styles.meterFill} style={{ width: `${snapshot.score}%` }} />
      </div>

      {!compact && <p className={styles.summary}>{snapshot.summary}</p>}
    </article>
  );
}
