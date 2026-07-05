import type { WeeklyInsight } from '@/types/petCareScore';
import styles from './WeeklyDigestSection.module.css';

type WeeklyDigestSectionProps = {
  insight: WeeklyInsight;
  petName: string;
};

export function WeeklyDigestSection({ insight, petName }: WeeklyDigestSectionProps) {
  return (
    <section className={styles.wrap} data-reveal aria-labelledby="weekly-digest-heading">
      <p className={styles.eyebrow}>This week</p>
      <h2 id="weekly-digest-heading" className={styles.title}>
        {insight.title}
      </h2>
      <div className={styles.body}>
        {insight.highlight && (
          <span className={styles.highlight}>{insight.highlight}</span>
        )}
        <p className={styles.message}>{insight.message}</p>
        <p className={styles.meta}>Weekly digest for {petName} · based on your live care score</p>
      </div>
    </section>
  );
}
