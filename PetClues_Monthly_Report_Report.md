# PetClues Monthly Report Report

**Date:** June 2, 2026  
**Scope:** Monthly Pet Life Report (shareable monthly summaries)  
**Build status:** `npm run build` passes (654 modules)

---

## Executive Summary

Implemented **Monthly Pet Life Reports**: mobile-first, Instagram-ready monthly summary cards that compile real activity into a story you can share.

This includes:
- A deterministic `MonthlyReportEngine`
- A premium portrait report card suitable for social sharing
- Share / Download / Save actions
- An archive page to revisit saved reports

---

## Phase 1 — MonthlyReportEngine

### Engine
**File:** `src/services/monthlyReport/MonthlyReportEngine.ts`

The engine accepts:
- `reminders`
- `healthRecords`
- `documents`
- `petCareScoreHistory`
- `petId`, `petName`, `monthKey (YYYY-MM)`

It outputs a normalized `MonthlyPetLifeReport` containing:
- counts (completed reminders, added health records, uploaded documents)
- PetCare Score change for the month (start/end/delta based on score history)
- milestones (rule-based)
- highlights + metrics for display in the report card

### Types
**File:** `src/types/monthlyReport.ts`

Key outputs:
- `MonthlyPetLifeReport`
- `MonthlyReportMilestone`
- `MonthlyReportMetric`

---

## Phase 2 — Included signals

Monthly reports include the requested inputs:

- **reminders completed**: reminders with `completedAt` within the month
- **health records added**: `HealthRecord.createdAt` within the month
- **documents uploaded**: `PetDocumentRecord.uploadedAt` within the month
- **PetCare Score change**: delta computed from score history points that fall within the month
- **milestones reached**: rule-based detection (vault builder, vaccinations logged, weight updates, reminder streak, score shift)

---

## Phase 3 — Instagram-ready report card (mobile-first)

**Component:** `src/components/monthly-report/MonthlyReportCard.tsx`  
**Styles:** `src/components/monthly-report/MonthlyReportCard.module.css`

Design characteristics:
- 4:5 portrait ratio (Instagram-friendly)
- premium gradients + serif typography aligned with PetClues aesthetic
- highlights + milestones presented as a “story”, not a dashboard

---

## Phase 4 — Share / Download / Save

### Actions UI
**Component:** `src/components/monthly-report/MonthlyReportActions.tsx`

### Download
Uses `html-to-image` to export the report card DOM node to a PNG:
- `src/utils/imageExport.ts`

### Share
Uses `navigator.share()` when available; otherwise copies a shareable summary string to clipboard.

### Save
Saves reports to localStorage-based archive:
- `src/services/monthlyReport/monthlyReportStorage.ts`

---

## Phase 5 — Archive page

**Route:** `/monthly-report/archive`  
**Page:** `src/pages/MonthlyReportArchivePage.tsx`

Behavior:
- Lists saved monthly reports for the active pet
- Allows selecting a month to preview the report card

---

## Routing & navigation

Added routes:
- `ROUTES.MONTHLY_REPORT = '/monthly-report'`
- `ROUTES.MONTHLY_REPORT_ARCHIVE = '/monthly-report/archive'`

Added navigation entry:
- `Monthly Report` in `src/routes/navigation.ts` (secondary nav)

App routes wired in `src/App.tsx` as protected pages.

---

## Analytics events

Added and tracked:
- `monthly_report_generated`
- `monthly_report_saved`
- `monthly_report_downloaded`

Event names live in `src/types/analytics.ts` and are tracked from `src/pages/MonthlyReportPage.tsx`.

---

## Files added

- `src/types/monthlyReport.ts`
- `src/services/monthlyReport/MonthlyReportEngine.ts`
- `src/services/monthlyReport/monthlyReportStorage.ts`
- `src/services/monthlyReport/index.ts`
- `src/components/monthly-report/*`
- `src/pages/MonthlyReportPage.tsx`
- `src/pages/MonthlyReportArchivePage.tsx`
- `src/utils/imageExport.ts`

## Files updated

- `package.json` (added `html-to-image`)
- `src/routes/paths.ts`
- `src/routes/navigation.ts`
- `src/App.tsx`
- `src/types/analytics.ts`

---

## Verification checklist

- [x] Generate report for selected month
- [x] Includes reminders completed, health records added, documents uploaded
- [x] Includes PetCare Score change (from history points)
- [x] Includes milestones reached
- [x] Beautiful mobile-first report card
- [x] Share (native share or clipboard fallback)
- [x] Download PNG export works
- [x] Save stores report to archive
- [x] Archive page previews saved reports
- [x] `npm run build` passes

---

## Next enhancements (optional)

1. Persist archive to Supabase table for cross-device sync (instead of localStorage).
2. Add “Square post” and “Story” layout modes (multiple aspect ratios).
3. Add image thumbnails (from documents / pet photo) in the report card.
