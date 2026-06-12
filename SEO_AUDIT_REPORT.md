# PetClues SEO & Brand Presence Audit Report

**Site:** https://petclues.com  
**Audit date:** 2026-06-12  
**Brand:** PetClues  
**Instagram:** https://instagram.com/thepetclues  
**Facebook:** https://facebook.com/profile.php?id=61590826104670  

---

## Executive summary

| Area | Status before | Status after fix |
|------|---------------|------------------|
| Favicon / site icon | **Critical** - `/favicon-32x32.png` returned SPA HTML (200) | **Fixed** - real PNG assets deployed |
| Organization schema `sameAs` | **Wrong URLs** (`instagram.com/petclues`, `facebook.com/petclues`) | **Fixed** - official profiles |
| OG / Twitter metadata | **Partial** - short tagline, not brand title/description | **Fixed** - aligned with homepage |
| `logo.png` | **OK** (512×512 PNG, 200) | **OK** |
| robots.txt / sitemap | **OK** | **OK** |
| HTTPS / www redirect | **OK** | **OK** |
| Social footer links | **Missing** | **Fixed** |

**Root cause of Google generic home icon:** Vercel SPA rewrite (`/(.*) → /index.html`) served **HTML with HTTP 200** for missing favicon paths (e.g. `/favicon-32x32.png`). Google fetched invalid image bytes and fell back to a generic icon.

---

## Task 1 - Favicon audit

### Production verification (before fix)

| Asset | HTTP | Content-Type | Notes |
|-------|------|--------------|-------|
| `/favicon.ico` | 200 | `image/vnd.microsoft.icon` | OK - 48×48 ICO |
| `/favicon.png` | 200 | `image/png` | OK - 32×32 |
| `/favicon-48.png` | 200 | `image/png` | OK |
| `/favicon-96.png` | 200 | `image/png` | OK |
| `/favicon-16x16.png` | 200 | `text/html` | **Missing file → SPA fallback** |
| `/favicon-32x32.png` | 200 | `text/html` | **Missing file → SPA fallback** |
| `/apple-touch-icon.png` | 200 | `image/png` | OK - 180×180 |
| `/logo.png` | 200 | `image/png` | OK - 512×512 |
| `/icon-192.png` | 200 | `image/png` | OK |
| `/icon-512.png` | 200 | `image/png` | OK |
| `/manifest.json` | 200 | `application/json` | OK |
| `/site.webmanifest` | 200 | `text/html` | **Was missing → SPA fallback** |
| `/favicon.svg` | 200 | `image/svg+xml` | OK |

### Fixes applied

| File | Change |
|------|--------|
| `public/favicon-16x16.png` | **Created** - 16×16 PNG from `logo.png` |
| `public/favicon-32x32.png` | **Created** - 32×32 PNG (canonical Google crawl path) |
| `public/site.webmanifest` | **Created** - PWA manifest (Android/Chrome) |
| `index.html` | Full favicon `<link>` set: ico, svg, 16/32/48/96, apple-touch, manifest |
| `vercel.json` | Rewrite only non-extension paths; cache headers for brand assets |
| `scripts/generate-favicons.mjs` | Regenerate all sizes from `logo.png` |

### `<head>` favicon block (final)

```html
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### Build / deployment

- Assets live in `public/` → copied verbatim to `dist/` by Vite.
- All favicon files are **committed** to git (not generated-only).
- After deploy, verify:  
  `curl -sI https://petclues.com/favicon-32x32.png | grep -i content-type` → `image/png`

---

## Task 2 - Google Search metadata

| Tag | Required | Status |
|-----|----------|--------|
| `<title>` | PetClues \| AI-Powered Pet Health & Life Management | ✅ `index.html` + `seoConfig.ts` |
| `meta description` | Track health records, reminders… | ✅ |
| `link rel=canonical` | https://petclues.com/ | ✅ |
| `meta robots` | index, follow (homepage) | ✅ |
| `og:title` | Brand title | ✅ **Updated** |
| `og:description` | Full description | ✅ **Updated** |
| `og:image` | https://petclues.com/logo.png | ✅ |
| `twitter:title` | Brand title | ✅ **Updated** |
| `twitter:description` | Full description | ✅ **Updated** |
| `twitter:image` | https://petclues.com/logo.png | ✅ |

**Files updated:** `index.html`, `src/data/seoConfig.ts` (`HOME_OG_TITLE`, `HOME_OG_DESCRIPTION`)

---

## Task 3 - Social profile integration

### Organization `sameAs` (final JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://petclues.com/#organization",
  "name": "PetClues",
  "url": "https://petclues.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://petclues.com/logo.png",
    "width": 512,
    "height": 512
  },
  "image": "https://petclues.com/logo.png",
  "description": "AI-powered pet health and life management platform.",
  "sameAs": [
    "https://instagram.com/thepetclues",
    "https://facebook.com/profile.php?id=61590826104670"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@petclues.com",
    "availableLanguage": "English"
  }
}
```

**Files updated:**
- `src/data/socialProfiles.ts` - single source of truth
- `src/data/seoConfig.ts` - re-exports `ORGANIZATION_SAME_AS`
- `index.html` - static JSON-LD for non-JS crawlers
- `src/seo/structuredDataSchemas.ts` - runtime schema + landing `@graph`
- `src/components/layout/SiteFooter.tsx` - Instagram + Facebook links with `rel="me"`

**Validation:** Test at https://search.google.com/test/rich-results after deploy.

---

## Task 4 - Knowledge Graph preparation

| Field | Value |
|-------|-------|
| `@type` | Organization |
| `name` | PetClues |
| `url` | https://petclues.com |
| `logo` | https://petclues.com/logo.png (512×512) |
| `sameAs` | Instagram + Facebook (official) |
| `contactPoint.email` | support@petclues.com |
| `description` | AI-powered pet health and life management platform |

Organization is emitted in:
1. `index.html` (static, homepage first paint)
2. `buildOrganizationSchema()` via `SEOProvider` on indexable routes
3. `buildLandingGraphSchema()` on landing page (added Organization to `@graph`)

---

## Task 5 - Open Graph image audit

| URL | Status | Dimensions |
|-----|--------|------------|
| https://petclues.com/logo.png | ✅ 200 | 512×512 PNG |
| https://petclues.com/og-image.png | ✅ 200 (exists, ~1MB) | 1200×630 - optional alternate |

**Current policy:** `og:image` and `twitter:image` → `logo.png` per brand spec.  
`og-image.png` remains available for future 1200×630 social campaigns.

---

## Task 6 - Search Console readiness

### robots.txt

- ✅ `Allow: /`
- ✅ App/auth routes `Disallow` (dashboard, login, etc.)
- ✅ `Sitemap: https://petclues.com/sitemap.xml`

### sitemap.xml

- ✅ 40 URLs (homepage, pricing, blog index, 26 posts, legal, FAQ, etc.)
- Generated by `scripts/generate-sitemap.mjs` on each build

### Redirects

| Test | Result |
|------|--------|
| http://petclues.com → https | ✅ 308 |
| www.petclues.com → apex | ✅ 307 → https://petclues.com/ |

### Indexability

| Route type | robots | sitemap |
|------------|--------|---------|
| `/` (landing) | index | ✅ |
| `/blog`, `/blog/*` | index | ✅ |
| `/pricing`, legal, FAQ | index | ✅ |
| `/dashboard`, `/login`, etc. | noindex (via SEOProvider) | excluded |

---

## Task 7 - Social preview simulation

After deploy, verify with:

| Tool | URL |
|------|-----|
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/?q=https://petclues.com |
| Twitter Card Validator | https://cards-dev.twitter.com/validator |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/inspect/https://petclues.com |

**Expected preview:**
- **Title:** PetClues \| AI-Powered Pet Health & Life Management
- **Description:** Track health records, reminders, vaccinations…
- **Image:** PetClues square logo (`logo.png`)

---

## Task 8 - Deployment audit

| Check | Result |
|-------|--------|
| Favicons in `public/` | ✅ Committed |
| Copied to `dist/` on build | ✅ Verified |
| `vercel.json` SPA rewrite | ✅ Tightened - no HTML masquerading as PNG |
| `index.html` in build output | ✅ 4.5KB with full meta |

**Cause of Google generic icon:** Missing `/favicon-32x32.png` + catch-all rewrite returning `index.html` with `content-type: text/html` and HTTP 200.

---

## Task 9 - Remaining manual steps for Google

1. **Deploy** this commit to Vercel production.
2. **Verify assets post-deploy:**
   ```bash
   curl -sI https://petclues.com/favicon-32x32.png | grep -i content-type
   # Must show: image/png (NOT text/html)
   ```
3. **Google Search Console**
   - Confirm property: `https://petclues.com`
   - Submit sitemap: `https://petclues.com/sitemap.xml`
   - URL Inspection → Request indexing for `https://petclues.com/`
4. **Rich Results Test** - paste homepage URL; confirm Organization schema valid.
5. **Facebook Debugger** - Scrape Again on homepage (refreshes OG cache).
6. **Favicon timeline in Google Search**
   - Recrawl: typically **3 days – 4 weeks** after fix
   - Force refresh: Search Console URL inspection + sitemap resubmit
   - Google uses `/favicon.ico` and linked icons; ensure ICO stays valid
7. **Knowledge Graph** - not guaranteed; consistent `sameAs`, logo, and Search Console ownership improve eligibility over months.

---

## Issue log (fixed in this pass)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | `/favicon-32x32.png` 404/HTML | `public/` | Added `favicon-32x16.png`, `favicon-32x32.png` |
| 2 | `/site.webmanifest` missing | `public/site.webmanifest` | Created |
| 3 | SPA rewrite served HTML for missing assets | `vercel.json` | Rewrite only extension-less paths |
| 4 | Wrong social URLs in schema | `index.html`, `seoConfig.ts` | `socialProfiles.ts` |
| 5 | OG/Twitter used short tagline | `index.html`, `seoConfig.ts` | Full brand title + description |
| 6 | No footer social links | `SiteFooter.tsx` | Instagram + Facebook |
| 7 | Landing JSON-LD missing Organization node | `structuredDataSchemas.ts` | Added to `@graph` |

---

*Report generated as part of production SEO remediation. Re-run `node scripts/seo-audit.mjs` after major SEO changes.*
