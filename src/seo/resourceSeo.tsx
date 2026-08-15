import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';
import type { ResourceMatrixEntry } from '@/data/resourceMatrix';
import { RESOURCE_CITIES, RESOURCE_TOPICS, getResourcePath } from '@/data/resourceMatrix';
import { getResourcePageContent } from '@/data/resourceContent';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import {
  buildArticleSchema,
  buildCollectionPageSchema,
  buildFaqPageSchema,
  buildHowToSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';

const PUBLISHED = '2026-08-14';

export function getResourceGuideBreadcrumbs(entry: ResourceMatrixEntry): BreadcrumbItem[] {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Local resources', path: '/resources' },
    { name: entry.city.name, path: `/resources/${entry.city.slug}/${entry.topic.slug}` },
    { name: entry.topic.label, path: entry.path },
  ];
}

export function getResourceHubBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Local resources', path: '/resources' },
  ];
}

export function getResourceGuideSEO(entry: ResourceMatrixEntry): SEOConfig {
  const headline = `${entry.topic.label} in ${entry.city.name}, ${entry.city.stateAbbr}`;
  const title = formatPageTitle(headline);
  const description = formatMetaDescription(
    `${entry.topic.label} for ${entry.city.name}, ${entry.city.stateAbbr}. Checklist, intake steps, and a digital packet for boarding, sitters, and ER visits.`,
    entry.city.name,
  );

  return {
    title,
    description,
    keywords: [
      `${entry.topic.label} ${entry.city.name}`,
      entry.topic.searchIntent,
      `${entry.city.name} pet records`,
      'digital pet passport',
    ].join(', '),
    canonical: `${SITE_META.siteUrl}${entry.path}`,
    ogType: 'article',
    ogTitle: title,
    ogDescription: description,
    articleSection: 'Local Pet Record Resources',
    articlePublishedTime: PUBLISHED,
    articleModifiedTime: PUBLISHED,
    noIndex: false,
  };
}

export function getResourceHubSEO(): SEOConfig {
  const title = formatPageTitle('Local pet record packets for boarding, travel, and emergencies');
  const description = formatMetaDescription(
    '2,000 city resource pages for boarding vaccines, titer travel files, sitter handoffs, and ER kits. Built as lead-gen checklists with PetClues vaults.',
  );
  return {
    title,
    description,
    canonical: `${SITE_META.siteUrl}/resources`,
    ogType: 'website',
    ogTitle: title,
    ogDescription: description,
    noIndex: false,
  };
}

export function getResourceGuideStructuredData(entry: ResourceMatrixEntry) {
  const pageUrl = `${SITE_META.siteUrl}${entry.path}`;
  const content = getResourcePageContent(entry);
  const config = getResourceGuideSEO(entry);

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildArticleSchema({
      url: pageUrl,
      headline: content.title,
      description: config.description ?? content.lead,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      articleSection: 'Local Pet Record Resources',
    }),
    buildHowToSchema({
      url: pageUrl,
      name: content.title,
      description: content.lead,
      steps: content.steps.map((step) => ({ name: step.title, text: step.detail })),
    }),
    buildBreadcrumbListSchema(getResourceGuideBreadcrumbs(entry)),
    buildFaqPageSchema(content.faqs, `${pageUrl}#faq`),
  );
}

export function ResourceGuideSEO({ entry }: { entry: ResourceMatrixEntry }) {
  const config = getResourceGuideSEO(entry);
  useJsonLd(
    `resource-guide-site-${entry.city.slug}-${entry.topic.slug}`,
    buildSchemaGraph(
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildBreadcrumbListSchema(getResourceGuideBreadcrumbs(entry)),
    ),
  );
  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

export function getResourceHubStructuredData() {
  const pageUrl = `${SITE_META.siteUrl}/resources`;
  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildCollectionPageSchema({
      url: pageUrl,
      name: 'Local pet record packets',
      description:
        'City checklists for boarding vaccines, titer travel files, sitter handoffs, and ER kits.',
      items: RESOURCE_TOPICS.map((topic) => ({
        url: `${SITE_META.siteUrl}${getResourcePath(RESOURCE_CITIES[0].slug, topic.slug)}`,
        name: topic.label,
      })),
    }),
    buildBreadcrumbListSchema(getResourceHubBreadcrumbs()),
  );
}

export function ResourceHubSEO() {
  const config = getResourceHubSEO();
  useJsonLd('resource-hub', getResourceHubStructuredData());
  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}
