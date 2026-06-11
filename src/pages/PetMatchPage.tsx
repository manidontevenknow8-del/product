import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useAnalytics } from '@/analytics';
import {
  PetMatchAnalyzingState,
  PetMatchPortraitResults,
  PetMatchQuizStep,
  PetMatchSaveMatchesPanel,
} from '@/components/pet-match';
import {
  EDITORIAL_PET_MATCH_QUESTIONS,
  runEditorialPetMatch,
} from '@/data/petMatchEditorialQuiz';
import type { EditorialQuizAnswers } from '@/types/petMatchEditorial';
import { ROUTES } from '@/routes/paths';

const TOTAL_STEPS = EDITORIAL_PET_MATCH_QUESTIONS.length;
const ANALYZING_MS = 2200;

type QuizPhase = 'quiz' | 'analyzing' | 'results';

export function PetMatchPage() {
  const { isAuthenticated } = useAuth();
  const { track } = useAnalytics();
  const [phase, setPhase] = useState<QuizPhase>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<EditorialQuizAnswers>>({});

  useEffect(() => {
    track('pet_match_viewed');
  }, [track]);

  const currentQuestion = EDITORIAL_PET_MATCH_QUESTIONS[stepIndex];

  const result = useMemo(() => {
    if (phase !== 'results') return null;
    const complete = answers as EditorialQuizAnswers;
    return runEditorialPetMatch(complete);
  }, [answers, phase]);

  const handleSelect = useCallback(
    (value: string) => {
      const key = currentQuestion.key;
      const nextAnswers = { ...answers, [key]: value } as Partial<EditorialQuizAnswers>;
      setAnswers(nextAnswers);

      const isLast = stepIndex >= TOTAL_STEPS - 1;
      if (isLast) {
        setPhase('analyzing');
        track('pet_match_completed');
        window.setTimeout(() => {
          setPhase('results');
        }, ANALYZING_MS);
        return;
      }

      setStepIndex((prev) => prev + 1);
    },
    [answers, currentQuestion.key, stepIndex, track],
  );

  const handleRestart = () => {
    setAnswers({});
    setStepIndex(0);
    setPhase('quiz');
  };

  const progressPct = phase === 'results' ? 100 : ((stepIndex + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFAFA] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200/50 bg-[#FAFAFA]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to={ROUTES.LANDING}
            className="font-serif text-xl tracking-tight text-stone-900 sm:text-2xl"
          >
            PetClues
          </Link>
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-stone-400">
            Pet Match
          </p>
        </div>
        <div className="h-px w-full bg-stone-200/60">
          <div
            className="h-full bg-stone-800 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Quiz progress"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        {phase === 'quiz' && currentQuestion && (
          <PetMatchQuizStep
            question={currentQuestion}
            stepNumber={stepIndex + 1}
            totalSteps={TOTAL_STEPS}
            selected={answers[currentQuestion.key]}
            onSelect={handleSelect}
          />
        )}

        {phase === 'analyzing' && <PetMatchAnalyzingState />}

        {phase === 'results' && result && (
          <div className="space-y-12 sm:space-y-16">
            <PetMatchPortraitResults matches={result.matches} />
            <PetMatchSaveMatchesPanel
              isAuthenticated={isAuthenticated}
              topMatchBreed={result.matches[0]?.breed}
            />
            <div className="text-center">
              <button
                type="button"
                onClick={handleRestart}
                className="font-sans text-xs uppercase tracking-[0.18em] text-stone-400 transition-colors hover:text-stone-700"
              >
                Retake the interview
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200/40 px-5 py-8 text-center sm:px-8">
        <p className="font-sans text-xs text-stone-400">
          Pet Match is guidance, not veterinary advice.{' '}
          <Link to={ROUTES.ABOUT} className="underline-offset-2 hover:underline">
            Our story
          </Link>
        </p>
      </footer>
    </div>
  );
}
