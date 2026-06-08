import type { ScoreFactor } from '@/types/petCareScore';
import { getFactorStatusLabel } from '@/utils/petCareScoreUtils';
import styles from './ScoreFactorsCard.module.css';

type ScoreFactorsCardProps = {
  factors: ScoreFactor[];
};

export function ScoreFactorsCard({ factors }: ScoreFactorsCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Score factors</h2>
      <p className={styles.subtitle}>
        Six areas that shape your wellness score - all improvable with small, steady actions.
      </p>
      <div className={styles.list}>
        {factors.map((factor) => (
          <div key={factor.id} className={styles.factor}>
            <div className={styles.factorHeader}>
              <span className={styles.factorLabel}>{factor.label}</span>
              <span className={styles.factorScore}>{factor.score}</span>
            </div>
            <div className={styles.bar}>
              <div className={styles.barFill} style={{ width: `${factor.score}%` }} />
            </div>
            <p className={styles.factorDesc}>{factor.description}</p>
            <span className={styles.status}>{getFactorStatusLabel(factor.status)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
