export type PlanTier = 'free' | 'premium';

export type BillingInterval = 'monthly' | 'yearly';

export type SubscriptionPlan = {
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
};

export type Subscription = {
  plan: PlanTier;
  interval: BillingInterval;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
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
