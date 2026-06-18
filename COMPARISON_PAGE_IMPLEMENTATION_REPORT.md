# Comparison Page Implementation Report

**Project:** PetClues  
**Date:** 2026-06-16  
**Status:** Implemented — 50 live comparison URLs + index

---

## Executive summary

PetClues now has a programmatic comparison content system at `/compare` and `/compare/[slug]`. Fifty indexable pages target high-intent queries such as “PetClues vs Google Drive,” “alternative to spreadsheets for pet records,” and “best pet health record app.” Each page includes unique copy, a feature comparison table, pros/cons, audience fit, FAQ schema, internal links, and conversion CTAs.

---

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/compare` | `CompareIndexPage` | Hub listing all 50 comparisons |
| `/compare/:slug` | `ComparePage` | Individual comparison article |

Registered in `src/App.tsx`. SPA rewrites on Vercel serve these as `index.html` + client routing.

---

## Architecture

```
src/
├── types/comparison.ts              # ComparisonPage types
├── data/comparisons/
│   ├── features.ts                  # 10-row comparison feature matrix
│   ├── buildPage.ts                 # Config → page builder + category ratings
│   ├── competitorConfigs.ts         # 50 unique competitor definitions
│   └── index.ts                     # getComparisonBySlug, list, related
├── seo/compareSeo.tsx               # Meta, OG, JSON-LD (FAQ, WebPage, Breadcrumb)
├── components/compare/
│   └── ComparisonTable.tsx          # Table + related comparisons list
└── pages/compare/
    ├── CompareIndexPage.tsx
    └── ComparePage.tsx
```

**Content model:** Each competitor is a `CompetitorConfig` with unique problem statements, intros, pros/cons, FAQs, and cross-links. `buildComparisonPage()` merges category-default feature ratings with optional overrides and produces a full `ComparisonPage`.

**No placeholders:** Every slug has hand-authored paragraphs, three FAQs, and competitor-specific positioning.

---

## Page sections (every `/compare/[slug]`)

1. **Breadcrumbs** — Home → Compare → Competitor (UI + `BreadcrumbList` schema)
2. **Problem** — Headline + 2–3 paragraphs on why generic tools fail for pet health
3. **Comparison** — Intro copy + 10-row feature table (PetClues vs competitor)
4. **Pros & cons** — Four cards (competitor pros/cons, PetClues pros/cons)
5. **Who is each option for?** — Best-fit summaries
6. **Why PetClues exists** — Mission / positioning
7. **FAQ** — 3 Q&As with `FAQPage` schema
8. **Related pet health guides** — Links to `/blog/[slug]`
9. **Related comparisons** — 6 internal `/compare` links
10. **CTA** — Signup + pricing
11. **Health disclaimer**

---

## SEO implementation

| Requirement | Implementation |
|-------------|----------------|
| Unique `<title>` | Per-page `page.title` via `ComparePageSEO` |
| Meta description | Per-page `page.metaDescription` |
| Canonical | `https://petclues.com/compare/{slug}` |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:image` (1200×630 default) |
| Twitter Card | Via shared `OpenGraph` component |
| Keywords | Per-page `keywords[]` joined in meta |
| Indexing | `index, follow` on all compare routes |
| Structured data | `@graph`: Organization, WebPage, FAQPage, BreadcrumbList |
| Sitemap | 51 URLs (`/compare` + 50 slugs) in `public/sitemap.xml` at build |
| `SEOProvider` | Compare routes use dedicated SEO (same pattern as blog) |

**Index hub SEO title:**  
`PetClues Comparisons - Pet Health Apps vs Spreadsheets & Alternatives | PetClues`

---

## Comparison table features

| Feature ID | Label |
|------------|-------|
| `health_records` | Structured pet health records |
| `vaccination_reminders` | Vaccination due-date reminders |
| `medication_reminders` | Medication reminders |
| `vet_bill_storage` | Vet bill & invoice storage |
| `emergency_passport` | Emergency pet passport |
| `multi_pet` | Multi-pet household support |
| `ai_vet_decoder` | AI vet bill decoder |
| `mobile_access` | Mobile-first access |
| `sitter_vet_sharing` | Share with sitters & vets |
| `pet_specific_workflows` | Purpose-built pet workflows |

Ratings: **Strong** / **Limited** / **Not built for this** (from `yes` / `partial` / `no`).

Category defaults apply to spreadsheets, cloud storage, notes, manual, calendar, messaging, pet-apps, vet-tech, insurance, and hub pages.

---

## Internal linking

- Footer **Resources → Compare** (`src/data/footerLinks.ts`)
- Each page: 3 `relatedSlugs` + up to 6 algorithmic related comparisons
- Each page: 3 related blog posts (real slugs from SEO blog catalog)
- Index hub links to all 50 pages

---

## All 50 comparison slugs

| # | Slug | URL |
|---|------|-----|
| 1 | `petclues-vs-google-drive` | https://petclues.com/compare/petclues-vs-google-drive |
| 2 | `petclues-vs-excel` | https://petclues.com/compare/petclues-vs-excel |
| 3 | `petclues-vs-spreadsheets` | https://petclues.com/compare/petclues-vs-spreadsheets |
| 4 | `petclues-vs-petdesk` | https://petclues.com/compare/petclues-vs-petdesk |
| 5 | `petclues-vs-pawtrack` | https://petclues.com/compare/petclues-vs-pawtrack |
| 6 | `petclues-vs-paper-records` | https://petclues.com/compare/petclues-vs-paper-records |
| 7 | `petclues-vs-notes-app` | https://petclues.com/compare/petclues-vs-notes-app |
| 8 | `petclues-vs-notion` | https://petclues.com/compare/petclues-vs-notion |
| 9 | `petclues-vs-dropbox` | https://petclues.com/compare/petclues-vs-dropbox |
| 10 | `petclues-vs-apple-notes` | https://petclues.com/compare/petclues-vs-apple-notes |
| 11 | `petclues-vs-onedrive` | https://petclues.com/compare/petclues-vs-onedrive |
| 12 | `petclues-vs-google-sheets` | https://petclues.com/compare/petclues-vs-google-sheets |
| 13 | `petclues-vs-evernote` | https://petclues.com/compare/petclues-vs-evernote |
| 14 | `petclues-vs-onenote` | https://petclues.com/compare/petclues-vs-onenote |
| 15 | `petclues-vs-airtable` | https://petclues.com/compare/petclues-vs-airtable |
| 16 | `petclues-vs-11pets` | https://petclues.com/compare/petclues-vs-11pets |
| 17 | `petclues-vs-pawprint` | https://petclues.com/compare/petclues-vs-pawprint |
| 18 | `petclues-vs-puppr` | https://petclues.com/compare/petclues-vs-puppr |
| 19 | `petclues-vs-vet-portal` | https://petclues.com/compare/petclues-vs-vet-portal |
| 20 | `petclues-vs-iphone-reminders` | https://petclues.com/compare/petclues-vs-iphone-reminders |
| 21 | `petclues-vs-google-calendar` | https://petclues.com/compare/petclues-vs-google-calendar |
| 22 | `petclues-vs-icloud-drive` | https://petclues.com/compare/petclues-vs-icloud-drive |
| 23 | `petclues-vs-box` | https://petclues.com/compare/petclues-vs-box |
| 24 | `petclues-vs-email-inbox` | https://petclues.com/compare/petclues-vs-email-inbox |
| 25 | `petclues-vs-pdf-folder` | https://petclues.com/compare/petclues-vs-pdf-folder |
| 26 | `petclues-vs-physical-binder` | https://petclues.com/compare/petclues-vs-physical-binder |
| 27 | `petclues-vs-filing-cabinet` | https://petclues.com/compare/petclues-vs-filing-cabinet |
| 28 | `petclues-vs-pen-and-paper` | https://petclues.com/compare/petclues-vs-pen-and-paper |
| 29 | `petclues-vs-fridge-notes` | https://petclues.com/compare/petclues-vs-fridge-notes |
| 30 | `petclues-vs-whatsapp` | https://petclues.com/compare/petclues-vs-whatsapp |
| 31 | `petclues-vs-messenger` | https://petclues.com/compare/petclues-vs-messenger |
| 32 | `petclues-vs-coda` | https://petclues.com/compare/petclues-vs-coda |
| 33 | `petclues-vs-clickup` | https://petclues.com/compare/petclues-vs-clickup |
| 34 | `petclues-vs-trello` | https://petclues.com/compare/petclues-vs-trello |
| 35 | `petclues-vs-day-one` | https://petclues.com/compare/petclues-vs-day-one |
| 36 | `petclues-vs-jour` | https://petclues.com/compare/petclues-vs-jour |
| 37 | `petclues-vs-rover` | https://petclues.com/compare/petclues-vs-rover |
| 38 | `petclues-vs-pet-vault` | https://petclues.com/compare/petclues-vs-pet-vault |
| 39 | `petclues-vs-vitusvet` | https://petclues.com/compare/petclues-vs-vitusvet |
| 40 | `petclues-vs-fuzzy-pet-health` | https://petclues.com/compare/petclues-vs-fuzzy-pet-health |
| 41 | `petclues-vs-airvet` | https://petclues.com/compare/petclues-vs-airvet |
| 42 | `petclues-vs-pumpkin-care` | https://petclues.com/compare/petclues-vs-pumpkin-care |
| 43 | `petclues-vs-healthy-paws` | https://petclues.com/compare/petclues-vs-healthy-paws |
| 44 | `petclues-vs-trupanion` | https://petclues.com/compare/petclues-vs-trupanion |
| 45 | `petclues-vs-barkibu` | https://petclues.com/compare/petclues-vs-barkibu |
| 46 | `petclues-vs-chewy-vet` | https://petclues.com/compare/petclues-vs-chewy-vet |
| 47 | `petclues-vs-pet-parent-planner` | https://petclues.com/compare/petclues-vs-pet-parent-planner |
| 48 | `alternative-to-spreadsheets-pet-records` | https://petclues.com/compare/alternative-to-spreadsheets-pet-records |
| 49 | `alternative-to-google-drive-pet-records` | https://petclues.com/compare/alternative-to-google-drive-pet-records |
| 50 | `best-pet-health-record-app` | https://petclues.com/compare/best-pet-health-record-app |

---

## Target keywords (sample)

| Page | Primary targets |
|------|-----------------|
| `best-pet-health-record-app` | best pet health record app, pet health tracker |
| `alternative-to-spreadsheets-pet-records` | alternative to spreadsheets pet records, better than spreadsheets |
| `petclues-vs-google-drive` | petclues vs google drive, pet records google drive |
| `petclues-vs-excel` | pet health spreadsheet, excel pet records |
| `petclues-vs-petdesk` | petclues vs petdesk, petdesk alternative |
| `petclues-vs-notion` | notion pet health records |
| `petclues-vs-paper-records` | digital pet records vs paper |

---

## Build & sitemap

- `npm run build` runs `scripts/generate-sitemap.mjs`
- Sitemap now includes **97 URLs** (14 static + 6 blog categories + 26 blog posts + 1 compare index + 50 compare slugs)
- Compare slugs extracted from `competitorConfigs.ts` at build time

---

## Post-deploy checklist

- [ ] Deploy to production (Vercel)
- [ ] Request indexing in Google Search Console for `/compare` and top 10 slugs
- [ ] Resubmit `https://petclues.com/sitemap.xml`
- [ ] Validate 3 URLs in [Rich Results Test](https://search.google.com/test/rich-results) (FAQ + Breadcrumb)
- [ ] Share hub link from homepage or blog (optional enhancement)
- [ ] Monitor GSC “Compare” query impressions after 2–4 weeks

---

## Future enhancements (optional)

1. **Code-split** `competitorConfigs.ts` via dynamic `import()` to reduce main bundle (~1.55 MB JS post-build)
2. **Per-page OG images** with competitor name (Vercel OG image API)
3. **Landing page link** in homepage hero to `/compare/best-pet-health-record-app`
4. **CMS migration** — move configs to Supabase or headless CMS when editorial velocity increases
5. **AggregateRating** only when verified user reviews exist

---

## Files changed / added

**New**
- `src/types/comparison.ts`
- `src/data/comparisons/*`
- `src/seo/compareSeo.tsx`
- `src/components/compare/*`
- `src/pages/compare/*`

**Updated**
- `src/App.tsx`
- `src/routes/paths.ts`
- `src/data/seoConfig.ts`
- `src/seo/SEOProvider.tsx`
- `src/data/footerLinks.ts`
- `scripts/generate-sitemap.mjs`
- `public/sitemap.xml` (generated)

---

## Verification

```bash
npm run build   # ✓ passes
```

Manual QA URLs after deploy:
- https://petclues.com/compare
- https://petclues.com/compare/petclues-vs-google-drive
- https://petclues.com/compare/best-pet-health-record-app
