import type { SharedPet } from '@/types/familySharing';
import styles from './SharedPetsList.module.css';

type SharedPetsListProps = {
  pets: SharedPet[];
};

export function SharedPetsList({ pets }: SharedPetsListProps) {
  if (pets.length === 0) {
    return (
      <p className={styles.empty}>
        No pets available for sharing yet.
      </p>
    );
  }

  return (
    <div className={styles.list}>
      {pets.map((pet) => (
        <div key={pet.id} className={styles.item}>
          <div className={styles.avatar}>{pet.avatarInitials}</div>
          <div className={styles.info}>
            <div className={styles.name}>{pet.name}</div>
            <div className={styles.species}>{pet.species}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
