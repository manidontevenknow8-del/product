import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';

export type WelcomeEmailDispatchResult =
  | { ok: true; status: 'sent' | 'skipped' }
  | { ok: false; error: string };

/** Request server-side welcome email for the authenticated user (deduped). */
export async function queueWelcomeEmail(): Promise<WelcomeEmailDispatchResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured' };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('queue-welcome-email');

    if (error) {
      const message = error.message || 'queue-welcome-email invoke failed';
      if (import.meta.env.DEV) {
        console.warn('[welcome-email]', message, error);
      }
      return { ok: false, error: message };
    }

    const status = data?.status === 'skipped' ? 'skipped' : 'sent';
    if (import.meta.env.DEV) {
      console.info('[welcome-email] dispatched:', status, data);
    }
    return { ok: true, status };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown welcome email error';
    if (import.meta.env.DEV) {
      console.warn('[welcome-email]', message);
    }
    return { ok: false, error: message };
  }
}
