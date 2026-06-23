import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { trackCommercialLead } from '@/analytics/commercialTracking';
import { useHydrated } from '@/hooks/useHydrated';
import { ROUTES } from '@/routes/paths';

type DemoPhase = 'idle' | 'scanning' | 'complete';

const SCAN_DURATION_MS = 2500;

const EXTRACTED_RECORDS = [
  {
    label: 'Rabies Vaccine',
    detail: 'Batch #9921',
    administered: 'Oct 12, 2025',
    nextDue: 'Oct 12, 2026',
  },
  {
    label: 'DHPP Booster',
    detail: 'Nobivac · Lot 44102',
    administered: 'Sep 03, 2025',
    nextDue: 'Sep 03, 2026',
  },
  {
    label: 'Bordetella',
    detail: 'Intranasal',
    administered: 'Aug 18, 2025',
    nextDue: 'Feb 18, 2026',
  },
] as const;

function VetBillThumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-stone-100 to-stone-200/80 p-4">
      <div className="mb-3 flex items-center justify-between border-b border-stone-300/60 pb-2">
        <div className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500">
          City Vet Clinic
        </div>
        <div className="font-sans text-[10px] text-stone-400">INV-2847</div>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-3/4 rounded-full bg-stone-300/70" />
        <div className="h-2 w-full rounded-full bg-stone-300/50" />
        <div className="h-2 w-5/6 rounded-full bg-stone-300/50" />
        <div className="mt-4 h-2 w-1/2 rounded-full bg-stone-300/40" />
        <div className="h-2 w-2/3 rounded-full bg-stone-300/40" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 border-t border-dashed border-stone-300/80 pt-3">
        <div className="flex justify-between font-sans text-[9px] text-stone-500">
          <span>Rabies · DHPP · Exam</span>
          <span>$186.00</span>
        </div>
      </div>
    </div>
  );
}

function ScanLaser({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();

  if (!active || reduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-3 z-10 h-px"
      initial={{ top: '8%' }}
      animate={{ top: ['8%', '92%'] }}
      transition={{ duration: SCAN_DURATION_MS / 1000, ease: 'linear' }}
      aria-hidden
    >
      <div className="relative h-8 -translate-y-1/2">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-teal-400/90 to-transparent shadow-[0_0_24px_rgba(45,212,191,0.55)]" />
        <div className="absolute inset-x-4 top-1/2 h-6 -translate-y-1/2 bg-gradient-to-b from-teal-300/0 via-teal-300/10 to-teal-300/0 blur-sm" />
      </div>
    </motion.div>
  );
}

function ExtractedRecordCard({ pagePath }: { pagePath: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
            Concierge extraction
          </p>
          <h3 className="mt-1 font-serif text-xl text-stone-900">Structured health record</h3>
        </div>
        <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-wider text-stone-600">
          Ready
        </span>
      </div>

      <div className="divide-y divide-stone-200/80 rounded-xl border border-stone-200/80 bg-white/80">
        {EXTRACTED_RECORDS.map((record) => (
          <div key={record.label} className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-sans text-sm font-medium text-stone-800">{record.label}</p>
              <p className="font-sans text-xs text-stone-500">
                {record.detail} · Administered {record.administered}
              </p>
            </div>
            <p className="font-sans text-xs text-stone-500 sm:text-right">
              Next due <span className="text-stone-700">{record.nextDue}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-stone-100/80 px-3 py-2.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600/80" aria-hidden />
        <p className="font-sans text-xs text-stone-600">
          Reminders drafted · Timeline updated · Certificate filed to vault
        </p>
      </div>

      <p className="font-sans text-xs leading-relaxed text-stone-500">
        This is a demonstration.{' '}
        <Link
          to={ROUTES.SIGNUP}
          onClick={() => trackCommercialLead('widget_document_scanner', pagePath)}
          className="text-stone-700 underline decoration-stone-300 underline-offset-2 hover:text-stone-900"
        >
          Create a free account
        </Link>{' '}
        to scan real vet paperwork with PetClues.
      </p>
    </motion.div>
  );
}

export function DocumentScannerDemo() {
  const { pathname } = useLocation();
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const animateEntrance = hydrated && !reduceMotion;

  const clearScanTimer = useCallback(() => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearScanTimer(), [clearScanTimer]);

  const startScan = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('scanning');
    clearScanTimer();
    scanTimerRef.current = setTimeout(() => {
      setPhase('complete');
      scanTimerRef.current = null;
    }, reduceMotion ? 400 : SCAN_DURATION_MS);
  }, [phase, clearScanTimer, reduceMotion]);

  const reset = useCallback(() => {
    clearScanTimer();
    setPhase('idle');
  }, [clearScanTimer]);

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (phase === 'idle') setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    startScan();
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-4 text-center sm:text-left">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
          Concierge demo
        </p>
        <h2 className="mt-1 font-serif text-2xl text-stone-900">See a vet bill become a record</h2>
        <p className="mt-1.5 font-sans text-sm text-stone-500">
          Drop any file to preview how PetClues structures clinical data—no upload required.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-gradient-to-b from-stone-50 to-white p-1 shadow-[0_20px_50px_-24px_rgba(28,25,23,0.35)]">
        <div className="rounded-[10px] bg-white/90 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.button
                key="dropzone"
                type="button"
                initial={animateEntrance ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={startScan}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={[
                  'group relative flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors duration-300',
                  isDragging
                    ? 'border-stone-400 bg-stone-100/80'
                    : 'border-stone-300/80 bg-stone-50/50 hover:border-stone-400 hover:bg-stone-50',
                ].join(' ')}
                aria-label="Simulate uploading a vet bill"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <svg
                    className="h-5 w-5 text-stone-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <p className="font-sans text-sm font-medium text-stone-700">
                  Drop a vet bill, or click to simulate
                </p>
                <p className="mt-1 font-sans text-xs text-stone-400">PDF · JPG · PNG — demo only</p>
              </motion.button>
            )}

            {phase === 'scanning' && (
              <motion.div
                key="scanning"
                initial={animateEntrance ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
                role="status"
                aria-live="polite"
                aria-label="Scanning document"
              >
                <div className="flex items-center justify-between">
                  <p className="font-sans text-sm font-medium text-stone-700">Scanning document…</p>
                  <span className="font-sans text-xs text-stone-400">Concierge AI</span>
                </div>
                <div className="relative aspect-[4/5] max-h-64 w-full overflow-hidden rounded-xl border border-stone-200/80 bg-stone-100 shadow-inner">
                  <VetBillThumbnail />
                  <ScanLaser active />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-teal-500/5" />
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-stone-200/80">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-stone-400 to-teal-600/70"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: reduceMotion ? 0.4 : SCAN_DURATION_MS / 1000,
                      ease: 'linear',
                    }}
                  />
                </div>
              </motion.div>
            )}

            {phase === 'complete' && (
              <motion.div key="complete" initial={animateEntrance ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ExtractedRecordCard pagePath={pathname} />
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 font-sans text-xs text-stone-500 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-700"
                >
                  Run demo again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
