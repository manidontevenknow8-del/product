import type { BillingCurrency } from '@/config/pricingConfig';

export type CheckoutIdentity = {
  email: string;
  name: string;
};

function looksLikePhone(value: string): boolean {
  const trimmed = value.trim();
  return /^\+?\d[\d\s()-]{6,}$/.test(trimmed);
}

/** Prefer a human name for Razorpay; never pass a phone number as the display name. */
export function sanitizeCheckoutName(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed && !looksLikePhone(trimmed)) {
    return trimmed;
  }

  const localPart = email.split('@')[0]?.trim();
  if (localPart) {
    return localPart
      .replace(/[._-]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return 'PetClues Member';
}

export function buildCheckoutIdentity(input: CheckoutIdentity): CheckoutIdentity {
  const email = input.email.trim();
  return {
    email,
    name: sanitizeCheckoutName(input.name, email),
  };
}

export function buildRazorpayPrefill(
  identity: CheckoutIdentity,
  currency: BillingCurrency,
): { email: string; name: string; contact?: string } {
  const resolved = buildCheckoutIdentity(identity);
  const prefill: { email: string; name: string; contact?: string } = {
    email: resolved.email,
    name: resolved.name,
  };

  // International checkout: email-first identity; omit phone so Razorpay does not default to +91.
  if (currency === 'USD') {
    prefill.contact = '';
  }

  return prefill;
}
