import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { LearnArticle } from '@/types/learn';
import type { LearnCategoryId } from '@/data/learn/categories';
import { getLearnCategoryLabel } from '@/data/learn/categories';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema, type BreadcrumbItem } from './breadcrumbSchema';
import {
  buildArticleSchema,
  buildCollectionPageSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';

export function getLearnIndexSEO(category?: LearnCategoryId): SEOConfig {
  const base = `${SITE_META.siteUrl}${ROUTES.LEARN}`;
  const categoryLabel = category ? getLearnCategoryLabel(category) : undefined;

  if (categoryLabel) {
    return {
      title: `${categoryLabel} Guides for Pet Parents | PetClues Learn`,
      description: `Expert ${categoryLabel.toLowerCase()} guides: what to track, why it matters, step-by-step how-tos, and how PetClues keeps your pet's care organized.`,
      keywords: `pet ${categoryLabel.toLowerCase()}, pet health guides, petclues learn`,
      canonical: `${base}?category=${category}`,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      ogImageAlt: `PetClues Learn - ${categoryLabel}`,
      noIndex: false,
    };
  }

  return {
    title: 'PetClues Learn - Pet Health Records, Vaccines & Care Guides',
    description:
      '50+ expert guides on pet health records, vaccinations, emergency passports, travel documents, medication tracking, and everyday pet organization.',
    keywords:
      'pet health guides, pet vaccination help, pet emergency passport, organize pet records, pet medication tracking',
    canonical: base,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues Learn knowledge base',
    noIndex: false,
  };
}

export function getLearnArticleSEO(article: LearnArticle): SEOConfig {
  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords.join(', '),
    canonical: `${SITE_META.siteUrl}${ROUTES.LEARN}/${article.slug}`,
    ogType: 'article',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: article.title,
    articleModifiedTime: article.updatedAt,
    articleSection: getLearnCategoryLabel(article.categoryId),
    noIndex: false,
  };
}

function getLearnBreadcrumbs(article?: LearnArticle, categoryLabel?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', path: ROUTES.LANDING },
    { name: 'Learn', path: ROUTES.LEARN },
  ];

  if (categoryLabel && !article) {
    items.push({ name: categoryLabel, path: ROUTES.LEARN });
  }

  if (article) {
    items.push({
      name: getLearnCategoryLabel(article.categoryId),
      path: `${ROUTES.LEARN}?category=${article.categoryId}`,
    });
    items.push({
      name: article.title.replace(' | PetClues Learn', ''),
      path: `${ROUTES.LEARN}/${article.slug}`,
    });
  }

  return items;
}

export function getLearnArticleStructuredData(article: LearnArticle) {
  const url = `${SITE_META.siteUrl}${ROUTES.LEARN}/${article.slug}`;
  const breadcrumbs = buildBreadcrumbListSchema(getLearnBreadcrumbs(article));
  const headline = article.title.replace(' | PetClues Learn', '');

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildArticleSchema({
      url,
      headline,
      description: article.metaDescription,
      datePublished: article.updatedAt,
      dateModified: article.updatedAt,
      articleSection: getLearnCategoryLabel(article.categoryId),
    }),
    buildFaqPageSchema(article.faqs, `${url}#faq`),
    breadcrumbs,
  );
}

export function getLearnIndexStructuredData(
  articles: { slug: string; title: string }[],
  category?: LearnCategoryId,
) {
  const url = category
    ? `${SITE_META.siteUrl}${ROUTES.LEARN}?category=${category}`
    : `${SITE_META.siteUrl}${ROUTES.LEARN}`;

  const categoryLabel = category ? getLearnCategoryLabel(category) : undefined;
  const breadcrumbs = buildBreadcrumbListSchema(
    getLearnBreadcrumbs(undefined, categoryLabel),
  );

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildCollectionPageSchema({
      url,
      name: categoryLabel ? `${categoryLabel} - PetClues Learn` : 'PetClues Learn',
      description: getLearnIndexSEO(category).description,
      items: articles.map((article) => ({
        url: `${SITE_META.siteUrl}${ROUTES.LEARN}/${article.slug}`,
        name: article.title,
      })),
    }),
    breadcrumbs,
  );
}

type LearnIndexSEOProps = {
  articles: { slug: string; title: string }[];
  category?: LearnCategoryId;
};

export function LearnIndexSEO({ articles, category }: LearnIndexSEOProps) {
  const config = getLearnIndexSEO(category);
  useJsonLd('learn-index', getLearnIndexStructuredData(articles, category));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type LearnArticleSEOProps = {
  article: LearnArticle;
};

export function LearnArticleSEO({ article }: LearnArticleSEOProps) {
  const config = getLearnArticleSEO(article);
  useJsonLd(`learn-${article.slug}`, getLearnArticleStructuredData(article));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type LearnArticleNotFoundSEOProps = {
  slug: string;
};

export function LearnArticleNotFoundSEO({ slug }: LearnArticleNotFoundSEOProps) {
  const config: SEOConfig = {
    title: 'Article Not Found - PetClues Learn',
    description: 'This knowledge base article could not be found. Browse pet health guides on PetClues Learn.',
    canonical: `${SITE_META.siteUrl}${ROUTES.LEARN}/${slug}`,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues Learn',
    noIndex: true,
  };

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

export function getLearnArticleBreadcrumbs(article: LearnArticle) {
  return getLearnBreadcrumbs(article);
}

export function getLearnIndexBreadcrumbs(categoryLabel?: string) {
  return getLearnBreadcrumbs(undefined, categoryLabel);
}
