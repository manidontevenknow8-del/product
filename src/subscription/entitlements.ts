/**
 * Single source of truth for PetClues plan entitlements.
 * Quota matrix: `planLimits.ts` · Pricing: `pricingConfig.ts`
 */

import {
  getPlanProfile,
  getQuotaLimits,
  hasFeatureAccess,
  isUnlimited,
  numericLimit,
  type CommercialPlan,
  type PlanFeatureAccess,
} from '@/subscription/planLimits';

export type { CommercialPlan, FeatureKey, PlanFeatureAccess, PlanQuotaLimits } from '@/subscription/planLimits';
export { PLAN_LIMITS_MATRIX, FEATURE_UPGRADE_TIER } from '@/subscription/planLimits';

export type PlanFeature =
  | 'addPet'
  | 'basicDashboard'
  | 'basicReminders'
  | 'basicTimeline'
  | 'limitedHealthRecords'
  | 'reportPreview'
  | 'petPassport'
  | 'petCareScore'
  | 'aiRecordSearch'
  | 'advancedReminders'
  | 'vetBillDecoder'
  | 'familySharing'
  | 'monthlyReportExport'
  | 'premiumTimeline'
  | 'aiHealthInsights'
  | 'emergencyMode'
  | 'vetCollaborationPortal'
  | 'smartProactiveReminders'
  | 'advancedAiInsights'
  | 'advancedPetCareScore'
  | 'prioritySupport'
  | 'apiAccess'
  | 'customDomain'
  | 'enterprisePetVolume'
  | 'customLimitsSupport'
  /** @deprecated */
  | 'basicAi'
  | 'careAutomation'
  | 'richMonthlyReports'
  | 'richTimeline'
  | 'advancedAutomation'
  | 'comingSoonFeatures'
  | 'enterpriseExclusive'
  | 'basicPassport'
  | 'limitedAiInsight';

/** @deprecated Use PlanFeature — kept for gradual migration */
export type PremiumFeature =
  | 'unlimitedPets'
  | 'unlimitedReminders'
  | 'unlimitedHealthRecords'
  | 'vetBillDecoder'
  | 'advancedHealthInsights'
  | 'unlimitedMonthlyReports'
  | 'premiumTimeline'
  | 'futureAiCompanion'
  | 'futureBreedIntelligence'
  | 'advancedPetCareScore'
  | 'prioritySupport'
  | 'futurePremium';

export const PLAN_RANK: Record<CommercialPlan, number> = {
  free: 0,
  plus: 1,
  pro: 2,
  enterprise: 3,
};

/** Derived from PLAN_LIMITS_MATRIX — kept for backward compatibility */
export const PET_LIMITS: Record<CommercialPlan, number> = {
  free: numericLimit(getQuotaLimits('free').pets) ?? 1,
  plus: numericLimit(getQuotaLimits('plus').pets) ?? 3,
  pro: numericLimit(getQuotaLimits('pro').pets) ?? 10,
  enterprise: 100,
};

export const FAMILY_SHARING_LIMITS: Record<CommercialPlan, number | null> = {
  free: numericLimit(getQuotaLimits('free').familyMembers),
  plus: numericLimit(getQuotaLimits('plus').familyMembers),
  pro: null,
  enterprise: null,
};

export const DOCUMENT_LIMITS: Record<CommercialPlan, number | null> = {
  free: numericLimit(getQuotaLimits('free').documents),
  plus: null,
  pro: null,
  enterprise: null,
};

export const TIMELINE_DAY_LIMITS: Record<CommercialPlan, number | null> = {
  free: numericLimit(getQuotaLimits('free').timelineHistoryDays),
  plus: null,
  pro: null,
  enterprise: null,
};

/** @deprecated Prefer TIMELINE_DAY_LIMITS */
export const TIMELINE_MONTH_LIMITS: Record<CommercialPlan, number | null> = {
  free: 1,
  plus: null,
  pro: null,
  enterprise: null,
};

export const DECODER_LIFETIME_LIMITS: Record<CommercialPlan, number | null> = {
  free: numericLimit(getQuotaLimits('free').vetBillDecoderLifetime),
  plus: null,
  pro: null,
  enterprise: null,
};

export const DECODER_MONTHLY_LIMITS: Record<CommercialPlan, number | null> = {
  free: null,
  plus: numericLimit(getQuotaLimits('plus').vetBillDecoderMonthly),
  pro: numericLimit(getQuotaLimits('pro').vetBillDecoderMonthly),
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

export const PLAN_LABELS: Record<CommercialPlan, string> = {
  free: 'Free',
  plus: 'Plus',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const PLAN_DESCRIPTIONS: Record<CommercialPlan, string> = {
  free: 'Start your pet care journey with one companion.',
  plus: 'Complete care for households with up to 3 pets.',
  pro: 'Advanced insights, proactive tools, and up to 10 pets.',
  enterprise: 'Unlimited scale with API access and custom domain.',
};

export const NEXT_PLAN: Record<CommercialPlan, CommercialPlan | null> = {
  free: 'plus',
  plus: 'pro',
  pro: 'enterprise',
  enterprise: null,
};

export const UPGRADE_CTA: Record<CommercialPlan, string> = {
  free: 'Upgrade to Plus',
  plus: 'Upgrade to Pro',
  pro: 'Contact Enterprise Sales',
  enterprise: 'Contact support@petclues.com',
};

export const UPGRADE_HEADLINE: Record<CommercialPlan, string> = {
  free: 'Unlock more pets, documents, and professional care tools with Plus.',
  plus: 'Go deeper with Pro — AI insights, emergency mode, and up to 10 pets.',
  pro: 'Need unlimited scale? Contact Enterprise for API access and custom domain.',
  enterprise: 'Need a custom deployment? Contact our team.',
};

export const CUSTOM_LIMITS_EMAIL = 'support@petclues.com';

/** Minimum plan required to access each feature */
export const FEATURE_MIN_PLAN: Record<PlanFeature, CommercialPlan> = {
  addPet: 'free',
  basicDashboard: 'free',
  basicReminders: 'free',
  basicTimeline: 'free',
  limitedHealthRecords: 'free',
  reportPreview: 'free',
  vetBillDecoder: 'free',
  petPassport: 'plus',
  petCareScore: 'plus',
  aiRecordSearch: 'plus',
  advancedReminders: 'plus',
  familySharing: 'plus',
  monthlyReportExport: 'plus',
  premiumTimeline: 'plus',
  aiHealthInsights: 'pro',
  emergencyMode: 'pro',
  vetCollaborationPortal: 'pro',
  smartProactiveReminders: 'pro',
  advancedAiInsights: 'pro',
  advancedPetCareScore: 'pro',
  prioritySupport: 'pro',
  apiAccess: 'enterprise',
  customDomain: 'enterprise',
  enterprisePetVolume: 'enterprise',
  customLimitsSupport: 'enterprise',
  basicAi: 'plus',
  careAutomation: 'plus',
  richMonthlyReports: 'pro',
  richTimeline: 'pro',
  advancedAutomation: 'pro',
  comingSoonFeatures: 'pro',
  enterpriseExclusive: 'enterprise',
  basicPassport: 'plus',
  limitedAiInsight: 'plus',
};

/** Maps legacy PremiumFeature keys to PlanFeature */
export const LEGACY_FEATURE_MAP: Record<PremiumFeature, PlanFeature> = {
  unlimitedPets: 'addPet',
  unlimitedReminders: 'advancedReminders',
  unlimitedHealthRecords: 'limitedHealthRecords',
  vetBillDecoder: 'vetBillDecoder',
  advancedHealthInsights: 'aiHealthInsights',
  unlimitedMonthlyReports: 'monthlyReportExport',
  premiumTimeline: 'premiumTimeline',
  futureAiCompanion: 'smartProactiveReminders',
  futureBreedIntelligence: 'aiHealthInsights',
  advancedPetCareScore: 'advancedPetCareScore',
  prioritySupport: 'prioritySupport',
  futurePremium: 'smartProactiveReminders',
};

export const FEATURE_LABELS: Record<PremiumFeature, string> = {
  unlimitedPets: 'More pets',
  unlimitedReminders: 'Smart proactive reminders',
  unlimitedHealthRecords: 'Unlimited health records',
  vetBillDecoder: 'Vet Bill Decoder',
  advancedHealthInsights: 'AI health insights',
  unlimitedMonthlyReports: 'Monthly reports',
  premiumTimeline: 'Full timeline',
  futureAiCompanion: 'Smart proactive reminders',
  futureBreedIntelligence: 'AI health insights',
  advancedPetCareScore: 'Advanced PetCare Score',
  prioritySupport: 'Priority support',
  futurePremium: 'Pro care tools',
};

export type EntitlementInput = {
  subscriptionPlan?: string | null;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
};

export function planRank(plan: CommercialPlan): number {
  return PLAN_RANK[plan];
}

export function planMeetsMinimum(current: CommercialPlan, required: CommercialPlan): boolean {
  return planRank(current) >= planRank(required);
}

export function resolveEffectivePlan(input: EntitlementInput): CommercialPlan {
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

export function getPetLimit(plan: CommercialPlan): number {
  if (plan === 'enterprise') return PET_LIMITS.enterprise;
  const value = getQuotaLimits(plan).pets;
  return isUnlimited(value) ? Number.MAX_SAFE_INTEGER : value;
}

export function getDocumentLimit(plan: CommercialPlan): number | null {
  return numericLimit(getQuotaLimits(plan).documents);
}

export function getTimelineDayLimit(plan: CommercialPlan): number | null {
  return numericLimit(getQuotaLimits(plan).timelineHistoryDays);
}

export function getFamilySharingLimit(plan: CommercialPlan): number | null {
  const value = getQuotaLimits(plan).familyMembers;
  return numericLimit(value);
}

export function getDecoderMonthlyLimit(plan: CommercialPlan): number | null {
  const value = getQuotaLimits(plan).vetBillDecoderMonthly;
  return numericLimit(value);
}

export function getDecoderLifetimeLimit(plan: CommercialPlan): number | null {
  const value = getQuotaLimits(plan).vetBillDecoderLifetime;
  return numericLimit(value);
}

/** @deprecated Use getTimelineDayLimit */
export function getTimelineMonthLimit(plan: CommercialPlan): number | null {
  return TIMELINE_MONTH_LIMITS[plan];
}

export function getReminderLimit(plan: CommercialPlan): number | null {
  return REMINDER_LIMITS[plan];
}

export function getHealthRecordLimit(plan: CommercialPlan): number | null {
  return HEALTH_RECORD_LIMITS[plan];
}

export function hasMatrixFeatureAccess(
  plan: CommercialPlan,
  feature: keyof PlanFeatureAccess,
): boolean {
  return hasFeatureAccess(plan, feature);
}

export function canAccessPlanFeature(plan: CommercialPlan, feature: PlanFeature): boolean {
  return planMeetsMinimum(plan, FEATURE_MIN_PLAN[feature]);
}

export function canAccessLegacyFeature(plan: CommercialPlan, feature: PremiumFeature): boolean {
  return canAccessPlanFeature(plan, LEGACY_FEATURE_MAP[feature]);
}

export function canAddPet(plan: CommercialPlan, currentPetCount: number): boolean {
  const limit = numericLimit(getQuotaLimits(plan).pets);
  if (limit == null) return true;
  return currentPetCount < limit;
}

export function canUploadDocument(plan: CommercialPlan, documentCount: number): boolean {
  const limit = getDocumentLimit(plan);
  if (limit == null) return true;
  return documentCount < limit;
}

export function canCreateReminder(plan: CommercialPlan, activeCount: number): boolean {
  const limit = getReminderLimit(plan);
  if (limit == null) return true;
  return activeCount < limit;
}

export function canCreateHealthRecord(plan: CommercialPlan, recordCount: number): boolean {
  const limit = getHealthRecordLimit(plan);
  if (limit == null) return true;
  return recordCount < limit;
}

export type DecoderUsageCounts = {
  monthly: number;
  lifetime: number;
};

export function canUseDecoder(
  plan: CommercialPlan,
  counts: DecoderUsageCounts,
): boolean {
  const lifetimeLimit = getDecoderLifetimeLimit(plan);
  if (lifetimeLimit != null) {
    return counts.lifetime < lifetimeLimit;
  }
  const monthlyLimit = getDecoderMonthlyLimit(plan);
  if (monthlyLimit == null) return true;
  return counts.monthly < monthlyLimit;
}

/** @deprecated Use canUseDecoder with monthly + lifetime counts */
export function canDecodeVetBill(plan: CommercialPlan, monthlyDecodeCount: number): boolean {
  return canUseDecoder(plan, { monthly: monthlyDecodeCount, lifetime: monthlyDecodeCount });
}

export function getNextUpgradePlan(plan: CommercialPlan): CommercialPlan | null {
  return NEXT_PLAN[plan];
}

export function getRequiredPlanForFeature(feature: PlanFeature): CommercialPlan {
  return FEATURE_MIN_PLAN[feature];
}

export function getRequiredPlanForLegacyFeature(feature: PremiumFeature): CommercialPlan {
  return getRequiredPlanForFeature(LEGACY_FEATURE_MAP[feature]);
}

export function getUpgradeCta(currentPlan: CommercialPlan, feature?: PlanFeature | PremiumFeature): string {
  if (feature) {
    const planFeature: PlanFeature =
      feature in LEGACY_FEATURE_MAP
        ? LEGACY_FEATURE_MAP[feature as PremiumFeature]
        : (feature as PlanFeature);
    const required = FEATURE_MIN_PLAN[planFeature];
    if (required === 'enterprise') return 'Contact Enterprise Sales';
    return `Upgrade to ${PLAN_LABELS[required]}`;
  }
  return UPGRADE_CTA[currentPlan];
}

export function getUpgradeHeadline(currentPlan: CommercialPlan): string {
  return UPGRADE_HEADLINE[currentPlan];
}

export function getPlanLabel(plan: CommercialPlan): string {
  return PLAN_LABELS[plan];
}

export function isPaidPlan(plan: CommercialPlan): boolean {
  return plan !== 'free';
}

export function isCheckoutPlan(plan: CommercialPlan): plan is 'plus' | 'pro' {
  return plan === 'plus' || plan === 'pro';
}

export function getLimitReachedMessage(
  plan: CommercialPlan,
  limitType: 'pets' | 'reminders' | 'healthRecords' | 'decoder' | 'documents',
): string {
  const next = getNextUpgradePlan(plan);
  if (limitType === 'pets' && plan === 'pro') {
    return `Your Pro plan includes up to ${PET_LIMITS.pro} pets. Need more? Contact ${CUSTOM_LIMITS_EMAIL} for Enterprise.`;
  }
  if (plan === 'enterprise') {
    return `You've reached your pet limit. Email ${CUSTOM_LIMITS_EMAIL} for custom limits.`;
  }
  const nextLabel = next ? PLAN_LABELS[next] : 'a higher plan';
  switch (limitType) {
    case 'pets':
      return `Your ${PLAN_LABELS[plan]} plan includes up to ${getPetLimit(plan)} pet${getPetLimit(plan) === 1 ? '' : 's'}. Upgrade to ${nextLabel}.`;
    case 'documents':
      return `Your ${PLAN_LABELS[plan]} plan includes ${DOCUMENT_LIMITS.free} documents. Upgrade to ${nextLabel} for unlimited storage.`;
    case 'reminders':
      return `Your ${PLAN_LABELS[plan]} plan includes ${REMINDER_LIMITS.free} active reminders. Upgrade to ${nextLabel}.`;
    case 'healthRecords':
      return `Your ${PLAN_LABELS[plan]} plan includes basic health record storage. Upgrade to ${nextLabel}.`;
    case 'decoder':
      if (plan === 'free') {
        return `You've used your ${DECODER_LIFETIME_LIMITS.free} free Vet Bill Decoder scans. Upgrade to ${nextLabel}.`;
      }
      return `You've used your monthly decode allowance. Upgrade to ${nextLabel} for more.`;
    default:
      return `Upgrade to ${nextLabel} to continue.`;
  }
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

export function resolveEntitlements(input: EntitlementInput) {
  const plan = resolveEffectivePlan(input);
  const profile = getPlanProfile(plan);
  return {
    plan,
    planLabel: getPlanLabel(plan),
    petLimit: getPetLimit(plan),
    documentLimit: getDocumentLimit(plan),
    timelineDayLimit: getTimelineDayLimit(plan),
    reminderLimit: getReminderLimit(plan),
    healthRecordLimit: getHealthRecordLimit(plan),
    timelineMonthLimit: getTimelineMonthLimit(plan),
    decoderMonthlyLimit: getDecoderMonthlyLimit(plan),
    decoderLifetimeLimit: getDecoderLifetimeLimit(plan),
    familySharingLimit: getFamilySharingLimit(plan),
    pricingLabel: profile.pricing.displayLabel,
    nextUpgradePlan: getNextUpgradePlan(plan),
    upgradeCta: getUpgradeCta(plan),
    isPaid: isPaidPlan(plan),
  };
}
