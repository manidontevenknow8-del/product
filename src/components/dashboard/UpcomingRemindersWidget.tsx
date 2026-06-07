import { Link, useNavigate } from 'react-router-dom';
import { Button, SectionHeader } from '@/components/ui';
import { ReminderList } from '@/components/reminders';
import { EmptyRemindersState } from '@/components/empty-states';
import { useReminders } from '@/reminders';
import { ROUTES } from '@/routes/paths';
import { formatDueLabel } from '@/utils/reminderUtils';
import styles from './UpcomingRemindersWidget.module.css';

export function UpcomingRemindersWidget() {
  const navigate = useNavigate();
  const { nextReminder, upcomingReminders, stats, completeReminder, rescheduleReminder } =
    useReminders();

  const display = nextReminder
    ? [nextReminder, ...upcomingReminders.filter((r) => r.id !== nextReminder.id).slice(0, 2)]
    : upcomingReminders.slice(0, 3);

  const hasActiveReminders = display.length > 0;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <SectionHeader
          title="Upcoming"
          subtitle={
            nextReminder
              ? `${stats.upcoming + stats.dueToday} reminders on the horizon`
              : 'Nothing scheduled yet'
          }
        />
        <Link to={ROUTES.REMINDERS} className={styles.viewAll}>
          View all
        </Link>
      </div>

      {nextReminder && (
        <div className={styles.highlight}>
          <span className={styles.highlightLabel}>Next due</span>
          <p className={styles.highlightTitle}>{nextReminder.title}</p>
          <p className={styles.highlightMeta}>
            {nextReminder.petName} · {formatDueLabel(nextReminder.dueDate)}
          </p>
          <div className={styles.highlightActions}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void completeReminder(nextReminder.id)}
            >
              Mark done
            </Button>
            <Link to={ROUTES.REMINDERS}>
              <Button variant="ghost" size="sm">
                Details
              </Button>
            </Link>
          </div>
        </div>
      )}

      {hasActiveReminders ? (
        <ReminderList
          reminders={nextReminder ? display.slice(1) : display}
          onComplete={completeReminder}
          onReschedule={rescheduleReminder}
          compact
        />
      ) : (
        <EmptyRemindersState
          view="list"
          compact
          onCreate={() => navigate(`${ROUTES.REMINDERS}?create=true`)}
        />
      )}

      <div className={styles.stats}>
        <span className={styles.stat}>
          Completed: <strong>{stats.completed}</strong>
        </span>
      </div>
    </section>
  );
}
