/** Monthly report editorial imagery */
export const MONTHLY_REPORT_IMG = {
  hero: '/images/landing/landing-timeline.png',
  overview: '/images/landing/landing-score.png',
  reminders: '/images/reminders/reminders-hero.png',
  notify: '/images/reminders/reminders-notify.png',
  health: '/images/profile/profile-health.png',
  vault: '/images/profile/profile-vault.png',
  scan: '/images/landing/landing-scan.png',
  milestones: '/images/landing/landing-passport.png',
  celebration: '/images/landing/landing-trust.png',
  journey: '/images/landing/landing-how.png',
  checkIn: '/images/reminders/reminders-notify.png',
} as const;

export function monthlyReportImageUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
