import { ROUTES } from '@/routes/paths';
import type { InferredBlogCluster } from './mappings';

export type HubLinkTarget = {
  href: string;
  label: string;
};

const CLUSTER_HUB_POOLS: Record<InferredBlogCluster, HubLinkTarget[]> = {
  vaccinations: [
    { href: `${ROUTES.BEST}/best-pet-vaccination-tracker`, label: 'Best vaccination trackers' },
    { href: `${ROUTES.LEARN}?category=vaccinations`, label: 'Vaccination learn guides' },
    { href: ROUTES.GUIDES, label: 'Breed vaccination schedules' },
  ],
  'health-records': [
    { href: `${ROUTES.BEST}/best-pet-health-record-app`, label: 'Best health record apps' },
    { href: `${ROUTES.LEARN}?category=health-records`, label: 'Health records learn hub' },
    { href: `${ROUTES.BLOG}?category=pet-records`, label: 'Pet records blog guides' },
  ],
  'medical-history': [
    { href: `${ROUTES.LEARN}?category=health-records`, label: 'Medical history guides' },
    { href: `${ROUTES.BEST}/pet-medical-record-organizer`, label: 'Medical record organizers' },
    { href: ROUTES.FAQ, label: 'Pet health FAQ' },
  ],
  'pet-passports': [
    { href: `${ROUTES.BEST}/digital-pet-passport-app`, label: 'Best digital passport apps' },
    { href: `${ROUTES.FAQ}?category=pet-passports`, label: 'Pet passport FAQ' },
    { href: ROUTES.COMPARE, label: 'Compare pet health tools' },
  ],
  'pet-travel': [
    { href: ROUTES.GUIDES, label: 'Pet travel guides' },
    { href: `${ROUTES.BLOG}?category=pet-travel`, label: 'Travel blog guides' },
    { href: `${ROUTES.LEARN}?category=pet-travel`, label: 'Travel learn hub' },
  ],
  'medication-management': [
    { href: `${ROUTES.BEST}/best-pet-reminder-app`, label: 'Best pet reminder apps' },
    { href: `${ROUTES.LEARN}?category=medication-tracking`, label: 'Medication tracking guides' },
    { href: `${ROUTES.FAQ}?category=medication-management`, label: 'Medication FAQ' },
  ],
  'emergency-preparedness': [
    { href: `${ROUTES.FAQ}?category=emergency-preparedness`, label: 'Emergency prep FAQ' },
    { href: ROUTES.GUIDES, label: 'Emergency checklists' },
    { href: `${ROUTES.BLOG}?category=symptom-triage`, label: 'Emergency blog guides' },
  ],
  'pet-organization': [
    { href: `${ROUTES.BLOG}?category=pet-records`, label: 'Organization blog guides' },
    { href: ROUTES.LEARN, label: 'PetClues Learn' },
    { href: ROUTES.BEST, label: 'Best pet health apps' },
  ],
  'breed-specific-care': [
    { href: ROUTES.GUIDES, label: 'Breed care guides' },
    { href: ROUTES.BLOG, label: 'Pet health blog' },
    { href: ROUTES.LEARN, label: 'Learn hub' },
  ],
  'senior-pet-care': [
    { href: `${ROUTES.BEST}/senior-pet-care`, label: 'Senior pet care apps' },
    { href: `${ROUTES.LEARN}?category=health-records`, label: 'Senior care guides' },
    { href: ROUTES.FAQ, label: 'Pet health FAQ' },
  ],
  'new-pet-owner-guides': [
    { href: `${ROUTES.BLOG}?category=dog-health`, label: 'New puppy guides' },
    { href: ROUTES.GUIDES, label: 'Care guides & templates' },
    { href: ROUTES.LEARN, label: 'Learn hub' },
  ],
  'exotic-pets': [
    { href: `${ROUTES.BLOG}?category=exotic-pets`, label: 'Exotic pet guides' },
    { href: ROUTES.FAQ, label: 'Pet health FAQ' },
    { href: ROUTES.LEARN, label: 'Learn hub' },
  ],
};

export function hubPoolForCluster(cluster: InferredBlogCluster): HubLinkTarget[] {
  return CLUSTER_HUB_POOLS[cluster];
}

export const PRIMARY_HUB_LINKS: HubLinkTarget[] = [
  { href: ROUTES.BLOG, label: 'Blog' },
  { href: ROUTES.LEARN, label: 'Learn' },
  { href: ROUTES.GUIDES, label: 'Guides' },
  { href: ROUTES.RESOURCES, label: 'Local resources' },
  { href: ROUTES.BEST, label: 'Best' },
  { href: ROUTES.COMPARE, label: 'Compare' },
  { href: ROUTES.FAQ, label: 'FAQ' },
];

/** Curated high-value blog posts for hub index pages. */
export const FEATURED_BLOG_SLUGS = [
  'how-much-does-it-cost-to-clone-a-dog-2026',
  'how-common-is-ivdd-in-corgis',
  'what-is-a-digital-pet-passport',
  'heartworm-pill-tracker',
  'share-folders-for-pets',
] as const;
