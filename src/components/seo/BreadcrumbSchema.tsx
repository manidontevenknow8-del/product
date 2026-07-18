import { JsonLd } from '@/seo/JsonLd';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from '@/seo/breadcrumbSchema';

type BreadcrumbSchemaProps = {
  /** Stable script id suffix. Defaults to a path-derived id. */
  id?: string;
  items: readonly BreadcrumbItem[];
};

/**
 * Injects BreadcrumbList JSON-LD so Google can render a clean SERP hierarchy
 * (e.g. PetClues › Health Guides › IVDD in Corgis) instead of a raw URL path.
 *
 * Prefer composing breadcrumbs into page `@graph` builders when possible;
 * use this helper when a page only needs BreadcrumbList as a standalone script.
 */
export function BreadcrumbSchema({ id, items }: BreadcrumbSchemaProps) {
  const schema = buildBreadcrumbListSchema(items);
  if (!schema) return null;

  const scriptId =
    id ??
    `breadcrumb-${items
      .map((item) => item.path.replace(/\//g, '') || 'home')
      .join('-')
      .slice(0, 80)}`;

  return <JsonLd id={scriptId} data={schema} />;
}
