import { PremiumGate } from '@/components/ui';
import type { FeatureAccessResult } from '@/subscription/planLimits';
import type { VetBillExtractionRecord } from '@/services/vetBillDecoder';
import { partitionByHistoryWindow } from '@/utils/timelineHistoryWindow';
import styles from './RecentScansHistory.module.css';

export type ScanHistoryItem = {
  id: string;
  title: string;
  subtitle: string;
  occurredAt: string;
  when: string;
  statusLabel: string;
  record: VetBillExtractionRecord;
};

type RecentScansHistoryProps = {
  items: ScanHistoryItem[];
  timelineAccess: FeatureAccessResult;
  activeId?: string | null;
  onOpenRecord?: (record: VetBillExtractionRecord) => void;
};

const STATUS_SHORT: Record<string, string> = {
  saved: 'Report saved',
  approved: 'On timeline',
  partially_approved: 'Partially saved',
  rejected: 'Report only',
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function recordToHistoryItem(
  record: VetBillExtractionRecord,
  fileName: string,
): ScanHistoryItem {
  return {
    id: record.id,
    title: record.extractionResult.documentTypeGuess || fileName,
    subtitle: fileName,
    occurredAt: record.createdAt,
    when: formatWhen(record.createdAt),
    statusLabel: STATUS_SHORT[record.status] ?? record.status,
    record,
  };
}

function ScanHistoryList({
  items,
  activeId,
  onOpenRecord,
  listClassName,
  ariaHidden,
}: {
  items: ScanHistoryItem[];
  activeId?: string | null;
  onOpenRecord?: (record: VetBillExtractionRecord) => void;
  listClassName?: string;
  ariaHidden?: boolean;
}) {
  return (
    <ul className={`${styles.list} ${listClassName ?? ''}`.trim()} aria-hidden={ariaHidden || undefined}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`${styles.itemBtn} ${isActive ? styles.itemBtnActive : ''}`.trim()}
              onClick={() => onOpenRecord?.(item.record)}
            >
              <div className={styles.itemMain}>
                <p className={styles.itemTitle}>{item.title}</p>
                <p className={styles.itemSubtitle}>{item.subtitle}</p>
              </div>
              <span className={styles.status}>{item.statusLabel}</span>
              <time className={styles.when} dateTime={item.occurredAt}>
                {item.when}
              </time>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function RecentScansHistory({
  items,
  timelineAccess,
  activeId,
  onOpenRecord,
}: RecentScansHistoryProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  const { recentItems, historicalItems } = partitionByHistoryWindow(
    sorted,
    (item) => item.occurredAt,
  );

  if (items.length === 0) {
    return (
      <section className={styles.section} aria-labelledby="recent-scans-heading">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>History</p>
            <h2 id="recent-scans-heading" className={styles.title}>
              Recent scans
            </h2>
          </div>
        </header>
        <p className={styles.emptyText}>
          Your decoded reports will appear here — reopen any scan without running AI again.
        </p>
      </section>
    );
  }

  const showGatedHistory = !timelineAccess.isAllowed && historicalItems.length > 0;

  return (
    <section className={styles.section} aria-labelledby="recent-scans-heading">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>History</p>
          <h2 id="recent-scans-heading" className={styles.title}>
            Recent scans
          </h2>
        </div>
        <span className={styles.count}>{items.length} in vault</span>
      </header>

      <div className={styles.listWrap}>
        {recentItems.length > 0 && (
          <ScanHistoryList
            items={recentItems}
            activeId={activeId}
            onOpenRecord={onOpenRecord}
            listClassName={showGatedHistory ? styles.listNoBottomRadius : undefined}
          />
        )}

        {timelineAccess.isAllowed && historicalItems.length > 0 && (
          <ScanHistoryList
            items={historicalItems}
            activeId={activeId}
            onOpenRecord={onOpenRecord}
            listClassName={recentItems.length > 0 ? styles.listNoTopRadius : undefined}
          />
        )}

        {showGatedHistory && (
          <div className={styles.gatedWrap}>
            <div className={styles.gatedFade} aria-hidden />
            <PremiumGate
              requiredTier="Plus"
              title="Unblur your pet's history"
              description="Upgrade to Plus to unlock your pet's complete, permanent life story and past medical events."
              className={styles.gateMinHeight}
            >
              <ScanHistoryList
                items={historicalItems}
                activeId={activeId}
                onOpenRecord={onOpenRecord}
                listClassName={styles.listNoTopRadius}
                ariaHidden
              />
            </PremiumGate>
          </div>
        )}
      </div>
    </section>
  );
}
