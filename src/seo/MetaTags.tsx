import { useEffect } from 'react';
import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';

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
    document.title = config.title;
    setMetaTag('description', config.description);

    if (config.canonical) {
      setLinkTag('canonical', config.canonical);
    }

    if (config.noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    if (config.keywords) {
      setMetaTag('keywords', config.keywords);
    } else {
      const keywordsEl = document.querySelector('meta[name="keywords"]');
      keywordsEl?.remove();
    }

    if (config.ogType === 'article') {
      if (config.articleAuthor) {
        setMetaTag('article:author', config.articleAuthor, 'property');
      }
      if (config.articlePublishedTime) {
        setMetaTag('article:published_time', config.articlePublishedTime, 'property');
      }
      if (config.articleModifiedTime) {
        setMetaTag('article:modified_time', config.articleModifiedTime, 'property');
      }
      if (config.articleSection) {
        setMetaTag('article:section', config.articleSection, 'property');
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
    const image = config.ogImage ?? SITE_META.defaultOgImage;
    const imageAlt = config.ogImageAlt ?? SITE_META.defaultOgImageAlt;

    setMetaTag('og:title', config.ogTitle ?? config.title, 'property');
    setMetaTag('og:description', config.ogDescription ?? config.description, 'property');
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
    setMetaTag('twitter:description', config.ogDescription ?? config.description);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:image:alt', imageAlt);
  }, [config]);

  return null;
}
