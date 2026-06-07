import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { getAppBaseUrl, getStripeClient, priceIdForInterval } from '../_shared/stripe/client.ts';
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

async function getOrCreateStripeCustomer(
  admin: ReturnType<typeof adminClient>,
  userId: string,
  email: string,
): Promise<string> {
  const { data: existing } = await admin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });

  const { error } = await admin.from('stripe_customers').upsert(
    {
      user_id: userId,
      stripe_customer_id: customer.id,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw new Error(error.message);

  const { data: row } = await admin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  return row?.stripe_customer_id ?? customer.id;
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

    const { interval } = await req.json() as { interval?: 'monthly' | 'yearly' };
    if (interval !== 'monthly' && interval !== 'yearly') {
      return new Response(JSON.stringify({ error: 'interval must be monthly or yearly' }), {
        status: 400,
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError || !profile?.email) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = adminClient();
    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('create_checkout_session', userData.user.id),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const customerId = await getOrCreateStripeCustomer(
      admin,
      userData.user.id,
      profile.email,
    );

    const baseUrl = getAppBaseUrl();
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceIdForInterval(interval), quantity: 1 }],
      success_url: `${baseUrl}/billing?checkout=success`,
      cancel_url: `${baseUrl}/billing?checkout=canceled`,
      metadata: { user_id: userData.user.id, interval },
      subscription_data: {
        metadata: { user_id: userData.user.id, interval },
      },
    });

    if (!session.url) {
      return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
