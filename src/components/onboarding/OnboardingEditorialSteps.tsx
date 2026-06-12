import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import type { OnboardingPetData } from '@/types/onboarding';
import styles from './OnboardingEditorialSteps.module.css';

type StepProps = {
  data: OnboardingPetData;
  onChange: (updates: Partial<OnboardingPetData>) => void;
};

export function PortraitStep({ data, onChange }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        photo: reader.result as string,
        photoName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className={styles.stepCentered}>
      <h1 className={styles.title}>Let&apos;s begin with a portrait</h1>
      <p className={styles.subtitle}>
        A face for their journal - you can always change this later.
      </p>

      <button
        type="button"
        className={`${styles.portraitButton} ${isDragging ? styles.portraitButtonDragging : ''}`.trim()}
        onClick={() => fileRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-label={data.photo ? 'Change pet portrait' : 'Add a portrait'}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={onInputChange}
        />
        {data.photo ? (
          <img
            src={data.photo}
            alt={data.name || 'Pet portrait'}
            className={styles.portraitImage}
          />
        ) : (
          <div className={styles.portraitPlaceholder}>
            <span className={styles.portraitPlus}>+</span>
            <span className={styles.portraitLabel}>Add a portrait</span>
          </div>
        )}
      </button>

      {data.photo && (
        <button
          type="button"
          className={styles.removePortrait}
          onClick={() => {
            onChange({ photo: null, photoName: '' });
            if (fileRef.current) fileRef.current.value = '';
          }}
        >
          Remove portrait
        </button>
      )}
    </div>
  );
}

export function NameStep({ data, onChange }: StepProps) {
  return (
    <div className={styles.step}>
      <h1 className={styles.title}>Who are we welcoming today?</h1>
      <p className={styles.subtitle}>Every great care story starts with a name.</p>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Their name"
        autoComplete="off"
        autoFocus
        className={styles.textInput}
        aria-label="Pet name"
      />
    </div>
  );
}

export function SpeciesStep({ data, onChange }: StepProps) {
  const speciesOptions: { value: OnboardingPetData['species']; label: string }[] = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className={styles.step}>
      <h1 className={styles.title}>Tell us about your companion</h1>
      <p className={styles.subtitle}>
        We&apos;ll tailor reminders, records, and insights to their world.
      </p>

      <div className={styles.speciesGroup} role="group" aria-label="Companion type">
        {speciesOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ species: opt.value })}
            className={`${styles.speciesBtn} ${
              data.species === opt.value ? styles.speciesBtnActive : ''
            }`.trim()}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={data.breed}
        onChange={(e) => onChange({ breed: e.target.value })}
        placeholder="Breed, if you know it"
        autoComplete="off"
        className={styles.textInputSpaced}
        aria-label="Breed"
      />
    </div>
  );
}

export function AgeStep({ data, onChange }: StepProps) {
  return (
    <div className={styles.step}>
      <h1 className={styles.title}>How old are they?</h1>
      <p className={styles.subtitle}>
        Approximate is perfectly fine - we use this for life-stage care cues.
      </p>
      <input
        type="text"
        value={data.age}
        onChange={(e) => onChange({ age: e.target.value })}
        placeholder="e.g. 4 years"
        autoComplete="off"
        autoFocus
        className={styles.textInput}
        aria-label="Age"
      />
    </div>
  );
}
