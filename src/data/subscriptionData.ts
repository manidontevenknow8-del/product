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
      'Daily check-in (feeding & walks)',
      'Reminders & automation',
      'Document vault & emergency passport',
      'Basic PetCare Score',
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
      'Vet Bill Decoder (AI)',
      'Advanced AI health insights',
      'Unlimited monthly report exports',
      'Premium timeline enhancements',
      'Priority support',
    ],
  },
];
