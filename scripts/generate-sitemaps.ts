import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIFECYCLE_MATRIX } from '../src/data/lifecycleMatrix';
import { RESOURCE_MATRIX } from '../src/data/resourceMatrix';

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
  '/for-agencies',
  '/for-breeders',
] as const;

const COMMERCIAL_PATH_SET = new Set<string>(COMMERCIAL_PATHS);

/** Compare slugs that 301 to /best/:slug, exclude from sitemap, keep redirect for backlinks. */
const COMPARE_SITEMAP_EXCLUDED = new Set(['best-pet-health-record-app']);

const BLOG_FILES = [
  'gscOpportunityPosts.ts',
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

type SitemapTier =
  | 'commercial'
  | 'blog'
  | 'faq'
  | 'guides'
  | 'medical'
  | 'lifecycle'
  | 'resources'
  | 'breeds'
  | 'symptoms'
  | 'vaccinations'
  | 'emergency'
  | 'vault'
  | 'life-logistics'
  | 'compare'
  | 'tools';

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
  const content = readFileSync(join(root, 'content-data/comparisons.json'), 'utf8');
  const records = JSON.parse(content) as Array<{
    slug: string;
    features?: Array<{ feature?: string; value?: string; source?: string }>;
  }>;
  const slugs = new Set<string>();
  for (const record of records) {
    const features = record.features ?? [];
    const complete =
      features.length > 0 &&
      features.every((f) => Boolean(f.feature?.trim() && f.value?.trim() && f.source?.trim()));
    if (!complete) continue;
    const pageSlug = `petclues-vs-${record.slug}`;
    if (!COMPARE_SITEMAP_EXCLUDED.has(pageSlug)) slugs.add(pageSlug);
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

/** Flat /breeds/{slug}/{stage}-health-guide pages from generated index. */
function extractBreedHealthPaths(): string[] {
  const file = join(root, 'content-data/generated/breed-health/index.json');
  if (!existsSync(file)) return [];
  const entries = JSON.parse(readFileSync(file, 'utf8')) as { path?: string }[];
  return entries
    .map((e) => e.path)
    .filter((p): p is string => typeof p === 'string' && p.startsWith('/breeds/'))
    .sort();
}

/** /symptoms/{species}/{slug} pages from generated batches. */
function extractSymptomGuidePaths(): string[] {
  const dir = join(root, 'content-data/generated/symptoms');
  if (!existsSync(dir)) return [];
  const paths: string[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.startsWith('batch-') || !file.endsWith('.json')) continue;
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8')) as
      | { pages?: { path?: string }[] }
      | { path?: string }[];
    const pages = Array.isArray(raw) ? raw : (raw.pages ?? []);
    for (const page of pages) {
      if (page.path) paths.push(page.path);
    }
  }
  return [...new Set(paths)].sort();
}

/** /vaccinations/{slug} from generated manifest. */
function extractVaccinationPaths(): string[] {
  const file = join(root, 'content-data/generated/vaccinations/_manifest.json');
  if (!existsSync(file)) return [];
  const manifest = JSON.parse(readFileSync(file, 'utf8')) as { pages?: { path?: string }[] };
  return (manifest.pages ?? [])
    .map((p) => p.path)
    .filter((p): p is string => typeof p === 'string' && p.startsWith('/vaccinations/'))
    .sort();
}

function extractToolPaths(): string[] {
  const file = join(root, 'content-data/tools.json');
  if (!existsSync(file)) return [];
  const pages = JSON.parse(readFileSync(file, 'utf8')) as { slug?: string }[];
  return pages
    .filter((p) => p.slug)
    .map((p) => `/tools/${p.slug!}`)
    .sort();
}

/** Flat /guides/{slug} life-logistics pillar pages from generated JSON batches. */
function extractLifeLogisticsSlugs(): string[] {
  const dir = join(root, 'content-data/generated/life-logistics');
  if (!existsSync(dir)) return [];
  const slugs: string[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const file = join(dir, `batch-0${i}.json`);
    if (!existsSync(file)) continue;
    const pages = JSON.parse(readFileSync(file, 'utf8')) as { slug?: string }[];
    for (const page of pages) {
      if (page.slug) slugs.push(page.slug);
    }
  }
  return [...new Set(slugs)].sort();
}

/** /emergency/{slug} pages from generated JSON batches. */
function extractEmergencyGuideSlugs(): string[] {
  const dir = join(root, 'content-data/generated/emergencies');
  if (!existsSync(dir)) return [];
  const slugs: string[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const file = join(dir, `batch-${String(i).padStart(2, '0')}.json`);
    if (!existsSync(file)) continue;
    const pages = JSON.parse(readFileSync(file, 'utf8')) as { slug?: string }[];
    for (const page of pages) {
      if (page.slug) slugs.push(page.slug);
    }
  }
  return [...new Set(slugs)].sort();
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

function extractVaultGuideSlugs(): string[] {
  const file = join(root, 'content-data/generated/vault/pages.json');
  if (!existsSync(file)) return [];
  const pages = JSON.parse(readFileSync(file, 'utf8')) as { slug?: string }[];
  return pages
    .map((page) => page.slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
    .sort();
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

function classifyTier(
  pathname: string,
  medicalPaths: Set<string>,
  vaultSlugs: Set<string>,
  logisticsSlugs: Set<string>,
): SitemapTier {
  if (/^\/resources(\/|$)/.test(pathname)) return 'resources';
  if (/^\/guides\/[^/]+\/lifecycle\/[^/]+$/.test(pathname)) return 'lifecycle';
  if (medicalPaths.has(pathname)) return 'medical';
  if (pathname === '/relocation' || pathname.startsWith('/relocation/')) return 'medical';
  if (COMMERCIAL_PATH_SET.has(pathname)) return 'commercial';
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return 'blog';
  if (pathname === '/faq' || pathname.startsWith('/faq/')) return 'faq';
  if (pathname === '/breeds' || pathname.startsWith('/breeds/')) return 'breeds';
  if (pathname === '/symptoms' || pathname.startsWith('/symptoms/')) return 'symptoms';
  if (pathname === '/vaccinations' || pathname.startsWith('/vaccinations/')) return 'vaccinations';
  if (pathname === '/emergency' || pathname.startsWith('/emergency/')) return 'emergency';
  if (pathname === '/vault') return 'vault';
  if (pathname === '/life-logistics') return 'life-logistics';
  if (pathname === '/compare' || pathname.startsWith('/compare/')) return 'compare';
  if (pathname === '/tools' || pathname.startsWith('/tools/')) return 'tools';
  if (pathname.startsWith('/guides/')) {
    const slug = pathname.slice('/guides/'.length);
    if (!slug.includes('/') && vaultSlugs.has(slug)) return 'vault';
    if (!slug.includes('/') && logisticsSlugs.has(slug)) return 'life-logistics';
  }
  if (pathname === '/guides' || pathname.startsWith('/guides/')) return 'guides';
  if (
    pathname === '/learn' ||
    pathname.startsWith('/learn/') ||
    pathname === '/best' ||
    pathname.startsWith('/best/')
  ) {
    return 'guides';
  }
  return 'commercial';
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
  const lifeLogisticsSlugs = extractLifeLogisticsSlugs();
  const emergencyGuideSlugs = extractEmergencyGuideSlugs();
  const breedHealthPaths = extractBreedHealthPaths();
  const symptomGuidePaths = extractSymptomGuidePaths();
  const vaccinationPaths = extractVaccinationPaths();
  const toolPaths = extractToolPaths();
  const vaultGuideSlugs = extractVaultGuideSlugs();
  const vaultSlugSet = new Set(vaultGuideSlugs);
  const logisticsSlugSet = new Set(lifeLogisticsSlugs);

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

  const breedConditionPaths = (() => {
    const paths = new Set<string>();
    for (const file of ['src/data/breedConditions.ts', 'src/data/breedConditionsExpanded.ts']) {
      const content = readFileSync(join(root, file), 'utf8');
      for (const match of content.matchAll(/["']?slug["']?\s*:\s*["']([^"']+\/[^"']+)["']/g)) {
        paths.add(`/guides/${match[1]}`);
      }
    }
    return [...paths];
  })();

  const relocationPaths = (() => {
    const content = readFileSync(join(root, 'src/data/relocationRoutes.ts'), 'utf8');
    const paths = new Set<string>(['/relocation']);
    for (const match of content.matchAll(/route\(\s*['"]([a-z0-9]+-to-[a-z0-9]+)['"]/g)) {
      paths.add(`/relocation/${match[1]}`);
    }
    return [...paths];
  })();

  const staticCore = [
    { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/pricing', priority: '0.9', changefreq: 'monthly', lastmod: BUILD_DATE },
    { loc: '/pet-match', priority: '0.8', changefreq: 'monthly', lastmod: BUILD_DATE },
    { loc: '/founding-members', priority: '0.7', changefreq: 'monthly', lastmod: BUILD_DATE },
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
  const resourcesHub = { loc: '/resources', priority: '0.88', changefreq: 'weekly', lastmod: BUILD_DATE };
  const faqHub = { loc: '/faq', priority: '0.5', changefreq: 'monthly', lastmod: BUILD_DATE };

  const pillarHubs = [
    { loc: '/breeds', priority: '0.9', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/symptoms', priority: '0.9', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/vaccinations', priority: '0.9', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/emergency', priority: '0.9', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/vault', priority: '0.88', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/life-logistics', priority: '0.88', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/compare', priority: '0.92', changefreq: 'weekly', lastmod: BUILD_DATE },
    { loc: '/tools', priority: '0.9', changefreq: 'weekly', lastmod: BUILD_DATE },
  ];

  const raw = [
    ...staticCore,
    ...commercial,
    blogHub,
    guidesHub,
    resourcesHub,
    faqHub,
    ...pillarHubs,
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
      priority: '0.9',
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
    ...vaultGuideSlugs.map((slug) => ({
      loc: `/guides/${slug}`,
      priority: '0.84',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...lifeLogisticsSlugs.map((slug) => ({
      loc: `/guides/${slug}`,
      priority: '0.83',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...emergencyGuideSlugs.map((slug) => ({
      loc: `/emergency/${slug}`,
      priority: '0.85',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...breedHealthPaths.map((loc) => ({
      loc,
      priority: '0.82',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...symptomGuidePaths.map((loc) => ({
      loc,
      priority: '0.84',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...vaccinationPaths.map((loc) => ({
      loc,
      priority: '0.86',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...toolPaths.map((loc) => ({
      loc,
      priority: '0.84',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    {
      loc: '/tools/vaccine-scheduler',
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: BUILD_DATE,
    },
    {
      loc: '/tools/qr-generator',
      priority: '0.75',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    },
    ...breedConditionPaths.map((loc) => ({
      loc,
      priority: '0.84',
      changefreq: 'monthly',
      lastmod: CONTENT_LASTMOD.programmatic,
    })),
    ...LIFECYCLE_MATRIX.map((entry) => ({
      loc: entry.path,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...RESOURCE_MATRIX.map((entry) => ({
      loc: entry.path,
      priority: '0.81',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
    })),
    ...relocationPaths.map((loc) => ({
      loc,
      priority: loc === '/relocation' ? '0.9' : '0.92',
      changefreq: 'monthly',
      lastmod: BUILD_DATE,
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

  const medicalPaths = new Set(breedConditionPaths);

  return raw.map((entry) => {
    const url = new URL(entry.loc, SITE);
    return {
      ...entry,
      loc: url.href,
      tier: classifyTier(url.pathname, medicalPaths, vaultSlugSet, logisticsSlugSet),
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
  'sitemap-medical.xml',
  'sitemap-lifecycle.xml',
  'sitemap-resources.xml',
  'sitemap-compare.xml',
  'sitemap-vaccinations.xml',
  'sitemap-emergency.xml',
  'sitemap-vault.xml',
  'sitemap-life-logistics.xml',
  'sitemap-tools.xml',
  'sitemap-symptoms.xml',
  'sitemap-breeds.xml',
] as const;

const LEGACY_SITEMAPS = ['sitemap-money.xml', 'sitemap-content.xml', 'sitemap-core.xml'] as const;

function loadPassPathSet(): Set<string> | null {
  const file = join(root, 'content-data/generated/reports/agent-11-qa-report.json');
  if (!existsSync(file)) return null;
  try {
    const report = JSON.parse(readFileSync(file, 'utf8')) as {
      pass?: { path?: string }[];
    };
    return new Set(
      (report.pass ?? [])
        .map((row) => row.path)
        .filter((p): p is string => typeof p === 'string' && p.length > 0),
    );
  } catch {
    return null;
  }
}

function main(): void {
  const routes = buildRoutes();
  const passPaths = loadPassPathSet();
  const pillarTiers = new Set<SitemapTier>([
    'compare',
    'vaccinations',
    'emergency',
    'vault',
    'life-logistics',
    'tools',
    'symptoms',
    'breeds',
  ]);

  const filteredRoutes =
    passPaths == null
      ? routes
      : routes.filter((r) => {
          if (!pillarTiers.has(r.tier)) return true;
          const pathname = new URL(r.loc).pathname;
          return passPaths.has(pathname);
        });

  const tiers: SitemapTier[] = [
    'commercial',
    'blog',
    'faq',
    'guides',
    'medical',
    'lifecycle',
    'resources',
    'compare',
    'vaccinations',
    'emergency',
    'vault',
    'life-logistics',
    'tools',
    'symptoms',
    'breeds',
  ];

  const byTier = Object.fromEntries(
    tiers.map((tier) => [tier, filteredRoutes.filter((r) => r.tier === tier)]),
  ) as Record<SitemapTier, SitemapEntry[]>;

  const fileForTier: Record<SitemapTier, string> = {
    commercial: 'sitemap-commercial.xml',
    blog: 'sitemap-blog.xml',
    faq: 'sitemap-faq.xml',
    guides: 'sitemap-guides.xml',
    medical: 'sitemap-medical.xml',
    lifecycle: 'sitemap-lifecycle.xml',
    resources: 'sitemap-resources.xml',
    compare: 'sitemap-compare.xml',
    vaccinations: 'sitemap-vaccinations.xml',
    emergency: 'sitemap-emergency.xml',
    vault: 'sitemap-vault.xml',
    'life-logistics': 'sitemap-life-logistics.xml',
    tools: 'sitemap-tools.xml',
    symptoms: 'sitemap-symptoms.xml',
    breeds: 'sitemap-breeds.xml',
  };

  for (const tier of tiers) {
    writeFileSync(join(publicDir, fileForTier[tier]), renderUrlset(byTier[tier]));
  }

  const indexXml = renderSitemapIndex([...CHILD_SITEMAPS]);
  writeFileSync(join(publicDir, 'sitemap-index.xml'), indexXml);
  writeFileSync(join(publicDir, 'sitemap.xml'), indexXml);

  for (const legacy of LEGACY_SITEMAPS) {
    const legacyPath = join(publicDir, legacy);
    if (existsSync(legacyPath)) unlinkSync(legacyPath);
  }

  const counts = Object.fromEntries(
    tiers.map((tier) => [tier, byTier[tier].length]),
  ) as Record<SitemapTier, number>;

  console.log(
    `Wrote sitemap-index.xml + ${CHILD_SITEMAPS.length} child sitemaps (${filteredRoutes.length} URLs` +
      (passPaths ? `; pillar URLs filtered to Agent 11 PASS=${passPaths.size}` : '') +
      `)`,
  );
  console.log(
    Object.entries(counts)
      .map(([k, v]) => `${k}=${v}`)
      .join(', '),
  );
}

main();
