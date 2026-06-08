import { getSupabaseClient } from '@/services/supabase/client';
import { PRO_MONTHLY_PRICE_DISPLAY } from '@/config/razorpayConfig';
import { razorpayCheckoutService } from '@/services/payments/razorpayCheckoutService';
import type { Subscription, UsageLimits } from '@/types/subscription';
import { FREE_PET_LIMIT } from '@/subscription/featureGates';
import type { ISubscriptionService } from './subscriptionService';

function formatRenewalDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapSubscriptionRow(
  profile: {
    subscription_plan: string | null;
    subscription_status: string | null;
    subscription_tier: string | null;
  } | null,
  row: {
    status: string;
    plan: string;
    expires_at: string | null;
    started_at: string | null;
  } | null,
): Subscription {
  const isPremium =
    profile?.subscription_status === 'active' ||
    profile?.subscription_tier === 'premium' ||
    profile?.subscription_tier === 'family';

  if (!isPremium) {
    return {
      plan: 'free',
      interval: 'monthly',
      status: 'inactive',
      renewalDate: null,
      cancelAtPeriodEnd: false,
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
    };
  }

  return {
    plan: 'premium',
    interval: 'monthly',
    status: row?.status === 'active' ? 'active' : 'active',
    renewalDate: formatRenewalDate(row?.expires_at ?? null),
    cancelAtPeriodEnd: false,
    subscriptionPlan: profile?.subscription_plan ?? row?.plan ?? 'pro',
    subscriptionStatus: profile?.subscription_status ?? 'active',
    startedAt: row?.started_at ?? null,
  };
}

export const supabaseSubscriptionService: ISubscriptionService = {
  async getSubscription(userId) {
    const supabase = getSupabaseClient();

    const [{ data: profile }, { data: subRow }] = await Promise.all([
      supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_tier')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('subscriptions')
        .select('status, plan, expires_at, started_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return mapSubscriptionRow(profile, subRow);
  },

  async getUsage(userId, plan) {
    const supabase = getSupabaseClient();
    const isFree = plan === 'free';

    const [{ count: petCount }, { count: scanCount }] = await Promise.all([
      supabase.from('pets').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
      supabase.from('vet_bill_extractions').select('id', { count: 'exact', head: true }).eq(
        'user_id',
        userId,
      ),
    ]);

    return {
      pets: {
        used: petCount ?? 0,
        limit: isFree ? FREE_PET_LIMIT : null,
      },
      scans: {
        used: scanCount ?? 0,
        limit: isFree ? 0 : null,
      },
      timelineMonths: {
        used: 0,
        limit: isFree ? 6 : null,
      },
    } satisfies UsageLimits;
  },

  async getInvoices(userId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, razorpay_payment_id, started_at, status, plan')
      .eq('user_id', userId)
      .not('razorpay_payment_id', 'is', null)
      .order('started_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.razorpay_payment_id ?? row.id,
      date: formatRenewalDate(row.started_at) ?? '-',
      amount: PRO_MONTHLY_PRICE_DISPLAY,
      status: row.status === 'active' || row.status === 'captured' ? 'paid' as const : 'pending' as const,
    }));
  },

  async startCheckout(userId, _plan, _interval, prefill) {
    await razorpayCheckoutService.startProCheckout({
      userId,
      prefill,
    });
  },

  async openBillingPortal(_userId) {
    window.location.assign('/billing');
  },
};
