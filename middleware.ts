import prerenderQueryMeta from './prerender-query-meta.json';
import {
  htmlResponse,
  isBotUserAgent,
  optimizeHtmlForBot,
  prerenderHtmlPath,
} from './middleware/botRouter';

const PRERENDER_SEO_START = '<!-- PETCLUES_SEO_START -->';
const PRERENDER_SEO_END = '<!-- PETCLUES_SEO_END -->';

const queryMeta = prerenderQueryMeta as Record<string, string>;

const INTERNAL_FETCH_HEADER = 'x-prerender-middleware';

function injectHead(html: string, fragment: string): string {
  const pattern = new RegExp(
    `${PRERENDER_SEO_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${PRERENDER_SEO_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  );
  return html.replace(pattern, `${PRERENDER_SEO_START}\n${fragment}\n    ${PRERENDER_SEO_END}`);
}

async function fetchStaticHtml(origin: string, assetPath: string): Promise<string | null> {
  const response = await fetch(`${origin}${assetPath}`, {
    headers: { [INTERNAL_FETCH_HEADER]: '1' },
  });

  if (!response.ok) return null;
  return response.text();
}

async function serveBotHtml(origin: string, pathname: string): Promise<Response | null> {
  const candidates = [prerenderHtmlPath(pathname), '/index.html'];

  for (const assetPath of candidates) {
    const html = await fetchStaticHtml(origin, assetPath);
    if (!html) continue;

    return htmlResponse(optimizeHtmlForBot(html));
  }

  return null;
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  if (request.headers.get(INTERNAL_FETCH_HEADER) === '1') {
    return undefined;
  }

  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent');
  const isBot = isBotUserAgent(userAgent);

  const routeKey = `${url.pathname}${url.search}`;
  const fragment = queryMeta[routeKey];

  if (fragment) {
    const html = await fetchStaticHtml(url.origin, '/index.html');
    if (html) {
      let output = injectHead(html, fragment);
      if (isBot) {
        output = optimizeHtmlForBot(output);
      }
      return htmlResponse(output, isBot ? { 'x-bot-optimized': 'true' } : undefined);
    }
  }

  if (isBot) {
    const botResponse = await serveBotHtml(url.origin, url.pathname);
    if (botResponse) return botResponse;
  }

  return undefined;
}

export const config = {
  matcher: [
    /*
     * Run on document routes only — skip static assets, API, and file extensions.
     * Matches Vercel Edge middleware for the Vite static + prerender deployment.
     */
    '/((?!api|assets|images|fonts|_next|favicon.ico|.*\\..*).*)',
  ],
};
