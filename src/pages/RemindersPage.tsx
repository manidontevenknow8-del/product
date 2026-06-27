import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState } from '@/components/ui';
import { PremiumUpgradePrompt, UpgradeModal } from '@/components/subscription';
import { useAuth } from '@/auth/AuthProvider';
import {
  canCreateReminder,
  FREE_REMINDER_LIMIT,
} from '@/subscription/featureGates';
import {
  ReminderList,
  ReminderFilters,
  ReminderCalendarView,
  ReminderEmptyState,
  CreateReminderModal,
  EditReminderModal,
} from '@/components/reminders';
import { useReminders } from '@/reminders';
import { usePets } from '@/pets';
import { PetSwitcherHero } from '@/components/pets';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import {
  UPCOMING_REMINDER_DAYS,
  OVERDUE_REMINDER_MAX_DAYS,
  DAILY_EMAIL_CRON_HOUR_UTC,
  WEEKLY_SUMMARY_DAY,
} from '@/services/email/emailScheduler';
import type { Reminder, ReminderFilters as ReminderFiltersState } from '@/types/reminder';
import styles from './RemindersPage.module.css';

const IMG = {
  hero: '/images/reminders/reminders-hero.webp',
} as const;

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Set it once',
    body: 'Pick a pet, category (vet, vaccines, grooming, meds, and more), due date, and optional repeat. One reminder can cover a single appointment or recur every month or year.',
  },
  {
    step: '2',
    title: 'See it everywhere',
    body: 'Open reminders here in list or calendar view, filter by upcoming or overdue, and spot the same tasks on your dashboard. Mark complete or reschedule without losing history.',
  },
  {
    step: '3',
    title: 'Get nudged on schedule',
    body: 'PetClues tracks due dates in the app. If your account email and notification preferences are on, we also send email reminders on the schedule below - not the instant you tap save.',
  },
] as const;

function formatUpcomingDays(): string {
  const sorted = [...UPCOMING_REMINDER_DAYS].sort((a, b) => b - a);
  const parts = sorted.map((d) => (d === 0 ? 'due day' : `${d} days before`));
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

export function RemindersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { pets, activePet, setActivePet } = usePets();
  const accessInput = {
    subscriptionStatus: user?.subscriptionStatus,
    subscriptionTier: user?.subscriptionTier ?? 'free',
  };
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const {
    stats,
    isLoading,
    filterReminders,
    createReminder,
    updateReminder,
    completeReminder,
    rescheduleReminder,
    deleteReminder,
  } = useReminders();

  const [filters, setFilters] = useState<ReminderFiltersState>({
    category: 'all',
    petId: 'all',
    view: (searchParams.get('view') as ReminderFiltersState['view']) ?? 'list',
  });

  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === 'true');
  const [editReminder, setEditReminder] = useState<Reminder | null>(null);

  const activeReminderCount = stats.total - stats.completed;
  const atReminderLimit = !canCreateReminder(accessInput, activeReminderCount);

  const handleOpenCreate = () => {
    if (atReminderLimit) {
      setUpgradeOpen(true);
      return;
    }
    setCreateOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('create') !== 'true' || isLoading) return;
    if (atReminderLimit) {
      setUpgradeOpen(true);
      setCreateOpen(false);
      setSearchParams({});
    }
  }, [searchParams, isLoading, atReminderLimit, setSearchParams]);

  const filtered = useMemo(() => filterReminders(filters), [filterReminders, filters]);

  const handleFilterChange = (next: ReminderFiltersState) => {
    setFilters(next);
    setSearchParams(next.view !== 'list' ? { view: next.view } : {});
  };

  const handlePetSwitch = (petId: string) => {
    setActivePet(petId);
    setFilters((prev) => ({ ...prev, petId }));
  };

  const emptyView =
    filters.view === 'calendar'
      ? 'calendar'
      : filters.view === 'overdue'
        ? 'overdue'
        : filters.view === 'upcoming'
          ? 'upcoming'
          : 'list';

  const upcomingLabel = formatUpcomingDays();
  const weeklyDay = WEEKDAY_NAMES[WEEKLY_SUMMARY_DAY];
  const heroBg = resolvePetHeroBackground(activePet?.photoUrl);
  const heroSrc = heroBg.isPetPhoto ? heroBg.src : IMG.hero;
  const heroPhoto = normalizePhotoUrlFromDb(activePet?.photoUrl);
  const upcomingCount = stats.upcoming + stats.dueToday;

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
                <PetSwitcherHero
                  pets={pets}
                  activeId={activePet.id}
                  onSelect={handlePetSwitch}
                />
              )}
            </div>

            <div className="ed-hero__grid">
              <div className="ed-hero__text">
                <p className="ed-hero__kicker">Care scheduling</p>
                <h1 className="ed-hero__title">Never miss a moment of care</h1>
                <p className="ed-hero__subtitle">
                  Appointments, vaccines, grooming, and medication — gathered into one calm
                  schedule that nudges you in the app and by email, right on time.
                </p>
                <div className="ed-hero__cta">
                  <button type="button" className="ed-btn" onClick={handleOpenCreate}>
                    New reminder
                  </button>
                  <a href="#manage-heading" className="ed-btn-ghost">
                    View schedule
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

        {!isLoading && (
          <section className="ed-stats" style={{ ['--ed-stat-cols' as string]: 4 }} aria-label="Reminder summary">
            <div className="ed-stats__inner">
              <div className="ed-stat">
                <div className="ed-stat__value">{upcomingCount}</div>
                <p className="ed-stat__label">Upcoming</p>
              </div>
              <div className="ed-stat">
                <div className={`ed-stat__value ${stats.overdue > 0 ? styles.statValueWarn : ''}`}>
                  {stats.overdue}
                </div>
                <p className="ed-stat__label">Overdue</p>
              </div>
              <div className="ed-stat">
                <div className="ed-stat__value">{stats.total}</div>
                <p className="ed-stat__label">Active</p>
              </div>
              <div className="ed-stat">
                <div className="ed-stat__value">{stats.completed}</div>
                <p className="ed-stat__label">Completed</p>
              </div>
            </div>
          </section>
        )}

        <div className="ed-body">
          <section className="ed-chapter" aria-labelledby="manage-heading">
            <div className={styles.workspaceHead}>
              <div className="ed-chapter__intro">
                <p className="ed-eyebrow">The schedule</p>
                <h2 id="manage-heading" className="ed-title">
                  Your reminders
                </h2>
                <p className="ed-lead">
                  Filter by view and category, switch to calendar, complete tasks, or edit dates —
                  always in sync with your pets and dashboard.
                </p>
              </div>
              <button type="button" className="ed-btn-dark" onClick={handleOpenCreate}>
                Add reminder
              </button>
            </div>

            {atReminderLimit && (
              <PremiumUpgradePrompt
                feature="unlimitedReminders"
                compact
                onUpgrade={() => setUpgradeOpen(true)}
                emotionalOverride={`You've used ${FREE_REMINDER_LIMIT} of ${FREE_REMINDER_LIMIT} free reminders. Upgrade to Plus for unlimited scheduling - vaccines, meds, grooming, and more.`}
              />
            )}

            {isLoading ? (
              <LoadingState message="Loading reminders" />
            ) : (
              <div className={styles.workspacePanel}>
                <ReminderFilters
                  filters={filters}
                  stats={stats}
                  onChange={handleFilterChange}
                />

                {filters.view === 'calendar' ? (
                  <div className={styles.calendarWrap}>
                    <ReminderCalendarView
                      reminders={filtered}
                      onComplete={completeReminder}
                      onReschedule={rescheduleReminder}
                      onEdit={setEditReminder}
                    />
                  </div>
                ) : filtered.length === 0 ? (
                  <ReminderEmptyState
                    view={emptyView}
                    onCreate={handleOpenCreate}
                  />
                ) : (
                  <ReminderList
                    reminders={filtered}
                    onComplete={completeReminder}
                    onReschedule={rescheduleReminder}
                    onEdit={setEditReminder}
                    groupByStatus={filters.view === 'list'}
                    wide
                  />
                )}
              </div>
            )}
          </section>

          <section className="ed-band" aria-labelledby="schedule-heading">
            <div className="ed-band__texture" aria-hidden />
            <span className="ed-band__watermark" aria-hidden>
              On time
            </span>
            <div className="ed-band__inner">
              <p className="ed-eyebrow">How reminders reach you</p>
              <h2 id="schedule-heading" className="ed-band__title">
                A gentle rhythm, never a scramble
              </h2>
              <p className="ed-band__text">
                Emails run once daily at {DAILY_EMAIL_CRON_HOUR_UTC}:00 UTC — never the instant you
                hit save. In-app reminders and dashboard cues update the moment data syncs.
              </p>

              <div className={styles.touchpoints} role="img" aria-label="Email touchpoints before a due date">
                {UPCOMING_REMINDER_DAYS.map((day) => (
                  <div key={day} className={styles.touchNode}>
                    <span className={styles.touchDot} />
                    <span className={styles.touchLabel}>{day === 0 ? 'Due' : `−${day}d`}</span>
                  </div>
                ))}
              </div>

              <ul className={styles.scheduleList}>
                <li>
                  <span className={styles.scheduleTag}>Upcoming</span>
                  One email each on {upcomingLabel} the due date.
                </li>
                <li>
                  <span className={styles.scheduleTag}>Overdue</span>
                  One per day while overdue, up to {OVERDUE_REMINDER_MAX_DAYS} days past due.
                </li>
                <li>
                  <span className={styles.scheduleTag}>Weekly</span>
                  A {weeklyDay} summary of open reminders across your pets.
                </li>
              </ul>
            </div>
          </section>

          <section className="ed-chapter" aria-labelledby="how-heading">
            <div className="ed-chapter__intro">
              <p className="ed-eyebrow">How it works</p>
              <h2 id="how-heading" className="ed-title">
                Set it once, stay ahead
              </h2>
            </div>
            <div className="ed-steps">
              {HOW_IT_WORKS.map((item) => (
                <article key={item.step} className="ed-step">
                  <span className="ed-step__num">{item.step}</span>
                  <h3 className="ed-step__title">{item.title}</h3>
                  <p className="ed-step__body">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <CreateReminderModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          if (searchParams.get('create')) setSearchParams({});
        }}
        onSubmit={createReminder}
        preferredPetId={filters.petId !== 'all' ? filters.petId : undefined}
      />

      <EditReminderModal
        reminder={editReminder}
        isOpen={!!editReminder}
        onClose={() => setEditReminder(null)}
        onSubmit={(id, input) => updateReminder(id, input)}
        onDelete={deleteReminder}
      />

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        targetPlan="plus"
      />
    </AppLayout>
  );
}
