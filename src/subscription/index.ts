export { SubscriptionProvider, useSubscription } from './SubscriptionProvider';
export {
  canAccessFeature,
  canAddPet,
  isPremiumTier,
  tierToPlan,
  FREE_PET_LIMIT,
  PREMIUM_FEATURE_GATES,
  FEATURE_LABELS,
} from './featureGates';
export type { PremiumFeature } from './featureGates';
