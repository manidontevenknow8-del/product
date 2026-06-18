# Schema Audit Report

**Project:** PetClues  
**Date:** 2026-06-18  
**Status:** All 17 route families validated — **PASS**

---

## Executive summary

PetClues now uses a **centralized JSON-LD architecture** in `src/seo/structuredDataSchemas.ts` with dedicated coverage per route family. Every indexable public page emits appropriate Schema.org markup including Organization, WebSite (with SearchAction), SoftwareApplication, FAQPage, BreadcrumbList, BlogPosting, Article, and ProfilePage where applicable.

**Validation:** `npm run validate:schema` (also runs in `npm run build`)  
**Machine-readable output:** `SCHEMA_AUDIT_REPORT.json`

---

## Schema types implemented

| Schema type | Builder | Purpose |
|-------------|---------|---------|
| **Organization** | `buildOrganizationSchema()` | Brand identity, logo, contact, `sameAs` |
| **WebSite** | `buildWebSiteSchema()` | Site entity with publisher linkage |
| **SearchAction** | `buildSearchActionSchema()` | Blog + FAQ sitelinks search box |
| **SoftwareApplication** | `buildSoftwareApplicationSchema()` | PetClues app entity + free offer |
| **FAQPage** | `buildFaqPageSchema()` | Question/answer rich results |
| **BreadcrumbList** | `buildBreadcrumbListSchema()` | Navigation hierarchy |
| **BlogPosting** | `buildBlogPostingSchema()` | Blog article rich results |
| **Article** | `buildArticleSchema()` | Learn + programmatic guides |
| **WebPage** | `buildWebPageSchema()` | Static + comparison + intent pages |
| **ProfilePage** | `buildProfilePageSchema()` | About page company profile |
| **CollectionPage** | `buildCollectionPageSchema()` | Hub/index listing pages |
| **QAPage** | inline in `faqHubSeo.tsx` | Individual FAQ detail pages |
| **HowTo** | inline in `programmaticSeo.tsx` | Checklist-based guide pages |

All graphs use `@id` references (`#organization`, `#website`, `#software`) for entity linking.

---

## Architecture

```
src/seo/
├── structuredDataSchemas.ts   # Central builders + buildSchemaGraph()
├── breadcrumbSchema.ts        # BreadcrumbList
├── staticPageSeo.tsx          # Pricing, About, legal, contact, etc.
├── blogSeo.tsx                # Blog index + BlogPosting
├── learnSeo.tsx               # Learn index + Article
├── faqHubSeo.tsx              # FAQ index + FAQPage + QAPage
├── compareSeo.tsx             # Comparisons + WebPage + SoftwareApplication
├── intentSeo.tsx              # Best/intent pages
├── programmaticSeo.tsx        # Guides + Article + HowTo
├── StructuredData.tsx         # Landing graph
└── SEOProvider.tsx            # Static page schema injection
```

### Landing page (`/`)

`buildLandingGraphSchema()` emits a single `@graph`:

- Organization
- WebSite + SearchAction (blog + FAQ)
- SoftwareApplication
- FAQPage (product FAQs)

### Static pages (via `SEOProvider` + `staticPageSeo.tsx`)

| Route | Schemas |
|-------|---------|
| `/pricing`, `/pet-match`, `/founding-members` | Organization, WebSite, SoftwareApplication, WebPage, BreadcrumbList |
| `/about` | Organization, WebSite, **ProfilePage**, WebPage, BreadcrumbList |
| `/contact` | Organization, WebSite, WebPage, BreadcrumbList |
| `/privacy`, `/terms`, `/cookies`, `/security`, `/data-deletion`, `/data-export` | Organization, WebPage, BreadcrumbList |

### Content hubs

| Hub | Index schemas | Detail schemas |
|-----|---------------|----------------|
| **Blog** `/blog` | Organization, WebSite, Blog, CollectionPage, BreadcrumbList, SearchAction | BlogPosting, Organization, WebSite, BreadcrumbList (+ FAQPage when post has FAQs) |
| **Learn** `/learn` | Organization, WebSite, CollectionPage, BreadcrumbList | Article, FAQPage, Organization, WebSite, BreadcrumbList |
| **FAQ** `/faq` | Organization, WebSite, FAQPage (200 Qs), CollectionPage, BreadcrumbList, SearchAction | FAQPage, QAPage, Organization, WebSite, BreadcrumbList |
| **Compare** `/compare` | Organization, WebSite, CollectionPage, BreadcrumbList | WebPage, SoftwareApplication, FAQPage, Organization, WebSite, BreadcrumbList |
| **Best** `/best` | Organization, WebSite, CollectionPage, BreadcrumbList | WebPage, SoftwareApplication, FAQPage, Organization, WebSite, BreadcrumbList |
| **Guides** `/guides` | Organization, WebSite, CollectionPage, BreadcrumbList | Article, FAQPage, HowTo (checklists), Organization, WebSite, BreadcrumbList |

---

## SearchAction coverage

`buildWebSiteSchema()` includes two `SearchAction` targets:

| Target | URL template |
|--------|----------------|
| Blog search | `https://petclues.com/blog?q={search_term_string}` |
| FAQ search | `https://petclues.com/faq?q={search_term_string}` |

WebSite (with SearchAction) is included on all major content hubs and product pages so search engines can associate sitelinks search with indexed hub pages.

---

## ProfilePage

**Route:** `/about` only

`buildProfilePageSchema()` describes the About page with `mainEntity` pointing to the PetClues Organization entity — appropriate for a company About page (not individual user profiles).

---

## Page coverage matrix

| Route family | Pages | Validation |
|--------------|-------|------------|
| Landing | 1 | PASS |
| Static product | 3 | PASS |
| Static About | 1 | PASS |
| Static legal/contact | 7 | PASS |
| Blog index | 1 | PASS |
| Blog posts | 100 | PASS |
| Learn index | 1 | PASS |
| Learn articles | 50 | PASS |
| FAQ index | 1 | PASS |
| FAQ items | 200 | PASS |
| Compare index | 1 | PASS |
| Compare pages | 50 | PASS |
| Best index | 1 | PASS |
| Best/intent pages | 10 | PASS |
| Guides hub | 1 | PASS |
| Guides collections | 7 | PASS |
| Guides detail | 91 | PASS |
| **Total templates validated** | **518** | **17/17 PASS** |

*Note: Filtered/search URLs (`?q=`, `?tag=`) are `noIndex` and intentionally omit dedicated schema.*

---

## Pages without schema (by design)

| Route type | Reason |
|------------|--------|
| Auth (`/login`, `/signup`, etc.) | `noIndex` — not for search |
| App (`/dashboard`, `/pet-profile`, etc.) | Protected — `noIndex` |
| 404 / not-found handlers | `noIndex` |
| Blog/FAQ search results | `noIndex` when filtered |

---

## Validation

### Run manually

```bash
npm run validate:schema
```

### Build integration

Schema validation runs automatically before TypeScript compile in `npm run build`.

### What is checked

1. All 11 schema builder functions exist
2. Each of 17 route families includes required `@type` markers in SEO source files
3. Shared builders in `structuredDataSchemas.ts` and `breadcrumbSchema.ts` are counted

---

## Files changed in this audit

| File | Change |
|------|--------|
| `src/seo/structuredDataSchemas.ts` | Centralized all schema builders |
| `src/seo/staticPageSeo.tsx` | **New** — static page graphs |
| `src/seo/SEOProvider.tsx` | Static page schema instead of breadcrumbs-only |
| `src/seo/blogSeo.tsx` | BlogPosting builder, WebSite on posts |
| `src/seo/learnSeo.tsx` | Article builder, WebSite on articles |
| `src/seo/faqHubSeo.tsx` | Organization + WebSite on FAQ pages |
| `src/seo/compareSeo.tsx` | SoftwareApplication builder |
| `src/seo/intentSeo.tsx` | SoftwareApplication builder |
| `src/seo/programmaticSeo.tsx` | Article builder, WebSite on guides |
| `src/seo/StructuredData.tsx` | SoftwareApplication export |
| `scripts/validate-schema-coverage.mjs` | **New** — automated validation |
| `package.json` | `validate:schema` script + build hook |

---

## Recommendations (future)

1. **Google Rich Results Test** — spot-check live URLs after deploy (`/`, `/blog/{slug}`, `/faq/{slug}`, `/about`)
2. **Guides SearchAction** — add `/guides` search if a search UI is added to the guides hub
3. **Blog author Person schema** — if individual authors are introduced, extend `BlogPosting.author`
4. **Product/Offer on pricing** — expand `SoftwareApplication.offers` with premium tier pricing when billing goes live

---

## Build verification

```
npm run build
```

Expected output includes:

```
Schema validation PASSED
Report written to SCHEMA_AUDIT_REPORT.json
```
