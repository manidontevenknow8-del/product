import { useEffect, useMemo } from 'react';
import { capturePostHogEvent } from '@/analytics/posthog';
import { AppLayout } from '@/layouts/AppLayout';
import { EmptyDashboardState } from '@/components/empty-states';
import { usePets } from '@/pets';
import { useReminders } from '@/reminders';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { usePetCareScore } from '@/petCareScore';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { getActivityLogForPet } from '@/services/activity/activityLogService';
import { MonthlyReportEngine } from '@/services/monthlyReport';
import { pickDashboardNextTask } from '@/services/dashboard/dashboardNextTask';
import {
  activityToMoments,
  completenessMetrics,
} from '@/services/dashboard/dashboardMoments';
import { countOverdueReminders } from '@/services/dashboard/dashboardStatus';
import { isDemoDataEnabled } from '@/data/demoData';
import { mockRecentActivity } from '@/data/dashboardData';
import type { ActivityLogEntry } from '@/services/activity/activityLogService';
import { petRecordToPet } from '@/services/pets/petService';
import { getTrendLabel } from '@/utils/petCareScoreUtils';
import { DashboardNav } from '@/pages/dashboard/components/DashboardNav';
import { DashboardHero } from '@/pages/dashboard/components/DashboardHero';
import { SummaryBand } from '@/pages/dashboard/components/SummaryBand';
import { AttentionNow } from '@/pages/dashboard/components/AttentionNow';
import { RitualSection } from '@/pages/dashboard/components/RitualSection';
import { CareIntelligence } from '@/pages/dashboard/components/CareIntelligence';
import { ConciergeStrip } from '@/pages/dashboard/components/ConciergeStrip';
import { ArchiveSection } from '@/pages/dashboard/components/ArchiveSection';
import { DashboardFooter } from '@/pages/dashboard/components/DashboardFooter';
import { currentMonthKey, getGreeting } from '@/pages/dashboard/utils';
import styles from './DashboardPage.module.css';

function buildStatusLine(
  overdue: number,
  score: number | null,
  checkInDone: boolean,
): string {
  if (overdue > 0) {
    return `${overdue} overdue ${overdue === 1 ? 'item' : 'items'} — review your schedule`;
  }
  if (!checkInDone) return "Today's check-in is still open";
  if (score != null && score >= 70) return `Care score ${score} — steady rhythm`;
  if (score != null) return `Care score ${score} — building momentum`;
  return 'Your care picture is taking shape';
}

export function DashboardPage() {
  const { activePet, pets, setActivePet, isLoading, hasPets } = usePets();

  useEffect(() => {
    capturePostHogEvent('dashboard_viewed');
  }, []);

  const { reminders, stats: reminderStats } = useReminders();
  const { records, healthSummary } = useHealthRecords();
  const { documents } = useDocuments();
  const { data: scoreData, isLoading: scoreLoading } = usePetCareScore();
  const { checkIns, todayCheckIn } = useDailyCheckIn();
  const { currentPlan } = useSubscription();
  const timelineAccess = useFeatureAccess('timelineHistory');
  const decoderAccess = useFeatureAccess('vetBillDecoder');
  const isEnterprise = currentPlan === 'enterprise';
  const isMonthlyDecoderQuota = currentPlan === 'plus' || currentPlan === 'pro';

  const petId = activePet?.id;
  const petReminders = useMemo(
    () => (petId ? reminders.filter((r) => r.petId === petId) : []),
    [reminders, petId],
  );
  const petRecords = useMemo(
    () => (petId ? records.filter((r) => r.petId === petId) : []),
    [records, petId],
  );
  const petDocuments = useMemo(
    () => (petId ? documents.filter((d) => d.petId === petId) : []),
    [documents, petId],
  );

  const monthKey = currentMonthKey();
  const monthlyReport = useMemo(() => {
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
      reminders: petReminders,
      healthRecords: petRecords,
      documents: petDocuments,
      dailyCheckIns: checkIns,
      petCareScoreHistory: history,
    });
  }, [activePet, monthKey, petReminders, petRecords, petDocuments, checkIns, scoreData?.history]);

  const upcomingReminders = useMemo(
    () =>
      [...petReminders]
        .filter((r) => !r.completedAt)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 3),
    [petReminders],
  );

  if (isLoading) {
    return (
      <AppLayout flushContent hideChrome>
        <div className={styles.page}>
          <DashboardNav pets={[]} activePetId="" onSelectPet={() => {}} />
          <div className={styles.loadingHero}>
            <p className={styles.loadingText}>Opening your command center…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet || !monthlyReport) {
    return (
      <AppLayout flushContent hideChrome>
        <div className={styles.page}>
          <DashboardNav pets={[]} activePetId="" onSelectPet={() => {}} />
          <div className={styles.emptyHero}>
            <p className={styles.sectionEyebrowGold}>Welcome</p>
            <h1 className={styles.emptyHeroTitle}>Begin the record</h1>
            <p className={styles.emptyHeroLead}>
              Add your first pet to unlock reminders, health history, and your personalized care
              command center.
            </p>
          </div>
          <div className={styles.chapterInner}>
            <EmptyDashboardState />
          </div>
          <DashboardFooter />
        </div>
      </AppLayout>
    );
  }

  const display = petRecordToPet(activePet);
  const meta = [
    display.age !== 'Age not set' ? display.age : null,
    display.breed,
    healthSummary.latestWeight ?? activePet.weight,
  ]
    .filter(Boolean)
    .join(' · ');

  const overdueCount = countOverdueReminders(petReminders);
  const upcomingCount = reminderStats.upcoming + reminderStats.dueToday;
  const score = scoreData?.snapshot.score ?? null;
  const careMetrics = completenessMetrics({
    healthRecords: petRecords.length,
    documents: petDocuments.length,
    overdueCount,
    hasVaccination: petRecords.some((r) => r.recordType === 'vaccination'),
    profileHasPhoto: Boolean(activePet.photoUrl),
  });
  const trendText = scoreData
    ? getTrendLabel(scoreData.snapshot.trend, scoreData.snapshot.trendDelta)
    : '';
  const nextTask = pickDashboardNextTask({
    reminders: petReminders,
    documents: petDocuments,
    healthRecords: petRecords,
  });

  const insightTitle = scoreData?.weeklyInsight?.title ?? 'Care signal';
  const insightBody =
    scoreData?.weeklyInsight?.message ??
    scoreData?.insights[0]?.message ??
    'Add a health record or document — we surface one clear insight from your real data.';

  const activityEntries: ActivityLogEntry[] = isDemoDataEnabled('dashboardActivity')
    ? mockRecentActivity.map((item, index) => {
        const daysAgo = index * 12;
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        return {
          id: item.id,
          petId: activePet.id,
          type: item.type,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp,
          createdAt,
        };
      })
    : getActivityLogForPet(activePet.id, 24);
  const moments = activityToMoments(activityEntries);

  const weightRaw =
    todayCheckIn?.weightKg != null
      ? `${todayCheckIn.weightKg} kg`
      : healthSummary.latestWeight ?? activePet.weight;

  const checkInDone = Boolean(todayCheckIn && !isLoading);
  const statusLine = buildStatusLine(overdueCount, score, checkInDone);

  return (
    <AppLayout flushContent hideChrome>
      <div className={styles.page}>
        <DashboardNav
          pets={pets}
          activePetId={activePet.id}
          onSelectPet={setActivePet}
          overHero
        />

        <DashboardHero
          greeting={getGreeting()}
          petName={display.name}
          meta={meta}
          statusLine={statusLine}
          checkInDone={checkInDone}
          pets={pets}
          activePetId={activePet.id}
          onSelectPet={setActivePet}
          photoUrl={activePet.photoUrl}
        />

        <SummaryBand
          overdue={overdueCount}
          upcoming={upcomingCount}
          score={score}
          weight={weightRaw}
        />

        <AttentionNow petName={display.name} task={nextTask} />

        <RitualSection petName={activePet.name} />

        <CareIntelligence
          petName={display.name}
          metrics={careMetrics}
          score={score}
          scoreLabel={scoreData?.snapshot.label}
          trendText={trendText}
          isLoading={scoreLoading}
          report={monthlyReport}
          insightTitle={insightTitle}
          insightBody={insightBody}
          scoreLoading={scoreLoading}
          upcomingReminders={upcomingReminders}
        />

        <ConciergeStrip
          decoderAccess={decoderAccess}
          isEnterprise={isEnterprise}
          isMonthlyDecoderQuota={isMonthlyDecoderQuota}
        />

        <ArchiveSection
          moments={moments}
          documents={petDocuments}
          timelineAccess={timelineAccess}
        />

        <DashboardFooter />
      </div>
    </AppLayout>
  );
}
