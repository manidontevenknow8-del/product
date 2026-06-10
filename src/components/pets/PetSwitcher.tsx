import type { PetRecord } from '@/services/pets/petTypes';
import styles from './PetSwitcher.module.css';

type PetSwitcherProps = {
  pets: PetRecord[];
  activeId: string;
  onSelect: (petId: string) => void;
  variant?: 'onDark' | 'light';
  className?: string;
};

export function PetSwitcher({
  pets,
  activeId,
  onSelect,
  variant = 'onDark',
  className = '',
}: PetSwitcherProps) {
  if (pets.length <= 1) return null;

  const variantClass = variant === 'light' ? styles.light : styles.onDark;

  return (
    <div
      className={`${styles.switcher} ${variantClass} ${className}`.trim()}
      role="tablist"
      aria-label="Switch pet"
    >
      {pets.map((pet) => (
        <button
          key={pet.id}
          type="button"
          role="tab"
          aria-selected={pet.id === activeId}
          onClick={() => onSelect(pet.id)}
          className={`${styles.tab} ${pet.id === activeId ? styles.tabActive : ''}`}
        >
          {pet.name}
        </button>
      ))}
    </div>
  );
}

type PetSwitcherHeroProps = Omit<PetSwitcherProps, 'className'>;

/** Absolutely positioned pet tabs for full-bleed hero sections. */
export function PetSwitcherHero(props: PetSwitcherHeroProps) {
  if (props.pets.length <= 1) return null;

  return (
    <div className={styles.heroTop}>
      <PetSwitcher {...props} />
    </div>
  );
}
