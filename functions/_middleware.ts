/**
 * Cloudflare Pages middleware — query-param crawl controls.
 *
 * Note: Cloudflare `_headers` matches paths only, not query strings.
 * Use this middleware for `?tag=` and `?q=` on any route.
 */
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.searchParams.has('tag') || url.searchParams.has('q')) {
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
