import {
  formatPrice,
  getAnnualPrice,
  type BillingCurrency,
} from '@/config/pricingConfig';
import { razorpayCheckoutService } from '@/services/payments/razorpayCheckoutService';
import { getSupabaseClient } from '@/services/supabase/client';
import {
  getDecoderLifetimeLimit,
  getDecoderMonthlyLimit,
  getDocumentLimit,
  getFamilySharingLimit,
  getHealthRecordLimit,
  getPetLimit,
  getReminderLimit,
  getTimelineDayLimit,
  resolveEffectivePlan,
} from '@/subscription/entitlements';
import type { CommercialPlan } from '@/subscription/entitlements';
import type { Subscription, UsageLimits } from '@/types/subscription';
import type { ISubscriptionService } from './subscriptionService';

function formatRenewalDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseCurrency(value: string | null | undefined): BillingCurrency | null {
  if (value === 'INR' || value === 'USD') return value;
  return null;
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
    currency?: string | null;
    billing_cycle?: string | null;
  } | null,
): Subscription {
  const commercialPlan = resolveEffectivePlan({
    subscriptionPlan: profile?.subscription_plan,
    subscriptionTier: profile?.subscription_tier,
    subscriptionStatus: profile?.subscription_status,
  });

  const isPaid = commercialPlan !== 'free';

  return {
    commercialPlan,
    plan: isPaid ? 'premium' : 'free',
    billingCycle: 'annual',
    currency: parseCurrency(row?.currency),
    status: isPaid
      ? (profile?.subscription_status === 'trialing' ? 'trialing' : 'active')
      : 'inactive',
    renewalDate: formatRenewalDate(row?.expires_at ?? null),
    cancelAtPeriodEnd: false,
    subscriptionPlan: profile?.subscription_plan ?? row?.plan ?? 'free',
    subscriptionStatus: profile?.subscription_status ?? (isPaid ? 'active' : 'inactive'),
    subscriptionTier: profile?.subscription_tier ?? 'free',
    billingProvider: 'razorpay',
    startedAt: row?.started_at ?? null,
  };
}

function formatInvoiceAmount(
  plan: string | null | undefined,
  currency: BillingCurrency | null,
  amountPaid: number | null | undefined,
): string {
  if (amountPaid != null && currency) {
    return formatPrice(amountPaid / 100, currency);
  }
  if (plan === 'plus' && currency) {
    return formatPrice(getAnnualPrice('plus', currency), currency);
  }
  if (plan === 'pro' && currency) {
    return formatPrice(getAnnualPrice('pro', currency), currency);
  }
  return ', ';
}

export const supabaseSubscriptionService: ISubscriptionService = {
  async getSubscription(userId) {
    const supabase = getSupabaseClient();
    await supabase.rpc('expire_founding_trials');

    const [{ data: profile }, { data: subRow }] = await Promise.all([
      supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_tier')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('subscriptions')
        .select('status, plan, expires_at, started_at, currency, billing_cycle')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return mapSubscriptionRow(profile, subRow);
  },

  async getUsage(userId, commercialPlan: CommercialPlan) {
    const supabase = getSupabaseClient();

    const { data: userPets } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', userId);

    const petIds = (userPets ?? []).map((pet) => pet.id);
    const petCount = petIds.length;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const healthRecordsQuery =
      petIds.length > 0
        ? supabase
            .from('health_records')
            .select('id', { count: 'exact', head: true })
            .in('pet_id', petIds)
        : Promise.resolve({ count: 0, error: null });

    const documentsQuery =
      petIds.length > 0
        ? supabase
            .from('pet_documents')
            .select('id', { count: 'exact', head: true })
            .in('pet_id', petIds)
        : Promise.resolve({ count: 0, error: null });

    const remindersQuery =
      petIds.length > 0
        ? supabase
            .from('reminders')
            .select('id', { count: 'exact', head: true })
            .in('pet_id', petIds)
            .eq('completed', false)
        : Promise.resolve({ count: 0, error: null });

    const [
      { count: lifetimeScanCount },
      { count: monthlyScanCount },
      { count: documentCount },
      { count: reminderCount },
      { count: recordCount },
    ] = await Promise.all([
      supabase
        .from('vet_bill_extractions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('vet_bill_extractions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString()),
      documentsQuery,
      remindersQuery,
      healthRecordsQuery,
    ]);

    const monthlyDecoderLimit = getDecoderMonthlyLimit(commercialPlan);
    const timelineDayLimit = getTimelineDayLimit(commercialPlan);

    return {
      pets: {
        used: petCount,
        limit: getPetLimit(commercialPlan),
      },
      documents: {
        used: documentCount ?? 0,
        limit: getDocumentLimit(commercialPlan),
      },
      scans: {
        used: monthlyDecoderLimit != null ? (monthlyScanCount ?? 0) : (lifetimeScanCount ?? 0),
        limit: monthlyDecoderLimit,
      },
      scansLifetime: {
        used: lifetimeScanCount ?? 0,
        limit: getDecoderLifetimeLimit(commercialPlan),
      },
      timelineDays: {
        used: 0,
        limit: timelineDayLimit,
      },
      timelineMonths: {
        used: 0,
        limit: timelineDayLimit != null ? 1 : null,
      },
      familyMembers: {
        used: 0,
        limit: getFamilySharingLimit(commercialPlan),
      },
      reminders: {
        used: reminderCount ?? 0,
        limit: getReminderLimit(commercialPlan),
      },
      healthRecords: {
        used: recordCount ?? 0,
        limit: getHealthRecordLimit(commercialPlan),
      },
    } satisfies UsageLimits;
  },

  async getInvoices(userId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, razorpay_payment_id, started_at, status, plan, currency, amount_paid')
      .eq('user_id', userId)
      .not('razorpay_payment_id', 'is', null)
      .order('started_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.razorpay_payment_id ?? row.id,
      date: formatRenewalDate(row.started_at) ?? '-',
      amount: formatInvoiceAmount(row.plan, parseCurrency(row.currency), row.amount_paid),
      plan: row.plan ?? 'pro',
      currency: parseCurrency(row.currency) ?? undefined,
      status: row.status === 'active' || row.status === 'captured' ? 'paid' as const : 'pending' as const,
    }));
  },

  async startCheckout(userId, plan, currency, prefill, options) {
    await razorpayCheckoutService.startCheckout({
      userId,
      plan,
      currency,
      countryCode: options?.countryCode,
      foundingDiscount: options?.foundingDiscount,
      prefill,
    });
  },

  async openBillingPortal(_userId) {
    window.location.assign('/billing');
  },
};
