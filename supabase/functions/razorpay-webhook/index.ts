import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { verifyWebhookSignature } from '../_shared/razorpay/client.ts';
import {
  activateProSubscription,
  markPaymentFailed,
  paymentAlreadyProcessed,
} from '../_shared/razorpay/syncSubscription.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    const valid = await verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookPayload & { id?: string };
    const eventId = event.id ?? `${event.event}:${event.payload?.payment?.entity?.id ?? rawBody.slice(0, 32)}`;
    const eventType = event.event ?? 'unknown';

    const admin = adminClient();

    const { data: existing } = await admin
      .from('webhook_events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: logError } = await admin.from('webhook_events').insert({
      id: eventId,
      payload: JSON.parse(rawBody),
    });
    if (logError) throw new Error(logError.message);

    const payment = event.payload?.payment?.entity;
    const userId = payment?.notes?.user_id;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;

    if (eventType === 'payment.captured' && userId && orderId && paymentId) {
      if (!(await paymentAlreadyProcessed(admin, paymentId))) {
        await activateProSubscription(admin, { userId, orderId, paymentId });
      }
    } else if (eventType === 'payment.failed' && userId && orderId) {
      await markPaymentFailed(admin, { userId, orderId, paymentId });
    }

    return new Response(JSON.stringify({ received: true }), {
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
