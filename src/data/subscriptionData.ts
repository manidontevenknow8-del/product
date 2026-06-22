import type { SubscriptionPlan } from '@/types/subscription';
import {
  PLUS_ANNUAL_INR,
  PRO_ANNUAL_INR,
  formatPrice,
  CUSTOM_LIMITS_EMAIL,
} from '@/config/pricingConfig';
import { PET_LIMITS } from '@/subscription/entitlements';

export {
  FEATURE_LABELS,
  PET_LIMITS,
  PLAN_LABELS,
  UPGRADE_CTA,
} from '@/subscription/entitlements';
export type { PremiumFeature, CommercialPlan, PlanFeature } from '@/subscription/entitlements';

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Professional organization for one companion — start your pet care journey.',
    annualPrice: 0,
    currency: 'INR',
    priceDisplay: '₹0',
    features: [
      `${PET_LIMITS.free} pet profile`,
      'Basic health record storage',
      'Basic reminders',
      'Basic timeline',
      'Daily check-ins & document vault',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'Complete pet care management for households with up to 3 pets.',
    annualPrice: PLUS_ANNUAL_INR,
    currency: 'INR',
    priceDisplay: `${formatPrice(PLUS_ANNUAL_INR, 'INR')} / year`,
    features: [
      `Up to ${PET_LIMITS.plus} pets`,
      'Pet passports & monthly reports',
      'Unlimited health records',
      'Advanced reminders & full timeline',
      'PetCare Score & basic AI',
      'Family sharing (2 members)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Advanced insights, priority support, and up to 10 pets.',
    annualPrice: PRO_ANNUAL_INR,
    currency: 'INR',
    priceDisplay: `${formatPrice(PRO_ANNUAL_INR, 'INR')} / year`,
    highlighted: true,
    features: [
      `Up to ${PET_LIMITS.pro} pets`,
      'Everything in Plus',
      'Advanced AI & PetCare Score',
      'Priority support',
      'Launching Soon features included',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Clinic-grade tools and custom solutions for 10+ pets.',
    annualPrice: 0,
    currency: 'INR',
    priceDisplay: 'Custom',
    contactOnly: true,
    features: [
      'More than 10 pets',
      'Clinic dashboard & staff accounts',
      'Organization management',
      'Dedicated account manager',
      `Contact ${CUSTOM_LIMITS_EMAIL}`,
    ],
  },
];
