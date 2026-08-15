import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';
import {
  getRelocationPath,
  type RelocationRouteMeta,
} from '@/data/relocationRoutes';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import {
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';

export function getRelocationHubSEO(): SEOConfig {
  return {
    title: formatPageTitle('Pet Relocation Customs Corridors'),
    description: formatMetaDescription(
      'Airport-pair pet relocation dossiers for IPATA agencies - quarantine, rabies titer waits, DEFRA/USDA/AVS forms, and customs checklists.',
    ),
    keywords: 'pet relocation, IPATA, pet customs, quarantine, pet passport documents',
    canonical: `${SITE_META.siteUrl}${ROUTES.RELOCATION}`,
    ogType: 'website',
    noIndex: false,
  };
}

export function getRelocationHubStructuredData() {
  const pageUrl = `${SITE_META.siteUrl}${ROUTES.RELOCATION}`;
  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildWebPageSchema({
      url: pageUrl,
      name: 'Pet Relocation Customs Corridors',
      description:
        'Airport-pair pet relocation dossiers for IPATA agencies and private clients.',
    }),
    buildBreadcrumbListSchema([
      { name: 'Home', path: ROUTES.LANDING },
      { name: 'Pet Relocation Customs', path: ROUTES.RELOCATION },
    ]),
  );
}

export function getRelocationBreadcrumbs(meta: RelocationRouteMeta): BreadcrumbItem[] {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Pet Relocation Customs', path: ROUTES.RELOCATION },
    {
      name: `${meta.origin.code} to ${meta.destination.code}`,
      path: getRelocationPath(meta),
    },
  ];
}

export function getRelocationRouteSEO(meta: RelocationRouteMeta): SEOConfig {
  const title = formatPageTitle(
    `${meta.origin.code} to ${meta.destination.code} Pet Dog Travel Customs Requirements`,
  );
  const description = formatMetaDescription(
    `${meta.origin.city} (${meta.origin.code}) to ${meta.destination.city} (${meta.destination.code}) pet relocation: quarantine, rabies titer waits, DEFRA/USDA/AVS forms, and customs dossier checklist.`,
  );

  return {
    title,
    description,
    keywords: [
      `${meta.origin.code} to ${meta.destination.code} pet travel`,
      `${meta.origin.city} to ${meta.destination.city} dog relocation`,
      'pet passport documents',
      'pet quarantine rules',
      'IPATA pet relocation',
    ].join(', '),
    canonical: `${SITE_META.siteUrl}${getRelocationPath(meta)}`,
    ogType: 'article',
    ogTitle: title,
    ogDescription: description,
    articleSection: 'Pet Relocation Customs',
    noIndex: false,
  };
}

export function getRelocationRouteStructuredData(meta: RelocationRouteMeta) {
  const pageUrl = `${SITE_META.siteUrl}${getRelocationPath(meta)}`;
  const faqs = [
    {
      question: `What quarantine applies for pets flying ${meta.origin.code} to ${meta.destination.code}?`,
      answer: meta.quarantineDays,
    },
    {
      question: `Is a rabies titer required for ${meta.origin.city} to ${meta.destination.city} dog relocation?`,
      answer: meta.rabiesTiterWait,
    },
    {
      question: `Which documents are needed for ${meta.routeLabel} pet customs?`,
      answer: meta.keyForms.join('; '),
    },
  ];

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildWebPageSchema({
      url: pageUrl,
      name: `${meta.origin.code} to ${meta.destination.code} pet customs dossier`,
      description: meta.urgencyNote,
    }),
    buildBreadcrumbListSchema(getRelocationBreadcrumbs(meta)),
    buildFaqPageSchema(faqs, `${pageUrl}#faq`),
  );
}

export function RelocationRouteSEO({ meta }: { meta: RelocationRouteMeta }) {
  const config = getRelocationRouteSEO(meta);
  useJsonLd(
    `relocation-${meta.slug}`,
    getRelocationRouteStructuredData(meta),
  );

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

export function RelocationHubSEO() {
  const config = getRelocationHubSEO();
  useJsonLd('relocation-hub', getRelocationHubStructuredData());
  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}
