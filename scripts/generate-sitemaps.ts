import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const blogDir = join(root, 'src/services/blog');
const publicDir = join(root, 'public');

const SITE = process.env.VITE_SITE_URL ?? 'https://petclues.com';
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const NOW_MS = Date.now();

const CONTENT_LASTMOD = {
  compare: '2026-06-16',
  learn: '2026-06-16',
  intent: '2026-06-18',
  faq: '2026-06-18',
  programmatic: '2026-06-18',
  legal: '2026-03-01',
} as const;

/** High-intent product landing pages, isolated for crawl-budget priority. */
const COMMERCIAL_PATHS = [
  '/pet-health-records',
  '/digital-pet-passport',
  '/pet-vaccination-records',
  '/pet-medical-history',
  '/pet-health-tracker',
] as const;

const COMMERCIAL_PATH_SET = new Set<string>(COMMERCIAL_PATHS);

/** Compare slugs that 301 to /best/:slug, exclude from sitemap, keep redirect for backlinks. */
const COMPARE_SITEMAP_EXCLUDED = new Set(['best-pet-health-record-app']);

const BLOG_FILES = [
  'seoBlogPosts.ts',
  'seoBlogPostsExtra.ts',
  'mockBlogPosts.ts',
  'expandedBlogConfigs.ts',
  'dominance/topics.generated.ts',
] as const;

const BLOG_CATEGORIES = [
  'dog-health',
  'cat-health',
  'bird-care',
  'exotic-pets',
  'pet-records',
  'petclues-guides',
  'vet-finance',
  'breed-lifestyle',
  'symptom-triage',
  'pet-travel',
  'pet-tech',
] as const;

const PROGRAMMATIC_COLLECTIONS = [
  'dog-vaccination-schedule',
  'cat-vaccination-schedule',
  'pet-travel-checklist',
  'pet-emergency-checklist',
  'medication-tracking-template',
  'health-record-template',
  'pet-care-checklist',
] as const;

const LEARN_CATEGORIES = [
  'health-records',
  'vaccinations',
  'pet-passports',
  'pet-travel',
  'pet-emergencies',
  'pet-documentation',
  'medication-tracking',
  'pet-organization',
] as const;

const FAQ_CATEGORIES = [
  'pet-records',
  'vaccinations',
  'pet-passports',
  'pet-travel',
  'medication-management',
  'emergency-preparedness',
  'pet-organization',
  'medical-history',
  'new-pet-owners',
  'senior-pet-care',
  'exotic-specialty-care',
  'petclues-app',
] as const;

type SitemapTier = 'commercial' | 'blog' | 'faq' | 'guides' | 'core';

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  tier: SitemapTier;
}

function daysAgoIso(n: number): string {
  return new Date(NOW_MS - n * 86_400_000).toISOString().slice(0, 10);
}

function setBlogLastmod(entries: Map<string, string>, slug: string, lastmod: string): void {
  const existing = entries.get(slug);
  if (!existing || lastmod > existing) {
    entries.set(slug, lastmod);
  }
}

function extractBlogEntries(): Array<{ slug: string; lastmod: string }> {
  const entries = new Map<string, string>();

  for (const file of BLOG_FILES) {
    const content = readFileSync(join(blogDir, file), 'utf8');

    if (file === 'dominance/topics.generated.ts') {
      let index = 0;
      for (const match of content.matchAll(/"slug":\s*"([^"]+)"/g)) {
        const slug = match[1];
        if (!slug.includes('-')) continue;
        setBlogLastmod(entries, slug, daysAgoIso(Math.max(1, index % 21)));
        index += 1;
      }
      continue;
    }

    if (file === 'expandedBlogConfigs.ts') {
      let index = 0;
      for (const match of content.matchAll(/slug:\s*'([^']+)'/g)) {
        const slug = match[1];
        if (slug === 'string' || !slug.includes('-')) continue;
        setBlogLastmod(entries, slug, daysAgoIso(Math.max(1, index % 14)));
        index += 1;
      }
      continue;
    }

    const blocks = content.split(/\{\s*id:\s*'/);
    for (const block of blocks.slice(1)) {
      const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/);
      const updatedMatch = block.match(/updatedAt:\s*['"]([^'"]+)['"]/);
      const publishedMatch = block.match(/publishedAt:\s*['"]([^'"]+)['"]/);
      if (!slugMatch) continue;

      const rawDate = updatedMatch?.[1] ?? publishedMatch?.[1] ?? BUILD_DATE;
      setBlogLastmod(entries, slugMatch[1], rawDate.slice(0, 10));
    }
  }

  return [...entries.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, lastmod]) => ({ slug, lastmod }));
}

function extractCompareSlugs(): string[] {
  const content = readFileSync(join(root, 'src/data/comparisons/competitorConfigs.ts'), 'utf8');
  const slugs = new Set<string>();
  for (const match of content.matchAll(/\n    slug: '([^']+)'/g)) {
    const slug = match[1];
    if (!COMPARE_SITEMAP_EXCLUDED.has(slug)) slugs.add(slug);
  }
  return [...slugs].sort();
}

function extractIntentSlugs(): string[] {
  const content = readFileSync(join(root, 'src/data/intent/intentConfigs.ts'), 'utf8');
  const slugs = new Set<string>();
  for (const match of content.matchAll(/\n    slug: '([^']+)'/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

function extractProgrammaticSlugs(
  seedFile: string,
  collectionId: string,
): Array<{ collectionId: string; slug: string }> {
  const content = readFileSync(join(root, seedFile), 'utf8');
  const slugs = new Set<string>();
  for (const match of content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort().map((slug) => ({ collectionId, slug }));
}

function extractTemplateSlugs(exportName: string): string[] {
  const content = readFileSync(join(root, 'src/data/programmatic/seeds/templates.ts'), 'utf8');
  const block = content.split(`export const ${exportName}`)[1]?.split('export const ')[0] ?? '';
  const slugs: string[] = [];
  for (const match of block.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
    slugs.push(match[1]);
  }
  return slugs.sort();
}

function extractLearnSlugs(): string[] {
  const content = readFileSync(join(root, 'src/data/learn/articleConfigs.ts'), 'utf8');
  const slugs = new Set<string>();
  for (const block of content.split(/\{\s*\n    slug: '/).slice(1)) {
    const slug = block.match(/^([^']+)'/)?.[1];
    if (slug) slugs.add(slug);
  }
  return [...slugs].sort();
}

function slugifyFaqQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
}

function extractFaqSlugs(): string[] {
  const content = readFileSync(join(root, 'src/data/faq/faqQuestionBank.ts'), 'utf8');
  const slugs = new Set<string>();
  for (const match of content.matchAll(/^\s+'([^']+\?)',/gm)) {
    slugs.add(slugifyFaqQuestion(match[1]));
  }
  return [...slugs].sort();
}

function classifyTier(pathname: string): SitemapTier {
  if (COMMERCIAL_PATH_SET.has(pathname)) return 'commercial';
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return 'blog';
  if (pathname === '/faq' || pathname.startsWith('/faq/')) return 'faq';
  if (pathname === '/guides' || pathname.startsWith('/guides/')) return 'guides';
  return 'core';
}

function buildRoutes(): SitemapEntry[] {
  const blogEntries = extractBlogEntries();
  const newestBlogLastmod =
    blogEntries.reduce((max, { lastmod }) => (lastmod > max ? lastmod : max), BUILD_DATE) ??
    BUILD_DATE;

  const compareSlugs = extractCompareSlugs();
  const intentSlugs = extractIntentSlugs();
  const learnSlugs = extractLearnSlugs();
  const faqSlugs = extractFaqSlugs();

  const programmaticPages = [
    ...extractProgrammaticSlugs('src/data/programmatic/seeds/dogBreeds.ts', 'dog-vaccination-schedule'),
    ...extractProgrammaticSlugs('src/data/programmatic/seeds/catBreeds.ts', 'cat-vaccination-schedule'),
    ...extractProgrammaticSlugs('src/data/programmatic/seeds/countries.ts', 'pet-travel-checklist'),
    ...extractProgrammaticSlugs('src/data/programmatic/seeds/emergencySpecies.ts', 'pet-emergency-checklist'),
    ...extractTemplateSlugs('MEDICATION_TEMPLATE_SEEDS').map((slug) => ({
      collectionId: 'medication-tracking-template',
      slug,
    })),
    ...extractTemplateSlugs('HEALTH_RECORD_TEMPLATE_SEEDS').map((slug) => ({
      collectionId: 'health-record-template',
      slug,
    })),
    ...extractTemplateSlugs('CARE_CHECKLIST_TEMPLATE_SEEDS').map((slug) => ({
      collectionId: 'pet-care-checklist',
      slug,
    })),
  ];

  const staticCore = [
    { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/pricing', priority: '0.9', changefreq: 'monthly', lastmod: BUILD_DATE },
    { loc: '/pet-match', priority: '0.8', changefreq: 'monthly', lastmod: BUILD_DATE },
    { loc: '/founding-members', priority: '0.7', changefreq: 'monthly', lastmod: BUILD_DATE },
    { loc: '/compare', priority: '0.85', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/best', priority: '0.88', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/learn', priority: '0.85', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
    { loc: '/terms', priority: '0.3', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
    { loc: '/cookies', priority: '0.3', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
    { loc: '/contact', priority: '0.4', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
    { loc: '/about', priority: '0.4', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
    { loc: '/security', priority: '0.3', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
    { loc: '/data-deletion', priority: '0.3', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
    { loc: '/data-export', priority: '0.3', changefreq: 'yearly', lastmod: CONTENT_LASTMOD.legal },
  ];

  const commercial = COMMERCIAL_PATHS.map((loc) => ({
    loc,
    priority: '0.95',
    changefreq: 'monthly',
    lastmod: BUILD_DATE,
  }));

  const blogHub = { loc: '/blog', priority: '0.9', changefreq: 'daily', lastmod: BUILD_DATE };
  const guidesHub = { loc: '/guides', priority: '0.87', changefreq: 'weekly', lastmod: CONTENT_LASTMOD.programmatic };
  const faqHub = { loc: '/faq', priority: '0.5', changefreq: 'monthly', lastmod: BUILD_DATE };

  const raw = [
    ...staticCore,
    ...commercial,
    blogHub,
    guidesHub,
    faqHub,
    ...BLOG_CATEGORIES.map((category) => ({
      loc: `/blog?category=${category}`,
      priority: '0.75',
      changefreq: 'weekly',
      lastmod: newestBlogLastmod,
    })),
    ...blogEntries.map(({ slug, lastmod }) => ({
      loc: `/blog/${slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod,
    })),
    ...compareSlugs.map((slug) => ({
      loc: `/compare/${slug}`,
      priority: '0.75',
      changefreq: 'monthly',
      lastmod: CONTENT_LASTMOD.compare,
    })),
    ...intentSlugs.map((slug) => ({
      loc: `/best/${slug}`,
      priority: '0.82',
      changefreq: 'monthly',
      lastmod: CONTENT_LASTMOD.intent,
    })),
    ...PROGRAMMATIC_COLLECTIONS.map((collectionId) => ({
      loc: `/guides/${collectionId}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: CONTENT_LASTMOD.programmatic,
    })),
    ...programmaticPages.map(({ collectionId, slug }) => ({
      loc: `/guides/${collectionId}/${slug}`,
      priority: '0.78',
      changefreq: 'monthly',
      lastmod: CONTENT_LASTMOD.programmatic,
    })),
    ...LEARN_CATEGORIES.map((category) => ({
      loc: `/learn?category=${category}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: CONTENT_LASTMOD.learn,
    })),
    ...learnSlugs.map((slug) => ({
      loc: `/learn/${slug}`,
      priority: '0.72',
      changefreq: 'monthly',
      lastmod: CONTENT_LASTMOD.learn,
    })),
    ...FAQ_CATEGORIES.map((category) => ({
      loc: `/faq?category=${category}`,
      priority: '0.68',
      changefreq: 'weekly',
      lastmod: CONTENT_LASTMOD.faq,
    })),
    ...faqSlugs.map((slug) => ({
      loc: `/faq/${slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: CONTENT_LASTMOD.faq,
    })),
  ];

  return raw.map((entry) => {
    const url = new URL(entry.loc, SITE);
    return {
      ...entry,
      loc: url.href,
      tier: classifyTier(url.pathname),
    };
  });
}

function renderUrlset(entries: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
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
}

function renderSitemapIndex(files: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files
  .map(
    (file) => `  <sitemap>
    <loc>${SITE}/${file}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
  </sitemap>`,
  )
  .join('\n')}
</sitemapindex>
`;
}

const CHILD_SITEMAPS = [
  'sitemap-commercial.xml',
  'sitemap-blog.xml',
  'sitemap-faq.xml',
  'sitemap-guides.xml',
  'sitemap-core.xml',
] as const;

const LEGACY_SITEMAPS = ['sitemap-money.xml', 'sitemap-content.xml'] as const;

function main(): void {
  const routes = buildRoutes();
  const byTier = {
    commercial: routes.filter((r) => r.tier === 'commercial'),
    blog: routes.filter((r) => r.tier === 'blog'),
    faq: routes.filter((r) => r.tier === 'faq'),
    guides: routes.filter((r) => r.tier === 'guides'),
    core: routes.filter((r) => r.tier === 'core'),
  };

  writeFileSync(join(publicDir, 'sitemap-commercial.xml'), renderUrlset(byTier.commercial));
  writeFileSync(join(publicDir, 'sitemap-blog.xml'), renderUrlset(byTier.blog));
  writeFileSync(join(publicDir, 'sitemap-faq.xml'), renderUrlset(byTier.faq));
  writeFileSync(join(publicDir, 'sitemap-guides.xml'), renderUrlset(byTier.guides));
  writeFileSync(join(publicDir, 'sitemap-core.xml'), renderUrlset(byTier.core));

  const indexXml = renderSitemapIndex([...CHILD_SITEMAPS]);
  writeFileSync(join(publicDir, 'sitemap-index.xml'), indexXml);
  writeFileSync(join(publicDir, 'sitemap.xml'), indexXml);

  for (const legacy of LEGACY_SITEMAPS) {
    const legacyPath = join(publicDir, legacy);
    if (existsSync(legacyPath)) unlinkSync(legacyPath);
  }

  const counts = Object.fromEntries(
    Object.entries(byTier).map(([tier, entries]) => [tier, entries.length]),
  ) as Record<SitemapTier, number>;

  console.log(
    `Wrote sitemap-index.xml + ${CHILD_SITEMAPS.length} child sitemaps (${routes.length} URLs: ` +
      `commercial=${counts.commercial}, blog=${counts.blog}, faq=${counts.faq}, ` +
      `guides=${counts.guides}, core=${counts.core})`,
  );
}

main();
