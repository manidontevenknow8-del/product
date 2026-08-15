import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { VaccineSchedulerSEO } from '@/seo/vaccineSchedulerSeo';
import { ROUTES } from '@/routes/paths';
import { getSupabaseClient } from '@/services/supabase/client';
import {
  calculateVaccineSchedule,
  formatVaccineDueLabel,
  persistVaccineRoadmap,
  type BreedSize,
  type LifestyleRisk,
  type VaccineScheduleResult,
  type VaccineSpecies,
  type VaccineUrgency,
} from '@/utils/vaccineCalculator';
import styles from './VaccineSchedulerPage.module.css';

type WizardStep = 1 | 2 | 3;

const SPECIES_OPTIONS: { id: VaccineSpecies; label: string; hint: string }[] = [
  { id: 'dog', label: 'Dog / Puppy', hint: 'DHPP + rabies core series' },
  { id: 'cat', label: 'Cat / Kitten', hint: 'FVRCP + rabies core series' },
];

const SIZE_OPTIONS: { id: BreedSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const LIFESTYLE_OPTIONS: { id: LifestyleRisk; label: string; hint: string }[] = [
  {
    id: 'indoor',
    label: 'Indoor only',
    hint: 'Core vaccines with minimal lifestyle extras',
  },
  {
    id: 'social',
    label: 'Dog park / social',
    hint: 'Adds boarding & socialization risk vaccines',
  },
  {
    id: 'international',
    label: 'International traveler',
    hint: 'Adds titer / travel rabies planning windows',
  },
];

function statusLabel(status: VaccineUrgency): string {
  if (status === 'overdue') return 'Overdue';
  if (status === 'due_soon') return 'Due soon';
  return 'Upcoming';
}

function ConversionLock({
  result,
  onSandbox,
  sandboxBusy,
}: {
  result: VaccineScheduleResult;
  onSandbox: () => void;
  sandboxBusy: boolean;
}) {
  return (
    <aside className={styles.lock} aria-label="Save immunization roadmap">
      <p className={styles.lockEyebrow}>Do not lose this schedule</p>
      <h2 className={styles.lockTitle}>
        Transfer this custom roadmap into a permanent medical timeline with email &amp; SMS
        reminders
      </h2>
      <p className={styles.lockBody}>
        {result.summary.coreCount} core and {result.summary.nonCoreCount} lifestyle doses mapped for
        your {result.input.species}. Lock them into PetClues so boosters never slip.
      </p>
      <div className={styles.lockActions}>
        <button
          type="button"
          className={styles.lockPrimary}
          onClick={onSandbox}
          disabled={sandboxBusy}
        >
          {sandboxBusy ? 'Opening sandbox…' : 'Save Roadmap to Sandbox (Free)'}
        </button>
        <Link to={ROUTES.GENESIS} className={styles.lockSecondary}>
          Activate Genesis Vault ($249 Lifetime)
        </Link>
      </div>
    </aside>
  );
}

/**
 * Public SEO tool: interactive puppy & kitten vaccination / booster scheduler.
 */
export function VaccineSchedulerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [species, setSpecies] = useState<VaccineSpecies | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [breedSize, setBreedSize] = useState<BreedSize>('medium');
  const [lifestyle, setLifestyle] = useState<LifestyleRisk | null>(null);
  const [result, setResult] = useState<VaccineScheduleResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sandboxBusy, setSandboxBusy] = useState(false);

  const canStep1 = Boolean(species && dateOfBirth);
  const canStep2 = Boolean(lifestyle);

  const roadmapTitle = useMemo(() => {
    if (!result) return '';
    const label = result.input.species === 'dog' ? 'Puppy' : 'Kitten';
    return `Custom Clinical Immunization Roadmap - ${label}`;
  }, [result]);

  const runSchedule = () => {
    if (!species || !lifestyle || !dateOfBirth) return;
    try {
      const next = calculateVaccineSchedule({
        species,
        dateOfBirth,
        breedSize,
        lifestyle,
      });
      setResult(next);
      persistVaccineRoadmap(next);
      setStep(3);
      setFormError(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not build schedule.');
    }
  };

  const saveToSandbox = async () => {
    if (!result) return;
    setSandboxBusy(true);
    persistVaccineRoadmap(result);

    const breed =
      result.input.species === 'dog'
        ? `${result.input.breedSize}-breed puppy`
        : 'kitten';
    const condition = 'vaccination-schedule';

    try {
      const response = await fetch('/api/ephemeral-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breed, condition }),
      });
      const payload = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !payload.access_token || !payload.refresh_token) {
        throw new Error(payload.error || 'Sandbox unavailable right now.');
      }

      const supabase = getSupabaseClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });
      if (sessionError) throw new Error(sessionError.message);

      sessionStorage.setItem(
        'petclues_ephemeral_context',
        JSON.stringify({
          breed,
          condition,
          vaccineRoadmap: result,
          launchedAt: Date.now(),
        }),
      );

      navigate(payload.redirectTo || ROUTES.TIMELINE, { replace: true });
    } catch {
      // Fallback: hand schedule params into registration / onboarding state.
      navigate(ROUTES.SIGNUP, {
        replace: false,
        state: {
          from: 'vaccine-scheduler',
          vaccineRoadmap: result,
        },
      });
    } finally {
      setSandboxBusy(false);
    }
  };

  return (
    <PublicLayout centered={false}>
      <VaccineSchedulerSEO />
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Free clinical tool</p>
          <h1 className={styles.title}>Puppy &amp; Kitten Vaccination &amp; Booster Scheduler</h1>
          <p className={styles.lead}>
            Build a precise core and lifestyle immunization roadmap from date of birth - then save
            it to a reminder-ready medical timeline.
          </p>
        </header>

        <ol className={styles.steps} aria-label="Scheduler steps">
          <li className={step === 1 ? styles.stepActive : styles.stepDone}>1 · Species &amp; DOB</li>
          <li className={step === 2 ? styles.stepActive : step > 2 ? styles.stepDone : ''}>
            2 · Lifestyle
          </li>
          <li className={step === 3 ? styles.stepActive : ''}>3 · Roadmap</li>
        </ol>

        {step === 1 && (
          <section className={styles.panel} aria-labelledby="step1-title">
            <h2 id="step1-title" className={styles.panelTitle}>
              Select species &amp; enter date of birth
            </h2>
            <div className={styles.optionGrid}>
              {SPECIES_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.option} ${species === option.id ? styles.optionActive : ''}`}
                  onClick={() => setSpecies(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </button>
              ))}
            </div>

            <label className={styles.field}>
              <span>Date of birth</span>
              <input
                type="date"
                value={dateOfBirth}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            </label>

            <fieldset className={styles.fieldset}>
              <legend>Breed size</legend>
              <div className={styles.chipRow}>
                {SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.chip} ${breedSize === option.id ? styles.chipActive : ''}`}
                    onClick={() => setBreedSize(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>
                Large-breed puppies often finish the core series slightly later (around 18 weeks).
              </p>
            </fieldset>

            {formError && <p className={styles.error}>{formError}</p>}

            <button
              type="button"
              className={styles.nextBtn}
              disabled={!canStep1}
              onClick={() => setStep(2)}
            >
              Continue to lifestyle
            </button>
          </section>
        )}

        {step === 2 && (
          <section className={styles.panel} aria-labelledby="step2-title">
            <h2 id="step2-title" className={styles.panelTitle}>
              Select lifestyle &amp; travel habits
            </h2>
            <div className={styles.optionGrid}>
              {LIFESTYLE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.option} ${lifestyle === option.id ? styles.optionActive : ''}`}
                  onClick={() => setLifestyle(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </button>
              ))}
            </div>
            <div className={styles.navRow}>
              <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className={styles.nextBtn}
                disabled={!canStep2}
                onClick={runSchedule}
              >
                Generate immunization roadmap
              </button>
            </div>
          </section>
        )}

        {step === 3 && result && (
          <>
            <ConversionLock
              result={result}
              onSandbox={() => void saveToSandbox()}
              sandboxBusy={sandboxBusy}
            />

            <section className={styles.roadmap} aria-labelledby="roadmap-title">
              <div className={styles.roadmapHead}>
                <h2 id="roadmap-title" className={styles.panelTitle}>
                  {roadmapTitle}
                </h2>
                <p className={styles.roadmapMeta}>
                  {result.summary.overdueCount > 0 && (
                    <span className={styles.metaOverdue}>
                      {result.summary.overdueCount} overdue
                    </span>
                  )}
                  {result.summary.dueSoonCount > 0 && (
                    <span className={styles.metaSoon}>
                      {result.summary.dueSoonCount} due soon
                    </span>
                  )}
                  <span>
                    {result.summary.coreCount} core · {result.summary.nonCoreCount} lifestyle
                  </span>
                </p>
              </div>

              <ol className={styles.timeline}>
                {result.items.map((item) => (
                  <li key={item.id} className={styles.timelineItem}>
                    <div className={styles.timelineDate}>
                      <time dateTime={item.dueDate}>{formatVaccineDueLabel(item.dueDate)}</time>
                      <span className={styles.milestone}>{item.milestone}</span>
                    </div>
                    <div className={styles.timelineBody}>
                      <div className={styles.timelineTop}>
                        <h3 className={styles.vaxName}>{item.vaccineName}</h3>
                        <span
                          className={`${styles.tag} ${
                            item.status === 'overdue'
                              ? styles.tagOverdue
                              : item.status === 'due_soon'
                                ? styles.tagSoon
                                : styles.tagUpcoming
                          }`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      <p className={styles.vaxCat}>
                        {item.category === 'core' ? 'Core' : 'Non-core / lifestyle'}
                      </p>
                      <p className={styles.vaxNotes}>{item.notes}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className={styles.disclaimer}>
                Educational planning aid only. Product choice, titer strategy, and legal rabies
                intervals vary by clinic and jurisdiction - confirm with your veterinarian before
                traveling or boarding.
              </p>

              <button
                type="button"
                className={styles.backBtn}
                onClick={() => {
                  setStep(2);
                  setResult(null);
                }}
              >
                Adjust lifestyle &amp; regenerate
              </button>
            </section>

            <ConversionLock
              result={result}
              onSandbox={() => void saveToSandbox()}
              sandboxBusy={sandboxBusy}
            />
          </>
        )}

        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.panelTitle}>
            Vaccination schedule FAQ
          </h2>
          <details>
            <summary>When is the 8-week DHPP / FVRCP dose?</summary>
            <p>
              Most protocols start the core series near 8 weeks of age. This tool schedules that
              first milestone from the date of birth you enter.
            </p>
          </details>
          <details>
            <summary>What happens at 12 weeks?</summary>
            <p>
              Expect a core booster plus rabies in many regions. Lifestyle risk may add Leptospirosis,
              Bordetella, influenza, or FeLV.
            </p>
          </details>
          <details>
            <summary>Why is there a 1-year titer / booster row?</summary>
            <p>
              After the puppy or kitten series, clinics typically plan a one-year adult booster or
              discuss titers before moving to multi-year intervals.
            </p>
          </details>
        </section>
      </div>
    </PublicLayout>
  );
}

export default VaccineSchedulerPage;
