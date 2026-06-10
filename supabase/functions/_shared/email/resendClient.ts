import { Resend } from 'npm:resend@4.0.0';
import { buildEmailContent, subjectForEmail } from './templates.ts';
import type { SendEmailInput } from './types.ts';

export type ResendSendResult = {
  success: boolean;
  resendId?: string;
  error?: string;
};

export function getResendClient(): Resend {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

export function getFromAddress(): string {
  return Deno.env.get('RESEND_FROM_EMAIL') ?? 'PetClues <reminders@petclues.app>';
}

/** Production site — used for all transactional email links. */
export const PRODUCTION_APP_URL = 'https://petclues.com';

export function getAppBaseUrl(): string {
  const configured = Deno.env.get('APP_BASE_URL')?.trim();
  const base = (configured || PRODUCTION_APP_URL).replace(/\/$/, '');

  // Never embed dev URLs in emails sent to real users.
  if (/localhost|127\.0\.0\.1/i.test(base)) {
    return PRODUCTION_APP_URL;
  }

  return base;
}

export async function sendViaResend(input: SendEmailInput): Promise<ResendSendResult> {
  const resend = getResendClient();
  const subject = input.subject || subjectForEmail(input);
  const { html, text } = buildEmailContent(input);

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: input.to,
    subject,
    html,
    text,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, resendId: data?.id };
}
