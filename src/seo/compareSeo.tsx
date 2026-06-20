import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { ComparisonPage } from '@/types/comparison';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import {
  buildCollectionPageSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';

export function getCompareIndexSEO(): SEOConfig {
  return {
    title: formatPageTitle('Pet Health App Comparisons - Spreadsheets & Alternatives'),
    description: formatMetaDescription(
      'Compare PetClues with Google Drive, Excel, Notion, PetDesk, paper records, and 45+ alternatives for pet health records, vaccination reminders, and emergency info.',
    ),
    keywords:
      'petclues vs, best pet health record app, alternative to spreadsheets pet records, pet health app comparison',
    canonical: `${SITE_META.siteUrl}${ROUTES.COMPARE}`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues comparison guides for pet health records',
    noIndex: false,
  };
}

export function getComparePageSEO(page: ComparisonPage): SEOConfig {
  return {
    title: formatPageTitle(page.title),
    description: formatMetaDescription(page.metaDescription, page.title),
    keywords: page.keywords.join(', '),
    canonical: `${SITE_META.siteUrl}${ROUTES.COMPARE}/${page.slug}`,
    ogType: 'article',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: page.title,
    articleModifiedTime: page.updatedAt,
    articleSection: 'Comparisons',
    noIndex: false,
  };
}

function getCompareBreadcrumbs(page?: ComparisonPage): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Compare', path: ROUTES.COMPARE },
  ];
  if (page) {
    items.push({
      name: page.competitorName,
      path: `${ROUTES.COMPARE}/${page.slug}`,
    });
  }
  return items;
}

export function getComparePageStructuredData(page: ComparisonPage) {
  const url = `${SITE_META.siteUrl}${ROUTES.COMPARE}/${page.slug}`;
  const breadcrumbs = buildBreadcrumbListSchema(getCompareBreadcrumbs(page));

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildWebPageSchema({
      url,
      name: page.title,
      description: page.metaDescription,
      dateModified: page.updatedAt,
    }),
    buildSoftwareApplicationSchema(),
    buildFaqPageSchema(page.faqs, `${url}#faq`),
    breadcrumbs,
  );
}

export function getCompareIndexStructuredData(pages: { slug: string; title: string }[]) {
  const url = `${SITE_META.siteUrl}${ROUTES.COMPARE}`;

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildCollectionPageSchema({
      url,
      name: 'PetClues Comparisons',
      description: getCompareIndexSEO().description,
      items: pages.map((page) => ({
        url: `${SITE_META.siteUrl}${ROUTES.COMPARE}/${page.slug}`,
        name: page.title,
      })),
    }),
    buildBreadcrumbListSchema(getCompareBreadcrumbs()),
  );
}

type CompareIndexSEOProps = {
  pages: { slug: string; title: string }[];
};

export function CompareIndexSEO({ pages }: CompareIndexSEOProps) {
  const config = getCompareIndexSEO();
  useJsonLd('compare-index', getCompareIndexStructuredData(pages));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type ComparePageSEOProps = {
  page: ComparisonPage;
};

export function ComparePageSEO({ page }: ComparePageSEOProps) {
  const config = getComparePageSEO(page);
  useJsonLd(`compare-${page.slug}`, getComparePageStructuredData(page));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type CompareNotFoundSEOProps = {
  slug: string;
};

export function CompareNotFoundSEO({ slug }: CompareNotFoundSEOProps) {
  const config: SEOConfig = {
    title: 'Comparison Not Found - PetClues',
    description: 'This comparison page could not be found. Browse PetClues alternatives and pet health app comparisons.',
    canonical: `${SITE_META.siteUrl}${ROUTES.COMPARE}/${slug}`,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues comparisons',
    noIndex: true,
  };

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

export function getComparePageBreadcrumbs(page: ComparisonPage) {
  return getCompareBreadcrumbs(page);
}

export function getCompareIndexBreadcrumbs() {
  return getCompareBreadcrumbs();
}
