export type CareEmailType =
  | 'upcoming_reminder'
  | 'overdue_reminder'
  | 'weekly_pet_summary';

export type TransactionalEmailType =
  | 'welcome'
  | 'founding_member_confirmation'
  | 'premium_upgrade';

export type EmailType = CareEmailType | TransactionalEmailType;

export type NotificationPreferences = {
  reminderNotifications?: boolean;
  upcomingCareAlerts?: boolean;
  lostPetAlerts?: boolean;
  productUpdates?: boolean;
  monthlyRecap?: boolean;
  emailUpcomingReminders?: boolean;
  emailOverdueReminders?: boolean;
  emailWeeklySummary?: boolean;
};

export type UpcomingReminderPayload = {
  petName: string;
  reminderTitle: string;
  dueDate: string;
  dueLabel: string;
  category: string;
  remindersUrl: string;
};

export type OverdueReminderPayload = {
  petName: string;
  reminderTitle: string;
  dueDate: string;
  daysOverdue: number;
  category: string;
  remindersUrl: string;
};

export type WeeklySummaryPayload = {
  ownerName: string;
  weekLabel: string;
  pets: Array<{
    name: string;
    upcomingCount: number;
    overdueCount: number;
    nextReminderTitle?: string;
    nextReminderDue?: string;
  }>;
  dashboardUrl: string;
};

export type WelcomeEmailPayload = {
  ownerName: string;
  dashboardUrl: string;
  settingsUrl: string;
};

export type FoundingMemberConfirmationPayload = {
  dashboardUrl: string;
  signupUrl: string;
};

export type PremiumUpgradePayload = {
  ownerName: string;
  interval: string;
  billingUrl: string;
  dashboardUrl: string;
};

export type EmailPayload =
  | { type: 'upcoming_reminder'; payload: UpcomingReminderPayload }
  | { type: 'overdue_reminder'; payload: OverdueReminderPayload }
  | { type: 'weekly_pet_summary'; payload: WeeklySummaryPayload }
  | { type: 'welcome'; payload: WelcomeEmailPayload }
  | { type: 'founding_member_confirmation'; payload: FoundingMemberConfirmationPayload }
  | { type: 'premium_upgrade'; payload: PremiumUpgradePayload };

export type SendEmailInput = EmailPayload & {
  to: string;
  subject: string;
};
