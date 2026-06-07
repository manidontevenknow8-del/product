import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';
import { isValidEmail, normalizeEmail, trimTo, LIMITS } from '../_shared/security/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function userClient(authHeader: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) throw new Error('Supabase env vars missing');
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = userClient(authHeader);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, referralSource } = (await req.json()) as {
      email?: string;
      referralSource?: string | null;
    };

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Valid invite email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const inviteeEmail = normalizeEmail(email);
    const admin = adminClient();

    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('send_referral_invite', userData.user.id),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { data: codeRow, error: codeError } = await admin
      .from('referral_codes')
      .select('code')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (codeError || !codeRow?.code) {
      return new Response(JSON.stringify({ error: 'Referral code not found. Call get-referral-code first.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: insertError } = await admin.from('referrals').insert({
      inviter_user_id: userData.user.id,
      referral_code: codeRow.code,
      invitee_email: inviteeEmail,
      referral_source: trimTo(referralSource, LIMITS.referralSource) ?? 'in_app',
      status: 'invited',
      invited_at: new Date().toISOString(),
    });

    // Ignore duplicates per (inviter_user_id, lower(invitee_email))
    if (insertError && !insertError.message.toLowerCase().includes('duplicate')) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

