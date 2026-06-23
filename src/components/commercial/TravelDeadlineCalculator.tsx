import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { trackCommercialLead } from '@/analytics/commercialTracking';
import { Button } from '@/components/ui';
import { useHydrated } from '@/hooks/useHydrated';
import { ROUTES } from '@/routes/paths';
import styles from './TravelDeadlineCalculator.module.css';

type Species = 'dog' | 'cat';

type ClearanceState = 'idle' | 'incubation' | 'expired' | 'cleared';

type ClearanceResult = {
  state: ClearanceState;
  message: string;
  detail?: string;
};

const INCUBATION_DAYS = 28;
const VALIDITY_DAYS = 365;

const SPECIES_LABEL: Record<Species, string> = {
  dog: 'Dog',
  cat: 'Cat',
};

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function evaluateClearance(
  vaccineDate: Date | null,
  travelDate: Date | null,
  species: Species,
): ClearanceResult {
  if (!vaccineDate || !travelDate) {
    return {
      state: 'idle',
      message: 'Enter your rabies date and travel date to check clearance.',
      detail: 'Many destinations and kennels enforce a 28-day post-vaccination waiting period and annual proof.',
    };
  }

  if (travelDate < vaccineDate) {
    return {
      state: 'incubation',
      message: 'Clearance Denied: The mandatory 28-day incubation period has not been met.',
      detail: `Your travel date precedes the recorded vaccination. Earliest eligible travel: ${formatDisplayDate(addDays(vaccineDate, INCUBATION_DAYS))}.`,
    };
  }

  const daysSinceVaccine = daysBetween(vaccineDate, travelDate);

  if (daysSinceVaccine < INCUBATION_DAYS) {
    return {
      state: 'incubation',
      message: 'Clearance Denied: The mandatory 28-day incubation period has not been met.',
      detail: `Only ${daysSinceVaccine} day${daysSinceVaccine === 1 ? '' : 's'} since vaccination. Earliest eligible travel: ${formatDisplayDate(addDays(vaccineDate, INCUBATION_DAYS))}.`,
    };
  }

  if (daysSinceVaccine > VALIDITY_DAYS) {
    return {
      state: 'expired',
      message: 'Clearance Denied: Vaccination will be expired by this date.',
      detail: `Rabies proof expires ${formatDisplayDate(addDays(vaccineDate, VALIDITY_DAYS))} under a standard one-year validity window. Schedule a booster before travel.`,
    };
  }

  const speciesLabel = SPECIES_LABEL[species].toLowerCase();

  return {
    state: 'cleared',
    message: 'Cleared for Travel. Secure this record in your Vault for instant sharing.',
    detail: `Your ${speciesLabel}'s rabies vaccination falls within the ${INCUBATION_DAYS}-day incubation and one-year validity window for this travel date.`,
  };
}

function resultPanelClass(state: ClearanceState): string {
  if (state === 'cleared') return `${styles.resultPanel} ${styles.resultPanelCleared}`;
  if (state === 'incubation' || state === 'expired') return `${styles.resultPanel} ${styles.resultPanelDenied}`;
  return styles.resultPanel;
}

function resultBadgeClass(state: ClearanceState): string {
  if (state === 'cleared') return `${styles.resultBadge} ${styles.resultBadgeCleared}`;
  return `${styles.resultBadge} ${styles.resultBadgeDenied}`;
}

function resultBadgeLabel(state: ClearanceState): string {
  if (state === 'cleared') return 'Cleared for travel';
  return 'Clearance denied';
}

export function TravelDeadlineCalculator() {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const animateEntrance = hydrated && !reduceMotion;
  const { pathname } = useLocation();
  const [species, setSpecies] = useState<Species>('dog');
  const [vaccineDate, setVaccineDate] = useState('');
  const [travelDate, setTravelDate] = useState('');

  const result = useMemo(
    () => evaluateClearance(parseDateInput(vaccineDate), parseDateInput(travelDate), species),
    [vaccineDate, travelDate, species],
  );

  const showResult = result.state !== 'idle';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Travel clearance check</p>
        <h2 className={styles.title}>Rabies travel deadline calculator</h2>
        <p className={styles.lead}>
          Verify the 28-day incubation window and one-year validity before boarding or crossing borders.
        </p>
      </header>

      <div className={styles.shell}>
        <div className={styles.panel}>
          <div className={styles.formGrid}>
            <label className={styles.fieldGroup}>
              <span className={styles.label}>Species</span>
              <select
                value={species}
                onChange={(event) => setSpecies(event.target.value as Species)}
                className={styles.field}
                aria-label="Species"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </label>

            <label className={styles.fieldGroup}>
              <span className={styles.label}>Last rabies vaccine date</span>
              <input
                type="date"
                value={vaccineDate}
                onChange={(event) => setVaccineDate(event.target.value)}
                className={styles.field}
                aria-label="Last rabies vaccine date"
              />
            </label>

            <label className={styles.fieldGroup}>
              <span className={styles.label}>Target boarding / travel date</span>
              <input
                type="date"
                value={travelDate}
                onChange={(event) => setTravelDate(event.target.value)}
                className={styles.field}
                aria-label="Target boarding or travel date"
              />
            </label>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={result.state + result.message}
              initial={animateEntrance ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              aria-live="polite"
              className={resultPanelClass(result.state)}
            >
              {showResult ? (
                <>
                  <span className={resultBadgeClass(result.state)}>{resultBadgeLabel(result.state)}</span>
                  <p className={styles.resultMessage}>{result.message}</p>
                  {result.detail && <p className={styles.resultDetail}>{result.detail}</p>}
                  {result.state === 'cleared' && (
                    <div className={styles.ctaRow}>
                      <Link
                        to={ROUTES.SIGNUP}
                        onClick={() => trackCommercialLead('widget_travel_calculator', pathname)}
                      >
                        <Button variant="primary" size="md">
                          Start Membership
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className={styles.resultIdleMessage}>{result.message}</p>
                  {result.detail && <p className={styles.resultIdleDetail}>{result.detail}</p>}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            For planning purposes only. Local law, airline policy, and your veterinarian&apos;s protocol may
            differ. PetClues does not issue travel clearance.
          </p>
        </div>
      </div>
    </div>
  );
}
