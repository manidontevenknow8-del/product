import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { FaqCategoryId } from '@/data/faq/categories';
import { FAQ_CATEGORIES, getFaqCategoryLabel } from '@/data/faq/categories';
import { FAQ_HUB_COUNT } from '@/data/faq';
import type { FaqHubItem } from '@/types/faqHub';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import {
  buildCollectionPageSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';

type FaqIndexSEOOptions = {
  category?: FaqCategoryId;
  search?: string;
};

export function getFaqIndexSEO(options: FaqIndexSEOOptions = {}): SEOConfig {
  const { category, search } = options;
  const categoryLabel = category ? getFaqCategoryLabel(category) : undefined;
  const baseCanonical = `${SITE_META.siteUrl}${ROUTES.FAQ}`;

  if (categoryLabel) {
    return {
      title: `${categoryLabel} FAQ - Pet Health Questions Answered | PetClues`,
      description: `Answers to ${categoryLabel.toLowerCase()} questions about pet records, vaccines, travel, medications, and emergency prep.`,
      keywords: `pet ${categoryLabel.toLowerCase()} faq, pet health questions, petclues faq`,
      canonical: `${baseCanonical}?category=${category}`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      ogImageAlt: `PetClues ${categoryLabel} FAQ`,
      noIndex: false,
    };
  }

  if (search) {
    return {
      title: `FAQ search: “${search}” | PetClues`,
      description: `Search results for “${search}” across ${FAQ_HUB_COUNT} pet health FAQs.`,
      canonical: baseCanonical,
      ogImage: DEFAULT_OG_IMAGE,
      ogImageAlt: 'PetClues FAQ search',
      noIndex: true,
    };
  }

  return {
    title: 'Pet Health FAQ - Records, Vaccines, Travel & Emergency Prep | PetClues',
    description: `${FAQ_HUB_COUNT}+ answers on organizing pet records, vaccination storage, pet passports, travel documents, medications, and emergencies.`,
    keywords:
      'pet health faq, organize pet records, vaccination records, pet passport, travel with pet, pet medication reminder',
    canonical: baseCanonical,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet health FAQ center',
    noIndex: false,
  };
}

export function getFaqItemSEO(item: FaqHubItem): SEOConfig {
  return {
    title: `${item.question} | PetClues FAQ`,
    description: item.shortAnswer,
    keywords: item.keywords.join(', '),
    canonical: `${SITE_META.siteUrl}${ROUTES.FAQ}/${item.slug}`,
    ogType: 'article',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: item.question,
    articleModifiedTime: item.updatedAt,
    articleSection: getFaqCategoryLabel(item.categoryId),
    noIndex: false,
  };
}

function getFaqBreadcrumbs(item?: FaqHubItem, categoryLabel?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'FAQ', path: ROUTES.FAQ },
  ];

  if (categoryLabel && !item) {
    items.push({ name: categoryLabel, path: ROUTES.FAQ });
  }

  if (item) {
    items.push({
      name: getFaqCategoryLabel(item.categoryId),
      path: `${ROUTES.FAQ}?category=${item.categoryId}`,
    });
    items.push({ name: item.question, path: `${ROUTES.FAQ}/${item.slug}` });
  }

  return items;
}

export function getFaqIndexStructuredData(items: FaqHubItem[]) {
  const faqUrl = `${SITE_META.siteUrl}${ROUTES.FAQ}`;
  const breadcrumbs = buildBreadcrumbListSchema(getFaqBreadcrumbs(undefined));

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildFaqPageSchema(
      items.map((item) => ({ question: item.question, answer: item.shortAnswer })),
      `${faqUrl}#faq`,
    ),
    buildCollectionPageSchema({
      url: faqUrl,
      name: 'PetClues Pet Health FAQ Center',
      description: `${FAQ_HUB_COUNT} searchable pet health questions and answers.`,
      items: items.map((item) => ({
        url: `${SITE_META.siteUrl}${ROUTES.FAQ}/${item.slug}`,
        name: item.question,
      })),
    }),
    breadcrumbs,
  );
}

export function getFaqItemStructuredData(item: FaqHubItem) {
  const url = `${SITE_META.siteUrl}${ROUTES.FAQ}/${item.slug}`;
  const breadcrumbs = buildBreadcrumbListSchema(getFaqBreadcrumbs(item));

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildFaqPageSchema(
      [
        {
          question: item.question,
          answer: `${item.shortAnswer} ${item.answer.replace(/\[[^\]]+\]\([^)]+\)/g, '').replace(/\*\*/g, '')}`,
        },
      ],
      `${url}#faq`,
    ),
    {
      '@type': 'QAPage',
      '@id': `${url}#qa`,
      mainEntity: {
        '@type': 'Question',
        name: item.question,
        text: item.question,
        answerCount: 1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer.replace(/\[[^\]]+\]\([^)]+\)/g, '').replace(/\*\*/g, ''),
          url,
        },
      },
    },
    breadcrumbs,
  );
}

export function getFaqIndexBreadcrumbs(categoryLabel?: string) {
  return getFaqBreadcrumbs(undefined, categoryLabel);
}

type FaqIndexSEOProps = {
  items: FaqHubItem[];
  category?: FaqCategoryId;
  search?: string;
};

export function FaqIndexSEO({ items, category, search }: FaqIndexSEOProps) {
  const config = getFaqIndexSEO({ category, search });

  useJsonLd('faq-index', getFaqIndexStructuredData(items));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type FaqItemSEOProps = {
  item: FaqHubItem;
};

export function FaqItemSEO({ item }: FaqItemSEOProps) {
  const config = getFaqItemSEO(item);
  useJsonLd(`faq-item-${item.slug}`, getFaqItemStructuredData(item));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

export { FAQ_CATEGORIES };
