# PetClues PetCare Score Migration Report

**Date:** May 31, 2026  
**Scope:** Replace mock PetCare Score with deterministic, rule-based scoring from real pet activity  
**Build status:** `npm run build` passes (596 modules)

**Constraints honored:** No AI, no GPT. Pure deterministic scoring from Pets, Reminders, Documents, and Health Records.

---

## Executive Summary

**PetCare Score** is now computed in the browser from live provider data. A new `PetCareScoreEngine` evaluates six weighted factors, produces insights and recommendations, tracks score history in `localStorage`, and explains why the score moved up or down compared to the previous check-in.

The PetCare Score page, dashboard widget, weekly insight card, and important insight card all consume the same computed `PetCareScoreData` via `PetCareScoreProvider`.

---

## Phase 1 - PetCareScoreEngine

### Location

| File | Purpose |
|------|---------|
| `src/services/petCareScore/petCareScoreEngine.ts` | Rule-based scoring engine |
| `src/services/petCareScore/petCareScoreTypes.ts` | Input and snapshot types |
| `src/services/petCareScore/petCareScoreService.ts` | Re-exports engine API |

### Data flow

```
activePet + healthRecords + documents + reminders
  → buildPassportSummary()        (passport factor input)
  → computePetCareScoreFromSources()
  → PetCareScoreData
  → PetCareScoreProvider → UI
```

### Scoring factors (6 × ~17 pts each, total 100)

| Factor ID | Label | Scoring rule |
|-----------|-------|--------------|
| `profile_completeness` | Profile completeness | Weighted field fill: name (20), species (15), breed (15), birth date (15), weight (15), gender (10), photo (10) |
| `health_records_count` | Health records | Tiered by count: 0→0, 1→40, 2–3→60, 4–5→80, 6+→100 |
| `document_completeness` | Document completeness | Tiered by vault count: 0→0, 1→50, 2→70, 3–4→85, 5+→100 |
| `upcoming_reminder_coverage` | Upcoming reminder coverage | Active reminders with upcoming/due-today status: 0 active→0, none upcoming→25, 1→60, 2→80, 3+→100 |
| `reminder_completion_rate` | Reminder completion rate | `completed / total × 100`; 0 if no reminders |
| `passport_completeness` | Passport completeness | Vaccinations (25), allergies (15), medications (20), conditions (15), emergency notes (10), documents (15) |

Overall score = weighted average via `computeOverallFromFactors()`.

### Factor status bands

| Score | Status |
|-------|--------|
| ≥ 85 | `excellent` |
| ≥ 70 | `good` |
| ≥ 50 | `fair` |
| < 50 | `needs_attention` |

### History and trend

- Snapshots stored in `localStorage` under `petclues_score_history_{petId}` (last 12 entries).
- One snapshot per day per pet; re-compute on same day only if score changes.
- Trend compares current score to the previous snapshot; chart shows up to 6 recent check-ins.

---

## Phase 2 - UI Hydration

### Provider refactor

**File:** `src/petCareScore/PetCareScoreProvider.tsx`

- Removed `mockPetCareScoreService` async path.
- Uses `usePets`, `useHealthRecords`, `useDocuments`, `useReminders`.
- Synchronous `useMemo` → `computePetCareScoreFromSources()`.
- `refresh()` re-fetches records, documents, and reminders from Supabase.

### Surfaces updated

| Surface | File | Data used |
|---------|------|-----------|
| **PetCare Score page** | `src/pages/PetCareScorePage.tsx` | Full `PetCareScoreData` |
| **Dashboard widget** | `src/components/dashboard/PetCareScoreWidget.tsx` | `snapshot`, encouraging message |
| **Weekly insight** | `src/components/dashboard/WeeklyInsightWidget.tsx` | `weeklyInsight` |
| **Important insight** | `src/components/dashboard/ImportantInsightCard.tsx` | `weeklyInsight` (falls back to dashboard mock only when no score data) |

Existing insight cards (`HealthInsightsCard`, `CareRecommendationsCard`, `PositiveProgressCard`, `AttentionNeededCard`) receive engine-generated content without structural changes.

---

## Phase 3 - Score change explanations

### Breakdown extensions

**Type:** `ScoreBreakdown` in `src/types/petCareScore.ts`

| Field | Purpose |
|-------|---------|
| `increasedBecause` | Factor-level messages when a factor improved ≥ 5 pts vs previous snapshot |
| `decreasedBecause` | Factor-level messages when a factor dropped ≥ 5 pts vs previous snapshot |
| `helping` | Factors with `excellent` or `good` status |
| `improving` | Factors with `fair` or `needs_attention` status |
| `suggestions` | Actionable copy from low-scoring factors |

### UI

**File:** `src/components/pet-care-score/ScoreBreakdownCard.tsx`

- **Why your score increased** - lists `increasedBecause`
- **Why your score decreased** - lists `decreasedBecause`
- **What's helping** / **Room to grow** - unchanged sections, now driven by real factor status
- **Suggested next steps** - from engine suggestions

### Recommendations

**Engine:** `buildRecommendations()` maps each improving factor to a deep link:

| Factor | Action |
|--------|--------|
| Profile | `/pet-profile` |
| Health records | `/pet-profile` |
| Documents | `/scan` |
| Reminder coverage | `/reminders?create=true` |
| Reminder completion | `/reminders` |
| Passport | `/passport` |

### Weekly insight generation

Deterministic copy from trend direction and weakest factor - no AI:

- **Score moving up** - cites first `increasedBecause` reason
- **A few areas slipped** - cites first `decreasedBecause` reason + weakest factor suggestion
- **Steady care** - highlights top improvement opportunity or general encouragement

### Score history chart

**File:** `src/components/pet-care-score/ScoreHistoryChart.tsx`

- Removed hardcoded “since December” copy.
- Dynamic span label from stored check-in count.
- Milestone text reflects `trend` direction.

---

## Type changes

### ScoreFactorId (updated)

```typescript
'profile_completeness'
| 'health_records_count'
| 'document_completeness'
| 'upcoming_reminder_coverage'
| 'reminder_completion_rate'
| 'passport_completeness'
```

Replaces legacy mock IDs (`vaccination_status`, `vet_visits`, `weight_tracking`, etc.).

---

## Removed / deprecated

| Item | Notes |
|------|-------|
| `mockPetCareScoreService` | Removed from provider default path |
| `buildMockPetCareScoreData()` | Removed from `petCareScoreData.ts` |
| Mock score constants | `SCORE_FACTORS`, `SCORE_HISTORY`, Luna-specific weekly copy |
| `FUTURE_PET_CARE_FEATURES` | Retained for “coming soon” section on score page |

---

## Provider order (unchanged)

```
PetProvider → DocumentProvider → HealthRecordProvider → ReminderProvider → … → PetCareScoreProvider
```

`PetCareScoreProvider` must remain after document, health, and reminder providers.

---

## Verification checklist

- [ ] Add pet profile fields → profile completeness rises
- [ ] Add health record → health records count and passport completeness update
- [ ] Upload document → document completeness and passport completeness update
- [ ] Create reminder → upcoming coverage updates
- [ ] Complete reminder → completion rate updates
- [ ] PetCare Score page shows six factors with real descriptions
- [ ] Dashboard widget reflects live score
- [ ] Weekly insight reflects active pet name and weakest factor
- [ ] Score breakdown shows increase/decrease reasons after a second visit with changed data
- [x] `npm run build` passes

---

## Future backend (not in scope)

| Enhancement | Notes |
|-------------|-------|
| Server-side score snapshots | Replace `localStorage` history with Supabase table |
| Nightly recalculation | Edge function or cron per pet |
| Multi-pet aggregate score | Family-level score across pets |
| Breed-weighted factors | Premium tier weighting |

---

## Files touched

| File | Change |
|------|--------|
| `src/services/petCareScore/petCareScoreEngine.ts` | **New** - scoring engine |
| `src/services/petCareScore/petCareScoreTypes.ts` | **New** - input types |
| `src/services/petCareScore/petCareScoreService.ts` | Re-exports engine |
| `src/petCareScore/PetCareScoreProvider.tsx` | Real-data hydration |
| `src/types/petCareScore.ts` | New factor IDs + breakdown fields |
| `src/components/pet-care-score/ScoreBreakdownCard.tsx` | Increase/decrease sections |
| `src/components/pet-care-score/ScoreBreakdownCard.module.css` | Up/down styling |
| `src/components/pet-care-score/ScoreHistoryChart.tsx` | Dynamic trend copy |
| `src/components/pet-care-score/ScoreFactorsCard.tsx` | Six factors copy |
| `src/pages/PetCareScorePage.tsx` | Pass trend to chart |
| `src/data/petCareScoreData.ts` | Trimmed to future features only |
