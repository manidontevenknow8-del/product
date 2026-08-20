# Publish waves (from Agent 11 PASS)

Generated: 2026-08-20T18:43:51.701Z

PASS leaves: **1906** → **8** waves (target ~239/wave)

## Priority pools
1. **compare** — 38
1. **vaccinations+emergency** — 426
1. **vault+life-logistics+tools** — 402
1. **symptoms** — 380
1. **breeds** — 660

## Waves
### Wave 1 (247 URLs)
- Pools: compare, vaccinations+emergency
- Pillars: compare=39, vaccinations=202, breeds=1, symptoms=1, tools=1, life-logistics=1, vault=1, emergency=1
- File: `content-data/generated/publish-waves/wave-01.json`

### Wave 2 (239 URLs)
- Pools: vaccinations+emergency, vault+life-logistics+tools
- Pillars: vaccinations=49, emergency=176, vault=14
- File: `content-data/generated/publish-waves/wave-02.json`

### Wave 3 (239 URLs)
- Pools: vault+life-logistics+tools
- Pillars: vault=136, life-logistics=103
- File: `content-data/generated/publish-waves/wave-03.json`

### Wave 4 (239 URLs)
- Pools: vault+life-logistics+tools, symptoms
- Pillars: life-logistics=47, tools=102, symptoms=90
- File: `content-data/generated/publish-waves/wave-04.json`

### Wave 5 (239 URLs)
- Pools: symptoms
- Pillars: symptoms=239
- File: `content-data/generated/publish-waves/wave-05.json`

### Wave 6 (239 URLs)
- Pools: symptoms, breeds
- Pillars: symptoms=51, breeds=188
- File: `content-data/generated/publish-waves/wave-06.json`

### Wave 7 (239 URLs)
- Pools: breeds
- Pillars: breeds=239
- File: `content-data/generated/publish-waves/wave-07.json`

### Wave 8 (233 URLs)
- Pools: breeds
- Pillars: breeds=233
- File: `content-data/generated/publish-waves/wave-08.json`

## Indexing API (sandbox-safe)
- Default **40/day** (hard max 100)
- **2500ms** between requests
- **≥24h** between runs
- One wave segment per calendar day
- Sitemap remains the primary discovery path after the recent ~6k push

```bash
npx tsx scripts/trigger-indexing.ts --wave=1 --dry-run
npx tsx scripts/trigger-indexing.ts --wave=1 --limit=40
```
