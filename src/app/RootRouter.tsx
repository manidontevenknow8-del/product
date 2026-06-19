import { useLocation } from 'react-router-dom';
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
      <SEOProvider>
        <LandingPage marketingShell />
      </SEOProvider>
    );
  }

  return (
    <RouteFallback>
      <AppShell />
    </RouteFallback>
  );
}
