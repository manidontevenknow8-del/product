/** Central imagery registry for app pages - reuse landing/profile assets when topic matches. */
export const PAGE_IMG = {
  auth: {
    login: '/images/auth/auth-login.webp',
    signup: '/images/auth/auth-signup.webp',
    recovery: '/images/auth/auth-recovery.webp',
  },
  app: {
    dashboard: '/images/landing/landing-hero.webp',
    dashboardWelcome: '/images/app/dashboard-welcome.webp',
    onboarding: '/images/app/onboarding-welcome.webp',
    timeline: '/images/landing/landing-timeline.webp',
    score: '/images/landing/landing-score.webp',
    monthlyReport: '/images/app/monthly-report-hero.webp',
    referrals: '/images/app/referrals-hero.webp',
    settings: '/images/app/settings-hero.webp',
    billing: '/images/app/billing-hero.webp',
    petMatch: '/images/app/pet-match-hero.webp',
    notFound: '/images/app/notfound-hero.webp',
    checkIn: '/images/landing/landing-age.webp',
    scan: '/images/scan/scan-hero.webp',
    profile: '/images/profile/profile-hero.webp',
    reminders: '/images/reminders/reminders-hero.webp',
    passport: '/images/landing/landing-passport.webp',
    trust: '/images/landing/landing-trust.webp',
    how: '/images/landing/landing-how.webp',
    cta: '/images/landing/landing-cta.webp',
    /** Warm welcome moment - used on About only */
    about: '/images/auth/auth-signup.webp',
  },
  profile: {
    health: '/images/profile/profile-health.webp',
    vault: '/images/profile/profile-vault.webp',
  },
  reminders: {
    notify: '/images/reminders/reminders-notify.webp',
    vet: '/images/reminders/reminders-vet.webp',
  },
  scan: {
    docs: '/images/scan/scan-docs.webp',
    report: '/images/scan/scan-report.webp',
  },
} as const;

export function pageImageUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
