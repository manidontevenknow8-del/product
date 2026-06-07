import { ReminderCard } from './ReminderCard';
import type { Reminder } from '@/types/reminder';
import { getReminderStatus } from '@/utils/reminderUtils';
import styles from './ReminderList.module.css';

type ReminderListProps = {
  reminders: Reminder[];
  onComplete?: (id: string) => void;
  onReschedule?: (id: string, dueDate: string) => void;
  onEdit?: (reminder: Reminder) => void;
  groupByStatus?: boolean;
  compact?: boolean;
  /** Multi-column grid on wide screens */
  wide?: boolean;
};

export function ReminderList({
  reminders,
  onComplete,
  onReschedule,
  onEdit,
  groupByStatus = false,
  compact = false,
  wide = false,
}: ReminderListProps) {
  const listClass = wide ? `${styles.list} ${styles.listWide}` : styles.list;
  const groupItemsClass = wide ? styles.groupItemsWide : styles.groupItems;

  if (!groupByStatus) {
    return (
      <div className={listClass}>
        {reminders.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onComplete={onComplete}
            onReschedule={onReschedule}
            onEdit={onEdit}
            compact={compact}
          />
        ))}
      </div>
    );
  }

  const groups: { label: string; items: Reminder[] }[] = [
    { label: 'Overdue', items: [] },
    { label: 'Due today', items: [] },
    { label: 'Upcoming', items: [] },
  ];

  for (const reminder of reminders) {
    const status = getReminderStatus(reminder);
    if (status === 'overdue') groups[0].items.push(reminder);
    else if (status === 'due_today') groups[1].items.push(reminder);
    else if (status !== 'completed') groups[2].items.push(reminder);
  }

  return (
    <div className={listClass}>
      {groups
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={groupItemsClass}>
            {group.items.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={onComplete}
                onReschedule={onReschedule}
                onEdit={onEdit}
                compact={compact}
              />
            ))}
            </div>
          </div>
        ))}
    </div>
  );
}
