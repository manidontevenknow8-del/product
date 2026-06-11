/** @deprecated Import from pricingConfig.ts — kept for backward compatibility */
export {
  CUSTOM_LIMITS_EMAIL,
  PLUS_MONTHLY_INR as PLUS_MONTHLY_PRICE_INR,
  PLUS_MONTHLY_PAISE as PLUS_MONTHLY_AMOUNT_PAISE,
  PRO_MONTHLY_INR as PRO_MONTHLY_PRICE_INR,
  PRO_MONTHLY_PAISE as PRO_MONTHLY_AMOUNT_PAISE,
  FOUNDING_DISCOUNT_PERCENT,
  PRO_MONTHLY_FOUNDING_INR as FOUNDING_DISCOUNTED_PRICE_INR,
  PRO_MONTHLY_FOUNDING_PAISE as FOUNDING_DISCOUNT_AMOUNT_PAISE,
  formatInr,
  getCheckoutAmountPaise,
  getPlanPriceLabel,
} from './pricingConfig';

import { formatInr, PRO_MONTHLY_INR, PRO_MONTHLY_FOUNDING_INR } from './pricingConfig';

export type RazorpayCheckoutPlan = 'plus' | 'pro';

export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID ?? '';
}

export const PLUS_MONTHLY_PRICE_DISPLAY = formatInr(2_999);
export const PRO_MONTHLY_PRICE_DISPLAY = formatInr(PRO_MONTHLY_INR);
export const FOUNDING_DISCOUNTED_PRICE_DISPLAY = formatInr(PRO_MONTHLY_FOUNDING_INR);

export const PLAN_PRICING_DISPLAY: Record<RazorpayCheckoutPlan, string> = {
  plus: PLUS_MONTHLY_PRICE_DISPLAY,
  pro: PRO_MONTHLY_PRICE_DISPLAY,
};

export function getPlanPriceDisplay(plan: RazorpayCheckoutPlan, foundingDiscount = false): string {
  if (plan === 'pro' && foundingDiscount) return FOUNDING_DISCOUNTED_PRICE_DISPLAY;
  return PLAN_PRICING_DISPLAY[plan];
}
