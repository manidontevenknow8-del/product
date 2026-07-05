import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SymptomLogForm } from './SymptomLogForm';
import {
  formatSymptomLogDate,
  formatSymptomLogSummary,
  type SymptomLog,
  type SymptomPattern,
} from '@/services/symptomLog';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { ROUTES } from '@/routes/paths';
import styles from './SymptomObservationsSection.module.css';

type SymptomObservationsSectionProps = {
  petName: string;
  logs: SymptomLog[];
  patterns?: SymptomPattern[];
  canLog?: boolean;
  onCreateLog: (input: {
    symptoms: string[];
    note: string | null;
    photoUrl: string | null;
  }) => Promise<unknown>;
  showFormByDefault?: boolean;
  /** Cap list length for gated previews; omit for full Pro history */
  maxLogs?: number;
};

export function SymptomObservationsSection({
  petName,
  logs,
  patterns = [],
  canLog = true,
  onCreateLog,
  showFormByDefault = false,
  maxLogs,
}: SymptomObservationsSectionProps) {
  const [showForm, setShowForm] = useState(showFormByDefault);
  const visibleLogs = maxLogs != null ? logs.slice(0, maxLogs) : logs;

  return (
    <section className={styles.wrap} aria-label="Symptom observations">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Observations</p>
          <h3 className={styles.title}>What we&apos;re watching</h3>
          <p className={styles.lead}>
            Structured symptom logs help spot patterns before they become urgent visits.
          </p>
        </div>
        {canLog && !showForm && (
          <button type="button" className={styles.secondaryBtn} onClick={() => setShowForm(true)}>
            Log symptoms
          </button>
        )}
      </div>

      {showForm && canLog && (
        <div className={styles.formPanel}>
          <SymptomLogForm
            petName={petName}
            onSubmit={async (input) => {
              await onCreateLog(input);
              setShowForm(false);
            }}
            submitLabel="Save log"
          />
          <button type="button" className={styles.textBtn} onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      )}

      {patterns.length > 0 && (
        <div className={styles.patterns} role="status" aria-label="Detected symptom patterns">
          <p className={styles.patternsEyebrow}>Pattern detection</p>
          <ul className={styles.patternsList}>
            {patterns.map((pattern) => (
              <li key={pattern.id} className={styles.patternItem}>
                {pattern.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {visibleLogs.length > 0 ? (
        <ul className={styles.list}>
          {visibleLogs.map((log, index) => {
            const photo = normalizePhotoUrlFromDb(log.photoUrl);
            return (
              <li key={log.id} className={styles.item}>
                <span className={styles.num} aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className={styles.copy}>
                  <p className={styles.date}>{formatSymptomLogDate(log)}</p>
                  <p className={styles.summary}>{formatSymptomLogSummary(log)}</p>
                  {photo && (
                    <img src={photo} alt="" className={styles.thumb} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            No symptom logs yet. Track vomiting, appetite changes, limping, and other signs as they
            happen — not just wellness notes in health records.
          </p>
          {canLog && !showForm && (
            <button type="button" className={styles.primaryBtn} onClick={() => setShowForm(true)}>
              Log first symptom
            </button>
          )}
          <Link to={ROUTES.DASHBOARD} className={styles.linkBtn}>
            Or log during daily check-in
          </Link>
        </div>
      )}
    </section>
  );
}
