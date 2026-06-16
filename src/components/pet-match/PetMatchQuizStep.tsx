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
      <p className={styles.stepLabel}>
        Question {stepNumber} of {totalSteps}
      </p>
      <h1 className={styles.prompt}>{question.prompt}</h1>
      <PetMatchAnswerCards
        options={question.options}
        selected={selected}
        onSelect={(value) => onSelect(value as EditorialQuizAnswers[T])}
      />
    </div>
  );
}
