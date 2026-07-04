import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import {
  GENESIS_VAULT_PRODUCT,
  isBillingCurrency,
  verifyPaymentSignature,
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
      rateLimitKey('verify_genesis_razorpay_payment', null, ip),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const body = (await req.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      currency?: string;
      amount?: number;
      email?: string;
    };

    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId || !signature) {
      return new Response(JSON.stringify({ error: 'Missing payment verification fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const valid = await verifyPaymentSignature(orderId, paymentId, signature);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: existing } = await admin
      .from('genesis_vault_purchases')
      .select('id')
      .eq('razorpay_payment_id', paymentId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const currency =
      body.currency && isBillingCurrency(body.currency.toUpperCase())
        ? body.currency.toUpperCase()
        : 'USD';
    const amountMinor = typeof body.amount === 'number' && body.amount > 0 ? body.amount : null;

    const { error: insertError } = await admin.from('genesis_vault_purchases').insert({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      email: body.email?.trim() || null,
      currency,
      amount_minor: amountMinor,
      product: GENESIS_VAULT_PRODUCT,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = sanitizeEdgeUserError(err instanceof Error ? err.message : 'Unknown error', 'generic');
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
