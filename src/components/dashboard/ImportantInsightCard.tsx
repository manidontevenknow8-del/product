import { usePetCareScore } from '@/petCareScore';
import type { DashboardInsight } from '@/types/dashboard';
import styles from './ImportantInsightCard.module.css';

type ImportantInsightCardProps = {
  insight?: DashboardInsight;
};

export function ImportantInsightCard({ insight: insightOverride }: ImportantInsightCardProps) {
  const { data, isLoading } = usePetCareScore();

  const insight: DashboardInsight | null =
    insightOverride ??
    (data
      ? {
          id: 'weekly',
          title: data.weeklyInsight.title,
          message: data.weeklyInsight.message,
          type: 'observation',
        }
      : null);

  if (isLoading) {
    return (
      <article className={styles.card}>
        <span className={styles.label}>Important insight</span>
        <p className={styles.message}>Analyzing your pet&apos;s recent activity…</p>
      </article>
    );
  }

  if (!insight) {
    return (
      <article className={styles.card}>
        <span className={styles.label}>Important insight</span>
        <h2 className={styles.title}>Your story is just beginning</h2>
        <p className={styles.message}>
          Scan a document or add a health record - insights appear from your real data.
        </p>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <span className={styles.label}>Important insight</span>
      <h2 className={styles.title}>{insight.title}</h2>
      <p className={styles.message}>{insight.message}</p>
      <div className={styles.footer}>
        <span className={styles.indicator} aria-hidden="true" />
        <span className={styles.footerText}>Updated from recent activity</span>
      </div>
    </article>
  );
}
