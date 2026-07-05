import type { Reminder } from '@/types/reminder';
import { computeStats, getReminderStatus } from '@/utils/reminderUtils';

export function deriveDashboardPetStatus(params: {
  overdueCount: number;
  petCareScore: number | null;
}): { label: string; variant: 'success' | 'warning' | 'default' } {
  if (params.overdueCount > 0) {
    return {
      label: `${params.overdueCount} overdue`,
      variant: 'warning',
    };
  }

  if (params.petCareScore != null) {
    if (params.petCareScore >= 86) {
      return { label: 'Excellent care', variant: 'success' };
    }
    if (params.petCareScore >= 70) {
      return { label: 'On track', variant: 'success' };
    }
    return { label: 'Needs attention', variant: 'warning' };
  }

  return { label: 'Getting started', variant: 'default' };
}

export function countOverdueReminders(reminders: Reminder[]): number {
  return reminders.filter((r) => getReminderStatus(r) === 'overdue').length;
}

export function countUpcomingReminders(reminders: Reminder[]): number {
  const stats = computeStats(reminders);
  return stats.upcoming + stats.dueToday;
}
