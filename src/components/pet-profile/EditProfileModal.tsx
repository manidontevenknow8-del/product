import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import {
  editPetFormToUpdateInput,
  petRecordToEditPetForm,
  type EditPetForm,
  type PetRecord,
  type UpdatePetInput,
} from '@/services/pets/petService';
import styles from './EditProfileModal.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

type EditProfileModalProps = {
  pet: PetRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: UpdatePetInput) => Promise<void>;
};

type SaveState = 'idle' | 'saving' | 'success' | 'error';

export function EditProfileModal({ pet, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [form, setForm] = useState<EditPetForm>(() => petRecordToEditPetForm(pet));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(petRecordToEditPetForm(pet));
      setSaveState('idle');
      setErrorMessage(null);
    }
  }, [isOpen, pet]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && saveState !== 'saving') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, saveState]);

  if (!isOpen) return null;

  const initials = form.name.trim().slice(0, 2).toUpperCase() || '?';
  const isSaving = saveState === 'saving';

  const update = <K extends keyof EditPetForm>(field: K, value: EditPetForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (saveState === 'error') {
      setSaveState('idle');
      setErrorMessage(null);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      update('photo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    update('photo', null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setSaveState('error');
      setErrorMessage('Pet name is required.');
      return;
    }

    setSaveState('saving');
    setErrorMessage(null);

    try {
      await onSave(editPetFormToUpdateInput({ ...form, name: trimmedName }));
      setSaveState('success');
      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setSaveState('error');
      setErrorMessage(getUserFacingError(err, 'pet', 'Failed to save changes.'));
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={isSaving ? undefined : onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        <div className={styles.header}>
          <h2 id="edit-profile-title" className={styles.title}>
            Edit profile
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          {saveState === 'success' && (
            <p className={styles.success} role="status">
              Profile saved successfully.
            </p>
          )}
          {saveState === 'error' && errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}

          <div className={styles.photoSection}>
            <span className={styles.photoLabel}>Photo</span>
            <div className={styles.photoUpload}>
              <div className={styles.photoPreview}>
                {form.photo ? (
                  <img src={form.photo} alt={form.name || 'Pet'} />
                ) : (
                  initials
                )}
              </div>
              <div className={styles.photoActions}>
                <label className={styles.uploadBtn}>
                  {form.photo ? 'Change photo' : 'Add a photo'}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handlePhotoChange}
                    disabled={isSaving}
                  />
                </label>
                <span className={styles.photoHint}>Optional - stored as profile photo</span>
                {form.photo && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={clearPhoto}
                    disabled={isSaving}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <Input
            label="Pet name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            disabled={isSaving}
          />
          <Input
            as="select"
            label="Species"
            value={form.species}
            onChange={(e) => update('species', e.target.value as EditPetForm['species'])}
            disabled={isSaving}
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </Input>
          <Input
            label="Breed"
            value={form.breed}
            onChange={(e) => update('breed', e.target.value)}
            placeholder="Optional"
            disabled={isSaving}
          />
          <Input
            label="Age"
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
            placeholder="e.g. 4 years"
            disabled={isSaving}
          />
          <Input
            label="Weight"
            value={form.weight}
            onChange={(e) => update('weight', e.target.value)}
            placeholder="e.g. 12 kg"
            disabled={isSaving}
          />
          <Input
            as="select"
            label="Gender"
            value={form.gender}
            onChange={(e) => update('gender', e.target.value as EditPetForm['gender'])}
            disabled={isSaving}
          >
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </Input>
          <Input
            label="Diet"
            value={form.diet}
            onChange={(e) => update('diet', e.target.value)}
            placeholder="e.g. Dry food, prescription renal diet"
            disabled={isSaving}
          />
          <Input
            label="Coat color"
            value={form.coatColor}
            onChange={(e) => update('coatColor', e.target.value)}
            placeholder="e.g. Black and tan"
            disabled={isSaving}
          />
          <Input
            label="Microchip number"
            value={form.microchipId}
            onChange={(e) => update('microchipId', e.target.value)}
            placeholder="15-digit ISO chip ID"
            disabled={isSaving}
          />
          <Textarea
            label="Conditions & notes"
            value={form.conditionsNotes}
            onChange={(e) => update('conditionsNotes', e.target.value)}
            placeholder="Chronic conditions, medications, sensitivities, habits…"
            disabled={isSaving}
          />
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" size="md" fullWidth onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => void handleSave()}
            disabled={isSaving || saveState === 'success'}
          >
            {isSaving ? 'Saving…' : saveState === 'success' ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
