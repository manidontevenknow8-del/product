import { HOME_OG_DESCRIPTION, SITE_META } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';

type FaqItem = { question: string; answer: string };

export const ORGANIZATION_ID = `${SITE_META.siteUrl}/#organization`;
export const WEBSITE_ID = `${SITE_META.siteUrl}/#website`;
export const SOFTWARE_ID = `${SITE_META.siteUrl}/#software`;

export function buildSchemaGraph(...nodes: readonly (object | null | undefined)[]) {
  const graph = nodes.filter((node): node is object => node != null);
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildOrganizationSchema(
  sameAs: readonly string[] = SITE_META.sameAs,
) {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_META.siteName,
    url: SITE_META.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: SITE_META.logoUrl,
      width: 512,
      height: 512,
    },
    image: SITE_META.logoUrl,
    description: SITE_META.organizationDescription,
    sameAs: [...sameAs],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@petclues.com',
      availableLanguage: 'English',
    },
  };
}

export function buildSearchActionSchema(searchPath: string) {
  const hasQuery = searchPath.includes('?');
  const urlTemplate = hasQuery
    ? `${SITE_META.siteUrl}${searchPath}&q={search_term_string}`
    : `${SITE_META.siteUrl}${searchPath}?q={search_term_string}`;

  return {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate,
    },
    'query-input': 'required name=search_term_string',
  };
}

export function buildWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_META.siteName,
    url: SITE_META.siteUrl,
    description: HOME_OG_DESCRIPTION,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-US',
    potentialAction: [
      buildSearchActionSchema(ROUTES.BLOG),
      buildSearchActionSchema(ROUTES.FAQ),
    ],
  };
}

export function buildSoftwareApplicationSchema() {
  return {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: SITE_META.siteName,
    url: SITE_META.siteUrl,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description: SITE_META.softwareDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan available',
    },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function buildFaqPageSchema(items: readonly FaqItem[], id?: string) {
  return {
    '@type': 'FAQPage',
    ...(id ? { '@id': id } : {}),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildWebPageSchema(options: {
  url: string;
  name: string;
  description: string;
  dateModified?: string;
}) {
  return {
    '@type': 'WebPage',
    '@id': `${options.url}#webpage`,
    url: options.url,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
  };
}

export function buildArticleSchema(options: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  articleSection?: string;
}) {
  return {
    '@type': 'Article',
    '@id': `${options.url}#article`,
    headline: options.headline,
    description: options.description,
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    author: { '@type': 'Organization', '@id': ORGANIZATION_ID },
    publisher: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE_META.siteName,
      logo: { '@type': 'ImageObject', url: SITE_META.logoUrl },
    },
    mainEntityOfPage: options.url,
    isPartOf: { '@id': WEBSITE_ID },
    ...(options.articleSection ? { articleSection: options.articleSection } : {}),
  };
}

export function buildBlogPostingSchema(options: {
  url: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified: string;
  image?: string[];
  articleSection?: string;
  keywords?: string;
  authorName?: string;
}) {
  return {
    '@type': 'BlogPosting',
    '@id': `${options.url}#blogposting`,
    headline: options.headline,
    description: options.description,
    ...(options.image ? { image: options.image } : {}),
    author: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: options.authorName ?? SITE_META.siteName,
    },
    publisher: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE_META.siteName,
      logo: { '@type': 'ImageObject', url: SITE_META.logoUrl },
    },
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    mainEntityOfPage: options.url,
    isPartOf: { '@id': WEBSITE_ID },
    ...(options.articleSection ? { articleSection: options.articleSection } : {}),
    ...(options.keywords ? { keywords: options.keywords } : {}),
  };
}

export function buildProfilePageSchema(options: {
  url: string;
  name: string;
  description: string;
}) {
  return {
    '@type': 'ProfilePage',
    '@id': `${options.url}#profile`,
    url: options.url,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE_META.siteName,
      url: SITE_META.siteUrl,
      description: SITE_META.organizationDescription,
      logo: SITE_META.logoUrl,
      sameAs: [...SITE_META.sameAs],
    },
  };
}

export function buildCollectionPageSchema(options: {
  url: string;
  name: string;
  description: string;
  items: { url: string; name: string }[];
}) {
  return {
    '@type': 'CollectionPage',
    '@id': `${options.url}#collection`,
    url: options.url,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: options.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    },
  };
}

export function buildLandingGraphSchema(faqItems: readonly FaqItem[]) {
  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildFaqPageSchema(faqItems, `${SITE_META.siteUrl}/#landing-faq`),
  );
}

export function buildBaseSiteGraph() {
  return buildSchemaGraph(buildOrganizationSchema(), buildWebSiteSchema());
}

export function buildProductPageGraph(options: {
  url: string;
  name: string;
  description: string;
}) {
  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildWebPageSchema(options),
  );
}
