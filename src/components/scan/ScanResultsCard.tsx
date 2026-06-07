import type { ScanExtraction } from '@/types/scan';
import styles from './ScanResultsCard.module.css';

type ScanResultsCardProps = {
  result: ScanExtraction;
};

export function ScanResultsCard({ result }: ScanResultsCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>Scan complete</span>
          <h2 className={styles.title}>{result.documentType}</h2>
          <p className={styles.fileName}>{result.fileName}</p>
        </div>
        <span className={styles.badge}>AI extracted</span>
      </div>

      <p className={styles.summary}>{result.summary}</p>

      <div className={styles.sections}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Key dates</h3>
          {result.extractedDates.map((date) => (
            <div key={date.label} className={styles.row}>
              <span className={styles.rowLabel}>{date.label}</span>
              <span className={styles.rowValue}>{date.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Reminders found</h3>
          {result.reminders.map((reminder) => (
            <div key={reminder.title} className={styles.reminder}>
              <div className={styles.reminderTitle}>{reminder.title}</div>
              <div className={styles.reminderDue}>{reminder.dueLabel}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.pulse} aria-hidden="true" />
        <span className={styles.footerText}>
          Saved to vault · Reminders added to your timeline
        </span>
      </div>
    </article>
  );
}
