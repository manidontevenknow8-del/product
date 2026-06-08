import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageContainer, Card } from '@/components/ui';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  PetMatchLeadCapture,
  PetMatchProgress,
  PetMatchQuestionnaire,
  PetMatchResultCard,
} from '@/components/pet-match';
import { useAuth } from '@/auth/AuthProvider';
import { PET_MATCH_QUESTIONS } from '@/services/petMatch/petMatchQuestionnaire';
import { runPetMatchEngine } from '@/services/petMatch/petMatchEngine';
import { savePetMatchRecommendation } from '@/services/petMatch/petMatchLeadService';
import type { PetMatchAnswers } from '@/types/petMatch';
import { ROUTES } from '@/routes/paths';
import styles from './PetMatchPage.module.css';

const TOTAL_STEPS = PET_MATCH_QUESTIONS.length;

export function PetMatchPage() {
  const { isAuthenticated, user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<PetMatchAnswers>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentQuestion = PET_MATCH_QUESTIONS[stepIndex];
  const isComplete = stepIndex >= TOTAL_STEPS;

  const result = useMemo(() => {
    if (!isComplete) return null;
    return runPetMatchEngine(answers as PetMatchAnswers);
  }, [answers, isComplete]);

  const handleAnswer = (value: string) => {
    const key = currentQuestion.key;
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    setStepIndex((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleRestart = () => {
    setAnswers({});
    setSaveSuccess(false);
    setStepIndex(0);
  };

  const handleSave = () => {
    if (!result) return;
    savePetMatchRecommendation(user?.id ?? null, answers as PetMatchAnswers, result);
    setSaveSuccess(true);
  };

  const heroTitle = isComplete
    ? 'A companion that fits your real life'
    : 'Before you choose with your heart alone';

  const heroSubtitle = isComplete
    ? 'Your match is ready. Save it, then build a calm home for their health records, reminders, and story in PetClues.'
    : 'Many new pet parents fall in love first - then feel overwhelmed by energy levels, vet costs, and routines that never quite fit. A few honest answers can spare you years of guilt and second-guessing.';

  const content = (
    <div className={styles.page}>
      <PageHeroBand
        image={PAGE_IMG.app.petMatch}
        imageAlt=""
        eyebrow="Pet Match"
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      <PageContainer size="xl" className={styles.body}>
        {!isComplete && (
          <div className={styles.progressWrap}>
            <PetMatchProgress currentStep={stepIndex + 1} totalSteps={TOTAL_STEPS} />
          </div>
        )}

        {!isComplete ? (
          <div className={styles.questionArea}>
            <PetMatchQuestionnaire
              question={currentQuestion}
              currentAnswer={answers[currentQuestion.key]}
              currentStep={stepIndex + 1}
              totalSteps={TOTAL_STEPS}
              onAnswer={handleAnswer}
              onBack={handleBack}
            />
            <Card variant="information" className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Why this matters</h3>
              <p className={styles.sideLead}>
                The wrong match is not a small mistake. It is sleepless nights, strained budgets,
                and a pet who never quite gets the life they deserve.
              </p>
              <ul className={styles.sideList}>
                <li>Match energy to your home, not your weekend fantasy.</li>
                <li>See care difficulty and monthly costs before you commit.</li>
                <li>Get breed picks with clear reasons - no mystery algorithms.</li>
              </ul>
              <p className={styles.sideFooter}>
                Already have a pet?{' '}
                <Link to={ROUTES.SIGNUP} className={styles.sideLink}>
                  Start organizing their story
                </Link>{' '}
                or{' '}
                <Link to={ROUTES.ABOUT} className={styles.sideLink}>
                  read why we built PetClues
                </Link>
                .
              </p>
            </Card>
          </div>
        ) : (
          <div className={styles.resultsArea}>
            {result ? <PetMatchResultCard result={result} /> : null}
            <PetMatchLeadCapture
              isAuthenticated={isAuthenticated}
              onSave={handleSave}
              onRestart={handleRestart}
              saveSuccess={saveSuccess}
            />
          </div>
        )}
      </PageContainer>
    </div>
  );

  if (isAuthenticated) {
    return (
      <AppLayout flushContent>
        {content}
      </AppLayout>
    );
  }

  return (
    <PublicLayout>
      {content}
    </PublicLayout>
  );
}
