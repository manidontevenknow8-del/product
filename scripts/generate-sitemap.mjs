import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const blogDir = join(root, 'src/services/blog');

const SITE = process.env.VITE_SITE_URL ?? 'https://petclues.com';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const BLOG_FILES = [
  'seoBlogPosts.ts',
  'seoBlogPostsExtra.ts',
  'mockBlogPosts.ts',
  'expandedBlogConfigs.ts',
  'dominance/topics.generated.ts',
];

/** Extract slug + lastmod from blog source files. */
function extractBlogEntries() {
  const entries = new Map();

  for (const file of BLOG_FILES) {
    const content = readFileSync(join(blogDir, file), 'utf8');

    if (file === 'expandedBlogConfigs.ts' || file === 'dominance/topics.generated.ts') {
      for (const match of content.matchAll(/"slug":\s*"([^"]+)"/g)) {
        const slug = match[1];
        if (!slug.includes('-')) continue;
        entries.set(slug, BUILD_DATE);
      }
      if (file === 'expandedBlogConfigs.ts') {
        for (const match of content.matchAll(/slug:\s*'([^']+)'/g)) {
          const slug = match[1];
          if (slug === 'string') continue;
          if (!slug.includes('-')) continue;
          entries.set(slug, BUILD_DATE);
        }
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
  { loc: '/compare', priority: '0.85', changefreq: 'weekly' },
  { loc: '/best', priority: '0.88', changefreq: 'weekly' },
  { loc: '/guides', priority: '0.87', changefreq: 'weekly' },
  { loc: '/learn', priority: '0.85', changefreq: 'weekly' },
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
  'vet-finance',
  'breed-lifestyle',
  'symptom-triage',
  'pet-travel',
  'pet-tech',
];

const blogEntries = extractBlogEntries();

function extractCompareSlugs() {
  const content = readFileSync(join(root, 'src/data/comparisons/competitorConfigs.ts'), 'utf8');
  const slugs = new Set();
  for (const match of content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

const compareSlugs = extractCompareSlugs();

function extractIntentSlugs() {
  const content = readFileSync(join(root, 'src/data/intent/intentConfigs.ts'), 'utf8');
  const slugs = new Set();
  for (const match of content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

const intentSlugs = extractIntentSlugs();

function extractProgrammaticSlugs(seedFile, collectionId) {
  const content = readFileSync(join(root, seedFile), 'utf8');
  const slugs = new Set();
  for (const match of content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort().map((slug) => ({ collectionId, slug }));
}

function extractTemplateSlugs(exportName) {
  const content = readFileSync(join(root, 'src/data/programmatic/seeds/templates.ts'), 'utf8');
  const block = content.split(`export const ${exportName}`)[1]?.split('export const ')[0] ?? '';
  const slugs = [];
  for (const match of block.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
    slugs.push(match[1]);
  }
  return slugs.sort();
}

const PROGRAMMATIC_COLLECTIONS = [
  'dog-vaccination-schedule',
  'cat-vaccination-schedule',
  'pet-travel-checklist',
  'pet-emergency-checklist',
  'medication-tracking-template',
  'health-record-template',
  'pet-care-checklist',
];

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

function extractLearnSlugs() {
  const content = readFileSync(join(root, 'src/data/learn/articleConfigs.ts'), 'utf8');
  const slugs = new Set();
  for (const match of content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

const LEARN_CATEGORIES = [
  'health-records',
  'vaccinations',
  'pet-passports',
  'pet-travel',
  'pet-emergencies',
  'pet-documentation',
  'medication-tracking',
  'pet-organization',
];

const learnSlugs = extractLearnSlugs();

function slugifyFaqQuestion(question) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
}

function extractFaqSlugs() {
  const content = readFileSync(join(root, 'src/data/faq/faqQuestionBank.ts'), 'utf8');
  const slugs = new Set();
  for (const match of content.matchAll(/^\s+'([^']+\?)',/gm)) {
    slugs.add(slugifyFaqQuestion(match[1]));
  }
  return [...slugs].sort();
}

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
];

const faqSlugs = extractFaqSlugs();

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
  ...compareSlugs.map((slug) => ({
    loc: `${SITE}/compare/${slug}`,
    priority: '0.75',
    changefreq: 'monthly',
    lastmod: BUILD_DATE,
  })),
  ...intentSlugs.map((slug) => ({
    loc: `${SITE}/best/${slug}`,
    priority: '0.82',
    changefreq: 'monthly',
    lastmod: BUILD_DATE,
  })),
  ...PROGRAMMATIC_COLLECTIONS.map((collectionId) => ({
    loc: `${SITE}/guides/${collectionId}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })),
  ...programmaticPages.map(({ collectionId, slug }) => ({
    loc: `${SITE}/guides/${collectionId}/${slug}`,
    priority: '0.78',
    changefreq: 'monthly',
    lastmod: BUILD_DATE,
  })),
  ...LEARN_CATEGORIES.map((category) => ({
    loc: `${SITE}/learn?category=${category}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })),
  ...learnSlugs.map((slug) => ({
    loc: `${SITE}/learn/${slug}`,
    priority: '0.72',
    changefreq: 'monthly',
    lastmod: BUILD_DATE,
  })),
  ...FAQ_CATEGORIES.map((category) => ({
    loc: `${SITE}/faq?category=${category}`,
    priority: '0.68',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })),
  ...faqSlugs.map((slug) => ({
    loc: `${SITE}/faq/${slug}`,
    priority: '0.7',
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
console.log(
  `Wrote sitemap with ${urls.length} URLs (${blogEntries.length} blog posts, ${BLOG_CATEGORIES.length} blog categories, ${compareSlugs.length} comparisons, ${intentSlugs.length} intent guides, ${programmaticPages.length} programmatic guides, ${PROGRAMMATIC_COLLECTIONS.length} programmatic collections, ${learnSlugs.length} learn articles, ${LEARN_CATEGORIES.length} learn categories, ${faqSlugs.length} faq items, ${FAQ_CATEGORIES.length} faq categories)`,
);
