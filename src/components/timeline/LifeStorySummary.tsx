import type { LifeStorySummary as LifeStorySummaryData } from '@/types/timeline';
import styles from './LifeStorySummary.module.css';

type LifeStorySummaryProps = {
  summary: LifeStorySummaryData;
};

export function LifeStorySummary({ summary }: LifeStorySummaryProps) {
  return (
    <section className={styles.card} aria-label="Timeline summary">
      <p className={styles.eyebrow}>At a glance</p>
      <h2 className={styles.headline}>{summary.headline}</h2>
      <p className={styles.detail}>{summary.detail}</p>

      {summary.highlights.length > 0 && (
        <div className={styles.highlights}>
          {summary.highlights.map((item) => (
            <div key={item.label} className={styles.highlight}>
              <span className={styles.highlightValue}>{item.value}</span>
              <span className={styles.highlightLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
