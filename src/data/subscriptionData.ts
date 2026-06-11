import type { SubscriptionPlan } from '@/types/subscription';
import {
  PLUS_ANNUAL_INR,
  PLUS_MONTHLY_INR,
  PRO_ANNUAL_INR,
  PRO_MONTHLY_INR,
  formatInr,
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
    monthlyPrice: 0,
    yearlyPrice: 0,
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
    monthlyPrice: PLUS_MONTHLY_INR,
    yearlyPrice: PLUS_ANNUAL_INR,
    priceDisplay: formatInr(PLUS_MONTHLY_INR),
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
    monthlyPrice: PRO_MONTHLY_INR,
    yearlyPrice: PRO_ANNUAL_INR,
    priceDisplay: formatInr(PRO_MONTHLY_INR),
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
    monthlyPrice: 0,
    yearlyPrice: 0,
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
