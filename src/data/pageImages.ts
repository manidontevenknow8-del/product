/** Central imagery registry for app pages — reuse landing/profile assets when topic matches. */
export const PAGE_IMG = {
  auth: {
    login: '/images/auth/auth-login.png',
    signup: '/images/auth/auth-signup.png',
    recovery: '/images/auth/auth-recovery.png',
  },
  app: {
    dashboard: '/images/landing/landing-hero.png',
    dashboardWelcome: '/images/app/dashboard-welcome.png',
    onboarding: '/images/app/onboarding-welcome.png',
    timeline: '/images/landing/landing-timeline.png',
    score: '/images/landing/landing-score.png',
    monthlyReport: '/images/app/monthly-report-hero.png',
    referrals: '/images/app/referrals-hero.png',
    settings: '/images/app/settings-hero.png',
    billing: '/images/app/billing-hero.png',
    petMatch: '/images/app/pet-match-hero.png',
    notFound: '/images/app/notfound-hero.png',
    checkIn: '/images/landing/landing-age.png',
    scan: '/images/scan/scan-hero.png',
    profile: '/images/profile/profile-hero.png',
    reminders: '/images/reminders/reminders-hero.png',
    passport: '/images/landing/landing-passport.png',
    trust: '/images/landing/landing-trust.png',
    how: '/images/landing/landing-how.png',
    cta: '/images/landing/landing-cta.png',
  },
  profile: {
    health: '/images/profile/profile-health.png',
    vault: '/images/profile/profile-vault.png',
  },
  reminders: {
    notify: '/images/reminders/reminders-notify.png',
    vet: '/images/reminders/reminders-vet.png',
  },
  scan: {
    docs: '/images/scan/scan-docs.png',
    report: '/images/scan/scan-report.png',
  },
} as const;

export function pageImageUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
