import { useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import type { VetBillExtractionRecord, VetBillExtractionResult } from '@/services/vetBillDecoder';
import {
  countApprovedItems,
  extractionStatusHeadline,
  resolveDetailedReport,
} from '@/services/vetBillDecoder';
import { ReportVisualDashboard } from './ReportVisualDashboard';
import styles from './VetBillDecoderReview.module.css';

type VetBillDecoderReviewProps = {
  record: VetBillExtractionRecord;
  result: VetBillExtractionResult;
  fileName: string;
  isSaving: boolean;
  isDeleting?: boolean;
  onChange: (result: VetBillExtractionResult) => void;
  onAddToTimeline: () => void;
  onClose: () => void;
  onDelete: () => void;
};

function ItemSection({
  title,
  subtitle,
  emptyLabel,
  children,
  count,
}: {
  title: string;
  subtitle?: string;
  emptyLabel: string;
  children: ReactNode;
  count?: number;
}) {
  const hasContent = count !== undefined ? count > 0 : Boolean(children);
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {hasContent ? children : <p className={styles.empty}>{emptyLabel}</p>}
    </div>
  );
}

function ExtractionItem({
  item,
  meta,
  onToggle,
}: {
  item: {
    id: string;
    title: string;
    description?: string;
    confidence: string;
    approved: boolean;
  };
  meta?: ReactNode;
  onToggle: (approved: boolean) => void;
}) {
  return (
    <li className={styles.item}>
      <label className={styles.itemHeader}>
        <input
          type="checkbox"
          className={styles.itemCheckbox}
          checked={item.approved}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div className={styles.itemMain}>
          <div className={styles.itemTitleRow}>
            <strong className={styles.itemTitle}>{item.title}</strong>
            <span className={`${styles.confidence} ${styles[`confidence_${item.confidence}`]}`}>
              {item.confidence}
            </span>
          </div>
          {meta && <div className={styles.itemMeta}>{meta}</div>}
          {item.description && <p className={styles.itemDescription}>{item.description}</p>}
        </div>
      </label>
    </li>
  );
}

/** First paragraph or truncated overview */
function shortOverview(text: string, maxLen = 320): string {
  const first = text.split(/\n\n+/)[0]?.trim() ?? text;
  if (first.length <= maxLen) return first;
  return `${first.slice(0, maxLen).trim()}…`;
}

export function VetBillDecoderReview({
  record,
  result,
  fileName,
  isSaving,
  isDeleting = false,
  onChange,
  onAddToTimeline,
  onClose,
  onDelete,
}: VetBillDecoderReviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const busy = isSaving || isDeleting;
  const report = useMemo(() => resolveDetailedReport(result), [result]);
  const approvedCount = useMemo(() => countApprovedItems(result), [result]);
  const statusInfo = extractionStatusHeadline(record.status);

  const toggleList = <K extends keyof Pick<
    VetBillExtractionResult,
    'vaccinations' | 'medications' | 'diagnoses' | 'followUpDates' | 'reminderDates'
  >>(
    key: K,
    id: string,
    approved: boolean,
  ) => {
    const items = result[key];
    onChange({
      ...result,
      [key]: items.map((item) => (item.id === id ? { ...item, approved } : item)),
    });
  };

  const handleAddToTimeline = () => {
    if (approvedCount === 0) {
      setError('Select at least one suggestion, or close to keep the report only.');
      return;
    }
    setError(null);
    onAddToTimeline();
  };

  return (
    <article className={styles.report}>
      <header className={styles.reportHero}>
        <div className={styles.reportHeroScrim} aria-hidden />
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close report"
          disabled={busy}
        >
          ×
        </button>
        <div className={styles.reportHeroContent}>
          <div className={styles.reportHeroText}>
            <span className={styles.eyebrow}>Scan report</span>
            <h2 className={styles.title}>{result.documentTypeGuess}</h2>
            <p className={styles.fileName}>{fileName}</p>
          </div>
          <span className={`${styles.statusBadge} ${styles[`statusBadge_${statusInfo.tone}`]}`}>
            {statusInfo.label}
          </span>
        </div>
      </header>

      <ReportVisualDashboard result={result} />

      <div className={styles.summaryBand}>
        <p className={styles.summaryLead}>{shortOverview(report.overview)}</p>
        {report.financialSummary && (
          <p className={styles.summaryFinancial}>
            <strong>Cost:</strong> {report.financialSummary.slice(0, 200)}
            {report.financialSummary.length > 200 ? '…' : ''}
          </p>
        )}
        {report.careRecommendations.length > 0 && (
          <ul className={styles.quickRecs}>
            {report.careRecommendations.slice(0, 4).map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.approvalZone}>
        <div className={styles.approvalHead}>
          <h3 className={styles.approvalTitle}>Add to timeline (optional)</h3>
          <p className={styles.notice}>
            Check items to sync to health records or reminders. Closing saves the report without
            adding anything.
          </p>
        </div>

        <ItemSection
          title="Vaccinations"
          emptyLabel="None detected."
          count={result.vaccinations.length}
        >
          {result.vaccinations.length > 0 && (
            <ul className={styles.list}>
              {result.vaccinations.map((item) => (
                <ExtractionItem
                  key={item.id}
                  item={item}
                  meta={
                    <>
                      {item.dateRecorded && <span>Given {item.dateRecorded}</span>}
                      {item.nextDueDate && <span> · Due {item.nextDueDate}</span>}
                    </>
                  }
                  onToggle={(approved) => toggleList('vaccinations', item.id, approved)}
                />
              ))}
            </ul>
          )}
        </ItemSection>

        <ItemSection title="Medications" emptyLabel="None detected." count={result.medications.length}>
          {result.medications.length > 0 && (
            <ul className={styles.list}>
              {result.medications.map((item) => (
                <ExtractionItem
                  key={item.id}
                  item={item}
                  onToggle={(approved) => toggleList('medications', item.id, approved)}
                />
              ))}
            </ul>
          )}
        </ItemSection>

        <ItemSection title="Findings" emptyLabel="None detected." count={result.diagnoses.length}>
          {result.diagnoses.length > 0 && (
            <ul className={styles.list}>
              {result.diagnoses.map((item) => (
                <ExtractionItem
                  key={item.id}
                  item={item}
                  onToggle={(approved) => toggleList('diagnoses', item.id, approved)}
                />
              ))}
            </ul>
          )}
        </ItemSection>

        <ItemSection title="Follow-ups" emptyLabel="None detected." count={result.followUpDates.length}>
          {result.followUpDates.length > 0 && (
            <ul className={styles.list}>
              {result.followUpDates.map((item) => (
                <ExtractionItem
                  key={item.id}
                  item={item}
                  meta={<span>{item.followUpDate}</span>}
                  onToggle={(approved) => toggleList('followUpDates', item.id, approved)}
                />
              ))}
            </ul>
          )}
        </ItemSection>

        <ItemSection title="Reminders" emptyLabel="None detected." count={result.reminderDates.length}>
          {result.reminderDates.length > 0 && (
            <ul className={styles.list}>
              {result.reminderDates.map((item) => (
                <ExtractionItem
                  key={item.id}
                  item={item}
                  meta={<span>Due {item.dueDate}</span>}
                  onToggle={(approved) => toggleList('reminderDates', item.id, approved)}
                />
              ))}
            </ul>
          )}
        </ItemSection>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {showDeleteConfirm && (
        <div
          className={styles.deleteConfirm}
          role="alertdialog"
          aria-labelledby="delete-report-title"
          aria-describedby="delete-report-desc"
        >
          <h3 id="delete-report-title" className={styles.deleteConfirmTitle}>
            Delete this report?
          </h3>
          <p id="delete-report-desc" className={styles.deleteConfirmText}>
            This removes the saved scan report and the uploaded file from your vault for{' '}
            {result.documentTypeGuess}. It will disappear from Passport and Profile too. You can
            scan again later. This cannot be undone.
          </p>
          <div className={styles.deleteConfirmActions}>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete();
              }}
              disabled={busy}
            >
              {isDeleting ? 'Deleting…' : 'Delete report'}
            </Button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={busy}
        >
          Delete report
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Close report
        </Button>
        <Button variant="primary" onClick={handleAddToTimeline} disabled={busy}>
          {isSaving
            ? 'Saving…'
            : approvedCount > 0
              ? `Add ${approvedCount} to timeline`
              : 'Add to timeline'}
        </Button>
      </div>
    </article>
  );
}
