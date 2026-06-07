import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';
import type { SendEmailRequest, SendEmailResult } from './emailTypes';

export interface IEmailService {
  /** Invoke edge function to send a single email (admin/test or on-demand). */
  send(request: SendEmailRequest): Promise<SendEmailResult>;
  /** Trigger the scheduled job processor (typically cron-only; exposed for manual runs). */
  processScheduledJobs(): Promise<{ processed: number; sent: number; skipped: number }>;
}

export class ResendEmailService implements IEmailService {
  async send(request: SendEmailRequest): Promise<SendEmailResult> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: request,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const result = data as SendEmailResult | null;
    return result ?? { success: false, error: 'Empty response from send-email' };
  }

  async processScheduledJobs() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('process-email-jobs', {
      body: {},
    });

    if (error) throw new Error(error.message);
    return (data ?? { processed: 0, sent: 0, skipped: 0 }) as {
      processed: number;
      sent: number;
      skipped: number;
    };
  }
}

/** No-op when Supabase is not configured (local dev without edge functions). */
export class MockEmailService implements IEmailService {
  async send(request: SendEmailRequest): Promise<SendEmailResult> {
    if (import.meta.env.DEV) {
      console.info('[MockEmailService] send', request.type, request.to, request.subject);
    }
    return { success: true, resendId: `mock_${Date.now()}` };
  }

  async processScheduledJobs() {
    if (import.meta.env.DEV) {
      console.info('[MockEmailService] processScheduledJobs');
    }
    return { processed: 0, sent: 0, skipped: 0 };
  }
}

export function getEmailService(): IEmailService {
  return isSupabaseConfigured() ? new ResendEmailService() : new MockEmailService();
}

export const emailService = getEmailService();
