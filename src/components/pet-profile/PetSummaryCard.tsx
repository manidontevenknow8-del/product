import { useHealthRecords } from '@/healthRecords';
import type { PetProfile } from '@/types/profile';
import styles from './PetSummaryCard.module.css';

type PetSummaryCardProps = {
  profile: PetProfile;
  showHeader?: boolean;
};

type Fact = {
  label: string;
  value: string;
  empty?: boolean;
};

function isEmptyValue(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    !v ||
    v === 'not recorded' ||
    v === 'not registered' ||
    v === 'unknown' ||
    v === 'none' ||
    v === '0 on file'
  );
}

export function PetSummaryCard({ profile, showHeader = true }: PetSummaryCardProps) {
  const { healthSummary, isLoading } = useHealthRecords();

  const facts: Fact[] = [
    { label: 'Weight', value: healthSummary.latestWeight ?? profile.weight },
    { label: 'Diet', value: profile.diet },
    {
      label: 'Vaccinations',
      value: isLoading ? 'Loading…' : healthSummary.vaccinationStatus,
    },
    {
      label: 'Allergies',
      value: isLoading ? 'Loading…' : healthSummary.allergies,
    },
    {
      label: 'Microchip',
      value: profile.microchipId ?? '—',
      empty: !profile.microchipId,
    },
    {
      label: 'Health records',
      value: isLoading ? 'Loading…' : `${healthSummary.recordCount} on file`,
      empty: healthSummary.recordCount === 0 && !isLoading,
    },
  ];

  return (
    <section className={styles.card}>
      {showHeader && <h2 className={styles.title}>At a glance</h2>}
      <dl className={styles.rows}>
        {facts.map((fact) => {
          const empty = fact.empty ?? isEmptyValue(fact.value);
          return (
            <div key={fact.label} className={styles.row}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd
                className={`${styles.factValue} ${empty ? styles.factValueEmpty : ''}`}
              >
                {empty && fact.value !== 'Loading…' ? '—' : fact.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
