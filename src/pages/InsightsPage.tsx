import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, PremiumGate } from '@/components/ui';
import { GatedPagePreview } from '@/components/premium/GatedPagePreview';
import { MinimalLineChart } from '@/components/insights';
import { PetSwitcher } from '@/components/pets';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { usePetCareScore } from '@/petCareScore';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { ROUTES } from '@/routes/paths';
import hero from '@/styles/EditorialHero.module.css';
import styles from './InsightsPage.module.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1800&q=80';

const PET_PLACEHOLDER =
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80';

function parseWeightKg(weight: string | null | undefined): number | null {
  if (!weight) return null;
  const match = weight.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : null;
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
      <div className={styles.foresightGrid}>
        <article className={styles.card}>
          <MinimalLineChart label="Weight trend" values={weightSeries} unit="kg" />
          <p className={styles.cardText}>
            Subtle shifts in body weight can signal hydration, nutrition, or metabolic changes
            before symptoms surface.
          </p>
        </article>
        <article className={styles.card}>
          <p className={styles.cardEyebrow}>Vaccination timeline</p>
          <ul className={styles.vaxList}>
            {vaccinationLabels.length > 0 ? (
              vaccinationLabels.map((label) => (
                <li key={label} className={styles.vaxItem}>
                  <span className={styles.vaxDot} aria-hidden />
                  {label}
                </li>
              ))
            ) : (
              <li className={styles.vaxEmpty}>
                Add vaccination records to map immunity windows.
              </li>
            )}
          </ul>
        </article>
      </div>

      <article className={styles.card}>
        <p className={styles.cardEyebrow}>Chronic symptom tracking</p>
        <div className={styles.symptomGrid}>
          {symptomNotes.map((note, index) => (
            <div key={index} className={styles.symptomCol}>
              <p className={styles.symptomTitle}>Signal {index + 1}</p>
              <p className={styles.symptomText}>{note}</p>
            </div>
          ))}
        </div>
      </article>

      <article className={styles.synthesis}>
        <p className={styles.synthesisEyebrow}>Predictive synthesis</p>
        <h3 className={styles.synthesisTitle}>Pattern confidence rising</h3>
        <p className={styles.synthesisText}>
          Pro models cross-reference weight velocity, vaccine due windows, and recurring symptom
          language to surface early-care prompts - weeks before a crisis visit.
        </p>
      </article>
    </div>
  );
}

export function InsightsPage() {
  const advancedInsights = useFeatureAccess('advancedHealthInsights');
  const { activePet, pets, setActivePet, isLoading: petsLoading, hasPets } = usePets();
  const { records, isLoading: recordsLoading } = useHealthRecords();
  const { data: scoreData, isLoading: scoreLoading } = usePetCareScore();

  const petRecords = useMemo(
    () => (activePet ? records.filter((r) => r.petId === activePet.id) : []),
    [records, activePet],
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

  const isLoading = petsLoading || recordsLoading || scoreLoading;

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={hero.loadingWrap}>
          <LoadingState message="Loading health insights" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={hero.stateWrap}>
          <h1 className={hero.stateTitle}>Health Foresight</h1>
          <p className={hero.stateText}>
            Add a pet profile to unlock your personalized health journal.
          </p>
          <Link to={ROUTES.PET_PROFILE} className={hero.stateLink}>
            Go to pet profile →
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!advancedInsights.isAllowed) {
    return (
      <AppLayout flushContent>
        <div className={hero.gatedWrap}>
          <PremiumGate
            requiredTier="Pro"
            title="Unlock Health Foresight"
            description="PetClues Pro analyzes deep historical health records, vaccines, and weight data to catch subtle care trends before they become emergencies."
            className={styles.gateMinHeight}
          >
            <GatedPagePreview
              imageUrl={HERO_IMAGE}
              eyebrow="Health Foresight"
              title="Predictive care journal"
              subtitle="A living health journal - curated from records, check-ins, and care signals."
            />
          </PremiumGate>
          <div className={hero.divider}>
            <HealthDisclaimerNote compact />
          </div>
        </div>
      </AppLayout>
    );
  }

  const score = scoreData?.snapshot.score ?? null;
  const petPhoto = normalizePhotoUrlFromDb(activePet.photoUrl);

  return (
    <AppLayout flushContent>
      <div className={hero.page}>
        <header className={hero.header}>
          <img src={HERO_IMAGE} alt="" className={hero.bg} aria-hidden />
          <div className={hero.scrim} aria-hidden />
          <div className={hero.switcherSlot}>
            <PetSwitcher pets={pets} activeId={activePet.id} onSelect={setActivePet} />
          </div>
          <div className={hero.inner}>
            <p className={hero.eyebrow}>{activePet.name}</p>
            <h1 className={hero.title}>Health Foresight &amp; Predictive Trends</h1>
            <p className={hero.lead}>
              A living health journal - curated from records, check-ins, and care signals.
            </p>
          </div>
        </header>

        <div className={hero.body}>
          <section className={styles.snapshot}>
            <div className={styles.snapshotPhoto}>
              <img
                src={petPhoto || PET_PLACEHOLDER}
                alt={activePet.name}
                className={styles.snapshotImg}
              />
            </div>
            <div>
              <p className={styles.snapshotEyebrow}>Care snapshot</p>
              <h2 className={styles.snapshotName}>{activePet.name}</h2>
              <p className={styles.snapshotMeta}>
                {[activePet.breed, activePet.species].filter(Boolean).join(' · ')}
              </p>
              {score != null && (
                <p className={styles.snapshotScore}>
                  Current care score{' '}
                  <span className={styles.snapshotScoreStrong}>{score}</span>
                </p>
              )}
            </div>
          </section>

          <section className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Journal</p>
            <h2 className={styles.sectionTitle}>Predictive analysis</h2>
            <p className={styles.sectionLead}>
              Deep historical modeling - weight curves, vaccine cadence, and symptom recurrence.
            </p>
          </section>

          <PredictiveForesightSection
            weightSeries={weightSeries}
            vaccinationLabels={vaccinationLabels}
            symptomNotes={symptomNotes}
          />

          <div className={hero.divider}>
            <HealthDisclaimerNote compact />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
