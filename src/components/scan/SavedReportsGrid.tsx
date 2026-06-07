import { reportThumbForRecord } from '@/data/scanImages';
import type { VetBillExtractionRecord } from '@/services/vetBillDecoder';
import { resolveDetailedReport } from '@/services/vetBillDecoder';
import styles from './SavedReportsGrid.module.css';

type SavedReportsGridProps = {
  records: VetBillExtractionRecord[];
  activeId?: string | null;
  onOpenRecord?: (record: VetBillExtractionRecord) => void;
  onUpload?: () => void;
};

function itemCount(record: VetBillExtractionRecord): number {
  const r = record.extractionResult;
  return (
    r.vaccinations.length +
    r.medications.length +
    r.diagnoses.length +
    r.followUpDates.length +
    r.reminderDates.length
  );
}

function timelineLabel(record: VetBillExtractionRecord): string {
  if (record.status === 'approved') return 'On timeline';
  if (record.status === 'partially_approved') return 'Partially on timeline';
  return 'Report only';
}

export function SavedReportsGrid({
  records,
  activeId,
  onOpenRecord,
  onUpload,
}: SavedReportsGridProps) {
  if (records.length === 0) {
    return (
      <div className={styles.shell}>
        <section className={styles.section}>
          <h2 className={styles.title}>Saved reports</h2>
          <p className={styles.empty}>
            Scan a vet bill or health document — your AI report will appear here with a preview.
          </p>
          {onUpload && (
            <button type="button" className={styles.emptyBtn} onClick={onUpload}>
              Scan your first document
            </button>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
    <section className={styles.section} aria-labelledby="saved-reports-heading">
      <h2 id="saved-reports-heading" className={styles.title}>
        Saved reports
      </h2>
      <p className={styles.subtitle}>
        Tap a card to reopen — no new AI scan. Add timeline items anytime from the report.
      </p>
      <div
        className={`${styles.grid} ${styles.gridScroll}`}
        role="region"
        aria-label="Saved report list"
      >
        {records.map((record, index) => {
          const report = resolveDetailedReport(record.extractionResult);
          const preview =
            report.overview.slice(0, 120) + (report.overview.length > 120 ? '…' : '');
          const count = itemCount(record);
          const isActive = activeId === record.id;
          const thumb = reportThumbForRecord(record.id, index);

          return (
            <button
              key={record.id}
              type="button"
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              onClick={() => onOpenRecord?.(record)}
            >
              <div className={styles.thumb}>
                <img src={thumb} alt="" className={styles.thumbImg} aria-hidden />
                <span className={styles.thumbBadge}>{count} items</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{record.extractionResult.documentTypeGuess}</h3>
                <time className={styles.cardDate} dateTime={record.createdAt}>
                  {new Date(record.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <p className={styles.cardPreview}>{preview}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.metaPill}>{timelineLabel(record)}</span>
                  {record.extractionResult.vaccinations.length > 0 && (
                    <span className={styles.metaChip}>
                      {record.extractionResult.vaccinations.length} vaccines
                    </span>
                  )}
                  {record.extractionResult.medications.length > 0 && (
                    <span className={styles.metaChip}>
                      {record.extractionResult.medications.length} meds
                    </span>
                  )}
                </div>
                <div className={styles.miniBars} aria-hidden>
                  {[
                    record.extractionResult.vaccinations.length,
                    record.extractionResult.medications.length,
                    record.extractionResult.diagnoses.length,
                    record.extractionResult.reminderDates.length,
                  ].map((v, i) => (
                    <span
                      key={i}
                      className={styles.miniBar}
                      style={{ height: `${Math.max(v * 20, 8)}%` }}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
    </div>
  );
}
