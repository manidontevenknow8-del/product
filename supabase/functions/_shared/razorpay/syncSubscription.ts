import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.49.1';
import { appUrls, deliverTransactionalEmail } from '../email/sendTransactional.ts';
import { isRazorpayPlan, type BillingInterval, type RazorpayPlanId } from './client.ts';
import { planToLegacyTier } from '../subscription/entitlements.ts';

export async function paymentAlreadyProcessed(
  admin: SupabaseClient,
  paymentId: string,
): Promise<boolean> {
  const { data } = await admin
    .from('subscriptions')
    .select('id')
    .eq('razorpay_payment_id', paymentId)
    .maybeSingle();
  return Boolean(data);
}

export async function activatePaidSubscription(
  admin: SupabaseClient,
  input: {
    userId: string;
    orderId: string;
    paymentId: string;
    plan: RazorpayPlanId;
    interval?: BillingInterval;
  },
): Promise<void> {
  const billingInterval: BillingInterval = input.interval ?? 'monthly';
  const startedAt = new Date();
  const expiresAt = new Date(startedAt);
  if (billingInterval === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 30);
  }

  const { error: subError } = await admin.from('subscriptions').insert({
    user_id: input.userId,
    plan: input.plan,
    status: 'active',
    billing_interval: billingInterval,
    razorpay_order_id: input.orderId,
    razorpay_payment_id: input.paymentId,
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  if (subError) throw new Error(subError.message);

  const legacyTier = planToLegacyTier(input.plan === 'plus' ? 'plus' : 'pro');

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      subscription_plan: input.plan,
      subscription_status: 'active',
      subscription_tier: legacyTier,
    })
    .eq('user_id', input.userId);

  if (profileError) throw new Error(profileError.message);

  const { error: syncError } = await admin.rpc('sync_profile_subscription_tier', {
    p_user_id: input.userId,
  });
  if (syncError) throw new Error(syncError.message);

  const { error: refError } = await admin
    .from('referrals')
    .update({ status: 'converted', converted_at: new Date().toISOString() })
    .eq('invitee_user_id', input.userId)
    .is('converted_at', null);
  if (refError) throw new Error(refError.message);

  const { data: profile } = await admin
    .from('profiles')
    .select('email, name')
    .eq('user_id', input.userId)
    .maybeSingle();

  if (profile?.email) {
    const urls = appUrls();
    try {
      await deliverTransactionalEmail(admin, {
        userId: input.userId,
        to: profile.email,
        dedupKey: `premium:${input.paymentId}`,
        input: {
          type: 'premium_upgrade',
          to: profile.email,
          subject: '',
          payload: {
            ownerName: profile.name ?? '',
            interval: billingInterval,
            billingUrl: urls.billingUrl,
            dashboardUrl: urls.dashboardUrl,
          },
        },
      });
    } catch {
      // Non-blocking
    }
  }
}

/** @deprecated Use activatePaidSubscription */
export async function activateProSubscription(
  admin: SupabaseClient,
  input: { userId: string; orderId: string; paymentId: string },
): Promise<void> {
  return activatePaidSubscription(admin, { ...input, plan: 'pro' });
}

export async function markPaymentFailed(
  admin: SupabaseClient,
  input: { userId: string; orderId: string; paymentId?: string; plan?: string },
): Promise<void> {
  const plan = input.plan && isRazorpayPlan(input.plan) ? input.plan : 'pro';
  const { error } = await admin.from('subscriptions').insert({
    user_id: input.userId,
    plan,
    status: 'failed',
    razorpay_order_id: input.orderId,
    razorpay_payment_id: input.paymentId ?? null,
  });

  if (error) throw new Error(error.message);
}
