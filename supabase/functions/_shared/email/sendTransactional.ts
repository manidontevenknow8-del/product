import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.49.1';
import { getAppBaseUrl, sendViaResend } from './resendClient.ts';
import { subjectForEmail } from './templates.ts';
import type { EmailType, SendEmailInput } from './types.ts';

/** Claim dedup slot before sending — prevents concurrent duplicate sends. */
async function claimDedupSlot(
  supabase: SupabaseClient,
  userId: string | null,
  emailType: EmailType,
  dedupKey: string,
  recipientEmail: string,
): Promise<boolean> {
  const { error } = await supabase.from('email_send_log').insert({
    user_id: userId,
    email_type: emailType,
    dedup_key: dedupKey,
    recipient_email: recipientEmail,
    resend_id: null,
  });

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return false;
    }
    throw new Error(error.message);
  }
  return true;
}

async function finalizeDedupSend(
  supabase: SupabaseClient,
  userId: string | null,
  emailType: EmailType,
  dedupKey: string,
  resendId?: string,
) {
  if (!resendId) return;
  let query = supabase
    .from('email_send_log')
    .update({ resend_id: resendId })
    .eq('email_type', emailType)
    .eq('dedup_key', dedupKey);
  query = userId ? query.eq('user_id', userId) : query.is('user_id', null);
  await query;
}

export async function deliverTransactionalEmail(
  supabase: SupabaseClient,
  options: {
    userId: string | null;
    to: string;
    input: SendEmailInput;
    dedupKey: string;
  },
): Promise<'sent' | 'skipped'> {
  const { userId, to, input, dedupKey } = options;

  const claimed = await claimDedupSlot(supabase, userId, input.type, dedupKey, to);
  if (!claimed) return 'skipped';

  const result = await sendViaResend({
    ...input,
    to,
    subject: input.subject || subjectForEmail(input),
  });

  if (!result.success) {
    await supabase
      .from('email_send_log')
      .delete()
      .eq('email_type', input.type)
      .eq('dedup_key', dedupKey)
      .is('resend_id', null);
    throw new Error(result.error ?? 'Resend send failed');
  }

  await finalizeDedupSend(supabase, userId, input.type, dedupKey, result.resendId);
  return 'sent';
}

export function appUrls() {
  const base = getAppBaseUrl();
  return {
    dashboardUrl: `${base}/dashboard`,
    settingsUrl: `${base}/settings`,
    signupUrl: `${base}/signup`,
    billingUrl: `${base}/billing`,
    landingUrl: base.replace(/\/$/, '') || base,
  };
}
