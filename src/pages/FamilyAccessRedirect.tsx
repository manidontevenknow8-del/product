import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

/** Legacy /family path → household settings section */
export function FamilyAccessRedirect() {
  return <Navigate to={`${ROUTES.SETTINGS}?section=household`} replace />;
}
