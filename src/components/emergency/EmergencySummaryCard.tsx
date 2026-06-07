import type { EmergencySummary } from '@/types/passport';
import styles from './EmergencySummaryCard.module.css';

type EmergencySummaryCardProps = {
  summary: EmergencySummary;
};

export function EmergencySummaryCard({ summary }: EmergencySummaryCardProps) {
  const rows = [
    { label: 'Blood type', value: summary.bloodType ?? 'Not recorded', muted: !summary.bloodType },
    { label: 'Allergies', value: summary.allergies },
    { label: 'Current medications', value: summary.currentMedications },
    { label: 'Chronic conditions', value: summary.chronicConditions },
  ];

  return (
    <section className={styles.card} aria-labelledby="emergency-summary-title">
      <h2 id="emergency-summary-title" className={styles.title}>
        Emergency summary
        <span className={styles.titleBadge}>Critical</span>
      </h2>

      <div className={styles.grid}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span className={styles.label}>{row.label}</span>
            <span className={`${styles.value} ${row.muted ? styles.valueMuted : ''}`}>
              {row.value}
            </span>
          </div>
        ))}
        <div className={styles.row}>
          <span className={styles.label}>Emergency notes</span>
          <p className={styles.notes}>{summary.emergencyNotes}</p>
        </div>
      </div>
    </section>
  );
}
