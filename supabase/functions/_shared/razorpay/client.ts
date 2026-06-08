/** Razorpay REST + signature helpers — secrets stay server-side only. */

export const PRO_MONTHLY_PLAN = 'pro' as const;
export const PRO_MONTHLY_AMOUNT_PAISE = 29_900;
export const PRO_MONTHLY_CURRENCY = 'INR';
export const PRO_MONTHLY_DISPLAY = '₹299';

export type RazorpayPlanId = typeof PRO_MONTHLY_PLAN;

const PLAN_PRICING: Record<RazorpayPlanId, { amount: number; currency: string }> = {
  pro: { amount: PRO_MONTHLY_AMOUNT_PAISE, currency: PRO_MONTHLY_CURRENCY },
};

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

export function pricingForPlan(plan: string): { amount: number; currency: string } {
  const pricing = PLAN_PRICING[plan as RazorpayPlanId];
  if (!pricing) throw new Error(`Unknown plan: ${plan}`);
  return pricing;
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
}): Promise<RazorpayOrder> {
  const { amount, currency } = pricingForPlan(input.plan);
  const receipt = `pro_${input.userId.slice(0, 8)}_${Date.now()}`;

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
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message),
  );
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

/** Payment callback: HMAC_SHA256(order_id|payment_id, secret) */
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

/** Webhook: HMAC_SHA256(raw body, webhook_secret) */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const expected = await hmacSha256Hex(getRazorpayWebhookSecret(), rawBody);
  return timingSafeEqual(expected, signature);
}
