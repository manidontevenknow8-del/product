/**
 * Premium pricing — single source of truth for UI and Razorpay.
 * All amounts in INR (display) and paise (checkout).
 */

import type { CommercialPlan } from '@/subscription/planLimits';
import type { BillingInterval } from '@/types/subscription';

export const CUSTOM_LIMITS_EMAIL = 'support@petclues.com';

export const PLUS_MONTHLY_INR = 2_999;
export const PLUS_ANNUAL_INR = 29_990;
export const PLUS_ANNUAL_SAVINGS_INR = 5_998;

export const PRO_MONTHLY_INR = 4_999;
export const PRO_ANNUAL_INR = 49_990;
export const PRO_ANNUAL_SAVINGS_INR = 9_998;

export const PLUS_MONTHLY_PAISE = PLUS_MONTHLY_INR * 100;
export const PLUS_ANNUAL_PAISE = PLUS_ANNUAL_INR * 100;
export const PRO_MONTHLY_PAISE = PRO_MONTHLY_INR * 100;
export const PRO_ANNUAL_PAISE = PRO_ANNUAL_INR * 100;

export const FOUNDING_DISCOUNT_PERCENT = 5;
export const PRO_MONTHLY_FOUNDING_INR = Math.round(PRO_MONTHLY_INR * (1 - FOUNDING_DISCOUNT_PERCENT / 100));
export const PRO_ANNUAL_FOUNDING_INR = Math.round(PRO_ANNUAL_INR * (1 - FOUNDING_DISCOUNT_PERCENT / 100));
export const PRO_MONTHLY_FOUNDING_PAISE = PRO_MONTHLY_FOUNDING_INR * 100;
export const PRO_ANNUAL_FOUNDING_PAISE = PRO_ANNUAL_FOUNDING_INR * 100;

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return INR.format(amount);
}

export function getCheckoutAmountPaise(
  plan: 'plus' | 'pro',
  interval: BillingInterval,
  foundingDiscount = false,
): number {
  if (plan === 'plus') {
    return interval === 'yearly' ? PLUS_ANNUAL_PAISE : PLUS_MONTHLY_PAISE;
  }
  if (foundingDiscount) {
    return interval === 'yearly' ? PRO_ANNUAL_FOUNDING_PAISE : PRO_MONTHLY_FOUNDING_PAISE;
  }
  return interval === 'yearly' ? PRO_ANNUAL_PAISE : PRO_MONTHLY_PAISE;
}

export function getPlanPriceLabel(
  plan: CommercialPlan,
  interval: BillingInterval = 'monthly',
  foundingDiscount = false,
): string {
  switch (plan) {
    case 'free':
      return '₹0';
    case 'plus':
      return interval === 'yearly' ? formatInr(PLUS_ANNUAL_INR) : formatInr(PLUS_MONTHLY_INR);
    case 'pro':
      if (interval === 'yearly') {
        return formatInr(foundingDiscount ? PRO_ANNUAL_FOUNDING_INR : PRO_ANNUAL_INR);
      }
      return formatInr(foundingDiscount ? PRO_MONTHLY_FOUNDING_INR : PRO_MONTHLY_INR);
    case 'enterprise':
      return 'Custom';
    default:
      return '';
  }
}

export function getAnnualSavingsLabel(plan: 'plus' | 'pro'): string {
  const savings = plan === 'plus' ? PLUS_ANNUAL_SAVINGS_INR : PRO_ANNUAL_SAVINGS_INR;
  return `Save ${formatInr(savings)}/year`;
}

export const ANNUAL_BADGE = '2 Months Free';
