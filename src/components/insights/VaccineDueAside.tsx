import { Link } from 'react-router-dom';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import type { VaccineDueForecast } from '@/services/vaccineDue';
import { ROUTES } from '@/routes/paths';
import styles from './VaccineDueAside.module.css';

function VaxShieldIcon() {
  return (
    <svg className={styles.vaxIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3 4 7v6c0 5 3.5 8.5 8 10 3.5-1.5 8-5 8-10V7l-8-4Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M12 8v8M9 11h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

type VaccineDueAsideProps = {
  forecast: VaccineDueForecast;
};

export function VaccineDueAside({ forecast }: VaccineDueAsideProps) {
  if (!forecast.hasVaccinations) {
    return (
      <aside className={styles.empty} aria-label="Vaccination timeline">
        <VaxShieldIcon />
        <p className={styles.emptyText}>
          Add vaccination records to map immunity windows and due-date cadence.
        </p>
        <Link to={ROUTES.PET_PROFILE} className={styles.btn}>
          Add vaccination
        </Link>
      </aside>
    );
  }

  return (
    <aside className={styles.wrap} aria-label="Vaccination timeline">
      <p className={styles.eyebrow}>Immunity windows</p>
      <p className={styles.lead}>Estimated booster timing from your vaccination history.</p>
      <ul className={styles.list}>
        {forecast.predictions.map((prediction) => (
          <li key={prediction.id} className={styles.item}>
            <span
              className={`${styles.dot} ${
                prediction.status === 'overdue'
                  ? styles.dotOverdue
                  : prediction.status === 'due_soon'
                    ? styles.dotSoon
                    : ''
              }`}
              aria-hidden
            />
            <div className={styles.copy}>
              <p className={styles.summary}>{prediction.summary}</p>
              <p className={styles.meta}>
                Last dose {formatHealthRecordDate(prediction.lastDoseDate)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.disclaimer} role="note">
        Estimates use typical intervals and your logged dates — not veterinary advice. Confirm due
        dates with your clinic.
      </p>
    </aside>
  );
}
