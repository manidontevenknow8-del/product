import type { VetBillExtractionRecord } from '@/services/vetBillDecoder';
import type { RecentScanItem } from '@/types/scan';
import { EmptyDocumentsState } from '@/components/empty-states';
import styles from './RecentScans.module.css';

type RecentScansProps = {
  scans: RecentScanItem[];
  extractionByDocId?: Map<string, VetBillExtractionRecord>;
  onView?: (scan: RecentScanItem) => void;
  onUpload?: () => void;
};

const STATUS_SHORT: Record<string, string> = {
  pending_review: 'Pending review',
  approved: 'Saved',
  partially_approved: 'Partially saved',
  rejected: 'Dismissed',
};

export function RecentScans({ scans, extractionByDocId, onView, onUpload }: RecentScansProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent uploads</h2>
        {scans.length > 0 && (
          <span className={styles.count}>{scans.length} in vault</span>
        )}
      </div>

      {scans.length === 0 ? (
        <EmptyDocumentsState onUpload={onUpload} compact />
      ) : (
        <div className={styles.list}>
          {scans.map((scan) => {
            const extraction = extractionByDocId?.get(scan.id);
            const hasReport = Boolean(extraction);
            return (
              <article key={scan.id} className={styles.item}>
                <div className={styles.icon}>
                  <div className={styles.iconInner} />
                </div>
                <div className={styles.info}>
                  <div className={styles.fileName}>{scan.fileName}</div>
                  <div className={styles.meta}>
                    {scan.documentType} · {scan.uploadDate}
                    {extraction && (
                      <span className={styles.reportBadge}>
                        {STATUS_SHORT[extraction.status] ?? extraction.status}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.viewBtn}
                  onClick={() => onView?.(scan)}
                >
                  {hasReport ? 'View report' : 'Decode'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
