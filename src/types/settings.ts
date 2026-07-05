export type AccountSettings = {
  name: string;
  email: string;
  profilePhotoUrl: string | null;
};

export type NotificationPreferenceKey =
  | 'reminderNotifications'
  | 'upcomingCareAlerts'
  | 'lostPetAlerts'
  | 'productUpdates'
  | 'monthlyRecap'
  | 'emailUpcomingReminders'
  | 'emailOverdueReminders'
  | 'emailWeeklySummary'
  | 'pushStreakReminders';

export type NotificationSettings = Record<NotificationPreferenceKey, boolean>;

export type PrivacySettings = {
  publicProfileEnabled: boolean;
  passportSharingEnabled: boolean;
};

export type SecuritySettings = {
  twoFactorEnabled: boolean;
};

export type UserSettings = {
  account: AccountSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
};

export type SettingsSection =
  | 'account'
  | 'notifications'
  | 'privacy'
  | 'security'
  | 'household';
