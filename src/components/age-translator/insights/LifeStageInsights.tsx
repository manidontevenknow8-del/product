import type { LifeStageInsight } from '@/types/ageTranslator';
import styles from './LifeStageInsights.module.css';

type LifeStageInsightsProps = {
  insight: LifeStageInsight;
};

export function LifeStageInsights({ insight }: LifeStageInsightsProps) {
  return (
    <section className={styles.section} aria-label="Life stage insights">
      <h2 className={styles.title}>What this stage means</h2>
      <div className={styles.grid}>
        <div className={styles.column}>
          <span className={styles.columnTitle}>Care priorities</span>
          <ul className={styles.list}>
            {insight.carePriorities.map((item) => (
              <li key={item} className={styles.item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.column}>
          <span className={styles.columnTitle}>What to watch for</span>
          <ul className={styles.list}>
            {insight.watchFor.map((item) => (
              <li key={item} className={styles.item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.column}>
          <span className={styles.columnTitle}>Recommended checkups</span>
          <ul className={styles.list}>
            {insight.checkups.map((item) => (
              <li key={item} className={styles.item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
