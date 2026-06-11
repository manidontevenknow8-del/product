/** Server-side entitlement mirror — keep in sync with src/subscription/entitlements.ts */

export type CommercialPlan = 'free' | 'plus' | 'pro' | 'enterprise';

const PLAN_RANK: Record<CommercialPlan, number> = {
  free: 0,
  plus: 1,
  pro: 2,
  enterprise: 3,
};

export const PET_LIMITS: Record<CommercialPlan, number> = {
  free: 1,
  plus: 3,
  pro: 10,
  enterprise: 100,
};

export const DECODER_LIFETIME_LIMITS: Record<CommercialPlan, number | null> = {
  free: 2,
  plus: null,
  pro: null,
  enterprise: null,
};

export const DECODER_MONTHLY_LIMITS: Record<CommercialPlan, number | null> = {
  free: null,
  plus: 5,
  pro: 30,
  enterprise: null,
};

export const DOCUMENT_LIMITS: Record<CommercialPlan, number | null> = {
  free: 5,
  plus: null,
  pro: null,
  enterprise: null,
};

export const REMINDER_LIMITS: Record<CommercialPlan, number | null> = {
  free: 2,
  plus: null,
  pro: null,
  enterprise: null,
};

export const HEALTH_RECORD_LIMITS: Record<CommercialPlan, number | null> = {
  free: 3,
  plus: null,
  pro: null,
  enterprise: null,
};

export function resolveEffectivePlan(input: {
  subscriptionPlan?: string | null;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
}): CommercialPlan {
  const status = (input.subscriptionStatus ?? 'inactive').toLowerCase();
  const plan = (input.subscriptionPlan ?? 'free').toLowerCase();
  const tier = (input.subscriptionTier ?? 'free').toLowerCase();

  if (status === 'active' || status === 'trialing') {
    if (plan === 'enterprise' || tier === 'family') return 'enterprise';
    if (plan === 'pro' || tier === 'premium') return 'pro';
    if (plan === 'plus') return 'plus';
  }

  if (tier === 'family') return 'enterprise';
  if (tier === 'premium' && status !== 'inactive') return 'pro';

  return 'free';
}

export function planMeetsMinimum(current: CommercialPlan, required: CommercialPlan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

export function planToLegacyTier(plan: CommercialPlan): string {
  switch (plan) {
    case 'enterprise':
      return 'family';
    case 'pro':
    case 'plus':
      return 'premium';
    default:
      return 'free';
  }
}
