import type { PlanTier } from '@/types/subscription';
import type { SubscriptionTier } from '@/services/supabase/database.types';

export const FREE_PET_LIMIT = 1;

export type PremiumFeature =
  | 'unlimitedPets'
  | 'vetBillDecoder'
  | 'advancedPetCareScore'
  | 'advancedHealthInsights'
  | 'prioritySupport'
  | 'futurePremium';

export const PREMIUM_FEATURE_GATES: Record<PremiumFeature, 'premium'> = {
  unlimitedPets: 'premium',
  vetBillDecoder: 'premium',
  advancedPetCareScore: 'premium',
  advancedHealthInsights: 'premium',
  prioritySupport: 'premium',
  futurePremium: 'premium',
};

export const FEATURE_LABELS: Record<PremiumFeature, string> = {
  unlimitedPets: 'Unlimited pets',
  vetBillDecoder: 'Vet Bill Decoder',
  advancedPetCareScore: 'Advanced PetCare Score',
  advancedHealthInsights: 'Advanced health insights',
  prioritySupport: 'Priority support',
  futurePremium: 'Future premium features',
};

export function isPremiumTier(tier: PlanTier | SubscriptionTier | null | undefined): boolean {
  return tier === 'premium' || tier === 'family';
}

export function canAccessFeature(
  tier: PlanTier | SubscriptionTier | null | undefined,
  feature: PremiumFeature,
): boolean {
  if (isPremiumTier(tier)) return true;
  return PREMIUM_FEATURE_GATES[feature] !== 'premium';
}

export function canAddPet(
  tier: PlanTier | SubscriptionTier | null | undefined,
  currentPetCount: number,
): boolean {
  if (isPremiumTier(tier)) return true;
  return currentPetCount < FREE_PET_LIMIT;
}

export function tierToPlan(tier: SubscriptionTier | null | undefined): PlanTier {
  return isPremiumTier(tier) ? 'premium' : 'free';
}
