import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';
import { ReminderForm } from './ReminderForm';
import { usePets } from '@/pets';
import { defaultCreateReminderInput } from '@/services/reminders/reminderService';
import type { CreateReminderInput } from '@/types/reminder';
import styles from './ReminderModal.module.css';

type CreateReminderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateReminderInput) => Promise<void>;
  preferredPetId?: string;
};

export function CreateReminderModal({
  isOpen,
  onClose,
  onSubmit,
  preferredPetId,
}: CreateReminderModalProps) {
  const { pets, activePet } = usePets();
  const [form, setForm] = useState<CreateReminderInput>(() =>
    defaultCreateReminderInput('', ''),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildDefault = useCallback(() => {
    const pet =
      (preferredPetId ? pets.find((p) => p.id === preferredPetId) : undefined) ??
      activePet ??
      pets[0];
    if (!pet) return defaultCreateReminderInput('', '');
    return defaultCreateReminderInput(pet.id, pet.name);
  }, [activePet, pets, preferredPetId]);

  useEffect(() => {
    if (isOpen) {
      setForm(buildDefault());
      setError(null);
    }
  }, [isOpen, buildDefault]);

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

  if (!isOpen) return null;

  const canSubmit = Boolean(form.title.trim() && form.petId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reminder.');
    } finally {
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
        aria-labelledby="create-reminder-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="create-reminder-title" className={styles.title}>
              New reminder
            </h2>
            <p className={styles.subtitle}>Takes less than 30 seconds</p>
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
            <Button variant="ghost" size="md" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loading || !canSubmit}
            >
              {loading ? 'Saving…' : 'Create reminder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
