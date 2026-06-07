/** Passport section art — topic-matched scan/reminder assets */
export const PASSPORT_IMG = {
  highlight: '/images/landing/landing-passport.png',
  vaccinations: '/images/scan/scan-doc-vaccine.png',
  allergies: '/images/scan/scan-doc-label.png',
  medications: '/images/scan/scan-doc-rx.png',
  conditions: '/images/scan/scan-doc-medical.png',
  emergencyNotes: '/images/reminders/reminders-vet.png',
} as const;

/** Absolute URL for off-screen export capture (html-to-image) */
export function passportImageUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
