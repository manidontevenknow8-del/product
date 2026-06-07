import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

export function AccountSettingsPage() {
  return <Navigate to={`${ROUTES.SETTINGS}?section=account`} replace />;
}
