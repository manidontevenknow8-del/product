import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { PetSwitcherHero } from '@/components/pets';
import { getMonthlyReport, listMonthlyReports } from '@/services/monthlyReport';
import { MonthlyReportCard } from '@/components/monthly-report';
import { ROUTES } from '@/routes/paths';
import styles from './MonthlyReportArchivePage.module.css';

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

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PageHeroBand
          compact
          image={PAGE_IMG.app.monthlyReport}
          imageAlt=""
          eyebrow="Monthly stories"
          title="Report archive"
          subtitle={
            activePet
              ? `Saved stories for ${activePet.name}`
              : 'Saved monthly life reports'
          }
          topActions={
            activePet ? (
              <PetSwitcherHero
                pets={pets}
                activeId={activePet.id}
                onSelect={setActivePet}
              />
            ) : undefined
          }
          actions={
            <Link to={ROUTES.MONTHLY_REPORT}>
              <Button variant="secondary" size="sm">
                Generate report
              </Button>
            </Link>
          }
        />

        <div className={styles.body}>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          {reports.length === 0 ? (
            <Card variant="information" className={styles.card}>
              <h3 className={styles.title}>No saved reports yet</h3>
              <p className={styles.text}>
                Generate a report and tap “Save” to build your monthly archive.
              </p>
              <Link to={ROUTES.MONTHLY_REPORT}>
                <Button variant="primary">Create first report</Button>
              </Link>
            </Card>
          ) : (
            <div className={styles.grid}>
              <div className={styles.list}>
                {reports.map((report) => (
                  <button
                    key={report.monthKey}
                    type="button"
                    className={`${styles.listItem} ${selectedMonthKey === report.monthKey ? styles.active : ''}`}
                    onClick={() => {
                      try {
                        searchParams.set('month', report.monthKey);
                        setSearchParams(searchParams, { replace: true });
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Unable to select report');
                      }
                    }}
                  >
                    <div>
                      <div className={styles.month}>{report.monthLabel}</div>
                      <div className={styles.meta}>
                        <Badge variant="dark">{report.remindersCompleted} reminders</Badge>
                        <Badge variant="dark">{report.documentsUploaded} docs</Badge>
                      </div>
                    </div>
                    <span className={styles.chevron} aria-hidden="true" />
                  </button>
                ))}
              </div>

              <div className={styles.preview}>
                {selected ? (
                  <MonthlyReportCard report={selected} />
                ) : (
                  <Card variant="flat" className={styles.previewEmpty}>
                    Select a month to preview the report.
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
