import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.49.1';
import type Stripe from 'npm:stripe@17.5.0';
import { appUrls, deliverTransactionalEmail } from '../email/sendTransactional.ts';

type SubscriptionInterval = 'monthly' | 'yearly';

function intervalFromStripe(subscription: Stripe.Subscription): SubscriptionInterval {
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  return interval === 'year' ? 'yearly' : 'monthly';
}

function periodTimestamp(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

export async function resolveUserIdFromSubscription(
  admin: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const metadataUserId = subscription.metadata?.user_id;
  if (metadataUserId) return metadataUserId;

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  if (!customerId) return null;

  const { data } = await admin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  return data?.user_id ?? null;
}

export async function upsertSubscriptionFromStripe(
  admin: SupabaseClient,
  subscription: Stripe.Subscription,
  userId: string,
): Promise<void> {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id ?? '';

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status,
      plan: 'premium',
      interval: intervalFromStripe(subscription),
      current_period_start: periodTimestamp(subscription.current_period_start),
      current_period_end: periodTimestamp(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw new Error(error.message);

  const { error: syncError } = await admin.rpc('sync_profile_subscription_tier', {
    p_user_id: userId,
  });

  if (syncError) throw new Error(syncError.message);

  // Referral conversion tracking (architecture only; no rewards issued here)
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    const { error: refError } = await admin
      .from('referrals')
      .update({ status: 'converted', converted_at: new Date().toISOString() })
      .eq('invitee_user_id', userId)
      .is('converted_at', null);
    if (refError) throw new Error(refError.message);

    const { data: profile } = await admin
      .from('profiles')
      .select('email, name')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile?.email) {
      const urls = appUrls();
      try {
        await deliverTransactionalEmail(admin, {
          userId,
          to: profile.email,
          dedupKey: `premium:${subscription.id}`,
          input: {
            type: 'premium_upgrade',
            to: profile.email,
            subject: '',
            payload: {
              ownerName: profile.name ?? '',
              interval: intervalFromStripe(subscription),
              billingUrl: urls.billingUrl,
              dashboardUrl: urls.dashboardUrl,
            },
          },
        });
      } catch {
        // Non-blocking — subscription sync must succeed even if email fails
      }
    }
  }
}

export async function clearSubscriptionForUser(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await admin
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
    })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  const { error: syncError } = await admin.rpc('sync_profile_subscription_tier', {
    p_user_id: userId,
  });

  if (syncError) throw new Error(syncError.message);
}
