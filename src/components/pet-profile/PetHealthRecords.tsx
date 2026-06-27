import { useState } from 'react';
import { EmptyHealthRecordsState } from '@/components/empty-states/EmptyHealthRecordsState';
import { PremiumUpgradePrompt, UpgradeModal } from '@/components/subscription';
import { useHealthRecords } from '@/healthRecords';
import { useHealthRecordLimit } from '@/hooks/useHealthRecordLimit';
import {
  formatHealthRecordDate,
  healthRecordTypeLabels,
  type HealthRecord,
  type HealthRecordType,
} from '@/services/healthRecords/healthRecordService';
import { formatDocumentVaultDate } from '@/services/documents/documentService';
import styles from './PetHealthRecords.module.css';

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
  showHeader?: boolean;
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

export function PetHealthRecords({ onAdd, onEdit, showHeader = true }: PetHealthRecordsProps) {
  const { records, isLoading } = useHealthRecords();
  const { atLimit, recordCount, limit } = useHealthRecordLimit();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const groups = groupRecords(records);

  const handleAdd = () => {
    if (atLimit) {
      setUpgradeOpen(true);
      return;
    }
    onAdd();
  };

  return (
    <section className={styles.section}>
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {!isLoading && records.length > 0 && (
              <span className={styles.count}>
                {records.length} {records.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
            <h2 className={styles.title}>Health records</h2>
          </div>
          <button type="button" className={styles.addBtn} onClick={handleAdd}>
            Add record
          </button>
        </div>
      )}

      {atLimit && (
        <PremiumUpgradePrompt
          feature="unlimitedHealthRecords"
          compact
          onUpgrade={() => setUpgradeOpen(true)}
          emotionalOverride={`You've used ${recordCount} of ${limit} free health records. Upgrade to Pro to log every vaccination, diagnosis, and vet visit without limits.`}
        />
      )}

      {isLoading ? (
        <p className={styles.loadingHint}>Loading health records…</p>
      ) : records.length === 0 ? (
        <EmptyHealthRecordsState onAdd={handleAdd} compact />
      ) : (
        groups.map((group) => (
          <div key={group.type} className={styles.groupBlock}>
            <h3 className={styles.groupLabel}>{group.label}</h3>
            <ul className={styles.list}>
              {group.items.map((entry) => (
                <li key={entry.id} className={styles.entry}>
                  <div className={styles.bead} aria-hidden />
                  <article className={styles.entryBody}>
                    <div className={styles.entryHeader}>
                      <span className={styles.typeLabel}>
                        {healthRecordTypeLabels[entry.recordType]}
                      </span>
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => onEdit(entry)}
                      >
                        Edit
                      </button>
                    </div>
                    <h4 className={styles.entryTitle}>{entry.title}</h4>
                    <p className={styles.entryMeta}>
                      {formatHealthRecordDate(entry.dateRecorded)}
                    </p>
                    {entry.description && (
                      <p className={styles.entryDetail}>{entry.description}</p>
                    )}
                    <RecordDocumentLink record={entry} />
                    {entry.nextDueDate && (
                      <p className={styles.nextDue}>
                        Next due {formatHealthRecordDate(entry.nextDueDate)}
                      </p>
                    )}
                    {entry.severity && (
                      <span className={`${styles.severity} ${styles[`severity_${entry.severity}`]}`}>
                        {entry.severity}
                      </span>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </section>
  );
}
