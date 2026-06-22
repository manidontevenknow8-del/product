/** @deprecated Import from pricingConfig.ts — kept for backward compatibility */
export {
  CUSTOM_LIMITS_EMAIL,
  BILLING_CYCLE,
  ANNUAL_BILLING_LABEL,
  PLUS_ANNUAL_INR,
  PRO_ANNUAL_INR,
  PLUS_ANNUAL_USD,
  PRO_ANNUAL_USD,
  FOUNDING_DISCOUNT_PERCENT,
  formatInr,
  formatUsd,
  formatPrice,
  getAnnualPrice,
  getPlanPriceLabel,
  getAnnualPriceParts,
  type BillingCurrency,
  type CheckoutPlan,
} from './pricingConfig';

import { formatPrice, getAnnualPrice, getAnnualPriceParts, type BillingCurrency, type CheckoutPlan } from './pricingConfig';

export type RazorpayCheckoutPlan = CheckoutPlan;

export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID ?? '';
}

export function getPlanPriceDisplay(
  plan: CheckoutPlan,
  currency: BillingCurrency,
  foundingDiscount = false,
): string {
  const { amount, period } = getAnnualPriceParts(plan, currency, foundingDiscount);
  return `${amount} ${period}`;
}

export function getAnnualMembershipDisplay(
  plan: CheckoutPlan,
  currency: BillingCurrency,
  foundingDiscount = false,
): string {
  return getPlanPriceDisplay(plan, currency, foundingDiscount);
}

export function getFoundingDiscountedDisplay(currency: BillingCurrency): string {
  return formatPrice(getAnnualPrice('pro', currency, true), currency);
}
