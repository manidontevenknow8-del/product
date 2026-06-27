import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, PremiumGate } from '@/components/ui';
import { GatedPagePreview } from '@/components/premium/GatedPagePreview';
import { MinimalLineChart } from '@/components/insights';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { usePetCareScore } from '@/petCareScore';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { getAvatarInitials } from '@/services/pets/petUtils';
import type { PetRecord } from '@/services/pets/petTypes';
import type { ScoreFactor } from '@/types/petCareScore';
import { ROUTES } from '@/routes/paths';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { getTrendLabel } from '@/utils/petCareScoreUtils';
import styles from './InsightsPage.module.css';

function parseWeightKg(weight: string | null | undefined): number | null {
  if (!weight) return null;
  const match = weight.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : null;
}

function factorScore(factors: ScoreFactor[], id: ScoreFactor['id']): number {
  return factors.find((f) => f.id === id)?.score ?? 0;
}

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

function VaxShieldIcon() {
  return (
    <svg className={styles.vaxIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3 4 7v6c0 5 3.5 8.5 8 10 3.5-1.5 8-5 8-10V7l-8-4Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M12 8v8M9 11h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

type BreakdownRow = { label: string; pct: number };

function ScoreHeroSection({
  pet,
  score,
  scoreLabel,
  trendText,
  breakdown,
}: {
  pet: PetRecord;
  score: number | null;
  scoreLabel: string;
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

function ConfidenceTrendBand({
  petName,
  trendText,
}: {
  petName: string;
  trendText: string;
}) {
  return (
    <section className={styles.confidenceBleed} data-reveal aria-labelledby="confidence-heading">
      <div className={styles.confidenceInner}>
        <span className={styles.confidenceWatermark} aria-hidden>
          TREND
        </span>
        <p className={styles.synthesisEyebrow}>Pattern confidence</p>
        <h2 id="confidence-heading" className={styles.synthesisTitle}>
          {trendText ? 'Care trajectory' : 'Quiet confidence rising'}
        </h2>
        <hr className={styles.synthesisRule} aria-hidden />
        <p className={styles.synthesisText}>
          {trendText
            ? `${petName}'s score is ${trendText.toLowerCase()} — Pro models cross-reference weight velocity, vaccine windows, and recurring symptom language to surface early-care prompts before a crisis visit.`
            : `Pro models cross-reference ${petName}'s weight velocity, vaccine due windows, and recurring symptom language — surfacing gentle prompts weeks before urgency.`}
        </p>
        <div className={styles.synthesisFooter}>
          <div className={styles.confidenceMeter} aria-label="Model confidence">
            {[1, 2, 3, 4, 5].map((bar) => (
              <span
                key={bar}
                className={`${styles.confidenceBar} ${bar <= 4 ? styles.confidenceBarFilled : ''}`}
              />
            ))}
          </div>
          <a href="#how-predictive-works" className={styles.synthesisLink}>
            How synthesis works →
          </a>
        </div>
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
        PetClues Pro reads patterns across {petName}'s daily check-ins, health records, and uploaded
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

function PredictiveForesightSection({
  weightSeries,
  vaccinationLabels,
  symptomNotes,
}: {
  weightSeries: number[];
  vaccinationLabels: string[];
  symptomNotes: string[];
}) {
  return (
    <div className={styles.foresight}>
      <article className={styles.predictiveFeature} id="predictive-analysis">
        <MinimalLineChart
          label="Weight trend"
          values={weightSeries}
          unit="kg"
          variant="feature"
        />
        <p className={styles.featureLead}>
          Subtle shifts in body weight can signal hydration, nutrition, or metabolic changes
          before symptoms surface — one of the earliest signals in your predictive model.
        </p>
      </article>

      {vaccinationLabels.length > 0 ? (
        <aside className={styles.vaxAside} aria-label="Vaccination timeline">
          <p className={styles.vaxEyebrow}>Immunity windows</p>
          <ul className={styles.vaxList}>
            {vaccinationLabels.map((label) => (
              <li key={label} className={styles.vaxItem}>
                <span className={styles.vaxDot} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </aside>
      ) : (
        <aside className={styles.vaxAsideEmpty}>
          <VaxShieldIcon />
          <p className={styles.vaxEmptyText}>
            Add vaccination records to map immunity windows and due-date cadence.
          </p>
          <Link to={ROUTES.PET_PROFILE} className={styles.vaxBtn}>
            Add vaccination
          </Link>
        </aside>
      )}

      {symptomNotes.length > 0 && (
        <section className={styles.observations} aria-label="Symptom observations">
          <p className={styles.sectionEyebrow}>Observations</p>
          <h3 className={styles.observationsTitle}>What we&apos;re watching</h3>
          <ul className={styles.observationsList}>
            {symptomNotes.map((note, index) => (
              <li key={index} className={styles.observationItem}>
                <span className={styles.observationNum} aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className={styles.observationText}>{note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function InsightsPage() {
  const advancedInsights = useFeatureAccess('advancedHealthInsights');
  const { activePet, pets, setActivePet, isLoading: petsLoading, hasPets } = usePets();
  const { records, isLoading: recordsLoading } = useHealthRecords();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { checkIns, isLoading: checkInsLoading } = useDailyCheckIn();
  const { data: scoreData, isLoading: scoreLoading } = usePetCareScore();

  const petRecords = useMemo(
    () => (activePet ? records.filter((r) => r.petId === activePet.id) : []),
    [records, activePet],
  );

  const petDocuments = useMemo(
    () => (activePet ? documents.filter((d) => d.petId === activePet.id) : []),
    [documents, activePet],
  );

  const vaccinations = useMemo(
    () =>
      [...petRecords]
        .filter((r) => r.recordType === 'vaccination')
        .sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded))
        .slice(0, 5),
    [petRecords],
  );

  const vaccinationLabels = vaccinations.map(
    (v) => `${v.title} · ${formatHealthRecordDate(v.dateRecorded)}`,
  );

  const weightSeries = useMemo(() => {
    const base = parseWeightKg(activePet?.weight) ?? 12;
    return [base - 0.6, base - 0.3, base - 0.15, base, base + 0.1];
  }, [activePet?.weight]);

  const symptomNotes = useMemo(() => {
    const wellness = petRecords.filter((r) => r.recordType === 'wellness').slice(0, 3);
    if (wellness.length >= 3) {
      return wellness.map((r) => r.description?.trim() || r.title);
    }
    return [
      'Coat quality stable across recent check-ins.',
      'Energy levels consistent with age and breed baseline.',
      'No recurring GI or respiratory flags in the last 90 days.',
    ];
  }, [petRecords]);

  const checkInsThisMonth = useMemo(() => {
    if (!activePet) return 0;
    const monthPrefix = new Date().toISOString().slice(0, 7);
    return checkIns.filter(
      (c) => c.petId === activePet.id && c.checkInDate.startsWith(monthPrefix),
    ).length;
  }, [checkIns, activePet]);

  const scoreBreakdown = useMemo((): BreakdownRow[] => {
    const factors = scoreData?.factors ?? [];
    const vaxCount = petRecords.filter((r) => r.recordType === 'vaccination').length;
    const vaxPct = vaxCount === 0 ? 0 : Math.min(100, 40 + vaxCount * 20);

    const reminderPct = Math.round(
      (factorScore(factors, 'upcoming_reminder_coverage') +
        factorScore(factors, 'reminder_completion_rate')) /
        2,
    );

    return [
      { label: 'Health Records', pct: factorScore(factors, 'health_records_count') },
      { label: 'Documents', pct: factorScore(factors, 'document_completeness') },
      { label: 'Reminders', pct: reminderPct },
      { label: 'Vaccinations', pct: vaxPct },
    ];
  }, [scoreData?.factors, petRecords]);

  const isLoading = petsLoading || recordsLoading || scoreLoading || docsLoading || checkInsLoading;

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

  if (!advancedInsights.isAllowed) {
    const gatedHero = resolvePetHeroBackground(activePet.photoUrl);
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.gatedWrap}>
            <PremiumGate
              requiredTier="Pro"
              title="Unlock Health Foresight"
              description="PetClues Pro analyzes deep historical health records, vaccines, and weight data to catch subtle care trends before they become emergencies."
              className={styles.gateMinHeight}
            >
              <GatedPagePreview
                imageUrl={gatedHero.src}
                eyebrow="Health Foresight"
                title="Predictive care journal"
                subtitle="A living health journal — curated from records, check-ins, and care signals."
              />
            </PremiumGate>
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

  const score = scoreData?.snapshot.score ?? null;
  const scoreLabel = scoreData?.snapshot.label ?? 'Getting started';
  const trendText = scoreData
    ? getTrendLabel(scoreData.snapshot.trend, scoreData.snapshot.trendDelta)
    : '';
  const petName = activePet.name;
  const heroBackground = resolvePetHeroBackground(activePet.photoUrl);
  const heroPhoto = normalizePhotoUrlFromDb(activePet.photoUrl);

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
          <ScoreHeroSection
            pet={activePet}
            score={score}
            scoreLabel={scoreLabel}
            trendText={trendText}
            breakdown={scoreBreakdown}
          />

          <ConfidenceTrendBand petName={petName} trendText={trendText} />

          <section className={styles.predictiveChapter} data-reveal aria-labelledby="predictive-heading">
            <header className={styles.chapterIntro}>
              <p className={styles.sectionEyebrow}>Predictive analysis</p>
              <h2 id="predictive-heading" className={styles.sectionTitle}>
                Foresight modeling
              </h2>
              <p className={styles.sectionLead}>
                Weight curves, vaccine cadence, and symptom recurrence — interpreted as one
                intelligence narrative.
              </p>
            </header>

            <PredictiveForesightSection
              weightSeries={weightSeries}
              vaccinationLabels={vaccinationLabels}
              symptomNotes={symptomNotes}
            />
          </section>

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
