/** Enable when Razorpay checkout and billing portal edge functions are deployed. */
export function isPaymentsLive(): boolean {
  return import.meta.env.VITE_PAYMENTS_ENABLED === 'true';
}

export const PAYMENTS_COMING_SOON_MESSAGE =
  'Payments are coming soon. Premium access can be granted manually during beta — email founder@petclues.com.';
