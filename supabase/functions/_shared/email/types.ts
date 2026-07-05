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
  petPhotoUrl?: string | null;
  reminderTitle: string;
  dueDate: string;
  dueLabel: string;
  category: string;
  remindersUrl: string;
};

export type OverdueReminderPayload = {
  petName: string;
  petPhotoUrl?: string | null;
  reminderTitle: string;
  dueDate: string;
  daysOverdue: number;
  category: string;
  remindersUrl: string;
};

export type WeeklyPetSummary = {
  id: string;
  name: string;
  speciesLabel: string;
  photoUrl: string | null;
  avatarInitials: string;
  upcomingCount: number;
  overdueCount: number;
  checkInsThisWeek: number;
  currentStreak: number;
  careScore?: number;
  scoreLabel?: string;
  scoreTrend?: 'up' | 'down' | 'stable';
  scoreTrendDelta?: number;
  weeklyInsight?: {
    title: string;
    message: string;
    highlight?: string;
  };
  upcomingReminders: Array<{ title: string; dueLabel: string; category: string }>;
  overdueReminders: Array<{ title: string; dueLabel: string; category: string }>;
  nextReminderTitle?: string;
  nextReminderDue?: string;
  profileUrl: string;
  insightsUrl: string;
};

export type WeeklySummaryPayload = {
  ownerName: string;
  weekLabel: string;
  pets: WeeklyPetSummary[];
  totals: {
    upcoming: number;
    overdue: number;
    checkIns: number;
    petCount: number;
  };
  dashboardUrl: string;
  remindersUrl: string;
  settingsUrl: string;
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
  billingCycle: string;
  currency?: string;
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
