/**
 * Annual membership pricing, single source of truth for UI and Razorpay.
 * India: INR (paise). International: USD (cents).
 */

import type { CommercialPlan } from '@/subscription/planLimits';

export const CUSTOM_LIMITS_EMAIL = 'support@petclues.com';

export type BillingCurrency = 'INR' | 'USD';
export type CheckoutPlan = 'plus' | 'pro';
export type BillingCycle = 'annual';

export const BILLING_CYCLE: BillingCycle = 'annual';
export const ANNUAL_BILLING_LABEL = 'Billed annually';

export const PLUS_ANNUAL_INR = 1_999;
export const PRO_ANNUAL_INR = 4_999;
export const PLUS_ANNUAL_USD = 99;
export const PRO_ANNUAL_USD = 299;

export const PLUS_ANNUAL_INR_MINOR = PLUS_ANNUAL_INR * 100;
export const PRO_ANNUAL_INR_MINOR = PRO_ANNUAL_INR * 100;
export const PLUS_ANNUAL_USD_MINOR = PLUS_ANNUAL_USD * 100;
export const PRO_ANNUAL_USD_MINOR = PRO_ANNUAL_USD * 100;

export const FOUNDING_DISCOUNT_PERCENT = 5;
export const PRO_ANNUAL_FOUNDING_INR = Math.round(
  PRO_ANNUAL_INR * (1 - FOUNDING_DISCOUNT_PERCENT / 100),
);
export const PRO_ANNUAL_FOUNDING_USD = Math.round(
  PRO_ANNUAL_USD * (1 - FOUNDING_DISCOUNT_PERCENT / 100),
);
export const PRO_ANNUAL_FOUNDING_INR_MINOR = PRO_ANNUAL_FOUNDING_INR * 100;
export const PRO_ANNUAL_FOUNDING_USD_MINOR = PRO_ANNUAL_FOUNDING_USD * 100;

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return INR_FORMATTER.format(amount);
}

export function formatUsd(amount: number): string {
  return USD_FORMATTER.format(amount);
}

export function formatPrice(amount: number, currency: BillingCurrency): string {
  return currency === 'INR' ? formatInr(amount) : formatUsd(amount);
}

export function getAnnualPrice(
  plan: CheckoutPlan,
  currency: BillingCurrency,
  foundingDiscount = false,
): number {
  if (plan === 'plus') {
    return currency === 'INR' ? PLUS_ANNUAL_INR : PLUS_ANNUAL_USD;
  }
  if (foundingDiscount) {
    return currency === 'INR' ? PRO_ANNUAL_FOUNDING_INR : PRO_ANNUAL_FOUNDING_USD;
  }
  return currency === 'INR' ? PRO_ANNUAL_INR : PRO_ANNUAL_USD;
}

export function getPlanPriceLabel(
  plan: CommercialPlan,
  currency: BillingCurrency = 'INR',
  foundingDiscount = false,
): string {
  switch (plan) {
    case 'free':
      return currency === 'INR' ? '₹0' : '$0';
    case 'plus':
      return formatPrice(currency === 'INR' ? PLUS_ANNUAL_INR : PLUS_ANNUAL_USD, currency);
    case 'pro':
      return formatPrice(getAnnualPrice('pro', currency, foundingDiscount), currency);
    case 'enterprise':
      return 'Custom';
    default:
      return '';
  }
}

export function getAnnualPriceParts(
  plan: CheckoutPlan,
  currency: BillingCurrency,
  foundingDiscount = false,
): { amount: string; period: string } {
  return {
    amount: formatPrice(getAnnualPrice(plan, currency, foundingDiscount), currency),
    period: '/ year',
  };
}

/** Annual membership label for any commercial plan in the visitor's region. */
export function getPlanAnnualDisplayLabel(
  plan: CommercialPlan,
  currency: BillingCurrency,
  foundingDiscount = false,
): string {
  if (plan === 'enterprise') return 'Contact Sales';
  if (plan === 'free') return getPlanPriceLabel('free', currency);
  if (plan === 'plus' || plan === 'pro') {
    return `${getPlanPriceLabel(plan, currency, foundingDiscount)} / year`;
  }
  return '';
}
