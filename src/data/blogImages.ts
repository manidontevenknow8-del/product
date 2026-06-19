/** One unique featured image per blog slug */
import { EXPANDED_BLOG_IMAGE_FILE } from './blogImageMappings';

export const BLOG_IMAGE_BY_SLUG: Record<string, string> = {
  'puppy-vaccination-schedule-2026': '/images/blog/blog-puppy-vaccination.webp',
  'organize-pet-medical-records-online': '/images/blog/blog-pet-records.webp',
  'pet-emergency-information-card-guide': '/images/blog/blog-emergency-passport.webp',
  'cat-vaccination-schedule-guide': '/images/blog/blog-cat-vaccination.webp',
  'pet-medication-reminder-guide': '/images/blog/blog-medication-reminder.webp',
  'dog-feeding-schedule-walk-tracker': '/images/blog/blog-daily-checkin.webp',
  'best-pet-health-tracker-app-2026': '/images/blog/blog-best-pet-health-app.webp',
  'vet-bill-organizer-pet-medical-bills': '/images/blog/blog-vet-bill-organizer.webp',
  'new-puppy-checklist-health-records-vaccines': '/images/blog/blog-puppy-checklist.webp',
  'new-kitten-checklist-vet-vaccines-records': '/images/blog/blog-new-kitten-checklist.webp',
  'senior-dog-care-health-records-medication-tracker': '/images/blog/blog-senior-dog.webp',
  'pet-sitter-instructions-medical-emergency-info': '/images/blog/blog-pet-sitter-instructions.webp',
  'microchip-registration-guide-dogs-cats': '/images/blog/blog-microchip-registration.webp',
  'heartworm-prevention-schedule-reminder-dogs': '/images/blog/blog-heartworm-prevention.webp',
  'flea-tick-prevention-calendar-pets': '/images/blog/blog-flea-tick-prevention.webp',
  'dog-dental-care-schedule-cleanings-reminders': '/images/blog/blog-dog-dental-care.webp',
  'traveling-with-pets-health-documents-checklist': '/images/blog/blog-travel-pets.webp',
  'pet-boarding-preparation-vaccination-records-health-forms': '/images/blog/blog-pet-boarding.webp',
  'dog-weight-tracker-log-trends-vet-health': '/images/blog/blog-dog-weight-tracker.webp',
  'pet-allergy-tracker-symptoms-triggers-records': '/images/blog/blog-pet-allergy-tracker.webp',
  'dog-vaccination-schedule-guide': '/images/blog/blog-dog-vaccination-guide.webp',
  'cat-health-records-checklist': '/images/blog/blog-cat-health-records.webp',
  'bird-care-health-routine': '/images/blog/blog-bird-care.webp',
  'exotic-pet-records-guide': '/images/blog/blog-exotic-pet-records.webp',
  'pet-records-101-care-timeline': '/images/blog/blog-pet-records-timeline.webp',
  'petclues-guides-life-stage-care-tools': '/images/blog/blog-life-stage-care.webp',
  ...Object.fromEntries(
    Object.entries(EXPANDED_BLOG_IMAGE_FILE).map(([slug, file]) => [slug, `/images/blog/${file}`]),
  ),
};

export function getBlogImageForSlug(slug: string): string {
  return BLOG_IMAGE_BY_SLUG[slug] ?? '/images/blog/blog-pet-records.webp';
}
