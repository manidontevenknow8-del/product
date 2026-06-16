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
import styles from './PetMatchPage.module.css';

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
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to={ROUTES.LANDING} className={styles.logo}>
            PetClues
          </Link>
          <p className={styles.headerLabel}>Pet Match</p>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Quiz progress"
          />
        </div>
      </header>

      <main className={styles.main}>
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
          <div className={styles.resultsStack}>
            <PetMatchPortraitResults matches={result.matches} />
            <PetMatchSaveMatchesPanel
              isAuthenticated={isAuthenticated}
              topMatchBreed={result.matches[0]?.breed}
            />
            <div className={styles.restartWrap}>
              <button type="button" onClick={handleRestart} className={styles.restartBtn}>
                Retake the interview
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Pet Match is guidance, not veterinary advice.{' '}
          <Link to={ROUTES.ABOUT} className={styles.footerLink}>
            Our story
          </Link>
        </p>
      </footer>
    </div>
  );
}
