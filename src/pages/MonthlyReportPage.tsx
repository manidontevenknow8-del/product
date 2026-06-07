import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, EmptyState, LoadingState, Card } from '@/components/ui';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { PageHeroBand, SectionIntro } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  MonthPicker,
  MonthlyReportActions,
  MonthlyReportDocument,
} from '@/components/monthly-report';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { useReminders } from '@/reminders';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { usePetCareScore } from '@/petCareScore';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { UpgradeModal } from '@/components/subscription';
import { MonthlyReportEngine, saveMonthlyReport } from '@/services/monthlyReport';
import { exportNodeToPng, downloadBlob } from '@/utils/imageExport';
import { eventTracker } from '@/analytics/EventTracker';
import { ROUTES } from '@/routes/paths';
import styles from './MonthlyReportPage.module.css';

function currentMonthKey(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${mm}`;
}

export function MonthlyReportPage() {
  const { user } = useAuth();
  const { activePet, isLoading: petsLoading, hasPets } = usePets();
  const { reminders, isLoading: remindersLoading } = useReminders();
  const { records: healthRecords, isLoading: healthLoading } = useHealthRecords();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { data: scoreData, isLoading: scoreLoading } = usePetCareScore();
  const { checkIns } = useDailyCheckIn();
  const { isPremium } = useSubscription();

  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const isLoading = petsLoading || remindersLoading || healthLoading || docsLoading || scoreLoading;

  const report = useMemo(() => {
    if (!activePet) return null;
    const history = scoreData?.history
      ? scoreData.history
          .filter((p) => /\d{4}-\d{2}-\d{2}/.test(p.date))
          .map((p) => ({ date: p.date, score: p.score }))
      : [];

    return MonthlyReportEngine({
      petId: activePet.id,
      petName: activePet.name,
      monthKey,
      reminders,
      healthRecords,
      documents,
      dailyCheckIns: checkIns,
      petCareScoreHistory: history,
    });
  }, [activePet, monthKey, reminders, healthRecords, documents, checkIns, scoreData?.history]);

  useEffect(() => {
    if (report && user?.id) {
      eventTracker.track('monthly_report_generated', {
        monthKey: report.monthKey,
        petId: report.petId,
      });
    }
  }, [report?.id, user?.id]);

  const handleDownload = async () => {
    if (!report || !reportRef.current) return;
    if (!isPremium) {
      setUpgradeOpen(true);
      return;
    }
    setIsDownloading(true);
    setError(null);
    try {
      const blob = await exportNodeToPng(reportRef.current, 2);
      await downloadBlob(blob, `petclues-${report.petName}-${report.monthKey}.png`);
      eventTracker.track('monthly_report_downloaded', { monthKey: report.monthKey, petId: report.petId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;
    setError(null);

    const text = `${report.petName}'s PetClues Monthly Life Report · ${report.monthLabel}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'PetClues Monthly Report', text });
        return;
      }
    } catch {
      // fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError('Unable to share on this device. Try downloading instead.');
    }
  };

  const handleSave = async () => {
    if (!report || !user?.id) return;
    setIsSaving(true);
    setError(null);
    try {
      saveMonthlyReport(user.id, report);
      setSaved(true);
      eventTracker.track('monthly_report_saved', { monthKey: report.monthKey, petId: report.petId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.loadingWrap}>
            <LoadingState message="Generating your monthly report" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <PageHeroBand
            image={PAGE_IMG.app.monthlyReport}
            imageAlt=""
            eyebrow="Monthly life report"
            title="Monthly Pet Life Report"
            subtitle="Add a pet to start capturing shareable monthly stories from your care activity."
          />
          <div className={styles.emptyWrap}>
            <EmptyState
              title="Add a pet to get started"
              description="Monthly life reports are built from your pet's care activity. Create a profile first, then return here."
              action={
                <Link to={ROUTES.PET_PROFILE}>
                  <Button variant="primary">Go to pet profile</Button>
                </Link>
              }
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        {report && (
          <PageHeroBand
            image={PAGE_IMG.app.monthlyReport}
            imageAlt=""
            eyebrow="PetClues · Monthly life report"
            title={`${report.petName}'s ${report.monthLabel}`}
            subtitle="A visual story of care, consistency, and milestones."
          />
        )}

        <div className={styles.toolbar}>
          <MonthPicker monthKey={monthKey} onChange={(mk) => { setMonthKey(mk); setSaved(false); }} />
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </div>

        {report && (
          <div className={styles.layout}>
            <div className={styles.reportCol}>
              <SectionIntro
                eyebrow="This month"
                title="Your pet's life report"
                description="Scroll through every chapter below — download captures the full report when you're ready to share."
              />
              <MonthlyReportDocument ref={reportRef} report={report} />
              <p className={styles.caption}>
                Download captures the full report above — scroll through every chapter before exporting.
              </p>
            </div>

            <aside className={styles.sideCol} aria-label="Report actions">
              <MonthlyReportActions
                onShare={() => void handleShare()}
                onDownload={() => void handleDownload()}
                onSave={() => void handleSave()}
                isDownloading={isDownloading}
                isSaving={isSaving}
                saved={saved}
                isPremium={isPremium}
              />
              <Card variant="flat" className={styles.archiveCard}>
                <h3 className={styles.archiveTitle}>Archive</h3>
                <p className={styles.archiveText}>
                  Save reports each month to build a beautiful story you can revisit anytime.
                </p>
                <Link to={ROUTES.MONTHLY_REPORT_ARCHIVE}>
                  <Button variant="secondary">View archive</Button>
                </Link>
              </Card>
            </aside>
          </div>
        )}

        <HealthDisclaimerNote />

        <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </div>
    </AppLayout>
  );
}
