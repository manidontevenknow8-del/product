import styles from './PetMatchAnswerCards.module.css';

type AnswerOption = {
  value: string;
  label: string;
  hint?: string;
};

type PetMatchAnswerCardsProps = {
  options: AnswerOption[];
  selected?: string;
  onSelect: (value: string) => void;
};

export function PetMatchAnswerCards({ options, selected, onSelect }: PetMatchAnswerCardsProps) {
  return (
    <div className={styles.grid}>
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
          >
            <span className={styles.label}>{option.label}</span>
            {option.hint && <span className={styles.hint}>{option.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
