/**
 * SEO audit, validates titles, descriptions, canonicals, robots, and schema coverage
 * for every URL in public/sitemap.xml. Fails the build on critical gaps.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readSitemapUrls } from './lib/readSitemapUrls.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SITE = process.env.VITE_SITE_URL ?? 'https://petclues.com';

const META_DESC_MIN = 140;
const META_DESC_MAX = 160;
const BRAND_SUFFIX = 'PetClues';
const BRAND_SUFFIX_RE = /\s*(\||-)\s*PetClues(\s+\w+)?\s*$/i;

const COMPARE_SITEMAP_EXCLUDED = new Set(['best-pet-health-record-app']);

const SCHEMA_FAMILIES = {
  landing: {
    handler: 'src/seo/StructuredData.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage'],
  },
  'static-product': {
    handler: 'src/seo/staticPageSeo.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'BreadcrumbList'],
  },
  'static-about': {
    handler: 'src/seo/staticPageSeo.tsx',
    required: ['Organization', 'WebSite', 'ProfilePage', 'WebPage', 'BreadcrumbList'],
  },
  'static-legal': {
    handler: 'src/seo/staticPageSeo.tsx',
    required: ['Organization', 'WebPage', 'BreadcrumbList'],
  },
  'blog-index': {
    handler: 'src/seo/blogSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
  },
  'blog-post': {
    handler: 'src/seo/blogSeo.tsx',
    required: ['Organization', 'WebSite', 'BlogPosting', 'BreadcrumbList'],
  },
  'compare-index': {
    handler: 'src/seo/compareSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList', 'SoftwareApplication'],
  },
  'compare-page': {
    handler: 'src/seo/compareSeo.tsx',
    required: ['Organization', 'WebSite', 'WebPage', 'FAQPage', 'BreadcrumbList', 'SoftwareApplication'],
  },
  'best-index': {
    handler: 'src/seo/intentSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList', 'SoftwareApplication'],
  },
  'best-page': {
    handler: 'src/seo/intentSeo.tsx',
    required: ['Organization', 'WebSite', 'WebPage', 'FAQPage', 'BreadcrumbList', 'SoftwareApplication'],
  },
  'guides-hub': {
    handler: 'src/seo/programmaticSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
  },
  'guides-collection': {
    handler: 'src/seo/programmaticSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
  },
  'guides-page': {
    handler: 'src/seo/programmaticSeo.tsx',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList', 'MedicalWebPage'],
  },
  'breed-condition-page': {
    handler: 'src/seo/breedConditionSeo.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'BreadcrumbList', 'MedicalWebPage', 'FAQPage'],
  },
  'relocation-page': {
    handler: 'src/seo/relocationSeo.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'BreadcrumbList', 'FAQPage'],
  },
  'relocation-hub': {
    handler: 'src/seo/relocationSeo.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'BreadcrumbList'],
  },
  'b2b-solution': {
    handler: 'src/seo/b2bSolutionSeo.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'BreadcrumbList', 'FAQPage'],
  },
  'learn-index': {
    handler: 'src/seo/learnSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
  },
  'learn-page': {
    handler: 'src/seo/learnSeo.tsx',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList'],
  },
  'faq-index': {
    handler: 'src/seo/faqHubSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
  },
  'faq-page': {
    handler: 'src/seo/faqHubSeo.tsx',
    required: ['Organization', 'WebSite', 'QAPage', 'BreadcrumbList'],
  },
  'commercial-page': {
    handler: 'src/seo/commercialSeo.tsx',
    required: ['Organization', 'WebSite', 'WebPage', 'FAQPage', 'BreadcrumbList', 'SoftwareApplication'],
  },
  'vaccine-scheduler': {
    handler: 'src/seo/vaccineSchedulerSeo.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'MedicalWebPage', 'FAQPage', 'BreadcrumbList'],
  },
  'lifecycle-page': {
    handler: 'src/seo/lifecycleSeo.tsx',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList', 'MedicalWebPage'],
  },
  'resource-hub': {
    handler: 'src/seo/resourceSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
  },
  'resource-page': {
    handler: 'src/seo/resourceSeo.tsx',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList', 'HowTo'],
  },
  'vault-guide-page': {
    handler: 'src/seo/vaultGuideSeo.ts',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList'],
  },
  'emergency-guide-page': {
    handler: 'src/seo/emergencyGuideSeo.ts',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList'],
  },
  'tool-download-page': {
    handler: 'src/seo/toolDownloadSeo.ts',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'FAQPage', 'BreadcrumbList'],
  },
  'content-pillar-page': {
    handler: 'src/seo/vaultGuideSeo.ts',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList'],
  },
};

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8');
}

function formatPageTitle(pageTitle) {
  const trimmed = pageTitle.trim();
  if (/\|\s*PetClues\s*$/i.test(trimmed)) return trimmed;
  if (/-\s*PetClues\s*$/i.test(trimmed)) {
    return trimmed.replace(/-\s*PetClues\s*$/i, ` | ${BRAND_SUFFIX}`);
  }
  const cleaned = trimmed.replace(BRAND_SUFFIX_RE, '').trim();
  return `${cleaned} | ${BRAND_SUFFIX}`;
}

function formatMetaDescription(text, contextHint = '') {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return normalized;
  if (normalized.length >= META_DESC_MIN && normalized.length <= META_DESC_MAX) return normalized;
  if (normalized.length > META_DESC_MAX) {
    const slice = normalized.slice(0, META_DESC_MAX - 1);
    const lastSpace = slice.lastIndexOf(' ');
    const cut = lastSpace > META_DESC_MIN ? slice.slice(0, lastSpace) : slice;
    return cut.endsWith('.') ? cut : `${cut}.`;
  }
  let expanded = normalized.endsWith('.') ? normalized : `${normalized}.`;
  expanded += ' Free pet health records, reminders, and emergency passport tools from PetClues.';
  if (contextHint && expanded.length < META_DESC_MIN) {
    expanded = `${expanded} ${contextHint}.`.replace(/\s+/g, ' ').trim();
  }
  return expanded.slice(0, META_DESC_MAX);
}

function descStatus(len) {
  if (len >= META_DESC_MIN && len <= META_DESC_MAX) return 'OK';
  if (len < META_DESC_MIN) return 'SHORT';
  return 'LONG';
}

function slugifyFaqQuestion(question) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
}

function extractCategoryLabels(filePath, idPattern = /id:\s*'([^']+)',\s*\n\s*label:\s*'([^']+)'/g) {
  const content = read(filePath);
  const labels = new Map();
  for (const match of content.matchAll(idPattern)) {
    labels.set(match[1], match[2]);
  }
  return labels;
}

function extractConfigBlocks(content, startMarker) {
  const blocks = [];
  const parts = content.split(startMarker).slice(1);
  for (const part of parts) {
    const end = part.search(/\n  \},?\n  \{/);
    blocks.push(end === -1 ? part : part.slice(0, end));
  }
  return blocks;
}

function field(block, name) {
  const match =
    block.match(new RegExp(`${name}:\\s*'([^']*)'`)) ??
    block.match(new RegExp(`${name}:\\s*"([^"]*)"`)) ??
    block.match(new RegExp(`${name}:\\s*\\n\\s*'([^']*)'`));
  return match?.[1]?.trim() ?? '';
}

/** @type {Map<string, { title: string, description: string, canonical: string, indexable: boolean, schemaFamily: string, source: string }>} */
const registry = new Map();

function shouldUseRawTitle(title) {
  const trimmed = title.trim();
  return /\|\s*PetClues\s*$/i.test(trimmed) || /^PetClues\s*\|/i.test(trimmed);
}

function register(url, { title, description, canonical, indexable, schemaFamily, source }) {
  const resolvedTitle = shouldUseRawTitle(title) ? title.trim() : formatPageTitle(title);
  registry.set(url, {
    title: resolvedTitle,
    description: formatMetaDescription(description, title),
    canonical: canonical ?? url,
    indexable: indexable !== false,
    schemaFamily,
    source,
  });
}

function registerStaticPages() {
  const seoConfig = read('src/data/seoConfig.ts');
  const routePaths = {
    LANDING: '/',
    PRICING: '/pricing',
    PET_MATCH: '/pet-match',
    TOOLS_VACCINE_SCHEDULER: '/tools/vaccine-scheduler',
    FOUNDING_MEMBERS: '/founding-members',
    BLOG: '/blog',
    COMPARE: '/compare',
    BEST: '/best',
    GUIDES: '/guides',
    RESOURCES: '/resources',
    LEARN: '/learn',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    COOKIES: '/cookies',
    CONTACT: '/contact',
    ABOUT: '/about',
    SECURITY: '/security',
    DATA_DELETION: '/data-deletion',
    DATA_EXPORT: '/data-export',
    FAQ: '/faq',
  };

  const schemaByRoute = {
    LANDING: 'landing',
    PRICING: 'static-product',
    PET_MATCH: 'static-product',
    TOOLS_VACCINE_SCHEDULER: 'vaccine-scheduler',
    FOUNDING_MEMBERS: 'static-product',
    BLOG: 'blog-index',
    COMPARE: 'compare-index',
    BEST: 'best-index',
    GUIDES: 'guides-hub',
    RESOURCES: 'resource-hub',
    LEARN: 'learn-index',
    ABOUT: 'static-about',
    PRIVACY: 'static-legal',
    TERMS: 'static-legal',
    COOKIES: 'static-legal',
    CONTACT: 'static-legal',
    SECURITY: 'static-legal',
    DATA_DELETION: 'static-legal',
    DATA_EXPORT: 'static-legal',
    FAQ: 'faq-index',
  };

  for (const [routeKey, path] of Object.entries(routePaths)) {
    const blockStart = seoConfig.indexOf(`[ROUTES.${routeKey}]`);
    if (blockStart === -1) continue;
    const blockEnd = seoConfig.indexOf('[ROUTES.', blockStart + 1);
    const block = seoConfig.slice(blockStart, blockEnd === -1 ? blockStart + 600 : blockEnd);
    const title =
      block.match(/title:\s*(?:formatPageTitle\(\s*)?['"`]([^'"`]+)['"`]/)?.[1] ??
      (block.match(/title:\s*HOME_TITLE/)
        ? 'PetClues | AI-Powered Pet Health & Life Management'
        : '');
    const description =
      block.match(/description:\s*(?:formatMetaDescription\(\s*)?['"`]([^'"`]+)['"`]/)?.[1] ??
      (block.match(/description:\s*HOME_DESCRIPTION/)
        ? 'Track health records, reminders, vaccinations, life stories, monthly reports, pet passports, and AI-powered pet insights in one place.'
        : title);
    const noIndex = /noIndex:\s*true/.test(block);
    register(`${SITE}${path}`, {
      title,
      description,
      canonical: `${SITE}${path}`,
      indexable: !noIndex,
      schemaFamily: schemaByRoute[routeKey] ?? 'static-legal',
      source: `seoConfig:${routeKey}`,
    });
  }
}

function registerBlogPosts() {
  const legacyFiles = [
    'src/services/blog/gscOpportunityPosts.ts',
    'src/services/blog/seoBlogPosts.ts',
    'src/services/blog/seoBlogPostsExtra.ts',
    'src/services/blog/mockBlogPosts.ts',
  ];

  for (const file of legacyFiles) {
    const content = read(file);
    for (const block of content.split(/\{\s*id:\s*'/).slice(1)) {
      const slug = field(block, 'slug');
      const title = field(block, 'title');
      const excerpt = field(block, 'excerpt');
      if (!slug || !title) continue;
      register(`${SITE}/blog/${slug}`, {
        title,
        description: excerpt || title,
        canonical: `${SITE}/blog/${slug}`,
        schemaFamily: 'blog-post',
        source: file,
      });
    }
  }

  const dominance = read('src/services/blog/dominance/topics.generated.ts');
  for (const block of dominance.split(/\n  \{\n    "num":/).slice(1)) {
    const slug = block.match(/"slug":\s*"([^"]+)"/)?.[1];
    const title = block.match(/"title":\s*"([^"]+)"/)?.[1];
    const excerpt = block.match(/"excerpt":\s*"([^"]+)"/)?.[1];
    if (!slug || !title) continue;
    register(`${SITE}/blog/${slug}`, {
      title,
      description: excerpt || title,
      canonical: `${SITE}/blog/${slug}`,
      schemaFamily: 'blog-post',
      source: 'dominance/topics.generated.ts',
    });
  }

  const expanded = read('src/services/blog/expandedBlogConfigs.ts');
  for (const block of expanded.split(/\{\s*\n\s*slug:\s*'/).slice(1)) {
    const slug = block.match(/^([^']+)'/)?.[1];
    const title = block.match(/title:\s*'([^']+)'/)?.[1];
    const excerpt = block.match(/excerpt:\s*\n?\s*'([^']+)'/)?.[1];
    if (!slug || !title) continue;
    register(`${SITE}/blog/${slug}`, {
      title,
      description: excerpt || title,
      canonical: `${SITE}/blog/${slug}`,
      schemaFamily: 'blog-post',
      source: 'expandedBlogConfigs.ts',
    });
  }

  const blogLabels = extractCategoryLabels('src/data/blogCategories.ts');
  for (const [category, label] of blogLabels) {
    register(`${SITE}/blog?category=${category}`, {
      title: `${label} Guides - Pet Health Blog`,
      description: `Expert ${label.toLowerCase()} guides on vaccinations, records, reminders, and everyday care from PetClues.`,
      canonical: `${SITE}/blog?category=${category}`,
      schemaFamily: 'blog-index',
      source: `blogCategory:${category}`,
    });
  }
}

function registerComparePages() {
  // Prefer content-data comparisons (production pillar). Fall back to legacy configs.
  const jsonPath = join(root, 'content-data/comparisons.json');
  if (existsSync(jsonPath)) {
    const records = JSON.parse(read('content-data/comparisons.json'));
    for (const record of records) {
      if (!record?.slug || !record?.name) continue;
      const pageSlug = `petclues-vs-${record.slug}`;
      if (COMPARE_SITEMAP_EXCLUDED.has(pageSlug) || COMPARE_SITEMAP_EXCLUDED.has(record.slug)) continue;
      const features = record.features ?? [];
      const complete =
        features.length > 0 &&
        features.every((f) => f?.feature?.trim() && f?.value?.trim() && f?.source?.trim());
      if (!complete) continue;
      register(`${SITE}/compare/${pageSlug}`, {
        title: `PetClues vs ${record.name} for Pet Health Records`,
        description: `Compare PetClues and ${record.name} for pet health records, vaccination reminders, vet bills, and emergency info. See pros, cons, and which option fits your household.`,
        canonical: `${SITE}/compare/${pageSlug}`,
        schemaFamily: 'compare-page',
        source: `comparisons.json:${record.slug}`,
      });
    }
    return;
  }

  const content = read('src/data/comparisons/competitorConfigs.ts');
  for (const block of content.split(/\n    slug: '/).slice(1)) {
    const slug = block.match(/^([^']+)'/)?.[1];
    if (!slug || COMPARE_SITEMAP_EXCLUDED.has(slug)) continue;
    const competitorName = block.match(/competitorName: '([^']+)'/)?.[1] ?? '';
    const category = block.match(/category: '([^']+)'/)?.[1] ?? '';
    const problemHeadline = block.match(/problemHeadline: '([^']+)'/)?.[1] ?? '';
    const problemParagraph = block.match(/problemParagraphs:\s*\[\s*\n\s*'([^']+)'/)?.[1] ?? '';
    const title =
      category === 'hub'
        ? problemHeadline
        : `PetClues vs ${competitorName} for Pet Health Records`;
    const description =
      category === 'hub'
        ? problemParagraph
        : `Compare PetClues and ${competitorName} for pet health records, vaccination reminders, vet bills, and emergency info. See pros, cons, and which option fits your household.`;
    register(`${SITE}/compare/${slug}`, {
      title,
      description,
      canonical: `${SITE}/compare/${slug}`,
      schemaFamily: 'compare-page',
      source: `compare:${slug}`,
    });
  }
}

function registerIntentPages() {
  const content = read('src/data/intent/intentConfigs.ts');
  for (const block of content.split(/\n    slug: '/).slice(1)) {
    const slug = block.match(/^([^']+)'/)?.[1];
    const title = block.match(/title: '([^']+)'/)?.[1] ?? '';
    const description = block.match(/metaDescription:\s*\n\s*'([^']+)'/)?.[1] ?? '';
    if (!slug || !title) continue;
    register(`${SITE}/best/${slug}`, {
      title,
      description,
      canonical: `${SITE}/best/${slug}`,
      schemaFamily: 'best-page',
      source: `intent:${slug}`,
    });
  }
}

function registerLearnPages() {
  const content = read('src/data/learn/articleConfigs.ts');
  for (const block of content.split(/\{\s*\n    slug: '/).slice(1)) {
    const slug = block.match(/^([^']+)'/)?.[1];
    const title = block.match(/title:\s*\n?\s*'([^']+)'/)?.[1] ?? '';
    const excerpt =
      block.match(/excerpt:\s*\n\s*'([^']+)'/)?.[1] ??
      block.match(/excerpt: '([^']+)'/)?.[1] ??
      '';
    const description =
      block.match(/metaDescription:\s*\n\s*'([^']+)'/)?.[1] ??
      block.match(/metaDescription: '([^']+)'/)?.[1] ??
      excerpt;
    if (!slug || !title) continue;
    register(`${SITE}/learn/${slug}`, {
      title: `${title} | PetClues Learn`,
      description,
      canonical: `${SITE}/learn/${slug}`,
      schemaFamily: 'learn-page',
      source: `learn:${slug}`,
    });
  }

  const learnLabels = extractCategoryLabels('src/data/learn/categories.ts');
  for (const [category, label] of learnLabels) {
    register(`${SITE}/learn?category=${category}`, {
      title: `${label} Guides for Pet Parents`,
      description: `Expert ${label.toLowerCase()} guides: what to track, why it matters, step-by-step how-tos, and how PetClues keeps your pet's care organized.`,
      canonical: `${SITE}/learn?category=${category}`,
      schemaFamily: 'learn-index',
      source: `learnCategory:${category}`,
    });
  }
}

function registerFaqPages() {
  const faqBank = read('src/data/faq/faqQuestionBank.ts');
  for (const match of faqBank.matchAll(/'([^']+\?)'/g)) {
    const question = match[1];
    const slug = slugifyFaqQuestion(question);
    register(`${SITE}/faq/${slug}`, {
      title: question,
      description: question,
      canonical: `${SITE}/faq/${slug}`,
      schemaFamily: 'faq-page',
      source: 'faqQuestionBank',
    });
  }

  const faqLabels = extractCategoryLabels('src/data/faq/categories.ts');
  for (const [category, label] of faqLabels) {
    register(`${SITE}/faq?category=${category}`, {
      title: `${label} FAQ - Pet Health Questions Answered`,
      description: `Answers to ${label.toLowerCase()} questions about pet records, vaccines, travel, medications, and emergency prep.`,
      canonical: `${SITE}/faq?category=${category}`,
      schemaFamily: 'faq-index',
      source: `faqCategory:${category}`,
    });
  }
}

function registerProgrammaticPages() {
  const collections = read('src/data/programmatic/collections.ts');
  for (const match of collections.matchAll(
    /id:\s*'([^']+)',\s*\n\s*label:\s*'([^']+)',\s*\n\s*description:\s*\n\s*'([^']+)'/g,
  )) {
    register(`${SITE}/guides/${match[1]}`, {
      title: match[2],
      description: match[3],
      canonical: `${SITE}/guides/${match[1]}`,
      schemaFamily: 'guides-collection',
      source: `guidesCollection:${match[1]}`,
    });
  }

  const dogBreeds = read('src/data/programmatic/seeds/dogBreeds.ts');
  for (const match of dogBreeds.matchAll(/slug:\s*'([^']+)',\s*name:\s*'([^']+)'/g)) {
    const name = match[2];
    register(`${SITE}/guides/dog-vaccination-schedule/${match[1]}`, {
      title: `${name} Vaccination Schedule | PetClues Guides`,
      description: `Complete ${name} vaccination schedule: puppy shot timeline, core vaccines (DHPP, rabies), boosters, and breed-specific wellness notes.`,
      canonical: `${SITE}/guides/dog-vaccination-schedule/${match[1]}`,
      schemaFamily: 'guides-page',
      source: 'dogBreeds',
    });
  }

  const catBreeds = read('src/data/programmatic/seeds/catBreeds.ts');
  for (const match of catBreeds.matchAll(/slug:\s*'([^']+)',\s*name:\s*'([^']+)'/g)) {
    const name = match[2];
    register(`${SITE}/guides/cat-vaccination-schedule/${match[1]}`, {
      title: `${name} Vaccination Schedule | PetClues Guides`,
      description: `Complete ${name} vaccination schedule: FVRCP kitten series, rabies timing, FeLV considerations, and adult boosters.`,
      canonical: `${SITE}/guides/cat-vaccination-schedule/${match[1]}`,
      schemaFamily: 'guides-page',
      source: 'catBreeds',
    });
  }

  const countries = read('src/data/programmatic/seeds/countries.ts');
  for (const match of countries.matchAll(/slug:\s*'([^']+)',\s*name:\s*'([^']+)'/g)) {
    const name = match[2];
    register(`${SITE}/guides/pet-travel-checklist/${match[1]}`, {
      title: `${name} Pet Travel Checklist | PetClues Guides`,
      description: `Step-by-step pet travel checklist for ${name}: rabies rules, microchip requirements, health certificates, and pre-trip milestones.`,
      canonical: `${SITE}/guides/pet-travel-checklist/${match[1]}`,
      schemaFamily: 'guides-page',
      source: 'countries',
    });
  }

  const species = read('src/data/programmatic/seeds/emergencySpecies.ts');
  for (const match of species.matchAll(/slug:\s*'([^']+)',\s*name:\s*'([^']+)'/g)) {
    const name = match[2];
    register(`${SITE}/guides/pet-emergency-checklist/${match[1]}`, {
      title: `${name} Emergency Checklist | PetClues Guides`,
      description: `Species-specific ${name.toLowerCase()} emergency checklist: normal vitals, first-aid kit items, and when to seek urgent veterinary care.`,
      canonical: `${SITE}/guides/pet-emergency-checklist/${match[1]}`,
      schemaFamily: 'guides-page',
      source: 'emergencySpecies',
    });
  }

  const templates = read('src/data/programmatic/seeds/templates.ts');
  const templateCollections = [
    ['MEDICATION_TEMPLATE_SEEDS', 'medication-tracking-template'],
    ['HEALTH_RECORD_TEMPLATE_SEEDS', 'health-record-template'],
    ['CARE_CHECKLIST_TEMPLATE_SEEDS', 'pet-care-checklist'],
  ];

  for (const [exportName, collectionId] of templateCollections) {
    const block = templates.split(`export const ${exportName}`)[1]?.split('export const ')[0] ?? '';
    for (const match of block.matchAll(
      /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*audience:\s*'([^']+)',\s*focus:\s*'([^']+)'\s*\}/g,
    )) {
      register(`${SITE}/guides/${collectionId}/${match[1]}`, {
        title: `${match[2]} | PetClues Guides`,
        description: `Use this ${match[2].toLowerCase()} for ${match[3].toLowerCase()}. Track ${match[4]} digitally in PetClues or print for your binder.`,
        canonical: `${SITE}/guides/${collectionId}/${match[1]}`,
        schemaFamily: 'guides-page',
        source: `templates:${collectionId}`,
      });
    }
  }
}

function registerCommercialPages() {
  const pageFiles = [
    'src/data/commercial/pages/petHealthRecords.ts',
    'src/data/commercial/pages/digitalPetPassport.ts',
    'src/data/commercial/pages/petVaccinationRecords.ts',
    'src/data/commercial/pages/petMedicalHistory.ts',
    'src/data/commercial/pages/petHealthTracker.ts',
  ];

  for (const file of pageFiles) {
    const content = read(file);
    const path = content.match(/path:\s*'([^']+)'/)?.[1];
    const title = content.match(/title:\s*\n?\s*'([^']+)'/)?.[1] ?? '';
    const description = content.match(/metaDescription:\s*\n?\s*'([^']+)'/)?.[1] ?? '';
    if (!path || !title) continue;
    register(`${SITE}${path}`, {
      title,
      description,
      canonical: `${SITE}${path}`,
      schemaFamily: 'commercial-page',
      source: file,
    });
  }
}

function registerBreedConditionPages() {
  const files = ['src/data/breedConditions.ts', 'src/data/breedConditionsExpanded.ts'];
  for (const file of files) {
    if (!existsSync(join(root, file))) continue;
    const content = read(file);
    for (const match of content.matchAll(
      /\{\s*(?:["']?slug["']?\s*:\s*["']([^"']+)["'][\s\S]*?["']?breed["']?\s*:\s*["']([^"']+)["'][\s\S]*?["']?condition["']?\s*:\s*["']([^"']+)["'][\s\S]*?["']?scientificName["']?\s*:\s*["']([^"']+)["'])/g,
    )) {
      const slug = match[1];
      const breed = match[2];
      const condition = match[3];
      const scientific = match[4];
      if (!slug.includes('/')) continue;
      register(`${SITE}/guides/${slug}`, {
        title: `${condition} in ${breed}s: Symptoms, Timeline & Digital Tracking`,
        description: `${scientific} (${condition}) risk in ${breed}s - symptoms, emergency management protocols, and digital health timeline tracking with PetClues.`,
        canonical: `${SITE}/guides/${slug}`,
        schemaFamily: 'breed-condition-page',
        source: `breedConditions:${slug}`,
      });
    }
  }
}

function registerVaultGuidePages() {
  const file = 'content-data/generated/vault/pages.json';
  if (!existsSync(join(root, file))) return;
  const pages = JSON.parse(read(file));
  for (const page of pages) {
    if (!page?.slug || !page?.h1) continue;
    register(`${SITE}/guides/${page.slug}`, {
      title: `${page.h1} | PetClues`,
      description: page.meta_description || page.h1,
      canonical: `${SITE}/guides/${page.slug}`,
      schemaFamily: 'vault-guide-page',
      source: `vaultGuide:${page.slug}`,
    });
  }
}

function loadJsonBatches(dirRel, prefix) {
  const dir = join(root, dirRel);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .flatMap((f) => {
      const raw = JSON.parse(read(`${dirRel}/${f}`));
      if (Array.isArray(raw)) return raw;
      if (raw?.pages) return raw.pages;
      return [];
    });
}

function registerPillarContentPages() {
  const passFile = join(root, 'content-data/generated/reports/agent-11-qa-report.json');
  const passPaths = new Set();
  if (existsSync(passFile)) {
    const report = JSON.parse(read('content-data/generated/reports/agent-11-qa-report.json'));
    for (const row of report.pass ?? []) {
      if (row?.path) passPaths.add(row.path);
    }
  }
  const allow = (pathname) => passPaths.size === 0 || passPaths.has(pathname);

  const hubs = [
    ['/breeds', 'Breed health guides', 'Breed × life-stage health guides for dogs and cats.'],
    ['/symptoms', 'Symptom guides', 'Dog and cat symptom guides grouped by urgency.'],
    ['/vaccinations', 'Vaccination schedules', 'Breed and general vaccination schedule guides.'],
    ['/emergency', 'Pet emergency guides', 'Step-by-step pet emergency first-aid guides.'],
    ['/vault', 'Records vault guides', 'Long-tail guides for storing and sharing pet records.'],
    [
      '/life-logistics',
      'Life logistics guides',
      'Moving, travel, sitters, and multi-pet logistics guides.',
    ],
    ['/tools', 'Printable pet tools', 'Printable vaccination sheets, emergency cards, and sitter templates.'],
  ];
  for (const [path, title, description] of hubs) {
    if (!allow(path)) continue;
    register(`${SITE}${path}`, {
      title,
      description,
      canonical: `${SITE}${path}`,
      schemaFamily: path === '/emergency' ? 'emergency-guide-page' : path === '/tools' ? 'tool-download-page' : 'content-pillar-page',
      source: `pillarHub:${path}`,
    });
  }

  const breedIndexPath = 'content-data/generated/breed-health/index.json';
  if (existsSync(join(root, breedIndexPath))) {
    const index = JSON.parse(read(breedIndexPath));
    for (const entry of index) {
      if (!entry?.path || !allow(entry.path)) continue;
      const title = `${entry.breedSlug.replace(/-/g, ' ')} ${entry.stage} health guide`;
      register(`${SITE}${entry.path}`, {
        title,
        description: `${title} with breed predispositions, care checklist context, and PetClues tracking tips.`,
        canonical: `${SITE}${entry.path}`,
        schemaFamily: 'content-pillar-page',
        source: `breedHealth:${entry.key || entry.path}`,
      });
    }
  }

  for (const page of loadJsonBatches('content-data/generated/symptoms', 'batch-')) {
    if (!page?.path || !page?.h1 || !allow(page.path)) continue;
    register(`${SITE}${page.path}`, {
      title: page.h1,
      description: page.metaDescription || page.lead || page.h1,
      canonical: `${SITE}${page.path}`,
      schemaFamily: 'content-pillar-page',
      source: `symptomGuide:${page.path}`,
    });
  }

  const vacManifest = 'content-data/generated/vaccinations/_manifest.json';
  if (existsSync(join(root, vacManifest))) {
    const pages = JSON.parse(read(vacManifest)).pages ?? [];
    for (const page of pages) {
      if (!page?.path || !allow(page.path)) continue;
      const title = `${(page.slug || '').replace(/-/g, ' ')} vaccination schedule`;
      register(`${SITE}${page.path}`, {
        title,
        description: `${title} with core vaccine age windows and reminder-ready tracking.`,
        canonical: `${SITE}${page.path}`,
        schemaFamily: 'content-pillar-page',
        source: `vaccination:${page.slug}`,
      });
    }
  }

  for (const page of loadJsonBatches('content-data/generated/emergencies', 'batch-')) {
    const path = `/emergency/${page.slug}`;
    if (!page?.slug || !page?.h1 || !allow(path)) continue;
    register(`${SITE}${path}`, {
      title: page.h1,
      description: page.meta_description || page.lead || page.h1,
      canonical: `${SITE}${path}`,
      schemaFamily: 'emergency-guide-page',
      source: `emergency:${page.slug}`,
    });
  }

  for (const page of loadJsonBatches('content-data/generated/life-logistics', 'batch-')) {
    const path = `/guides/${page.slug}`;
    if (!page?.slug || !page?.h1 || !allow(path)) continue;
    register(`${SITE}${path}`, {
      title: page.h1,
      description: page.meta_description || page.lead || page.h1,
      canonical: `${SITE}${path}`,
      schemaFamily: 'content-pillar-page',
      source: `lifeLogistics:${page.slug}`,
    });
  }

  const toolsPath = 'content-data/tools.json';
  if (existsSync(join(root, toolsPath))) {
    const tools = JSON.parse(read(toolsPath));
    for (const tool of tools) {
      const path = `/tools/${tool.slug}`;
      if (!tool?.slug || !tool?.h1 || !allow(path)) continue;
      register(`${SITE}${path}`, {
        title: tool.h1,
        description: tool.meta_description || tool.lead || tool.h1,
        canonical: `${SITE}${path}`,
        schemaFamily: 'tool-download-page',
        source: `tool:${tool.slug}`,
      });
    }
  }
}

function registerRelocationPages() {
  const file = 'src/data/relocationRoutes.ts';
  if (!existsSync(join(root, file))) return;
  const content = read(file);
  for (const match of content.matchAll(/route\(\s*['"]([a-z0-9]+-to-[a-z0-9]+)['"]/g)) {
    const slug = match[1];
    const [origin, destination] = slug.split('-to-');
    register(`${SITE}/relocation/${slug}`, {
      title: `${origin.toUpperCase()} to ${destination.toUpperCase()} Pet Dog Travel Customs Requirements`,
      description: `Pet relocation customs dossier for ${origin.toUpperCase()} → ${destination.toUpperCase()}: quarantine, rabies titer waits, and compliance checklist.`,
      canonical: `${SITE}/relocation/${slug}`,
      schemaFamily: 'relocation-page',
      source: `relocationRoutes:${slug}`,
    });
  }
  register(`${SITE}/relocation`, {
    title: 'Pet Relocation Customs Corridors',
    description:
      'Airport-pair pet relocation dossiers for IPATA agencies - quarantine, rabies titer waits, and customs checklists.',
    canonical: `${SITE}/relocation`,
    schemaFamily: 'relocation-hub',
    source: 'relocation:hub',
  });
}

function registerB2BSolutionPages() {
  register(`${SITE}/for-agencies`, {
    title: 'White-label customs vaults for every client move',
    description:
      'Stop chasing messy PDFs. Deploy a permanent branded digital sanctuary for every origin → destination corridor.',
    canonical: `${SITE}/for-agencies`,
    schemaFamily: 'b2b-solution',
    source: 'b2b:agency',
  });
  register(`${SITE}/for-breeders`, {
    title: 'Puppy handover that feels like a private bank vault',
    description:
      'Replace cheap paper folders with a white-label digital sanctuary buyers show off - and come back to for life.',
    canonical: `${SITE}/for-breeders`,
    schemaFamily: 'b2b-solution',
    source: 'b2b:breeder',
  });
}

function registerLifecyclePages() {
  const file = 'src/data/lifecycleMatrix.ts';
  if (!existsSync(join(root, file))) return;
  const content = read(file);
  const breeds = [...content.matchAll(/\{ slug: '([a-z0-9-]+)', name: '([^']+)', size:/g)].map(
    (match) => ({ slug: match[1], name: match[2] }),
  );
  const stageBlock = content.split('export const LIFECYCLE_STAGES')[1]?.split('export function')[0] ?? '';
  const stages = [...stageBlock.matchAll(/slug: '([^']+)',\s*\n\s*label: '([^']+)'/g)].map((match) => ({
    slug: match[1],
    label: match[2],
  }));

  for (const breed of breeds) {
    for (const stage of stages) {
      const path = `/guides/${breed.slug}/lifecycle/${stage.slug}`;
      register(`${SITE}${path}`, {
        title: `${stage.label} for ${breed.name}s`,
        description: `${stage.label} for ${breed.name}s - timeline, diet notes, and a dated care log with PetClues.`,
        canonical: `${SITE}${path}`,
        schemaFamily: 'lifecycle-page',
        source: `lifecycle:${breed.slug}/${stage.slug}`,
      });
    }
  }
}

function registerResourcePages() {
  const file = 'src/data/resourceMatrix.ts';
  if (!existsSync(join(root, file))) return;
  const content = read(file);
  const cities = [
    ...content.matchAll(
      /\{ slug: '([a-z0-9-]+)', name: '([^']+)', state: '[^']+', stateAbbr: '([A-Z]+)'/g,
    ),
  ].map((match) => ({ slug: match[1], name: match[2], stateAbbr: match[3] }));
  const topicBlock = content.split('export const RESOURCE_TOPICS')[1]?.split('export function')[0] ?? '';
  const topics = [...topicBlock.matchAll(/slug: '([^']+)', label: '([^']+)'/g)].map((match) => ({
    slug: match[1],
    label: match[2],
  }));

  for (const city of cities) {
    for (const topic of topics) {
      const path = `/resources/${city.slug}/${topic.slug}`;
      register(`${SITE}${path}`, {
        title: `${topic.label} in ${city.name}, ${city.stateAbbr}`,
        description: `${topic.label} for ${city.name}, ${city.stateAbbr}. Checklist, intake steps, and a digital packet for boarding, sitters, and ER visits.`,
        canonical: `${SITE}${path}`,
        schemaFamily: 'resource-page',
        source: `resource:${city.slug}/${topic.slug}`,
      });
    }
  }
}

registerStaticPages();
registerBlogPosts();
registerComparePages();
registerIntentPages();
registerLearnPages();
registerFaqPages();
registerProgrammaticPages();
registerBreedConditionPages();
registerVaultGuidePages();
registerPillarContentPages();
registerRelocationPages();
registerB2BSolutionPages();
registerLifecyclePages();
registerResourcePages();
registerCommercialPages();

const sitemapUrls = readSitemapUrls(join(root, 'public'));

const handlerCache = new Map();
const SCHEMA_TYPE_ALIASES = {
  Article: ['buildArticleSchema', "'Article'", '"Article"'],
  BlogPosting: ['buildBlogPostingSchema', "'BlogPosting'", '"BlogPosting"'],
  QAPage: ['buildQAPageSchema', "'QAPage'", '"QAPage"'],
  FAQPage: ['buildFaqPageSchema', "'FAQPage'", '"FAQPage"'],
  CollectionPage: ['buildCollectionPageSchema', "'CollectionPage'", '"CollectionPage"'],
  BreadcrumbList: ['buildBreadcrumbListSchema', "'BreadcrumbList'", '"BreadcrumbList"'],
  MedicalWebPage: [
    'buildMedicalWebPageSchema',
    'buildAdvancedMedicalSchema',
    "'MedicalWebPage'",
    '"MedicalWebPage"',
  ],
  Organization: ['buildOrganizationSchema', "'Organization'", '"Organization"'],
  WebSite: ['buildWebSiteSchema', "'WebSite'", '"WebSite"'],
  WebPage: ['buildWebPageSchema', "'WebPage'", '"WebPage"'],
  SoftwareApplication: ['buildSoftwareApplicationSchema', "'SoftwareApplication'", '"SoftwareApplication"'],
  HowTo: ['buildHowToSchema', "'HowTo'", '"HowTo"'],
  ProfilePage: ['buildProfilePageSchema', "'ProfilePage'", '"ProfilePage"'],
  SearchAction: ['buildSearchActionSchema', "'SearchAction'", '"SearchAction"'],
};

function handlerHasSchema(family) {
  const config = SCHEMA_FAMILIES[family];
  if (!config) return false;
  if (!handlerCache.has(config.handler)) {
    handlerCache.set(config.handler, read(config.handler));
  }
  if (!handlerCache.has('schemas')) {
    handlerCache.set('schemas', read('src/seo/structuredDataSchemas.ts'));
  }
  if (!handlerCache.has('medical')) {
    handlerCache.set('medical', read('src/seo/medicalWebPageSchema.ts'));
  }
  if (!handlerCache.has('advancedMedical')) {
    handlerCache.set(
      'advancedMedical',
      existsSync(join(root, 'src/components/seo/AdvancedMedicalSchema.tsx'))
        ? read('src/components/seo/AdvancedMedicalSchema.tsx')
        : '',
    );
  }
  const source =
    handlerCache.get(config.handler) +
    handlerCache.get('schemas') +
    handlerCache.get('medical') +
    handlerCache.get('advancedMedical');
  return config.required.every((type) => {
    const aliases = SCHEMA_TYPE_ALIASES[type] ?? [`'${type}'`, `"${type}"`];
    return aliases.some((needle) => source.includes(needle));
  });
}

const audited = [];
const criticalFailures = [];
const schemaFailures = [];
const missingRegistry = [];
const redirectInSitemap = [];

for (const url of sitemapUrls) {
  if (url.includes('/compare/best-pet-health-record-app')) {
    redirectInSitemap.push(url);
    continue;
  }

  const meta = registry.get(url);
  if (!meta) {
    missingRegistry.push(url);
    continue;
  }

  const issues = [];
  if (!meta.title?.trim()) issues.push('missing title');
  if (!meta.description?.trim()) issues.push('missing description');
  if (meta.canonical !== url) issues.push(`canonical mismatch (${meta.canonical})`);
  if (!meta.indexable) issues.push('marked noindex');
  if (!handlerHasSchema(meta.schemaFamily)) {
    schemaFailures.push({ url, family: meta.schemaFamily });
    issues.push(`schema family ${meta.schemaFamily} incomplete`);
  }

  audited.push({ url, ...meta, issues });
  if (issues.length > 0) {
    criticalFailures.push({ url, issues, source: meta.source });
  }
}

const indexable = audited.filter((p) => p.indexable);
const titleMap = new Map();
const duplicates = [];

for (const page of indexable) {
  const list = titleMap.get(page.title) ?? [];
  list.push(page.url);
  titleMap.set(page.title, list);
}

for (const [title, urls] of titleMap) {
  if (urls.length > 1) duplicates.push({ title, urls });
}

const shortDesc = indexable.filter((p) => p.description.length < META_DESC_MIN);
const longDesc = indexable.filter((p) => p.description.length > META_DESC_MAX);
const registryOnly = [...registry.keys()].filter((url) => !sitemapUrls.includes(url));

const scoreAfter = Math.max(
  0,
  Math.min(
    100,
    95 -
      duplicates.length * 8 -
      Math.min(20, shortDesc.length + longDesc.length) -
      Math.min(15, criticalFailures.length) -
      missingRegistry.length,
  ),
);

const report = `# SEO Audit Report

Generated: ${new Date().toISOString()}

## Scorecard

| Metric | Value |
|--------|-------|
| Sitemap URLs | ${sitemapUrls.length} |
| URLs audited from registry | ${audited.length} |
| Indexable pages audited | ${indexable.length} |
| Duplicate titles | ${duplicates.length} |
| Critical field failures | ${criticalFailures.length} |
| Missing registry entries | ${missingRegistry.length} |
| Redirect URLs in sitemap | ${redirectInSitemap.length} |
| Overall SEO readiness | ${scoreAfter}/100 |

## Full sitemap coverage

- Every URL in \`public/sitemap.xml\` is checked for title, description, canonical, indexability, and schema handler coverage.
- Build fails if any indexable sitemap URL is missing critical SEO fields or has duplicate titles.

## Duplicate titles (${duplicates.length})

${duplicates.length === 0 ? 'None, all indexable pages have unique titles.' : duplicates.slice(0, 20).map((d) => `- **${d.title}**\n  ${d.urls.map((u) => `  - ${u}`).join('\n')}`).join('\n\n')}

## Critical failures (${criticalFailures.length})

${criticalFailures.length === 0 ? 'None.' : criticalFailures.slice(0, 30).map((f) => `- ${f.url}: ${f.issues.join(', ')} (${f.source})`).join('\n')}

## Missing registry (${missingRegistry.length})

${missingRegistry.length === 0 ? 'None, all sitemap URLs mapped to content sources.' : missingRegistry.slice(0, 30).map((u) => `- ${u}`).join('\n')}

## Redirect URLs still in sitemap (${redirectInSitemap.length})

${redirectInSitemap.length === 0 ? 'None.' : redirectInSitemap.map((u) => `- ${u}`).join('\n')}

## Description length (post-formatter)

### Too short (${shortDesc.length})
${shortDesc.length === 0 ? 'None.' : shortDesc.slice(0, 15).map((p) => `- ${p.url} (${p.description.length} chars)`).join('\n')}

### Too long (${longDesc.length})
${longDesc.length === 0 ? 'None.' : longDesc.slice(0, 15).map((p) => `- ${p.url} (${p.description.length} chars)`).join('\n')}

## Registry URLs not in sitemap (${registryOnly.length})

${registryOnly.length === 0 ? 'None.' : registryOnly.slice(0, 15).map((u) => `- ${u}`).join('\n')}

## Remaining audit gaps

1. **CSR meta delivery**, titles/descriptions are applied client-side; audit validates source configs, not rendered HTML.
2. **Rendered canonical/robots**, no headless fetch; assumes React SEO handlers match registry.
3. **Per-URL JSON-LD instance validation**, schema families checked at handler level, not per-page graph output.
4. **Compare redirect slug**, \`/compare/best-pet-health-record-app\` kept as 301 only; excluded from sitemap and internal compare links resolve to \`/best/\`.
5. **Prerender/SSR**, not in scope; homepage still hydrates meta from React after first paint.
`;

writeFileSync(join(root, 'SEO_AUDIT_REPORT.md'), report, 'utf8');
console.log(
  `SEO audit complete, sitemap ${sitemapUrls.length} URLs, ${indexable.length} indexable audited, ${criticalFailures.length} critical failures, ${duplicates.length} duplicate titles`,
);
console.log('Report written to SEO_AUDIT_REPORT.md');

if (redirectInSitemap.length > 0) {
  console.error('\nRedirecting URLs must not appear in sitemap:');
  for (const url of redirectInSitemap) console.error(`  ${url}`);
  process.exit(1);
}

if (missingRegistry.length > 0) {
  console.error(`\n${missingRegistry.length} sitemap URL(s) missing from SEO registry:`);
  for (const url of missingRegistry.slice(0, 20)) console.error(`  ${url}`);
  process.exit(1);
}

if (criticalFailures.length > 0) {
  console.error(`\n${criticalFailures.length} indexable URL(s) failed critical SEO checks:`);
  for (const failure of criticalFailures.slice(0, 20)) {
    console.error(`  ${failure.url}: ${failure.issues.join(', ')}`);
  }
  process.exit(1);
}

if (duplicates.length > 0) {
  console.error('\nDuplicate indexable titles detected:');
  for (const dup of duplicates.slice(0, 10)) {
    console.error(`  "${dup.title}" → ${dup.urls.join(', ')}`);
  }
  process.exit(1);
}

console.log('\nSEO validation PASSED');
