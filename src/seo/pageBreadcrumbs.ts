import { ROUTES } from '@/routes/paths';
import type { BreadcrumbItem } from './breadcrumbSchema';

const PAGE_LABELS: Record<string, string> = {
  [ROUTES.PRICING]: 'Pricing',
  [ROUTES.PET_MATCH]: 'Pet Match Quiz',
  [ROUTES.TOOLS_VACCINE_SCHEDULER]: 'Vaccination Scheduler',
  [ROUTES.FOUNDING_MEMBERS]: 'Founding Members',
  [ROUTES.BLOG]: 'Blog',
  [ROUTES.PRIVACY]: 'Privacy Policy',
  [ROUTES.TERMS]: 'Terms of Service',
  [ROUTES.COOKIES]: 'Cookie Policy',
  [ROUTES.CONTACT]: 'Contact',
  [ROUTES.ABOUT]: 'About Us',
  [ROUTES.SECURITY]: 'Security',
  [ROUTES.DATA_DELETION]: 'Delete Your Data',
  [ROUTES.DATA_EXPORT]: 'Export Your Data',
  [ROUTES.FAQ]: 'FAQ',
};

export function getStaticPageBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === ROUTES.LANDING) return [];

  const label = PAGE_LABELS[pathname];
  if (!label) return [];

  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: label, path: pathname },
  ];
}

export function getBlogIndexBreadcrumbs(categoryLabel?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Blog', path: ROUTES.BLOG },
  ];

  if (categoryLabel) {
    items.push({ name: categoryLabel, path: ROUTES.BLOG });
  }

  return items;
}

export function getBlogPostBreadcrumbs(postTitle: string, slug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Blog', path: ROUTES.BLOG },
    { name: postTitle, path: `${ROUTES.BLOG}/${slug}` },
  ];
}
