import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { generateReferralCode } from '../_shared/referrals/code.ts';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';

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

async function getOrCreateCode(args: { userId: string; name: string; email: string }) {
  const admin = adminClient();
  const existing = await admin
    .from('referral_codes')
    .select('code')
    .eq('user_id', args.userId)
    .maybeSingle();

  if (existing.data?.code) return existing.data.code as string;

  // Retry on collision
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateReferralCode(args.name || args.email);
    const { error } = await admin.from('referral_codes').insert({
      user_id: args.userId,
      code,
    });
    if (!error) return code;
    if (!error.message.toLowerCase().includes('duplicate')) {
      throw new Error(error.message);
    }
  }

  throw new Error('Unable to generate a unique referral code.');
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

    const admin = adminClient();
    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('get_referral_code', userData.user.id),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('user_id', userData.user.id)
      .single();

    const code = await getOrCreateCode({
      userId: userData.user.id,
      name: profile?.name ?? '',
      email: profile?.email ?? userData.user.email ?? '',
    });

    return new Response(JSON.stringify({ code }), {
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

