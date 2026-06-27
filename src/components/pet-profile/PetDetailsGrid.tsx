import type { PetProfile } from '@/types/profile';
import styles from './PetDetailsGrid.module.css';

const speciesLabel: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

type PetDetailsGridProps = {
  profile: PetProfile;
  showHeader?: boolean;
};

function displayValue(value: string, isNotes = false): { text: string; empty: boolean } {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  const empty =
    !trimmed ||
    lower === 'not recorded' ||
    lower === 'unknown' ||
    lower === '—' ||
    lower === '-';

  if (empty && isNotes) {
    return { text: 'No conditions or notes on file', empty: true };
  }
  if (empty) {
    return { text: '—', empty: true };
  }
  return { text: trimmed, empty: false };
}

export function PetDetailsGrid({ profile, showHeader = true }: PetDetailsGridProps) {
  const details = [
    { label: 'Gender', value: profile.gender, notes: false },
    { label: 'Date of birth', value: profile.dateOfBirth, notes: false },
    { label: 'Coat color', value: profile.color, notes: false },
    { label: 'Species', value: speciesLabel[profile.species], notes: false },
    { label: 'Breed', value: profile.breed, notes: false },
    { label: 'Weight', value: profile.weight, notes: false },
    { label: 'Conditions & notes', value: profile.conditionsNotes, notes: true },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        {showHeader && <h2 className={styles.title}>Details</h2>}
        <dl className={styles.rows}>
          {details.map((item) => {
            const { text, empty } = displayValue(item.value, item.notes);
            return (
              <div key={item.label} className={styles.row}>
                <dt className={styles.label}>{item.label}</dt>
                <dd className={`${styles.value} ${empty ? styles.valueEmpty : ''}`}>{text}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
