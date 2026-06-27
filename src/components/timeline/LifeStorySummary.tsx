import type { LifeStorySummary as LifeStorySummaryData } from '@/types/timeline';
import styles from './LifeStorySummary.module.css';

type LifeStorySummaryProps = {
  summary: LifeStorySummaryData;
};

export function LifeStorySummary({ summary }: LifeStorySummaryProps) {
  return (
    <section className={styles.section} aria-label="Timeline summary">
      <p className={styles.eyebrow}>At a glance</p>
      <div className={styles.content}>
        <h2 className={styles.headline}>{summary.headline}</h2>
        <p className={styles.detail}>{summary.detail}</p>

        {summary.highlights.length > 0 && (
          <p className={styles.inlineStats}>
            {summary.highlights.map((item, index) => (
              <span key={item.label}>
                {index > 0 && <span className={styles.statSep}>·</span>}
                <span className={styles.statNum}>{item.value}</span> {item.label.toLowerCase()}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
