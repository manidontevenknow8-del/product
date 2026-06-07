import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import type { ActivateLostPetInput } from '@/types/lostPet';
import { nowDatetimeLocalValue } from '@/utils/lostPetUtils';
import styles from './ActivateLostPetModal.module.css';

type ActivateLostPetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (input: ActivateLostPetInput) => Promise<void>;
  petName: string;
};

export function ActivateLostPetModal({
  isOpen,
  onClose,
  onActivate,
  petName,
}: ActivateLostPetModalProps) {
  const [location, setLocation] = useState('');
  const [lastSeenAt, setLastSeenAt] = useState(nowDatetimeLocalValue());
  const [notes, setNotes] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLastSeenAt(nowDatetimeLocalValue());
    }
  }, [isOpen]);

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
    await onActivate({
      lastSeenLocation: location.trim(),
      lastSeenAt: new Date(lastSeenAt).toISOString(),
      notes: notes.trim() || undefined,
      photoUrl: photoName ? 'placeholder-photo' : undefined,
    });
    setLoading(false);
    onClose();
  };

  const handlePhotoSelect = () => {
    setPhotoName(`${petName.toLowerCase()}-recent.jpg`);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modalWrap}>
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="activate-lost-pet-title"
        >
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>

          <header className={styles.header}>
            <p className={styles.eyebrow}>Emergency activation</p>
            <h2 id="activate-lost-pet-title" className={styles.title}>
              Activate Lost Pet Mode
            </h2>
            <p className={styles.subtitle}>
              This will prepare recovery assets for {petName} and enable community
              sighting reports. Only share what you&apos;re comfortable with publicly.
            </p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Last seen location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Street, park, or neighbourhood"
              required
              autoFocus
            />

            <Input
              label="Date & time last seen"
              type="datetime-local"
              value={lastSeenAt}
              onChange={(e) => setLastSeenAt(e.target.value)}
              required
            />

            <Textarea
              label="Additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Collar colour, behaviour, direction of travel…"
              rows={3}
            />

            <button type="button" className={styles.photoUpload} onClick={handlePhotoSelect}>
              {photoName ? (
                <span className={styles.photoSelected}>Photo added: {photoName}</span>
              ) : (
                <>
                  <span className={styles.photoLabel}>Add current photo</span>
                  <span className={styles.photoHint}>
                    Recent photo helps identification · Tap to select (demo)
                  </span>
                </>
              )}
            </button>

            <p className={styles.warning}>
              Activating Lost Pet Mode creates a shareable recovery page. Emergency
              contacts from your passport will be visible on shared materials.
            </p>

            <div className={styles.actions}>
              <Button variant="ghost" size="md" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="md"
                type="submit"
                disabled={loading || !location.trim()}
              >
                {loading ? 'Activating…' : 'Activate now'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
