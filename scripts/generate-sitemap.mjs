import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const blogDir = join(root, 'src/services/blog');

const SITE = process.env.VITE_SITE_URL ?? 'https://petclues.com';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const BLOG_FILES = ['seoBlogPosts.ts', 'seoBlogPostsExtra.ts', 'mockBlogPosts.ts'];

/** Extract slug + lastmod from blog source files. */
function extractBlogEntries() {
  const entries = new Map();

  for (const file of BLOG_FILES) {
    const content = readFileSync(join(blogDir, file), 'utf8');
    const blocks = content.split(/\{\s*id:\s*'/);

    for (const block of blocks.slice(1)) {
      const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/);
      const updatedMatch = block.match(/updatedAt:\s*['"]([^'"]+)['"]/);
      const publishedMatch = block.match(/publishedAt:\s*['"]([^'"]+)['"]/);

      if (!slugMatch) continue;

      const rawDate = updatedMatch?.[1] ?? publishedMatch?.[1] ?? BUILD_DATE;
      const lastmod = rawDate.slice(0, 10);
      const existing = entries.get(slugMatch[1]);
      if (!existing || lastmod > existing) {
        entries.set(slugMatch[1], lastmod);
      }
    }
  }

  return [...entries.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, lastmod]) => ({ slug, lastmod }));
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

const BLOG_CATEGORIES = [
  'dog-health',
  'cat-health',
  'bird-care',
  'exotic-pets',
  'pet-records',
  'petclues-guides',
];

const blogEntries = extractBlogEntries();

const urls = [
  ...STATIC.map((u) => ({
    ...u,
    loc: `${SITE}${u.loc}`,
    lastmod: BUILD_DATE,
  })),
  ...BLOG_CATEGORIES.map((category) => ({
    loc: `${SITE}/blog?category=${category}`,
    priority: '0.75',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })),
  ...blogEntries.map(({ slug, lastmod }) => ({
    loc: `${SITE}/blog/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod,
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
console.log(
  `Wrote sitemap with ${urls.length} URLs (${blogEntries.length} blog posts, ${BLOG_CATEGORIES.length} categories)`,
);
