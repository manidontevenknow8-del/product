/** Public Razorpay key — safe for frontend. Secret stays in Supabase Edge Functions. */
export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID ?? '';
}

/** Pro plan — keep in sync with supabase/functions/_shared/razorpay/client.ts */
export const PRO_MONTHLY_PRICE_INR = 1999;
export const PRO_MONTHLY_AMOUNT_PAISE = 199_900;
export const PRO_MONTHLY_PRICE_DISPLAY = '₹1,999';

/** Founding member lifelong discount */
export const FOUNDING_DISCOUNT_PERCENT = 5;
export const FOUNDING_DISCOUNTED_PRICE_INR = Math.round(
  PRO_MONTHLY_PRICE_INR * (1 - FOUNDING_DISCOUNT_PERCENT / 100),
);
export const FOUNDING_DISCOUNT_AMOUNT_PAISE = Math.round(
  PRO_MONTHLY_AMOUNT_PAISE * (1 - FOUNDING_DISCOUNT_PERCENT / 100),
);
export const FOUNDING_DISCOUNTED_PRICE_DISPLAY = '₹1,899';
