/** Lightweight blog preview cards for landing, no full article bodies. */
import type { BlogCategoryId } from '@/data/blogCategories';

export const LANDING_BLOG_PREVIEW: {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategoryId;
}[] = [
  {
    slug: 'puppy-vaccination-schedule-2026',
    title: 'Puppy Vaccination Schedule 2026: Month-by-Month Shot Timeline',
    excerpt:
      'Complete puppy vaccination schedule for 2026 - core shots, booster timing, and how to set pet vaccination reminders.',
    category: 'dog-health',
  },
  {
    slug: 'organize-pet-medical-records-online',
    title: 'How to Organize Pet Medical Records Online (Free Template)',
    excerpt:
      'Step-by-step guide to digitizing vet bills, vaccine cards, and medication lists into one searchable pet health vault.',
    category: 'pet-records',
  },
  {
    slug: 'pet-emergency-information-card-guide',
    title: 'Pet Emergency Information Card: What to Include',
    excerpt:
      'Build a one-page emergency pet passport with allergies, medications, vet contacts, and microchip details.',
    category: 'pet-records',
  },
];
