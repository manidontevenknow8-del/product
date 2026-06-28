/** VIP list of algorithmic crawlers — keep lowercase for matching. */
export const BOT_AGENTS = [
  'googlebot',
  'googlebot-smartphone',
  'googlebot-image',
  'googlebot-video',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp',
  'applebot',
] as const;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = userAgent?.toLowerCase() ?? '';
  return BOT_AGENTS.some((bot) => ua.includes(bot));
}

/** Map a clean URL pathname to the prerendered static HTML file path. */
export function prerenderHtmlPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/') return '/index.html';
  return `${normalized}/index.html`;
}

/**
 * Strip heavy client bundles and analytics from prerender HTML for crawlers.
 * Keeps JSON-LD, visible SSR markup, and SEO head intact.
 */
export function optimizeHtmlForBot(html: string): string {
  let output = html;

  output = output.replace(/<script type="module"[^>]*>\s*<\/script>\s*/gi, '');
  output = output.replace(/<script type="module"[^>]*src="[^"]+"[^>]*>\s*<\/script>\s*/gi, '');
  output = output.replace(/<script>window\.__PETCLUES_PRERENDER__=[\s\S]*?<\/script>\s*/gi, '');
  output = output.replace(/<link[^>]*\srel="preload"[^>]*>\s*/gi, '');
  output = output.replace(/<link[^>]*\srel="modulepreload"[^>]*>\s*/gi, '');

  if (!output.includes('name="petclues-bot-optimized"')) {
    output = output.replace(
      '</head>',
      '    <meta name="petclues-bot-optimized" content="true" />\n  </head>',
    );
  }

  return output;
}

export function htmlResponse(html: string, extraHeaders?: Record<string, string>): Response {
  const headers = new Headers({
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'public, max-age=0, must-revalidate',
    'x-bot-optimized': 'true',
    ...extraHeaders,
  });

  return new Response(html, { status: 200, headers });
}
