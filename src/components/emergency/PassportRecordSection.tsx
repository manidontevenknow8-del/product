import { Button } from '@/components/ui';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { formatDocumentVaultDate } from '@/services/documents/documentService';
import { passportImageUrl } from '@/data/passportImages';
import styles from './PassportRecordSection.module.css';

type PassportRecordSectionProps = {
  title: string;
  records: HealthRecord[];
  emptyMessage: string;
  variant?: 'default' | 'critical';
  image?: string;
  imageAlt?: string;
  onAdd?: () => void;
  onEdit?: (record: HealthRecord) => void;
};

export function PassportRecordSection({
  title,
  records,
  emptyMessage,
  variant = 'default',
  image,
  imageAlt = '',
  onAdd,
  onEdit,
}: PassportRecordSectionProps) {
  const sectionId = `passport-section-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const imgSrc = image ? passportImageUrl(image) : undefined;

  return (
    <section
      className={`${styles.card} ${variant === 'critical' ? styles.cardCritical : ''}`}
      aria-labelledby={sectionId}
    >
      <div className={styles.cardInner}>
        {imgSrc && (
          <div className={styles.thumb}>
            <img src={imgSrc} alt={imageAlt} className={styles.thumbImg} loading="lazy" />
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.cardHead}>
            <h2 id={sectionId} className={styles.title}>
              {title}
              {records.length > 0 && <span className={styles.count}>{records.length}</span>}
            </h2>
            {onAdd && (
              <Button variant="secondary" size="sm" type="button" onClick={onAdd}>
                Add
              </Button>
            )}
          </div>

          {records.length === 0 ? (
            <p className={styles.empty}>{emptyMessage}</p>
          ) : (
            <ul className={styles.list}>
              {records.map((record) => (
                <li key={record.id} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemTitle}>{record.title}</span>
                    <div className={styles.itemActions}>
                      <time className={styles.itemDate} dateTime={record.dateRecorded}>
                        {formatHealthRecordDate(record.dateRecorded)}
                      </time>
                      {onEdit && (
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => onEdit(record)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  {record.description && (
                    <p className={styles.itemDescription}>{record.description}</p>
                  )}
                  {record.nextDueDate && (
                    <p className={styles.itemDue}>
                      Next due {formatHealthRecordDate(record.nextDueDate)}
                    </p>
                  )}
                  {record.sourceDocumentName && (
                    <p className={styles.itemDocument}>
                      Source: {record.sourceDocumentName}
                      {record.sourceDocumentUploadedAt && (
                        <> · {formatDocumentVaultDate(record.sourceDocumentUploadedAt)}</>
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
