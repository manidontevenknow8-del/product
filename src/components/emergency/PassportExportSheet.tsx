import { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import type { PassportData } from '@/services/passport/passportSummaryService';
import { formatPassportRecordLine } from '@/services/passport/passportSummaryService';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import styles from './PassportExportSheet.module.css';

type PassportExportSheetProps = {
  passport: PassportData;
};

export const PassportExportSheet = forwardRef<HTMLDivElement, PassportExportSheetProps>(
  function PassportExportSheet({ passport }, ref) {
    const { identity, stats } = passport;

    const sheet = (
      <div ref={ref} className={styles.sheet} aria-hidden="true">
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.avatar}>
              <span className={styles.avatarInitials}>{identity.avatarInitials}</span>
            </div>
            <div>
              <p className={styles.brand}>PetClues Emergency Passport</p>
              <h1 className={styles.petName}>{identity.petName}</h1>
              <p className={styles.meta}>
                {identity.species} · {identity.breed} · {identity.age}
                {identity.gender ? ` · ${identity.gender}` : ''}
                {identity.weight ? ` · ${identity.weight}` : ''}
              </p>
              <p className={styles.updated}>Last updated {identity.lastUpdated}</p>
            </div>
          </div>
        </header>

        <section className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{stats.totalRecords}</span>
            <span className={styles.summaryLabel}>Health records</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{stats.activeMedicationsCount}</span>
            <span className={styles.summaryLabel}>Medications</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{stats.allergiesCount}</span>
            <span className={styles.summaryLabel}>Allergies</span>
          </div>
          {passport.careContext.latestWeight && (
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{passport.careContext.latestWeight}</span>
              <span className={styles.summaryLabel}>Latest weight</span>
            </div>
          )}
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Weight history</h2>
          {passport.weightRecords.length === 0 ? (
            <p className={styles.empty}>
              {passport.careContext.profileWeight
                ? `Profile weight: ${passport.careContext.profileWeight} (no dated weigh-ins on file).`
                : 'No weight records logged.'}
            </p>
          ) : (
            <ul className={styles.recordList}>
              {passport.weightRecords.map((r) => (
                <li key={r.id} className={styles.recordItem}>
                  {formatPassportRecordLine(r)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Recent feeding &amp; activity</h2>
          <p className={styles.careMeta}>
            Last {passport.careContext.recentDailyCare.length} day
            {passport.careContext.recentDailyCare.length === 1 ? '' : 's'} logged ·{' '}
            {passport.careContext.weekSummary.totalWalkKm} km walked this week
          </p>
          {passport.careContext.recentDailyCare.length === 0 ? (
            <p className={styles.empty}>No daily check-ins in the last 14 days.</p>
          ) : (
            <table className={styles.careTable}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Fed</th>
                  <th scope="col">Walk</th>
                  <th scope="col">Weight</th>
                </tr>
              </thead>
              <tbody>
                {passport.careContext.recentDailyCare.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.dateLabel}</td>
                    <td>{entry.feeding}</td>
                    <td>{entry.walkLabel}</td>
                    <td>{entry.weightLabel ?? 'Not recorded'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {passport.allergies.length > 0 && (
          <section className={styles.alert}>
            <h2 className={styles.alertTitle}>Known allergies</h2>
            <ul>
              {passport.allergies.map((r) => (
                <li key={r.id}>{r.title}</li>
              ))}
            </ul>
          </section>
        )}

        <RecordBlock title="Vaccinations" records={passport.vaccinations} />
        <RecordBlock title="Allergies" records={passport.allergies} critical />
        <RecordBlock title="Medications" records={passport.medications} />
        <RecordBlock title="Conditions" records={passport.conditions} />

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Emergency notes</h2>
          <p className={styles.notes}>{passport.emergencyNotes}</p>
        </section>

        {stats.latestVaccination && (
          <p className={styles.latestVax}>
            Latest vaccination: {stats.latestVaccination.title} ·{' '}
            {formatHealthRecordDate(stats.latestVaccination.dateRecorded)}
          </p>
        )}

        <footer className={styles.footer}>
          Generated by PetClues · For veterinary and emergency use · {identity.petName}
        </footer>
      </div>
    );

    return createPortal(sheet, document.body);
  },
);

function RecordBlock({
  title,
  records,
  critical = false,
}: {
  title: string;
  records: HealthRecord[];
  critical?: boolean;
}) {
  return (
    <section className={`${styles.block} ${critical ? styles.blockCritical : ''}`}>
      <h2 className={styles.blockTitle}>{title}</h2>
      {records.length === 0 ? (
        <p className={styles.empty}>None recorded.</p>
      ) : (
        <ul className={styles.recordList}>
          {records.map((r) => (
            <li key={r.id} className={styles.recordItem}>
              {formatPassportRecordLine(r)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
