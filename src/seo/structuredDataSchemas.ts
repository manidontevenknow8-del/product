import { HOME_OG_DESCRIPTION, SITE_META } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';

type FaqItem = { question: string; answer: string };

export function buildOrganizationSchema(
  sameAs: readonly string[] = SITE_META.sameAs,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_META.siteUrl}/#organization`,
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

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_META.siteUrl}/#website`,
    name: SITE_META.siteName,
    url: SITE_META.siteUrl,
    description: HOME_OG_DESCRIPTION,
    publisher: {
      '@id': `${SITE_META.siteUrl}/#organization`,
    },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_META.siteUrl}${ROUTES.BLOG}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_META.siteUrl}/#software`,
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
    publisher: {
      '@id': `${SITE_META.siteUrl}/#organization`,
    },
  };
}

export function buildFaqPageSchema(items: readonly FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
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

export function buildLandingGraphSchema(faqItems: readonly FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildWebSiteSchema(),
      buildSoftwareApplicationSchema(),
      buildFaqPageSchema(faqItems),
    ],
  };
}
