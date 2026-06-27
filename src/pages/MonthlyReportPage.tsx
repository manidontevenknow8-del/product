import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import {
  MonthPicker,
  MonthlyReportActions,
  MonthlyReportDocument,
} from '@/components/monthly-report';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { PetSwitcherHero } from '@/components/pets';
import { useReminders } from '@/reminders';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { usePetCareScore } from '@/petCareScore';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { PremiumUpgradePrompt, UpgradeModal } from '@/components/subscription';
import { MonthlyReportEngine, saveMonthlyReport } from '@/services/monthlyReport';
import { exportNodeToPng, downloadBlob } from '@/utils/imageExport';
import { eventTracker } from '@/analytics/EventTracker';
import { ROUTES } from '@/routes/paths';
import styles from './MonthlyReportPage.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

function currentMonthKey(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${mm}`;
}

export function MonthlyReportPage() {
  const { user } = useAuth();
  const { activePet, pets, setActivePet, isLoading: petsLoading, hasPets } = usePets();
  const { reminders, isLoading: remindersLoading } = useReminders();
  const { records: healthRecords, isLoading: healthLoading } = useHealthRecords();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { data: scoreData, isLoading: scoreLoading } = usePetCareScore();
  const { checkIns } = useDailyCheckIn();
  const { canAccess, currentPlan } = useSubscription();
  const canExport = canAccess('monthlyReportExport');

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
    if (!canExport) {
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
      setError(getUserFacingError(err, 'export', 'Download failed'));
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
      setError(getUserFacingError(err, 'generic', 'Save failed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className="ed-page">
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
        <div className="ed-page">
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

  const heroBg = resolvePetHeroBackground(activePet.photoUrl);
  const heroSrc = heroBg.isPetPhoto ? heroBg.src : PAGE_IMG.app.monthlyReport;
  const heroPhoto = normalizePhotoUrlFromDb(activePet.photoUrl);

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
              <PetSwitcherHero pets={pets} activeId={activePet.id} onSelect={setActivePet} />
            </div>
            <div className="ed-hero__grid">
              <div className="ed-hero__text">
                <p className="ed-hero__kicker">PetClues · Monthly life report</p>
                <h1 className="ed-hero__title">
                  {report ? `${report.petName}'s ${report.monthLabel}` : 'Monthly life report'}
                </h1>
                <p className="ed-hero__subtitle">
                  A visual story of care, consistency, and the small milestones that add up to a
                  well-loved life.
                </p>
                <div className="ed-hero__cta">
                  <button
                    type="button"
                    className="ed-btn"
                    onClick={() => void handleDownload()}
                    disabled={isDownloading}
                  >
                    {isDownloading ? 'Preparing…' : 'Download report'}
                  </button>
                  <a href="#report" className="ed-btn-ghost">
                    Read the story
                  </a>
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

        <div className={styles.toolbar}>
          <div className={styles.toolbarInner}>
            <MonthPicker
              monthKey={monthKey}
              onChange={(mk) => {
                setMonthKey(mk);
                setSaved(false);
              }}
            />
            <MonthlyReportActions
              onShare={() => void handleShare()}
              onDownload={() => void handleDownload()}
              onSave={() => void handleSave()}
              isDownloading={isDownloading}
              isSaving={isSaving}
              saved={saved}
              isPremium={canExport}
            />
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
          </div>
        </div>

        {report && (
          <div className="ed-body">
            {!canExport && (
              <PremiumUpgradePrompt
                feature="monthlyReportExport"
                currentPlan={currentPlan}
                onUpgrade={() => setUpgradeOpen(true)}
              />
            )}

            <section className="ed-chapter" id="report" aria-label="Monthly report">
              <div className={styles.reportFrame}>
                <MonthlyReportDocument
                  ref={reportRef}
                  report={report}
                  showWatermark={currentPlan === 'free'}
                />
                <p className={styles.caption}>
                  Download captures the full report above — scroll through every chapter before
                  exporting.
                </p>
              </div>
            </section>

            <section className="ed-band" aria-label="Archive">
              <div className="ed-band__texture" aria-hidden />
              <span className="ed-band__watermark" aria-hidden>
                Archive
              </span>
              <div className="ed-band__inner">
                <p className="ed-eyebrow">Build the collection</p>
                <h2 className="ed-band__title">A library of months, beautifully kept</h2>
                <p className="ed-band__text">
                  Save a report each month to build a story of {report.petName}&apos;s life you can
                  revisit any time.
                </p>
                <div className={styles.archiveActions}>
                  <Link to={ROUTES.MONTHLY_REPORT_ARCHIVE} className="ed-btn">
                    View archive
                  </Link>
                </div>
              </div>
            </section>

            <footer className="ed-footnote">
              <hr />
              <HealthDisclaimerNote compact />
            </footer>
          </div>
        )}

        <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </div>
    </AppLayout>
  );
}
