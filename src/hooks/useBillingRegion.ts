import { useEffect, useState } from 'react';
import { detectBillingRegion, type BillingRegion } from '@/config/billingRegion';

const DEFAULT_REGION: BillingRegion = {
  countryCode: null,
  currency: 'USD',
  source: 'default',
};

export function useBillingRegion(): BillingRegion & { isLoading: boolean } {
  const [region, setRegion] = useState<BillingRegion>(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void detectBillingRegion().then((detected) => {
      if (!cancelled) {
        setRegion(detected);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...region, isLoading };
}
