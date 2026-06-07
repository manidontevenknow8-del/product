import type { VetBillExtractionRecord } from '@/services/vetBillDecoder';
import styles from './VetBillDecoderHistory.module.css';

type VetBillDecoderHistoryProps = {
  records: VetBillExtractionRecord[];
  onOpenRecord?: (record: VetBillExtractionRecord) => void;
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending review',
  approved: 'Approved',
  partially_approved: 'Partially approved',
  rejected: 'Dismissed',
};

const STATUS_HINT: Record<string, string> = {
  pending_review: 'Report saved — confirm items to add to timeline',
  approved: 'Saved to health records & reminders',
  partially_approved: 'Some items saved to timeline',
  rejected: 'Closed without saving items',
};

export function VetBillDecoderHistory({ records, onOpenRecord }: VetBillDecoderHistoryProps) {
  if (records.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Saved reports</h2>
      <p className={styles.subtitle}>
        Each decode is stored once. Tap a report to reopen it — no extra AI usage.
      </p>
      <ul className={styles.list}>
        {records.slice(0, 10).map((record) => (
          <li key={record.id}>
            <button
              type="button"
              className={styles.item}
              onClick={() => onOpenRecord?.(record)}
              disabled={!onOpenRecord}
            >
              <div className={styles.itemMain}>
                <div className={styles.itemTitle}>{record.extractionResult.documentTypeGuess}</div>
                <div className={styles.itemMeta}>
                  {new Date(record.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {record.modelUsed && ` · ${record.modelUsed}`}
                </div>
                <p className={styles.itemHint}>
                  {STATUS_HINT[record.status] ?? ''}
                </p>
              </div>
              <span
                className={`${styles.status} ${styles[`status_${record.status}`] ?? ''}`}
              >
                {STATUS_LABELS[record.status] ?? record.status}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
