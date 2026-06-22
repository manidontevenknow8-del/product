import type { BillingCurrency } from '@/config/pricingConfig';

export type BillingRegion = {
  countryCode: string | null;
  currency: BillingCurrency;
  source: 'vercel' | 'cloudflare' | 'locale' | 'default';
};

const INDIA_CODE = 'IN';

export function countryToCurrency(countryCode: string | null | undefined): BillingCurrency {
  return countryCode?.toUpperCase() === INDIA_CODE ? 'INR' : 'USD';
}

export function currencyFromBrowserLocale(): BillingCurrency {
  if (typeof navigator === 'undefined') return 'USD';

  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const locale of locales) {
    const normalized = locale.toUpperCase();
    if (normalized === 'HI' || normalized === 'HI-IN' || normalized.endsWith('-IN')) {
      return 'INR';
    }
  }
  return 'USD';
}

export function resolveBillingRegion(input: {
  countryCode?: string | null;
  headerSource?: 'vercel' | 'cloudflare';
}): BillingRegion {
  if (input.countryCode) {
    return {
      countryCode: input.countryCode.toUpperCase(),
      currency: countryToCurrency(input.countryCode),
      source: input.headerSource ?? 'vercel',
    };
  }

  const currency = currencyFromBrowserLocale();
  return {
    countryCode: currency === 'INR' ? INDIA_CODE : null,
    currency,
    source: 'locale',
  };
}

export async function detectBillingRegion(): Promise<BillingRegion> {
  try {
    const response = await fetch('/api/geo', { credentials: 'same-origin' });
    if (response.ok) {
      const data = (await response.json()) as {
        country?: string | null;
        source?: 'vercel' | 'cloudflare';
      };
      if (data.country) {
        return resolveBillingRegion({
          countryCode: data.country,
          headerSource: data.source ?? 'vercel',
        });
      }
    }
  } catch {
    // Fall through to locale detection in static hosting / local dev.
  }

  return resolveBillingRegion({});
}
