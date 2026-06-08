import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Link } from 'react-router-dom';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import { EmptyFallback } from '@/components/errors/EmptyFallback';
import { ROUTES } from '@/routes/paths';
import { PageHeroBand, SectionIntro } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  PetCareScoreCard,
  ScoreBreakdownCard,
  ScoreHistoryChart,
  ScoreFactorsCard,
  FuturePetCareIntelligence,
  PetCareScoreProGate,
} from '@/components/pet-care-score';
import {
  HealthInsightsCard,
  CareRecommendationsCard,
  PositiveProgressCard,
  AttentionNeededCard,
} from '@/components/pet-care-score/insights';
import { UpgradeModal } from '@/components/subscription';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { usePets } from '@/pets';
import { usePetCareScore } from '@/petCareScore';
import { getEncouragingMessage } from '@/utils/petCareScoreUtils';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import styles from './PetCareScorePage.module.css';

export function PetCareScorePage() {
  const { canAccess } = useSubscription();
  const { activePet } = usePets();
  const [scoreUpgradeOpen, setScoreUpgradeOpen] = useState(false);
  const { data, isLoading, error, refresh } = usePetCareScore();

  const hasProInsights =
    canAccess('advancedPetCareScore') && canAccess('advancedHealthInsights');

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.loadingWrap}>
            <LoadingState message="Loading your PetCare Score" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <PageHeroBand
            image={PAGE_IMG.app.score}
            imageAlt=""
            eyebrow="Care intelligence"
            title="PetCare Score"
            subtitle="We couldn't load your score right now."
          />
          <div className={styles.stateWrap}>
            <EmptyFallback
              title="Couldn't load PetCare Score"
              message={error}
              onRetry={() => void refresh()}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <PageHeroBand
            image={PAGE_IMG.app.score}
            imageAlt=""
            eyebrow="Care intelligence"
            title="PetCare Score"
            subtitle="Add a pet profile to start tracking care completeness."
          />
          <div className={styles.stateWrap}>
            <EmptyState
              title="No pet selected"
              description="PetCare Score is built from your pet's profile, reminders, health records, and documents."
              action={
                <Link to={ROUTES.PET_PROFILE}>
                  <Button variant="primary">Go to pet profile</Button>
                </Link>
              }
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  const encouragingMessage = getEncouragingMessage(data.snapshot);
  const petName = activePet?.name ?? 'your pet';

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PageHeroBand
          image={PAGE_IMG.app.score}
          imageAlt=""
          eyebrow="Care intelligence"
          title="PetCare Score"
          subtitle={encouragingMessage}
          meta={`Current score: ${data.snapshot.score} · ${data.snapshot.trend === 'up' ? 'Trending up' : data.snapshot.trend === 'down' ? 'Needs attention' : 'Holding steady'}`}
        />

        <div className={`${styles.body} ${!hasProInsights ? styles.bodyFree : ''}`}>
          <SectionIntro
            eyebrow="Your snapshot"
            title="How you're doing"
            description="A living score built from reminders, health records, documents, and daily check-ins - updated as your care routine evolves."
          />

          <PetCareScoreCard snapshot={data.snapshot} />
          <ScoreFactorsCard factors={data.factors} />

          {hasProInsights ? (
            <>
              <div className={styles.grid}>
                <ScoreHistoryChart
                  history={data.history}
                  currentScore={data.snapshot.score}
                  trendDelta={data.snapshot.trendDelta}
                  trend={data.snapshot.trend}
                />
                <ScoreBreakdownCard breakdown={data.breakdown} />
              </div>

              <div className={styles.insightsGrid}>
                <HealthInsightsCard insights={data.insights} />
                <PositiveProgressCard items={data.positiveProgress} />
              </div>

              <div className={styles.grid}>
                <CareRecommendationsCard recommendations={data.recommendations} />
                <AttentionNeededCard items={data.attentionItems} />
              </div>

              <FuturePetCareIntelligence />
            </>
          ) : (
            <PetCareScoreProGate
              petName={petName}
              score={data.snapshot.score}
              trend={data.snapshot.trend}
              onUpgrade={() => setScoreUpgradeOpen(true)}
            />
          )}

          <HealthDisclaimerNote />
        </div>
      </div>

      <UpgradeModal isOpen={scoreUpgradeOpen} onClose={() => setScoreUpgradeOpen(false)} />
    </AppLayout>
  );
}
