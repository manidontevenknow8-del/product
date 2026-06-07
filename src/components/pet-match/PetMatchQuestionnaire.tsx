import { Button, Card } from '@/components/ui';
import type { PetMatchAnswers, PetMatchQuestion } from '@/types/petMatch';
import styles from './PetMatchQuestionnaire.module.css';

type PetMatchQuestionnaireProps = {
  question: PetMatchQuestion<keyof PetMatchAnswers>;
  currentAnswer?: string;
  currentStep: number;
  totalSteps: number;
  onAnswer: (value: string) => void;
  onBack: () => void;
};

export function PetMatchQuestionnaire({
  question,
  currentAnswer,
  currentStep,
  totalSteps,
  onAnswer,
  onBack,
}: PetMatchQuestionnaireProps) {
  return (
    <Card variant="elevated" padding="lg" className={styles.card}>
      <p className={styles.stepLabel}>
        Question {currentStep} of {totalSteps}
      </p>
      <h2 className={styles.prompt}>{question.prompt}</h2>
      <div className={styles.options}>
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onAnswer(option.value)}
            className={`${styles.option} ${currentAnswer === option.value ? styles.optionActive : ''}`}
          >
            <span className={styles.optionLabel}>{option.label}</span>
            {option.hint ? <span className={styles.optionHint}>{option.hint}</span> : null}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack} disabled={currentStep === 1}>
          Back
        </Button>
      </div>
    </Card>
  );
}
