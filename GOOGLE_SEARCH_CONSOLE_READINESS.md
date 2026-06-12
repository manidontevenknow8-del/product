# Google Search Console Readiness

Generated: 2026-06-08

## Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Homepage crawlable | ✅ | `robots: index, follow`; no auth wall on `/` |
| Sitemap valid | ✅ | 41 URLs at `https://petclues.com/sitemap.xml` |
| robots.txt valid | ✅ | Allows `/`, references sitemap, blocks app/auth routes |
| Canonical valid | ✅ | Homepage canonical: `https://petclues.com` |
| Structured data | ✅ | Organization, WebSite, SoftwareApplication, FAQPage on landing; BlogPosting on articles |
| Logo discoverable | ✅ | `https://petclues.com/logo.png` (512×512) linked in Organization schema + apple-touch-icon |
| Organization discoverable | ✅ | JSON-LD Organization with logo ImageObject |

## Homepage Metadata Length

| Field | Length | Optimal | Status |
|-------|--------|---------|--------|
| Title | 50 chars | ≤60 | ✅ |
| Description | 134 chars | 150–160 | ⚠️ |

## Brand Assets

- `favicon.ico`: ✅ (285478 bytes)
- `favicon.png`: ✅ (1701 bytes)
- `logo.png`: ✅ (72228 bytes)
- `icon-192.png`: ✅ (15674 bytes)
- `icon-512.png`: ✅ (72228 bytes)
- `manifest.json`: ✅ (618 bytes)
- `robots.txt`: ✅ (748 bytes)
- `sitemap.xml`: ✅ (7610 bytes)

## Potential Indexing Issues

1. **SPA client-side rendering** - Initial HTML includes correct meta tags; JSON-LD injected client-side. Googlebot renders JS, but verify with URL Inspection.
2. **Old GoDaddy SERP snippet** - Cached from pre-PetClues domain parking. Re-index after deploy; may take 2–8 weeks.
3. **No dedicated /disclaimer** - Not blocking; legal content exists in Terms/FAQ.
4. **Square logo for OG** - `logo.png` is 512×512 per spec; social previews may crop differently than 1200×630 banners.

## GSC Actions (Post-Deploy)

1. **Sitemaps** → Submit `sitemap.xml`
2. **URL Inspection** → Test `https://petclues.com` → Request indexing
3. **Settings → Branding** → Verify logo appears after re-crawl
4. **Enhancements → Unparsable structured data** - Monitor after deploy

## URLs to Submit for Indexing

- https://petclues.com
- https://petclues.com/about
- https://petclues.com/contact
- https://petclues.com/blog
- https://petclues.com/pricing
- https://petclues.com/founding-members
- https://petclues.com/privacy
- https://petclues.com/terms
- https://petclues.com/faq
- https://petclues.com/blog/best-pet-health-tracker-app-2026
- https://petclues.com/blog/bird-care-health-routine
- https://petclues.com/blog/cat-health-records-checklist
- https://petclues.com/blog/cat-vaccination-schedule-guide
- https://petclues.com/blog/dog-dental-care-schedule-cleanings-reminders
- https://petclues.com/blog/dog-feeding-schedule-walk-tracker
- https://petclues.com/blog/dog-vaccination-schedule-guide
- https://petclues.com/blog/dog-weight-tracker-log-trends-vet-health
- https://petclues.com/blog/exotic-pet-records-guide
- https://petclues.com/blog/flea-tick-prevention-calendar-pets
