import { useLocation } from 'react-router-dom';
import { MetaPixelRouteTracker } from '@/analytics/MetaPixelRouteTracker';
import { GenesisOffer } from '@/components/Marketing/GenesisOffer';
import { LandingPage } from '@/pages/LandingPage';
import { SEOProvider } from '@/seo';
import { ROUTES } from '@/routes/paths';
import { lazyRoute, RouteFallback } from '@/routes/lazyRoute';

const AppShell = lazyRoute(() => import('./AppShell'), 'AppShell');

export function RootRouter() {
  const { pathname } = useLocation();
  const isLanding = pathname === ROUTES.LANDING;
  const isGenesis = pathname === ROUTES.GENESIS;

  if (isGenesis) {
    return (
      <>
        <MetaPixelRouteTracker />
        <SEOProvider>
          <GenesisOffer />
        </SEOProvider>
      </>
    );
  }

  if (isLanding) {
    return (
      <>
        <MetaPixelRouteTracker />
        <SEOProvider>
          <LandingPage marketingShell />
        </SEOProvider>
      </>
    );
  }

  return (
    <RouteFallback>
      <MetaPixelRouteTracker />
      <AppShell />
    </RouteFallback>
  );
}
