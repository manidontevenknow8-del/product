import type {
  Reminder,
  ReminderFilters,
  ReminderStats,
  ReminderStatus,
} from '@/types/reminder';

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getReminderStatus(reminder: Reminder, today = new Date()): ReminderStatus {
  if (reminder.completedAt) return 'completed';

  const due = startOfDay(parseDate(reminder.dueDate));
  const now = startOfDay(today);
  const diffDays = Math.round((due.getTime() - now.getTime()) / MS_PER_DAY);

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  return 'upcoming';
}

export function formatDueLabel(dueDate: string, today = new Date()): string {
  const due = startOfDay(parseDate(dueDate));
  const now = startOfDay(today);
  const diffDays = Math.round((due.getTime() - now.getTime()) / MS_PER_DAY);

  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDisplayDate(isoDate: string): string {
  return parseDate(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function addDays(isoDate: string, days: number): string {
  const date = parseDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function computeStats(reminders: Reminder[], today = new Date()): ReminderStats {
  let upcoming = 0;
  let overdue = 0;
  let dueToday = 0;
  let completed = 0;

  for (const reminder of reminders) {
    const status = getReminderStatus(reminder, today);
    if (status === 'completed') completed += 1;
    else if (status === 'overdue') overdue += 1;
    else if (status === 'due_today') dueToday += 1;
    else upcoming += 1;
  }

  return {
    total: reminders.length,
    upcoming,
    overdue,
    dueToday,
    completed,
  };
}

export function filterReminders(
  reminders: Reminder[],
  filters: ReminderFilters,
  today = new Date(),
): Reminder[] {
  return reminders
    .filter((r) => {
      if (filters.category !== 'all' && r.category !== filters.category) return false;
      if (filters.petId !== 'all' && r.petId !== filters.petId) return false;

      const status = getReminderStatus(r, today);
      if (filters.view === 'upcoming') {
        return status === 'upcoming' || status === 'due_today';
      }
      if (filters.view === 'overdue') return status === 'overdue';
      if (filters.view === 'list' || filters.view === 'calendar') return status !== 'completed';
      return true;
    })
    .sort((a, b) => {
      if (a.completedAt && !b.completedAt) return 1;
      if (!a.completedAt && b.completedAt) return -1;
      return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
    });
}

export function getNextReminder(reminders: Reminder[], today = new Date()): Reminder | null {
  const active = reminders.filter((r) => {
    const status = getReminderStatus(r, today);
    return status === 'upcoming' || status === 'due_today' || status === 'overdue';
  });

  if (active.length === 0) return null;

  const priorityOrder = { overdue: 0, due_today: 1, upcoming: 2 } as const;

  return [...active].sort((a, b) => {
    const statusA = getReminderStatus(a, today);
    const statusB = getReminderStatus(b, today);
    const priorityDiff =
      priorityOrder[statusA as keyof typeof priorityOrder] -
      priorityOrder[statusB as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;
    return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
  })[0];
}

export function getRemindersForDate(
  reminders: Reminder[],
  date: Date,
): Reminder[] {
  const iso = toIsoDate(date);
  return reminders.filter((r) => r.dueDate === iso && !r.completedAt);
}
