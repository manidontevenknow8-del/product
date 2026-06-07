export type {
  EmailType,
  EmailJob,
  EmailJobStatus,
  SendEmailRequest,
  SendEmailResult,
  EnqueueEmailJobInput,
  UpcomingReminderEmailPayload,
  OverdueReminderEmailPayload,
  WeeklyPetSummaryEmailPayload,
} from './emailTypes';
export { getEmailService, emailService, type IEmailService } from './resendEmailService';
export {
  getEmailScheduler,
  type IEmailScheduler,
  UPCOMING_REMINDER_DAYS,
  OVERDUE_REMINDER_MAX_DAYS,
  DAILY_EMAIL_CRON_HOUR_UTC,
  WEEKLY_SUMMARY_DAY,
} from './emailScheduler';
export {
  canSendEmailType,
  emailTypePreferenceKey,
  EMAIL_TYPE_LABELS,
} from './notificationEmailPolicy';
