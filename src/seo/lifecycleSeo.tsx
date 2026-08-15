import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';
import { getLifecyclePath, type LifecycleMatrixEntry } from '@/data/lifecycleMatrix';
import { getLifecyclePageContent } from '@/data/lifecycleContent';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import { buildMedicalWebPageSchema } from './medicalWebPageSchema';
import {
  buildArticleSchema,
  buildFaqPageSchema,
  buildHowToSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';

const LIFECYCLE_PUBLISHED = '2026-08-14';

export function getLifecycleGuideBreadcrumbs(entry: LifecycleMatrixEntry): BreadcrumbItem[] {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Health Guides', path: ROUTES.GUIDES },
    { name: entry.breed.name, path: getLifecyclePath(entry.breed.slug, 'puppy-vaccination-schedule') },
    { name: entry.stage.label, path: entry.path },
  ];
}

export function getLifecycleGuideSEO(entry: LifecycleMatrixEntry): SEOConfig {
  const headline = `${entry.stage.label} for ${entry.breed.name}s`;
  const title = formatPageTitle(headline);
  const description = formatMetaDescription(
    `${entry.stage.label} for ${entry.breed.name}s (${entry.breed.adultWeight}) - timeline, diet notes, and a dated care log for ${entry.breed.healthFocus}.`,
    entry.breed.name,
  );

  return {
    title,
    description,
    keywords: [
      `${entry.breed.name} ${entry.stage.searchIntent}`,
      entry.stage.label,
      `${entry.breed.name} diet`,
      `${entry.breed.name} health timeline`,
      'digital pet passport',
    ].join(', '),
    canonical: `${SITE_META.siteUrl}${entry.path}`,
    ogType: 'article',
    ogTitle: title,
    ogDescription: description,
    articleSection: 'Breed Lifecycle Guides',
    articlePublishedTime: LIFECYCLE_PUBLISHED,
    articleModifiedTime: LIFECYCLE_PUBLISHED,
    noIndex: false,
  };
}

export function getLifecycleGuideStructuredData(entry: LifecycleMatrixEntry) {
  const pageUrl = `${SITE_META.siteUrl}${entry.path}`;
  const content = getLifecyclePageContent(entry);
  const config = getLifecycleGuideSEO(entry);

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildArticleSchema({
      url: pageUrl,
      headline: content.title,
      description: config.description ?? content.lead,
      datePublished: LIFECYCLE_PUBLISHED,
      dateModified: LIFECYCLE_PUBLISHED,
      articleSection: 'Breed Lifecycle Guides',
    }),
    buildMedicalWebPageSchema({
      url: pageUrl,
      name: content.title,
      description: config.description ?? content.lead,
      audienceType: `${entry.breed.name} owners, breeders, and veterinary teams`,
      about: [
        {
          name: content.title,
          description: content.lead,
        },
      ],
    }),
    buildHowToSchema({
      url: pageUrl,
      name: content.timelineHeading,
      description: content.lead,
      steps: content.timeline.map((step) => ({
        name: `${step.label}: ${step.title}`,
        text: step.detail,
      })),
    }),
    buildBreadcrumbListSchema(getLifecycleGuideBreadcrumbs(entry)),
    buildFaqPageSchema(content.faqs, `${pageUrl}#faq`),
  );
}

type LifecycleGuideSEOProps = {
  entry: LifecycleMatrixEntry;
};

export function LifecycleGuideSEO({ entry }: LifecycleGuideSEOProps) {
  const config = getLifecycleGuideSEO(entry);
  useJsonLd(
    `lifecycle-guide-site-${entry.breed.slug}-${entry.stage.slug}`,
    buildSchemaGraph(
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildBreadcrumbListSchema(getLifecycleGuideBreadcrumbs(entry)),
    ),
  );

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}
