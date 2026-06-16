import { ROUTES } from './paths';
import type { NavIconId } from '@/components/navigation/navIcons';

export type NavItem = {
  label: string;
  shortLabel?: string;
  path: string;
  icon?: NavIconId;
  /** Additional paths that should highlight this nav item as active */
  matchPaths?: string[];
};

/** Picture Pro editorial top navigation */
export const EDITORIAL_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  {
    label: 'Records',
    path: ROUTES.PET_PROFILE,
    matchPaths: [
      ROUTES.PET_PROFILE,
      ROUTES.SCAN,
      ROUTES.EMERGENCY_PASSPORT,
      ROUTES.VET_PORTAL,
      ROUTES.REMINDERS,
      ROUTES.MONTHLY_REPORT,
      ROUTES.MONTHLY_REPORT_ARCHIVE,
    ],
  },
  { label: 'Timeline', path: ROUTES.TIMELINE },
  {
    label: 'Insights',
    path: ROUTES.PET_CARE_SCORE,
    matchPaths: [ROUTES.PET_CARE_SCORE, ROUTES.VET_PORTAL],
  },
];

export function isNavActive(currentPath: string, item: NavItem | string): boolean {
  const itemPath = typeof item === 'string' ? item : item.path;
  if (itemPath.startsWith('#')) return false;
  if (currentPath === itemPath) return true;
  if (typeof item !== 'string' && item.matchPaths) {
    return item.matchPaths.some((p) => currentPath === p || currentPath.startsWith(`${p}/`));
  }
  return false;
}
