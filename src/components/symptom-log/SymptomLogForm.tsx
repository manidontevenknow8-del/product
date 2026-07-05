import { useRef, useState } from 'react';
import {
  COMMON_PET_SYMPTOMS,
  type CommonPetSymptom,
} from '@/services/symptomLog';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './SymptomLogForm.module.css';

export type SymptomLogFormSubmitInput = {
  symptoms: string[];
  note: string | null;
  photoUrl: string | null;
};

type SymptomLogFormProps = {
  petName: string;
  onSubmit: (input: SymptomLogFormSubmitInput) => Promise<void>;
  compact?: boolean;
  submitLabel?: string;
};

export function SymptomLogForm({
  petName,
  onSubmit,
  compact = false,
  submitLabel = 'Save symptom log',
}: SymptomLogFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<CommonPetSymptom[]>([]);
  const [note, setNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symptom: CommonPetSymptom) => {
    setSelected((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    );
  };

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
    const trimmedNote = note.trim();

    if (selected.length === 0 && !trimmedNote) {
      setError('Select at least one symptom or add a note.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        symptoms: [...selected],
        note: trimmedNote || null,
        photoUrl: photoDataUrl,
      });
      setSelected([]);
      setNote('');
      clearPhoto();
    } catch (err) {
      setError(getUserFacingError(err, 'generic', 'Could not save symptom log.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className={`${styles.form} ${compact ? styles.compact : ''}`.trim()}
      onSubmit={(event) => void handleSubmit(event)}
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>What are you noticing with {petName}?</legend>
        <div className={styles.checklist} role="group" aria-label="Common symptoms">
          {COMMON_PET_SYMPTOMS.map((symptom) => {
            const active = selected.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                aria-pressed={active}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className={styles.field}>
        <span className={styles.label}>Additional notes</span>
        <textarea
          className={styles.textarea}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional — when it started, severity, triggers…"
          rows={compact ? 3 : 4}
          maxLength={500}
        />
      </label>

      <div className={styles.photoRow}>
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        <button type="button" className={styles.secondaryBtn} onClick={() => fileInputRef.current?.click()}>
          {photoPreview ? 'Change photo' : 'Add photo (optional)'}
        </button>
        {photoPreview && (
          <button type="button" className={styles.textBtn} onClick={clearPhoto}>
            Remove photo
          </button>
        )}
      </div>

      {photoPreview && (
        <img src={photoPreview} alt="Symptom reference" className={styles.photoPreview} />
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.primaryBtn} disabled={saving}>
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
