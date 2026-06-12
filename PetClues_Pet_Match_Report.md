# PetClues Pet Match Report

**Date:** June 2, 2026  
**Scope:** Pet Match Engine (acquisition feature)  
**Build status:** `npm run build` passes (627 modules)

---

## Executive Summary

Implemented a modular **Pet Match Engine** at `/pet-match` to help prospective owners discover their most compatible pet based on lifestyle. The system is intentionally **rule-based (no AI)** for transparent scoring and faster iteration.

The experience is designed to feel premium with:
- Progressive questionnaire flow
- Compatibility scoring + recommendation rationale
- Curated top breed matches
- Lead-generation actions (save recommendation + create account CTA)

---

## Phase 1 - Route, Page, Components

### Route
- Added `ROUTES.PET_MATCH = '/pet-match'` in `src/routes/paths.ts`
- Added route in `src/App.tsx` as a **public page** (acquisition-friendly)
- Added nav link in `src/routes/navigation.ts`

### Page
- New page: `src/pages/PetMatchPage.tsx`
- New styles: `src/pages/PetMatchPage.module.css`
- Exported page from `src/pages/index.ts`

### Component module
- New folder: `src/components/pet-match/`
  - `PetMatchProgress.tsx`
  - `PetMatchQuestionnaire.tsx`
  - `PetMatchResultCard.tsx`
  - `PetMatchLeadCapture.tsx`
  - per-component CSS modules
  - `index.ts`

---

## Phase 2 - Questionnaire

Created a typed questionnaire schema in:
- `src/types/petMatch.ts`
- `src/services/petMatch/petMatchQuestionnaire.ts`

Questions included (exact requested set):
1. Apartment or house  
2. Children  
3. Existing pets  
4. Experience level  
5. Budget  
6. Daily free time  
7. Activity level  
8. Noise tolerance  
9. Travel frequency  
10. Preferred pet size

The questionnaire is step-based with progress and back navigation.

---

## Phase 3 - Rule-Based Scoring Engine

Created deterministic engine in:
- `src/services/petMatch/petMatchEngine.ts`

Engine behavior:
- Scores a curated breed profile catalog across species (`dog`, `cat`, `rabbit`)
- Uses lifestyle dimensions to adjust fit score:
  - housing
  - children / existing pets
  - experience
  - budget
  - free time
  - activity level
  - noise tolerance
  - travel frequency
  - size preference

Output includes:
- `compatibilityScore`
- `recommendedSpecies`
- `recommendedBreeds` (top 3)
- `careDifficulty`
- `estimatedMonthlyCost`
- lifestyle fit summary (`fitSummary`)

---

## Phase 4 - Premium Results Experience

Results UI in `PetMatchResultCard` presents:
- Headline compatibility score
- Recommended species
- Care difficulty + monthly cost range
- “Why this fits your lifestyle” bullets
- Top breed cards with:
  - match %
  - reasons
  - care profile
  - estimated monthly spend

This keeps the output explainable and actionable.

---

## Phase 5 - Lead Generation

Lead actions implemented:

### Save recommendation
- Local persistence service:
  - `src/services/petMatch/petMatchLeadService.ts`
- Saves full recommendation + answers + timestamp (+ optional user id)

### Create account before leaving
- `PetMatchLeadCapture` shows signup CTA for unauthenticated users
- CTA links to `ROUTES.SIGNUP`
- Authenticated users skip this prompt, but can still save and restart

---

## Architecture Notes

- The feature follows existing modular patterns (types, services, page, component module).
- No new backend dependency was required for initial launch.
- Public route choice supports top-of-funnel acquisition while preserving app architecture consistency.
- Rule-based engine is easy to tune and test before introducing ML/AI layers.

---

## Files Added

- `src/types/petMatch.ts`
- `src/services/petMatch/petMatchQuestionnaire.ts`
- `src/services/petMatch/petMatchEngine.ts`
- `src/services/petMatch/petMatchLeadService.ts`
- `src/components/pet-match/PetMatchProgress.tsx`
- `src/components/pet-match/PetMatchProgress.module.css`
- `src/components/pet-match/PetMatchQuestionnaire.tsx`
- `src/components/pet-match/PetMatchQuestionnaire.module.css`
- `src/components/pet-match/PetMatchResultCard.tsx`
- `src/components/pet-match/PetMatchResultCard.module.css`
- `src/components/pet-match/PetMatchLeadCapture.tsx`
- `src/components/pet-match/PetMatchLeadCapture.module.css`
- `src/components/pet-match/index.ts`
- `src/pages/PetMatchPage.tsx`
- `src/pages/PetMatchPage.module.css`

## Files Updated

- `src/routes/paths.ts`
- `src/routes/navigation.ts`
- `src/App.tsx`
- `src/pages/index.ts`

---

## Verification Checklist

- [x] `/pet-match` route loads
- [x] Questionnaire contains all required questions
- [x] Rule-based engine returns score/species/breeds/care/cost
- [x] Results explain why recommendations fit
- [x] Save recommendation action works
- [x] Create account CTA appears for unauthenticated users
- [x] `npm run build` passes

---

## Next Recommended Enhancements

1. Add backend persistence for saved matches (Supabase table + user history)
2. Add event tracking (`pet_match_started`, `pet_match_completed`, `pet_match_saved`)
3. Add more species/breed profiles and confidence calibration
4. Add referral CTA after save to maximize acquisition loop
