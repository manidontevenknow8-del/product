import type { EmailType } from './emailTypes';
import type { NotificationSettings } from '@/types/settings';

/** Transactional account emails are always sent server-side (welcome, founding, premium). */
export const TRANSACTIONAL_EMAIL_TYPES = [
  'welcome',
  'founding_member_confirmation',
  'premium_upgrade',
] as const;

/** Maps notification preferences to allowed email types. Push is out of scope. */
export function canSendEmailType(
  preferences: NotificationSettings,
  emailType: EmailType,
): boolean {
  switch (emailType) {
    case 'upcoming_reminder':
      return (
        preferences.emailUpcomingReminders &&
        preferences.upcomingCareAlerts &&
        preferences.reminderNotifications
      );
    case 'overdue_reminder':
      return preferences.emailOverdueReminders && preferences.reminderNotifications;
    case 'weekly_pet_summary':
      return preferences.emailWeeklySummary && preferences.monthlyRecap;
    default:
      return false;
  }
}

export function emailTypePreferenceKey(emailType: EmailType): keyof NotificationSettings {
  switch (emailType) {
    case 'upcoming_reminder':
      return 'emailUpcomingReminders';
    case 'overdue_reminder':
      return 'emailOverdueReminders';
    case 'weekly_pet_summary':
      return 'emailWeeklySummary';
  }
}

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  upcoming_reminder: 'Upcoming reminder emails',
  overdue_reminder: 'Overdue reminder emails',
  weekly_pet_summary: 'Weekly pet summary emails',
};
