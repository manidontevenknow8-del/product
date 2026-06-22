import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getPrerenderDocument } from '../src/seo/prerenderRouteMeta';
import { buildSeoHeadFragment, injectPrerenderedPage } from '../src/seo/renderHead';
import { loadPrerenderData } from '../src/prerender/loadPrerenderData';
import { readSitemapUrls } from './lib/readSitemapUrls.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');
const serverEntry = join(distDir, 'server', 'entry-server.js');
const site = process.env.VITE_SITE_URL ?? 'https://petclues.com';

type RenderFn = (pathname: string, search: string, data: unknown) => string;

async function loadRenderer(): Promise<RenderFn> {
  const module = await import(pathToFileURL(serverEntry).href);
  if (typeof module.render !== 'function') {
    throw new Error(`Missing render export in ${serverEntry}`);
  }
  return module.render as RenderFn;
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8');
const urls = readSitemapUrls(join(root, 'public')).map((href) => new URL(href));
const render = await loadRenderer();

const queryRouteHead: Record<string, string> = {};
let pathCount = 0;
let queryCount = 0;
let skipped = 0;

for (const url of urls) {
  if (url.origin !== site && url.origin !== site.replace('https://', 'http://')) {
    skipped += 1;
    continue;
  }

  const doc = getPrerenderDocument(url.pathname, url.search);
  if (!doc) {
    skipped += 1;
    continue;
  }

  const routeKey = `${url.pathname}${url.search}`;

  if (url.search) {
    queryRouteHead[routeKey] = buildSeoHeadFragment(doc);
    queryCount += 1;
    continue;
  }

  const prerenderData = await loadPrerenderData(url.pathname, url.search);
  const appMarkup = render(url.pathname, url.search, prerenderData);
  const html = injectPrerenderedPage(template, doc, appMarkup, prerenderData);
  const outFile =
    url.pathname === '/'
      ? join(distDir, 'index.html')
      : join(distDir, url.pathname.slice(1), 'index.html');

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html, 'utf8');
  pathCount += 1;
}

writeFileSync(join(root, 'prerender-query-meta.json'), JSON.stringify(queryRouteHead, null, 2), 'utf8');

console.log(
  `Prerendered ${pathCount} path routes with full HTML bodies, ${queryCount} query routes for middleware, skipped ${skipped} sitemap URLs`,
);
