import type { EditorialQuizQuestion, EditorialQuizAnswers } from '@/types/petMatchEditorial';
import { PetMatchAnswerCards } from './PetMatchAnswerCards';
import styles from './PetMatchQuizStep.module.css';

type PetMatchQuizStepProps<T extends keyof EditorialQuizAnswers> = {
  question: EditorialQuizQuestion<T>;
  stepNumber: number;
  totalSteps: number;
  selected?: EditorialQuizAnswers[T];
  onSelect: (value: EditorialQuizAnswers[T]) => void;
};

export function PetMatchQuizStep<T extends keyof EditorialQuizAnswers>({
  question,
  stepNumber,
  totalSteps,
  selected,
  onSelect,
}: PetMatchQuizStepProps<T>) {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <img
          src={question.heroImageUrl}
          alt=""
          className={styles.heroImg}
          loading="eager"
          aria-hidden
        />
        <div className={styles.heroScrim} aria-hidden />
        <div className={styles.heroMeta}>
          <p className={styles.stepLabel}>
            Question {stepNumber} of {totalSteps}
          </p>
        </div>
      </div>

      <div className={styles.copy}>
        <h1 className={styles.prompt}>{question.prompt}</h1>
        {question.subtitle && <p className={styles.subtitle}>{question.subtitle}</p>}
      </div>

      <PetMatchAnswerCards
        options={question.options}
        selected={selected}
        onSelect={(value) => onSelect(value as EditorialQuizAnswers[T])}
      />
    </div>
  );
}
