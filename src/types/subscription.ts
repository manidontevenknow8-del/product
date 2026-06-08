export type PlanTier = 'free' | 'premium';

export type BillingInterval = 'monthly' | 'yearly';

export type SubscriptionPlan = {
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceDisplay: string;
  features: string[];
  highlighted?: boolean;
};

export type Subscription = {
  plan: PlanTier;
  interval: BillingInterval;
  status: 'active' | 'inactive' | 'trialing' | 'canceled' | 'past_due' | 'failed';
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  startedAt?: string | null;
};

export type UsageLimits = {
  pets: { used: number; limit: number | null };
  scans: { used: number; limit: number | null };
  timelineMonths: { used: number; limit: number | null };
};

export type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending';
};

export type CheckoutPrefill = {
  email: string;
  name: string;
};
