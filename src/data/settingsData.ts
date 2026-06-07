import type { UserSettings } from '@/types/settings';

export function buildDefaultSettings(name: string, email: string): UserSettings {
  return {
    account: {
      name,
      email,
      profilePhotoUrl: null,
    },
    notifications: {
      reminderNotifications: true,
      upcomingCareAlerts: true,
      lostPetAlerts: true,
      productUpdates: false,
      monthlyRecap: true,
      emailUpcomingReminders: true,
      emailOverdueReminders: true,
      emailWeeklySummary: true,
    },
    privacy: {
      publicProfileEnabled: false,
      passportSharingEnabled: true,
    },
    security: {
      twoFactorEnabled: false,
    },
  };
}

export const NOTIFICATION_PREFERENCE_LABELS = {
  reminderNotifications: {
    label: 'Reminder notifications',
    description: 'When a care reminder is due or overdue',
  },
  upcomingCareAlerts: {
    label: 'Upcoming care alerts',
    description: 'Gentle heads-up before important appointments',
  },
  lostPetAlerts: {
    label: 'Lost pet alerts',
    description: 'Emergency updates and community sighting reports',
  },
  productUpdates: {
    label: 'Product updates',
    description: 'Occasional emails about new features (account and care emails are always sent)',
  },
  monthlyRecap: {
    label: 'Weekly pet summary',
    description: 'A weekly email digest of care progress and upcoming tasks',
  },
  emailUpcomingReminders: {
    label: 'Email: upcoming reminders',
    description: 'Receive an email before care tasks are due',
  },
  emailOverdueReminders: {
    label: 'Email: overdue reminders',
    description: 'Receive an email when a reminder becomes overdue',
  },
  emailWeeklySummary: {
    label: 'Email: weekly pet summary',
    description: 'Weekly digest email with care overview across your pets',
  },
} as const;
