import { useEffect } from 'react';
import type { SEOConfig } from '@/data/seoConfig';
import { ROBOTS_INDEX, ROBOTS_NOINDEX, SITE_META } from '@/data/seoConfig';
import { formatMetaDescription } from '@/seo/seoFormatters';

const ARTICLE_META_KEYS = [
  'article:author',
  'article:published_time',
  'article:modified_time',
  'article:section',
] as const;

function removeMetaTag(name: string, attribute: 'name' | 'property' = 'name') {
  document.querySelector(`meta[${attribute}="${name}"]`)?.remove();
}

function setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

type MetaTagsProps = {
  config: SEOConfig;
};

export function MetaTags({ config }: MetaTagsProps) {
  useEffect(() => {
    const description = formatMetaDescription(config.description, config.title);

    document.title = config.title;
    setMetaTag('description', description);

    if (config.canonical) {
      setLinkTag('canonical', config.canonical);
    }

    document.querySelectorAll('meta[name="robots"]').forEach((node, index) => {
      if (index > 0) node.remove();
    });

    setMetaTag('robots', config.noIndex ? ROBOTS_NOINDEX : ROBOTS_INDEX);

    if (config.keywords) {
      setMetaTag('keywords', config.keywords);
    } else {
      removeMetaTag('keywords');
    }

    if (config.ogType === 'article') {
      if (config.articleAuthor) {
        setMetaTag('article:author', config.articleAuthor, 'property');
      } else {
        removeMetaTag('article:author', 'property');
      }
      if (config.articlePublishedTime) {
        setMetaTag('article:published_time', config.articlePublishedTime, 'property');
      } else {
        removeMetaTag('article:published_time', 'property');
      }
      if (config.articleModifiedTime) {
        setMetaTag('article:modified_time', config.articleModifiedTime, 'property');
      } else {
        removeMetaTag('article:modified_time', 'property');
      }
      if (config.articleSection) {
        setMetaTag('article:section', config.articleSection, 'property');
      } else {
        removeMetaTag('article:section', 'property');
      }
    } else {
      for (const key of ARTICLE_META_KEYS) {
        removeMetaTag(key, 'property');
      }
    }
  }, [config]);

  return null;
}

type OpenGraphProps = {
  config: SEOConfig;
};

export function OpenGraph({ config }: OpenGraphProps) {
  useEffect(() => {
    const description = formatMetaDescription(config.description, config.title);
    const image = config.ogImage ?? SITE_META.defaultOgImage;
    const imageAlt = config.ogImageAlt ?? SITE_META.defaultOgImageAlt;

    setMetaTag('og:title', config.ogTitle ?? config.title, 'property');
    setMetaTag('og:description', config.ogDescription ?? description, 'property');
    setMetaTag('og:type', config.ogType ?? 'website', 'property');
    setMetaTag('og:site_name', SITE_META.siteName, 'property');
    setMetaTag('og:locale', SITE_META.locale, 'property');

    if (config.canonical) {
      setMetaTag('og:url', config.canonical, 'property');
    }

    setMetaTag('og:image', image, 'property');
    setMetaTag('og:image:secure_url', image, 'property');
    setMetaTag('og:image:alt', imageAlt, 'property');
    const isSquareBrandLogo = image.endsWith('/logo.png');
    setMetaTag('og:image:width', isSquareBrandLogo ? '512' : '1200', 'property');
    setMetaTag('og:image:height', isSquareBrandLogo ? '512' : '630', 'property');

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', SITE_META.twitterHandle);
    setMetaTag('twitter:title', config.ogTitle ?? config.title);
    setMetaTag('twitter:description', config.ogDescription ?? description);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:image:alt', imageAlt);
  }, [config]);

  return null;
}
