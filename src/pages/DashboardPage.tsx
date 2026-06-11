import { useEffect, useMemo } from 'react';
import { capturePostHogEvent } from '@/analytics/posthog';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { SectionIntro } from '@/components/visual';
import { Avatar } from '@/components/ui';
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
import { AddAnotherPetButton, PetSwitcherHero } from '@/components/pets';
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
import { getAvatarInitials } from '@/services/pets/petUtils';
import { getTrendLabel } from '@/utils/petCareScoreUtils';
import { ROUTES } from '@/routes/paths';
import type { MonthlyPetLifeReport } from '@/types/monthlyReport';
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

const TASK_IMAGE: Record<DashboardNextTask['urgency'], string> = {
  overdue: PAGE_IMG.reminders.vet,
  today: PAGE_IMG.reminders.notify,
  soon: PAGE_IMG.app.reminders,
  setup: PAGE_IMG.profile.health,
  calm: PAGE_IMG.app.trust,
};

const TASK_ACCENT: Record<DashboardNextTask['urgency'], string> = {
  overdue: styles.accentOverdue,
  today: styles.accentToday,
  soon: styles.accentSoon,
  setup: styles.accentSetup,
  calm: styles.accentCalm,
};

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

const MOMENT_ICON_CLASS: Record<DashboardMoment['kind'], string> = {
  vaccination: styles.iconVaccination,
  reminder: styles.iconReminder,
  document: styles.iconDocument,
  health: styles.iconHealth,
  automation: styles.iconAutomation,
  score: styles.iconScore,
  report: styles.iconReport,
  update: styles.iconUpdate,
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamp(score) / 100) * c;
  const strokeColor =
    score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <svg className={styles.ringSvg} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function StatsStrip({
  upcoming,
  overdue,
  score,
}: {
  upcoming: number;
  overdue: number;
  score: number | null;
}) {
  return (
    <div className={styles.statsStrip} aria-label="Care summary">
      <div className={`${styles.statPill} ${overdue > 0 ? styles.statWarn : ''}`}>
        <span className={styles.statValue}>{overdue}</span>
        <span className={styles.statLabel}>overdue</span>
      </div>
      <div className={styles.statPill}>
        <span className={styles.statValue}>{upcoming}</span>
        <span className={styles.statLabel}>upcoming</span>
      </div>
      <div className={styles.statPill}>
        <span className={styles.statValue}>{score ?? '-'}</span>
        <span className={styles.statLabel}>care score</span>
      </div>
    </div>
  );
}

function NextTaskCard({ task }: { task: DashboardNextTask }) {
  return (
    <article className={styles.mediaCard}>
      <div className={styles.mediaThumb}>
        <img src={TASK_IMAGE[task.urgency]} alt="" className={styles.mediaThumbImg} aria-hidden />
      </div>
      <div className={styles.mediaBody}>
        <div className={`${styles.taskAccent} ${TASK_ACCENT[task.urgency]}`} aria-hidden />
        <div className={styles.taskRow}>
          {!task.isPositive && task.dueLabel && (
            <span className={`${styles.dueBadge} ${TASK_DUE[task.urgency]}`}>{task.dueLabel}</span>
          )}
          {task.isPositive && <span className={`${styles.dueBadge} ${styles.dueCalm}`}>All clear</span>}
        </div>
        <h3 className={styles.cardTitle}>{task.title}</h3>
        <p className={styles.cardText}>{task.description}</p>
        <Link to={task.ctaPath} className={styles.ctaButton}>
          {task.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function CareScoreCard({
  metrics,
  score,
  scoreLabel,
  trendText,
  isLoading,
  showProDepth,
}: {
  metrics: { id: string; label: string; value: number }[];
  score: number | null;
  scoreLabel?: string;
  trendText: string;
  isLoading: boolean;
  showProDepth: boolean;
}) {
  return (
    <article className={styles.mediaCard}>
      <div className={styles.mediaThumb}>
        <img src={PAGE_IMG.app.score} alt="" className={styles.mediaThumbImg} aria-hidden />
      </div>
      <div className={styles.mediaBody}>
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>Care score</h3>
          {showProDepth && <span className={styles.proBadge}>Deeper · Pro</span>}
        </div>
        {isLoading || score == null ? (
          <p className={styles.loadingText}>Calculating your care picture…</p>
        ) : (
          <>
            <div className={styles.scoreRow}>
              <div className={styles.ringWrap}>
                <ScoreRing score={score} />
                <div className={styles.ringCenter}>
                  <span className={styles.ringScore}>{score}</span>
                  <span className={styles.ringLabel}>{scoreLabel}</span>
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
            <p className={styles.trend}>{trendText}</p>
            <Link to={ROUTES.PET_CARE_SCORE} className={styles.textLink}>
              View full breakdown →
            </Link>
          </>
        )}
      </div>
    </article>
  );
}

function MomentsListItems({ moments }: { moments: DashboardMoment[] }) {
  return (
    <>
      {moments.map((m) => (
        <li key={m.id} className={styles.momentItem}>
          <span className={`${styles.momentDot} ${MOMENT_ICON_CLASS[m.kind]}`} aria-hidden />
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

function AiInsightSection({
  aiAccess,
  title,
  body,
  isLoading,
  score,
  insightCount,
}: {
  aiAccess: FeatureAccessResult;
  title: string;
  body: string;
  isLoading: boolean;
  score: number | null;
  insightCount: number;
}) {
  return (
    <section className={styles.insightSection} aria-labelledby="dash-ai-insight">
      <p className={styles.sectionKicker} id="dash-ai-insight">
        Reflection
      </p>
      <PremiumGate
        requiredTier="Pro"
        title="Health Foresight"
        description="Advanced medical summarization and predictive patterns are available exclusively in Pro."
        className={styles.insightPremiumGate}
      >
        <article className={`${styles.mediaCard} ${styles.insightArticle}`}>
          <div className={styles.mediaThumb}>
            <img src={PAGE_IMG.app.scan} alt="" className={styles.mediaThumbImg} aria-hidden />
          </div>
          <div className={styles.mediaBody}>
            <span className={styles.insightSpark} aria-hidden>
              {aiAccess.isAllowed ? 'Pro insight' : 'Care signal'}
            </span>
            <h3 className={styles.cardTitle}>{title}</h3>
            {isLoading ? (
              <p className={styles.loadingText}>Reading your care data…</p>
            ) : (
              <>
                <p className={styles.cardText}>{body}</p>
                {(score != null || insightCount > 0) && (
                  <div className={styles.insightStats}>
                    {score != null && (
                      <div className={styles.insightStat}>
                        <p className={styles.insightStatValue}>{score}</p>
                        <p className={styles.insightStatLabel}>Care score</p>
                      </div>
                    )}
                    {insightCount > 0 && (
                      <div className={styles.insightStat}>
                        <p className={styles.insightStatValue}>{insightCount}</p>
                        <p className={styles.insightStatLabel}>Signals</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </article>
      </PremiumGate>
    </section>
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
  const highlight = report.highlights[0] ?? report.milestones[0]?.title;

  return (
    <article className={styles.monthCard}>
      <img src={PAGE_IMG.app.monthlyReport} alt="" className={styles.monthBg} aria-hidden />
      <div className={styles.monthScrim} aria-hidden />
      <div className={styles.monthContent}>
        <p className={styles.monthKicker}>{report.monthLabel}</p>
        <h3 className={styles.monthTitle}>{report.petName}&apos;s month</h3>
        {highlight && <p className={styles.monthHighlight}>{highlight}</p>}
        <div className={styles.monthMetrics}>
          {metrics.map((m) => (
            <div key={m.label} className={styles.monthMetric}>
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
            </div>
            <span className={styles.actionLabel}>
              {action.label}
              {isDecoder && decoderNote ? (
                <span className={styles.actionNote}>{decoderNote}</span>
              ) : null}
            </span>
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
  const { records } = useHealthRecords();
  const { documents } = useDocuments();
  const { data: scoreData, isLoading: scoreLoading } = usePetCareScore();
  const { checkIns } = useDailyCheckIn();
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
          <header className={styles.hero}>
            <img className={styles.heroBg} src={PAGE_IMG.app.dashboard} alt="" aria-hidden />
            <div className={styles.heroScrim} aria-hidden />
            <div className={styles.heroInner}>
              <p className={styles.heroEyebrow}>Dashboard</p>
              <h1 className={styles.heroTitle}>Loading your care hub…</h1>
            </div>
          </header>
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
          <header className={styles.hero}>
            <img
              className={styles.heroBg}
              src={PAGE_IMG.app.dashboardWelcome}
              alt=""
              aria-hidden
            />
            <div className={styles.heroScrim} aria-hidden />
            <div className={styles.heroInner}>
              <p className={styles.heroEyebrow}>Your dashboard</p>
              <h1 className={styles.heroTitle}>Welcome to PetClues</h1>
              <p className={styles.heroLead}>
                Add your first pet to unlock reminders, health records, and your personalized care
                dashboard.
              </p>
            </div>
          </header>
          <div className={styles.body}>
            <EmptyDashboardState />
          </div>
        </div>
      </AppLayout>
    );
  }

  const display = petRecordToPet(activePet);
  const meta = [display.breed, display.age !== 'Age not set' ? display.age : null, display.species]
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

  const heroImage = display.photo || PAGE_IMG.app.dashboard;

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <header className={styles.hero}>
          <img className={styles.heroBg} src={heroImage} alt="" aria-hidden />
          <div className={styles.heroScrim} aria-hidden />

          <PetSwitcherHero pets={pets} activeId={activePet.id} onSelect={setActivePet} />

          <div className={styles.heroInner}>
            <div className={styles.heroIdentityRow}>
              <div className={styles.heroAvatar}>
                {display.photo ? (
                  <img
                    src={display.photo}
                    alt={display.name}
                    className={styles.heroAvatarImg}
                  />
                ) : (
                  <Avatar initials={getAvatarInitials(display.name)} size="xl" />
                )}
              </div>
              <div className={styles.heroText}>
                <p className={styles.heroEyebrow}>{getGreeting()}</p>
                <h1 className={styles.heroTitle}>{display.name}</h1>
                {meta && <p className={styles.heroMeta}>{meta}</p>}
                <div className={styles.heroBadges}>
                  <span className={`${styles.statusChip} ${CHIP_CLASS[chip.tone]}`}>
                    {chip.label}
                  </span>
                  <span className={styles.heroUpdated}>Updated today</span>
                </div>
              </div>
            </div>
            <div className={styles.heroActions}>
              <AddAnotherPetButton size="md" className={styles.heroLightBtn} />
            </div>
          </div>
        </header>

        <StatsStrip upcoming={upcomingCount} overdue={overdueCount} score={score} />

        <div className={styles.body}>
          <SectionIntro
            eyebrow="Today"
            title="Your care command center"
            description="Check in, tackle what matters next, and see how your pet's health picture is shaping up."
          />

          <div className={styles.contentGrid}>
            <div className={styles.col}>
              <DailyCheckInCard petName={activePet.name} />
              <CareScoreCard
                metrics={careMetrics}
                score={score}
                scoreLabel={scoreData?.snapshot.label}
                trendText={trendText}
                isLoading={scoreLoading}
                showProDepth={!hasAdvancedScore}
              />
              <AiInsightSection
                aiAccess={aiAccess}
                title={insightTitle}
                body={insightBody}
                isLoading={scoreLoading}
                score={score}
                insightCount={scoreData?.insights.length ?? 0}
              />
            </div>

            <div className={styles.col}>
              <NextTaskCard task={nextTask} />
              <MonthlyPreviewCard report={monthlyReport} exportIsPro={!canExportReport} />
              <section aria-labelledby="dash-actions">
                <h2 id="dash-actions" className={styles.inlineHead}>
                  Quick actions
                </h2>
                <QuickActionsSection
                  decoderAccess={decoderAccess}
                  isEnterprise={isEnterprise}
                  isMonthlyDecoderQuota={isMonthlyDecoderQuota}
                />
              </section>
            </div>
          </div>

          <SectionIntro
            eyebrow="Activity"
            title="Recent moments"
            description="A live feed of vaccinations, uploads, reminders, and milestones from your pet's care journey."
          />
          <RecentMomentsSection moments={moments} timelineAccess={timelineAccess} />
        </div>
      </div>
    </AppLayout>
  );
}
