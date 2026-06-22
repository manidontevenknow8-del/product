import type { ReactNode } from 'react';
import { AuthProvider } from '@/auth';
import { AnalyticsProvider } from '@/analytics';
import { SubscriptionProvider } from '@/subscription';
import { SEOProvider } from '@/seo';
import { PrerenderDataProvider } from './PrerenderDataContext';
import type { PrerenderRouteData } from './types';

type PrerenderProvidersProps = {
  data: PrerenderRouteData;
  children: ReactNode;
};

/** Minimal provider stack for build-time SSR (no Supabase session fetch). */
export function PrerenderProviders({ data, children }: PrerenderProvidersProps) {
  return (
    <PrerenderDataProvider data={data}>
      <AuthProvider ssrMode>
        <SubscriptionProvider>
          <AnalyticsProvider>
            <SEOProvider>{children}</SEOProvider>
          </AnalyticsProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </PrerenderDataProvider>
  );
}
