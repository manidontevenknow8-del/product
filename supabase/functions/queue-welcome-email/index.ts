import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { appUrls, deliverTransactionalEmail } from '../_shared/email/sendTransactional.ts';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function userClient(authHeader: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anon) throw new Error('Supabase env vars missing');
  return createClient(url, anon, {
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = userClient(authHeader);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    const email = userData.user.email;
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: 'No email on account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = adminClient();
    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('queue_welcome_email', userId),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { data: profile } = await admin
      .from('profiles')
      .select('name')
      .eq('user_id', userId)
      .maybeSingle();

    const urls = appUrls();
    const outcome = await deliverTransactionalEmail(admin, {
      userId,
      to: email,
      dedupKey: 'welcome:v1',
      input: {
        type: 'welcome',
        to: email,
        subject: '',
        payload: {
          ownerName: profile?.name ?? userData.user.user_metadata?.name ?? '',
          dashboardUrl: urls.dashboardUrl,
          settingsUrl: urls.settingsUrl,
        },
      },
    });

    return new Response(JSON.stringify({ success: true, status: outcome }), {
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
