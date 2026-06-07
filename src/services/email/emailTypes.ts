export type EmailType =
  | 'upcoming_reminder'
  | 'overdue_reminder'
  | 'weekly_pet_summary';

export type EmailJobStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

export type UpcomingReminderEmailPayload = {
  petName: string;
  reminderTitle: string;
  dueDate: string;
  dueLabel: string;
  category: string;
  remindersUrl: string;
};

export type OverdueReminderEmailPayload = {
  petName: string;
  reminderTitle: string;
  dueDate: string;
  daysOverdue: number;
  category: string;
  remindersUrl: string;
};

export type WeeklyPetSummaryEmailPayload = {
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
