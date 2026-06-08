import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, LoadingState } from '@/components/ui';
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
import {
  UPCOMING_REMINDER_DAYS,
  OVERDUE_REMINDER_MAX_DAYS,
  DAILY_EMAIL_CRON_HOUR_UTC,
  WEEKLY_SUMMARY_DAY,
} from '@/services/email/emailScheduler';
import type { Reminder, ReminderFilters as ReminderFiltersState } from '@/types/reminder';
import styles from './RemindersPage.module.css';

const IMG = {
  hero: '/images/reminders/reminders-hero.png',
  notify: '/images/reminders/reminders-notify.png',
  vet: '/images/reminders/reminders-vet.png',
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

const USE_CASES = [
  {
    title: 'Vet & vaccine dates',
    body: 'Annual boosters, deworming, and check-ups stay tied to the right pet so nothing slips between visits.',
    image: IMG.vet,
    alt: 'Illustration of a pet owner reviewing a vet appointment schedule',
  },
  {
    title: 'Daily life & refills',
    body: 'Grooming, food refills, insurance renewals, or custom tasks - all with the same due-date and repeat rules.',
    image: IMG.notify,
    alt: 'Illustration of pet care reminders arriving on a phone',
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

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <header className={styles.hero}>
          <img className={styles.heroImg} src={IMG.hero} alt="" aria-hidden />
          <div className={styles.heroScrim} aria-hidden />
          <div className={styles.heroInner}>
            <p className={styles.heroEyebrow}>Pet care scheduling</p>
            <h1 className={styles.heroTitle}>Reminders that match real pet life</h1>
            <p className={styles.heroLead}>
              Set appointments, vaccines, grooming, medication, and anything else - then let
              PetClues surface what is due in the app and, when enabled, by email on a fixed
              schedule so you are not guessing when the next nudge arrives.
            </p>
            <div className={styles.heroActions}>
              <Button variant="primary" size="md" onClick={handleOpenCreate}>
                New reminder
              </Button>
              {!isLoading && (
                <div className={styles.heroStats} aria-label="Reminder summary">
                  <span className={styles.statPill}>
                    <strong>{stats.upcoming + stats.dueToday}</strong> upcoming
                  </span>
                  <span className={`${styles.statPill} ${stats.overdue > 0 ? styles.statWarn : ''}`}>
                    <strong>{stats.overdue}</strong> overdue
                  </span>
                  <span className={styles.statPill}>
                    <strong>{stats.total}</strong> active
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={styles.body}>
          <section className={styles.section} aria-labelledby="how-heading">
            <h2 id="how-heading" className={styles.sectionTitle}>
              What happens when you set a reminder
            </h2>
            <div className={styles.steps}>
              {HOW_IT_WORKS.map((item) => (
                <article key={item.step} className={styles.stepCard}>
                  <span className={styles.stepNum}>{item.step}</span>
                  <h3 className={styles.stepTitle}>{item.title}</h3>
                  <p className={styles.stepBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.bento} aria-labelledby="schedule-heading">
            <div className={styles.scheduleCard}>
              <h2 id="schedule-heading" className={styles.cardTitle}>
                Email reminder schedule
              </h2>
              <p className={styles.cardLead}>
                Emails run once per day at <strong>{DAILY_EMAIL_CRON_HOUR_UTC}:00 UTC</strong> (not
                immediately when you create a reminder). You need a profile email and notification
                preferences enabled in Settings.
              </p>
              <ul className={styles.scheduleList}>
                <li>
                  <span className={styles.scheduleTag}>Upcoming</span>
                  One email each on {upcomingLabel} the due date.
                </li>
                <li>
                  <span className={styles.scheduleTag}>Overdue</span>
                  One email per day while overdue, for up to {OVERDUE_REMINDER_MAX_DAYS} days past
                  due.
                </li>
                <li>
                  <span className={styles.scheduleTag}>Weekly</span>
                  Summary email every <strong>{weeklyDay}</strong> for open reminders across your
                  pets.
                </li>
              </ul>
              <div className={styles.timeline} role="img" aria-label="Upcoming email touchpoints before due date">
                {UPCOMING_REMINDER_DAYS.map((day) => (
                  <div key={day} className={styles.timelineNode}>
                    <span className={styles.timelineDot} />
                    <span className={styles.timelineLabel}>
                      {day === 0 ? 'Due' : `−${day}d`}
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.scheduleNote}>
                In-app reminders and dashboard widgets update as soon as data syncs - email is an
                extra layer on top of that rhythm.
              </p>
            </div>

            <div className={styles.useCases}>
              {USE_CASES.map((item) => (
                <article key={item.title} className={styles.useCard}>
                  <div className={styles.useMedia}>
                    <img src={item.image} alt={item.alt} className={styles.useImg} loading="lazy" />
                  </div>
                  <div className={styles.useCopy}>
                    <h3 className={styles.useTitle}>{item.title}</h3>
                    <p className={styles.useBody}>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.workspace} aria-labelledby="manage-heading">
            <div className={styles.workspaceHead}>
              <div>
                <h2 id="manage-heading" className={styles.sectionTitle}>
                  Your reminders
                </h2>
                <p className={styles.workspaceLead}>
                  Filter by view and category, switch to calendar, complete tasks, or edit dates.
                  Everything here stays in sync with your pets and dashboard.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleOpenCreate}>
                Add reminder
              </Button>
            </div>

            {atReminderLimit && (
              <PremiumUpgradePrompt
                feature="unlimitedReminders"
                compact
                onUpgrade={() => setUpgradeOpen(true)}
                emotionalOverride={`You've used ${FREE_REMINDER_LIMIT} of ${FREE_REMINDER_LIMIT} free reminders. Upgrade to Pro for unlimited scheduling - vaccines, meds, grooming, and more.`}
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
        </div>
      </div>

      <CreateReminderModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          if (searchParams.get('create')) setSearchParams({});
        }}
        onSubmit={createReminder}
      />

      <EditReminderModal
        reminder={editReminder}
        isOpen={!!editReminder}
        onClose={() => setEditReminder(null)}
        onSubmit={(id, input) => updateReminder(id, input)}
        onDelete={deleteReminder}
      />

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </AppLayout>
  );
}
