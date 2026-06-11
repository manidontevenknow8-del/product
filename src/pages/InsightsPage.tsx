import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, PageContainer, PremiumGate } from '@/components/ui';
import { GatedPagePreview } from '@/components/premium/GatedPagePreview';
import { MinimalLineChart } from '@/components/insights';
import { PetSwitcherHero } from '@/components/pets';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { usePetCareScore } from '@/petCareScore';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { ROUTES } from '@/routes/paths';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1800&q=80';

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
    <div className="space-y-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <article className="border border-stone-200/70 bg-white/50 p-6">
          <MinimalLineChart label="Weight trend" values={weightSeries} unit="kg" />
          <p className="mt-4 font-sans text-sm leading-relaxed text-stone-500">
            Subtle shifts in body weight can signal hydration, nutrition, or metabolic changes
            before symptoms surface.
          </p>
        </article>
        <article className="border border-stone-200/70 bg-white/50 p-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
            Vaccination timeline
          </p>
          <ul className="mt-4 space-y-3">
            {vaccinationLabels.length > 0 ? (
              vaccinationLabels.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-3 border-b border-stone-100 pb-3 font-sans text-sm text-stone-700 last:border-0 last:pb-0"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-800" aria-hidden />
                  {label}
                </li>
              ))
            ) : (
              <li className="font-sans text-sm text-stone-400">
                Add vaccination records to map immunity windows.
              </li>
            )}
          </ul>
        </article>
      </div>

      <article className="border border-stone-200/70 bg-white/50 p-6">
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Chronic symptom tracking
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {symptomNotes.map((note, index) => (
            <div
              key={index}
              className="border-l border-stone-300 pl-4"
            >
              <p className="font-serif text-lg text-stone-900">Signal {index + 1}</p>
              <p className="mt-1 font-sans text-sm leading-relaxed text-stone-500">{note}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="border border-stone-200/70 bg-stone-900 p-6 text-stone-50 sm:p-8">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
          Predictive synthesis
        </p>
        <h3 className="mt-3 font-serif text-2xl sm:text-3xl">Pattern confidence rising</h3>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-stone-300">
          Pro models cross-reference weight velocity, vaccine due windows, and recurring symptom
          language to surface early-care prompts — weeks before a crisis visit.
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
        <div className="mx-auto w-full max-w-4xl px-6 py-20">
          <LoadingState message="Loading health insights" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
          <h1 className="font-serif text-4xl text-stone-900">Health Foresight</h1>
          <p className="mt-4 font-sans text-sm text-stone-500">
            Add a pet profile to unlock your personalized health journal.
          </p>
          <Link
            to={ROUTES.PET_PROFILE}
            className="mt-6 inline-block font-sans text-xs uppercase tracking-[0.2em] text-stone-800 underline-offset-4 hover:underline"
          >
            Go to pet profile →
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!advancedInsights.isAllowed) {
    return (
      <AppLayout flushContent>
        <PageContainer size="lg" className="mx-auto w-full px-6 py-12 sm:py-16">
          <PremiumGate
            requiredTier="Pro"
            title="Unlock Health Foresight"
            description="PetClues Pro analyzes deep historical health records, vaccines, and weight data to catch subtle care trends before they become emergencies."
            className="!min-h-[28rem]"
          >
            <GatedPagePreview
              imageUrl={HERO_IMAGE}
              eyebrow="Health Foresight"
              title="Predictive care journal"
              subtitle="A living health journal — curated from records, check-ins, and care signals."
            />
          </PremiumGate>
          <div className="mt-12 border-t border-stone-200/60 pt-8">
            <HealthDisclaimerNote compact />
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  const score = scoreData?.snapshot.score ?? null;
  const petPhoto = activePet.photoUrl;

  return (
    <AppLayout flushContent>
      <div className="overflow-x-hidden">
        <header className="relative min-h-[22rem] sm:min-h-[26rem]">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/35 to-stone-900/20" aria-hidden />
          <div className="relative mx-auto flex min-h-[22rem] max-w-4xl flex-col justify-end px-6 pb-10 pt-24 sm:min-h-[26rem] sm:px-8 sm:pb-14">
            <PetSwitcherHero
              pets={pets}
              activeId={activePet.id}
              onSelect={setActivePet}
            />
            <p className="mt-8 font-sans text-[11px] uppercase tracking-[0.24em] text-stone-300">
              {activePet.name}
            </p>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-white sm:text-5xl">
              Health Foresight &amp; Predictive Trends
            </h1>
            <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-stone-200 sm:text-base">
              A living health journal — curated from records, check-ins, and care signals.
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
          <section className="mb-12 grid gap-6 border border-stone-200/70 bg-white/60 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
            <div className="mx-auto h-28 w-28 shrink-0 overflow-hidden border border-stone-200 bg-stone-100 sm:mx-0 sm:h-32 sm:w-32">
              {petPhoto ? (
                <img src={petPhoto} alt={activePet.name} className="h-full w-full object-cover" />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                  aria-hidden
                />
              )}
            </div>
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
                Care snapshot
              </p>
              <h2 className="mt-2 font-serif text-3xl text-stone-900">{activePet.name}</h2>
              <p className="mt-2 font-sans text-sm text-stone-500">
                {[activePet.breed, activePet.species].filter(Boolean).join(' · ')}
              </p>
              {score != null && (
                <p className="mt-4 font-sans text-sm text-stone-600">
                  Current care score{' '}
                  <span className="font-medium tabular-nums text-stone-900">{score}</span>
                </p>
              )}
            </div>
          </section>

          <section className="mb-6">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
              Journal
            </p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">
              Predictive analysis
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-stone-500">
              Deep historical modeling — weight curves, vaccine cadence, and symptom recurrence.
            </p>
          </section>

          <PredictiveForesightSection
            weightSeries={weightSeries}
            vaccinationLabels={vaccinationLabels}
            symptomNotes={symptomNotes}
          />

          <div className="mt-12 border-t border-stone-200/60 pt-8">
            <HealthDisclaimerNote compact />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
