import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { LoadingState } from '@/components/ui';
import { ROUTES } from '@/routes/paths';

type ProtectedRouteProps = {
  children: ReactNode;
  requireOnboardingComplete?: boolean;
};

export function ProtectedRoute({
  children,
  requireOnboardingComplete = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState fullPage message="Loading your account" />;
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={ROUTES.LOGIN} state={{ from: returnTo }} replace />;
  }

  if (
    user &&
    !user.emailVerified &&
    location.pathname !== ROUTES.VERIFY_EMAIL
  ) {
    return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
  }

  if (
    requireOnboardingComplete &&
    user?.needsOnboarding &&
    location.pathname !== ROUTES.ONBOARDING
  ) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if (
    !requireOnboardingComplete &&
    location.pathname === ROUTES.ONBOARDING &&
    user &&
    !user.needsOnboarding
  ) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
