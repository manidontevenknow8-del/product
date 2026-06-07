import type { PetProfile } from '@/types/profile';
import styles from './PetDetailsGrid.module.css';

const speciesLabel: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

type PetDetailsGridProps = {
  profile: PetProfile;
};

export function PetDetailsGrid({ profile }: PetDetailsGridProps) {
  const details = [
    { label: 'Gender', value: profile.gender },
    { label: 'Date of birth', value: profile.dateOfBirth },
    { label: 'Coat color', value: profile.color },
    { label: 'Species', value: speciesLabel[profile.species] },
    { label: 'Breed', value: profile.breed },
    { label: 'Weight', value: profile.weight },
    { label: 'Conditions & notes', value: profile.conditionsNotes, full: true },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Details</h2>
      <div className={styles.grid}>
        {details.map((item) => (
          <div
            key={item.label}
            className={`${styles.item} ${item.full ? styles.itemFull : ''}`}
          >
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
