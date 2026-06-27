import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { PAGE_IMG } from '@/data/pageImages';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { PetSwitcherHero } from '@/components/pets';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { getMonthlyReport, listMonthlyReports } from '@/services/monthlyReport';
import { MonthlyReportCard } from '@/components/monthly-report';
import { ROUTES } from '@/routes/paths';
import styles from './MonthlyReportArchivePage.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

export function MonthlyReportArchivePage() {
  const { user } = useAuth();
  const { activePet, pets, setActivePet } = usePets();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedMonthKey = searchParams.get('month') ?? null;

  const [error, setError] = useState<string | null>(null);

  const reports = useMemo(() => {
    if (!user?.id) return [];
    return listMonthlyReports(user.id, activePet?.id);
  }, [user?.id, activePet?.id]);

  const selected = useMemo(() => {
    if (!user?.id || !activePet?.id || !selectedMonthKey) return null;
    return getMonthlyReport(user.id, activePet.id, selectedMonthKey);
  }, [user?.id, activePet?.id, selectedMonthKey]);

  const heroBg = resolvePetHeroBackground(activePet?.photoUrl);
  const heroSrc = heroBg.isPetPhoto ? heroBg.src : PAGE_IMG.app.monthlyReport;
  const heroPhoto = normalizePhotoUrlFromDb(activePet?.photoUrl);

  return (
    <AppLayout flushContent>
      <div className="ed-page">
        <header className="ed-hero">
          <img
            className={`ed-hero__bg ${heroBg.isPetPhoto ? 'ed-hero__bg--pet' : ''}`}
            src={heroSrc}
            alt=""
            aria-hidden
          />
          <div className="ed-hero__wash" aria-hidden />
          <div className="ed-hero__texture" aria-hidden />
          <div className="ed-hero__inner">
            <div className="ed-hero__top">
              {activePet && (
                <PetSwitcherHero pets={pets} activeId={activePet.id} onSelect={setActivePet} />
              )}
            </div>
            <div className="ed-hero__grid">
              <div className="ed-hero__text">
                <p className="ed-hero__kicker">Monthly stories</p>
                <h1 className="ed-hero__title">Report archive</h1>
                <p className="ed-hero__subtitle">
                  {activePet
                    ? `Every saved chapter of ${activePet.name}'s life, kept in one beautiful place.`
                    : 'Your saved monthly life reports, kept in one beautiful place.'}
                </p>
                <div className="ed-hero__cta">
                  <Link to={ROUTES.MONTHLY_REPORT} className="ed-btn">
                    Generate report
                  </Link>
                </div>
              </div>
              {heroPhoto && (
                <div className="ed-hero__portrait" aria-hidden>
                  <img src={heroPhoto} alt="" />
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="ed-body">
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          {reports.length === 0 ? (
            <div className={styles.empty}>
              <h2 className={styles.emptyTitle}>No saved reports yet</h2>
              <p className={styles.emptyText}>
                Generate a report and tap “Save” to begin building your monthly archive.
              </p>
              <div className={styles.emptyBtn}>
                <Link to={ROUTES.MONTHLY_REPORT} className="ed-btn-dark">
                  Create first report
                </Link>
              </div>
            </div>
          ) : (
            <>
              <section className="ed-chapter" aria-label="Saved months">
                <div className="ed-chapter__intro">
                  <p className="ed-eyebrow">The collection</p>
                  <h2 className="ed-title">Saved stories</h2>
                </div>
                <ul className={styles.list}>
                  {reports.map((report) => (
                    <li key={report.monthKey}>
                      <button
                        type="button"
                        className={`${styles.listItem} ${selectedMonthKey === report.monthKey ? styles.listItemActive : ''}`}
                        onClick={() => {
                          try {
                            searchParams.set('month', report.monthKey);
                            setSearchParams(searchParams, { replace: true });
                          } catch (err) {
                            setError(getUserFacingError(err, 'generic', 'Unable to select report'));
                          }
                        }}
                      >
                        <span>
                          <span className={styles.month}>{report.monthLabel}</span>
                          <span className={styles.meta}>
                            <span className={styles.metaItem}>
                              {report.remindersCompleted} reminders
                            </span>
                            <span className={styles.metaItem}>
                              {report.documentsUploaded} docs
                            </span>
                          </span>
                        </span>
                        <span className={styles.chevron} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="ed-chapter" aria-label="Report preview">
                {selected ? (
                  <div className={styles.previewFrame}>
                    <MonthlyReportCard report={selected} />
                  </div>
                ) : (
                  <p className={styles.previewEmpty}>Select a month above to preview its report.</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
