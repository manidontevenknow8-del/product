import type { SEOConfig } from '@/data/seoConfig';
import type { CommercialPageConfig } from '@/data/commercial';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import {
  CommercialPageSchema,
  type CommercialPageSchemaProps,
} from './CommercialPageSchema';
import {
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';

export function getCommercialPageSEO(page: CommercialPageConfig): SEOConfig {
  const keywords = [page.primaryKeyword, ...page.secondaryKeywords].join(', ');
  return {
    title: formatPageTitle(page.title),
    description: formatMetaDescription(page.metaDescription, page.title),
    keywords,
    canonical: `${SITE_META.siteUrl}${page.path}`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: page.heroImageAlt,
    noIndex: false,
  };
}

function getCommercialBreadcrumbs(page: CommercialPageConfig): BreadcrumbItem[] {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: page.heroEyebrow, path: page.path },
  ];
}

export function getCommercialPageSchemaProps(page: CommercialPageConfig): CommercialPageSchemaProps {
  const pageUrl = `${SITE_META.siteUrl}${page.path}`;
  return {
    pageUrl,
    name: page.title,
    description: page.metaDescription,
    topicName: page.schemaTopic.topicName,
    topicWikidataUrl: page.schemaTopic.topicWikidataUrl,
    additionalTopics: page.additionalSchemaTopics,
  };
}

export function getCommercialPageStructuredData(page: CommercialPageConfig) {
  const url = `${SITE_META.siteUrl}${page.path}`;
  const breadcrumbs = buildBreadcrumbListSchema(getCommercialBreadcrumbs(page));

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildFaqPageSchema(page.faqs, `${url}#faq`),
    breadcrumbs,
  );
}

type CommercialPageSEOProps = {
  page: CommercialPageConfig;
};

export function CommercialPageSEO({ page }: CommercialPageSEOProps) {
  const config = getCommercialPageSEO(page);
  const schemaProps = getCommercialPageSchemaProps(page);

  useJsonLd(`commercial-${page.path}`, getCommercialPageStructuredData(page));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
      <CommercialPageSchema {...schemaProps} />
    </>
  );
}
