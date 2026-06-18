import type { BlogCategoryId } from '@/data/blogCategories';
import type { FaqCategoryId } from '@/data/faq/categories';
import type { LearnCategoryId } from '@/data/learn/categories';

export type InferredBlogCluster =
  | 'vaccinations'
  | 'health-records'
  | 'medical-history'
  | 'pet-passports'
  | 'pet-travel'
  | 'medication-management'
  | 'emergency-preparedness'
  | 'pet-organization'
  | 'breed-specific-care'
  | 'senior-pet-care'
  | 'new-pet-owner-guides'
  | 'exotic-pets';

export const LANDING_SECTIONS = [
  { id: 'features', label: 'Explore PetClues features', path: '/#features' },
  { id: 'how-it-works', label: 'See how PetClues works', path: '/#how-it-works' },
  { id: 'plans', label: 'Compare plans on the homepage', path: '/#plans' },
  { id: 'pet-health-guides', label: 'Browse pet health guides', path: '/#pet-health-guides' },
  { id: 'trust', label: 'Security & trust at PetClues', path: '/#trust' },
  { id: 'get-started', label: 'Get started with PetClues', path: '/#get-started' },
] as const;

const CLUSTER_TO_LEARN: Record<InferredBlogCluster, LearnCategoryId> = {
  vaccinations: 'vaccinations',
  'health-records': 'health-records',
  'medical-history': 'health-records',
  'pet-passports': 'pet-passports',
  'pet-travel': 'pet-travel',
  'medication-management': 'medication-tracking',
  'emergency-preparedness': 'pet-emergencies',
  'pet-organization': 'pet-organization',
  'breed-specific-care': 'health-records',
  'senior-pet-care': 'health-records',
  'new-pet-owner-guides': 'vaccinations',
  'exotic-pets': 'pet-documentation',
};

const CLUSTER_TO_FAQ: Record<InferredBlogCluster, FaqCategoryId> = {
  vaccinations: 'vaccinations',
  'health-records': 'pet-records',
  'medical-history': 'medical-history',
  'pet-passports': 'pet-passports',
  'pet-travel': 'pet-travel',
  'medication-management': 'medication-management',
  'emergency-preparedness': 'emergency-preparedness',
  'pet-organization': 'pet-organization',
  'breed-specific-care': 'pet-records',
  'senior-pet-care': 'senior-pet-care',
  'new-pet-owner-guides': 'new-pet-owners',
  'exotic-pets': 'exotic-specialty-care',
};

const CATEGORY_TO_LEARN: Record<BlogCategoryId, LearnCategoryId> = {
  'dog-health': 'vaccinations',
  'cat-health': 'vaccinations',
  'bird-care': 'pet-documentation',
  'exotic-pets': 'pet-documentation',
  'pet-records': 'health-records',
  'petclues-guides': 'pet-organization',
};

const CATEGORY_TO_FAQ: Record<BlogCategoryId, FaqCategoryId> = {
  'dog-health': 'vaccinations',
  'cat-health': 'vaccinations',
  'bird-care': 'exotic-specialty-care',
  'exotic-pets': 'exotic-specialty-care',
  'pet-records': 'pet-records',
  'petclues-guides': 'petclues-app',
};

export function inferBlogCluster(
  category: BlogCategoryId,
  tags: string[],
): InferredBlogCluster {
  const haystack = tags.join(' ').toLowerCase();

  if (haystack.includes('vaccin') || haystack.includes('booster') || haystack.includes('rabies')) {
    return 'vaccinations';
  }
  if (haystack.includes('travel') || haystack.includes('flight') || haystack.includes('certificate')) {
    return 'pet-travel';
  }
  if (haystack.includes('medication') || haystack.includes('reminder') || haystack.includes('dose')) {
    return 'medication-management';
  }
  if (haystack.includes('emergency') || haystack.includes('passport') || haystack.includes('er ')) {
    return haystack.includes('passport') ? 'pet-passports' : 'emergency-preparedness';
  }
  if (haystack.includes('senior') || haystack.includes('aging')) {
    return 'senior-pet-care';
  }
  if (haystack.includes('puppy') || haystack.includes('kitten') || haystack.includes('new pet')) {
    return 'new-pet-owner-guides';
  }
  if (haystack.includes('breed') || haystack.includes('retriever') || haystack.includes('coon')) {
    return 'breed-specific-care';
  }
  if (category === 'exotic-pets' || category === 'bird-care') {
    return 'exotic-pets';
  }
  if (category === 'pet-records') {
    return 'health-records';
  }
  if (category === 'petclues-guides') {
    return 'pet-organization';
  }

  return 'health-records';
}

export function learnCategoryForBlog(
  category: BlogCategoryId,
  cluster: InferredBlogCluster,
): LearnCategoryId {
  return CLUSTER_TO_LEARN[cluster] ?? CATEGORY_TO_LEARN[category];
}

export function faqCategoryForBlog(
  category: BlogCategoryId,
  cluster: InferredBlogCluster,
): FaqCategoryId {
  return CLUSTER_TO_FAQ[cluster] ?? CATEGORY_TO_FAQ[category];
}
