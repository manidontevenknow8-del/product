import type { CommercialPlan } from '@/subscription/entitlements';

/** @deprecated Prefer CommercialPlan */
export type PlanTier = 'free' | 'premium';

export type BillingInterval = 'monthly' | 'yearly';

/** Plans available for Razorpay checkout */
export type CheckoutPlan = 'plus' | 'pro';

export type SubscriptionPlan = {
  id: CommercialPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceDisplay: string;
  features: string[];
  highlighted?: boolean;
  contactOnly?: boolean;
};

export type Subscription = {
  /** Normalized commercial plan */
  commercialPlan: CommercialPlan;
  /** @deprecated Legacy binary plan */
  plan: PlanTier;
  interval: BillingInterval;
  status: 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due' | 'failed';
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  billingProvider: 'razorpay';
  startedAt?: string | null;
};

export type UsageLimits = {
  pets: { used: number; limit: number | null };
  documents: { used: number; limit: number | null };
  scans: { used: number; limit: number | null };
  scansLifetime: { used: number; limit: number | null };
  timelineDays: { used: number; limit: number | null };
  /** @deprecated Prefer timelineDays */
  timelineMonths: { used: number; limit: number | null };
  familyMembers: { used: number; limit: number | null };
  reminders: { used: number; limit: number | null };
  healthRecords: { used: number; limit: number | null };
};

export type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending';
  plan?: string;
};

export type CheckoutPrefill = {
  email: string;
  name: string;
};
