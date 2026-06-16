import { SITE_META } from '@/data/seoConfig';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbListSchema(items: readonly BreadcrumbItem[]) {
  if (items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${SITE_META.siteUrl}${item.path}`,
    })),
  };
}
