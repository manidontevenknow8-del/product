import type { ScoreBreakdown } from '@/types/petCareScore';
import styles from './ScoreBreakdownCard.module.css';

type ScoreBreakdownCardProps = {
  breakdown: ScoreBreakdown;
};

export function ScoreBreakdownCard({ breakdown }: ScoreBreakdownCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Score breakdown</h2>

      {breakdown.increasedBecause.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Why your score increased</h3>
          <ul className={styles.list}>
            {breakdown.increasedBecause.map((msg) => (
              <li key={msg} className={`${styles.item} ${styles.itemUp}`}>
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {breakdown.decreasedBecause.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitleDown}>Why your score decreased</h3>
          <ul className={styles.list}>
            {breakdown.decreasedBecause.map((msg) => (
              <li key={msg} className={`${styles.item} ${styles.itemDown}`}>
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>What&apos;s helping</h3>
        <ul className={styles.list}>
          {breakdown.helping.map((f) => (
            <li key={f.id} className={styles.item}>
              {f.label} - {f.description}
            </li>
          ))}
        </ul>
      </div>

      {breakdown.improving.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitleImprove}>Room to grow</h3>
          <ul className={styles.list}>
            {breakdown.improving.map((f) => (
              <li key={f.id} className={`${styles.item} ${styles.itemImprove}`}>
                {f.label} - {f.suggestion ?? f.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {breakdown.suggestions.length > 0 && (
      <div className={styles.suggestions}>
        <h3 className={styles.sectionTitle}>Suggested next steps</h3>
        {breakdown.suggestions.map((s) => (
          <p key={s} className={styles.suggestion}>{s}</p>
        ))}
      </div>
      )}
    </article>
  );
}
