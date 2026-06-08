# SEO Performance Audit

Generated: 2026-06-08

## Scope

Static analysis of build output and known performance factors. Run Lighthouse in Chrome DevTools on production for live Core Web Vitals.

## Asset Inventory

| Asset | Size | Notes |
|-------|------|-------|
| favicon.ico | 285478 bytes | Large ICO — consider optimizing |
| logo.png | 72228 bytes | 512×512 brand logo |
| icon-192.png | 15674 bytes | PWA icon |
| icon-512.png | 72228 bytes | PWA icon |

## Known Factors

### Largest Contentful Paint (LCP)
- Landing hero and fonts from Google Fonts (`Cormorant Garamond`, `Inter`) — preconnect hints present in `index.html`
- **Recommendation:** Self-host fonts or use `font-display: swap` subset to reduce LCP

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
- Blog featured images in `/public/images/blog/` — verify WebP/AVIF variants for large images
- `og-image.png` retained but no longer default OG image

## Build Verification

Run after deploy:
```bash
npm run build
npx lighthouse https://petclues.com --only-categories=performance,seo --chrome-flags="--headless"
```

## Priority Fixes

1. Optimize favicon.ico (currently ~279KB)
2. Add `loading="lazy"` on below-fold blog/landing images if not already present
3. Monitor CWV in GSC → Experience → Core Web Vitals after traffic accumulates
