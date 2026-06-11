import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';
import { ReminderForm } from './ReminderForm';
import type { CreateReminderInput, Reminder } from '@/types/reminder';
import styles from './ReminderModal.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

type EditReminderModalProps = {
  reminder: Reminder | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, input: CreateReminderInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

function toFormInput(reminder: Reminder): CreateReminderInput {
  return {
    petId: reminder.petId,
    petName: reminder.petName,
    title: reminder.title,
    category: reminder.category,
    dueDate: reminder.dueDate,
    repeatFrequency: reminder.repeatFrequency,
    notes: reminder.notes,
    priority: reminder.priority,
  };
}

export function EditReminderModal({
  reminder,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}: EditReminderModalProps) {
  const [form, setForm] = useState<CreateReminderInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && reminder) {
      setForm(toFormInput(reminder));
      setError(null);
    }
  }, [isOpen, reminder]);

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

  if (!isOpen || !reminder || !form) return null;

  const canSubmit = Boolean(form.title.trim() && form.petId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(reminder.id, form);
      onClose();
    } catch (err) {
      setError(getUserFacingError(err, 'reminder', 'Failed to save reminder.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setLoading(true);
    setError(null);
    try {
      await onDelete(reminder.id);
      onClose();
    } catch (err) {
      setError(getUserFacingError(err, 'reminder', 'Failed to delete reminder.'));
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
        aria-labelledby="edit-reminder-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="edit-reminder-title" className={styles.title}>
              Edit reminder
            </h2>
            <p className={styles.subtitle}>Update details or reschedule</p>
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
          <ReminderForm value={form} onChange={setForm} />
          <div className={styles.actions}>
            {onDelete && (
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
              disabled={loading || !canSubmit}
            >
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
