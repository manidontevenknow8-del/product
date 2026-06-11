/**
 * Strict plan limits & feature-access matrix — single source of truth.
 * Pricing display lives in `pricingConfig.ts`; quotas & gates live here.
 */

export type CommercialPlan = 'free' | 'plus' | 'pro' | 'enterprise';

/** Numeric cap or unlimited */
export type LimitValue = number | 'unlimited';

/** Self-service upgrade targets surfaced in the freemium funnel */
export type UpgradeTierTarget = 'Plus' | 'Pro';

/** Quota-based limits per plan */
export interface PlanQuotaLimits {
  pets: LimitValue;
  /** Max age of visible timeline history (days); unlimited = full history */
  timelineHistoryDays: LimitValue;
  /** Total stored documents */
  documents: LimitValue;
  /** Monthly Vet Bill Decoder scans (null = not applicable; use lifetime) */
  vetBillDecoderMonthly: LimitValue | null;
  /** Lifetime Vet Bill Decoder scans (null = not applicable; use monthly) */
  vetBillDecoderLifetime: LimitValue | null;
  familyMembers: LimitValue;
}

/** Boolean feature flags per plan */
export interface PlanFeatureAccess {
  aiRecordSearch: boolean;
  petPassport: boolean;
  monthlyReports: boolean;
  aiHealthInsights: boolean;
  emergencyMode: boolean;
  vetCollaborationPortal: boolean;
  smartProactiveReminders: boolean;
  apiAccess: boolean;
  customDomain: boolean;
}

export interface PlanPricingMeta {
  monthlyInr: number | null;
  displayLabel: string;
  contactSales: boolean;
}

export interface PlanEntitlementProfile {
  plan: CommercialPlan;
  pricing: PlanPricingMeta;
  quotas: PlanQuotaLimits;
  features: PlanFeatureAccess;
}

const UNLIMITED = 'unlimited' as const;

export const PLAN_LIMITS_MATRIX: Record<CommercialPlan, PlanEntitlementProfile> = {
  free: {
    plan: 'free',
    pricing: { monthlyInr: 0, displayLabel: '₹0', contactSales: false },
    quotas: {
      pets: 1,
      timelineHistoryDays: 30,
      documents: 5,
      vetBillDecoderMonthly: null,
      vetBillDecoderLifetime: 2,
      familyMembers: 0,
    },
    features: {
      aiRecordSearch: false,
      petPassport: false,
      monthlyReports: false,
      aiHealthInsights: false,
      emergencyMode: false,
      vetCollaborationPortal: false,
      smartProactiveReminders: false,
      apiAccess: false,
      customDomain: false,
    },
  },
  plus: {
    plan: 'plus',
    pricing: { monthlyInr: 2_999, displayLabel: '₹2,999/month', contactSales: false },
    quotas: {
      pets: 3,
      timelineHistoryDays: UNLIMITED,
      documents: UNLIMITED,
      vetBillDecoderMonthly: 5,
      vetBillDecoderLifetime: null,
      familyMembers: 2,
    },
    features: {
      aiRecordSearch: true,
      petPassport: true,
      monthlyReports: true,
      aiHealthInsights: false,
      emergencyMode: false,
      vetCollaborationPortal: false,
      smartProactiveReminders: false,
      apiAccess: false,
      customDomain: false,
    },
  },
  pro: {
    plan: 'pro',
    pricing: { monthlyInr: 4_999, displayLabel: '₹4,999/month', contactSales: false },
    quotas: {
      pets: 10,
      timelineHistoryDays: UNLIMITED,
      documents: UNLIMITED,
      vetBillDecoderMonthly: 30,
      vetBillDecoderLifetime: null,
      familyMembers: UNLIMITED,
    },
    features: {
      aiRecordSearch: true,
      petPassport: true,
      monthlyReports: true,
      aiHealthInsights: true,
      emergencyMode: true,
      vetCollaborationPortal: true,
      smartProactiveReminders: true,
      apiAccess: false,
      customDomain: false,
    },
  },
  enterprise: {
    plan: 'enterprise',
    pricing: { monthlyInr: null, displayLabel: 'Contact Sales', contactSales: true },
    quotas: {
      pets: UNLIMITED,
      timelineHistoryDays: UNLIMITED,
      documents: UNLIMITED,
      vetBillDecoderMonthly: UNLIMITED,
      vetBillDecoderLifetime: null,
      familyMembers: UNLIMITED,
    },
    features: {
      aiRecordSearch: true,
      petPassport: true,
      monthlyReports: true,
      aiHealthInsights: true,
      emergencyMode: true,
      vetCollaborationPortal: true,
      smartProactiveReminders: true,
      apiAccess: true,
      customDomain: true,
    },
  },
};

/** Keys for `useFeatureAccess` — quota + gated features */
export type FeatureKey =
  | 'pets'
  | 'timeline'
  | 'timelineHistory'
  | 'documents'
  | 'vetBillDecoder'
  | 'familyMembers'
  | 'aiRecordSearch'
  | 'petPassport'
  | 'monthlyReports'
  | 'aiHealthInsights'
  | 'emergencyMode'
  | 'vetCollaborationPortal'
  | 'smartProactiveReminders'
  | 'apiAccess'
  | 'customDomain'
  /** Alias → aiHealthInsights */
  | 'advancedHealthInsights'
  /** Alias → petPassport (Plus passport tools) */
  | 'emergencyCareMode'
  /** Alias → vetCollaborationPortal */
  | 'vetCollaboration';

export type FeatureAccessResult = {
  isAllowed: boolean;
  usageLimit: number | 'unlimited';
  currentUsage: number;
  upgradeTierTarget: UpgradeTierTarget;
};

/** Minimum self-serve tier required when a boolean feature is locked */
export const FEATURE_UPGRADE_TIER: Record<
  Exclude<
    FeatureKey,
    | 'pets'
    | 'timeline'
    | 'timelineHistory'
    | 'documents'
    | 'vetBillDecoder'
    | 'familyMembers'
    | 'advancedHealthInsights'
    | 'emergencyCareMode'
    | 'vetCollaboration'
  >,
  UpgradeTierTarget | 'Enterprise'
> = {
  aiRecordSearch: 'Plus',
  petPassport: 'Plus',
  monthlyReports: 'Plus',
  aiHealthInsights: 'Pro',
  emergencyMode: 'Pro',
  vetCollaborationPortal: 'Pro',
  smartProactiveReminders: 'Pro',
  apiAccess: 'Enterprise',
  customDomain: 'Enterprise',
};

export function getPlanProfile(plan: CommercialPlan): PlanEntitlementProfile {
  return PLAN_LIMITS_MATRIX[plan];
}

export function isUnlimited(value: LimitValue): value is 'unlimited' {
  return value === UNLIMITED;
}

export function limitToNumber(value: LimitValue): number | 'unlimited' {
  return value;
}

export function numericLimit(value: LimitValue | null): number | null {
  if (value == null) return null;
  return isUnlimited(value) ? null : value;
}

export function hasFeatureAccess(plan: CommercialPlan, feature: keyof PlanFeatureAccess): boolean {
  return PLAN_LIMITS_MATRIX[plan].features[feature];
}

export function getQuotaLimits(plan: CommercialPlan): PlanQuotaLimits {
  return PLAN_LIMITS_MATRIX[plan].quotas;
}

/** Maps enterprise-only targets to Pro for self-serve upgrade CTAs */
export function toSelfServeUpgradeTier(
  tier: UpgradeTierTarget | 'Enterprise',
): UpgradeTierTarget {
  return tier === 'Enterprise' ? 'Pro' : tier;
}
