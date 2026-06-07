import type { PetAgeProfile } from '@/types/ageTranslator';
import styles from './AgeInputCard.module.css';

type AgeInputCardProps = {
  pets: PetAgeProfile[];
  selectedId: string | null;
  onSelect: (petId: string) => void;
};

export function AgeInputCard({ pets, selectedId, onSelect }: AgeInputCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.label}>Select your pet</span>
      <div className={styles.pets}>
        {pets.map((pet) => {
          const active = pet.id === selectedId;
          return (
            <button
              key={pet.id}
              type="button"
              className={`${styles.petBtn} ${active ? styles.petBtnActive : ''}`}
              onClick={() => onSelect(pet.id)}
            >
              <span className={styles.avatar}>{pet.avatarInitials}</span>
              <span className={styles.petInfo}>
                <span className={styles.petName}>{pet.name}</span>
                <span className={styles.petMeta}>
                  {pet.breed} · {pet.ageYears} {pet.ageYears === 1 ? 'year' : 'years'}
                </span>
              </span>
              {active && (
                <span className={styles.check} aria-hidden="true">
                  <span className={styles.checkInner} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </article>
  );
}
