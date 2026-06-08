import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import type { ReportSightingInput } from '@/types/lostPet';
import styles from './ReportSightingModal.module.css';

type ReportSightingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ReportSightingInput) => Promise<void>;
  petName?: string;
  isPublic?: boolean;
};

export function ReportSightingModal({
  isOpen,
  onClose,
  onSubmit,
  petName = 'this pet',
  isPublic = false,
}: ReportSightingModalProps) {
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    setLoading(true);
    await onSubmit({
      location: location.trim(),
      notes: notes.trim() || undefined,
      reporterName: reporterName.trim() || undefined,
      hasPhoto: false,
    });
    setLoading(false);
    setLocation('');
    setNotes('');
    setReporterName('');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.wrap}>
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-sighting-title"
        >
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>

          <header className={styles.header}>
            <h2 id="report-sighting-title" className={styles.title}>
              Report a sighting
            </h2>
            <p className={styles.subtitle}>
              {isPublic
                ? `Help reunite ${petName} with their family. Only submit if you're confident in what you saw.`
                : `Log a sighting report for ${petName}. In production, community members submit via your recovery link.`}
            </p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where did you see them?"
              required
              autoFocus
            />

            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Direction, behaviour, collar, who they were with…"
              rows={3}
            />

            {isPublic && (
              <Input
                label="Your name (optional)"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="First name only"
              />
            )}

            <p className={styles.photoNote}>
              Photo upload placeholder - attach a photo in a future release
            </p>

            <div className={styles.actions}>
              <Button variant="ghost" size="md" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={loading || !location.trim()}
              >
                {loading ? 'Submitting…' : 'Submit report'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
