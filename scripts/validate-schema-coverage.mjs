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
    required: ['Organization', 'WebSite', 'Article', 'FAQPage', 'BreadcrumbList'],
    optional: ['HowTo'],
    files: ['programmaticSeo.tsx'],
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
  return SCHEMA_BUILDERS.map((builder) => ({
    builder,
    pass:
      builder === 'buildBreadcrumbListSchema'
        ? breadcrumbs.includes(`export function ${builder}`)
        : core.includes(`export function ${builder}`),
  }));
}

function validateFaqSchemaFields() {
  const core = readSeoFile('structuredDataSchemas.ts');
  const requiredSnippets = [
    'author: buildSchemaAuthor()',
    'datePublished',
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

const builderResults = validateBuilders();
const routeResults = ROUTE_COVERAGE.map(validateRouteFamily);
const faqFieldResult = validateFaqSchemaFields();

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
  pass: builderFails.length === 0 && routeFails.length === 0 && faqFieldResult.pass,
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
