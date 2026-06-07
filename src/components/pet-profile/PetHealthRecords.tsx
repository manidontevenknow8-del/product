import { EmptyHealthRecordsState } from '@/components/empty-states/EmptyHealthRecordsState';
import { useHealthRecords } from '@/healthRecords';
import {
  formatHealthRecordDate,
  healthRecordTypeLabels,
  type HealthRecord,
  type HealthRecordType,
} from '@/services/healthRecords/healthRecordService';
import { formatDocumentVaultDate } from '@/services/documents/documentService';
import styles from './PetHealthRecords.module.css';

const typeDotClass: Record<HealthRecordType, string> = {
  vaccination: styles.typeDotVaccination,
  allergy: styles.typeDotAllergy,
  medication: styles.typeDotMedication,
  diagnosis: styles.typeDotDiagnosis,
  surgery: styles.typeDotSurgery,
  weight: styles.typeDotWeight,
  wellness: styles.typeDotWellness,
};

const groupOrder: HealthRecordType[] = [
  'vaccination',
  'wellness',
  'medication',
  'diagnosis',
  'surgery',
  'allergy',
  'weight',
];

type PetHealthRecordsProps = {
  onAdd: () => void;
  onEdit: (record: HealthRecord) => void;
};

function groupRecords(records: HealthRecord[]) {
  return groupOrder
    .map((type) => ({
      type,
      label: healthRecordTypeLabels[type],
      items: records.filter((r) => r.recordType === type),
    }))
    .filter((g) => g.items.length > 0);
}

function RecordDocumentLink({ record }: { record: HealthRecord }) {
  if (!record.sourceDocumentId || !record.sourceDocumentName) return null;

  return (
    <p className={styles.documentLink}>
      <span className={styles.documentLabel}>Source document:</span>{' '}
      {record.sourceDocumentName}
      {record.sourceDocumentUploadedAt && (
        <> · uploaded {formatDocumentVaultDate(record.sourceDocumentUploadedAt)}</>
      )}
    </p>
  );
}

export function PetHealthRecords({ onAdd, onEdit }: PetHealthRecordsProps) {
  const { records, isLoading } = useHealthRecords();
  const groups = groupRecords(records);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Health records</h2>
          {!isLoading && records.length > 0 && (
            <span className={styles.count}>{records.length} entries</span>
          )}
        </div>
        <button type="button" className={styles.addBtn} onClick={onAdd}>
          Add record
        </button>
      </div>

      {isLoading ? (
        <p className={styles.loadingHint}>Loading health records…</p>
      ) : records.length === 0 ? (
        <EmptyHealthRecordsState onAdd={onAdd} compact />
      ) : (
        groups.map((group) => (
          <div key={group.type}>
            <h3 className={styles.groupLabel}>{group.label}</h3>
            <div className={styles.list}>
              {group.items.map((entry) => (
                <article key={entry.id} className={styles.entry}>
                  <div className={styles.typeIcon}>
                    <div className={`${styles.typeDot} ${typeDotClass[entry.recordType]}`} />
                  </div>
                  <div className={styles.content}>
                    <div className={styles.entryHeader}>
                      <div className={styles.entryTitle}>{entry.title}</div>
                      <button type="button" className={styles.editBtn} onClick={() => onEdit(entry)}>
                        Edit
                      </button>
                    </div>
                    <div className={styles.entryMeta}>
                      {healthRecordTypeLabels[entry.recordType]} ·{' '}
                      {formatHealthRecordDate(entry.dateRecorded)}
                    </div>
                    {entry.description && (
                      <p className={styles.entryDetail}>{entry.description}</p>
                    )}
                    <RecordDocumentLink record={entry} />
                    {entry.nextDueDate && (
                      <p className={styles.nextDue}>
                        Next due {formatHealthRecordDate(entry.nextDueDate)}
                      </p>
                    )}
                  </div>
                  {entry.severity && (
                    <span className={`${styles.status} ${styles[`severity_${entry.severity}`]}`}>
                      {entry.severity}
                    </span>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
