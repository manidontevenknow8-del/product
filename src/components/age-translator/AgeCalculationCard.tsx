import type { PetAgeProfile, AgeTranslation } from '@/types/ageTranslator';
import styles from './AgeCalculationCard.module.css';

type AgeCalculationCardProps = {
  pet: PetAgeProfile;
  translation: AgeTranslation;
};

export function AgeCalculationCard({ pet, translation }: AgeCalculationCardProps) {
  return (
    <article className={styles.hero} aria-label={`${pet.name}'s age`}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.illustration} aria-hidden="true" />
      <div className={styles.illustration2} aria-hidden="true" />

      <div className={styles.avatar}>{pet.avatarInitials}</div>
      <h2 className={styles.name}>{pet.name}</h2>
      <p className={styles.breed}>{pet.breed}</p>

      <div className={styles.ageDisplay}>
        <span className={styles.ageValue}>{translation.petAge.label.split(' ')[0]}</span>
        <span className={styles.ageUnit}>
          {translation.petAge.years === 1 ? 'year old' : 'years old'}
        </span>
      </div>
      <p className={styles.ageLabel}>Actual age</p>
    </article>
  );
}
