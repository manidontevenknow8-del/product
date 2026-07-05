import { useHealthRecords } from '@/healthRecords';
import {
  formatHealthRecordDate,
  healthRecordTypeLabels,
  type HealthRecord,
} from '@/services/healthRecords/healthRecordService';
import { formatDocumentVaultDate } from '@/services/documents/documentService';
import { EmptyHealthRecordsState } from '@/components/empty-states/EmptyHealthRecordsState';
import styles from './PetMedicalHistory.module.css';

type PetMedicalHistoryProps = {
  onAdd?: () => void;
  onEdit?: (record: HealthRecord) => void;
  showHeader?: boolean;
  highlightRecordId?: string | null;
};

function formatMonthLabel(dateRecorded: string): string {
  const parsed = new Date(dateRecorded);
  if (Number.isNaN(parsed.getTime())) return 'Undated';
  return parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupByMonth(records: HealthRecord[]): { key: string; items: HealthRecord[] }[] {
  const groups: { key: string; items: HealthRecord[] }[] = [];
  for (const record of records) {
    const key = formatMonthLabel(record.dateRecorded);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(record);
    } else {
      groups.push({ key, items: [record] });
    }
  }
  return groups;
}

export function PetMedicalHistory({ onAdd, onEdit, showHeader = true, highlightRecordId }: PetMedicalHistoryProps) {
  const { records, isLoading } = useHealthRecords();

  const timeline = [...records].sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded));
  const monthGroups = groupByMonth(timeline);

  return (
    <section className={styles.section}>
      {showHeader && (
        <div className={styles.header}>
          <p className={styles.kicker}>Chronological</p>
          <h2 className={styles.title}>Medical history</h2>
        </div>
      )}

      {isLoading ? (
        <p className={styles.loadingHint}>Loading medical history…</p>
      ) : timeline.length === 0 ? (
        <EmptyHealthRecordsState onAdd={onAdd} compact />
      ) : (
        <div className={styles.timeline}>
          {monthGroups.map((group) => (
            <section key={group.key} className={styles.monthGroup}>
              <h3 className={styles.monthLabel}>{group.key}</h3>
              <ol className={styles.monthList}>
                {group.items.map((record) => (
                  <li
                    key={record.id}
                    id={`health-record-${record.id}`}
                    className={`${styles.item} ${highlightRecordId === record.id ? styles.itemHighlight : ''}`}
                  >
                    <div className={styles.marker} aria-hidden="true" />
                    <article className={styles.body}>
                      <div className={styles.itemHeader}>
                        <span className={styles.type}>
                          {healthRecordTypeLabels[record.recordType]}
                        </span>
                        <time className={styles.date} dateTime={record.dateRecorded}>
                          {formatHealthRecordDate(record.dateRecorded)}
                        </time>
                      </div>
                      <h3 className={styles.itemTitle}>{record.title}</h3>
                      {record.recordType === 'weight' && record.description && (
                        <p className={styles.itemValue}>{record.description}</p>
                      )}
                      {record.description && record.recordType !== 'weight' && (
                        <p className={styles.description}>{record.description}</p>
                      )}
                      {record.sourceDocumentName && (
                        <p className={styles.document}>
                          Document: {record.sourceDocumentName}
                          {record.sourceDocumentUploadedAt && (
                            <> · {formatDocumentVaultDate(record.sourceDocumentUploadedAt)}</>
                          )}
                        </p>
                      )}
                      {onEdit && (
                        <div className={styles.footer}>
                          <button type="button" className={styles.editBtn} onClick={() => onEdit(record)}>
                            Edit
                          </button>
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
