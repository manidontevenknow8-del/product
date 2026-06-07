import { useHealthRecords } from '@/healthRecords';
import type { PetProfile } from '@/types/profile';
import styles from './PetSummaryCard.module.css';

type PetSummaryCardProps = {
  profile: PetProfile;
};

type Fact = {
  label: string;
  value: string;
  empty?: boolean;
};

export function PetSummaryCard({ profile }: PetSummaryCardProps) {
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
      value: profile.microchipId ?? 'Not registered',
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
      <h2 className={styles.title}>At a glance</h2>
      <div className={styles.grid}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <span className={styles.factLabel}>{fact.label}</span>
            <span className={`${styles.factValue} ${fact.empty ? styles.factValueMuted : ''}`}>
              {fact.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
