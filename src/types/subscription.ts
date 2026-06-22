import type { CommercialPlan } from '@/subscription/entitlements';

/** @deprecated Prefer CommercialPlan */
export type PlanTier = 'free' | 'premium';

/** Plans available for Razorpay checkout */
export type CheckoutPlan = 'plus' | 'pro';

export type BillingCurrency = 'INR' | 'USD';
export type BillingCycle = 'annual';

export type SubscriptionPlan = {
  id: CommercialPlan;
  name: string;
  description: string;
  annualPrice: number;
  priceDisplay: string;
  currency: BillingCurrency;
  features: string[];
  highlighted?: boolean;
  contactOnly?: boolean;
};

export type Subscription = {
  /** Normalized commercial plan */
  commercialPlan: CommercialPlan;
  /** @deprecated Legacy binary plan */
  plan: 'free' | 'premium';
  billingCycle: BillingCycle;
  currency: BillingCurrency | null;
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
  currency?: BillingCurrency;
};

export type CheckoutPrefill = {
  email: string;
  name: string;
};
