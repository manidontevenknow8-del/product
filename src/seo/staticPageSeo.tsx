import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { buildBreadcrumbListSchema } from './breadcrumbSchema';
import { getStaticPageBreadcrumbs } from './pageBreadcrumbs';
import {
  buildOrganizationSchema,
  buildProductPageGraph,
  buildProfilePageSchema,
  buildSchemaGraph,
  buildWebPageSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';

const PRODUCT_ROUTES = new Set<string>([ROUTES.PRICING, ROUTES.PET_MATCH, ROUTES.FOUNDING_MEMBERS]);

export function getStaticPageStructuredData(pathname: string, config: SEOConfig) {
  const url = pathname === ROUTES.LANDING ? SITE_META.siteUrl : `${SITE_META.siteUrl}${pathname}`;
  const breadcrumbs = buildBreadcrumbListSchema(getStaticPageBreadcrumbs(pathname));

  if (pathname === ROUTES.ABOUT) {
    return buildSchemaGraph(
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildProfilePageSchema({
        url,
        name: config.title,
        description: config.description,
      }),
      buildWebPageSchema({
        url,
        name: config.title,
        description: config.description,
      }),
      breadcrumbs,
    );
  }

  if (PRODUCT_ROUTES.has(pathname)) {
    return buildSchemaGraph(
      ...buildProductPageGraph({
        url,
        name: config.title,
        description: config.description,
      })['@graph'],
      breadcrumbs,
    );
  }

  if (pathname === ROUTES.CONTACT) {
    return buildSchemaGraph(
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildWebPageSchema({
        url,
        name: config.title,
        description: config.description,
      }),
      breadcrumbs,
    );
  }

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebPageSchema({
      url,
      name: config.title,
      description: config.description,
    }),
    breadcrumbs,
  );
}

type StaticPageStructuredDataProps = {
  pathname: string;
  config: SEOConfig;
};

export function StaticPageStructuredData({ pathname, config }: StaticPageStructuredDataProps) {
  const schema = getStaticPageStructuredData(pathname, config);
  useJsonLd(`static-page-${pathname}`, schema);
  return null;
}
