import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { getStripeClient } from '../_shared/stripe/client.ts';
import {
  clearSubscriptionForUser,
  resolveUserIdFromSubscription,
  upsertSubscriptionFromStripe,
} from '../_shared/stripe/syncSubscription.ts';

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Atomically claim webhook event before processing (prevents concurrent double-apply). */
async function claimWebhookEvent(
  admin: ReturnType<typeof adminClient>,
  eventId: string,
  eventType: string,
): Promise<boolean> {
  const { error } = await admin.from('stripe_webhook_events').insert({
    id: eventId,
    event_type: eventType,
  });

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return false;
    }
    throw new Error(error.message);
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  try {
    const stripe = getStripeClient();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const admin = adminClient();

    const claimed = await claimWebhookEvent(admin, event.id, event.type);
    if (!claimed) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = session.metadata?.user_id
            ?? await resolveUserIdFromSubscription(admin, subscription);

          if (userId) {
            await upsertSubscriptionFromStripe(admin, subscription, userId);
          }
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = await resolveUserIdFromSubscription(admin, subscription);
        if (userId) {
          await upsertSubscriptionFromStripe(admin, subscription, userId);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = await resolveUserIdFromSubscription(admin, subscription);
        if (userId) {
          await clearSubscriptionForUser(admin, userId);
        }
        break;
      }
      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
