import type { PassportSummaryStats } from '@/services/passport/passportService';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import styles from './PassportSummaryBar.module.css';

type PassportSummaryBarProps = {
  stats: PassportSummaryStats;
};

export function PassportSummaryBar({ stats }: PassportSummaryBarProps) {
  const latestVaccinationLabel = stats.latestVaccination
    ? `${stats.latestVaccination.title} · ${formatHealthRecordDate(stats.latestVaccination.dateRecorded)}`
    : 'Not recorded';

  return (
    <section className={styles.bar} aria-label="Passport summary">
      <div className={styles.stat}>
        <span className={styles.value}>{stats.totalRecords}</span>
        <span className={styles.label}>Total records</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.value}>{stats.activeMedicationsCount}</span>
        <span className={styles.label}>Active medications</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.value}>{stats.allergiesCount}</span>
        <span className={styles.label}>Allergies</span>
      </div>
      <div className={`${styles.stat} ${styles.statWide}`}>
        <span className={styles.valueText}>{latestVaccinationLabel}</span>
        <span className={styles.label}>Latest vaccination</span>
      </div>
    </section>
  );
}
