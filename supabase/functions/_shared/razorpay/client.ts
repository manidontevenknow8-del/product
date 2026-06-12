/** Razorpay REST + signature helpers - keep in sync with src/config/pricingConfig.ts */

export const PLUS_MONTHLY_PLAN = 'plus' as const;
export const PRO_MONTHLY_PLAN = 'pro' as const;

export const PLUS_MONTHLY_AMOUNT_PAISE = 299_900;
export const PLUS_ANNUAL_AMOUNT_PAISE = 2_999_000;
export const PRO_MONTHLY_AMOUNT_PAISE = 499_900;
export const PRO_ANNUAL_AMOUNT_PAISE = 4_999_000;

export const FOUNDING_DISCOUNT_PERCENT = 5;
export const PRO_MONTHLY_FOUNDING_PAISE = Math.round(PRO_MONTHLY_AMOUNT_PAISE * (1 - FOUNDING_DISCOUNT_PERCENT / 100));
export const PRO_ANNUAL_FOUNDING_PAISE = Math.round(PRO_ANNUAL_AMOUNT_PAISE * (1 - FOUNDING_DISCOUNT_PERCENT / 100));

export const PRO_MONTHLY_CURRENCY = 'INR';

export type RazorpayPlanId = typeof PLUS_MONTHLY_PLAN | typeof PRO_MONTHLY_PLAN;
export type BillingInterval = 'monthly' | 'yearly';

export function isRazorpayPlan(plan: string): plan is RazorpayPlanId {
  return plan === PLUS_MONTHLY_PLAN || plan === PRO_MONTHLY_PLAN;
}

export function pricingForPlan(
  plan: RazorpayPlanId,
  interval: BillingInterval = 'monthly',
  foundingDiscount = false,
): { amount: number; currency: string } {
  let amount: number;
  if (plan === PLUS_MONTHLY_PLAN) {
    amount = interval === 'yearly' ? PLUS_ANNUAL_AMOUNT_PAISE : PLUS_MONTHLY_AMOUNT_PAISE;
  } else if (foundingDiscount) {
    amount = interval === 'yearly' ? PRO_ANNUAL_FOUNDING_PAISE : PRO_MONTHLY_FOUNDING_PAISE;
  } else {
    amount = interval === 'yearly' ? PRO_ANNUAL_AMOUNT_PAISE : PRO_MONTHLY_AMOUNT_PAISE;
  }
  return { amount, currency: PRO_MONTHLY_CURRENCY };
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
  interval?: BillingInterval;
  amountPaise?: number;
}): Promise<RazorpayOrder> {
  const interval = input.interval ?? 'monthly';
  const pricing = pricingForPlan(input.plan, interval);
  const amount = input.amountPaise ?? pricing.amount;
  const currency = pricing.currency;
  const receipt = `${input.plan}_${interval}_${input.userId.slice(0, 8)}_${Date.now()}`;

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
        interval,
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
