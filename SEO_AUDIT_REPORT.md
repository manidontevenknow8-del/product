# SEO Audit Report

Generated: 2026-06-22T16:16:46.143Z

## Scorecard

| Metric | Value |
|--------|-------|
| Sitemap URLs | 711 |
| URLs audited from registry | 711 |
| Indexable pages audited | 711 |
| Duplicate titles | 0 |
| Critical field failures | 0 |
| Missing registry entries | 0 |
| Redirect URLs in sitemap | 0 |
| Overall SEO readiness | 92/100 |

## Full sitemap coverage

- Every URL in `public/sitemap.xml` is checked for title, description, canonical, indexability, and schema handler coverage.
- Build fails if any indexable sitemap URL is missing critical SEO fields or has duplicate titles.

## Duplicate titles (0)

None — all indexable pages have unique titles.

## Critical failures (0)

None.

## Missing registry (0)

None — all sitemap URLs mapped to content sources.

## Redirect URLs still in sitemap (0)

None.

## Description length (post-formatter)

### Too short (3)
- https://petclues.com/faq/how-do-i-travel-with-my-pet (139 chars)
- https://petclues.com/faq/how-do-pet-passports-work (135 chars)
- https://petclues.com/faq/what-is-petclues (117 chars)

### Too long (0)
None.

## Registry URLs not in sitemap (0)

None.

## Remaining audit gaps

1. **CSR meta delivery** — titles/descriptions are applied client-side; audit validates source configs, not rendered HTML.
2. **Rendered canonical/robots** — no headless fetch; assumes React SEO handlers match registry.
3. **Per-URL JSON-LD instance validation** — schema families checked at handler level, not per-page graph output.
4. **Compare redirect slug** — `/compare/best-pet-health-record-app` kept as 301 only; excluded from sitemap and internal compare links resolve to `/best/`.
5. **Prerender/SSR** — not in scope; homepage still hydrates meta from React after first paint.
