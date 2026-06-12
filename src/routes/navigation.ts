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

/** @deprecated Use EDITORIAL_NAV - kept for mobile legacy references */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', shortLabel: 'Home', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Reminders', shortLabel: 'Remind', path: ROUTES.REMINDERS, icon: 'reminders' },
  { label: 'Profile', shortLabel: 'Pet', path: ROUTES.PET_PROFILE, icon: 'profile' },
  { label: 'Scan', shortLabel: 'Scan', path: ROUTES.SCAN, icon: 'scan' },
  { label: 'Passport', shortLabel: 'ID', path: ROUTES.EMERGENCY_PASSPORT, icon: 'passport' },
];

/** @deprecated Account links moved to profile dropdown */
export const SECONDARY_NAV: NavItem[] = [
  { label: 'Timeline', path: ROUTES.TIMELINE, icon: 'timeline' },
  { label: 'PetCare Score', path: ROUTES.PET_CARE_SCORE, icon: 'score' },
  { label: 'Monthly Report', path: ROUTES.MONTHLY_REPORT, icon: 'report' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'settings' },
  { label: 'Billing', path: ROUTES.BILLING, icon: 'billing' },
  { label: 'Pricing', path: ROUTES.PRICING, icon: 'pricing' },
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
