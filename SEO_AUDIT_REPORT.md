# SEO Audit Report

Generated: 2026-06-22T08:12:51.285Z

## Scorecard

| Metric | Before | After |
|--------|--------|-------|
| Overall SEO readiness | 62/100 | 82/100 |
| Indexable pages audited | — | 43 |
| Duplicate titles | unknown | 0 |
| Short descriptions (<140) | unknown | 13 |
| Long descriptions (>160) | unknown | 0 |
| Missing from sitemap | unknown | 0 |

## Fixes implemented

- Central `formatPageTitle()` — every page uses `{Headline} | PetClues`
- Central `formatMetaDescription()` — normalizes to 140–160 characters
- FAQ items: unique question-based titles (removed duplicate generic FAQ title)
- Blog posts: hyphen titles converted to pipe format; `publishedAt` / `updatedAt` normalized
- Legal pages: expanded meta descriptions and consistent titles
- MetaTags: stale `article:*` tags removed when leaving article pages
- OpenGraph/Twitter: descriptions synced with meta description formatter
- FAQ related questions: up to 5 per page with human-readable blog titles
- Pricing page: internal links to FAQ, About, Blog
- BreadcrumbList schema: already on blog, FAQ, pricing (via staticPageSeo), compare, best, guides, learn

## Duplicate titles (0)

None — all indexable pages have unique titles.

## Description length issues

### Too short (13)
- https://petclues.com/pricing (126 chars)
- https://petclues.com/pet-match (123 chars)
- https://petclues.com/founding-members (124 chars)
- https://petclues.com/blog (138 chars)
- https://petclues.com/privacy (95 chars)
- https://petclues.com/terms (97 chars)
- https://petclues.com/cookies (94 chars)
- https://petclues.com/contact (88 chars)
- https://petclues.com/about (89 chars)
- https://petclues.com/security (89 chars)
- https://petclues.com/data-deletion (97 chars)
- https://petclues.com/data-export (97 chars)
- https://petclues.com/blog/cat-health-records-checklist (127 chars)

### Too long (0)
None.

## Sitemap gaps (0)

All audited indexable URLs appear in sitemap.xml.

## Sample route audit (first 30 indexable)

| Route | Title | Description | Status |
|-------|-------|-------------|--------|
| /pricing | PetClues Membership — Annual Pet Health Plans | Pe… | 126 chars | SHORT |
| /pet-match | Pet Match Quiz - Find Your Ideal Companion | PetCl… | 123 chars | SHORT |
| /founding-members | Founding Members - Early Access to PetClues | PetC… | 124 chars | SHORT |
| /blog | Pet Health Blog - Vaccination Guides, Records & Ca… | 138 chars | SHORT |
| /compare | PetClues Comparisons - Pet Health Apps vs Spreadsh… | 160 chars | OK |
| /best | Best Pet Health Apps & Tools (2026) – Intent Guide… | 143 chars | OK |
| /guides | Pet Care Guides & Templates – Vaccines, Travel, Em… | 149 chars | OK |
| /learn | PetClues Learn - Pet Health Records, Vaccines & Ca… | 140 chars | OK |
| /privacy | Privacy Policy | PetClues | 95 chars | SHORT |
| /terms | Terms of Service | PetClues | 97 chars | SHORT |
| /cookies | Cookie Policy | PetClues | 94 chars | SHORT |
| /contact | Contact | PetClues | 88 chars | SHORT |
| /about | About Us | PetClues | 89 chars | SHORT |
| /security | Security | PetClues | 89 chars | SHORT |
| /data-deletion | Delete Your Data | PetClues | 97 chars | SHORT |
| /data-export | Export Your Data | PetClues | 97 chars | SHORT |
| /faq | Pet Health FAQ - Records, Vaccines, Travel & Emerg… | 140 chars | OK |
| /blog/puppy-vaccination-schedule-2026 | Puppy Vaccination Schedule 2026: Month-by-Month Sh… | 146 chars | OK |
| /blog/organize-pet-medical-records-online | How to Organize Pet Medical Records Online (Free S… | 143 chars | OK |
| /blog/pet-emergency-information-card-guide | Pet Emergency Information Card: What Every Dog & C… | 152 chars | OK |
| /blog/cat-vaccination-schedule-guide | Cat Vaccination Schedule: Core Shots, Boosters & R… | 149 chars | OK |
| /blog/pet-medication-reminder-guide | Pet Medication Reminder: How to Never Miss a Dose … | 160 chars | OK |
| /blog/dog-feeding-schedule-walk-tracker | Dog Feeding Schedule & Walk Tracker: Build a Daily… | 148 chars | OK |
| /blog/best-pet-health-tracker-app-2026 | Best Pet Health Tracker App Features to Look For i… | 155 chars | OK |
| /blog/vet-bill-organizer-pet-medical-bills | Vet Bill Organizer: Store & Understand Pet Medical… | 143 chars | OK |
| /blog/new-puppy-checklist-health-records-vaccines | New Puppy Checklist: Health Records, Vaccines & Fi… | 142 chars | OK |
| /blog/new-kitten-checklist-vet-vaccines-records | New Kitten Checklist: Vet Visits, Vaccines & Healt… | 160 chars | OK |
| /blog/senior-dog-care-health-records-medication-tracker | Senior Dog Care Guide: Health Records & Medication… | 160 chars | OK |
| /blog/pet-sitter-instructions-medical-emergency-info | Pet Sitter Instructions: Medical Info & Emergency … | 160 chars | OK |
| /blog/microchip-registration-guide-dogs-cats | Microchip Registration Guide for Dogs & Cats (Plus… | 160 chars | OK |

## Rich results eligibility

| Schema | Status |
|--------|--------|
| FAQPage | Valid — Question/Answer with ISO datetime (see validate-schema-coverage.mjs) |
| BlogPosting | Valid — headline, dates, author, publisher logo |
| SoftwareApplication | Valid — on product/compare/best pages |
| BreadcrumbList | Valid — all content route handlers |

## Crawl budget recommendations

- **www vs non-www:** Canonicals use `https://petclues.com` — ensure DNS redirect is configured at host level
- **Trailing slashes:** App routes use no trailing slash; sitemap matches
- **Query filters:** Blog tag/search and FAQ search are `noindex` — not in sitemap (correct)
- **CSR meta flash:** Homepage meta in index.html until React hydrates — acceptable for SPA; consider SSR/prerender for critical landing URLs if needed

## Remaining recommendations

1. Add prerender or SSR for top 50 organic URLs if LCP/indexing speed becomes a bottleneck
2. Monitor Search Console for FAQ rich result impressions after datetime schema deploy
3. Refresh blog `updatedAt` when content materially changes (editorial workflow)
4. Submit updated sitemap after deploy: `https://petclues.com/sitemap.xml`
