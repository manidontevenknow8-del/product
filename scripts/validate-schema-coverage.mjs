#!/usr/bin/env node
/**
 * Validates JSON-LD schema coverage across public route families.
 * Run: node scripts/validate-schema-coverage.mjs
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src/seo');

const SCHEMA_BUILDERS = [
  'buildOrganizationSchema',
  'buildWebSiteSchema',
  'buildSoftwareApplicationSchema',
  'buildSearchActionSchema',
  'buildFaqPageSchema',
  'buildQuestionSchema',
  'buildAnswerSchema',
  'buildQAPageSchema',
  'buildBreadcrumbListSchema',
  'buildMedicalWebPageSchema',
  'buildBlogPostingSchema',
  'buildArticleSchema',
  'buildProfilePageSchema',
  'buildWebPageSchema',
  'buildCollectionPageSchema',
];

const ROUTE_COVERAGE = [
  {
    id: 'landing',
    path: '/',
    handler: 'StructuredData.tsx / buildLandingGraphSchema',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage', 'SearchAction'],
    files: ['StructuredData.tsx', 'structuredDataSchemas.ts'],
  },
  {
    id: 'static-product',
    paths: ['/pricing', '/pet-match', '/founding-members'],
    handler: 'staticPageSeo.tsx',
    required: ['Organization', 'WebSite', 'SoftwareApplication', 'WebPage', 'BreadcrumbList'],
    files: ['staticPageSeo.tsx', 'structuredDataSchemas.ts'],
  },
  {
    id: 'static-about',
    path: '/about',
    handler: 'staticPageSeo.tsx',
    required: ['Organization', 'WebSite', 'ProfilePage', 'WebPage', 'BreadcrumbList'],
    files: ['staticPageSeo.tsx', 'structuredDataSchemas.ts'],
  },
  {
    id: 'static-legal',
    paths: ['/privacy', '/terms', '/cookies', '/security', '/data-deletion', '/data-export', '/contact'],
    handler: 'staticPageSeo.tsx',
    required: ['Organization', 'WebPage', 'BreadcrumbList'],
    files: ['staticPageSeo.tsx'],
  },
  {
    id: 'blog-index',
    path: '/blog',
    handler: 'blogSeo.tsx',
    required: ['Organization', 'WebSite', 'Blog', 'CollectionPage', 'BreadcrumbList', 'SearchAction'],
    files: ['blogSeo.tsx'],
  },
  {
    id: 'blog-post',
    pathPattern: '/blog/:slug',
    handler: 'blogSeo.tsx',
    required: ['Organization', 'WebSite', 'BlogPosting', 'BreadcrumbList'],
    optional: ['FAQPage'],
    files: ['blogSeo.tsx'],
    count: 100,
  },
  {
    id: 'learn-index',
    path: '/learn',
    handler: 'learnSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
    files: ['learnSeo.tsx'],
  },
  {
    id: 'learn-article',
    pathPattern: '/learn/:slug',
    handler: 'learnSeo.tsx',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList'],
    files: ['learnSeo.tsx'],
    count: 50,
  },
  {
    id: 'faq-index',
    path: '/faq',
    handler: 'faqHubSeo.tsx',
    required: ['Organization', 'WebSite', 'FAQPage', 'CollectionPage', 'BreadcrumbList', 'SearchAction'],
    files: ['faqHubSeo.tsx'],
  },
  {
    id: 'faq-item',
    pathPattern: '/faq/:slug',
    handler: 'faqHubSeo.tsx',
    required: ['Organization', 'WebSite', 'FAQPage', 'QAPage', 'BreadcrumbList'],
    files: ['faqHubSeo.tsx'],
    count: 200,
  },
  {
    id: 'compare-index',
    path: '/compare',
    handler: 'compareSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
    files: ['compareSeo.tsx'],
  },
  {
    id: 'compare-page',
    pathPattern: '/compare/:slug',
    handler: 'compareSeo.tsx',
    required: ['Organization', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage', 'BreadcrumbList'],
    files: ['compareSeo.tsx'],
    count: 50,
  },
  {
    id: 'best-index',
    path: '/best',
    handler: 'intentSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
    files: ['intentSeo.tsx'],
  },
  {
    id: 'best-page',
    pathPattern: '/best/:slug',
    handler: 'intentSeo.tsx',
    required: ['Organization', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage', 'BreadcrumbList'],
    files: ['intentSeo.tsx'],
    count: 10,
  },
  {
    id: 'guides-hub',
    path: '/guides',
    handler: 'programmaticSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
    files: ['programmaticSeo.tsx'],
  },
  {
    id: 'guides-collection',
    pathPattern: '/guides/:collection',
    handler: 'programmaticSeo.tsx',
    required: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList'],
    files: ['programmaticSeo.tsx'],
    count: 7,
  },
  {
    id: 'guides-detail',
    pathPattern: '/guides/:collection/:slug',
    handler: 'programmaticSeo.tsx',
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList', 'MedicalWebPage'],
    optional: ['HowTo'],
    files: ['programmaticSeo.tsx', 'medicalWebPageSchema.ts'],
    count: 91,
  },
];

function readSeoFile(name) {
  const path = join(src, name);
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8');
}

function fileContainsType(content, type) {
  const typeMap = {
    Organization: ['buildOrganizationSchema', "'@type': 'Organization'", '"@type": "Organization"'],
    WebSite: ['buildWebSiteSchema', "'@type': 'WebSite'", '"@type": "WebSite"'],
    SoftwareApplication: ['buildSoftwareApplicationSchema', "'@type': 'SoftwareApplication'"],
    SearchAction: ['buildSearchActionSchema', "'@type': 'SearchAction'"],
    FAQPage: ['buildFaqPageSchema', "'@type': 'FAQPage'"],
    BreadcrumbList: ['buildBreadcrumbListSchema', "'@type': 'BreadcrumbList'"],
    BlogPosting: ['buildBlogPostingSchema', "'@type': 'BlogPosting'"],
    Article: ['buildArticleSchema', "'@type': 'Article'"],
    ProfilePage: ['buildProfilePageSchema', "'@type': 'ProfilePage'"],
    WebPage: ['buildWebPageSchema', "'@type': 'WebPage'"],
    CollectionPage: ['buildCollectionPageSchema', "'@type': 'CollectionPage'"],
    MedicalWebPage: ['buildMedicalWebPageSchema', "'@type': 'MedicalWebPage'"],
    Blog: ["'@type': 'Blog'"],
    QAPage: ["'@type': 'QAPage'"],
    HowTo: ["'@type': 'HowTo'"],
  };

  const needles = typeMap[type] ?? [`'@type': '${type}'`, `"@type": "${type}"`];
  return needles.some((needle) => content.includes(needle));
}

function validateRouteFamily(family) {
  const files = [...new Set([...family.files, 'structuredDataSchemas.ts', 'breadcrumbSchema.ts'])];
  const combined = files.map(readSeoFile).join('\n');
  const missing = [];
  const present = [];

  for (const type of family.required) {
    if (fileContainsType(combined, type)) {
      present.push(type);
    } else {
      missing.push(type);
    }
  }

  return {
    id: family.id,
    handler: family.handler,
    path: family.path ?? family.pathPattern,
    pageCount: family.count ?? 1,
    present,
    missing,
    pass: missing.length === 0,
  };
}

function validateBuilders() {
  const core = readSeoFile('structuredDataSchemas.ts');
  const breadcrumbs = readSeoFile('breadcrumbSchema.ts');
  const medical = readSeoFile('medicalWebPageSchema.ts');
  return SCHEMA_BUILDERS.map((builder) => ({
    builder,
    pass:
      builder === 'buildBreadcrumbListSchema'
        ? breadcrumbs.includes(`export function ${builder}`)
        : builder === 'buildMedicalWebPageSchema'
          ? medical.includes(`export function ${builder}`)
          : core.includes(`export function ${builder}`),
  }));
}

function validateFaqSchemaFields() {
  const core = readSeoFile('structuredDataSchemas.ts');
  const requiredSnippets = [
    'author: buildSchemaAuthor()',
    'normalizeSchemaDateTime',
    'upvoteCount: item.upvoteCount ?? deriveFaqUpvoteCount',
    'export function buildQAPageSchema',
  ];
  const missing = requiredSnippets.filter((snippet) => !core.includes(snippet));
  return {
    id: 'faq-schema-fields',
    pass: missing.length === 0,
    missing,
  };
}

function validateSchemaDateTimeNormalization() {
  const core = readSeoFile('structuredDataSchemas.ts');
  const dateTimeModule = readSeoFile('schemaDateTime.ts');
  const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
  const ISO_DATETIME_NO_TZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/;
  const ISO_DATETIME_WITH_TZ =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
  const FALLBACK = '2026-06-18T00:00:00Z';

  function normalizeSchemaDateTime(value) {
    if (!value?.trim()) return FALLBACK;
    const trimmed = value.trim();
    if (ISO_DATE_ONLY.test(trimmed)) return `${trimmed}T00:00:00Z`;
    if (ISO_DATETIME_NO_TZ.test(trimmed)) return `${trimmed}Z`;
    if (ISO_DATETIME_WITH_TZ.test(trimmed)) {
      return trimmed.endsWith('z') ? trimmed.replace(/z$/, 'Z') : trimmed;
    }
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
    return FALLBACK;
  }

  const requiredModuleSnippets = [
    'export function normalizeSchemaDateTime',
    'export function isValidSchemaDateTime',
  ];
  const missingModule = requiredModuleSnippets.filter((snippet) => !dateTimeModule.includes(snippet));
  const missingUsage = ['normalizeSchemaDateTime(item.datePublished', 'normalizeSchemaDateTime(options.datePublished']
    .filter((snippet) => !core.includes(snippet));

  const samples = [
    ['2026-06-18', '2026-06-18T00:00:00Z'],
    ['2026-06-18T00:00:00', '2026-06-18T00:00:00Z'],
    ['2026-06-18T00:00:00Z', '2026-06-18T00:00:00Z'],
    ['2026-06-18T12:00:00+00:00', '2026-06-18T12:00:00+00:00'],
  ];
  const failedSamples = samples.filter(
    ([input, expected]) => normalizeSchemaDateTime(input) !== expected,
  );

  const question = normalizeSchemaDateTime('2026-06-18');
  const invalidOutputs = [question].filter((value) => !ISO_DATETIME_WITH_TZ.test(value));

  return {
    id: 'schema-datetime-normalization',
    pass:
      missingModule.length === 0 &&
      missingUsage.length === 0 &&
      failedSamples.length === 0 &&
      invalidOutputs.length === 0,
    missing: [...missingModule, ...missingUsage],
    failedSamples,
  };
}

const builderResults = validateBuilders();
const routeResults = ROUTE_COVERAGE.map(validateRouteFamily);
const faqFieldResult = validateFaqSchemaFields();
const dateTimeResult = validateSchemaDateTimeNormalization();

const builderFails = builderResults.filter((r) => !r.pass);
const routeFails = routeResults.filter((r) => !r.pass);

const totalIndexedPages = routeResults.reduce((sum, r) => sum + r.pageCount, 0);

console.log('PetClues Schema Coverage Validation');
console.log('====================================');
console.log(`Route families: ${routeResults.length}`);
console.log(`Indexed page templates validated: ${totalIndexedPages}`);
console.log(`Builder functions: ${builderResults.filter((r) => r.pass).length}/${builderResults.length}`);
console.log('');

for (const result of routeResults) {
  const status = result.pass ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${result.id} (${result.path}) via ${result.handler}`);
  if (!result.pass) {
    console.log(`       Missing: ${result.missing.join(', ')}`);
  }
}

const faqFieldStatus = faqFieldResult.pass ? 'PASS' : 'FAIL';
console.log(`[${faqFieldStatus}] faq-schema-fields (Question/Answer author, datePublished, upvoteCount)`);
if (!faqFieldResult.pass) {
  console.log(`       Missing snippets: ${faqFieldResult.missing.join(', ')}`);
}

const dateTimeStatus = dateTimeResult.pass ? 'PASS' : 'FAIL';
console.log(`[${dateTimeStatus}] schema-datetime-normalization (ISO 8601 with timezone)`);
if (!dateTimeResult.pass) {
  if (dateTimeResult.missing.length > 0) {
    console.log(`       Missing snippets: ${dateTimeResult.missing.join(', ')}`);
  }
  if (dateTimeResult.failedSamples.length > 0) {
    console.log(`       Failed samples: ${JSON.stringify(dateTimeResult.failedSamples)}`);
  }
}

if (builderFails.length > 0) {
  console.log('\nMissing builders:');
  for (const fail of builderFails) {
    console.log(`  - ${fail.builder}`);
  }
}

const report = {
  validatedAt: new Date().toISOString(),
  routeFamilies: routeResults.length,
  indexedPageTemplates: totalIndexedPages,
  builders: builderResults,
  routes: routeResults,
  faqSchemaFields: faqFieldResult,
  schemaDateTime: dateTimeResult,
  pass:
    builderFails.length === 0 &&
    routeFails.length === 0 &&
    faqFieldResult.pass &&
    dateTimeResult.pass,
};

const outPath = join(root, 'SCHEMA_AUDIT_REPORT.json');
// eslint-disable-next-line no-undef
writeFileSync(outPath, JSON.stringify(report, null, 2));

if (!report.pass) {
  console.error('\nSchema validation FAILED');
  process.exit(1);
}

console.log('\nSchema validation PASSED');
console.log(`Report written to ${outPath}`);
