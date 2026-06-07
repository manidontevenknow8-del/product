import { getSupabaseClient } from '@/services/supabase/client';
import type {
  BillingInterval,
  Invoice,
  PlanTier,
  Subscription,
  UsageLimits,
} from '@/types/subscription';
import { FREE_PET_LIMIT } from '@/subscription/featureGates';
import type { ISubscriptionService } from './subscriptionService';

function formatRenewalDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapSubscriptionRow(
  profileTier: string | null,
  row: {
    status: string;
    interval: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null,
): Subscription {
  const isPremium = profileTier === 'premium' || profileTier === 'family';

  if (!isPremium) {
    return {
      plan: 'free',
      interval: 'monthly',
      status: 'active',
      renewalDate: null,
      cancelAtPeriodEnd: false,
    };
  }

  // Profile tier is source of truth (manual grant, founding, or Stripe sync).
  // Stripe row only enriches billing metadata when present.
  if (!row) {
    return {
      plan: 'premium',
      interval: 'monthly',
      status: 'active',
      renewalDate: null,
      cancelAtPeriodEnd: false,
    };
  }

  return {
    plan: 'premium',
    interval: row.interval === 'yearly' ? 'yearly' : 'monthly',
    status: row.status as Subscription['status'],
    renewalDate: formatRenewalDate(row.current_period_end),
    cancelAtPeriodEnd: row.cancel_at_period_end,
  };
}

async function invokeStripeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));

  return data as T;
}

export const supabaseSubscriptionService: ISubscriptionService = {
  async getSubscription(userId) {
    const supabase = getSupabaseClient();

    const [{ data: profile }, { data: subRow }] = await Promise.all([
      supabase.from('profiles').select('subscription_tier').eq('user_id', userId).single(),
      supabase.from('subscriptions').select(
        'status, interval, current_period_end, cancel_at_period_end',
      ).eq('user_id', userId).maybeSingle(),
    ]);

    return mapSubscriptionRow(profile?.subscription_tier ?? 'free', subRow);
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

  async getInvoices(_userId) {
    return [] as Invoice[];
  },

  async startCheckout(_userId, _plan: PlanTier, interval: BillingInterval) {
    const { url } = await invokeStripeFunction<{ url: string }>('create-checkout-session', {
      interval,
    });
    if (!url) throw new Error('Checkout session did not return a URL');
    window.location.assign(url);
  },

  async openBillingPortal(_userId) {
    const { url } = await invokeStripeFunction<{ url: string }>('create-portal-session', {});
    if (!url) throw new Error('Billing portal did not return a URL');
    window.location.assign(url);
  },
};
