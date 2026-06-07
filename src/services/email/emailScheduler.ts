import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';
import type { EmailJob, EnqueueEmailJobInput, EmailJobStatus, EmailType } from './emailTypes';

/**
 * Scheduling architecture for email delivery.
 *
 * V1: Cron edge function (`process-email-jobs`) scans reminders + preferences daily.
 * V2+: Enqueue deferred jobs into `email_jobs` for exact-time delivery.
 *
 * Swap `MockEmailScheduler` → `SupabaseEmailScheduler` when queue processing is enabled.
 */
export interface IEmailScheduler {
  enqueue<T extends EmailType>(input: EnqueueEmailJobInput<T>): Promise<string>;
  cancel(jobId: string): Promise<void>;
  listPending(userId: string): Promise<EmailJob[]>;
}

export class SupabaseEmailScheduler implements IEmailScheduler {
  async enqueue<T extends EmailType>(input: EnqueueEmailJobInput<T>): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('email_jobs')
      .insert({
        user_id: input.userId,
        email_type: input.emailType,
        payload: input.payload,
        scheduled_for: input.scheduledFor,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id as string;
  }

  async cancel(jobId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('email_jobs')
      .update({ status: 'cancelled', processed_at: new Date().toISOString() })
      .eq('id', jobId)
      .eq('status', 'pending');

    if (error) throw new Error(error.message);
  }

  async listPending(userId: string): Promise<EmailJob[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('email_jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      emailType: row.email_type as EmailType,
      payload: row.payload as Record<string, unknown>,
      scheduledFor: row.scheduled_for,
      status: row.status as EmailJobStatus,
      attempts: row.attempts,
      lastError: row.last_error,
      createdAt: row.created_at,
      processedAt: row.processed_at,
    }));
  }
}

export class MockEmailScheduler implements IEmailScheduler {
  private jobs = new Map<string, EmailJob>();

  async enqueue<T extends EmailType>(input: EnqueueEmailJobInput<T>): Promise<string> {
    const id = crypto.randomUUID();
    const job: EmailJob = {
      id,
      userId: input.userId,
      emailType: input.emailType,
      payload: input.payload as Record<string, unknown>,
      scheduledFor: input.scheduledFor,
      status: 'pending',
      attempts: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
      processedAt: null,
    };
    this.jobs.set(id, job);
    if (import.meta.env.DEV) {
      console.info('[MockEmailScheduler] enqueue', job.emailType, job.scheduledFor);
    }
    return id;
  }

  async cancel(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      job.processedAt = new Date().toISOString();
    }
  }

  async listPending(userId: string): Promise<EmailJob[]> {
    return [...this.jobs.values()].filter(
      (job) => job.userId === userId && job.status === 'pending',
    );
  }
}

export function getEmailScheduler(): IEmailScheduler {
  return isSupabaseConfigured() ? new SupabaseEmailScheduler() : new MockEmailScheduler();
}

/** Days before due when upcoming reminder emails are sent (must match edge function). */
export const UPCOMING_REMINDER_DAYS = [7, 3, 1, 0] as const;

/** Stop overdue reminder emails after this many days past due. */
export const OVERDUE_REMINDER_MAX_DAYS = 30;

/** Hour (UTC) for daily email job cron. */
export const DAILY_EMAIL_CRON_HOUR_UTC = 8;

/** Day of week for weekly summary (0 = Sunday). */
export const WEEKLY_SUMMARY_DAY = 0;
