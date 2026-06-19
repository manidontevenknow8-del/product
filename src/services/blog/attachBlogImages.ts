import { EXPANDED_BLOG_IMAGE_FILE } from '@/data/blogImageMappings';
import { DOMINANCE_BLOG_IMAGE_FILE } from '@/data/dominanceBlogImageMappings';
import { resolveBlogHeroImagePath } from '@/data/blogHeroImageResolver';
import type { BlogPost } from '@/types/blog';

const EXPLICIT_HERO_FILE: Record<string, string> = {
  'puppy-vaccination-schedule-2026': 'blog-puppy-vaccination.webp',
  'organize-pet-medical-records-online': 'blog-pet-records.webp',
  'pet-emergency-information-card-guide': 'blog-emergency-passport.webp',
  'cat-vaccination-schedule-guide': 'blog-cat-vaccination.webp',
  'pet-medication-reminder-guide': 'blog-medication-reminder.webp',
  'dog-feeding-schedule-walk-tracker': 'blog-daily-checkin.webp',
  'best-pet-health-tracker-app-2026': 'blog-best-pet-health-app.webp',
  'vet-bill-organizer-pet-medical-bills': 'blog-vet-bill-organizer.webp',
  'new-puppy-checklist-health-records-vaccines': 'blog-puppy-checklist.webp',
  'new-kitten-checklist-vet-vaccines-records': 'blog-new-kitten-checklist.webp',
  'senior-dog-care-health-records-medication-tracker': 'blog-senior-dog.webp',
  'pet-sitter-instructions-medical-emergency-info': 'blog-pet-sitter-instructions.webp',
  'microchip-registration-guide-dogs-cats': 'blog-microchip-registration.webp',
  'heartworm-prevention-schedule-reminder-dogs': 'blog-heartworm-prevention.webp',
  'flea-tick-prevention-calendar-pets': 'blog-flea-tick-prevention.webp',
  'dog-dental-care-schedule-cleanings-reminders': 'blog-dog-dental-care.webp',
  'traveling-with-pets-health-documents-checklist': 'blog-travel-pets.webp',
  'pet-boarding-preparation-vaccination-records-health-forms': 'blog-pet-boarding.webp',
  'dog-weight-tracker-log-trends-vet-health': 'blog-dog-weight-tracker.webp',
  'pet-allergy-tracker-symptoms-triggers-records': 'blog-pet-allergy-tracker.webp',
  'dog-vaccination-schedule-guide': 'blog-dog-vaccination-guide.webp',
  'cat-health-records-checklist': 'blog-cat-health-records.webp',
  'bird-care-health-routine': 'blog-bird-care.webp',
  'exotic-pet-records-guide': 'blog-exotic-pet-records.webp',
  'pet-records-101-care-timeline': 'blog-pet-records-timeline.webp',
  'petclues-guides-life-stage-care-tools': 'blog-life-stage-care.webp',
  ...EXPANDED_BLOG_IMAGE_FILE,
  ...DOMINANCE_BLOG_IMAGE_FILE,
};

function heroPathForPost(post: BlogPost): string {
  const explicit = EXPLICIT_HERO_FILE[post.slug];
  if (explicit) {
    return `/images/blog/${explicit}`;
  }
  return resolveBlogHeroImagePath(post.slug, post.title, post.tags, post.category);
}

/** Ensures every post uses a content-relevant hero image */
export function attachBlogImages(posts: BlogPost[]): BlogPost[] {
  return posts.map((post) => ({
    ...post,
    featuredImage: heroPathForPost(post),
  }));
}
