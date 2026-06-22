/** @deprecated Import from pricingConfig.ts — kept for backward compatibility */
export {
  CUSTOM_LIMITS_EMAIL,
  BILLING_CYCLE,
  PLUS_ANNUAL_INR,
  PRO_ANNUAL_INR,
  PLUS_ANNUAL_USD,
  PRO_ANNUAL_USD,
  PLUS_ANNUAL_INR_MINOR as PLUS_ANNUAL_AMOUNT_MINOR_INR,
  PRO_ANNUAL_INR_MINOR as PRO_ANNUAL_AMOUNT_MINOR_INR,
  FOUNDING_DISCOUNT_PERCENT,
  PRO_ANNUAL_FOUNDING_INR as FOUNDING_DISCOUNTED_PRICE_INR,
  PRO_ANNUAL_FOUNDING_USD as FOUNDING_DISCOUNTED_PRICE_USD,
  PRO_ANNUAL_FOUNDING_INR_MINOR as FOUNDING_DISCOUNT_AMOUNT_MINOR_INR,
  formatInr,
  formatUsd,
  formatPrice,
  getAnnualPrice,
  getCheckoutAmountMinor,
  getPlanPriceLabel,
  getAnnualPriceDisplay,
  type BillingCurrency,
  type CheckoutPlan,
} from './pricingConfig';

import {
  formatPrice,
  getAnnualPrice,
  getAnnualPriceDisplay,
  getPlanPriceLabel,
  type BillingCurrency,
  type CheckoutPlan,
} from './pricingConfig';

export type RazorpayCheckoutPlan = CheckoutPlan;

export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID ?? '';
}

export function getPlanPriceDisplay(
  plan: CheckoutPlan,
  currency: BillingCurrency,
  foundingDiscount = false,
): string {
  return getPlanPriceLabel(plan, currency, foundingDiscount);
}

export function getAnnualMembershipDisplay(
  plan: CheckoutPlan,
  currency: BillingCurrency,
  foundingDiscount = false,
): string {
  return getAnnualPriceDisplay(plan, currency, foundingDiscount);
}

export const FOUNDING_DISCOUNTED_PRICE_DISPLAY_INR = formatPrice(
  getAnnualPrice('pro', 'INR', true),
  'INR',
);
export const FOUNDING_DISCOUNTED_PRICE_DISPLAY_USD = formatPrice(
  getAnnualPrice('pro', 'USD', true),
  'USD',
);

export function getFoundingDiscountedDisplay(currency: BillingCurrency): string {
  return formatPrice(getAnnualPrice('pro', currency, true), currency);
}

export const PLAN_PRICING_DISPLAY_INR: Record<CheckoutPlan, string> = {
  plus: formatPrice(getAnnualPrice('plus', 'INR'), 'INR'),
  pro: formatPrice(getAnnualPrice('pro', 'INR'), 'INR'),
};

export const PLAN_PRICING_DISPLAY_USD: Record<CheckoutPlan, string> = {
  plus: formatPrice(getAnnualPrice('plus', 'USD'), 'USD'),
  pro: formatPrice(getAnnualPrice('pro', 'USD'), 'USD'),
};
