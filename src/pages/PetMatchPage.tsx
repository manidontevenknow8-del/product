import { useMemo, useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageContainer, Badge, Card } from '@/components/ui';
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

  const heroSubtitle = isComplete
    ? 'Your personalized compatibility results are ready.'
    : 'A premium compatibility experience to help future pet owners discover their best match.';

  const content = (
    <div className={styles.page}>
      <PageHeroBand
        image={PAGE_IMG.app.petMatch}
        imageAlt=""
        eyebrow="Pet Match Engine"
        title="Find your perfect pet match"
        subtitle={heroSubtitle}
        meta={!isComplete ? `Question ${Math.min(stepIndex + 1, TOTAL_STEPS)} of ${TOTAL_STEPS}` : undefined}
      />

      <PageContainer size="xl" className={styles.body}>
        {!isComplete && (
          <div className={styles.progressWrap}>
            <Badge variant="accent">Acquisition Engine</Badge>
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
              <h3 className={styles.sideTitle}>How matching works</h3>
              <ul className={styles.sideList}>
                <li>Rule-based scoring tuned to lifestyle fit and care practicality.</li>
                <li>No AI guessing, just transparent compatibility logic.</li>
                <li>Each recommendation explains why it fits your answers.</li>
              </ul>
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
