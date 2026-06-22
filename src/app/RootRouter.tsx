import { useLocation } from 'react-router-dom';
import { MetaPixelRouteTracker } from '@/analytics/MetaPixelRouteTracker';
import { LandingPage } from '@/pages/LandingPage';
import { SEOProvider } from '@/seo';
import { ROUTES } from '@/routes/paths';
import { lazyRoute, RouteFallback } from '@/routes/lazyRoute';

const AppShell = lazyRoute(() => import('./AppShell'), 'AppShell');

export function RootRouter() {
  const { pathname } = useLocation();
  const isLanding = pathname === ROUTES.LANDING;

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
