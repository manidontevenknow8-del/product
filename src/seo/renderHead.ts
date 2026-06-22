import type { SEOConfig } from '@/data/seoConfig';
import { ROBOTS_INDEX, ROBOTS_NOINDEX, SITE_META } from '@/data/seoConfig';
import { formatMetaDescription } from '@/seo/seoFormatters';

export const PRERENDER_SEO_START = '<!-- PETCLUES_SEO_START -->';
export const PRERENDER_SEO_END = '<!-- PETCLUES_SEO_END -->';

export type PrerenderSchema = {
  id: string;
  data: object;
};

export type PrerenderDocument = {
  config: SEOConfig;
  schemas: PrerenderSchema[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function metaName(name: string, content: string): string {
  return `    <meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
}

function metaProperty(property: string, content: string): string {
  return `    <meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`;
}

function linkTag(rel: string, href: string): string {
  return `    <link rel="${escapeHtml(rel)}" href="${escapeHtml(href)}" />`;
}

function jsonLdScript(id: string, data: object): string {
  return `    <script type="application/ld+json" id="petclues-structured-data-${escapeHtml(id)}">${serializeJsonLd(data)}</script>`;
}

/** Build the crawlable head fragment for a route (title, meta, canonical, OG, Twitter, JSON-LD). */
export function buildSeoHeadFragment(doc: PrerenderDocument): string {
  const { config } = doc;
  const description = formatMetaDescription(config.description, config.title);
  const image = config.ogImage ?? SITE_META.defaultOgImage;
  const imageAlt = config.ogImageAlt ?? SITE_META.defaultOgImageAlt;
  const isSquareBrandLogo = image.endsWith('/logo.png');
  const imageWidth = isSquareBrandLogo ? '512' : '1200';
  const imageHeight = isSquareBrandLogo ? '512' : '630';

  const lines = [
    `    <title>${escapeHtml(config.title)}</title>`,
    metaName('description', description),
    linkTag('canonical', config.canonical ?? SITE_META.siteUrl),
    metaName('robots', config.noIndex ? ROBOTS_NOINDEX : ROBOTS_INDEX),
  ];

  if (config.keywords) {
    lines.push(metaName('keywords', config.keywords));
  }

  if (config.ogType === 'article') {
    if (config.articleAuthor) lines.push(metaProperty('article:author', config.articleAuthor));
    if (config.articlePublishedTime) {
      lines.push(metaProperty('article:published_time', config.articlePublishedTime));
    }
    if (config.articleModifiedTime) {
      lines.push(metaProperty('article:modified_time', config.articleModifiedTime));
    }
    if (config.articleSection) lines.push(metaProperty('article:section', config.articleSection));
  }

  lines.push(
    metaProperty('og:title', config.ogTitle ?? config.title),
    metaProperty('og:description', config.ogDescription ?? description),
    metaProperty('og:type', config.ogType ?? 'website'),
    metaProperty('og:site_name', SITE_META.siteName),
    metaProperty('og:locale', SITE_META.locale),
  );

  if (config.canonical) {
    lines.push(metaProperty('og:url', config.canonical));
  }

  lines.push(
    metaProperty('og:image', image),
    metaProperty('og:image:secure_url', image),
    metaProperty('og:image:alt', imageAlt),
    metaProperty('og:image:width', imageWidth),
    metaProperty('og:image:height', imageHeight),
    metaName('twitter:card', 'summary_large_image'),
    metaName('twitter:site', SITE_META.twitterHandle),
    metaName('twitter:title', config.ogTitle ?? config.title),
    metaName('twitter:description', config.ogDescription ?? description),
    metaName('twitter:image', image),
    metaName('twitter:image:alt', imageAlt),
  );

  for (const schema of doc.schemas) {
    lines.push(jsonLdScript(schema.id, schema.data));
  }

  return lines.join('\n');
}

export function wrapSeoHeadFragment(fragment: string): string {
  return `${PRERENDER_SEO_START}\n${fragment}\n    ${PRERENDER_SEO_END}`;
}

export function injectSeoHeadIntoHtml(html: string, doc: PrerenderDocument): string {
  const fragment = wrapSeoHeadFragment(buildSeoHeadFragment(doc));
  const pattern = new RegExp(
    `${escapeRegex(PRERENDER_SEO_START)}[\\s\\S]*?${escapeRegex(PRERENDER_SEO_END)}`,
  );

  if (!pattern.test(html)) {
    throw new Error('index.html is missing PETCLUES_SEO markers');
  }

  return html.replace(pattern, fragment);
}

const ROOT_DIV_PATTERN = /<div id="root">([\s\S]*?)<\/div>/;

export function injectAppHtmlIntoRoot(html: string, appMarkup: string): string {
  if (!ROOT_DIV_PATTERN.test(html)) {
    throw new Error('index.html is missing #root container');
  }

  return html.replace(ROOT_DIV_PATTERN, `<div id="root">${appMarkup}</div>`);
}

function serializeInlineScriptData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function injectPrerenderDataScript(html: string, data: unknown): string {
  if (!data || typeof data !== 'object' || Object.keys(data as object).length === 0) {
    return html;
  }

  const script = `<script>window.__PETCLUES_PRERENDER__=${serializeInlineScriptData(data)}</script>`;
  return html.replace('</body>', `    ${script}\n  </body>`);
}

export function injectPrerenderedPage(
  html: string,
  doc: PrerenderDocument,
  appMarkup: string,
  data: unknown = {},
): string {
  let output = injectSeoHeadIntoHtml(html, doc);
  output = injectAppHtmlIntoRoot(output, appMarkup);
  output = injectPrerenderDataScript(output, data);
  return output;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
