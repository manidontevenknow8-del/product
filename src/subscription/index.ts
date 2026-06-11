export { SubscriptionProvider, useSubscription } from './SubscriptionProvider';
export {
  canAccessFeature,
  canAddPet,
  canAccess,
  hasPremiumAccess,
  isPremiumTier,
  tierToPlan,
  FREE_PET_LIMIT,
  FEATURE_LABELS,
} from './featureGates';
export {
  resolveEffectivePlan,
  resolveEntitlements,
  getPetLimit,
  getDocumentLimit,
  getTimelineDayLimit,
  getPlanLabel,
  getUpgradeCta,
  getNextUpgradePlan,
  getLimitReachedMessage,
  canUploadDocument,
  canUseDecoder,
  PLAN_LABELS,
  PET_LIMITS,
  DOCUMENT_LIMITS,
  CUSTOM_LIMITS_EMAIL,
  PLAN_LIMITS_MATRIX,
} from './entitlements';
export { useFeatureAccess, planMeetsTier } from './useFeatureAccess';
export type { PremiumFeature, PlanFeature, CommercialPlan } from './entitlements';
export type {
  FeatureKey,
  FeatureAccessResult,
  PlanQuotaLimits,
  PlanFeatureAccess,
  UpgradeTierTarget,
} from './planLimits';
