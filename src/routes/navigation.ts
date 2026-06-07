import { ROUTES } from './paths';
import type { NavIconId } from '@/components/navigation/navIcons';

export type NavItem = {
  label: string;
  shortLabel?: string;
  path: string;
  icon?: NavIconId;
};

/** V1 primary app navigation */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', shortLabel: 'Home', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Reminders', shortLabel: 'Remind', path: ROUTES.REMINDERS, icon: 'reminders' },
  { label: 'Profile', shortLabel: 'Pet', path: ROUTES.PET_PROFILE, icon: 'profile' },
  { label: 'Scan', shortLabel: 'Scan', path: ROUTES.SCAN, icon: 'scan' },
  { label: 'Passport', shortLabel: 'ID', path: ROUTES.EMERGENCY_PASSPORT, icon: 'passport' },
];

/** V1 secondary navigation (sidebar / mobile menu) */
export const SECONDARY_NAV: NavItem[] = [
  { label: 'Timeline', path: ROUTES.TIMELINE, icon: 'timeline' },
  { label: 'PetCare Score', path: ROUTES.PET_CARE_SCORE, icon: 'score' },
  { label: 'Monthly Report', path: ROUTES.MONTHLY_REPORT, icon: 'report' },
  { label: 'Referrals', path: ROUTES.REFERRALS, icon: 'referrals' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'settings' },
  { label: 'Billing', path: ROUTES.BILLING, icon: 'billing' },
  { label: 'Pricing', path: ROUTES.PRICING, icon: 'pricing' },
];

export function isNavActive(currentPath: string, itemPath: string): boolean {
  if (itemPath.startsWith('#')) return false;
  return currentPath === itemPath;
}
