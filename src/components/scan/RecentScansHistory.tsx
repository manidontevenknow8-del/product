import { PremiumGate } from '@/components/ui';
import type { FeatureAccessResult } from '@/subscription/planLimits';
import type { VetBillExtractionRecord } from '@/services/vetBillDecoder';
import { partitionByHistoryWindow } from '@/utils/timelineHistoryWindow';

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
  ariaHidden,
}: {
  items: ScanHistoryItem[];
  activeId?: string | null;
  onOpenRecord?: (record: VetBillExtractionRecord) => void;
  ariaHidden?: boolean;
}) {
  return (
    <ul
      className="divide-y divide-stone-200/70 border border-stone-200/60 bg-white/40"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`grid w-full grid-cols-[1fr_auto] gap-x-6 gap-y-1 px-5 py-4 text-left transition-colors sm:grid-cols-[1fr_auto_auto] sm:items-center ${
                isActive ? 'bg-stone-100/80' : 'hover:bg-stone-50/80'
              }`}
              onClick={() => onOpenRecord?.(item.record)}
            >
              <div className="min-w-0">
                <p className="truncate font-serif text-lg text-stone-900">{item.title}</p>
                <p className="mt-0.5 truncate font-sans text-xs text-stone-400">{item.subtitle}</p>
              </div>
              <span className="hidden font-sans text-[10px] uppercase tracking-[0.16em] text-stone-400 sm:block">
                {item.statusLabel}
              </span>
              <time
                className="font-sans text-xs tabular-nums text-stone-500 sm:text-right"
                dateTime={item.occurredAt}
              >
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
      <section className="border-t border-stone-200/60 pt-12" aria-labelledby="recent-scans-heading">
        <header className="mb-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
            History
          </p>
          <h2
            id="recent-scans-heading"
            className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl"
          >
            Recent scans
          </h2>
        </header>
        <p className="font-sans text-sm leading-relaxed text-stone-500">
          Your decoded reports will appear here — reopen any scan without running AI again.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-stone-200/60 pt-12" aria-labelledby="recent-scans-heading">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
            History
          </p>
          <h2
            id="recent-scans-heading"
            className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl"
          >
            Recent scans
          </h2>
        </div>
        <span className="font-sans text-xs text-stone-400">{items.length} in vault</span>
      </header>

      <div className="relative">
        {recentItems.length > 0 && (
          <div
            className={
              !timelineAccess.isAllowed && historicalItems.length > 0
                ? '[&>ul]:rounded-b-none [&>ul]:border-b-0'
                : undefined
            }
          >
            <ScanHistoryList
              items={recentItems}
              activeId={activeId}
              onOpenRecord={onOpenRecord}
            />
          </div>
        )}

        {timelineAccess.isAllowed && historicalItems.length > 0 && (
          <div className={recentItems.length > 0 ? '[&>ul]:border-t-0 [&>ul]:rounded-t-none' : undefined}>
            <ScanHistoryList
              items={historicalItems}
              activeId={activeId}
              onOpenRecord={onOpenRecord}
            />
          </div>
        )}

        {!timelineAccess.isAllowed && historicalItems.length > 0 && (
          <div className="relative border-x border-b border-stone-200/60 [&>div]:rounded-none">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-white/90 to-transparent"
              aria-hidden
            />
            <PremiumGate
              requiredTier="Plus"
              title="Unblur your pet's history"
              description="Upgrade to Plus to unlock your pet's complete, permanent life story and past medical events."
              className="!min-h-[14rem] !rounded-none"
            >
              <ScanHistoryList
                items={historicalItems}
                activeId={activeId}
                onOpenRecord={onOpenRecord}
                ariaHidden
              />
            </PremiumGate>
          </div>
        )}
      </div>
    </section>
  );
}
