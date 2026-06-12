/**
 * Thin compatibility layer - delegates to entitlements.ts.
 * Do not add new gate logic here.
 */
import type { PlanTier } from '@/types/subscription';
import type { SubscriptionTier } from '@/services/supabase/database.types';
import {
  type CommercialPlan,
  type EntitlementInput,
  type PlanFeature,
  type PremiumFeature,
  canAccessLegacyFeature,
  canAccessPlanFeature,
  canAddPet as canAddPetForPlan,
  canCreateHealthRecord as canCreateHealthRecordForPlan,
  canCreateReminder as canCreateReminderForPlan,
  canUseDecoder as canUseDecoderForPlan,
  FEATURE_LABELS,
  getDecoderMonthlyLimit,
  getHealthRecordLimit,
  getReminderLimit,
  getTimelineDayLimit,
  getTimelineMonthLimit,
  isPaidPlan,
  LEGACY_FEATURE_MAP,
  PET_LIMITS,
  resolveEffectivePlan,
  resolveEntitlements,
} from './entitlements';

export {
  FEATURE_LABELS,
  LEGACY_FEATURE_MAP as PREMIUM_FEATURE_GATES,
  PET_LIMITS,
  resolveEntitlements,
};
export type { PremiumFeature, PlanFeature, CommercialPlan };

/** @deprecated Use PET_LIMITS.free */
export const FREE_PET_LIMIT = PET_LIMITS.free;
/** @deprecated Use getReminderLimit('free') */
export const FREE_REMINDER_LIMIT = getReminderLimit('free') ?? 2;
/** @deprecated Use getHealthRecordLimit('free') */
export const FREE_HEALTH_RECORD_LIMIT = getHealthRecordLimit('free') ?? 3;
export const FREE_TIMELINE_DAYS = getTimelineDayLimit('free') ?? 30;
/** @deprecated Use FREE_TIMELINE_DAYS */
export const FREE_TIMELINE_MONTHS = getTimelineMonthLimit('free') ?? 1;

function toPlan(input: EntitlementInput): CommercialPlan {
  return resolveEffectivePlan(input);
}

/** @deprecated Use isPaidPlan(resolveEffectivePlan(input)) */
export function isPremiumTier(tier: PlanTier | SubscriptionTier | CommercialPlan | null | undefined): boolean {
  if (tier === 'plus' || tier === 'pro' || tier === 'enterprise') return true;
  return tier === 'premium' || tier === 'family';
}

/** @deprecated Use resolveEffectivePlan + isPaidPlan */
export function hasPremiumAccess(input: EntitlementInput): boolean {
  return isPaidPlan(toPlan(input));
}

export function canAccessFeature(input: EntitlementInput, feature: PremiumFeature): boolean {
  return canAccessLegacyFeature(toPlan(input), feature);
}

export function canAccess(input: EntitlementInput, feature: PlanFeature): boolean {
  return canAccessPlanFeature(toPlan(input), feature);
}

export function canAddPet(input: EntitlementInput, currentPetCount: number): boolean {
  return canAddPetForPlan(toPlan(input), currentPetCount);
}

export function canCreateReminder(input: EntitlementInput, activeReminderCount: number): boolean {
  return canCreateReminderForPlan(toPlan(input), activeReminderCount);
}

export function canCreateHealthRecord(input: EntitlementInput, recordCount: number): boolean {
  return canCreateHealthRecordForPlan(toPlan(input), recordCount);
}

export function canUseDecoder(input: EntitlementInput, monthlyDecodeCount: number): boolean {
  const plan = toPlan(input);
  return canUseDecoderForPlan(plan, {
    monthly: monthlyDecodeCount,
    lifetime: monthlyDecodeCount,
  });
}

export function getDecoderLimit(input: EntitlementInput): number | null {
  return getDecoderMonthlyLimit(toPlan(input));
}

/** @deprecated Use resolveEffectivePlan */
export function tierToPlan(tier: SubscriptionTier | null | undefined): PlanTier {
  const plan = resolveEffectivePlan({ subscriptionTier: tier });
  return plan === 'free' ? 'free' : 'premium';
}
