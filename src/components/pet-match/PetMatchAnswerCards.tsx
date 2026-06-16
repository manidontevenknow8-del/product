import styles from './PetMatchAnswerCards.module.css';

type AnswerOption = {
  value: string;
  label: string;
  hint?: string;
  imageUrl: string;
};

type PetMatchAnswerCardsProps = {
  options: AnswerOption[];
  selected?: string;
  onSelect: (value: string) => void;
};

export function PetMatchAnswerCards({ options, selected, onSelect }: PetMatchAnswerCardsProps) {
  const isTriple = options.length === 3;
  const gridClass = isTriple ? styles.gridTriple : styles.grid;

  return (
    <div className={gridClass}>
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
          >
            <div className={styles.imageWrap}>
              <img
                src={option.imageUrl}
                alt=""
                className={styles.image}
                loading="lazy"
                aria-hidden
              />
              <div className={styles.imageScrim} aria-hidden />
              {isSelected && (
                <span className={styles.selectedBadge} aria-hidden>
                  Selected
                </span>
              )}
            </div>
            <div className={styles.body}>
              <span className={styles.label}>{option.label}</span>
              {option.hint && <span className={styles.hint}>{option.hint}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
