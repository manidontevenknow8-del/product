import { BLOG_CATEGORIES, type BlogCategoryId } from '@/data/blogCategories';
import { LANDING_FAQ_SCHEMA_ITEMS } from '@/data/faqSchemaItems';
import { getComparisonBySlug, listComparisonPages } from '@/data/comparisons';
import { FAQ_CATEGORIES, type FaqCategoryId } from '@/data/faq/categories';
import { getFaqItemBySlug, listFaqItems } from '@/data/faq';
import { getLearnArticleBySlug, listLearnArticles } from '@/data/learn';
import { LEARN_CATEGORIES, type LearnCategoryId } from '@/data/learn/categories';
import { getIntentPageBySlug, listIntentPages } from '@/data/intent';
import {
  getProgrammaticPage,
  isProgrammaticCollectionId,
  listProgrammaticPages,
} from '@/data/programmatic';
import { getProgrammaticCollection, listProgrammaticCollections } from '@/data/programmatic/collections';
import {
  getPageSEO,
  isBestArticlePath,
  isBlogArticlePath,
  isCompareArticlePath,
  isFaqArticlePath,
  isGuidesCollectionPath,
  isGuidesDetailPath,
  isLearnArticlePath,
} from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { MOCK_BLOG_POSTS } from '@/services/blog/mockBlogPosts';
import { applyLongFormContent } from '@/services/blog/applyLongFormContent';
import {
  getBlogIndexSEO,
  getBlogIndexStructuredData,
  getBlogPostSEO,
  getBlogPostingStructuredData,
} from '@/seo/blogSeo';
import { buildBreadcrumbListSchema } from '@/seo/breadcrumbSchema';
import {
  getCompareIndexSEO,
  getCompareIndexStructuredData,
  getComparePageSEO,
  getComparePageStructuredData,
} from '@/seo/compareSeo';
import {
  getFaqIndexSEO,
  getFaqIndexStructuredData,
  getFaqItemSEO,
  getFaqItemStructuredData,
} from '@/seo/faqHubSeo';
import {
  getIntentIndexSEO,
  getIntentIndexStructuredData,
  getIntentPageSEO,
  getIntentPageStructuredData,
} from '@/seo/intentSeo';
import {
  getLearnArticleSEO,
  getLearnArticleStructuredData,
  getLearnIndexSEO,
  getLearnIndexStructuredData,
} from '@/seo/learnSeo';
import { getBlogIndexBreadcrumbs } from '@/seo/pageBreadcrumbs';
import type { PrerenderDocument } from '@/seo/renderHead';
import {
  getProgrammaticCollectionBreadcrumbs,
  getProgrammaticCollectionSEO,
  getProgrammaticHubSEO,
  getProgrammaticHubStructuredData,
  getProgrammaticPageSEO,
  getProgrammaticPageStructuredData,
} from '@/seo/programmaticSeo';
import { getStaticPageStructuredData } from '@/seo/staticPageSeo';
import { getCommercialPageByPath, listCommercialPages } from '@/data/commercial';
import {
  getCommercialPageSEO,
  getCommercialPageStructuredData,
} from '@/seo/commercialSeo';
import { buildCollectionPageSchema, buildLandingGraphSchema, buildOrganizationSchema, buildSchemaGraph, buildWebSiteSchema } from '@/seo/structuredDataSchemas';

function asBlogCategory(value: string | null): BlogCategoryId | undefined {
  if (!value) return undefined;
  return BLOG_CATEGORIES.some((category) => category.id === value)
    ? (value as BlogCategoryId)
    : undefined;
}

function asLearnCategory(value: string | null): LearnCategoryId | undefined {
  if (!value) return undefined;
  return LEARN_CATEGORIES.some((category) => category.id === value)
    ? (value as LearnCategoryId)
    : undefined;
}

function asFaqCategory(value: string | null): FaqCategoryId | undefined {
  if (!value) return undefined;
  return FAQ_CATEGORIES.some((category) => category.id === value)
    ? (value as FaqCategoryId)
    : undefined;
}

function withSchema(
  config: PrerenderDocument['config'],
  schemas: PrerenderDocument['schemas'],
): PrerenderDocument {
  return { config, schemas };
}

function schemaEntry(id: string, data: object): PrerenderDocument['schemas'][number] {
  return { id, data };
}

export function getPrerenderDocument(pathname: string, search = ''): PrerenderDocument | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  if (pathname === ROUTES.LANDING) {
    const config = getPageSEO(pathname);
    return withSchema(config, [
      schemaEntry('landing-graph', buildLandingGraphSchema(LANDING_FAQ_SCHEMA_ITEMS)),
    ]);
  }

  if (pathname === ROUTES.BLOG) {
    const category = asBlogCategory(params.get('category'));
    const tag = params.get('tag') ?? undefined;
    const query = params.get('q') ?? undefined;
    if (tag || query) return null;

    const posts = MOCK_BLOG_POSTS.filter((post) => post.status === 'published')
      .filter((post) => (category ? post.category === category : true))
      .map((post) => ({
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
      }));

    const config = getBlogIndexSEO({ category });
    const categoryLabel = category
      ? BLOG_CATEGORIES.find((item) => item.id === category)?.label
      : undefined;
    const graph = getBlogIndexStructuredData(posts);
    const breadcrumbs = buildBreadcrumbListSchema(getBlogIndexBreadcrumbs(categoryLabel));

    return withSchema(config, [
      schemaEntry(
        category ? `blog-index-${category}` : 'blog-index',
        { '@context': graph['@context'], '@graph': [...graph['@graph'], breadcrumbs] },
      ),
    ]);
  }

  if (isBlogArticlePath(pathname)) {
    const slug = pathname.slice(`${ROUTES.BLOG}/`.length);
    const raw = MOCK_BLOG_POSTS.find((post) => post.slug === slug && post.status === 'published');
    if (!raw) return null;
    const post = applyLongFormContent(raw);
    return withSchema(getBlogPostSEO(post), [
      schemaEntry(`blog-post-${slug}`, getBlogPostingStructuredData(post)),
    ]);
  }

  if (pathname === ROUTES.COMPARE) {
    const pages = listComparisonPages();
    return withSchema(getCompareIndexSEO(), [
      schemaEntry('compare-index', getCompareIndexStructuredData(pages)),
    ]);
  }

  if (isCompareArticlePath(pathname)) {
    const slug = pathname.slice(`${ROUTES.COMPARE}/`.length);
    const page = getComparisonBySlug(slug);
    if (!page) return null;
    return withSchema(getComparePageSEO(page), [
      schemaEntry(`compare-${slug}`, getComparePageStructuredData(page)),
    ]);
  }

  if (pathname === ROUTES.BEST) {
    const pages = listIntentPages();
    return withSchema(getIntentIndexSEO(), [
      schemaEntry('intent-index', getIntentIndexStructuredData(pages)),
    ]);
  }

  if (isBestArticlePath(pathname)) {
    const slug = pathname.slice(`${ROUTES.BEST}/`.length);
    const page = getIntentPageBySlug(slug);
    if (!page) return null;
    return withSchema(getIntentPageSEO(page), [
      schemaEntry(`intent-${slug}`, getIntentPageStructuredData(page)),
    ]);
  }

  if (pathname === ROUTES.GUIDES) {
    const collections = listProgrammaticCollections().map((collection) => ({
      id: collection.id,
      label: collection.label,
      pageCount: listProgrammaticPages(collection.id).length,
    }));
    return withSchema(getProgrammaticHubSEO(), [
      schemaEntry('programmatic-hub', getProgrammaticHubStructuredData(collections)),
    ]);
  }

  if (isGuidesCollectionPath(pathname)) {
    const collectionId = pathname.slice(`${ROUTES.GUIDES}/`.length);
    if (!isProgrammaticCollectionId(collectionId)) return null;
    const pages = listProgrammaticPages(collectionId);
    const config = getProgrammaticCollectionSEO(collectionId);
    const collection = getProgrammaticCollection(collectionId);
    const url = config.canonical!;

    return withSchema(config, [
      schemaEntry(
        `programmatic-collection-${collectionId}`,
        buildSchemaGraph(
          buildOrganizationSchema(),
          buildWebSiteSchema(),
          buildCollectionPageSchema({
            url,
            name: collection.label,
            description: collection.description,
            items: pages.map((page) => ({
              url: `${url}/${page.slug}`,
              name: page.title,
            })),
          }),
          buildBreadcrumbListSchema(getProgrammaticCollectionBreadcrumbs(collectionId)),
        ),
      ),
    ]);
  }

  if (isGuidesDetailPath(pathname)) {
    const rest = pathname.slice(`${ROUTES.GUIDES}/`.length);
    const [collectionId, slug] = rest.split('/');
    if (!collectionId || !slug || !isProgrammaticCollectionId(collectionId)) return null;
    const page = getProgrammaticPage(collectionId, slug);
    if (!page) return null;
    return withSchema(getProgrammaticPageSEO(page), [
      schemaEntry(`programmatic-${collectionId}-${slug}`, getProgrammaticPageStructuredData(page)),
    ]);
  }

  if (pathname === ROUTES.LEARN) {
    const category = asLearnCategory(params.get('category'));
    const articles = listLearnArticles({ category }).map((article) => ({
      slug: article.slug,
      title: article.title,
    }));
    return withSchema(getLearnIndexSEO(category), [
      schemaEntry(
        category ? `learn-index-${category}` : 'learn-index',
        getLearnIndexStructuredData(articles, category),
      ),
    ]);
  }

  if (isLearnArticlePath(pathname)) {
    const slug = pathname.slice(`${ROUTES.LEARN}/`.length);
    const article = getLearnArticleBySlug(slug);
    if (!article) return null;
    return withSchema(getLearnArticleSEO(article), [
      schemaEntry(`learn-${slug}`, getLearnArticleStructuredData(article)),
    ]);
  }

  if (pathname === ROUTES.FAQ) {
    const category = asFaqCategory(params.get('category'));
    const searchQuery = params.get('q') ?? undefined;
    if (searchQuery) return null;
    const items = listFaqItems({ category });
    return withSchema(getFaqIndexSEO({ category }), [
      schemaEntry(category ? `faq-index-${category}` : 'faq-index', getFaqIndexStructuredData(items)),
    ]);
  }

  if (isFaqArticlePath(pathname)) {
    const slug = pathname.slice(`${ROUTES.FAQ}/`.length);
    const item = getFaqItemBySlug(slug);
    if (!item) return null;
    return withSchema(getFaqItemSEO(item), [
      schemaEntry(`faq-item-${slug}`, getFaqItemStructuredData(item)),
    ]);
  }

  const commercialPage = getCommercialPageByPath(pathname);
  if (commercialPage) {
    const slug = commercialPage.path.slice(1);
    return withSchema(getCommercialPageSEO(commercialPage), [
      schemaEntry(`commercial-${slug}`, getCommercialPageStructuredData(commercialPage)),
    ]);
  }

  const staticConfig = getPageSEO(pathname);
  if (staticConfig.noIndex) return null;

  return withSchema(staticConfig, [
    schemaEntry(`static-page-${pathname || 'home'}`, getStaticPageStructuredData(pathname, staticConfig)),
  ]);
}

export function listPrerenderRouteKeys(): string[] {
  const keys: string[] = [];

  keys.push('/');
  keys.push(ROUTES.PRICING, ROUTES.PET_MATCH, ROUTES.FOUNDING_MEMBERS);
  for (const page of listCommercialPages()) {
    keys.push(page.path);
  }
  keys.push(ROUTES.BLOG, ROUTES.COMPARE, ROUTES.BEST, ROUTES.GUIDES, ROUTES.LEARN, ROUTES.FAQ);
  keys.push(ROUTES.PRIVACY, ROUTES.TERMS, ROUTES.COOKIES, ROUTES.CONTACT, ROUTES.ABOUT);
  keys.push(ROUTES.SECURITY, ROUTES.DATA_DELETION, ROUTES.DATA_EXPORT);

  for (const category of BLOG_CATEGORIES) {
    keys.push(`${ROUTES.BLOG}?category=${category.id}`);
  }
  for (const category of LEARN_CATEGORIES) {
    keys.push(`${ROUTES.LEARN}?category=${category.id}`);
  }
  for (const category of FAQ_CATEGORIES) {
    keys.push(`${ROUTES.FAQ}?category=${category.id}`);
  }

  for (const post of MOCK_BLOG_POSTS) {
    if (post.status === 'published') keys.push(`${ROUTES.BLOG}/${post.slug}`);
  }
  for (const page of listComparisonPages()) keys.push(`${ROUTES.COMPARE}/${page.slug}`);
  for (const page of listIntentPages()) keys.push(`${ROUTES.BEST}/${page.slug}`);
  for (const collection of listProgrammaticCollections()) {
    keys.push(`${ROUTES.GUIDES}/${collection.id}`);
  }
  for (const page of listProgrammaticPages()) {
    keys.push(`${ROUTES.GUIDES}/${page.collectionId}/${page.slug}`);
  }
  for (const article of listLearnArticles()) keys.push(`${ROUTES.LEARN}/${article.slug}`);
  for (const item of listFaqItems()) keys.push(`${ROUTES.FAQ}/${item.slug}`);

  return keys;
}
