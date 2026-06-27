import { useEffect, useMemo, useState } from 'react';
import { capturePostHogEvent } from '@/analytics/posthog';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { EditorialUpgradeModal } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { EmptyDashboardState } from '@/components/empty-states';
import { DashboardHeaderLoading } from '@/components/dashboard';
import { usePets } from '@/pets';
import { useReminders } from '@/reminders';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { usePetCareScore } from '@/petCareScore';
import { DailyCheckInCard } from '@/components/daily-check-in';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { PremiumGate } from '@/components/ui';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import type { FeatureAccessResult } from '@/subscription/planLimits';
import { getActivityLogForPet } from '@/services/activity/activityLogService';
import { MonthlyReportEngine } from '@/services/monthlyReport';
import { pickDashboardNextTask } from '@/services/dashboard/dashboardNextTask';
import type { DashboardNextTask } from '@/services/dashboard/dashboardNextTask';
import {
  activityToMoments,
  completenessMetrics,
  heroStatusChip,
  partitionMomentsByHistoryWindow,
} from '@/services/dashboard/dashboardMoments';
import type { DashboardMoment } from '@/services/dashboard/dashboardMoments';
import { countOverdueReminders } from '@/services/dashboard/dashboardStatus';
import { isDemoDataEnabled } from '@/data/demoData';
import { mockRecentActivity } from '@/data/dashboardData';
import type { ActivityLogEntry } from '@/services/activity/activityLogService';
import { petRecordToPet } from '@/services/pets/petService';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { getAvatarInitials } from '@/services/pets/petUtils';
import { getTrendLabel } from '@/utils/petCareScoreUtils';
import { ROUTES } from '@/routes/paths';
import type { MonthlyPetLifeReport } from '@/types/monthlyReport';
import type { PetRecord } from '@/services/pets/petTypes';
import styles from './DashboardPage.module.css';

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const TASK_DUE: Record<DashboardNextTask['urgency'], string> = {
  overdue: styles.dueOverdue,
  today: styles.dueToday,
  soon: styles.dueSoon,
  setup: styles.dueSetup,
  calm: styles.dueCalm,
};

const CHIP_CLASS = {
  calm: styles.chipCalm,
  great: styles.chipGreat,
  attention: styles.chipAttention,
} as const;

function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamp(score) / 100) * c;

  return (
    <svg className={styles.ringSvg} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <linearGradient id="lux-score-arc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8833A" />
          <stop offset="100%" stopColor="#1C2B1D" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#DDD5C8" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#lux-score-arc)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function StatValueDisplay({ value, warn }: { value: string; warn?: boolean }) {
  const kgMatch = value.match(/^([\d.]+)\s*kg$/i);
  const valueClass = `${styles.statValue}${warn ? ` ${styles.statValueWarn}` : ''}`;
  if (kgMatch) {
    return (
      <span className={valueClass}>
        {kgMatch[1]} <span className={styles.statUnit}>kg</span>
      </span>
    );
  }
  return <span className={valueClass}>{value}</span>;
}

function PetStack({
  pets,
  activeId,
  onSelect,
}: {
  pets: PetRecord[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (pets.length <= 1) return null;

  return (
    <div className={styles.petStack} role="tablist" aria-label="Switch pet">
      {pets.map((pet, index) => (
        <button
          key={pet.id}
          type="button"
          role="tab"
          aria-selected={pet.id === activeId}
          aria-label={pet.name}
          title={pet.name}
          style={{ zIndex: index + 1 }}
          onClick={() => onSelect(pet.id)}
          className={`${styles.petStackBtn} ${pet.id === activeId ? styles.petStackBtnActive : ''}`}
        >
          {pet.photoUrl ? (
            <img src={pet.photoUrl} alt="" className={styles.petStackImg} />
          ) : (
            <span className={styles.petStackInitials}>{getAvatarInitials(pet.name)}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function AddPetGhostButton() {
  const navigate = useNavigate();
  const { pets } = usePets();
  const petAccess = useFeatureAccess('pets');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (pets.length === 0) return null;

  const handleClick = () => {
    if (petAccess.isAllowed) {
      navigate(`${ROUTES.ONBOARDING}?add=true`);
      return;
    }
    setUpgradeOpen(true);
  };

  return (
    <>
      <button type="button" className={styles.heroGhostBtn} onClick={handleClick}>
        Add another pet
      </button>
      <EditorialUpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        eyebrow="PetClues Plus"
        title="Your family is growing"
        description="Upgrade to Plus to manage up to 3 pets and unlock unlimited care history."
        requiredTier="Plus"
      />
    </>
  );
}

function DashboardSectionIntro({
  eyebrow,
  title,
  lead,
  titleId,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  titleId?: string;
}) {
  return (
    <header className={styles.sectionIntro}>
      <p className={styles.sectionKicker}>{eyebrow}</p>
      <h2 id={titleId} className={styles.sectionTitle}>
        {title}
      </h2>
      {lead && <p className={styles.sectionLead}>{lead}</p>}
    </header>
  );
}

function StatsBand({
  upcoming,
  overdue,
  score,
  weight,
}: {
  upcoming: number;
  overdue: number;
  score: number | null;
  weight: string | null;
}) {
  return (
    <div className={styles.statsBand} data-reveal aria-label="Care summary">
      <div className={styles.statsBandInner}>
        <div className={styles.statCell}>
          <StatValueDisplay value={String(overdue)} warn={overdue > 0} />
          <span className={styles.statLabel}>Overdue</span>
        </div>
        <div className={styles.statCell}>
          <StatValueDisplay value={String(upcoming)} />
          <span className={styles.statLabel}>Upcoming</span>
        </div>
        <div className={styles.statCell}>
          <StatValueDisplay value={score != null ? String(score) : '—'} />
          <span className={styles.statLabel}>Care score</span>
        </div>
        <div className={styles.statCell}>
          <StatValueDisplay value={weight ?? '—'} />
          <span className={styles.statLabel}>Weight</span>
        </div>
      </div>
    </div>
  );
}

function CareScoreCard({
  metrics,
  score,
  scoreLabel,
  trendText,
  isLoading,
  showProDepth,
  ringSize = 140,
}: {
  metrics: { id: string; label: string; value: number }[];
  score: number | null;
  scoreLabel?: string;
  trendText: string;
  isLoading: boolean;
  showProDepth: boolean;
  ringSize?: number;
}) {
  return (
    <article className={styles.scoreCard}>
      <div className={styles.scoreCardHeadRow}>
        <h3 className={styles.scoreCardHead}>Care score</h3>
        {showProDepth && <span className={styles.proBadge}>Deeper · Pro</span>}
      </div>
      {isLoading || score == null ? (
        <p className={styles.loadingText}>Calculating your care picture…</p>
      ) : (
        <>
          <div className={styles.scoreRow}>
            <div className={styles.ringWrap}>
              <ScoreRing score={score} size={ringSize} />
              <div className={styles.ringCenter}>
                <span className={styles.ringScore}>{score}</span>
                {scoreLabel && <span className={styles.ringLabel}>{scoreLabel}</span>}
              </div>
            </div>
            <div className={styles.careBars}>
              {metrics.map((m) => (
                <div key={m.id} className={styles.metricRow}>
                  <div className={styles.metricHead}>
                    <span className={styles.metricLabel}>{m.label}</span>
                    <span className={styles.metricPct}>{m.value}%</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${clamp(m.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {trendText && <p className={styles.trend}>{trendText}</p>}
          <Link to={ROUTES.PET_CARE_SCORE} className={styles.textLink}>
            View full breakdown →
          </Link>
        </>
      )}
    </article>
  );
}

function MomentsListItems({ moments }: { moments: DashboardMoment[] }) {
  return (
    <>
      {moments.map((m) => (
        <li key={m.id} className={styles.momentItem}>
          <div className={styles.momentRail}>
            <span className={styles.momentDot} aria-hidden />
          </div>
          <div className={styles.momentBody}>
            <div className={styles.momentTop}>
              <p className={styles.momentTitle}>{m.title}</p>
              <time className={styles.momentWhen} dateTime={m.occurredAt}>
                {m.when}
              </time>
            </div>
            <p className={styles.momentDesc}>{m.description}</p>
          </div>
        </li>
      ))}
    </>
  );
}

function RecentMomentsSection({
  moments,
  timelineAccess,
}: {
  moments: DashboardMoment[];
  timelineAccess: FeatureAccessResult;
}) {
  const { recentMoments, historicalMoments } = partitionMomentsByHistoryWindow(moments);

  if (moments.length === 0) {
    return (
      <article className={styles.emptyMoments}>
        <img src={PAGE_IMG.app.timeline} alt="" className={styles.emptyMomentsImg} aria-hidden />
        <p className={styles.emptyTitle}>Your pet&apos;s story will start here.</p>
        <p className={styles.emptyDesc}>
          Vaccinations, reminders, and milestones appear as you care for them.
        </p>
        <Link to={ROUTES.TIMELINE} className={styles.textLink}>
          Open timeline →
        </Link>
      </article>
    );
  }

  return (
    <div className={styles.momentsWrap}>
      <div className={styles.timelineSpine} aria-hidden />
      <ul className={styles.momentsList}>
        <MomentsListItems moments={recentMoments} />
        {timelineAccess.isAllowed && historicalMoments.length > 0 && (
          <MomentsListItems moments={historicalMoments} />
        )}
      </ul>
      {!timelineAccess.isAllowed && historicalMoments.length > 0 && (
        <div className={`${styles.momentsHistorical} ${styles.momentsHistoricalFade}`}>
          <PremiumGate
            requiredTier="Plus"
            title="Unblur your pet's history"
            description="Upgrade to Plus to unlock your pet's complete, permanent life story and past medical events."
            className={styles.momentsPremiumGate}
          >
            <ul className={styles.momentsList} aria-hidden>
              <MomentsListItems moments={historicalMoments} />
            </ul>
          </PremiumGate>
        </div>
      )}
    </div>
  );
}

function CareInsightAside({
  aiAccess,
  title,
  body,
  isLoading,
}: {
  aiAccess: FeatureAccessResult;
  title: string;
  body: string;
  isLoading: boolean;
}) {
  return (
    <PremiumGate
      requiredTier="Pro"
      title="Health Foresight"
      description="Advanced medical summarization and predictive patterns are available exclusively in Pro."
      className={styles.insightAsideGate}
    >
      <article className={styles.insightAside}>
        <span className={styles.insightSpark}>
          {aiAccess.isAllowed ? 'Pro insight' : 'Care signal'}
        </span>
        <h3 className={styles.asideTitle}>{title}</h3>
        {isLoading ? (
          <p className={styles.loadingText}>Reading your care data…</p>
        ) : (
          <p className={styles.asideText}>{body}</p>
        )}
        <Link to={ROUTES.PET_CARE_SCORE} className={styles.asideLink}>
          Open foresight →
        </Link>
      </article>
    </PremiumGate>
  );
}

function CareOverviewBlock({
  metrics,
  score,
  scoreLabel,
  trendText,
  isLoading,
  showProDepth,
  report,
  exportIsPro,
  aiAccess,
  insightTitle,
  insightBody,
  scoreLoading,
}: {
  metrics: { id: string; label: string; value: number }[];
  score: number | null;
  scoreLabel?: string;
  trendText: string;
  isLoading: boolean;
  showProDepth: boolean;
  report: MonthlyPetLifeReport;
  exportIsPro: boolean;
  aiAccess: FeatureAccessResult;
  insightTitle: string;
  insightBody: string;
  scoreLoading: boolean;
}) {
  return (
    <div className={styles.careOverview}>
      <div className={styles.carePrimary}>
        <CareScoreCard
          metrics={metrics}
          score={score}
          scoreLabel={scoreLabel}
          trendText={trendText}
          isLoading={isLoading}
          showProDepth={showProDepth}
          ringSize={168}
        />
      </div>
      <aside className={styles.careAside} aria-label="Care highlights">
        <MonthlyPreviewCard report={report} exportIsPro={exportIsPro} />
        <CareInsightAside
          aiAccess={aiAccess}
          title={insightTitle}
          body={insightBody}
          isLoading={scoreLoading}
        />
      </aside>
    </div>
  );
}

function MonthlyPreviewCard({
  report,
  exportIsPro,
}: {
  report: MonthlyPetLifeReport;
  exportIsPro: boolean;
}) {
  const metrics = report.metrics.slice(0, 3);

  return (
    <article className={styles.monthCard}>
      <div className={styles.monthContent}>
        <p className={styles.monthKicker}>{report.monthLabel.toUpperCase()}</p>
        <h3 className={styles.monthTitle}>{report.petName}&apos;s month</h3>
        <div className={styles.monthMetrics}>
          {metrics.map((m) => (
            <div key={m.label}>
              <p className={styles.monthMetricValue}>{m.value}</p>
              <p className={styles.monthMetricLabel}>{m.label}</p>
            </div>
          ))}
        </div>
        <div className={styles.monthFooter}>
          <Link to={ROUTES.MONTHLY_REPORT} className={styles.monthCta}>
            View report →
          </Link>
          {exportIsPro && <span className={styles.proBadgeLight}>Export · Pro</span>}
        </div>
      </div>
    </article>
  );
}

const QUICK_ACTIONS = [
  { id: 'record', label: 'Add record', path: ROUTES.PET_PROFILE, image: PAGE_IMG.profile.health },
  { id: 'document', label: 'Upload document', path: ROUTES.SCAN, image: PAGE_IMG.scan.docs },
  { id: 'reminder', label: 'Create reminder', path: `${ROUTES.REMINDERS}?create=true`, image: PAGE_IMG.reminders.notify },
  { id: 'scan', label: 'Scan vet bill', path: ROUTES.SCAN, image: PAGE_IMG.scan.report, isDecoder: true },
] as const;

function decoderRemainingNote(
  decoderAccess: FeatureAccessResult,
  isEnterprise: boolean,
  isMonthlyQuota: boolean,
): string | null {
  if (isEnterprise || decoderAccess.usageLimit === 'unlimited') return null;
  const limit = decoderAccess.usageLimit;
  if (typeof limit !== 'number') return null;
  const remaining = Math.max(0, limit - decoderAccess.currentUsage);
  if (isMonthlyQuota) return `${remaining}/mo remaining`;
  return `${remaining} scan${remaining === 1 ? '' : 's'} remaining`;
}

function QuickActionsSection({
  decoderAccess,
  isEnterprise,
  isMonthlyDecoderQuota,
}: {
  decoderAccess: FeatureAccessResult;
  isEnterprise: boolean;
  isMonthlyDecoderQuota: boolean;
}) {
  const decoderNote = decoderRemainingNote(decoderAccess, isEnterprise, isMonthlyDecoderQuota);

  return (
    <div className={styles.actionsGrid}>
      {QUICK_ACTIONS.map((action) => {
        const isDecoder = 'isDecoder' in action && action.isDecoder === true;
        const locked = isDecoder && !decoderAccess.isAllowed;

        return (
          <Link
            key={action.id}
            to={
              locked
                ? `${ROUTES.PRICING}?plan=pro`
                : action.path
            }
            className={`${styles.actionCard} ${locked ? styles.actionCardLocked : ''}`}
            aria-disabled={locked || undefined}
          >
            <div className={styles.actionThumb}>
              <img src={action.image} alt="" className={styles.actionThumbImg} aria-hidden />
              <div className={styles.actionThumbScrim} aria-hidden />
            </div>
            <div className={styles.actionBody}>
              <span className={styles.actionLabel}>{action.label}</span>
              {isDecoder && decoderNote ? (
                <span className={styles.actionNote}>{decoderNote}</span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
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
  const { canAccess, currentPlan } = useSubscription();
  const timelineAccess = useFeatureAccess('timelineHistory');
  const aiAccess = useFeatureAccess('aiHealthInsights');
  const decoderAccess = useFeatureAccess('vetBillDecoder');
  const canExportReport = canAccess('monthlyReportExport');
  const hasAdvancedScore = canAccess('advancedPetCareScore');
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

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.heroWrap}>
            <header className={styles.hero}>
              <img className={styles.heroBg} src={PAGE_IMG.app.hero} alt="" aria-hidden />
              <div className={styles.heroWash} aria-hidden />
              <div className={styles.heroFade} aria-hidden />
              <div className={styles.heroTexture} aria-hidden />
              <div className={styles.heroInner}>
                <p className={styles.heroEyebrow}>Dashboard</p>
                <h1 className={styles.heroTitle}>Loading your care hub…</h1>
              </div>
            </header>
          </div>
          <div className={styles.body}>
            <DashboardHeaderLoading />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet || !monthlyReport) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.heroWrap}>
            <header className={styles.hero}>
              <img className={styles.heroBg} src={PAGE_IMG.app.hero} alt="" aria-hidden />
              <div className={styles.heroWash} aria-hidden />
              <div className={styles.heroFade} aria-hidden />
              <div className={styles.heroTexture} aria-hidden />
              <div className={styles.heroInner}>
                <p className={styles.heroEyebrow}>Your dashboard</p>
                <h1 className={styles.heroTitle}>Welcome to PetClues</h1>
                <p className={styles.heroLead}>
                  Add your first pet to unlock reminders, health records, and your personalized care
                  dashboard.
                </p>
              </div>
            </header>
          </div>
          <div className={styles.body}>
            <EmptyDashboardState />
          </div>
        </div>
      </AppLayout>
    );
  }

  const display = petRecordToPet(activePet);
  const meta = [
    display.breed,
    display.age !== 'Age not set' ? display.age : null,
    display.species,
    healthSummary.latestWeight ?? activePet.weight,
  ]
    .filter(Boolean)
    .join(' · ');

  const overdueCount = countOverdueReminders(petReminders);
  const upcomingCount = reminderStats.upcoming + reminderStats.dueToday;
  const score = scoreData?.snapshot.score ?? null;
  const nextTask = pickDashboardNextTask({
    reminders: petReminders,
    documents: petDocuments,
    healthRecords: petRecords,
  });
  const careMetrics = completenessMetrics({
    healthRecords: petRecords.length,
    documents: petDocuments.length,
    overdueCount,
    hasVaccination: petRecords.some((r) => r.recordType === 'vaccination'),
    profileHasPhoto: Boolean(activePet.photoUrl),
  });
  const chip = heroStatusChip({ overdueCount, score });
  const trendText = scoreData
    ? getTrendLabel(scoreData.snapshot.trend, scoreData.snapshot.trendDelta)
    : '';

  const insightTitle = scoreData?.weeklyInsight?.title ?? 'Care insight';
  const insightBody =
    scoreData?.weeklyInsight?.message ??
    scoreData?.insights[0]?.message ??
    'Add a health record or document - we surface one clear insight from your real data.';

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
  const heroBackground = resolvePetHeroBackground(activePet.photoUrl);

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <div className={styles.heroWrap}>
          <header className={styles.hero}>
            <img
              className={`${styles.heroBg} ${heroBackground.isPetPhoto ? styles.heroBgPet : ''}`}
              src={heroBackground.src}
              alt=""
              aria-hidden
            />
            <div className={styles.heroWash} aria-hidden />
            <div className={styles.heroFade} aria-hidden />
            <div className={styles.heroTexture} aria-hidden />
            <div className={styles.heroInner}>
              <div className={styles.heroTopRow}>
                <PetStack pets={pets} activeId={activePet.id} onSelect={setActivePet} />
                <AddPetGhostButton />
              </div>

              <div className={styles.heroCoverGrid}>
                <div className={styles.heroCoverText}>
                  <p className={styles.heroEyebrow}>{getGreeting()}</p>
                  <h1 className={styles.heroTitle}>{display.name}</h1>
                  {meta && <p className={styles.heroMeta}>{meta}</p>}
                  <div className={styles.heroBadges}>
                    <span className={`${styles.statusChip} ${CHIP_CLASS[chip.tone]}`}>
                      {chip.label}
                    </span>
                    <span className={styles.heroUpdated}>Updated today</span>
                  </div>
                  <div className={styles.heroCtaRow}>
                    <Link to={nextTask.ctaPath} className={styles.heroPrimaryCta}>
                      {nextTask.ctaLabel}
                    </Link>
                    <Link to={ROUTES.TIMELINE} className={styles.heroSecondaryCta}>
                      View timeline
                    </Link>
                  </div>
                  {!nextTask.isPositive && nextTask.dueLabel && (
                    <p className={styles.heroTaskNote}>
                      <span className={`${styles.dueBadge} ${TASK_DUE[nextTask.urgency]}`}>
                        {nextTask.dueLabel}
                      </span>
                      {' · '}
                      {nextTask.title}
                    </p>
                  )}
                </div>

                {(display.photo || heroBackground.isPetPhoto) && (
                  <div className={styles.heroPortraitFrame} aria-hidden>
                    <img
                      src={display.photo ?? heroBackground.src}
                      alt=""
                      className={styles.heroPortraitImg}
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          <StatsBand
            upcoming={upcomingCount}
            overdue={overdueCount}
            score={score}
            weight={
              todayCheckIn?.weightKg != null
                ? `${todayCheckIn.weightKg} kg`
                : healthSummary.latestWeight ?? activePet.weight
            }
          />
        </div>

        <div className={styles.body}>
          <section className={styles.chapter} data-reveal aria-labelledby="chapter-checkin">
            <DashboardSectionIntro
              titleId="chapter-checkin"
              eyebrow="Today"
              title="Daily check-in"
              lead="A quiet ritual — log feeding, walks, and weight to keep the story current."
            />
            <div className={styles.majorBlock}>
              <DailyCheckInCard petName={activePet.name} />
            </div>
          </section>

          <section className={styles.chapter} data-reveal aria-labelledby="chapter-care">
            <DashboardSectionIntro
              titleId="chapter-care"
              eyebrow="Care portrait"
              title={`How ${display.name} is doing`}
              lead="Score, rhythm, and the signal we see from your real records."
            />
            <CareOverviewBlock
              metrics={careMetrics}
              score={score}
              scoreLabel={scoreData?.snapshot.label}
              trendText={trendText}
              isLoading={scoreLoading}
              showProDepth={!hasAdvancedScore}
              report={monthlyReport}
              exportIsPro={!canExportReport}
              aiAccess={aiAccess}
              insightTitle={insightTitle}
              insightBody={insightBody}
              scoreLoading={scoreLoading}
            />
          </section>

          <section className={styles.chapter} data-reveal aria-labelledby="chapter-paths">
            <DashboardSectionIntro
              titleId="chapter-paths"
              eyebrow="Curated paths"
              title="Continue the story"
              lead="Every record, document, and reminder becomes part of your pet's living archive."
            />
            <QuickActionsSection
              decoderAccess={decoderAccess}
              isEnterprise={isEnterprise}
              isMonthlyDecoderQuota={isMonthlyDecoderQuota}
            />
          </section>

          <section className={styles.chapter} data-reveal aria-labelledby="chapter-activity">
            <DashboardSectionIntro
              titleId="chapter-activity"
              eyebrow="The story so far"
              title="Recent moments"
              lead="Vaccinations, uploads, reminders, and milestones from your pet's care journey."
            />
            <RecentMomentsSection moments={moments} timelineAccess={timelineAccess} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
