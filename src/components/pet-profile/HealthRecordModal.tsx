import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { useDocuments } from '@/documents';
import { usePets } from '@/pets';
import {
  defaultCreateHealthRecordInput,
  healthRecordSeverityLabels,
  healthRecordTypeLabels,
  HEALTH_RECORD_TYPES,
  type CreateHealthRecordInput,
  type HealthRecord,
  type HealthRecordSeverity,
  type HealthRecordType,
} from '@/services/healthRecords/healthRecordService';
import { formatDocumentVaultDate } from '@/services/documents/documentService';
import styles from './HealthRecordModal.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

type HealthRecordModalProps = {
  record: HealthRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateHealthRecordInput, recordId?: string) => Promise<void>;
  onDelete?: (recordId: string) => Promise<void>;
  /** Pre-select type when adding from a passport section */
  defaultRecordType?: HealthRecordType;
};

export function HealthRecordModal({
  record,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  defaultRecordType,
}: HealthRecordModalProps) {
  const { activePet } = usePets();
  const { documents } = useDocuments();
  const [form, setForm] = useState<CreateHealthRecordInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activePet) return;
    if (record) {
      setForm({
        petId: record.petId,
        sourceDocumentId: record.sourceDocumentId,
        recordType: record.recordType,
        title: record.title,
        description: record.description ?? '',
        dateRecorded: record.dateRecorded,
        nextDueDate: record.nextDueDate,
        severity: record.severity,
      });
    } else {
      setForm({
        ...defaultCreateHealthRecordInput(activePet.id),
        ...(defaultRecordType ? { recordType: defaultRecordType } : {}),
      });
    }
    setError(null);
  }, [isOpen, record, activePet, defaultRecordType]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen || !form) return null;

  const update = <K extends keyof CreateHealthRecordInput>(
    field: K,
    value: CreateHealthRecordInput[K],
  ) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(form, record?.id);
      onClose();
    } catch (err) {
      setError(getUserFacingError(err, 'healthRecord', 'Failed to save record.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record || !onDelete) return;
    setLoading(true);
    setError(null);
    try {
      await onDelete(record.id);
      onClose();
    } catch (err) {
      setError(getUserFacingError(err, 'healthRecord', 'Failed to delete record.'));
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-record-modal-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="health-record-modal-title" className={styles.title}>
              {record ? 'Edit health record' : 'Add health record'}
            </h2>
            <p className={styles.subtitle}>Log vaccinations, medications, and care events</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.form}>
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Rabies booster"
              required
              autoFocus
              disabled={loading}
            />

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="record-type">
                  Record type
                </label>
                <select
                  id="record-type"
                  className={styles.select}
                  value={form.recordType}
                  onChange={(e) => update('recordType', e.target.value as HealthRecordType)}
                  disabled={loading}
                >
                  {HEALTH_RECORD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {healthRecordTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="record-severity">
                  Severity
                </label>
                <select
                  id="record-severity"
                  className={styles.select}
                  value={form.severity ?? ''}
                  onChange={(e) =>
                    update(
                      'severity',
                      e.target.value ? (e.target.value as HealthRecordSeverity) : null,
                    )
                  }
                  disabled={loading}
                >
                  <option value="">Not specified</option>
                  {(Object.keys(healthRecordSeverityLabels) as HealthRecordSeverity[]).map(
                    (level) => (
                      <option key={level} value={level}>
                        {healthRecordSeverityLabels[level]}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <Input
                label="Date recorded"
                type="date"
                value={form.dateRecorded}
                onChange={(e) => update('dateRecorded', e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Next due date"
                type="date"
                value={form.nextDueDate ?? ''}
                onChange={(e) => update('nextDueDate', e.target.value || null)}
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="source-document">
                Source document (optional)
              </label>
              <select
                id="source-document"
                className={styles.select}
                value={form.sourceDocumentId ?? ''}
                onChange={(e) => update('sourceDocumentId', e.target.value || null)}
                disabled={loading}
              >
                <option value="">No linked document</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fileName} · {formatDocumentVaultDate(doc.uploadedAt)}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Description"
              value={form.description ?? ''}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Notes, dosage, clinic name, or other details"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.actions}>
            {record && onDelete && (
              <Button
                variant="destructive"
                size="md"
                type="button"
                onClick={() => void handleDelete()}
                disabled={loading}
              >
                Delete
              </Button>
            )}
            <Button variant="ghost" size="md" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loading || !form.title.trim()}
            >
              {loading ? 'Saving…' : record ? 'Save changes' : 'Add record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
