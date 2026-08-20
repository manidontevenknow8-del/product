import type { SEOConfig } from '@/data/seoConfig';
import type { EmergencyGuidePageRecord } from '@content-types/emergency';
import { buildContentMeta } from '@/templates/shared/buildContentMeta';
import { ROUTES } from '@/routes/paths';
import { SITE_META } from '@/data/seoConfig';
import { buildBreadcrumbListSchema } from '@/seo/breadcrumbSchema';
import { buildOrganizationSchema, buildSchemaGraph, buildWebSiteSchema } from '@/seo/structuredDataSchemas';

export function getEmergencyGuidePath(slug: string): string {
  return `/emergency/${slug}`;
}

export function isEmergencyGuidePath(pathname: string): boolean {
  return pathname === '/emergency' || /^\/emergency\/[^/]+$/.test(pathname);
}

export function getEmergencyHubSEO(): SEOConfig {
  return {
    title: 'Pet emergency guides | PetClues',
    description:
      'Calm, step-by-step pet emergency guides — what to do first, when to call poison control vs the ER, and how to keep vet contacts ready.',
    canonical: `${SITE_META.siteUrl}/emergency`,
    ogType: 'website',
    ogTitle: 'Pet emergency guides | PetClues',
    ogDescription:
      'Calm, step-by-step pet emergency guides — what to do first, when to call poison control vs the ER, and how to keep vet contacts ready.',
    noIndex: false,
  };
}

export function getEmergencyGuideSEO(page: EmergencyGuidePageRecord): SEOConfig {
  const path = getEmergencyGuidePath(page.slug);
  const meta = buildContentMeta({
    primaryKeyword: page.primary_keyword,
    description: page.meta_description,
    path,
  });
  return {
    ...meta,
    noIndex: false,
  };
}

export function getEmergencyGuideBreadcrumbs(page: EmergencyGuidePageRecord) {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Emergency guides', path: '/emergency' },
    { name: page.h1, path: getEmergencyGuidePath(page.slug) },
  ];
}

export function getEmergencyGuideStructuredData(page: EmergencyGuidePageRecord) {
  const url = `${SITE_META.siteUrl}${getEmergencyGuidePath(page.slug)}`;
  const faqSchema =
    page.faqs.length > 0
      ? {
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: page.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: page.h1,
      description: page.meta_description,
      mainEntityOfPage: url,
    },
    buildBreadcrumbListSchema(getEmergencyGuideBreadcrumbs(page)),
    faqSchema,
  );
}
