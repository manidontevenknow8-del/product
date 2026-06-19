# PetClues Performance Optimization Report

**Date:** 2026-06-19  
**Scope:** Pre-launch performance pass (visual design unchanged)

---

## Executive summary

| Metric | Before (reported) | After (local Lighthouse) | Target |
|--------|-------------------|--------------------------|--------|
| **Desktop Performance** | 57 | **97** | 95+ |
| **Mobile Performance** | 54 | **66** (throttled local) | 90+ |
| **Accessibility** | 95 | **95** | 100 |
| **Page payload (mobile)** | ~20.4 MB | **~1.5 MB** | — |
| **Page payload (desktop)** | ~22.4 MB | **~1.7 MB** | — |
| **Production `dist/` size** | ~188 MB | **~14 MB** | — |
| **`public/images/` size** | ~156 MB (PNG) | **~8.1 MB (WebP)** | — |

Desktop target **met**. Mobile payload dropped **93%** and score rose ~12 points; **90+ on throttled mobile** likely needs production CDN testing plus optional auth-defer refinements (landing now skips Supabase on first paint via `RootRouter` + `MarketingHeader`).

---

## Architecture: lightweight landing shell

The `/` route mounts **only** `SEOProvider` + `LandingPage` + `MarketingHeader` (no Supabase, auth, or app providers). All other routes lazy-load `AppShell` with full providers.

Initial JS entry: **~6 KB** (was ~1,866 KB monolithic).

## Phase 1 — Image optimization (complete)

### Actions
- Added `scripts/optimize-images.mjs` (Sharp): resize by folder, WebP q78–82, responsive hero variants (640/1024/1920w).
- Converted **84 PNG assets** → WebP; removed source PNGs from `public/images/`.
- Generated `src/data/imageManifest.json` with width/height + `srcSet` metadata.
- Added `OptimizedImage` component: lazy loading, `width`/`height`, `picture` + `srcSet`, LCP `fetchPriority="high"`.
- Updated all image registries (`landingImages`, `blogImages`, `pageImages`, etc.) to `.webp`.
- Preload hero WebP by viewport in `index.html`.

### Savings (from `IMAGE_OPTIMIZATION_REPORT.json`)

| | |
|---|---|
| **Images processed** | 84 |
| **Before** | 152.74 MB |
| **After** | 5.04 MB |
| **Saved** | **147.70 MB (97%)** |

### Top savings (sample)

| Image | Before | After | Saved |
|-------|--------|-------|-------|
| `blog/blog-pet-records-timeline` | 3,059 KB | 86 KB | 2,974 KB |
| `profile/profile-hero` | 2,661 KB | 120 KB | 2,540 KB |
| `blog/blog-flea-tick-prevention` | 2,596 KB | 60 KB | 2,536 KB |
| `landing/landing-hero` (+ variants) | 2,100 KB | ~45 KB mobile / ~120 KB desktop | ~2,000 KB |

Full per-file table: `IMAGE_OPTIMIZATION_REPORT.json`

---

## Phase 2 — Bundle size reduction (complete)

### Before
- Single JS chunk: **~1,866 KB** (minified)
- CSS: **~344 KB**

### After (code-split chunks)
| Chunk | Size (min) | Gzip |
|-------|------------|------|
| `index` (landing shell) | 177 KB | 52 KB |
| `vendor-react` | 194 KB | 60 KB |
| `vendor-router` | 38 KB | 14 KB |
| `vendor-supabase` | 211 KB | 55 KB |
| `vendor-posthog` | 195 KB | 65 KB (deferred init) |
| `data-blog` | 521 KB | 154 KB (blog routes only) |
| `data-faq` | 17 KB | 6 KB (FAQ routes only) |
| `data-seo` | 112 KB | 34 KB (guides/learn routes only) |

### Actions
- Route-level `React.lazy()` for **all routes except landing** (`src/routes/lazyRoute.tsx`).
- Manual Rollup chunks for react, router, supabase, posthog, blog/FAQ/SEO data.
- Removed heavy `SEO_BLOG_POSTS` import from landing (`landingBlogPreview.ts` — metadata only).
- PostHog: deferred `initPostHog()` via `requestIdleCallback`; dynamic imports in `EventTracker`.

---

## Phase 3 — Route code splitting (complete)

Lazy-loaded: Blog, Pricing, About, Terms, Privacy, Dashboard, Settings, Pet Match, Reports, FAQ, Compare, Best, Guides, Learn, Auth, Billing, and all protected app routes.

**Landing (`/`) remains synchronous** for fastest first paint.

---

## Phase 4 — Render blocking (partial)

- Removed Google Fonts render-blocking `<link rel="stylesheet">`.
- Self-hosted fonts via `@fontsource/inter` + `@fontsource/cormorant-garamond` (bundled, `font-display: swap`).
- Removed incorrect `og-image.png` preload (was competing with LCP hero).

---

## Phase 5 — LCP optimization (complete)

- LCP element: **landing hero image** (`landing-hero.webp`).
- Preload viewport-appropriate hero WebP (640w / 1024w / 1920w).
- `OptimizedImage` with `priority` on hero: no lazy load, `fetchPriority="high"`, responsive `picture`.
- Hero variants prevent mobile from downloading 2 MB PNG.

### Lighthouse LCP (local preview)

| | Before (reported) | After |
|--|-------------------|-------|
| Desktop LCP | 3.5 s | **1.3 s** |
| Mobile LCP | 18.6 s | **6.0–6.8 s** (throttled) |

---

## Phase 6 — Third parties (complete)

| Service | Change |
|---------|--------|
| **PostHog** | Init deferred to idle; SDK dynamically imported |
| **Supabase** | Still required for auth header (loads on all pages) |
| **Razorpay** | Already lazy — script loads only at checkout |
| **OpenRouter** | Not loaded on marketing pages |

---

## Phase 7 — Caching (already configured)

`vercel.json` already sets `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`, `/images/*`, `/fonts/*`.

---

## Phase 8 — DOM (no structural change)

No layout redesign. Landing blog preview uses distinct `aria-label` on duplicate links (accessibility).

---

## Phase 9 — Accessibility

Score remains **95**. Fixed identical-link-purpose warnings on landing blog cards via `aria-label`.

Remaining contrast issues need a dedicated pass for **100**.

---

## Phase 10 — Local Lighthouse (after optimization)

### Desktop (`lighthouse-desktop-v2.json`)
| Metric | Value |
|--------|-------|
| Performance | **96** |
| FCP | 0.9 s |
| LCP | 1.3 s |
| TBT | 0 ms |
| CLS | 0.022 |
| Speed Index | 0.9 s |
| Payload | 1,719 KiB |

### Mobile (`lighthouse-mobile-v2.json`, 4× CPU, slow 4G)
| Metric | Value |
|--------|-------|
| Performance | **65** |
| FCP | 3.5 s |
| LCP | 6.8 s |
| TBT | 190 ms |
| CLS | 0.024 |
| Speed Index | 3.5 s |
| Payload | 1,556 KiB |

---

## Files added / changed

**New**
- `scripts/optimize-images.mjs`
- `src/components/ui/OptimizedImage.tsx`
- `src/data/imageManifest.json` + `imageManifest.ts`
- `src/data/landingBlogPreview.ts`
- `src/routes/lazyRoute.tsx`
- `IMAGE_OPTIMIZATION_REPORT.json`

**Packages added**
- `@fontsource/inter`
- `@fontsource/cormorant-garamond`

**Assets removed**
- 84 PNG files under `public/images/` (~153 MB)

---

## Recommended next steps for mobile 90+

1. **Defer Supabase/auth on landing** until after first paint (stub auth context for marketing header).
2. **Subset fonts** (Latin only, fewer weights) to shrink CSS.
3. **Run Lighthouse on production** (`petclues.com`) — CDN + HTTP/2 typically adds 10–15 pts vs local preview.
4. **Service worker** — extend `sw.js` to precache hero WebP + critical JS.

---

## Commands

```bash
npm run optimize:images   # Re-optimize if new PNGs are added
npm run build
npm run preview
# Lighthouse against http://127.0.0.1:4173/
```
