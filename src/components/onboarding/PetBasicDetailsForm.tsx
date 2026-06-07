import { useRef, type ChangeEvent } from 'react';
import { Input } from '@/components/ui';
import type { OnboardingPetData } from '@/types/onboarding';
import styles from './PetBasicDetailsForm.module.css';

type PetBasicDetailsFormProps = {
  data: OnboardingPetData;
  onChange: (updates: Partial<OnboardingPetData>) => void;
};

export function PetBasicDetailsForm({ data, onChange }: PetBasicDetailsFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = data.name
    ? data.name.slice(0, 2).toUpperCase()
    : '?';

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        photo: reader.result as string,
        photoName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    onChange({ photo: null, photoName: '' });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tell us about your companion</h2>
        <p className={styles.subtitle}>
          Just the essentials — you can always add more later.
        </p>
      </div>

      <div className={styles.fields}>
        <div className={styles.photoSection}>
          <span className={styles.photoLabel}>Photo</span>
          <div className={styles.photoUpload}>
            <div className={styles.photoPreview}>
              {data.photo ? (
                <img src={data.photo} alt={data.name || 'Pet'} />
              ) : (
                initials
              )}
            </div>
            <div className={styles.photoActions}>
              <label className={styles.uploadBtn}>
                {data.photo ? 'Change photo' : 'Add a photo'}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handlePhotoChange}
                />
              </label>
              <span className={styles.photoHint}>Optional — helps personalize their profile</span>
              {data.photo && (
                <button type="button" className={styles.removeBtn} onClick={clearPhoto}>
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        <Input
          label="Pet name"
          placeholder="e.g. Luna"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          autoComplete="off"
        />

        <Input
          as="select"
          label="Pet type"
          value={data.species}
          onChange={(e) =>
            onChange({ species: e.target.value as OnboardingPetData['species'] })
          }
        >
          <option value="">Select type</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="other">Other</option>
        </Input>

        <Input
          label="Breed"
          placeholder="e.g. Golden Retriever"
          value={data.breed}
          onChange={(e) => onChange({ breed: e.target.value })}
        />

        <Input
          label="Age"
          placeholder="e.g. 4 years"
          value={data.age}
          onChange={(e) => onChange({ age: e.target.value })}
          hint="Approximate is perfectly fine"
        />
      </div>
    </div>
  );
}
