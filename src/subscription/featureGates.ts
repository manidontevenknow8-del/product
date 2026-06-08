import type { PlanTier } from '@/types/subscription';
import type { SubscriptionTier } from '@/services/supabase/database.types';

export const FREE_PET_LIMIT = 1;

export type PremiumFeature =
  | 'unlimitedPets'
  | 'vetBillDecoder'
  | 'advancedHealthInsights'
  | 'unlimitedMonthlyReports'
  | 'premiumTimeline'
  | 'futureAiCompanion'
  | 'futureBreedIntelligence'
  | 'advancedPetCareScore'
  | 'prioritySupport'
  | 'futurePremium';

export const PREMIUM_FEATURE_GATES: Record<PremiumFeature, 'premium'> = {
  unlimitedPets: 'premium',
  vetBillDecoder: 'premium',
  advancedHealthInsights: 'premium',
  unlimitedMonthlyReports: 'premium',
  premiumTimeline: 'premium',
  futureAiCompanion: 'premium',
  futureBreedIntelligence: 'premium',
  advancedPetCareScore: 'premium',
  prioritySupport: 'premium',
  futurePremium: 'premium',
};

export const FEATURE_LABELS: Record<PremiumFeature, string> = {
  unlimitedPets: 'Unlimited pets',
  vetBillDecoder: 'Vet Bill Decoder',
  advancedHealthInsights: 'Advanced AI insights',
  unlimitedMonthlyReports: 'Unlimited monthly reports',
  premiumTimeline: 'Premium timeline enhancements',
  futureAiCompanion: 'Future AI companion',
  futureBreedIntelligence: 'Future breed intelligence',
  advancedPetCareScore: 'Advanced PetCare Score',
  prioritySupport: 'Priority support',
  futurePremium: 'Future premium features',
};

export function isPremiumTier(tier: PlanTier | SubscriptionTier | null | undefined): boolean {
  return tier === 'premium' || tier === 'family';
}

/** Source of truth: profiles.subscription_status, with tier fallback for founding/manual grants. */
export function hasPremiumAccess(input: {
  subscriptionStatus?: string | null;
  subscriptionTier?: PlanTier | SubscriptionTier | null;
}): boolean {
  if (input.subscriptionStatus === 'active') return true;
  return isPremiumTier(input.subscriptionTier ?? 'free');
}

export function canAccessFeature(
  input: {
    subscriptionStatus?: string | null;
    subscriptionTier?: PlanTier | SubscriptionTier | null;
  },
  feature: PremiumFeature,
): boolean {
  if (hasPremiumAccess(input)) return true;
  return PREMIUM_FEATURE_GATES[feature] !== 'premium';
}

export function canAddPet(
  input: {
    subscriptionStatus?: string | null;
    subscriptionTier?: PlanTier | SubscriptionTier | null;
  },
  currentPetCount: number,
): boolean {
  if (hasPremiumAccess(input)) return true;
  return currentPetCount < FREE_PET_LIMIT;
}

export function tierToPlan(tier: SubscriptionTier | null | undefined): PlanTier {
  return isPremiumTier(tier) ? 'premium' : 'free';
}
