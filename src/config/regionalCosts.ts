/**
 * Region-aware cost copy for product UI (India → INR, elsewhere → USD approximations).
 * Membership prices live in pricingConfig.ts; these are lifestyle / care estimates.
 */

import type { BillingCurrency } from '@/config/pricingConfig';
import { formatPrice } from '@/config/pricingConfig';

export type CostRange = {
  inr: readonly [number, number];
  usd: readonly [number, number];
};

function rangeValues(range: CostRange, currency: BillingCurrency): readonly [number, number] {
  return currency === 'INR' ? range.inr : range.usd;
}

/** e.g. "₹10,000 – ₹18,000" or "$120 – $220" */
export function formatCostRange(range: CostRange, currency: BillingCurrency): string {
  const [min, max] = rangeValues(range, currency);
  return `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`;
}

export type PetMatchBudgetTier = 'lean' | 'balanced' | 'generous';

const BUDGET_THRESHOLDS = {
  lean: { inrMax: 8_000, usdMax: 95 },
  balanced: { inrMin: 8_000, inrMax: 15_000, usdMin: 95, usdMax: 180 },
  generous: { inrMin: 15_000, usdMin: 180 },
} as const;

export function formatPetMatchBudgetHint(tier: PetMatchBudgetTier, currency: BillingCurrency): string {
  if (tier === 'lean') {
    const cap = currency === 'INR' ? BUDGET_THRESHOLDS.lean.inrMax : BUDGET_THRESHOLDS.lean.usdMax;
    return `Under ${formatPrice(cap, currency)} / month`;
  }
  if (tier === 'balanced') {
    const min = currency === 'INR' ? BUDGET_THRESHOLDS.balanced.inrMin : BUDGET_THRESHOLDS.balanced.usdMin;
    const max = currency === 'INR' ? BUDGET_THRESHOLDS.balanced.inrMax : BUDGET_THRESHOLDS.balanced.usdMax;
    return `${formatPrice(min, currency)} – ${formatPrice(max, currency)} / month`;
  }
  const min = currency === 'INR' ? BUDGET_THRESHOLDS.generous.inrMin : BUDGET_THRESHOLDS.generous.usdMin;
  return `${formatPrice(min, currency)}+ / month`;
}

/** Approximate monthly pet care by breed — localized at display time. */
export const PET_MATCH_BREED_MONTHLY_COSTS: Record<string, CostRange> = {
  'golden-retriever': { inr: [10_000, 18_000], usd: [120, 220] },
  'maine-coon': { inr: [6_000, 12_000], usd: [75, 145] },
  greyhound: { inr: [7_000, 13_000], usd: [85, 155] },
  'shih-tzu': { inr: [5_000, 10_000], usd: [60, 120] },
  labrador: { inr: [9_000, 16_000], usd: [110, 195] },
  'british-shorthair': { inr: [5_500, 11_000], usd: [65, 130] },
};
