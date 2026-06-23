#!/usr/bin/env node
/**
 * Validates build-time prerender output for crawl-safe metadata in initial HTML.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const site = process.env.VITE_SITE_URL ?? 'https://petclues.com';

const samples = [
  { label: 'homepage', file: 'index.html', titleIncludes: 'PetClues', bodyIncludes: 'Pet health guides' },
  { label: 'pricing', file: 'pricing/index.html', titleIncludes: 'Membership', bodyIncludes: 'Plus' },
  { label: 'blog index', file: 'blog/index.html', titleIncludes: 'Blog', bodyIncludes: 'article' },
  {
    label: 'blog post',
    file: 'blog/organize-pet-medical-records-online/index.html',
    titleIncludes: 'Organize',
    bodyIncludes: 'medical records',
  },
  {
    label: 'faq item',
    file: 'faq/how-do-i-organize-pet-records/index.html',
    titleIncludes: 'organize pet records',
    bodyIncludes: 'records',
  },
  {
    label: 'compare page',
    file: 'compare/petclues-vs-google-drive/index.html',
    titleIncludes: 'Google Drive',
    bodyIncludes: 'Google Drive',
  },
  {
    label: 'best page',
    file: 'best/best-pet-health-record-app/index.html',
    titleIncludes: 'health record',
    bodyIncludes: 'health record',
  },
  {
    label: 'learn page',
    file: 'learn/build-a-pet-health-record-timeline/index.html',
    titleIncludes: 'Timeline',
    bodyIncludes: 'timeline',
  },
  {
    label: 'commercial page',
    file: 'pet-health-records/index.html',
    titleIncludes: 'Pet Health Records',
    bodyIncludes: 'health records',
  },
  {
    label: 'digital pet passport',
    file: 'digital-pet-passport/index.html',
    titleIncludes: 'Digital Pet Passport',
    bodyIncludes: 'passport',
  },
  {
    label: 'pet vaccination records',
    file: 'pet-vaccination-records/index.html',
    titleIncludes: 'Vaccination Records',
    bodyIncludes: 'rabies',
  },
];

function extractRootInnerHtml(html) {
  const openTag = '<div id="root">';
  const start = html.indexOf(openTag);
  if (start === -1) return '';

  const contentStart = start + openTag.length;
  const bodyEnd = html.indexOf('</body>');
  if (bodyEnd === -1) return '';

  const slice = html.slice(contentStart, bodyEnd);
  const lastClose = slice.lastIndexOf('</div>');
  if (lastClose === -1) return '';

  return slice.slice(0, lastClose).trim();
}

function assertCrawlSafe(label, filePath, titleIncludes, bodyIncludes) {
  if (!existsSync(filePath)) {
    throw new Error(`[${label}] missing prerender file: ${filePath}`);
  }

  const html = readFileSync(filePath, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '';
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? '';
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1] ?? '';
  const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1] ?? '';
  const twitterTitle = html.match(/<meta name="twitter:title" content="([^"]*)"/i)?.[1] ?? '';
  const jsonLdCount = (html.match(/type="application\/ld\+json"/g) ?? []).length;
  const robots = html.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? '';
  const robotsTagCount = (html.match(/<meta name="robots"/gi) ?? []).length;
  const rootBody = extractRootInnerHtml(html);

  if (!title.toLowerCase().includes(titleIncludes.toLowerCase())) {
    throw new Error(`[${label}] unexpected <title>: ${title}`);
  }
  if (!description) throw new Error(`[${label}] missing meta description`);
  if (!canonical.startsWith(site)) throw new Error(`[${label}] missing canonical (${canonical})`);
  if (!robots) throw new Error(`[${label}] missing robots meta tag`);
  if (/noindex/i.test(robots)) {
    throw new Error(`[${label}] robots meta must be indexable, got: ${robots}`);
  }
  if (robotsTagCount !== 1) {
    throw new Error(`[${label}] expected exactly one robots meta tag, found ${robotsTagCount}`);
  }
  if (!ogTitle) throw new Error(`[${label}] missing og:title`);
  if (!twitterTitle) throw new Error(`[${label}] missing twitter:title`);
  if (jsonLdCount < 1) throw new Error(`[${label}] missing JSON-LD scripts`);
  if (!rootBody) throw new Error(`[${label}] empty #root body (SSR prerender failed)`);
  if (bodyIncludes && !rootBody.toLowerCase().includes(bodyIncludes.toLowerCase())) {
    throw new Error(`[${label}] missing expected body content: ${bodyIncludes}`);
  }

  assertStylesLoaded(label, html, rootBody, filePath);

  console.log(`[PASS] ${label}`);
}

function assertStylesLoaded(label, html, rootBody, filePath) {
  const stylesheetHref = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"/i)?.[1];
  if (!stylesheetHref) {
    throw new Error(`[${label}] missing stylesheet link`);
  }

  const cssModuleClass = rootBody.match(/\bclass="[^"]*\b(_[a-zA-Z0-9]+_[a-z0-9]+)\b/i)?.[1];
  if (!cssModuleClass) return;

  const cssPath = join(dist, stylesheetHref.replace(/^\//, ''));
  if (!existsSync(cssPath)) {
    throw new Error(`[${label}] stylesheet file missing: ${cssPath}`);
  }

  const css = readFileSync(cssPath, 'utf8');
  if (!css.includes(cssModuleClass)) {
    throw new Error(
      `[${label}] prerender body uses ${cssModuleClass} but linked stylesheet does not define it (${stylesheetHref})`,
    );
  }
}

let queryMeta = {};
const queryMetaPath = join(root, 'prerender-query-meta.json');
if (existsSync(queryMetaPath)) {
  queryMeta = JSON.parse(readFileSync(queryMetaPath, 'utf8'));
}

for (const sample of samples) {
  assertCrawlSafe(
    sample.label,
    join(dist, sample.file),
    sample.titleIncludes,
    sample.bodyIncludes,
  );
}

const queryKeys = Object.keys(queryMeta);
if (queryKeys.length < 31) {
  throw new Error(`Expected at least 31 query-route head fragments, got ${queryKeys.length}`);
}

for (const key of ['/blog?category=dog-health', '/learn?category=health-records', '/faq?category=pet-records']) {
  if (!queryMeta[key]) {
    throw new Error(`Missing query-route prerender head for ${key}`);
  }
}

console.log(`[PASS] ${queryKeys.length} query-route head fragments for middleware`);
console.log('\nPrerender validation PASSED');
