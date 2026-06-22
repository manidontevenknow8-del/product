import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { trackCommercialLead } from '@/analytics/commercialTracking';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/paths';

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

const fieldClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 font-sans text-sm text-stone-800 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200/80';

const labelClass = 'mb-1.5 block font-sans text-sm font-medium text-stone-700';

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

const RESULT_STYLES: Record<
  Exclude<ClearanceState, 'idle'>,
  { panel: string; badge: string; badgeLabel: string }
> = {
  incubation: {
    panel: 'border-rose-200/80 bg-rose-50/50 ring-rose-100/80',
    badge: 'border-rose-200/90 bg-rose-100/70 text-rose-900',
    badgeLabel: 'Clearance denied',
  },
  expired: {
    panel: 'border-rose-200/80 bg-rose-50/50 ring-rose-100/80',
    badge: 'border-rose-200/90 bg-rose-100/70 text-rose-900',
    badgeLabel: 'Clearance denied',
  },
  cleared: {
    panel: 'border-emerald-200/80 bg-emerald-50/40 ring-emerald-100/80',
    badge: 'border-emerald-200/90 bg-emerald-100/70 text-emerald-900',
    badgeLabel: 'Cleared for travel',
  },
};

export function TravelDeadlineCalculator() {
  const reduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const [species, setSpecies] = useState<Species>('dog');
  const [vaccineDate, setVaccineDate] = useState('');
  const [travelDate, setTravelDate] = useState('');

  const result = useMemo(
    () => evaluateClearance(parseDateInput(vaccineDate), parseDateInput(travelDate), species),
    [vaccineDate, travelDate, species],
  );

  const showResult = result.state !== 'idle';
  const resultStyle = result.state !== 'idle' ? RESULT_STYLES[result.state] : null;

  return (
    <div className="mx-auto w-full max-w-xl">
      <header className="mb-6 text-center sm:text-left">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
          Travel clearance check
        </p>
        <h2 className="mt-1 font-serif text-2xl text-stone-900">Rabies travel deadline calculator</h2>
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-stone-500">
          Verify the 28-day incubation window and one-year validity before boarding or crossing borders.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_16px_40px_-28px_rgba(28,25,23,0.35)]">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className={labelClass}>Species</span>
              <select
                value={species}
                onChange={(event) => setSpecies(event.target.value as Species)}
                className={fieldClass}
                aria-label="Species"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </label>

            <label className="block sm:col-span-1">
              <span className={labelClass}>Last rabies vaccine date</span>
              <input
                type="date"
                value={vaccineDate}
                onChange={(event) => setVaccineDate(event.target.value)}
                className={fieldClass}
                aria-label="Last rabies vaccine date"
              />
            </label>

            <label className="block sm:col-span-1">
              <span className={labelClass}>Target boarding / travel date</span>
              <input
                type="date"
                value={travelDate}
                onChange={(event) => setTravelDate(event.target.value)}
                className={fieldClass}
                aria-label="Target boarding or travel date"
              />
            </label>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={result.state + result.message}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              aria-live="polite"
              className={[
                'rounded-xl border px-4 py-4 ring-1',
                showResult && resultStyle
                  ? resultStyle.panel
                  : 'border-stone-200/80 bg-stone-50/40 ring-transparent',
              ].join(' ')}
            >
              {showResult && resultStyle ? (
                <>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-wider ${resultStyle.badge}`}
                  >
                    {resultStyle.badgeLabel}
                  </span>
                  <p className="mt-3 font-sans text-sm font-medium leading-snug text-stone-800">
                    {result.message}
                  </p>
                  {result.detail && (
                    <p className="mt-2 font-sans text-xs leading-relaxed text-stone-600">{result.detail}</p>
                  )}
                  {result.state === 'cleared' && (
                    <div className="mt-4">
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
                  <p className="font-sans text-sm text-stone-700">{result.message}</p>
                  {result.detail && (
                    <p className="mt-1.5 font-sans text-xs leading-relaxed text-stone-500">{result.detail}</p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-stone-100 bg-stone-50/60 px-5 py-3 sm:px-6">
          <p className="font-sans text-[11px] leading-relaxed text-stone-500">
            For planning purposes only. Local law, airline policy, and your veterinarian&apos;s protocol may
            differ. PetClues does not issue travel clearance.
          </p>
        </div>
      </div>
    </div>
  );
}
