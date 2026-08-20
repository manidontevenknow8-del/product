import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';
import type { RecordsVaultPageRecord } from '@content-types/records-vault';
import { buildContentMeta } from '@/templates/shared/buildContentMeta';
import { ROUTES } from '@/routes/paths';
import { buildBreadcrumbListSchema } from '@/seo/breadcrumbSchema';
import {
  ORGANIZATION_ID,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
} from '@/seo/structuredDataSchemas';

export function getVaultGuidePath(slug: string): string {
  return `${ROUTES.GUIDES}/${slug}`;
}

export function getVaultGuideSEO(page: RecordsVaultPageRecord): SEOConfig {
  const path = getVaultGuidePath(page.slug);
  const meta = buildContentMeta({
    primaryKeyword: page.h1,
    description: page.meta_description,
    path,
  });
  return {
    ...meta,
    noIndex: false,
  };
}

export function getVaultGuideBreadcrumbs(page: RecordsVaultPageRecord) {
  return [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Guides', path: ROUTES.GUIDES },
    { name: page.h1, path: getVaultGuidePath(page.slug) },
  ];
}

export function getVaultGuideStructuredData(page: RecordsVaultPageRecord) {
  const url = `${SITE_META.siteUrl}${getVaultGuidePath(page.slug)}`;
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
      author: { '@type': 'Organization', name: 'PetClues' },
      publisher: { '@id': ORGANIZATION_ID },
    },
    buildBreadcrumbListSchema(getVaultGuideBreadcrumbs(page)),
    ...(faqSchema ? [faqSchema] : []),
  );
}
