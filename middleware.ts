import prerenderQueryMeta from './prerender-query-meta.json';

const PRERENDER_SEO_START = '<!-- PETCLUES_SEO_START -->';
const PRERENDER_SEO_END = '<!-- PETCLUES_SEO_END -->';

const queryMeta = prerenderQueryMeta as Record<string, string>;

function injectHead(html: string, fragment: string): string {
  const pattern = new RegExp(
    `${PRERENDER_SEO_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${PRERENDER_SEO_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  );
  return html.replace(pattern, `${PRERENDER_SEO_START}\n${fragment}\n    ${PRERENDER_SEO_END}`);
}

function hasBlockedBlogQuery(url: URL): boolean {
  return url.searchParams.has('tag') || url.searchParams.has('q');
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  if (request.headers.get('x-prerender-middleware') === '1') {
    return undefined;
  }

  const url = new URL(request.url);

  if (url.pathname === '/blog' && hasBlockedBlogQuery(url)) {
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const routeKey = `${url.pathname}${url.search}`;
  const fragment = queryMeta[routeKey];
  if (!fragment) return undefined;

  const indexUrl = new URL('/index.html', url.origin);
  const response = await fetch(indexUrl.toString(), {
    headers: {
      'x-prerender-middleware': '1',
    },
  });

  if (!response.ok) return undefined;

  const html = injectHead(await response.text(), fragment);
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'public, max-age=0, must-revalidate');

  return new Response(html, {
    status: 200,
    headers,
  });
}

export const config = {
  matcher: ['/blog', '/learn', '/faq'],
};
