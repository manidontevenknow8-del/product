import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { getAppBaseUrl, getStripeClient } from '../_shared/stripe/client.ts';
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
      rateLimitKey('create_portal_session', userData.user.id),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { data: customerRow, error: customerError } = await admin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (customerError) {
      return new Response(JSON.stringify({ error: customerError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!customerRow?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No billing account yet. Subscribe to Premium first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerRow.stripe_customer_id,
      return_url: `${getAppBaseUrl()}/billing`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
