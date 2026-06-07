import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { LoadingState } from '@/components/ui';
import { ROUTES } from '@/routes/paths';

type GuestRouteProps = {
  children: ReactNode;
};

/** Redirect authenticated users away from auth pages */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingState fullPage message="Loading" />;

  if (isAuthenticated && user) {
    if (!user.emailVerified) {
      return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
    }

    return (
      <Navigate
        to={user.needsOnboarding ? ROUTES.ONBOARDING : ROUTES.DASHBOARD}
        replace
      />
    );
  }

  return children;
}
