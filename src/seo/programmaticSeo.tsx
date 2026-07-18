import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { ProgrammaticCollectionId, ProgrammaticPage } from '@/types/programmaticPage';
import { getProgrammaticCollection } from '@/data/programmatic/collections';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import { buildMedicalWebPageSchema } from './medicalWebPageSchema';
import {
  buildArticleSchema,
  buildCollectionPageSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
  WIKIDATA_ENTITIES,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';

const MEDICAL_GUIDE_COLLECTIONS = new Set<ProgrammaticCollectionId>([
  'dog-vaccination-schedule',
  'cat-vaccination-schedule',
  'pet-emergency-checklist',
  'medication-tracking-template',
  'health-record-template',
]);

function medicalAboutForCollection(collectionId: ProgrammaticCollectionId) {
  switch (collectionId) {
    case 'dog-vaccination-schedule':
    case 'cat-vaccination-schedule':
      return [
        {
          name: WIKIDATA_ENTITIES.vaccination.name,
          description: 'Preventive immunization schedules and booster tracking for companion animals.',
          sameAs: WIKIDATA_ENTITIES.vaccination.sameAs,
        },
      ];
    case 'health-record-template':
      return [
        {
          name: WIKIDATA_ENTITIES.electronicHealthRecord.name,
          description: 'Structured veterinary health record templates for lifelong pet medical archives.',
          sameAs: WIKIDATA_ENTITIES.electronicHealthRecord.sameAs,
        },
      ];
    case 'pet-emergency-checklist':
      return [
        {
          name: 'Veterinary emergency preparedness',
          description:
            'Checklists and triage documentation for acute pet emergencies before veterinary assessment.',
        },
      ];
    case 'medication-tracking-template':
      return [
        {
          name: 'Veterinary medication adherence',
          description: 'Dose logging and refill tracking templates for prescribed pet medications.',
        },
      ];
    default:
      return undefined;
  }
}

function collectionPath(collectionId: ProgrammaticCollectionId): string {
  return `${ROUTES.GUIDES}/${collectionId}`;
}

function pagePath(page: ProgrammaticPage): string {
  return `${collectionPath(page.collectionId)}/${page.slug}`;
}

export function getProgrammaticHubSEO(): SEOConfig {
  return {
    title: formatPageTitle('Pet Care Guides & Templates - Vaccines, Travel, Emergency'),
    description: formatMetaDescription(
      '91+ programmatic pet care guides: dog and cat vaccination schedules by breed, travel checklists by country, emergency checklists by species, and health record templates.',
    ),
    keywords:
      'dog vaccination schedule by breed, cat vaccination schedule, pet travel checklist, pet emergency checklist, pet health record template',
    canonical: `${SITE_META.siteUrl}${ROUTES.GUIDES}`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues programmatic pet care guides',
    noIndex: false,
  };
}

export function getProgrammaticCollectionSEO(collectionId: ProgrammaticCollectionId): SEOConfig {
  const collection = getProgrammaticCollection(collectionId);

  return {
    title: formatPageTitle(collection.label),
    description: formatMetaDescription(collection.description, collection.label),
    keywords: collection.label.toLowerCase(),
    canonical: `${SITE_META.siteUrl}${collectionPath(collectionId)}`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: collection.label,
    noIndex: false,
  };
}

export function getProgrammaticPageSEO(page: ProgrammaticPage): SEOConfig {
  return {
    title: formatPageTitle(page.title),
    description: formatMetaDescription(page.metaDescription, page.title),
    keywords: page.keywords.join(', '),
    canonical: `${SITE_META.siteUrl}${pagePath(page)}`,
    ogType: 'article',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: page.title,
    articleModifiedTime: page.updatedAt,
    articleSection: getProgrammaticCollection(page.collectionId).label,
    noIndex: false,
  };
}

function getProgrammaticBreadcrumbs(
  page?: ProgrammaticPage,
  collectionId?: ProgrammaticCollectionId,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Health Guides', path: ROUTES.GUIDES },
  ];

  if (collectionId) {
    const collection = getProgrammaticCollection(collectionId);
    items.push({ name: collection.label, path: collectionPath(collectionId) });
  }

  if (page) {
    items.push({
      name: page.subjectName,
      path: pagePath(page),
    });
  }

  return items;
}

export function getProgrammaticPageStructuredData(page: ProgrammaticPage) {
  const url = `${SITE_META.siteUrl}${pagePath(page)}`;
  const breadcrumbs = buildBreadcrumbListSchema(getProgrammaticBreadcrumbs(page));
  const headline = page.title.replace(' | PetClues Guides', '');

  const checklistSchema =
    page.checklist && page.checklist.length > 0
      ? {
          '@type': 'HowTo',
          name: headline,
          description: page.metaDescription,
          step: page.checklist.flatMap((group) =>
            group.items.map((item, index) => ({
              '@type': 'HowToStep',
              position: index + 1,
              name: group.title,
              text: item,
            })),
          ),
        }
      : null;

  const medicalWebPage = MEDICAL_GUIDE_COLLECTIONS.has(page.collectionId)
    ? buildMedicalWebPageSchema({
        url,
        name: headline,
        description: page.metaDescription,
        about: medicalAboutForCollection(page.collectionId),
      })
    : null;

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildArticleSchema({
      url,
      headline,
      description: page.metaDescription,
      datePublished: page.updatedAt,
      dateModified: page.updatedAt,
      articleSection: getProgrammaticCollection(page.collectionId).label,
    }),
    buildFaqPageSchema(page.faqs, `${url}#faq`),
    checklistSchema,
    medicalWebPage,
    breadcrumbs,
  );
}

export function getProgrammaticHubStructuredData(
  collections: { id: ProgrammaticCollectionId; label: string; pageCount: number }[],
) {
  const url = `${SITE_META.siteUrl}${ROUTES.GUIDES}`;

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildCollectionPageSchema({
      url,
      name: 'PetClues Health Guides',
      description: getProgrammaticHubSEO().description,
      items: collections.map((collection) => ({
        url: `${SITE_META.siteUrl}${collectionPath(collection.id)}`,
        name: collection.label,
      })),
    }),
    buildBreadcrumbListSchema(getProgrammaticBreadcrumbs()),
  );
}

type ProgrammaticHubSEOProps = {
  collections: { id: ProgrammaticCollectionId; label: string; pageCount: number }[];
};

export function ProgrammaticHubSEO({ collections }: ProgrammaticHubSEOProps) {
  const config = getProgrammaticHubSEO();
  useJsonLd('programmatic-hub', getProgrammaticHubStructuredData(collections));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type ProgrammaticCollectionSEOProps = {
  collectionId: ProgrammaticCollectionId;
  pages: { slug: string; title: string }[];
};

export function ProgrammaticCollectionSEO({ collectionId, pages }: ProgrammaticCollectionSEOProps) {
  const config = getProgrammaticCollectionSEO(collectionId);
  const url = `${SITE_META.siteUrl}${collectionPath(collectionId)}`;

  useJsonLd(`programmatic-collection-${collectionId}`, buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildCollectionPageSchema({
      url,
      name: getProgrammaticCollection(collectionId).label,
      description: getProgrammaticCollection(collectionId).description,
      items: pages.map((page) => ({
        url: `${url}/${page.slug}`,
        name: page.title,
      })),
    }),
    buildBreadcrumbListSchema(getProgrammaticBreadcrumbs(undefined, collectionId)),
  ));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type ProgrammaticPageSEOProps = {
  page: ProgrammaticPage;
};

export function ProgrammaticPageSEO({ page }: ProgrammaticPageSEOProps) {
  const config = getProgrammaticPageSEO(page);
  useJsonLd(`programmatic-${page.collectionId}-${page.slug}`, getProgrammaticPageStructuredData(page));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type ProgrammaticNotFoundSEOProps = {
  collectionId?: string;
  slug?: string;
};

export function ProgrammaticNotFoundSEO({ collectionId, slug }: ProgrammaticNotFoundSEOProps) {
  const path = collectionId && slug ? `${ROUTES.GUIDES}/${collectionId}/${slug}` : ROUTES.GUIDES;
  const config: SEOConfig = {
    title: 'Guide Not Found - PetClues',
    description: 'This programmatic guide could not be found. Browse PetClues guides and templates.',
    canonical: `${SITE_META.siteUrl}${path}`,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues guides',
    noIndex: true,
  };

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

export function getProgrammaticHubBreadcrumbs() {
  return getProgrammaticBreadcrumbs();
}

export function getProgrammaticCollectionBreadcrumbs(collectionId: ProgrammaticCollectionId) {
  return getProgrammaticBreadcrumbs(undefined, collectionId);
}

export function getProgrammaticPageBreadcrumbs(page: ProgrammaticPage) {
  return getProgrammaticBreadcrumbs(page);
}
