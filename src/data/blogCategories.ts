export type BlogCategoryId =
  | 'dog-health'
  | 'cat-health'
  | 'bird-care'
  | 'exotic-pets'
  | 'pet-records'
  | 'petclues-guides';

export type BlogCategory = {
  id: BlogCategoryId;
  label: string;
  description: string;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'dog-health',
    label: 'Dog Health',
    description: 'Vaccination schedules, wellness habits, and everyday care for dogs.',
  },
  {
    id: 'cat-health',
    label: 'Cat Health',
    description: 'Records, routines, and vet visit prep for cat parents.',
  },
  {
    id: 'bird-care',
    label: 'Bird Care',
    description: 'Avian wellness, weight tracking, and low-stress routines.',
  },
  {
    id: 'exotic-pets',
    label: 'Exotic Pets',
    description: 'Reptiles, small mammals, and specialized care documentation.',
  },
  {
    id: 'pet-records',
    label: 'Pet Records',
    description: 'Organizing documents, timelines, and health history.',
  },
  {
    id: 'petclues-guides',
    label: 'PetClues Guides',
    description: 'Product guides and best practices from the PetClues team.',
  },
];

export function getBlogCategory(id: BlogCategoryId): BlogCategory {
  const found = BLOG_CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown blog category: ${id}`);
  return found;
}

export function getBlogCategoryLabel(id: BlogCategoryId): string {
  return getBlogCategory(id).label;
}
