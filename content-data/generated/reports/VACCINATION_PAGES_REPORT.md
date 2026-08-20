# Vaccination schedule pages — generation report

**Date:** 2026-08-20  
**Target:** ~250 pages (`/vaccinations/{slug}`)  
**Delivered:** **250** (220 breed + 30 general)

## URL patterns

| Kind | Pattern | Example |
|------|---------|---------|
| Breed | `/vaccinations/{breed-slug}-vaccine-schedule` | `/vaccinations/labrador-retriever-vaccine-schedule` |
| General | `/vaccinations/{topic-slug}` | `/vaccinations/puppy-vaccine-schedule` |

## Per-page requirements

- Unique-data block from `core_vaccines_schedule` (breed) or inline `schedule` (general) via `VaccinationScheduleTemplate`
- Body sections: why timing matters; missed/delayed dose
- CTA variant `reminder` with copy:  
  `Never miss the {vaccine name} booster — get a reminder 7, 3, and 1 day before it's due`
- Breed pages cross-link to `/breeds/{slug}/adult-health-guide`

## Batches

Generated in 7 batches of 40 (final batch 10) via:

```bash
node scripts/content-gen/generate-vaccination-pages.mjs --batch N
# or
node scripts/content-gen/generate-vaccination-pages.mjs --all
```

## Self-check

- Page pairs sharing **>2 identical sentences (≥50 chars):** **0**
- Manifest: `content-data/generated/vaccinations/_manifest.json` (250 entries)

## Routes

- `/vaccinations` — index
- `/vaccinations/:slug` — `VaccinationSchedulePage`

## Data

- `content-data/breeds.json` expanded to **220** records (`scripts/content-gen/expand-breeds.mjs`)
