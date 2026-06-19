/** Monthly report editorial imagery */
export const MONTHLY_REPORT_IMG = {
  hero: '/images/landing/landing-timeline.webp',
  overview: '/images/landing/landing-score.webp',
  reminders: '/images/reminders/reminders-hero.webp',
  notify: '/images/reminders/reminders-notify.webp',
  health: '/images/profile/profile-health.webp',
  vault: '/images/profile/profile-vault.webp',
  scan: '/images/landing/landing-scan.webp',
  milestones: '/images/landing/landing-passport.webp',
  celebration: '/images/landing/landing-trust.webp',
  journey: '/images/landing/landing-how.webp',
  checkIn: '/images/reminders/reminders-notify.webp',
} as const;

export function monthlyReportImageUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
