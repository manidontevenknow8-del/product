export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  AUTH_CALLBACK: '/auth/callback',
  RESET_PASSWORD: '/reset-password',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  PET_PROFILE: '/pet-profile',
  SCAN: '/scan',
  TIMELINE: '/timeline',
  EMERGENCY_PASSPORT: '/emergency-passport',
  PET_MATCH: '/pet-match',
  BLOG: '/blog',
  PET_CARE_SCORE: '/pet-care-score',
  MONTHLY_REPORT: '/monthly-report',
  MONTHLY_REPORT_ARCHIVE: '/monthly-report/archive',
  REMINDERS: '/reminders',
  SETTINGS: '/settings',
  PRICING: '/pricing',
  REFERRALS: '/referrals',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  CONTACT: '/contact',
  ABOUT: '/about',
  SECURITY: '/security',
  DATA_DELETION: '/data-deletion',
  DATA_EXPORT: '/data-export',
  FAQ: '/faq',
  BILLING: '/billing',
  SETTINGS_ACCOUNT: '/settings/account',
  SETTINGS_PROFILE: '/settings/profile',

  /** Deferred after V1 — routes kept for redirects only */
  LOST_PET: '/lost-pet',
  LOST_PET_REPORT: '/lost-pet/report',
  AGE_TRANSLATOR: '/age-translator',
  NOTIFICATIONS: '/notifications',
  FAMILY_ACCESS: '/family',
  FOUNDING_MEMBERS: '/founding-members',
  WAITLIST: '/waitlist',
  LAUNCH_READINESS: '/launch-readiness',
  BETA_RELEASE: '/beta-release',
  ANALYTICS: '/analytics',
  BETA_FEEDBACK: '/beta-feedback',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/** V1 protected routes */
export const PROTECTED_ROUTES = [
  ROUTES.ONBOARDING,
  ROUTES.DASHBOARD,
  ROUTES.PET_PROFILE,
  ROUTES.SCAN,
  ROUTES.TIMELINE,
  ROUTES.EMERGENCY_PASSPORT,
  ROUTES.PET_CARE_SCORE,
  ROUTES.REMINDERS,
  ROUTES.MONTHLY_REPORT,
  ROUTES.MONTHLY_REPORT_ARCHIVE,
  ROUTES.SETTINGS,
  ROUTES.BILLING,
  ROUTES.SETTINGS_ACCOUNT,
  ROUTES.SETTINGS_PROFILE,
  ROUTES.REFERRALS,
] as const;

/** Routes only for unauthenticated users */
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.VERIFY_EMAIL,
] as const;
