# PetClues Blog Engine Report

**Date:** June 2, 2026  
**Scope:** Blog routes, `blog_posts` table, SEO stack, categories, CMS architecture  
**Build status:** `npm run build` passes (673 modules)

---

## Executive Summary

Implemented a **Blog & SEO infrastructure** to support long-term organic traffic:

- Public routes: `/blog` and `/blog/:slug`
- Supabase-backed `blog_posts` with six seeded articles
- Full SEO layer: metadata, Open Graph, Twitter cards, canonical URLs, JSON-LD
- Six editorial categories aligned with PetClues positioning
- Repository-based CMS architecture ready for headless CMS swap

---

## Phase 1 - Routes

| Route | Page | Access |
|-------|------|--------|
| `/blog` | `BlogIndexPage` | Public |
| `/blog/:slug` | `BlogPostPage` | Public |

**Files:**

- `src/pages/blog/BlogIndexPage.tsx`
- `src/pages/blog/BlogPostPage.tsx`
- `src/App.tsx` - route registration
- `src/routes/paths.ts` - `ROUTES.BLOG`
- `src/components/layout/Footer.tsx` - Resources → Blog link

---

## Phase 2 - `blog_posts` table

**Migration:** `supabase/migrations/20250532200000_blog_posts.sql`

| Column | Type | Notes |
|--------|------|-------|
| `title` | text | Required |
| `slug` | text | Unique |
| `content` | text | Markdown body |
| `excerpt` | text | SEO + cards |
| `category` | text | Check constraint (6 values) |
| `tags` | text[] | Filterable |
| `author` | text | Default `PetClues Team` |
| `published_at` | timestamptz | Public visibility |
| `featured_image` | text | OG image URL |
| `status` | text | `draft` \| `published` |

**RLS:** Public `SELECT` only when `status = 'published'` and `published_at <= now()`.

**Seed:** Six published posts (one per category) for immediate indexable content.

**Types:** `src/types/blog.ts`, `BlogPostRow` in `database.types.ts`

---

## Phase 3 - SEO

### Global stack (extended)

| Component | Role |
|-----------|------|
| `MetaTags` | title, description, robots, canonical, `article:*` |
| `OpenGraph` | og:title, og:description, og:type, og:url, og:image |
| Twitter | summary_large_image, site, title, description, image |
| `blogSeo.tsx` | Blog-specific meta + JSON-LD components |

### Blog index (`/blog`)

- Config: `getBlogIndexSEO()` in `src/seo/blogSeo.tsx`
- Structured data: `Blog` + `blogPost` list (`getBlogIndexStructuredData`)
- Rendered by `BlogIndexSEO` (overrides global `SEOProvider` for blog routes)

### Article pages (`/blog/:slug`)

- Config: `getBlogPostSEO(post)` - `ogType: article`, featured image, keywords
- Canonical: `{VITE_SITE_URL}/blog/{slug}`
- Structured data: `BlogPosting` schema.org JSON-LD
- `SEOProvider` skips global meta on all `/blog*` routes so article SEO wins

### Environment

- `VITE_SITE_URL` - canonical + OG base (defaults to `https://petclues.com` in `seoConfig.ts`)

---

## Phase 4 - Categories

Defined in `src/data/blogCategories.ts`:

| ID | Label |
|----|-------|
| `dog-health` | Dog Health |
| `cat-health` | Cat Health |
| `bird-care` | Bird Care |
| `exotic-pets` | Exotic Pets |
| `pet-records` | Pet Records |
| `petclues-guides` | PetClues Guides |

**UI:** `BlogCategoryNav` chips filter via `?category={id}`  
**Tags:** `?tag={name}` on index (repository filters)

---

## Phase 5 - CMS architecture

**Pattern:** Repository interface + adapters

```
Pages → getBlogRepository() → BlogRepository
                              ├── supabaseBlogRepository (production)
                              └── mockBlogRepository (offline / no env)
```

**Key files:**

| File | Purpose |
|------|---------|
| `src/services/blog/blogRepository.ts` | `BlogRepository` contract |
| `src/services/blog/supabaseBlogRepository.ts` | Supabase adapter |
| `src/services/blog/mockBlogRepository.ts` | Offline adapter + seed parity |
| `src/services/blog/index.ts` | `getBlogRepository()` factory |
| `src/services/blog/cmsArchitecture.ts` | Swap guide for headless CMS |
| `src/services/blog/blogContentRenderer.ts` | Markdown → HTML |

**Future admin CMS:** Optional `create` / `update` / `delete` on repository; service-role edge function or CMS webhook for publish workflow.

---

## Deploy checklist

1. Apply migration: `npx supabase db push` (or project workflow)
2. Set `VITE_SITE_URL` to production domain
3. Submit `/blog` sitemap entry when sitemap generator is added
4. Consider SSR/prerender for crawlers (SPA limitation noted below)

---

## SPA SEO note

Meta and JSON-LD are applied client-side via `useEffect` (consistent with existing `SEOProvider`). For maximum crawler coverage at scale, add prerender/SSR or a sitemap + static generation path in a follow-up.

---

## Test plan

- [ ] Visit `/blog` - six posts, category chips filter
- [ ] Open `/blog/dog-vaccination-schedule-guide` - article layout + OG meta in devtools
- [ ] View page source / Elements - canonical link, `BlogPosting` JSON-LD
- [ ] Offline (no Supabase env) - mock posts still load
- [ ] With Supabase - seed posts from migration appear
- [ ] Footer → Blog link works

---

## Files added / changed (summary)

**New:** migration, blog types/categories, repository layer, blog pages/components, `BlogSEO`, report  
**Updated:** `App.tsx`, `paths.ts`, `seoConfig.ts`, `MetaTags.tsx`, `SEOProvider.tsx`, `Footer.tsx`, `database.types.ts`
