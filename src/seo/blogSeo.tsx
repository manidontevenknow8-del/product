import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import type { BlogPost, BlogPostListItem } from '@/types/blog';
import { getBlogCategoryLabel } from '@/data/blogCategories';
import { resolveBlogFeaturedImage } from '@/services/blog/resolveBlogImage';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildOrganizationSchema } from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';

export function getBlogIndexSEO(): SEOConfig {
  return {
    title: 'Pet Health Blog - Vaccination Guides, Records & Care Tips | PetClues',
    description:
      'Free pet health guides: puppy & cat vaccination schedules, medication reminders, vet bill organization, emergency pet information, and daily care habits.',
    keywords:
      'pet health blog, puppy vaccination schedule, cat vaccination schedule, organize pet medical records, pet medication reminder',
    canonical: `${SITE_META.siteUrl}${ROUTES.BLOG}`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet health blog',
    noIndex: false,
  };
}

export function getBlogPostSEO(post: BlogPost): SEOConfig {
  const categoryLabel = getBlogCategoryLabel(post.category);
  const title = `${post.title} - PetClues`;
  const canonical = `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`;
  const image = (() => {
    const img = resolveBlogFeaturedImage(post.slug, post.featuredImage);
    return img ? `${SITE_META.siteUrl}${img}` : DEFAULT_OG_IMAGE;
  })();

  return {
    title,
    description: post.excerpt,
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

export type BlogPostingSchema = {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image?: string[];
  author: { '@type': 'Person' | 'Organization'; name: string };
  publisher: {
    '@type': 'Organization';
    name: string;
    url: string;
    logo?: { '@type': 'ImageObject'; url: string };
  };
  datePublished?: string;
  dateModified?: string;
  mainEntityOfPage: string;
  articleSection?: string;
  keywords?: string;
};

export function getBlogPostingStructuredData(post: BlogPost): BlogPostingSchema {
  const url = `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`;
  const categoryLabel = getBlogCategoryLabel(post.category);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: (() => {
      const img = resolveBlogFeaturedImage(post.slug, post.featuredImage);
      return img ? [`${SITE_META.siteUrl}${img}`] : undefined;
    })(),
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_META.siteName,
      url: SITE_META.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: SITE_META.logoUrl,
      },
    },
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    mainEntityOfPage: url,
    articleSection: categoryLabel,
    keywords: post.tags.join(', '),
  };
}

export function getBlogIndexStructuredData(
  posts: { title: string; slug: string; publishedAt: string | null }[],
) {
  const blogUrl = `${SITE_META.siteUrl}${ROUTES.BLOG}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationSchema(),
      {
        '@type': 'Blog',
        '@id': `${blogUrl}#blog`,
        name: 'PetClues Pet Health Blog',
        url: blogUrl,
        publisher: {
          '@type': 'Organization',
          name: SITE_META.siteName,
          url: SITE_META.siteUrl,
        },
        blogPost: posts.slice(0, 20).map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`,
          datePublished: post.publishedAt ?? undefined,
        })),
      },
      {
        '@type': 'CollectionPage',
        '@id': `${blogUrl}#collection`,
        name: 'PetClues Pet Health Blog',
        url: blogUrl,
        description:
          'Pet health guides on vaccinations, medical records, medication reminders, and emergency care.',
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_META.siteName,
          url: SITE_META.siteUrl,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_META.siteUrl}${ROUTES.BLOG}/${post.slug}`,
            name: post.title,
          })),
        },
      },
    ],
  };
}

type BlogIndexSEOProps = {
  posts: BlogPostListItem[];
};

export function BlogIndexSEO({ posts }: BlogIndexSEOProps) {
  const config = getBlogIndexSEO();
  useJsonLd('blog-index', getBlogIndexStructuredData(posts));

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
  useJsonLd(`blog-post-${post.slug}`, getBlogPostingStructuredData(post));

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
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
