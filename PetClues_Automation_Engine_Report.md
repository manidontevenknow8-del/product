# PetClues Automation Engine Report

**Date:** May 31, 2026  
**Scope:** Rule-based automation — create reminders from health records  
**Build status:** `npm run build` passes (599 modules)

**Constraints honored:** No AI, no GPT. Pure rule engine only.

---

## Executive Summary

**Automation Engine V1** watches health record create/update events and automatically creates or updates linked reminders when eligible date fields are present. Duplicate prevention uses a `source_health_record_id` foreign key on reminders. Successful automations write a **"Reminder created automatically"** entry to the dashboard activity log.

---

## Phase 1 — Automation services

### Location

| File | Purpose |
|------|---------|
| `src/services/automation/automationRules.ts` | Rule matchers and reminder payload builder |
| `src/services/automation/automationEngine.ts` | Orchestration: match → dedup → create/update |
| `src/services/automation/index.ts` | Public exports |

### Rules

| Rule ID | Condition | Reminder |
|---------|-----------|----------|
| `vaccination_due` | `record_type = vaccination` AND `next_due_date` set | Category `vaccinations`, yearly repeat, high priority |
| `medication_end` | `record_type = medication` AND `next_due_date` set (end date) | Category `medication`, no repeat |
| `wellness_followup` | `record_type = wellness` AND `next_due_date` set (follow-up) | Category `vet_visits`, no repeat |

All three rules read from the shared `next_due_date` column on `health_records`. The health record form labels this field **"Next due date"** — for medications it represents the end date; for wellness it represents the follow-up date.

### Reminder payload

Each automated reminder includes:

- Title: `{record.title} due` / `end date` / `follow-up`
- Due date from the health record
- Notes tag: `petclues:auto:health_record:{recordId}`
- `sourceHealthRecordId` linking back to the health record

---

## Phase 2 — Trigger on health record events

**File:** `src/healthRecords/HealthRecordProvider.tsx`

After `createRecord` and `updateRecord` succeed, the provider calls `runHealthRecordAutomation()` with:

- Active pet name
- Current pet reminders (for dedup lookup)
- `getReminderService()` for persistence

### Provider reorder

`ReminderProvider` now wraps `HealthRecordProvider` in `main.tsx` so the health record layer can access `useReminders().refresh()` after automation.

```
ReminderProvider → HealthRecordProvider → … → PetCareScoreProvider
```

---

## Phase 3 — Duplicate prevention

### Database

**Migration:** `supabase/migrations/20250531500000_add_reminder_automation_source.sql`

```sql
alter table public.reminders
  add column source_health_record_id uuid references public.health_records (id);

create unique index reminders_source_health_record_id_unique
  on public.reminders (source_health_record_id)
  where source_health_record_id is not null;
```

### Application logic

Before creating a reminder, the engine looks for an existing reminder where:

- `sourceHealthRecordId === record.id`, OR
- `notes` contains `petclues:auto:health_record:{recordId}`

| Scenario | Action |
|----------|--------|
| No linked reminder + rule matches | Create reminder |
| Linked reminder exists + dates/title changed | Update reminder |
| Linked reminder exists + unchanged | Skip (`unchanged`) |
| No rule matches | Skip (`no_rule`) |

At most **one automated reminder per health record**.

---

## Phase 4 — Activity log

### Service

**File:** `src/services/activity/activityLogService.ts`

- Stores entries in `localStorage` (`petclues_activity_log`)
- `logAutomationReminderCreated()` writes:

| Field | Value |
|-------|-------|
| Title | **Reminder created automatically** |
| Description | `{reminder title} · {rule label} · due {date}` |
| Type | `automation` |

### Dashboard

**File:** `src/pages/DashboardPage.tsx`

When demo activity is disabled, `RecentActivityFeed` shows real automation entries for the active pet via `getActivityLogForPet()`.

### Analytics

Event `automation_reminder_created` tracked with `ruleId`, `action`, `healthRecordId`, and `reminderId`.

---

## Data model changes

| Layer | Change |
|-------|--------|
| `reminders` table | `source_health_record_id uuid` nullable FK |
| `Reminder` type | Optional `sourceHealthRecordId` |
| `CreateReminderInput` | Optional `sourceHealthRecordId` |
| `ActivityItem` type | New `automation` type |
| `AnalyticsEventName` | New `automation_reminder_created` |

---

## End-to-end flow

```
User saves health record (vaccination + next due date)
  → HealthRecordProvider.createRecord()
  → runHealthRecordAutomation()
  → getMatchingAutomationRule() → vaccination_due
  → No linked reminder found
  → reminderService.create() with source_health_record_id
  → logAutomationReminderCreated()
  → eventTracker.track('automation_reminder_created')
  → refreshReminders()
  → Dashboard activity feed shows "Reminder created automatically"
```

---

## Verification checklist

- [ ] Add vaccination with next due date → reminder appears in Reminders
- [ ] Add medication with next due date (end date) → medication reminder created
- [ ] Add wellness with next due date (follow-up) → vet visit reminder created
- [ ] Edit health record due date → linked reminder updates (no duplicate)
- [ ] Save same record again without changes → no duplicate reminder
- [ ] Dashboard Recent Activity shows "Reminder created automatically"
- [x] `npm run build` passes

---

## Future enhancements (not in scope)

| Enhancement | Notes |
|-------------|-------|
| Server-side activity log | Supabase `activity_events` table |
| Delete linked reminder on health record delete | Optional cascade behavior |
| Separate UI labels per record type | "End date" for meds, "Follow-up" for wellness |
| Notification scheduling | Push/email when auto-reminder created |
| Additional rules | Allergy review, weight check, surgery follow-up |

---

## Files touched

| File | Change |
|------|--------|
| `src/services/automation/automationRules.ts` | **New** — rule definitions |
| `src/services/automation/automationEngine.ts` | **New** — engine orchestration |
| `src/services/automation/index.ts` | **New** — exports |
| `src/services/activity/activityLogService.ts` | **New** — activity log |
| `src/healthRecords/HealthRecordProvider.tsx` | Automation trigger on create/update |
| `src/main.tsx` | Provider reorder |
| `src/types/reminder.ts` | `sourceHealthRecordId` |
| `src/types/dashboard.ts` | `automation` activity type |
| `src/types/analytics.ts` | `automation_reminder_created` event |
| `src/services/reminders/*` | Mapper + service support for source link |
| `src/services/supabase/database.types.ts` | Updated reminder schema |
| `src/pages/DashboardPage.tsx` | Real activity feed |
| `supabase/migrations/20250531500000_add_reminder_automation_source.sql` | **New** — dedup column |
