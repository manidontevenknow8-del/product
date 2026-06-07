import { SITE_META } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';

type FaqItem = { question: string; answer: string };

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_META.siteName,
    url: SITE_META.siteUrl,
    logo: SITE_META.logoUrl,
    description:
      'Pet health records app for vaccination reminders, medical records organization, and emergency pet passports.',
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
    name: SITE_META.siteName,
    url: SITE_META.siteUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_META.siteName,
      url: SITE_META.siteUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_META.siteUrl}${ROUTES.BLOG}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
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
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        '@type': 'WebApplication',
        name: SITE_META.siteName,
        url: SITE_META.siteUrl,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Organize pet medical records, vaccination reminders, daily check-ins, and emergency pet passports.',
      },
      buildFaqPageSchema(faqItems),
    ],
  };
}
