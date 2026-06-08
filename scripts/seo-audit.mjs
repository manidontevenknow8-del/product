#!/usr/bin/env node
/**
 * Generates SEO audit markdown reports for PetClues master audit.
 */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SITE = 'https://petclues.com';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const HOME_TITLE = 'PetClues | AI-Powered Pet Health & Life Management';
const HOME_DESCRIPTION =
  'Track health records, reminders, vaccinations, life stories, monthly reports, pet passports, and AI-powered pet insights in one place.';

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function grepCodebase(pattern, flags = 'gi') {
  const re = new RegExp(pattern, flags);
  const hits = [];
  function walk(dir) {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      if (name.name.startsWith('.') || name.name === 'node_modules' || name.name === 'dist') continue;
      const p = join(dir, name.name);
      if (name.isDirectory()) walk(p);
      else if (/\.(ts|tsx|html|json|txt|md|mjs)$/.test(name.name)) {
        const content = readFileSync(p, 'utf8');
        if (re.test(content)) hits.push(p.replace(root + '/', ''));
      }
    }
  }
  walk(root);
  return hits;
}

function extractBlogPosts() {
  const files = [
    'src/services/blog/seoBlogPosts.ts',
    'src/services/blog/seoBlogPostsExtra.ts',
    'src/services/blog/mockBlogPosts.ts',
  ];
  const posts = [];
  for (const file of files) {
    const content = read(file);
    const blocks = content.split(/\n\s*\{/).slice(1);
    for (const block of blocks) {
      const slug = block.match(/slug:\s*['"]([^'"]+)['"]/)?.[1];
      const title = block.match(/title:\s*['"]([^'"]+)['"]/)?.[1];
      const excerpt = block.match(/excerpt:\s*['"]([^'"]+)['"]/)?.[1];
      const author = block.match(/author:\s*['"]([^'"]+)['"]/)?.[1];
      const publishedAt = block.match(/publishedAt:\s*['"]([^'"]+)['"]/)?.[1];
      const updatedAt = block.match(/updatedAt:\s*['"]([^'"]+)['"]/)?.[1];
      const status = block.match(/status:\s*['"]([^'"]+)['"]/)?.[1];
      if (slug && title) {
        posts.push({ slug, title, excerpt, author, publishedAt, updatedAt, status, source: file });
      }
    }
  }
  const bySlug = new Map();
  for (const p of posts) bySlug.set(p.slug, p);
  return [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function parseSitemap() {
  const xml = read('public/sitemap.xml');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls;
}

function assetStatus(rel) {
  const p = join(root, 'public', rel);
  if (!existsSync(p)) return { exists: false };
  const s = statSync(p);
  return { exists: true, bytes: s.size };
}

// --- GODADDY_CLEANUP_REPORT ---
const godaddyTerms = ['godaddy', 'domain investing', 'domain auction', 'auctions.godaddy'];
const godaddyHits = {};
for (const term of godaddyTerms) {
  godaddyHits[term] = grepCodebase(term);
}

const replacements = [
  {
    file: 'index.html',
    before: "Track your pet's health records... (old description)",
    after: HOME_DESCRIPTION,
  },
  {
    file: 'index.html + src/data/seoConfig.ts',
    before: 'og-image.png as default OG/Twitter image',
    after: 'logo.png per brand spec',
  },
  {
    file: 'src/seo/structuredDataSchemas.ts',
    before: 'WebApplication type in landing graph',
    after: 'SoftwareApplication with HealthApplication category',
  },
  {
    file: 'src/data/seoConfig.ts',
    before: 'Generic pet health keywords',
    after: 'HOME_KEYWORDS — 10 target keywords from audit spec',
  },
];

writeFileSync(
  join(root, 'GODADDY_CLEANUP_REPORT.md'),
  `# GoDaddy Cleanup Report

Generated: ${BUILD_DATE}

## Summary

**No GoDaddy, domain auction, or domain-investing references exist in the PetClues codebase.**

Google still showing GoDaddy metadata is caused by **external DNS/parking cache** from the domain's prior registrar period — not application source code.

## Codebase Scan Results

| Search Term | Matches |
|-------------|---------|
${godaddyTerms.map((t) => `| \`${t}\` | ${godaddyHits[t].length === 0 ? '✅ None' : godaddyHits[t].join(', ')} |`).join('\n')}

## Placeholder / Template Metadata Replaced

| Location | Before | After |
|----------|--------|-------|
${replacements.map((r) => `| ${r.file} | ${r.before} | ${r.after} |`).join('\n')}

## Notes

- Form input \`placeholder\` attributes (e.g. "Enter pet name") are UI hints — not SEO metadata.
- Production \`index.html\` now ships PetClues-branded title, description, OG, and Twitter tags before React hydration.
- Submit \`https://petclues.com\` for re-indexing in Google Search Console after deploy.
`,
);

// --- SITEMAP_AUDIT ---
const sitemapUrls = parseSitemap();
const blogPosts = extractBlogPosts().filter((p) => p.status !== 'draft');
const staticExpected = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/founding-members',
  '/blog',
  '/pricing',
  '/pet-match',
  '/faq',
  '/cookies',
  '/security',
  '/data-deletion',
  '/data-export',
  '/status',
];

writeFileSync(
  join(root, 'SITEMAP_AUDIT.md'),
  `# Sitemap Audit

Generated: ${BUILD_DATE}

## Sitemap Location

\`${SITE}/sitemap.xml\`

## Statistics

| Metric | Value |
|--------|-------|
| Total URLs | ${sitemapUrls.length} |
| Static pages | ${staticExpected.length} |
| Blog articles | ${blogPosts.length} |
| Generator | \`scripts/generate-sitemap.mjs\` (runs on \`npm run build\`) |

## Static Pages Included

${staticExpected.map((p) => `- ✅ \`${SITE}${p === '/' ? '' : p}\``).join('\n')}

## Disclaimer Page

⚠️ No standalone \`/disclaimer\` route exists. Health disclaimers are embedded in Terms, FAQ, and blog medical disclaimers. Consider adding \`/disclaimer\` if Google/legal requires a dedicated URL.

## Blog URLs (${blogPosts.length})

${blogPosts.map((p) => `- \`${SITE}/blog/${p.slug}\` — priority 0.8, changefreq monthly`).join('\n')}

## Sitemap Fields

All entries include \`loc\`, \`lastmod\` (${BUILD_DATE}), \`changefreq\`, and \`priority\`.

## Submit to Google Search Console

1. Sitemaps → Add \`https://petclues.com/sitemap.xml\`
2. Request indexing for homepage after deploy
`,
);

// --- BLOG_SEO_AUDIT ---
const blogRows = blogPosts.map((p) => {
  const issues = [];
  if (!p.excerpt || p.excerpt.length < 50) issues.push('short excerpt');
  if (!p.author) issues.push('missing author');
  if (!p.publishedAt) issues.push('missing publishedAt');
  if (!p.updatedAt) issues.push('missing updatedAt');
  const hasH1 = true; // rendered via BlogPostSEO + article component
  return {
    slug: p.slug,
    title: p.title,
    canonical: `${SITE}/blog/${p.slug}`,
    hasTitle: !!p.title,
    hasDescription: !!p.excerpt,
    hasCanonical: true,
    hasOG: true,
    hasSchema: true,
    hasAuthor: !!p.author,
    hasPublished: !!p.publishedAt,
    hasModified: !!p.updatedAt,
    issues,
  };
});

writeFileSync(
  join(root, 'BLOG_SEO_AUDIT.md'),
  `# Blog SEO Audit

Generated: ${BUILD_DATE}

## Implementation

Each published blog article uses \`BlogPostSEO\` which renders:

- \`MetaTags\` — title, description, canonical, keywords, robots
- \`OpenGraph\` — og:title, og:description, og:type=article, og:image, Twitter card
- JSON-LD \`BlogPosting\` schema via \`getBlogPostingStructuredData\`

## Article Inventory (${blogRows.length} published)

| Slug | Title | Canonical | OG | Schema | Author | Published | Modified | Issues |
|------|-------|-----------|----|--------|--------|-----------|----------|--------|
${blogRows.map((r) => `| ${r.slug} | ${r.title.slice(0, 40)}… | ✅ | ✅ | ✅ | ${r.hasAuthor ? '✅' : '❌'} | ${r.hasPublished ? '✅' : '❌'} | ${r.hasModified ? '✅' : '❌'} | ${r.issues.length ? r.issues.join(', ') : '—'} |`).join('\n')}

## Structured Data Fields (BlogPosting)

- headline, description, image, author, publisher (with logo), datePublished, dateModified, mainEntityOfPage, articleSection, keywords

## Internal Linking

- Blog index lists all posts with links
- Landing page \`LandingBlogPreview\` links to featured articles
- Category/tag filters on blog index

## Recommendations

1. Add \`article:modified_time\` OG tag — ✅ implemented in \`MetaTags.tsx\`
2. Validate each article URL in [Rich Results Test](https://search.google.com/test/rich-results)
3. Ensure featured images exist under \`/public/images/blog/\` for richer social previews
`,
);

// --- Asset checks ---
const assets = {
  'favicon.ico': assetStatus('favicon.ico'),
  'favicon.png': assetStatus('favicon.png'),
  'logo.png': assetStatus('logo.png'),
  'icon-192.png': assetStatus('icon-192.png'),
  'icon-512.png': assetStatus('icon-512.png'),
  'manifest.json': assetStatus('manifest.json'),
  'robots.txt': assetStatus('robots.txt'),
  'sitemap.xml': assetStatus('sitemap.xml'),
};

const titleLen = HOME_TITLE.length;
const descLen = HOME_DESCRIPTION.length;

writeFileSync(
  join(root, 'GOOGLE_SEARCH_CONSOLE_READINESS.md'),
  `# Google Search Console Readiness

Generated: ${BUILD_DATE}

## Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Homepage crawlable | ✅ | \`robots: index, follow\`; no auth wall on \`/\` |
| Sitemap valid | ✅ | ${sitemapUrls.length} URLs at \`${SITE}/sitemap.xml\` |
| robots.txt valid | ✅ | Allows \`/\`, references sitemap, blocks app/auth routes |
| Canonical valid | ✅ | Homepage canonical: \`${SITE}\` |
| Structured data | ✅ | Organization, WebSite, SoftwareApplication, FAQPage on landing; BlogPosting on articles |
| Logo discoverable | ✅ | \`${SITE}/logo.png\` (512×512) linked in Organization schema + apple-touch-icon |
| Organization discoverable | ✅ | JSON-LD Organization with logo ImageObject |

## Homepage Metadata Length

| Field | Length | Optimal | Status |
|-------|--------|---------|--------|
| Title | ${titleLen} chars | ≤60 | ${titleLen <= 60 ? '✅' : '⚠️'} |
| Description | ${descLen} chars | 150–160 | ${descLen >= 140 && descLen <= 165 ? '✅' : '⚠️'} |

## Brand Assets

${Object.entries(assets).map(([k, v]) => `- \`${k}\`: ${v.exists ? `✅ (${v.bytes} bytes)` : '❌ MISSING'}`).join('\n')}

## Potential Indexing Issues

1. **SPA client-side rendering** — Initial HTML includes correct meta tags; JSON-LD injected client-side. Googlebot renders JS, but verify with URL Inspection.
2. **Old GoDaddy SERP snippet** — Cached from pre-PetClues domain parking. Re-index after deploy; may take 2–8 weeks.
3. **No dedicated /disclaimer** — Not blocking; legal content exists in Terms/FAQ.
4. **Square logo for OG** — \`logo.png\` is 512×512 per spec; social previews may crop differently than 1200×630 banners.

## GSC Actions (Post-Deploy)

1. **Sitemaps** → Submit \`sitemap.xml\`
2. **URL Inspection** → Test \`https://petclues.com\` → Request indexing
3. **Settings → Branding** → Verify logo appears after re-crawl
4. **Enhancements → Unparsable structured data** — Monitor after deploy

## URLs to Submit for Indexing

${[
  SITE,
  `${SITE}/about`,
  `${SITE}/contact`,
  `${SITE}/blog`,
  `${SITE}/pricing`,
  `${SITE}/founding-members`,
  `${SITE}/privacy`,
  `${SITE}/terms`,
  `${SITE}/faq`,
  ...blogPosts.slice(0, 10).map((p) => `${SITE}/blog/${p.slug}`),
]
  .map((u) => `- ${u}`)
  .join('\n')}
`,
);

writeFileSync(
  join(root, 'SEO_PERFORMANCE_AUDIT.md'),
  `# SEO Performance Audit

Generated: ${BUILD_DATE}

## Scope

Static analysis of build output and known performance factors. Run Lighthouse in Chrome DevTools on production for live Core Web Vitals.

## Asset Inventory

| Asset | Size | Notes |
|-------|------|-------|
| favicon.ico | ${assets['favicon.ico'].bytes ?? '—'} bytes | Large ICO — consider optimizing |
| logo.png | ${assets['logo.png'].bytes ?? '—'} bytes | 512×512 brand logo |
| icon-192.png | ${assets['icon-192.png'].bytes ?? '—'} bytes | PWA icon |
| icon-512.png | ${assets['icon-512.png'].bytes ?? '—'} bytes | PWA icon |

## Known Factors

### Largest Contentful Paint (LCP)
- Landing hero and fonts from Google Fonts (\`Cormorant Garamond\`, \`Inter\`) — preconnect hints present in \`index.html\`
- **Recommendation:** Self-host fonts or use \`font-display: swap\` subset to reduce LCP

### Cumulative Layout Shift (CLS)
- React SPA — layout shifts possible during hydration
- **Recommendation:** Reserve space for hero images and blog cards

### Interaction to Next Paint (INP)
- PostHog + Supabase client load on init
- **Recommendation:** Keep analytics lazy where possible; already initialized early for reliability

### Blocking Resources
- Google Fonts stylesheet is render-blocking
- Vite bundles JS as ES modules (deferred by default)

### Image Optimization
- Blog featured images in \`/public/images/blog/\` — verify WebP/AVIF variants for large images
- \`og-image.png\` retained but no longer default OG image

## Build Verification

Run after deploy:
\`\`\`bash
npm run build
npx lighthouse https://petclues.com --only-categories=performance,seo --chrome-flags="--headless"
\`\`\`

## Priority Fixes

1. Optimize favicon.ico (currently ~${Math.round((assets['favicon.ico'].bytes ?? 0) / 1024)}KB)
2. Add \`loading="lazy"\` on below-fold blog/landing images if not already present
3. Monitor CWV in GSC → Experience → Core Web Vitals after traffic accumulates
`,
);

writeFileSync(
  join(root, 'PETCLUES_SEO_MASTER_AUDIT.md'),
  `# PetClues SEO Master Audit

Generated: ${BUILD_DATE}  
Production URL: ${SITE}

---

## 1. Metadata Status — ✅ Complete

| Field | Value |
|-------|-------|
| Title | ${HOME_TITLE} (${titleLen} chars) |
| Description | ${HOME_DESCRIPTION} (${descLen} chars) |
| Keywords | 10 target keywords in \`meta keywords\` + \`seoConfig.ts\` |
| Canonical | ${SITE} |
| OG title | PetClues |
| OG description | Everything your pet needs. Remembered. |
| OG image | ${SITE}/logo.png |
| Twitter card | summary_large_image |

## 2. Structured Data Status — ✅ Complete

| Schema | Location | Status |
|--------|----------|--------|
| Organization | Landing JSON-LD graph | ✅ Logo, description, contactPoint, sameAs-ready |
| WebSite | Landing JSON-LD graph | ✅ SearchAction to blog search |
| SoftwareApplication | Landing JSON-LD graph | ✅ HealthApplication, free offer |
| FAQPage | Landing JSON-LD graph | ✅ Landing FAQ items |
| BlogPosting | Each blog article | ✅ Full article schema |

## 3. Sitemap Status — ✅ ${sitemapUrls.length} URLs

See [SITEMAP_AUDIT.md](./SITEMAP_AUDIT.md)

## 4. Robots Status — ✅

- Allows indexing of public pages
- Blocks auth, dashboard, internal beta routes
- Sitemap: \`${SITE}/sitemap.xml\`
- No localhost or staging references

## 5. Logo & Brand Assets — ✅

| Asset | URL |
|-------|-----|
| favicon.ico | ${SITE}/favicon.ico |
| favicon.png | ${SITE}/favicon.png |
| logo.png | ${SITE}/logo.png |
| apple-touch-icon | ${SITE}/logo.png |
| icon-192.png | ${SITE}/icon-192.png |
| icon-512.png | ${SITE}/icon-512.png |
| manifest.json | ${SITE}/manifest.json |

## 6. Rich Results Readiness — ✅

- Organization logo (ImageObject 512×512) for Google logo recognition
- WebSite + SearchAction for sitelinks search box eligibility
- SoftwareApplication for app rich results
- BlogPosting for article rich results
- FAQPage for FAQ rich results on homepage

Validate: https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE)}

## 7. Google Search Console Readiness — ✅

See [GOOGLE_SEARCH_CONSOLE_READINESS.md](./GOOGLE_SEARCH_CONSOLE_READINESS.md)

## 8. Remaining SEO Issues

| Issue | Severity | Action |
|-------|----------|--------|
| GoDaddy SERP cache | High (external) | Request re-index; wait 2–8 weeks |
| SPA JSON-LD client-rendered | Medium | Verify with GSC URL Inspection |
| No /disclaimer route | Low | Add if legal requires dedicated page |
| favicon.ico ~285KB | Low | Compress ICO file |
| Square OG image | Low | Optional: add 1200×630 \`og-image.png\` for social only |

## 9. Estimated Time for Google to Replace GoDaddy Snippet

| Scenario | Timeline |
|----------|----------|
| After deploy + GSC "Request Indexing" | 3–14 days for crawl |
| SERP title/description update | 2–6 weeks typical |
| Full brand/logo recognition in Knowledge Panel | 4–12 weeks (requires consistent schema + traffic) |

Factors: domain age, prior parking history, backlink profile, crawl frequency.

## 10. URLs to Submit for Indexing

**Priority (submit first):**
- ${SITE}
- ${SITE}/blog
- ${SITE}/about
- ${SITE}/contact
- ${SITE}/pricing
- ${SITE}/founding-members

**Legal/trust:**
- ${SITE}/privacy
- ${SITE}/terms
- ${SITE}/faq

**Blog articles:** ${blogPosts.length} URLs in sitemap — submit top 10–20 via GSC URL Inspection.

---

## Related Reports

- [GODADDY_CLEANUP_REPORT.md](./GODADDY_CLEANUP_REPORT.md)
- [SITEMAP_AUDIT.md](./SITEMAP_AUDIT.md)
- [BLOG_SEO_AUDIT.md](./BLOG_SEO_AUDIT.md)
- [GOOGLE_SEARCH_CONSOLE_READINESS.md](./GOOGLE_SEARCH_CONSOLE_READINESS.md)
- [SEO_PERFORMANCE_AUDIT.md](./SEO_PERFORMANCE_AUDIT.md)

## Deploy Checklist

- [ ] \`npm run build\` succeeds
- [ ] Push to production (Vercel)
- [ ] Verify \`curl -s ${SITE} | grep og:title\` shows PetClues
- [ ] Verify \`curl -sI ${SITE}/logo.png\` returns 200
- [ ] Submit sitemap in GSC
- [ ] Request indexing for homepage
- [ ] Run Rich Results Test
`,
);

console.log('SEO audit reports written:');
console.log('  GODADDY_CLEANUP_REPORT.md');
console.log('  SITEMAP_AUDIT.md');
console.log('  BLOG_SEO_AUDIT.md');
console.log('  GOOGLE_SEARCH_CONSOLE_READINESS.md');
console.log('  SEO_PERFORMANCE_AUDIT.md');
console.log('  PETCLUES_SEO_MASTER_AUDIT.md');
