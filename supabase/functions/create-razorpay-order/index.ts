import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  isRazorpayPlan,
  pricingForPlan,
  PRO_MONTHLY_PLAN,
  type BillingInterval,
} from '../_shared/razorpay/client.ts';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';
import { sanitizeEdgeUserError } from '../_shared/security/userFacingErrors.ts';

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

function parseInterval(raw: unknown): BillingInterval {
  if (raw === 'yearly' || raw === 'annual') return 'yearly';
  return 'monthly';
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

    const { plan: rawPlan, interval: rawInterval } = await req.json() as {
      plan?: string;
      interval?: string;
    };
    const plan = rawPlan ?? PRO_MONTHLY_PLAN;
    const interval = parseInterval(rawInterval);

    if (!isRazorpayPlan(plan)) {
      return new Response(JSON.stringify({ error: 'plan must be "plus" or "pro"' }), {
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

    const admin = adminClient();
    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('create_razorpay_order', userData.user.id),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { data: profile } = await admin
      .from('profiles')
      .select('founding_lifetime_discount')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const foundingDiscount = plan === PRO_MONTHLY_PLAN && profile?.founding_lifetime_discount === true;
    const pricing = pricingForPlan(plan, interval, foundingDiscount);

    const order = await createRazorpayOrder({
      userId: userData.user.id,
      plan,
      interval,
      amountPaise: pricing.amount,
    });

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: pricing.amount,
        foundingDiscount,
        currency: pricing.currency,
        razorpayKey: getRazorpayKeyId(),
        plan,
        interval,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = sanitizeEdgeUserError(err instanceof Error ? err.message : 'Unknown error', 'generic');
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
