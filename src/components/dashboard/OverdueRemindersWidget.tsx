import { Link } from 'react-router-dom';
import { SectionHeader, Badge } from '@/components/ui';
import { ReminderList } from '@/components/reminders';
import { useReminders } from '@/reminders';
import { ROUTES } from '@/routes/paths';
import styles from './OverdueRemindersWidget.module.css';

export function OverdueRemindersWidget() {
  const { overdueReminders, stats, completeReminder, rescheduleReminder } = useReminders();

  if (stats.overdue === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <SectionHeader
            title="Needs attention"
            subtitle={`${stats.overdue} overdue reminder${stats.overdue === 1 ? '' : 's'}`}
          />
          <Badge variant="danger">{stats.overdue}</Badge>
        </div>
        <Link to={`${ROUTES.REMINDERS}?view=overdue`} className={styles.viewAll}>
          View overdue
        </Link>
      </div>

      <ReminderList
        reminders={overdueReminders.slice(0, 3)}
        onComplete={completeReminder}
        onReschedule={rescheduleReminder}
        compact
      />
    </section>
  );
}
