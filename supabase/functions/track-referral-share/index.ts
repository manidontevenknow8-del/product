import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_CHANNELS = new Set(['copy', 'whatsapp', 'instagram', 'twitter', 'email']);

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

    const { channel } = (await req.json()) as { channel?: string };
    if (!channel || !ALLOWED_CHANNELS.has(channel)) {
      return new Response(JSON.stringify({ error: 'Invalid share channel' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = adminClient();

    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('track_referral_share', userData.user.id),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { error } = await admin.from('referral_share_events').insert({
      user_id: userData.user.id,
      channel,
    });

    if (error && !error.message.toLowerCase().includes('does not exist')) {
      throw new Error(error.message);
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
