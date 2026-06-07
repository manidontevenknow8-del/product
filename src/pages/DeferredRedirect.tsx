import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

type DeferredRedirectProps = {
  to?: string;
};

/** V1: deferred features redirect here instead of 404 */
export function DeferredRedirect({ to = ROUTES.DASHBOARD }: DeferredRedirectProps) {
  return <Navigate to={to} replace />;
}
