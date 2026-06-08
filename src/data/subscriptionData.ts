import type { SubscriptionPlan } from '@/types/subscription';
import { PRO_MONTHLY_PRICE_DISPLAY } from '@/config/razorpayConfig';

export { PREMIUM_FEATURE_GATES, FEATURE_LABELS, FREE_PET_LIMIT } from '@/subscription/featureGates';
export type { PremiumFeature } from '@/subscription/featureGates';

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Daily care habit and organized health for one companion.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceDisplay: 'Free',
    features: [
      '1 pet profile',
      'Up to 2 active reminders',
      'Up to 3 health records',
      'Daily check-in (feeding & walks)',
      'Document vault & emergency passport',
      'Basic PetCare Score',
      '6-month timeline history',
      'Monthly report (view only)',
    ],
  },
  {
    id: 'premium',
    name: 'Pro',
    description: 'Unlock AI tools, unlimited pets, and deeper insights.',
    monthlyPrice: 299,
    yearlyPrice: 299,
    priceDisplay: `${PRO_MONTHLY_PRICE_DISPLAY}/month`,
    highlighted: true,
    features: [
      'Unlimited pets',
      'Unlimited reminders',
      'Unlimited health records',
      'Vet Bill Decoder (AI)',
      'Advanced AI health insights',
      'Full timeline history',
      'Unlimited monthly report exports',
      'Advanced PetCare Score',
      'Priority support',
    ],
  },
];
