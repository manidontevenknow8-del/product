import type { SubscriptionPlan } from '@/types/subscription';

export { PREMIUM_FEATURE_GATES, FEATURE_LABELS, FREE_PET_LIMIT } from '@/subscription/featureGates';
export type { PremiumFeature } from '@/subscription/featureGates';

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Daily care habit and organized health for one companion.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1 pet profile',
      'Daily check-in (feeding & walks)',
      'Reminders & automation',
      'Document vault & emergency passport',
      'Basic PetCare Score',
      'Monthly report (view)',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Save time with AI and unlock deeper insights.',
    monthlyPrice: 9,
    yearlyPrice: 79,
    highlighted: true,
    features: [
      'Unlimited pets',
      'Vet Bill Decoder (AI)',
      '7-day check-in trends',
      'Advanced PetCare Score & insights',
      'Monthly report PNG export',
      'Priority support',
    ],
  },
];
