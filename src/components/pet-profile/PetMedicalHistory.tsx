import { useHealthRecords } from '@/healthRecords';
import {
  formatHealthRecordDate,
  healthRecordTypeLabels,
} from '@/services/healthRecords/healthRecordService';
import { formatDocumentVaultDate } from '@/services/documents/documentService';
import { EmptyHealthRecordsState } from '@/components/empty-states/EmptyHealthRecordsState';
import styles from './PetMedicalHistory.module.css';

type PetMedicalHistoryProps = {
  onAdd?: () => void;
};

export function PetMedicalHistory({ onAdd }: PetMedicalHistoryProps) {
  const { records, isLoading } = useHealthRecords();

  const timeline = [...records].sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded));

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Medical history</h2>
        <p className={styles.subtitle}>Chronological view of care events</p>
      </div>

      {isLoading ? (
        <p className={styles.loadingHint}>Loading medical history…</p>
      ) : timeline.length === 0 ? (
        <EmptyHealthRecordsState onAdd={onAdd} compact />
      ) : (
        <ol className={styles.timeline}>
          {timeline.map((record) => (
            <li key={record.id} className={styles.item}>
              <div className={styles.marker} aria-hidden="true" />
              <div className={styles.body}>
                <div className={styles.itemHeader}>
                  <span className={styles.type}>{healthRecordTypeLabels[record.recordType]}</span>
                  <time className={styles.date} dateTime={record.dateRecorded}>
                    {formatHealthRecordDate(record.dateRecorded)}
                  </time>
                </div>
                <h3 className={styles.itemTitle}>{record.title}</h3>
                {record.description && (
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
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
