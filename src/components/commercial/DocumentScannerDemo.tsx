import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { trackCommercialLead } from '@/analytics/commercialTracking';
import { useHydrated } from '@/hooks/useHydrated';
import { ROUTES } from '@/routes/paths';
import styles from './DocumentScannerDemo.module.css';

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
    <div className={styles.billPreview}>
      <div className={styles.billHeader}>
        <div className={styles.billClinic}>City Vet Clinic</div>
        <div className={styles.billInvoice}>INV-2847</div>
      </div>
      <div className={styles.skeletonLines}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineWide}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineFull}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} style={{ marginTop: 'var(--space-4)' }} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineTwoThirds}`} />
      </div>
      <div className={styles.billFooter}>
        <span>Rabies · DHPP · Exam</span>
        <span>$186.00</span>
      </div>
    </div>
  );
}

function ScanLaser({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();

  if (!active || reduceMotion) return null;

  return (
    <motion.div
      className={styles.laser}
      initial={{ top: '8%' }}
      animate={{ top: ['8%', '92%'] }}
      transition={{ duration: SCAN_DURATION_MS / 1000, ease: 'linear' }}
      aria-hidden
    >
      <div className={styles.laserGlow}>
        <div className={styles.laserLine} />
      </div>
    </motion.div>
  );
}

function ExtractedRecordCard({ pagePath, animateEntrance }: { pagePath: string; animateEntrance: boolean }) {
  return (
    <motion.div
      initial={animateEntrance ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.resultHeader}>
        <div className={styles.resultTitleBlock}>
          <p className={styles.eyebrow}>Concierge extraction</p>
          <h3 className={styles.title}>Structured health record</h3>
        </div>
        <span className={styles.resultBadge}>Ready</span>
      </div>

      <div className={styles.recordList}>
        {EXTRACTED_RECORDS.map((record) => (
          <div key={record.label} className={styles.recordRow}>
            <div>
              <p className={styles.recordLabel}>{record.label}</p>
              <p className={styles.recordDetail}>
                {record.detail} · Administered {record.administered}
              </p>
            </div>
            <p className={styles.recordDue}>
              Next due <span>{record.nextDue}</span>
            </p>
          </div>
        ))}
      </div>

      <div className={styles.statusBar}>
        <span className={styles.statusDot} aria-hidden />
        <p className={styles.statusText}>
          Reminders drafted · Timeline updated · Certificate filed to vault
        </p>
      </div>

      <p className={styles.demoNote}>
        This is a demonstration.{' '}
        <Link
          to={ROUTES.SIGNUP}
          onClick={() => trackCommercialLead('widget_document_scanner', pagePath)}
          className={styles.demoLink}
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

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Concierge demo</p>
        <h2 className={styles.title}>See a vet bill become a record</h2>
        <p className={styles.lead}>
          Click below to preview how PetClues structures clinical data. Simulation only, no file upload.
        </p>
      </div>

      <div className={styles.shell}>
        <div className={styles.panel}>
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.button
                key="simulate"
                type="button"
                initial={animateEntrance ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={startScan}
                className={styles.simulateTrigger}
                aria-label="Simulate scanning a vet bill"
              >
                <div className={styles.simulateIcon}>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <p className={styles.simulateTitle}>Simulate scan</p>
                <p className={styles.simulateHint}>Sample vet bill · demo only</p>
              </motion.button>
            )}

            {phase === 'scanning' && (
              <motion.div
                key="scanning"
                initial={animateEntrance ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.scanning}
                role="status"
                aria-live="polite"
                aria-label="Scanning document"
              >
                <div className={styles.scanningHeader}>
                  <p className={styles.scanningTitle}>Scanning document…</p>
                  <span className={styles.scanningMeta}>Concierge AI</span>
                </div>
                <div className={styles.previewFrame}>
                  <VetBillThumbnail />
                  <ScanLaser active />
                </div>
                <div className={styles.progressTrack}>
                  <motion.div
                    className={styles.progressBar}
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
              <motion.div
                key="complete"
                initial={animateEntrance ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ExtractedRecordCard pagePath={pathname} animateEntrance={animateEntrance} />
                <button type="button" onClick={reset} className={styles.resetButton}>
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
