import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import styles from './AddEventModal.module.css';

type AddEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
};

export function AddEventModal({ isOpen, onClose, petName }: AddEventModalProps) {
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

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-event-title"
      >
        <header className={styles.header}>
          <span className={styles.eyebrow}>Grow the story</span>
          <h2 id="add-event-title" className={styles.title}>
            Add a moment
          </h2>
          <p className={styles.description}>
            Timeline updates automatically from your real actions - each scan, health
            record, and completed reminder becomes part of {petName}&apos;s story.
          </p>
        </header>

        <div className={styles.actionsList}>
          <p className={styles.actionsTitle}>Fastest ways to add chapters</p>
          <ul>
            <li>
              <strong>Scan a vet document</strong> - appears as a document moment with
              photo previews when applicable
            </li>
            <li>
              <strong>Log a health record</strong> on Profile - vaccinations, weight,
              and wellness entries show up in Care
            </li>
            <li>
              <strong>Complete a reminder</strong> - marked-done tasks appear on the
              timeline with their category
            </li>
          </ul>
        </div>

        <footer className={styles.footer}>
          <Link to={ROUTES.SCAN} onClick={onClose}>
            <Button variant="primary" size="sm">
              Go to Scan
            </Button>
          </Link>
          <Link to={ROUTES.PET_PROFILE} onClick={onClose}>
            <Button variant="secondary" size="sm">
              Health records
            </Button>
          </Link>
          <Link to={`${ROUTES.REMINDERS}?create=true`} onClick={onClose}>
            <Button variant="ghost" size="sm">
              Add reminder
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}
