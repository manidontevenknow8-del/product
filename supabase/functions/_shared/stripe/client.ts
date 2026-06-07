import Stripe from 'npm:stripe@17.5.0';

export function getStripeClient(): Stripe {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function getAppBaseUrl(): string {
  return Deno.env.get('APP_BASE_URL') ?? 'http://localhost:5173';
}

export function priceIdForInterval(interval: 'monthly' | 'yearly'): string {
  const envKey = interval === 'yearly'
    ? 'STRIPE_PRICE_PREMIUM_YEARLY'
    : 'STRIPE_PRICE_PREMIUM_MONTHLY';
  const priceId = Deno.env.get(envKey);
  if (!priceId) {
    throw new Error(`${envKey} is not configured.`);
  }
  return priceId;
}
