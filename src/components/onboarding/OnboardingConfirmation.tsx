import type { OnboardingPetData } from '@/types/onboarding';
import styles from './OnboardingConfirmation.module.css';

type OnboardingConfirmationProps = {
  data: OnboardingPetData;
  onEditBasics: () => void;
  onEditHealth: () => void;
};

const speciesLabel: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

const vaccinationLabel: Record<string, string> = {
  'up-to-date': 'Up to date',
  'due-soon': 'Due soon',
  unknown: 'Not sure',
  none: 'None recorded',
};

const dietLabel: Record<string, string> = {
  dry: 'Dry food',
  wet: 'Wet food',
  raw: 'Raw / fresh',
  mixed: 'Mixed',
  prescription: 'Prescription diet',
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${!value ? styles.rowValueEmpty : ''}`}>
        {value || 'Not provided'}
      </span>
    </div>
  );
}

export function OnboardingConfirmation({
  data,
  onEditBasics,
  onEditHealth,
}: OnboardingConfirmationProps) {
  const initials = data.name.slice(0, 2).toUpperCase();
  const meta = [data.breed, data.species ? speciesLabel[data.species] : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={styles.confirm}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <div className={styles.check} />
        </div>
        <h2 className={styles.title}>Looking wonderful</h2>
        <p className={styles.subtitle}>
          Review {data.name || 'your pet'}&apos;s profile before we continue.
        </p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileTop}>
          <div className={styles.avatar}>
            {data.photo ? (
              <img src={data.photo} alt={data.name} />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className={styles.profileName}>{data.name}</div>
            <div className={styles.profileMeta}>{meta || 'Profile details'}</div>
          </div>
        </div>

        <div className={styles.sections}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Basics</span>
              <button type="button" className={styles.editBtn} onClick={onEditBasics}>
                Edit
              </button>
            </div>
            <SummaryRow label="Age" value={data.age} />
            <SummaryRow label="Type" value={data.species ? speciesLabel[data.species] : ''} />
            <SummaryRow label="Breed" value={data.breed} />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Health</span>
              <button type="button" className={styles.editBtn} onClick={onEditHealth}>
                Edit
              </button>
            </div>
            <SummaryRow
              label="Vaccinations"
              value={data.vaccinationStatus ? vaccinationLabel[data.vaccinationStatus] ?? data.vaccinationStatus : ''}
            />
            <SummaryRow label="Allergies" value={data.allergies} />
            <SummaryRow
              label="Diet"
              value={data.dietType ? dietLabel[data.dietType] ?? data.dietType : ''}
            />
            <SummaryRow label="Weight" value={data.weight} />
            {data.conditionsNotes && (
              <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className={styles.rowLabel}>Notes</span>
                <p className={styles.notes}>{data.conditionsNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
