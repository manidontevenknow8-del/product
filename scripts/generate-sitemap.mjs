import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const blogDir = join(root, 'src/services/blog');

const SITE = process.env.VITE_SITE_URL ?? 'https://petclues.com';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

/** Extract published blog slugs from blog source files (single source of truth). */
function extractBlogSlugs() {
  const files = ['seoBlogPosts.ts', 'seoBlogPostsExtra.ts', 'mockBlogPosts.ts'];
  const slugs = new Set();

  for (const file of files) {
    const content = readFileSync(join(blogDir, file), 'utf8');
    for (const match of content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
      slugs.add(match[1]);
    }
  }

  return [...slugs].sort();
}

const STATIC = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/pricing', priority: '0.9', changefreq: 'monthly' },
  { loc: '/pet-match', priority: '0.8', changefreq: 'monthly' },
  { loc: '/founding-members', priority: '0.7', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.9', changefreq: 'daily' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
  { loc: '/cookies', priority: '0.3', changefreq: 'yearly' },
  { loc: '/contact', priority: '0.4', changefreq: 'yearly' },
  { loc: '/about', priority: '0.4', changefreq: 'yearly' },
  { loc: '/security', priority: '0.3', changefreq: 'yearly' },
  { loc: '/data-deletion', priority: '0.3', changefreq: 'yearly' },
  { loc: '/data-export', priority: '0.3', changefreq: 'yearly' },
  { loc: '/faq', priority: '0.5', changefreq: 'monthly' },
];

const blogSlugs = extractBlogSlugs();

const urls = [
  ...STATIC.map((u) => ({
    ...u,
    loc: `${SITE}${u.loc}`,
    lastmod: BUILD_DATE,
  })),
  ...blogSlugs.map((slug) => ({
    loc: `${SITE}/blog/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: BUILD_DATE,
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(root, 'public', 'sitemap.xml'), xml);
console.log(`Wrote sitemap with ${urls.length} URLs (${blogSlugs.length} blog posts)`);
