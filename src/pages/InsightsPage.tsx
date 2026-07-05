import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventTracker } from '@/analytics/EventTracker';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, PremiumGate } from '@/components/ui';
import { WeightTrendChart, VaccineDueAside, WeeklyDigestSection, CareRecommendationsSection, MultiPetComparativeSection, type PetComparativeRow } from '@/components/insights';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { usePetCareScore } from '@/petCareScore';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { buildPetWeightTrend, MIN_WEIGHT_TREND_POINTS } from '@/services/weightTrend';
import { buildVaccineDueForecast, type VaccineDueForecast } from '@/services/vaccineDue';
import { useSymptomLogs } from '@/symptomLog';
import { useHousehold } from '@/household';
import { SymptomObservationsSection } from '@/components/symptom-log';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { getAvatarInitials } from '@/services/pets/petUtils';
import type { PetRecord } from '@/services/pets/petTypes';
import { useReminders } from '@/reminders';
import { computePetCareScoreFromSources } from '@/services/petCareScore/petCareScoreEngine';
import { buildScoreDisplayMetrics } from '@/services/petCareScore/scoreDisplayMetrics';
import { detectSymptomPatterns } from '@/services/symptomLog';
import { ROUTES } from '@/routes/paths';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { getTrendLabel } from '@/utils/petCareScoreUtils';
import styles from './InsightsPage.module.css';

type BreakdownRow = { label: string; pct: number };

function PetStack({
  pets,
  activeId,
  onSelect,
}: {
  pets: PetRecord[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (pets.length <= 1) return null;

  return (
    <div className={styles.petStack} role="tablist" aria-label="Switch pet">
      {pets.map((pet, index) => (
        <button
          key={pet.id}
          type="button"
          role="tab"
          aria-selected={pet.id === activeId}
          aria-label={pet.name}
          title={pet.name}
          style={{ zIndex: index + 1 }}
          onClick={() => onSelect(pet.id)}
          className={`${styles.petStackBtn} ${pet.id === activeId ? styles.petStackBtnActive : ''}`}
        >
          <span className={styles.petStackBtnInner}>
            {pet.photoUrl ? (
              <img src={normalizePhotoUrlFromDb(pet.photoUrl) ?? ''} alt="" className={styles.petStackImg} />
            ) : (
              <span className={styles.petStackInitials}>{getAvatarInitials(pet.name)}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className={styles.buildIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m9 14 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg className={styles.buildIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v6M9 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className={styles.buildIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="15" y="14" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function ScoreHeroSection({
  pet,
  score,
  scoreLabel,
  scoreSummary,
  trendText,
  breakdown,
}: {
  pet: PetRecord;
  score: number | null;
  scoreLabel: string;
  scoreSummary: string;
  trendText: string;
  breakdown: BreakdownRow[];
}) {
  const species = [pet.breed, pet.species].filter(Boolean).join(' · ') || pet.species || 'Pet';

  return (
    <section className={styles.scoreChapter} data-reveal aria-labelledby="care-score-heading">
      <header className={styles.scoreChapterIntro}>
        <p className={styles.sectionEyebrow}>{pet.name} · {species}</p>
        <h2 id="care-score-heading" className={styles.scoreChapterTitle}>
          Care intelligence score
        </h2>
        <p className={styles.scoreChapterLead}>
          The measure of how completely and thoughtfully {pet.name}&apos;s care is organized.
        </p>
      </header>

      <div className={styles.scoreHero}>
        {score != null ? (
          <>
            <div className={styles.scoreHeroDisplay}>
              <span className={styles.scoreHeroNumber}>{score}</span>
              <div className={styles.scoreHeroMeta}>
                <span className={styles.scoreHeroLabel}>PetCare Score</span>
                <span className={styles.scoreHeroStatus}>{scoreLabel}</span>
                {trendText && <span className={styles.scoreHeroTrend}>{trendText}</span>}
              </div>
            </div>
            {scoreSummary && <p className={styles.scoreSummary}>{scoreSummary}</p>}
            <ul className={styles.scoreBreakdown}>
              {breakdown.map((row) => (
                <li key={row.label} className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel}>{row.label}</span>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className={styles.breakdownPct}>{row.pct}%</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.scoreEmpty}>
            Add health records and documents to generate your first care score.
          </p>
        )}
      </div>
    </section>
  );
}

function WhatBuildsInsights({
  checkInsThisMonth,
  healthRecordCount,
  documentCount,
}: {
  checkInsThisMonth: number;
  healthRecordCount: number;
  documentCount: number;
}) {
  const checkInLabel =
    checkInsThisMonth === 1 ? '1 logged this month' : `${checkInsThisMonth} logged this month`;
  const recordLabel =
    healthRecordCount === 1 ? '1 on file' : `${healthRecordCount} on file`;
  const docLabel =
    documentCount === 1 ? '1 archived' : `${documentCount} archived`;

  return (
    <section className={styles.buildBand} data-reveal aria-label="What builds your insights">
      <div className={styles.buildCol}>
        <CalendarIcon />
        <p className={styles.buildLabel}>Daily check-ins</p>
        <p className={styles.buildText}>
          Feed logs, weight, and walk data build the weight trend and behavioral baseline.
        </p>
        <p className={styles.buildStatus}>{checkInLabel}</p>
      </div>
      <div className={styles.buildCol}>
        <HealthIcon />
        <p className={styles.buildLabel}>Health records</p>
        <p className={styles.buildText}>
          Vaccines, diagnoses, and vet visits power the vaccination timeline and chronic tracking.
        </p>
        <p className={styles.buildStatus}>{recordLabel}</p>
      </div>
      <div className={styles.buildCol}>
        <DocumentIcon />
        <p className={styles.buildLabel}>Documents</p>
        <p className={styles.buildText}>
          Uploaded prescriptions and lab reports unlock the document analysis layer.
        </p>
        <p className={styles.buildStatus}>{docLabel}</p>
      </div>
    </section>
  );
}

function HowPredictiveWorksSection({ petName }: { petName: string }) {
  return (
    <section id="how-predictive-works" className={styles.howSection} aria-labelledby="how-predictive-heading">
      <p className={styles.sectionEyebrow}>How it works</p>
      <h2 id="how-predictive-heading" className={styles.howTitle}>
        How predictive synthesis works
      </h2>
      <span className={styles.howRule} aria-hidden />
      <p className={styles.howLead}>
        Health Foresight reads patterns across {petName}'s daily check-ins, health records, and uploaded
        documents — then surfaces gentle prompts before small shifts become urgent visits.
      </p>
      <ol className={styles.howSteps}>
        <li className={styles.howStep}>
          <span className={styles.howStepNum} aria-hidden>
            I
          </span>
          <div>
            <h3 className={styles.howStepTitle}>Weight velocity</h3>
            <p className={styles.howStepText}>
              Subtle trends in weigh-ins and check-ins flag hydration, nutrition, or metabolic
              changes early.
            </p>
          </div>
        </li>
        <li className={styles.howStep}>
          <span className={styles.howStepNum} aria-hidden>
            II
          </span>
          <div>
            <h3 className={styles.howStepTitle}>Immunity windows</h3>
            <p className={styles.howStepText}>
              Vaccination records map due dates and cadence so boosters never slip through the
              cracks.
            </p>
          </div>
        </li>
        <li className={styles.howStep}>
          <span className={styles.howStepNum} aria-hidden>
            III
          </span>
          <div>
            <h3 className={styles.howStepTitle}>Symptom language</h3>
            <p className={styles.howStepText}>
              Recurring notes in wellness entries and check-ins are tracked for patterns worth a
              closer look.
            </p>
          </div>
        </li>
      </ol>
      <p className={styles.howNote}>
        The more you log — check-ins, records, and documents — the richer and more confident these
        insights become.
      </p>
    </section>
  );
}

function PlusForesightSection({
  weightTrend,
  vaccineForecast,
}: {
  weightTrend: ReturnType<typeof buildPetWeightTrend>;
  vaccineForecast: VaccineDueForecast;
}) {
  const hasWeightTrend = weightTrend.hasEnoughData;

  return (
    <div className={styles.foresight}>
      <article className={styles.predictiveFeature} id="predictive-analysis">
        {hasWeightTrend ? (
          <>
            <WeightTrendChart trend={weightTrend} />
            <p className={styles.featureLead}>
              Subtle shifts in body weight can signal hydration, nutrition, or metabolic changes
              before symptoms surface — one of the earliest signals in your predictive model.
            </p>
          </>
        ) : (
          <div className={styles.foresightEmpty}>
            <p className={styles.sectionEyebrow}>Weight trend</p>
            <p className={styles.foresightEmptyText}>
              {weightTrend.points.length === 0
                ? 'Weight trend will appear here once you log weigh-ins via daily check-ins or weight records.'
                : `Add ${MIN_WEIGHT_TREND_POINTS - weightTrend.points.length} more weight ${
                    MIN_WEIGHT_TREND_POINTS - weightTrend.points.length === 1 ? 'entry' : 'entries'
                  } to unlock the trend chart (${weightTrend.points.length}/${MIN_WEIGHT_TREND_POINTS} logged).`}
            </p>
            <Link to={ROUTES.DASHBOARD} className={styles.vaxBtn}>
              Log a check-in
            </Link>
          </div>
        )}
      </article>

      <VaccineDueAside forecast={vaccineForecast} />
    </div>
  );
}

function ProSymptomSection({
  petName,
  symptomLogs,
  canLogSymptoms,
  onCreateSymptomLog,
}: {
  petName: string;
  symptomLogs: ReturnType<typeof useSymptomLogs>['logs'];
  canLogSymptoms: boolean;
  onCreateSymptomLog: ReturnType<typeof useSymptomLogs>['createLog'];
}) {
  const patterns = useMemo(() => detectSymptomPatterns(symptomLogs), [symptomLogs]);

  return (
    <SymptomObservationsSection
      petName={petName}
      logs={symptomLogs}
      patterns={patterns}
      canLog={canLogSymptoms}
      onCreateLog={onCreateSymptomLog}
    />
  );
}

export function InsightsPage() {
  const foresightBasics = useFeatureAccess('petCareScore');

  useEffect(() => {
    eventTracker.track('insights_viewed');
  }, []);
  const proInsights = useFeatureAccess('advancedHealthInsights');
  const { activePet, pets, setActivePet, isLoading: petsLoading, hasPets } = usePets();
  const { records, isLoading: recordsLoading } = useHealthRecords();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { checkIns, isLoading: checkInsLoading } = useDailyCheckIn();
  const { reminders, isLoading: remindersLoading } = useReminders();
  const { logs: symptomLogs, createLog: createSymptomLog, isLoading: symptomLogsLoading } = useSymptomLogs();
  const { canEdit: canEditHousehold } = useHousehold();
  const { data: scoreData, isLoading: scoreLoading } = usePetCareScore();

  const petRecords = useMemo(
    () => (activePet ? records.filter((r) => r.petId === activePet.id) : []),
    [records, activePet],
  );

  const petDocuments = useMemo(
    () => (activePet ? documents.filter((d) => d.petId === activePet.id) : []),
    [documents, activePet],
  );

  const vaccineForecast = useMemo(
    () => buildVaccineDueForecast(petRecords),
    [petRecords],
  );

  const weightTrend = useMemo(() => {
    if (!activePet) {
      return buildPetWeightTrend({ petName: '', records: [], checkIns: [] });
    }
    return buildPetWeightTrend({
      petName: activePet.name,
      records: petRecords,
      checkIns: checkIns.filter((checkIn) => checkIn.petId === activePet.id),
    });
  }, [activePet, petRecords, checkIns]);

  const checkInsThisMonth = useMemo(() => {
    if (!activePet) return 0;
    const monthPrefix = new Date().toISOString().slice(0, 7);
    return checkIns.filter(
      (c) => c.petId === activePet.id && c.checkInDate.startsWith(monthPrefix),
    ).length;
  }, [checkIns, activePet]);

  const scoreBreakdown = useMemo((): BreakdownRow[] => {
    return buildScoreDisplayMetrics(scoreData?.factors ?? []).map((metric) => ({
      label: metric.label,
      pct: metric.value,
    }));
  }, [scoreData?.factors]);

  const comparativeRows = useMemo((): PetComparativeRow[] => {
    if (!proInsights.isAllowed || pets.length < 2) return [];

    return pets.map((pet) => {
      const petRecords = records.filter((record) => record.petId === pet.id);
      const petDocs = documents.filter((doc) => doc.petId === pet.id);
      const petReminders = reminders.filter((reminder) => reminder.petId === pet.id);
      const petCheckIns = checkIns.filter((checkIn) => checkIn.petId === pet.id);
      const result = computePetCareScoreFromSources({
        pet,
        healthRecords: petRecords,
        documents: petDocs,
        reminders: petReminders,
        dailyCheckIns: checkIns,
      });
      const trend = buildPetWeightTrend({
        petName: pet.name,
        records: petRecords,
        checkIns: petCheckIns,
      });

      return {
        petId: pet.id,
        petName: pet.name,
        photoUrl: pet.photoUrl,
        score: result.data.snapshot.score,
        scoreLabel: result.data.snapshot.label,
        trendText: getTrendLabel(result.data.snapshot.trend, result.data.snapshot.trendDelta),
        weightSummary: trend.hasEnoughData ? trend.summary : null,
      };
    });
  }, [proInsights.isAllowed, pets, records, documents, reminders, checkIns]);

  const isLoading =
    petsLoading ||
    recordsLoading ||
    scoreLoading ||
    docsLoading ||
    checkInsLoading ||
    symptomLogsLoading ||
    remindersLoading;

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.loadingWrap}>
            <LoadingState message="Loading health insights" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.stateWrap}>
            <h1 className={styles.stateTitle}>Health Foresight</h1>
            <p className={styles.stateText}>
              Add a pet profile to unlock your personalized health journal.
            </p>
            <Link to={ROUTES.PET_PROFILE} className={styles.stateLink}>
              Go to pet profile →
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const score = scoreData?.snapshot.score ?? null;
  const scoreLabel = scoreData?.snapshot.label ?? 'Getting started';
  const scoreSummary = scoreData?.snapshot.summary ?? '';
  const trendText = scoreData
    ? getTrendLabel(scoreData.snapshot.trend, scoreData.snapshot.trendDelta)
    : '';
  const petName = activePet.name;
  const heroBackground = resolvePetHeroBackground(activePet.photoUrl);
  const heroPhoto = normalizePhotoUrlFromDb(activePet.photoUrl);

  const plusEssentials = (
    <>
      <ScoreHeroSection
        pet={activePet}
        score={score}
        scoreLabel={scoreLabel}
        scoreSummary={scoreSummary}
        trendText={trendText}
        breakdown={scoreBreakdown}
      />

      <section className={styles.predictiveChapter} data-reveal aria-labelledby="predictive-heading">
        <header className={styles.chapterIntro}>
          <p className={styles.sectionEyebrow}>Predictive analysis</p>
          <h2 id="predictive-heading" className={styles.sectionTitle}>
            Foresight modeling
          </h2>
          <p className={styles.sectionLead}>
            Weight curves and vaccine cadence — interpreted as one intelligence narrative.
          </p>
        </header>

        <PlusForesightSection weightTrend={weightTrend} vaccineForecast={vaccineForecast} />
      </section>
    </>
  );

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <div className={styles.heroWrap}>
          <header className={styles.hero}>
            <img
              className={`${styles.heroBg} ${heroBackground.isPetPhoto ? styles.heroBgPet : ''}`}
              src={heroBackground.src}
              alt=""
              aria-hidden
            />
            <div className={styles.heroWash} aria-hidden />
            <div className={styles.heroVignette} aria-hidden />
            <div className={styles.heroTexture} aria-hidden />

            <div className={styles.heroInner}>
              <div className={styles.heroTopRow}>
                <PetStack pets={pets} activeId={activePet.id} onSelect={setActivePet} />
              </div>

              <div className={styles.heroCoverGrid}>
                <div className={styles.heroCoverText}>
                  <p className={styles.heroKicker}>Care intelligence · {petName}</p>
                  <h1 className={styles.heroTitle}>Health Foresight</h1>
                  <p className={styles.heroSubtitle}>
                    A predictive care report — curated from records, check-ins, and care signals.
                  </p>
                  <div className={styles.heroCtaRow}>
                    <a href="#care-score-heading" className={styles.btnPrimary}>
                      View score
                    </a>
                    <Link to={ROUTES.PET_PROFILE} className={styles.btnSecondary}>
                      Add records
                    </Link>
                  </div>
                </div>

                {(heroPhoto || heroBackground.isPetPhoto) && (
                  <div className={styles.heroPortraitFrame} aria-hidden>
                    <img
                      src={heroPhoto ?? heroBackground.src}
                      alt=""
                      className={styles.heroPortraitImg}
                    />
                  </div>
                )}
              </div>
            </div>
          </header>
        </div>

        <div className={styles.body}>
          {foresightBasics.isAllowed ? (
            plusEssentials
          ) : (
            <PremiumGate
              requiredTier="Plus"
              title="Unlock Health Foresight basics"
              description="PetClues Plus gives you a living PetCare score with plain-language explanation, a real weight trend from your check-ins, and vaccine-due predictions."
              className={styles.sectionGate}
            >
              {plusEssentials}
            </PremiumGate>
          )}

          <PremiumGate
            requiredTier="Pro"
            title="Weekly care digest"
            description="Pro synthesizes your week of check-ins, records, and reminders into a concise narrative — what improved, what needs attention, and why."
            className={styles.sectionGate}
          >
            {scoreData?.weeklyInsight && (
              <WeeklyDigestSection insight={scoreData.weeklyInsight} petName={petName} />
            )}
          </PremiumGate>

          <PremiumGate
            requiredTier="Pro"
            title="Symptom history & pattern detection"
            description="Pro tracks every structured symptom log, surfaces recurring patterns, and helps you spot shifts before they become urgent vet visits."
            className={styles.sectionGate}
          >
            <section className={styles.predictiveChapter} aria-label="Symptom observations">
              <ProSymptomSection
                petName={petName}
                symptomLogs={symptomLogs}
                canLogSymptoms={canEditHousehold}
                onCreateSymptomLog={createSymptomLog}
              />
            </section>
          </PremiumGate>

          {pets.length > 1 && (
            <PremiumGate
              requiredTier="Pro"
              title="Multi-pet comparative trends"
              description="Pro compares PetCare scores and weight signals across every pet in your household — one view for multi-pet families."
              className={styles.sectionGate}
            >
              <MultiPetComparativeSection
                rows={comparativeRows}
                activePetId={activePet.id}
                onSelectPet={setActivePet}
              />
            </PremiumGate>
          )}

          <PremiumGate
            requiredTier="Pro"
            title="Personalized care recommendations"
            description="Pro turns score factors into prioritized next steps — the highest-impact updates for your pet's care file."
            className={styles.sectionGate}
          >
            {scoreData && (
              <CareRecommendationsSection recommendations={scoreData.recommendations} />
            )}
          </PremiumGate>

          <HowPredictiveWorksSection petName={petName} />

          <WhatBuildsInsights
            checkInsThisMonth={checkInsThisMonth}
            healthRecordCount={petRecords.length}
            documentCount={petDocuments.length}
          />

          <footer className={styles.legalFooter}>
            <hr className={styles.legalRule} />
            <p className={styles.legalText} role="note">
              {HEALTH_DISCLAIMER}
            </p>
          </footer>
        </div>
      </div>
    </AppLayout>
  );
}
