# content-data

JSON source of truth for upcoming PetClues content pages. **No page routes live here.** Content agents should import types from `../content-types` and read these files (or a future loader) when generating copy.

## Status (sample gate)

| File | Intended size | Current | Notes |
|------|---------------|---------|-------|
| `breeds.json` | 220 | **220** | Expanded from TOP_DOG_BREEDS (200) + 20 cats |
| `symptoms.json` | 80 base → 148 species records | **148** | Guides under `/symptoms/{species}/{slug}`; batches in `generated/symptoms/` |
| `emergencies.json` | 25 | **25 core scenarios** | Long-tail pages in `generated/emergencies/` |
| `life_stages.json` | 6 (puppy/kitten/adult/senior x dog/cat) | **complete** | Small fixed set |
| `comparisons.json` | ~40 verified (apps + baselines) | **38 publishable + 2 flagged incomplete** | Verified features only; skip incomplete |
| `tools.json` | 110 gated downloadables | **110** | ToolTemplate pages at `/tools/{slug}` |

Optional record flag: `"NEEDS_VET_REVIEW": true` when any field is approximate or must not be published without clinical/editorial sign-off.

---

## `breeds.json`

Array of breed objects.

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | URL-safe id |
| `name` | string | Display name |
| `species` | `"dog"` \| `"cat"` | |
| `size_category` | `"toy"` \| `"small"` \| `"medium"` \| `"large"` \| `"giant"` \| `"n/a"` | Cats may use medium/n/a |
| `avg_weight_range` | string | e.g. `"55-80 lb (25-36 kg)"` |
| `avg_lifespan` | string | e.g. `"11-13 years"` |
| `common_health_issues` | string[3-5] | Documented predispositions only |
| `core_vaccines_schedule` | `{ vaccine: string, age_weeks: number }[]` | Core series windows (AAHA/AAFP style); not a prescription |
| `grooming_needs` | string | |
| `temperament_summary` | string | |
| `NEEDS_VET_REVIEW?` | `true` | Optional |
| `source_notes?` | string | Editor-only provenance |

TypeScript: `BreedRecord` in `content-types/breed.ts`.

---

## `symptoms.json`

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | |
| `name` | string | |
| `species` | `"dog"` \| `"cat"` \| `"both"` | |
| `urgency_level` | `"emergency"` \| `"urgent"` \| `"monitor"` | |
| `common_causes` | string[] | |
| `when_to_see_vet_immediately` | string[] | Red-flag signs |
| `related_breed_predispositions` | string[] | Breed `slug`s from `breeds.json` |

TypeScript: `SymptomRecord`.

### Generated symptom guides

- Generator: `scripts/content-gen/generate-symptom-pages.mjs`
- Output: `content-data/generated/symptoms/batch-XX.json` (40 pages each) + `manifest.json`
- Routes: `/symptoms` index, `/symptoms/:species/:slug` pages
- Re-run batch N: `node scripts/content-gen/generate-symptom-pages.mjs --batch N`
- Rebuild data + all: `node scripts/content-gen/generate-symptom-pages.mjs --write-data --batch all`

Every generated page includes the medical disclaimer and a soft health-timeline product tie-in.

---

## `life_stages.json`

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | e.g. `dog-senior` |
| `name` | string | |
| `species` | `"dog"` \| `"cat"` | |
| `stage` | `"puppy"` \| `"kitten"` \| `"adult"` \| `"senior"` | |
| `typical_age_range` | string | Editorial band, not a hard cutoff |
| `care_checklist` | string[] | |

TypeScript: `LifeStageRecord`.

---

## `emergencies.json`

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | |
| `name` | string | |
| `immediate_action_steps` | string[] | Ordered first actions |
| `when_to_call_vet_vs_poison_control` | string | Who to call when |

TypeScript: `EmergencyRecord`.

---

## `comparisons.json`

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | |
| `name` | string | |
| `category` | `"pet-records-app"` \| `"clinic-connected-app"` \| `"insurance-marketplace"` \| `"non-app-baseline"` | |
| `website?` | string | |
| `identity_note?` | string | Brand disambiguation |
| `features` | `{ feature, value, source }[]` | Only verified claims; each row cites a source URL or `"baseline"` |

TypeScript: `ComparisonRecord`.

**Publish gate:** A record is publishable only when `slug`, `name`, `category`, and every `features[]` row include non-empty `feature`, `value`, and `source`. Incomplete records are listed on `/compare` as flagged and do **not** get a `/compare/petclues-vs-{slug}` page.

**URL pattern:** `/compare/petclues-vs-{slug}` (CTA variant `comparison` + founding-member offer).

---

## Shared UI (shells only)

Import from `src/components/content`:

- `CTABlock` — props: `variant`, `headline`, `subtext?`, `buttonText`, `href?` / `onClick?` (no default copy)
- `RelatedLinks` — up to 6 `{ href, label, description? }`
- `SchemaMarkup` — `type: "Article" | "FAQPage"`, `data` object → JSON-LD
- `Breadcrumbs` — `path: { label, href? }[]`

Do not generate page files against this folder until the sample schemas below are approved and the full breed/symptom/emergency sets are authorized.

## Templates (8 pillars)

Reusable React templates live in `src/templates/`. Example routes (noIndex) under `/examples/*`:

| Template | Example URL | CTA variant |
|----------|-------------|-------------|
| `BreedHealthTemplate` | `/examples/breed-health/labrador-retriever` | trial |
| `SymptomGuideTemplate` | `/examples/symptom/vomiting-dog` | trial |
| `VaccinationScheduleTemplate` | `/examples/vaccination/labrador-retriever` | reminder |
| `EmergencyGuideTemplate` | `/examples/emergency/chocolate-toxicity` | trial (urgent copy) |
| `RecordsVaultTemplate` | `/guides/{slug}` (150 long-tail) + `/examples/vault/digital-pet-passport` | vault |

Production vault guides: `/guides/{slug}` from `content-data/generated/vault/pages.json` (150 pages). Loader: `src/content/vaultPages.ts`. Regenerate with `npm run generate:vault-pages`.
| `LifeLogisticsTemplate` | `/examples/life-logistics/pet-sitter-handoff` | trial (share / multi-profile) |

Production life-logistics guides: `/guides/{slug}` from `content-data/generated/life-logistics/batch-0*.json` (150 pages). Loader: `src/content/loadLifeLogistics.ts`.

| `ComparisonTemplate` | `/compare/petclues-vs-11pets` | comparison |
| `ToolTemplate` | `/tools/printable-pet-vaccine-checklist` | trial (gated) |

Production gated tools: `/tools/{slug}` from `content-data/tools.json` (**110** pages). Hub: `/tools`. Loader: `getToolBySlug` in `src/content/loadContentData.ts`. Regenerate with `node scripts/content-gen/generate-tools.mjs`.

---

## `tools.json`

Array of gated downloadable tool pages (vaccination sheets, emergency cards, vet visit logs, sitter templates).

| Field | Type | Notes |
|------|------|-------|
| `slug` | string | URL under `/tools/{slug}` |
| `family` | `"vaccination-record"` \| `"emergency-card"` \| `"vet-visit-log"` \| `"pet-sitter-instructions"` | |
| `species` | string | dog/cat/puppy/kitten/senior-*/multi-pet/rabbit/bird/ferret/pet |
| `use_case` | string | Variant axis within the family |
| `h1` / `primary_keyword` / `meta_description` / `lead` | string | SEO + hero |
| `format` / `includes` | string | Data facts |
| `download_rows` | string[] | Preview of PDF rows |
| `how_to_use` | string[] | Steps |
| `sections` | `{ heading, paragraphs[] }[]` | Body |
| `faqs` | `{ question, answer }[]` | FAQ + JSON-LD |
| `gated` | `true` | Account unlock CTA |
| `NEEDS_VET_REVIEW?` | `true` | Optional clinical flag |

TypeScript: `ToolRecord` in `content-types/tool.ts`.

Reserved slugs (existing product tools): `vaccine-scheduler`, `qr-generator`.
