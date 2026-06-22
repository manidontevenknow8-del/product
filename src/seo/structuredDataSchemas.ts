import { HOME_OG_DESCRIPTION, SITE_META } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { normalizeSchemaDateTime, SCHEMA_DATETIME_FALLBACK } from '@/seo/schemaDateTime';

export const ORGANIZATION_ID = `${SITE_META.siteUrl}/#organization`;
export const WEBSITE_ID = `${SITE_META.siteUrl}/#website`;
export const SOFTWARE_ID = `${SITE_META.siteUrl}/#software`;

type FaqSchemaItem = {
  question: string;
  answer: string;
  datePublished?: string;
  url?: string;
  upvoteCount?: number;
};

/** Fallback when callers omit per-item dates (e.g. landing FAQ). */
const FAQ_SCHEMA_DEFAULT_DATE = SCHEMA_DATETIME_FALLBACK;

/**
 * Stable placeholder upvote count per question (derived from URL or question text).
 * Not shown in the UI — schema-only until real helpful-vote tracking ships.
 */
export function deriveFaqUpvoteCount(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 12 + (hash % 184);
}

export function buildSchemaAuthor() {
  return {
    '@type': 'Organization' as const,
    '@id': ORGANIZATION_ID,
    name: SITE_META.siteName,
  };
}

export function buildAnswerSchema(item: FaqSchemaItem) {
  const datePublished = normalizeSchemaDateTime(item.datePublished ?? FAQ_SCHEMA_DEFAULT_DATE);

  return {
    '@type': 'Answer',
    text: item.answer,
    ...(item.url ? { url: item.url } : {}),
    author: buildSchemaAuthor(),
    datePublished,
    upvoteCount: item.upvoteCount ?? deriveFaqUpvoteCount(item.url ?? item.question),
  };
}

export function buildQuestionSchema(
  item: FaqSchemaItem,
  options?: { text?: string; answerCount?: number },
) {
  const datePublished = normalizeSchemaDateTime(item.datePublished ?? FAQ_SCHEMA_DEFAULT_DATE);

  return {
    '@type': 'Question',
    name: item.question,
    ...(options?.text ? { text: options.text } : {}),
    ...(options?.answerCount != null ? { answerCount: options.answerCount } : {}),
    datePublished,
    author: buildSchemaAuthor(),
    acceptedAnswer: buildAnswerSchema({ ...item, datePublished }),
  };
}

export function buildFaqPageSchema(items: readonly FaqSchemaItem[], id?: string) {
  return {
    '@type': 'FAQPage',
    ...(id ? { '@id': id } : {}),
    mainEntity: items.map((item) => buildQuestionSchema(item)),
  };
}

export function buildQAPageSchema(options: {
  url: string;
  question: string;
  answer: string;
  datePublished: string;
  upvoteCount?: number;
}) {
  return {
    '@type': 'QAPage',
    '@id': `${options.url}#qa`,
    mainEntity: buildQuestionSchema(
      {
        question: options.question,
        answer: options.answer,
        datePublished: options.datePublished,
        url: options.url,
        upvoteCount: options.upvoteCount,
      },
      { text: options.question, answerCount: 1 },
    ),
  };
}

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
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free plan available',
      },
      {
        '@type': 'Offer',
        name: 'Plus Annual Membership',
        price: '99',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        description: 'Annual Plus membership — international pricing',
      },
      {
        '@type': 'Offer',
        name: 'Pro Annual Membership',
        price: '299',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        description: 'Annual Pro membership — international pricing',
      },
    ],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function buildPricingPageSchema() {
  return {
    '@type': 'WebPage',
    '@id': `${SITE_META.siteUrl}/pricing#webpage`,
    name: 'PetClues Annual Membership',
    description:
      'Annual memberships for pet health records, reminders, documents, and AI insights. India pricing in INR; international pricing in USD.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Offer',
            name: 'Plus Annual',
            price: '1999',
            priceCurrency: 'INR',
            description: 'Annual Plus membership for India',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Offer',
            name: 'Pro Annual',
            price: '4999',
            priceCurrency: 'INR',
            description: 'Annual Pro membership for India',
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'Offer',
            name: 'Plus Annual',
            price: '99',
            priceCurrency: 'USD',
            description: 'Annual Plus membership — international',
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@type': 'Offer',
            name: 'Pro Annual',
            price: '299',
            priceCurrency: 'USD',
            description: 'Annual Pro membership — international',
          },
        },
      ],
    },
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
    ...(options.dateModified
      ? { dateModified: normalizeSchemaDateTime(options.dateModified) }
      : {}),
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
    datePublished: normalizeSchemaDateTime(options.datePublished),
    dateModified: normalizeSchemaDateTime(options.dateModified),
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
    ...(options.datePublished
      ? { datePublished: normalizeSchemaDateTime(options.datePublished) }
      : {}),
    dateModified: normalizeSchemaDateTime(options.dateModified),
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

export function buildLandingGraphSchema(faqItems: readonly FaqSchemaItem[]) {
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
