/** Public Razorpay key — safe for frontend. Secret stays in Supabase Edge Functions. */
export function getRazorpayKeyId(): string {
  return import.meta.env.VITE_RAZORPAY_KEY_ID ?? '';
}

export const PRO_MONTHLY_PRICE_INR = 299;
export const PRO_MONTHLY_PRICE_DISPLAY = '₹299';
