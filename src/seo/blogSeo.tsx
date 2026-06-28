import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { BlogCategoryId } from '@/data/blogCategories';
import { getBlogCategoryLabel } from '@/data/blogCategories';
import type { BlogPost, BlogPostListItem } from '@/types/blog';
import { resolveBlogFeaturedImage } from '@/services/blog/resolveBlogImage';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema } from './breadcrumbSchema';
import {
  buildBlogPostingSchema,
  buildCollectionPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { getBlogIndexBreadcrumbs, getBlogPostBreadcrumbs } from './pageBreadcrumbs';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';
import { useJsonLd } from './useJsonLd';
import { KnowledgeGraph } from '@/components/seo/KnowledgeGraph';
import { getKnowledgeGraphConfigForBlogSlug } from '@/data/knowledgeGraphBlogEntities';
import { buildKnowledgeGraphSchema } from '@/seo/buildKnowledgeGraphSchema';

type BlogIndexSEOOptions = {
  category?: BlogCategoryId;
  tag?: string;
  search?: string;
};

export function getBlogIndexSEO(options: BlogIndexSEOOptions = {}): SEOConfig {
  const { category, tag, search } = options;
  const categoryLabel = category ? getBlogCategoryLabel(category) : undefined;
  const baseCanonical = `${SITE_META.siteUrl}${ROUTES.BLOG}`;
  const hasFilters = Boolean(tag || search);

  let title = formatPageTitle('Pet Health Blog - Vaccination Guides, Records & Care Tips');
  let description = formatMetaDescription(
    'Free pet health guides: puppy and cat vaccination schedules, medication reminders, vet bill organization, emergency pet information, and daily care habits.',
  );

  if (categoryLabel) {
    title = formatPageTitle(`${categoryLabel} Guides - Pet Health Blog`);
    description = formatMetaDescription(
      `Expert ${categoryLabel.toLowerCase()} guides on vaccinations, records, reminders, and everyday care from PetClues.`,
      categoryLabel,
    );
  } else if (tag) {
    title = formatPageTitle(`Articles tagged "${tag}"`);
    description = formatMetaDescription(
      `Pet health articles tagged "${tag}" on the PetClues blog - vaccination schedules, records, reminders, and emergency prep.`,
      tag,
    );
  } else if (search) {
    title = formatPageTitle(`Search results for "${search}"`);
    description = formatMetaDescription(
      `Search results for "${search}" across PetClues pet health guides, vaccination schedules, and care organization tips.`,
      search,
    );
  }

  return {
    title,
    description,
    keywords:
      'pet health blog, puppy vaccination schedule, cat vaccination schedule, organize pet medical records, pet medication reminder',
    canonical: hasFilters ? baseCanonical : category ? `${baseCanonical}?category=${category}` : baseCanonical,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet health blog',
    noIndex: hasFilters,
  };
}

export function getBlogPostSEO(post: BlogPost): SEOConfig {
  const categoryLabel = getBlogCategoryLabel(post.category);
  const title = formatPageTitle(post.title);
  const canonical = `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`;
  const image = (() => {
    const img = resolveBlogFeaturedImage(post.slug, post.featuredImage);
    return img ? `${SITE_META.siteUrl}${img}` : DEFAULT_OG_IMAGE;
  })();

  return {
    title,
    description: formatMetaDescription(post.excerpt, post.title),
    canonical,
    ogType: 'article',
    ogImage: image,
    ogImageAlt: post.title,
    keywords: [categoryLabel, ...post.tags].join(', '),
    articleAuthor: post.author,
    articlePublishedTime: post.publishedAt ?? undefined,
    articleModifiedTime: post.updatedAt,
    articleSection: categoryLabel,
    noIndex: false,
  };
}

export function getBlogPostingStructuredData(post: BlogPost) {
  const url = `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`;
  const categoryLabel = getBlogCategoryLabel(post.category);
  const breadcrumbs = buildBreadcrumbListSchema(getBlogPostBreadcrumbs(post.title, post.slug));
  const image = (() => {
    const img = resolveBlogFeaturedImage(post.slug, post.featuredImage);
    return img ? [`${SITE_META.siteUrl}${img}`] : undefined;
  })();

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildBlogPostingSchema({
      url,
      headline: post.title,
      description: post.excerpt,
      image,
      authorName: post.author,
      datePublished: post.publishedAt ?? undefined,
      dateModified: post.updatedAt,
      articleSection: categoryLabel,
      keywords: post.tags.join(', '),
    }),
    breadcrumbs,
  );
}

export function getBlogIndexStructuredData(
  posts: { title: string; slug: string; publishedAt: string | null }[],
) {
  const blogUrl = `${SITE_META.siteUrl}${ROUTES.BLOG}`;

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    {
      '@type': 'Blog',
      '@id': `${blogUrl}#blog`,
      name: 'PetClues Pet Health Blog',
      url: blogUrl,
      publisher: { '@id': `${SITE_META.siteUrl}/#organization` },
      blogPost: posts.slice(0, 20).map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`,
        datePublished: post.publishedAt ?? undefined,
      })),
    },
    buildCollectionPageSchema({
      url: blogUrl,
      name: 'PetClues Pet Health Blog',
      description:
        'Pet health guides on vaccinations, medical records, medication reminders, and emergency care.',
      items: posts.map((post) => ({
        url: `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`,
        name: post.title,
      })),
    }),
  );
}

type BlogIndexSEOProps = {
  posts: BlogPostListItem[];
  category?: BlogCategoryId;
  tag?: string;
  search?: string;
};

export function BlogIndexSEO({ posts, category, tag, search }: BlogIndexSEOProps) {
  const config = getBlogIndexSEO({ category, tag, search });
  const categoryLabel = category ? getBlogCategoryLabel(category) : undefined;
  const breadcrumbSchema = buildBreadcrumbListSchema(getBlogIndexBreadcrumbs(categoryLabel));

  useJsonLd('blog-index', buildSchemaGraph(
    ...getBlogIndexStructuredData(posts)['@graph'],
    breadcrumbSchema,
  ));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}

type BlogPostSEOProps = {
  post: BlogPost;
};

export function BlogPostSEO({ post }: BlogPostSEOProps) {
  const config = getBlogPostSEO(post);
  const knowledgeGraph = getKnowledgeGraphConfigForBlogSlug(post.slug);

  useJsonLd(`blog-post-${post.slug}`, getBlogPostingStructuredData(post));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
      {knowledgeGraph ? <KnowledgeGraph {...knowledgeGraph} /> : null}
    </>
  );
}

/** Prerender-only helper — entity graph for growth-band blog posts. */
export function getBlogKnowledgeGraphStructuredData(slug: string) {
  const config = getKnowledgeGraphConfigForBlogSlug(slug);
  return config ? buildKnowledgeGraphSchema(config) : null;
}

type BlogArticleNotFoundSEOProps = {
  slug: string;
};

export function BlogArticleNotFoundSEO({ slug }: BlogArticleNotFoundSEOProps) {
  const config: SEOConfig = {
    title: 'Article Not Found - PetClues Blog',
    description: 'This blog article could not be found. Browse pet health guides on the PetClues blog.',
    canonical: `${SITE_META.siteUrl}${ROUTES.BLOG}/${slug}`,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues blog',
    noIndex: true,
  };

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}
