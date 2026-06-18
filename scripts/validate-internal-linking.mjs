#!/usr/bin/env node
/**
 * Validates internal linking implementation markers.
 * Full graph audit runs at module load in mockBlogPosts.ts during tsc/vite build.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

const blogPostPage = read('src/pages/blog/BlogPostPage.tsx');
const engine = read('src/data/internalLinking/resolveBlogInternalLinks.ts');
const mockBlog = read('src/services/blog/mockBlogPosts.ts');

const checks = [
  {
    name: 'BlogInternalLinks component wired',
    pass: blogPostPage.includes('BlogInternalLinks') && blogPostPage.includes('resolveBlogInternalLinks'),
  },
  {
    name: 'Engine resolves 3 related blogs',
    pass: engine.includes('pickRelatedBlogs') && engine.includes('limit = 3'),
  },
  {
    name: 'Engine includes learn, faq, pricing, homepage',
    pass:
      engine.includes("kind: 'learn'") &&
      engine.includes("kind: 'faq'") &&
      engine.includes("kind: 'pricing'") &&
      engine.includes("kind: 'homepage'"),
  },
  {
    name: 'Build-time orphan audit in mockBlogPosts',
    pass: mockBlog.includes('buildSiteLinkGraph') && mockBlog.includes('orphans.length'),
  },
  {
    name: 'Expanded articles embed link markdown',
    pass: read('src/services/blog/buildBlogArticle.ts').includes('formatBlogInternalLinksMarkdown'),
  },
];

let failed = 0;
console.log('Internal Linking Validation');
console.log('===========================');

for (const check of checks) {
  const status = check.pass ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${check.name}`);
  if (!check.pass) failed += 1;
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log('\nInternal linking validation PASSED (static checks)');
console.log('Full orphan graph audit runs during TypeScript module initialization.');
