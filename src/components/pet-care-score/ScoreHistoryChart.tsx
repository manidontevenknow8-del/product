import type { ScoreHistoryPoint, ScoreTrend } from '@/types/petCareScore';
import styles from './ScoreHistoryChart.module.css';

type ScoreHistoryChartProps = {
  history: ScoreHistoryPoint[];
  currentScore: number;
  trendDelta: number;
  trend?: ScoreTrend;
};

export function ScoreHistoryChart({
  history,
  currentScore,
  trendDelta,
  trend = 'stable',
}: ScoreHistoryChartProps) {
  const scores = history.map((h) => h.score);
  const maxScore = Math.max(...scores, 100);
  const minScore = Math.min(...scores, currentScore) - 5;
  const spanLabel =
    history.length >= 2
      ? `over the last ${history.length} check-ins`
      : 'since you started tracking';

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Score history</h2>
        <span className={styles.current}>{currentScore}</span>
      </div>

      <div className={styles.chart} role="img" aria-label="Score trend over recent check-ins">
        {history.map((point, i) => {
          const heightPct = ((point.score - minScore) / (maxScore - minScore)) * 100;
          const isLast = i === history.length - 1;
          return (
            <div key={point.date} className={styles.barWrap}>
              <div
                className={`${styles.bar} ${isLast ? styles.barCurrent : ''}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className={styles.label}>{point.label ?? point.date}</span>
            </div>
          );
        })}
      </div>

      {trendDelta > 0 && trend === 'up' && (
        <p className={styles.milestone}>
          <strong>+{trendDelta} points</strong> {spanLabel} - your care record is getting stronger.
        </p>
      )}
      {trendDelta > 0 && trend === 'down' && (
        <p className={styles.milestone}>
          <strong>{trendDelta} points lower</strong> {spanLabel} - see breakdown for what changed.
        </p>
      )}
    </article>
  );
}
