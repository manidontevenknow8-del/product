import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { IntentPage } from '@/types/intentPage';
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

export function getIntentIndexSEO(): SEOConfig {
  return {
    title: formatPageTitle('Best Pet Health Apps & Tools (2026)'),
    description: formatMetaDescription(
      'Authoritative guides for the best pet health record apps, vaccination trackers, reminder apps, digital passports, and pet care platforms with comparisons and FAQs.',
    ),
    keywords:
      'best pet health record app, best pet reminder app, pet vaccination tracker, digital pet passport, pet medical record organizer',
    canonical: `${SITE_META.siteUrl}${ROUTES.BEST}`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues best pet health app guides',
    noIndex: false,
  };
}

export function getIntentPageSEO(page: IntentPage): SEOConfig {
  return {
    title: formatPageTitle(page.title),
    description: formatMetaDescription(page.metaDescription, page.title),
    keywords: page.keywords.join(', '),
    canonical: `${SITE_META.siteUrl}${ROUTES.BEST}/${page.slug}`,
    ogType: 'article',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: page.title,
    articleModifiedTime: page.updatedAt,
    articleSection: 'Best Pet Apps',
    noIndex: false,
  };
}

function getIntentBreadcrumbs(page?: IntentPage): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Best', path: ROUTES.BEST },
  ];
  if (page) {
    items.push({
      name: page.intentLabel,
      path: `${ROUTES.BEST}/${page.slug}`,
    });
  }
  return items;
}

export function getIntentPageStructuredData(page: IntentPage) {
  const url = `${SITE_META.siteUrl}${ROUTES.BEST}/${page.slug}`;
  const breadcrumbs = buildBreadcrumbListSchema(getIntentBreadcrumbs(page));

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
    {
      '@type': 'ItemList',
      name: `${page.intentLabel} options compared`,
      itemListElement: page.comparisons.map((option, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: option.name,
        description: `${option.type}. Best for: ${option.bestFor}`,
      })),
    },
    buildFaqPageSchema(page.faqs, `${url}#faq`),
    breadcrumbs,
  );
}

export function getIntentIndexStructuredData(pages: { slug: string; title: string }[]) {
  const url = `${SITE_META.siteUrl}${ROUTES.BEST}`;

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildCollectionPageSchema({
      url,
      name: 'Best Pet Health Apps & Tools',
      description: getIntentIndexSEO().description,
      items: pages.map((item) => ({
        url: `${SITE_META.siteUrl}${ROUTES.BEST}/${item.slug}`,
        name: item.title,
      })),
    }),
    buildBreadcrumbListSchema(getIntentBreadcrumbs()),
  );
}

type IntentIndexSEOProps = {
  pages: { slug: string; title: string }[];
};

export function IntentIndexSEO({ pages }: IntentIndexSEOProps) {
  const config = getIntentIndexSEO();
  useJsonLd('intent-index', getIntentIndexStructuredData(pages));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type IntentPageSEOProps = {
  page: IntentPage;
};

export function IntentPageSEO({ page }: IntentPageSEOProps) {
  const config = getIntentPageSEO(page);
  useJsonLd(`intent-${page.slug}`, getIntentPageStructuredData(page));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type IntentNotFoundSEOProps = {
  slug: string;
};

export function IntentNotFoundSEO({ slug }: IntentNotFoundSEOProps) {
  const config: SEOConfig = {
    title: 'Guide Not Found - PetClues',
    description: 'This best-of guide could not be found. Browse PetClues intent guides for pet health apps and tools.',
    canonical: `${SITE_META.siteUrl}${ROUTES.BEST}/${slug}`,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues best pet app guides',
    noIndex: true,
  };

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

export function getIntentPageBreadcrumbs(page: IntentPage) {
  return getIntentBreadcrumbs(page);
}

export function getIntentIndexBreadcrumbs() {
  return getIntentBreadcrumbs();
}
