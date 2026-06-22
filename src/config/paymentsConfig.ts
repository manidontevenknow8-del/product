/** Enable when Razorpay checkout and billing portal edge functions are deployed. */
export function isPaymentsLive(): boolean {
  return import.meta.env.VITE_PAYMENTS_ENABLED === 'true';
}

export const PAYMENTS_COMING_SOON_MESSAGE =
  'Online checkout is not available in your region yet. Contact support@petclues.com if you need help with your plan.';
