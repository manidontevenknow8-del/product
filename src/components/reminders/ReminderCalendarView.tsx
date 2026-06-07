import { useMemo, useState } from 'react';
import type { Reminder } from '@/types/reminder';
import { getRemindersForDate, toIsoDate } from '@/utils/reminderUtils';
import { ReminderCard } from './ReminderCard';
import styles from './ReminderCalendarView.module.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type ReminderCalendarViewProps = {
  reminders: Reminder[];
  onComplete?: (id: string) => void;
  onReschedule?: (id: string, dueDate: string) => void;
  onEdit?: (reminder: Reminder) => void;
};

export function ReminderCalendarView({
  reminders,
  onComplete,
  onReschedule,
  onEdit,
}: ReminderCalendarViewProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i += 1) days.push(null);
    for (let d = 1; d <= totalDays; d += 1) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [viewDate]);

  const remindersByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reminders) {
      if (r.completedAt) continue;
      map.set(r.dueDate, (map.get(r.dueDate) ?? 0) + 1);
    }
    return map;
  }, [reminders]);

  const selectedReminders = selectedDate
    ? getRemindersForDate(reminders, selectedDate)
    : [];

  const prevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => toIsoDate(date) === toIsoDate(today);
  const isSelected = (date: Date) =>
    selectedDate !== null && toIsoDate(date) === toIsoDate(selectedDate);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className={styles.monthLabel}>{monthLabel}</span>
        <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Next month">
          ›
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <span key={day} className={styles.weekday}>
            {day}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {calendarDays.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className={`${styles.day} ${styles.dayEmpty}`} />;
          }

          const iso = toIsoDate(date);
          const count = remindersByDate.get(iso) ?? 0;

          return (
            <button
              key={iso}
              type="button"
              className={`${styles.day} ${isToday(date) ? styles.dayToday : ''} ${isSelected(date) ? styles.daySelected : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className={styles.dayNumber}>{date.getDate()}</span>
              {count > 0 && (
                <span className={styles.dots}>
                  {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                    <span key={j} className={styles.dot} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className={styles.selectedPanel}>
          <span className={styles.selectedLabel}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {selectedReminders.length === 0 ? (
            <p className={styles.emptyDay}>No reminders on this day</p>
          ) : (
            selectedReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={onComplete}
                onReschedule={onReschedule}
                onEdit={onEdit}
                compact
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
