/** Genesis Vault one-time offer — Razorpay Payment Link (hosted checkout). */
export const GENESIS_VAULT_PRICE_DISPLAY = '$249';

export function getGenesisVaultPaymentUrl(): string {
  return import.meta.env.VITE_GENESIS_RAZORPAY_PAYMENT_LINK?.trim() ?? '';
}
