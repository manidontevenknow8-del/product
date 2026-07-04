import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import {
  createGenesisVaultOrder,
  genesisVaultPricing,
  getRazorpayKeyId,
  GENESIS_VAULT_PRODUCT,
  isBillingCurrency,
} from '../_shared/razorpay/client.ts';
import { clientIp } from '../_shared/security/auth.ts';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';
import { sanitizeEdgeUserError } from '../_shared/security/userFacingErrors.ts';

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
      rateLimitKey('create_genesis_razorpay_order', null, ip),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const { currency: rawCurrency } = (await req.json()) as { currency?: string };
    const currency = typeof rawCurrency === 'string' ? rawCurrency.toUpperCase() : 'USD';

    if (!isBillingCurrency(currency)) {
      return new Response(JSON.stringify({ error: 'currency must be "INR" or "USD"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sessionId = crypto.randomUUID();
    const order = await createGenesisVaultOrder({ currency, sessionId });
    const pricing = genesisVaultPricing(currency);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: pricing.amount,
        currency: pricing.currency,
        razorpayKey: getRazorpayKeyId(),
        product: GENESIS_VAULT_PRODUCT,
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
