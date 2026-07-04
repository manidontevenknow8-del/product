import type { BillingCurrency } from '@/config/pricingConfig';

/** Genesis Vault one-time offer — keep in sync with supabase/functions/_shared/razorpay/client.ts */
export const GENESIS_VAULT_PRODUCT = 'genesis_vault' as const;

export const GENESIS_VAULT_USD_MINOR = 24_900;
export const GENESIS_VAULT_INR_MINOR = 2_099_900;

export function getGenesisVaultAmountMinor(currency: BillingCurrency): number {
  return currency === 'INR' ? GENESIS_VAULT_INR_MINOR : GENESIS_VAULT_USD_MINOR;
}

export function getGenesisVaultPriceDisplay(currency: BillingCurrency): string {
  return currency === 'INR' ? '₹20,999' : '$249';
}

/** Optional hosted Payment Link override (Razorpay Dashboard). */
export function getGenesisVaultPaymentUrl(): string {
  return import.meta.env.VITE_GENESIS_RAZORPAY_PAYMENT_LINK?.trim() ?? '';
}
