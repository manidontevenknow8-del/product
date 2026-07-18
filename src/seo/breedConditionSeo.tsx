import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { BreedConditionMeta } from '@/data/breedConditions';
import { getBreedConditionPath } from '@/data/breedConditions';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import {
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';
import { buildAdvancedMedicalSchemaNode } from '@/components/seo/AdvancedMedicalSchema';

export function getBreedConditionBreadcrumbs(meta: BreedConditionMeta): BreadcrumbItem[] {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Health Guides', path: ROUTES.GUIDES },
    {
      name: `${meta.condition} in ${meta.breed}s`,
      path: getBreedConditionPath(meta),
    },
  ];
}

export function getBreedConditionSEO(meta: BreedConditionMeta): SEOConfig {
  const title = formatPageTitle(
    `${meta.condition} in ${meta.breed}s: Symptoms, Timeline & Digital Tracking`,
  );
  const description = formatMetaDescription(
    `${meta.scientificName} (${meta.condition}) risk in ${meta.breed}s — symptoms, emergency management protocols, and digital health timeline tracking with PetClues.`,
    meta.breed,
  );

  return {
    title,
    description,
    keywords: [
      `${meta.condition} in ${meta.breed}s`,
      meta.scientificName,
      `${meta.breed} health`,
      'pet health timeline',
      'digital pet passport',
    ].join(', '),
    canonical: `${SITE_META.siteUrl}${getBreedConditionPath(meta)}`,
    ogType: 'article',
    ogTitle: title,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: `${meta.condition} in ${meta.breed}s — PetClues clinical guide`,
    articleSection: 'Breed Clinical Guides',
    noIndex: false,
  };
}

export function getBreedConditionStructuredData(meta: BreedConditionMeta) {
  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildAdvancedMedicalSchemaNode(meta),
    buildBreadcrumbListSchema(getBreedConditionBreadcrumbs(meta)),
  );
}

type BreedConditionSEOProps = {
  meta: BreedConditionMeta;
};

/**
 * Meta + OpenGraph + site graph (Org / WebSite / Software / Breadcrumbs).
 * Deep MedicalWebPage entity linking is owned by `<AdvancedMedicalSchema />`
 * on the page to keep a single authoritative MedicalWebPage node in the DOM.
 */
export function BreedConditionSEO({ meta }: BreedConditionSEOProps) {
  const config = getBreedConditionSEO(meta);
  useJsonLd(
    `breed-condition-site-${meta.slug.replace('/', '-')}`,
    buildSchemaGraph(
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildSoftwareApplicationSchema(),
      buildBreadcrumbListSchema(getBreedConditionBreadcrumbs(meta)),
    ),
  );

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}
