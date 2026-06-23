/**
 * Cloudflare Pages middleware, query-param crawl controls.
 *
 * Note: Cloudflare `_headers` matches paths only, not query strings.
 * Only `?tag=` and `?q=` get noindex; clean paths and indexable filters
 * like `?category=` are untouched. Mirrors vercel.json `has` header rules.
 */
function hasBlockedSearchQuery(url: URL): boolean {
  return url.searchParams.has('tag') || url.searchParams.has('q');
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (hasBlockedSearchQuery(url)) {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return next();
}
