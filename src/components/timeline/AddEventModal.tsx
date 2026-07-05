import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './AddEventModal.module.css';

export type AddMomentSubmitInput = {
  caption: string;
  occurredAt: string;
  photoUrl: string;
};

type AddEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
  canEdit: boolean;
  onSubmit: (input: AddMomentSubmitInput) => Promise<void>;
};

function todayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateInputToIso(date: string): string {
  return `${date}T12:00:00.000Z`;
}

export function AddEventModal({
  isOpen,
  onClose,
  petName,
  canEdit,
  onSubmit,
}: AddEventModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [occurredOn, setOccurredOn] = useState(todayDateInputValue);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, saving]);

  useEffect(() => {
    if (!isOpen) {
      setCaption('');
      setOccurredOn(todayDateInputValue());
      setPhotoPreview(null);
      setPhotoDataUrl(null);
      setError(null);
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for the photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setPhotoPreview(result);
      setPhotoDataUrl(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setPhotoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      setError('Add a caption for this moment.');
      return;
    }

    if (!photoDataUrl) {
      setError('Add a photo to save this memory.');
      return;
    }

    if (!occurredOn) {
      setError('Choose when this moment happened.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        caption: trimmedCaption,
        occurredAt: dateInputToIso(occurredOn),
        photoUrl: photoDataUrl,
      });
      onClose();
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not save this moment.'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={saving ? undefined : onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-event-title"
      >
        <header className={styles.header}>
          <span className={styles.eyebrow}>Hand-picked memory</span>
          <h2 id="add-event-title" className={styles.title}>
            Add a moment
          </h2>
          <p className={styles.description}>
            Save a photo and caption from {petName}&apos;s life. These memories appear in your
            timeline under Memories — separate from clinical care logs.
          </p>
        </header>

        {!canEdit ? (
          <p className={styles.readOnlyNote} role="status">
            Viewers can browse the timeline but cannot add moments. Ask a household owner or editor
            to save new memories.
          </p>
        ) : (
          <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
            <label className={styles.field}>
              <span className={styles.label}>Caption</span>
              <textarea
                className={styles.textarea}
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder={`What made this moment special for ${petName}?`}
                rows={4}
                maxLength={500}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>When it happened</span>
              <input
                className={styles.dateInput}
                type="date"
                value={occurredOn}
                max={todayDateInputValue()}
                onChange={(event) => setOccurredOn(event.target.value)}
                required
              />
            </label>

            <div className={styles.photoField}>
              <span className={styles.label}>Photo</span>
              <div className={styles.photoRow}>
                <input
                  ref={fileInputRef}
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  className={styles.photoBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? 'Change photo' : 'Choose photo'}
                </button>
                {photoPreview && (
                  <button type="button" className={styles.textBtn} onClick={clearPhoto}>
                    Remove
                  </button>
                )}
              </div>
              {photoPreview && (
                <img src={photoPreview} alt="Moment preview" className={styles.photoPreview} />
              )}
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <footer className={styles.footer}>
              <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save moment'}
              </Button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
