/** Passport section art - topic-matched scan/reminder assets */
export const PASSPORT_IMG = {
  highlight: '/images/landing/landing-passport.webp',
  vaccinations: '/images/scan/scan-doc-vaccine.webp',
  allergies: '/images/scan/scan-doc-label.webp',
  medications: '/images/scan/scan-doc-rx.webp',
  conditions: '/images/scan/scan-doc-medical.webp',
  emergencyNotes: '/images/reminders/reminders-vet.webp',
} as const;

/** Absolute URL for off-screen export capture (html-to-image) */
export function passportImageUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
