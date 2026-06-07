import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { appUrls, deliverTransactionalEmail } from '../_shared/email/sendTransactional.ts';
import { clientIp } from '../_shared/security/auth.ts';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';
import { isValidEmail, normalizeEmail, trimTo, LIMITS } from '../_shared/security/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = adminClient();
    const ip = clientIp(req);
    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('founding_member_signup', null, ip),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { email, referralSource } = (await req.json()) as {
      email?: string;
      referralSource?: string | null;
    };

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const safeReferralSource = trimTo(referralSource, LIMITS.referralSource);

    const { error } = await admin.from('founding_member_signups').insert({
      email: normalizedEmail,
      referral_source: safeReferralSource,
    });

    const isDuplicate = Boolean(error?.message.toLowerCase().includes('duplicate'));

    if (error && !isDuplicate) {
      return new Response(JSON.stringify({ success: false, error: 'Unable to save signup. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const urls = appUrls();
    let emailStatus: 'sent' | 'skipped' | 'failed' = 'skipped';

    try {
      const outcome = await deliverTransactionalEmail(admin, {
        userId: null,
        to: normalizedEmail,
        dedupKey: `founding:${normalizedEmail}`,
        input: {
          type: 'founding_member_confirmation',
          to: normalizedEmail,
          subject: '',
          payload: {
            dashboardUrl: urls.landingUrl,
            signupUrl: urls.signupUrl,
          },
        },
      });
      emailStatus = outcome;
    } catch {
      emailStatus = 'failed';
    }

    return new Response(JSON.stringify({ success: true, emailStatus, duplicate: isDuplicate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
