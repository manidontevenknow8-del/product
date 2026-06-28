import { formatWeightNumber } from '../utils';
import styles from '../../DashboardPage.module.css';

type SummaryBandProps = {
  overdue: number;
  upcoming: number;
  score: number | null;
  weight: string | null;
};

export function SummaryBand({ overdue, upcoming, score, weight }: SummaryBandProps) {
  const cells = [
    { value: String(overdue), label: 'Overdue', highlight: overdue > 0 },
    { value: String(upcoming), label: 'Upcoming', highlight: false },
    { value: score != null ? String(score) : '—', label: 'Care score', highlight: false },
    { value: formatWeightNumber(weight ?? undefined), label: 'Weight · kg', highlight: false },
  ] as const;

  return (
    <div className={styles.summaryBand} aria-label="Care summary">
      {cells.map((cell) => (
        <div key={cell.label} className={styles.summaryCell}>
          <span
            className={`${styles.summaryValue}${cell.highlight ? ` ${styles.summaryValueAlert}` : ''}`}
          >
            {cell.value}
          </span>
          <span className={styles.summaryLabel}>{cell.label}</span>
        </div>
      ))}
    </div>
  );
}
