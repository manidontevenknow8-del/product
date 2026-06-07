import type { EmailType, NotificationPreferences, TransactionalEmailType } from './types.ts';

const TRANSACTIONAL_TYPES = new Set<TransactionalEmailType>([
  'welcome',
  'founding_member_confirmation',
  'premium_upgrade',
]);

export function isTransactionalEmailType(emailType: EmailType): emailType is TransactionalEmailType {
  return TRANSACTIONAL_TYPES.has(emailType as TransactionalEmailType);
}

export function canSendEmailType(
  preferences: NotificationPreferences,
  emailType: EmailType,
): boolean {
  if (isTransactionalEmailType(emailType)) {
    return true;
  }

  switch (emailType) {
    case 'upcoming_reminder':
      return (
        preferences.emailUpcomingReminders !== false &&
        preferences.upcomingCareAlerts !== false &&
        preferences.reminderNotifications !== false
      );
    case 'overdue_reminder':
      return (
        preferences.emailOverdueReminders !== false &&
        preferences.reminderNotifications !== false
      );
    case 'weekly_pet_summary':
      return (
        preferences.emailWeeklySummary !== false &&
        preferences.monthlyRecap !== false
      );
    default:
      return false;
  }
}

export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    reminderNotifications: true,
    upcomingCareAlerts: true,
    lostPetAlerts: true,
    productUpdates: false,
    monthlyRecap: true,
    emailUpcomingReminders: true,
    emailOverdueReminders: true,
    emailWeeklySummary: true,
  };
}

export function mergeNotificationPreferences(
  raw: unknown,
): NotificationPreferences {
  const defaults = defaultNotificationPreferences();
  if (!raw || typeof raw !== 'object') return defaults;
  return { ...defaults, ...(raw as NotificationPreferences) };
}
