import { useEffect, useState } from 'react';
import type { EmergencyCriticalFields } from '@/services/emergencyPassport/emergencyPassportTypes';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './EmergencyPassportEditor.module.css';

type EmergencyPassportEditorProps = {
  petName: string;
  initialFields: EmergencyCriticalFields;
  canEdit: boolean;
  isRevoked: boolean;
  onSave: (fields: EmergencyCriticalFields) => Promise<unknown>;
  onSyncFromRecords: () => Promise<unknown>;
  onRegenerateToken: () => Promise<unknown>;
  onRevoke: () => Promise<void>;
};

function linesToText(lines: string[]): string {
  return lines.join('\n');
}

function textToLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function EmergencyPassportEditor({
  petName,
  initialFields,
  canEdit,
  isRevoked,
  onSave,
  onSyncFromRecords,
  onRegenerateToken,
  onRevoke,
}: EmergencyPassportEditorProps) {
  const [fields, setFields] = useState(initialFields);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setAction(label);
    setError(null);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Something went wrong.'));
    } finally {
      setAction(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onSave({
        ...fields,
        allergies: textToLines(linesToText(fields.allergies)),
        medications: textToLines(linesToText(fields.medications)),
      });
      setMessage('Emergency fields saved.');
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not save emergency fields.'));
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <section className={styles.wrap}>
        <p className={styles.viewerNote}>
          View-only access. Ask a household owner or editor to update {petName}&apos;s emergency
          share fields.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <p className={styles.kicker}>Emergency share sheet</p>
          <h3 className={styles.title}>Critical fields for the public link</h3>
          <p className={styles.lead}>
            These fields power the token link sitters, boarding staff, and ER vets see — separate from
            your full health archive.
          </p>
        </div>
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={Boolean(action)}
          onClick={() => void run('sync', onSyncFromRecords)}
        >
          {action === 'sync' ? 'Syncing…' : 'Sync from records'}
        </button>
      </div>

      {isRevoked && (
        <p className={styles.warning} role="status">
          The public link is revoked. Save or regenerate to publish a new link.
        </p>
      )}

      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Allergies (one per line)</span>
          <textarea
            rows={4}
            value={linesToText(fields.allergies)}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, allergies: textToLines(event.target.value) }))
            }
          />
        </label>

        <label className={styles.field}>
          <span>Current medications (one per line)</span>
          <textarea
            rows={4}
            value={linesToText(fields.medications)}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, medications: textToLines(event.target.value) }))
            }
          />
        </label>

        <label className={styles.field}>
          <span>Vet name</span>
          <input
            type="text"
            value={fields.vetName ?? ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, vetName: event.target.value || null }))
            }
          />
        </label>

        <label className={styles.field}>
          <span>Vet phone</span>
          <input
            type="tel"
            value={fields.vetPhone ?? ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, vetPhone: event.target.value || null }))
            }
          />
        </label>

        <label className={styles.field}>
          <span>Insurance provider</span>
          <input
            type="text"
            value={fields.insuranceProvider ?? ''}
            onChange={(event) =>
              setFields((prev) => ({
                ...prev,
                insuranceProvider: event.target.value || null,
              }))
            }
          />
        </label>

        <label className={styles.field}>
          <span>Insurance policy number</span>
          <input
            type="text"
            value={fields.insurancePolicyNumber ?? ''}
            onChange={(event) =>
              setFields((prev) => ({
                ...prev,
                insurancePolicyNumber: event.target.value || null,
              }))
            }
          />
        </label>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span>Microchip number</span>
          <input
            type="text"
            value={fields.microchipId ?? ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, microchipId: event.target.value || null }))
            }
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} disabled={saving} onClick={() => void handleSave()}>
          {saving ? 'Saving…' : 'Save emergency fields'}
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={Boolean(action)}
          onClick={() =>
            void run('regenerate', async () => {
              await onRegenerateToken();
              setMessage('New public link generated. Old links no longer work.');
            })
          }
        >
          {action === 'regenerate' ? 'Regenerating…' : 'Regenerate link'}
        </button>
        <button
          type="button"
          className={styles.dangerBtn}
          disabled={Boolean(action)}
          onClick={() =>
            void run('revoke', async () => {
              await onRevoke();
              setMessage('Public link revoked.');
            })
          }
        >
          {action === 'revoke' ? 'Revoking…' : 'Revoke link'}
        </button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
    </section>
  );
}
