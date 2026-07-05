export type EmailType =
  | 'upcoming_reminder'
  | 'overdue_reminder'
  | 'weekly_pet_summary';

export type EmailJobStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

export type UpcomingReminderEmailPayload = {
  petName: string;
  petPhotoUrl?: string | null;
  reminderTitle: string;
  dueDate: string;
  dueLabel: string;
  category: string;
  remindersUrl: string;
};

export type OverdueReminderEmailPayload = {
  petName: string;
  petPhotoUrl?: string | null;
  reminderTitle: string;
  dueDate: string;
  daysOverdue: number;
  category: string;
  remindersUrl: string;
};

export type WeeklyPetSummaryItem = {
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

export type WeeklyPetSummaryEmailPayload = {
  ownerName: string;
  weekLabel: string;
  pets: WeeklyPetSummaryItem[];
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

export type EmailPayloadByType = {
  upcoming_reminder: UpcomingReminderEmailPayload;
  overdue_reminder: OverdueReminderEmailPayload;
  weekly_pet_summary: WeeklyPetSummaryEmailPayload;
};

export type SendEmailRequest<T extends EmailType = EmailType> = {
  type: T;
  to: string;
  subject: string;
  payload: EmailPayloadByType[T];
};

export type SendEmailResult = {
  success: boolean;
  resendId?: string;
  error?: string;
};

export type EmailJob = {
  id: string;
  userId: string;
  emailType: EmailType;
  payload: Record<string, unknown>;
  scheduledFor: string;
  status: EmailJobStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  processedAt: string | null;
};

export type EnqueueEmailJobInput<T extends EmailType = EmailType> = {
  userId: string;
  emailType: T;
  payload: EmailPayloadByType[T];
  scheduledFor: string;
};
