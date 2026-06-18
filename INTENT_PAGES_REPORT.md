# Intent Pages Implementation Report

**Project:** PetClues  
**Route:** `/best`  
**Date:** 2026-06-18  
**Status:** Implemented — **10 intent-focused guides** for AI visibility and high-intent search

---

## Executive summary

PetClues now has an intent hub at `/best` with **10 authoritative guides** targeting high-value search queries (e.g. “best pet health record app”, “digital pet passport app”). Each page includes a quick answer for AI snippets, comparison tables, use cases, authoritative citations, FAQs with schema, PetClues positioning, and internal links to blog, learn, compare, and FAQ content.

---

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/best` | `BestIndexPage` | Hub listing all intent guides |
| `/best/:slug` | `BestIntentPage` | Full intent guide with comparisons & FAQs |

**Redirect:** `/compare/best-pet-health-record-app` → `/best/best-pet-health-record-app` (301 in `vercel.json`)

---

## Intent pages (10)

| Slug | Intent label |
|------|----------------|
| `best-pet-health-record-app` | Best pet health record app |
| `best-pet-reminder-app` | Best pet reminder app |
| `best-pet-vaccination-tracker` | Best pet vaccination tracker |
| `digital-pet-passport-app` | Digital pet passport app |
| `pet-medical-record-organizer` | Pet medical record organizer |
| `pet-document-storage-app` | Pet document storage app |
| `pet-care-management-platform` | Pet care management platform |
| `pet-health-tracker` | Pet health tracker |
| `ai-pet-care-app` | AI pet care app |
| `best-app-for-pet-owners` | Best app for pet owners |

---

## Architecture

```
src/
├── types/intentPage.ts
├── data/intent/
│   ├── citations.ts          # AVMA, AAHA, USDA, AKC, CDC, FDA, ASPCA, HSUS
│   ├── buildIntentPage.ts    # Config → IntentPage builder
│   ├── intentConfigs.ts      # 10 intent configs (comparisons, FAQs, links)
│   └── index.ts              # list, getBySlug, related
├── seo/intentSeo.tsx         # Meta, WebPage, FAQPage, ItemList, breadcrumbs
├── components/intent/
│   └── IntentComparisonTable.tsx
└── pages/best/
    ├── BestIndexPage.tsx
    └── BestIntentPage.tsx
```

---

## Page sections (each intent guide)

1. **Quick answer** — concise AI/snippet-ready summary in hero
2. **What to look for** — checklist of evaluation criteria
3. **Comparison table** — 4 alternatives vs PetClues advantage
4. **Use cases** — 4 real-world scenarios
5. **PetClues positioning** — headline, paragraphs, strengths
6. **Authoritative citations** — external links (AVMA, AAHA, etc.)
7. **FAQs** — 5 questions with FAQPage schema
8. **Related resources** — compare, blog, learn, FAQ internal links
9. **Related guides** — cross-links to other intent pages
10. **CTA** — signup + pricing

---

## Requirements checklist

| Requirement | Implementation |
|-------------|----------------|
| 10 intent targets | `intentConfigs.ts` with runtime count guard |
| Comparisons | `IntentComparisonTable` — 4 options per page |
| FAQs | 5 per page; `FAQPage` JSON-LD |
| Authoritative citations | `citations.ts` — 8 authority sources |
| AI visibility (quick answer) | Hero `quickAnswer` on every page |
| Structured data | WebPage, FAQPage, ItemList, BreadcrumbList, SoftwareApplication |
| SEO metadata | Dedicated `intentSeo.tsx`; global SEO deferred on `/best` routes |
| Internal links | Related compare, blog, learn, FAQ, and intent slugs |
| Sitemap | 11 URLs (1 hub + 10 guides) |
| Footer link | “Best” in `FOOTER_RESOURCE_LINKS` |

**Sitemap total after build:** 453 URLs (site-wide).

---

## SEO & indexing

- `ROUTES.BEST` added to `INDEXABLE_PUBLIC_ROUTES`
- `isBestPath()` / `isBestArticlePath()` in `seoConfig.ts`
- `SEOProvider` treats `/best` as dedicated SEO route (no duplicate global meta)
- Sitemap priority: hub `0.88`, guides `0.82`

---

## Relationship to `/compare`

- **Compare pages** (`/compare/:slug`) — head-to-head PetClues vs one competitor (50 pages)
- **Intent pages** (`/best/:slug`) — category “best of” guides with multi-option comparison tables (10 pages)
- Overlap: `best-pet-health-record-app` exists in both; compare URL redirects to canonical intent page

---

## Build verification

```
npm run build
```

- TypeScript: pass
- Vite build: pass
- Sitemap: 453 URLs (10 intent guides included)

---

## Files changed / added

**New:**
- `src/types/intentPage.ts`
- `src/data/intent/*`
- `src/seo/intentSeo.tsx`
- `src/components/intent/IntentComparisonTable.tsx`
- `src/pages/best/BestIndexPage.tsx`
- `src/pages/best/BestIntentPage.tsx`

**Updated:**
- `src/routes/paths.ts` — `ROUTES.BEST`
- `src/App.tsx` — routes
- `src/data/seoConfig.ts` — indexing helpers
- `src/seo/SEOProvider.tsx` — defer global SEO
- `src/data/footerLinks.ts` — footer link
- `scripts/generate-sitemap.mjs` — intent slugs
- `vercel.json` — compare → best redirect
