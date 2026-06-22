/** Razorpay REST + signature helpers — keep in sync with src/config/pricingConfig.ts */

export const PLUS_PLAN = 'plus' as const;
export const PRO_PLAN = 'pro' as const;

export type BillingCurrency = 'INR' | 'USD';
export type BillingCycle = 'annual';

export const BILLING_CYCLE: BillingCycle = 'annual';

export const PLUS_ANNUAL_INR_MINOR = 199_900;
export const PRO_ANNUAL_INR_MINOR = 499_900;
export const PLUS_ANNUAL_USD_MINOR = 9_900;
export const PRO_ANNUAL_USD_MINOR = 29_900;

export const FOUNDING_DISCOUNT_PERCENT = 5;
export const PRO_ANNUAL_FOUNDING_INR_MINOR = Math.round(
  PRO_ANNUAL_INR_MINOR * (1 - FOUNDING_DISCOUNT_PERCENT / 100),
);
export const PRO_ANNUAL_FOUNDING_USD_MINOR = Math.round(
  PRO_ANNUAL_USD_MINOR * (1 - FOUNDING_DISCOUNT_PERCENT / 100),
);

export type RazorpayPlanId = typeof PLUS_PLAN | typeof PRO_PLAN;

export function isRazorpayPlan(plan: string): plan is RazorpayPlanId {
  return plan === PLUS_PLAN || plan === PRO_PLAN;
}

export function isBillingCurrency(value: string): value is BillingCurrency {
  return value === 'INR' || value === 'USD';
}

export function pricingForPlan(
  plan: RazorpayPlanId,
  currency: BillingCurrency,
  foundingDiscount = false,
): { amount: number; currency: BillingCurrency } {
  if (plan === PLUS_PLAN) {
    return {
      amount: currency === 'INR' ? PLUS_ANNUAL_INR_MINOR : PLUS_ANNUAL_USD_MINOR,
      currency,
    };
  }

  if (foundingDiscount) {
    return {
      amount:
        currency === 'INR' ? PRO_ANNUAL_FOUNDING_INR_MINOR : PRO_ANNUAL_FOUNDING_USD_MINOR,
      currency,
    };
  }

  return {
    amount: currency === 'INR' ? PRO_ANNUAL_INR_MINOR : PRO_ANNUAL_USD_MINOR,
    currency,
  };
}

export function getRazorpayKeyId(): string {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  if (!keyId) throw new Error('RAZORPAY_KEY_ID is not configured');
  return keyId;
}

export function getRazorpayKeySecret(): string {
  const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!secret) throw new Error('RAZORPAY_KEY_SECRET is not configured');
  return secret;
}

export function getRazorpayWebhookSecret(): string {
  const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  return secret;
}

function basicAuthHeader(): string {
  const keyId = getRazorpayKeyId();
  const secret = getRazorpayKeySecret();
  return `Basic ${btoa(`${keyId}:${secret}`)}`;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
};

export async function createRazorpayOrder(input: {
  userId: string;
  plan: RazorpayPlanId;
  currency: BillingCurrency;
  amountMinor?: number;
}): Promise<RazorpayOrder> {
  const pricing = pricingForPlan(input.plan, input.currency);
  const amount = input.amountMinor ?? pricing.amount;
  const currency = pricing.currency;
  const receipt = `${input.plan}_annual_${input.userId.slice(0, 8)}_${Date.now()}`;

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes: {
        user_id: input.userId,
        plan: input.plan,
        billing_cycle: BILLING_CYCLE,
        currency,
      },
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    const message = typeof body?.error?.description === 'string'
      ? body.error.description
      : 'Failed to create Razorpay order';
    throw new Error(message);
  }

  return body as RazorpayOrder;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  const expected = await hmacSha256Hex(
    getRazorpayKeySecret(),
    `${orderId}|${paymentId}`,
  );
  return timingSafeEqual(expected, signature);
}

export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const expected = await hmacSha256Hex(getRazorpayWebhookSecret(), rawBody);
  return timingSafeEqual(expected, signature);
}
