import { useState } from 'react';
import { Badge, Button } from '@/components/ui';
import type { Reminder } from '@/types/reminder';
import { categoryLabels, priorityLabels } from '@/types/reminder';
import {
  addDays,
  formatDisplayDate,
  formatDueLabel,
  getReminderStatus,
} from '@/utils/reminderUtils';
import styles from './ReminderCard.module.css';

type ReminderCardProps = {
  reminder: Reminder;
  onComplete?: (id: string) => void;
  onReschedule?: (id: string, dueDate: string) => void;
  onEdit?: (reminder: Reminder) => void;
  compact?: boolean;
};

const statusLabels = {
  upcoming: 'Upcoming',
  due_today: 'Due today',
  overdue: 'Overdue',
  completed: 'Completed',
} as const;

const statusBadgeVariant = {
  upcoming: 'default' as const,
  due_today: 'warning' as const,
  overdue: 'danger' as const,
  completed: 'success' as const,
};

export function ReminderCard({
  reminder,
  onComplete,
  onReschedule,
  onEdit,
  compact = false,
}: ReminderCardProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const status = getReminderStatus(reminder);
  const dueLabel = formatDueLabel(reminder.dueDate);
  const isCompleted = status === 'completed';

  const statusClass =
    status === 'overdue'
      ? styles.overdue
      : status === 'due_today'
        ? styles.dueToday
        : styles.upcoming;

  const handleQuickReschedule = (days: number) => {
    onReschedule?.(reminder.id, addDays(reminder.dueDate, days));
    setRescheduleOpen(false);
  };

  return (
    <article
      className={`${styles.card} ${statusClass} ${isCompleted ? styles.completed : ''}`}
    >
      <div className={styles.top}>
        <div>
          <h3 className={styles.title}>{reminder.title}</h3>
          <div className={styles.meta}>
            <Badge variant="accent">{categoryLabels[reminder.category]}</Badge>
            <Badge variant={statusBadgeVariant[status]}>{statusLabels[status]}</Badge>
            {!compact && reminder.priority !== 'low' && (
              <Badge variant="default">{priorityLabels[reminder.priority]}</Badge>
            )}
          </div>
        </div>
        <span className={styles.pet}>{reminder.petName}</span>
      </div>

      <div className={styles.due}>
        <span
          className={`${styles.dueLabel} ${
            status === 'overdue'
              ? styles.dueLabelOverdue
              : status === 'due_today'
                ? styles.dueLabelToday
                : ''
          }`}
        >
          {dueLabel}
        </span>
        <span className={styles.dueDate}>· {formatDisplayDate(reminder.dueDate)}</span>
      </div>

      {!compact && reminder.notes && (
        <p className={styles.notes}>{reminder.notes}</p>
      )}

      {!isCompleted && (
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete?.(reminder.id)}
          >
            Mark done
          </Button>

          {onReschedule && (
            <div className={styles.rescheduleWrap}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRescheduleOpen((v) => !v)}
              >
                Reschedule
              </Button>
              {rescheduleOpen && (
                <div className={styles.rescheduleMenu}>
                  <button
                    type="button"
                    className={styles.rescheduleOption}
                    onClick={() => handleQuickReschedule(1)}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    className={styles.rescheduleOption}
                    onClick={() => handleQuickReschedule(7)}
                  >
                    Next week
                  </button>
                  <button
                    type="button"
                    className={styles.rescheduleOption}
                    onClick={() => handleQuickReschedule(30)}
                  >
                    Next month
                  </button>
                  {onEdit && (
                    <button
                      type="button"
                      className={styles.rescheduleOption}
                      onClick={() => {
                        setRescheduleOpen(false);
                        onEdit(reminder);
                      }}
                    >
                      Pick a date…
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(reminder)}>
              Edit
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
