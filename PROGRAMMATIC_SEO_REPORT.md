# Programmatic SEO Strategy Report

**Project:** PetClues  
**Route:** `/guides`  
**Date:** 2026-06-18  
**Status:** Implemented — **91 programmatic pages** across **7 collections**

---

## Executive summary

PetClues now runs a **programmatic SEO engine** at `/guides` that generates long-tail, high-intent pages from structured seeds. Instead of hand-writing hundreds of articles, the system uses **seed data + builders** to produce unique pages for dog/cat vaccination schedules by breed, travel checklists by country, emergency checklists by species, and medication/health/care templates.

**Build output:** 552 sitemap URLs (91 detail pages + 7 collection indexes + 1 hub).

---

## Strategy overview

### Why programmatic SEO

| Goal | Approach |
|------|----------|
| Capture long-tail search | One URL per breed, country, species, or template variant |
| Scale without linear content cost | Shared builders inject subject-specific copy from seeds |
| AI/search snippet readiness | Every page has a `quickAnswer` hero block |
| Internal link equity | Cross-links to `/learn`, `/blog`, `/faq`, `/best`, and sibling guides |
| Product conversion | PetClues workflow section + CTA on every page |

### Content differentiation

Each page is **not a thin duplicate**. Builders customize:

- **Vaccination schedules** — breed size, lifestyle, and health-focus notes in schedule rows
- **Travel checklists** — country-specific rabies, microchip, and tapeworm rules
- **Emergency checklists** — species-specific vitals and unique risk signals
- **Templates** — audience and focus area drive intro, sections, and checklist items

---

## Dynamic route architecture

```
/guides                              → GuidesHubPage (collection directory)
/guides/:collection                  → GuidesCollectionPage (collection index)
/guides/:collection/:slug              → GuidesDetailPage (programmatic page)
```

### Route examples

| URL | Page type |
|-----|-----------|
| `/guides` | Hub — all 7 collections |
| `/guides/dog-vaccination-schedule` | 20 dog breed vaccine schedules |
| `/guides/dog-vaccination-schedule/golden-retriever` | Golden Retriever schedule |
| `/guides/cat-vaccination-schedule/maine-coon` | Maine Coon schedule |
| `/guides/pet-travel-checklist/united-kingdom` | UK travel checklist |
| `/guides/pet-emergency-checklist/rabbit` | Rabbit emergency checklist |
| `/guides/medication-tracking-template/senior-dog-medication-tracker` | Medication template |
| `/guides/health-record-template/puppy-health-record-template` | Health record template |
| `/guides/pet-care-checklist/new-puppy-checklist` | Care checklist |

### React Router wiring

```tsx
<Route path={ROUTES.GUIDES} element={<GuidesHubPage />} />
<Route path={`${ROUTES.GUIDES}/:collection`} element={<GuidesCollectionPage />} />
<Route path={`${ROUTES.GUIDES}/:collection/:slug`} element={<GuidesDetailPage />} />
```

Collection IDs are validated via `isProgrammaticCollectionId()` before page lookup.

---

## Collections & page counts

| Collection ID | Label | Pages |
|---------------|-------|-------|
| `dog-vaccination-schedule` | Dog vaccination schedules by breed | 20 |
| `cat-vaccination-schedule` | Cat vaccination schedules by breed | 15 |
| `pet-travel-checklist` | Pet travel checklists by country | 20 |
| `pet-emergency-checklist` | Pet emergency checklists by species | 6 |
| `medication-tracking-template` | Medication tracking templates | 10 |
| `health-record-template` | Health record templates | 10 |
| `pet-care-checklist` | Pet care checklist templates | 10 |
| **Total detail pages** | | **91** |

---

## Data pipeline

```
seeds/*.ts  →  buildProgrammaticPage.ts  →  index.ts  →  pages + SEO
```

### File structure

```
src/
├── types/programmaticPage.ts
├── data/programmatic/
│   ├── collections.ts              # 7 collection definitions
│   ├── buildProgrammaticPage.ts    # Collection-specific builders
│   ├── index.ts                    # list, get, related lookup
│   └── seeds/
│       ├── dogBreeds.ts            # 20 breeds
│       ├── catBreeds.ts            # 15 breeds
│       ├── countries.ts            # 20 countries
│       ├── emergencySpecies.ts     # 6 species
│       └── templates.ts            # 30 templates (3 × 10)
├── components/programmatic/
│   ├── VaccinationScheduleTable.tsx
│   ├── ChecklistGroups.tsx
│   └── ProgrammaticSections.module.css
├── pages/guides/
│   ├── GuidesHubPage.tsx
│   ├── GuidesCollectionPage.tsx
│   ├── GuidesDetailPage.tsx
│   └── GuidesPages.module.css
└── seo/programmaticSeo.tsx
```

### Builder pattern

Each collection has a dedicated builder function:

| Builder | Input seed | Unique output |
|---------|------------|---------------|
| `buildDogVaccinationPage` | `DogBreedSeed` | DHPP/rabies schedule table + breed notes |
| `buildCatVaccinationPage` | `CatBreedSeed` | FVRCP/FeLV schedule + lifestyle notes |
| `buildTravelChecklistPage` | `CountrySeed` | 3-phase travel checklist + entry rules |
| `buildEmergencyChecklistPage` | `EmergencySpeciesSeed` | Vitals + kit + urgency signals |
| `buildTemplatePage` | `TemplateSeed` | Reusable template sections (3 collection types) |

Runtime guards:

- `EXPECTED_PROGRAMMATIC_PAGE_COUNT = 91`
- Duplicate `collectionId/slug` keys throw at module load

---

## Page template (all collections)

Every programmatic page includes:

1. **Quick answer** — snippet-ready summary in hero
2. **Intro paragraphs** — subject-specific context
3. **Schedule table** (vaccination collections only)
4. **Content sections** — bullets and/or paragraphs
5. **Checklist groups** (travel, emergency, templates)
6. **PetClues workflow** — 4-step product integration
7. **FAQs** (4 per page) — with FAQPage schema
8. **Related resources** — learn, blog, FAQ internal links
9. **Related guides** — sibling/cross-collection links
10. **CTA** — signup + collection browse
11. **Health disclaimer**

---

## SEO implementation

### Dedicated SEO (`programmaticSeo.tsx`)

| Route level | Component | Schema |
|-------------|-----------|--------|
| Hub | `ProgrammaticHubSEO` | CollectionPage + ItemList |
| Collection | `ProgrammaticCollectionSEO` | CollectionPage + ItemList |
| Detail | `ProgrammaticPageSEO` | Article + FAQPage + HowTo (checklist pages) + BreadcrumbList |

### Indexing

- `ROUTES.GUIDES` in `INDEXABLE_PUBLIC_ROUTES`
- `isGuidesPath()`, `isGuidesCollectionPath()`, `isGuidesDetailPath()` in `seoConfig.ts`
- `SEOProvider` defers global meta on all `/guides` routes

### Sitemap (`generate-sitemap.mjs`)

- Hub: `/guides` (priority 0.87)
- Collections: `/guides/:collection` (priority 0.84)
- Detail pages: `/guides/:collection/:slug` (priority 0.81)
- Slugs extracted from seed files at build time

### Footer

- “Guides” link in `FOOTER_RESOURCE_LINKS`

---

## Seed inventory

### Dog breeds (20)

Golden Retriever, Labrador Retriever, French Bulldog, German Shepherd, Poodle, Dachshund, Beagle, Rottweiler, Yorkshire Terrier, Boxer, Siberian Husky, Australian Shepherd, Cavalier King Charles Spaniel, Shih Tzu, Boston Terrier, Great Dane, Border Collie, Chihuahua, Bernese Mountain Dog, Mixed Breed Dog

### Cat breeds (15)

Domestic Shorthair, Maine Coon, Siamese, Ragdoll, Persian, Bengal, British Shorthair, Sphynx, Abyssinian, Scottish Fold, Russian Blue, Devon Rex, Norwegian Forest Cat, Savannah, Mixed Breed Cat

### Countries (20)

United States, United Kingdom, Canada, Mexico, France, Germany, Spain, Italy, Netherlands, Ireland, Australia, New Zealand, Japan, Singapore, UAE, India, Thailand, Portugal, Switzerland, Greece

### Emergency species (6)

Dog, Cat, Bird, Rabbit, Reptile, Fish

### Templates (30)

- **Medication (10):** daily logs, puppy/senior trackers, chronic condition, post-surgery, flea/tick, heartworm, multi-pet calendar
- **Health records (10):** puppy, kitten, adult, senior, multi-pet, adoption, breeder, exotic, annual wellness
- **Care checklists (10):** new puppy/kitten, annual wellness, boarding, grooming, dental, weight, travel day, emergency kit, senior care

---

## Scaling playbook

### Add a new breed

1. Add entry to `seeds/dogBreeds.ts` or `seeds/catBreeds.ts`
2. Builder auto-generates page — no UI changes needed
3. Sitemap picks up new slug via regex extraction
4. Rebuild

### Add a new country

1. Add entry to `seeds/countries.ts` with entry rules flags
2. `buildTravelChecklistPage` generates 3-phase checklist automatically

### Add a new collection type

1. Add `ProgrammaticCollectionId` to types
2. Register in `collections.ts`
3. Create seed file + builder function
4. Register in `buildAllProgrammaticPages()`
5. Add route validation (automatic if ID is in collections)
6. Extend sitemap extraction
7. Update `EXPECTED_PROGRAMMATIC_PAGE_COUNT`

### Estimated scale potential

| Dimension | Current | Expandable to |
|-----------|---------|---------------|
| Dog breeds | 20 | 100+ (AKC full list) |
| Cat breeds | 15 | 50+ |
| Countries | 20 | 50+ |
| Templates | 30 | 100+ variants |
| **Potential pages** | 91 | **500+** without architectural changes |

---

## Relationship to other content hubs

| Hub | Role vs programmatic |
|-----|---------------------|
| `/learn` | Deep evergreen guides — programmatic pages link in as related resources |
| `/blog` | Narrative content — breed/travel posts cross-link to programmatic schedules |
| `/faq` | Q&A snippets — programmatic pages surface relevant FAQ items |
| `/best` | Intent/comparison pages — “best vaccination tracker” links to breed schedules |
| `/compare` | Competitor comparisons — separate from template/schedule content |

---

## Issues fixed (2026-06-18)

| Issue | Fix |
|-------|-----|
| Broken FAQ slugs in builders | Updated to real `slugifyFaqQuestion` outputs from `faqQuestionBank.ts` |
| Broken blog slugs | Mapped to existing posts (`puppy-vaccination-schedule-2026`, `international-pet-travel-health-certificate-guide`, etc.) |
| Invalid cross-collection `relatedPageKeys` | Dog pages no longer link to non-existent cat breed slugs |
| Missing strategy report | This document |

---

## Build verification

```bash
npm run build
```

Expected sitemap log:

```
Wrote sitemap with 552 URLs (… 91 programmatic guides, 7 programmatic collections …)
```

---

## Files added / updated

**New:**
- `src/types/programmaticPage.ts`
- `src/data/programmatic/**`
- `src/components/programmatic/**`
- `src/pages/guides/**`
- `src/seo/programmaticSeo.tsx`
- `PROGRAMMATIC_SEO_REPORT.md`

**Updated:**
- `src/routes/paths.ts` — `ROUTES.GUIDES`
- `src/App.tsx` — 3-tier routes
- `src/data/seoConfig.ts` — guides path helpers + indexing
- `src/seo/SEOProvider.tsx` — defer global SEO
- `src/data/footerLinks.ts` — Guides link
- `scripts/generate-sitemap.mjs` — programmatic URL extraction
