import type { EditorialQuizQuestion, EditorialQuizAnswers } from '@/types/petMatchEditorial';
import { PetMatchAnswerCards } from './PetMatchAnswerCards';

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
    <div className="mx-auto w-full max-w-3xl">
      <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-stone-400">
        Question {stepNumber} of {totalSteps}
      </p>
      <h1 className="mt-6 font-serif text-4xl font-light leading-tight text-stone-900 sm:text-5xl md:text-6xl">
        {question.prompt}
      </h1>
      <PetMatchAnswerCards
        options={question.options}
        selected={selected}
        onSelect={(value) => onSelect(value as EditorialQuizAnswers[T])}
      />
    </div>
  );
}
