# PetClues Reminder Migration Report

**Date:** May 31, 2026  
**Scope:** Replace mock/localStorage reminders with Supabase-backed reminders linked to real pets  
**Build status:** `npm run build` passes (564 modules)

**Constraints honored:** Reminder persistence and UI hydration only. No notifications, email delivery, or AI.

---

## Executive Summary

PetClues now stores **real pet-linked reminders** in Supabase (or localStorage fallback when Supabase is not configured). Reminders reference `pets.id` via foreign key and RLS ensures users only access reminders for pets they own. The full reminder UI — list, calendar, create/edit modals, and dashboard widgets — reads from `ReminderProvider`, which uses `getReminderService()` following the same pattern as pets.

---

## Phase 1 — Database Migration

**File:** `supabase/migrations/20250531200000_create_reminders.sql`

### Table: `public.reminders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `pet_id` | uuid | FK → `public.pets(id)` ON DELETE CASCADE |
| `title` | text | Required |
| `category` | text | Check constraint: vaccinations, deworming, grooming, vet_visits, medication, food_refill, insurance_renewal, custom |
| `due_date` | date | Required |
| `notes` | text | Nullable |
| `priority` | text | `low`, `medium`, `high` |
| `recurring` | text | Maps to UI `repeatFrequency`: none, daily, weekly, monthly, quarterly, yearly |
| `completed` | boolean | Default `false` |
| `completed_at` | timestamptz | Set on completion |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto via trigger |

### Indexes

- `reminders_pet_id_idx` on `pet_id`
- `reminders_due_date_idx` on `due_date`

### Trigger

- `reminders_set_updated_at` — sets `updated_at = now()` on row update

---

## RLS Policies

All policies use an `EXISTS` subquery against `public.pets` to verify the reminder's pet belongs to `auth.uid()`:

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read reminders for own pets | `SELECT` | `pets.id = reminders.pet_id AND pets.owner_id = auth.uid()` |
| Users can insert reminders for own pets | `INSERT` | `pets.id = pet_id AND pets.owner_id = auth.uid()` |
| Users can update reminders for own pets | `UPDATE` | Same check on `USING` and `WITH CHECK` (allows pet_id changes within owned pets) |
| Users can delete reminders for own pets | `DELETE` | `pets.id = reminders.pet_id AND pets.owner_id = auth.uid()` |

---

## Phase 2 — Service Layer

### Files Created

| File | Purpose |
|------|---------|
| `src/services/reminders/reminderTypes.ts` | `IReminderService`, `ReminderRow`, `ReminderRowWithPet` |
| `src/services/reminders/reminderMappers.ts` | Row ↔ app mapping, `defaultCreateReminderInput()`, `computeNextDueDate()` |
| `src/services/reminders/mockReminderService.ts` | localStorage CRUD (no auto-seed; empty until user creates) |
| `src/services/reminders/supabaseReminderService.ts` | Supabase CRUD with `pets!inner(name)` join |

### Files Modified

| File | Change |
|------|--------|
| `src/services/reminders/reminderService.ts` | Refactored to factory pattern: `getReminderService()` → Supabase or mock |
| `src/services/supabase/database.types.ts` | Added `ReminderRow` and `reminders` table types |

### Architecture Pattern (matches pets)

```
getReminderService()
  ├── isSupabaseConfigured() → supabaseReminderService
  └── else                   → mockReminderService (localStorage)
```

### Field Mapping (DB ↔ UI)

| DB column | UI field (`Reminder` type) |
|-----------|----------------------------|
| `pet_id` | `petId` |
| `pets.name` (join) | `petName` |
| `recurring` | `repeatFrequency` |
| `completed_at` | `completedAt` |
| `due_date` | `dueDate` |

`userId` is not stored in the DB — populated from the authenticated user in the service layer for UI compatibility.

### Recurring Completion

When a reminder with `recurring !== 'none'` is completed:
1. Original row: `completed = true`, `completed_at = now()`
2. New row inserted with next due date (same logic as prior mock service)

---

## Phase 3 — UI Hydration

All reminder surfaces consume `useReminders()` from `ReminderProvider`, which loads via `getReminderService()`:

| Surface | File | Data source |
|---------|------|-------------|
| **Reminders Page** | `src/pages/RemindersPage.tsx` | `filterReminders()`, CRUD actions, loading state |
| **Reminder Cards** | `src/components/reminders/ReminderCard.tsx` | Props from list/calendar |
| **Reminder List** | `src/components/reminders/ReminderList.tsx` | Filtered reminders |
| **Reminder Calendar** | `src/components/reminders/ReminderCalendarView.tsx` | Filtered reminders by date |
| **Reminder Filters** | `src/components/reminders/ReminderFilters.tsx` | Stats from provider |
| **Create Modal** | `src/components/reminders/CreateReminderModal.tsx` | `createReminder()` → Supabase |
| **Edit Modal** | `src/components/reminders/EditReminderModal.tsx` | `updateReminder()` / `deleteReminder()` |

---

## Phase 4 — Reminder CRUD

| Action | Provider method | Service method |
|--------|-----------------|----------------|
| Create | `createReminder(input)` | `create(userId, input)` |
| Edit | `updateReminder(id, input)` | `update(userId, id, input)` |
| Complete | `completeReminder(id)` | `complete(userId, id)` |
| Reschedule | `rescheduleReminder(id, dueDate)` | `reschedule(userId, id, dueDate)` |
| Delete | `deleteReminder(id)` | `delete(userId, id)` |

### Pet Integration

- `ReminderForm` uses `usePets()` for real pet picker (replaces hardcoded `mockPet` / Luna)
- Default pet on create: `activePet` or first pet in list
- Create/edit modals include loading and error states

---

## Phase 5 — Dashboard Integration

| Widget | File | Hydrated data |
|--------|------|---------------|
| **Upcoming Reminders** | `UpcomingRemindersWidget.tsx` | `nextReminder`, `upcomingReminders`, `stats.completed` |
| **Overdue Reminders** | `OverdueRemindersWidget.tsx` | `overdueReminders`, `stats.overdue` (hidden when zero) |

Both widgets use real reminder data from `ReminderProvider`. Complete and reschedule actions persist to Supabase.

---

## Phase 6 — Empty States

| Location | Behavior |
|----------|----------|
| **Reminders Page** (list view) | `EmptyRemindersState` — "No reminders yet" + Create reminder CTA |
| **Reminders Page** (upcoming/overdue/calendar) | Context-specific empty messages |
| **Dashboard Upcoming widget** | `EmptyRemindersState` compact + Create reminder navigates to `/reminders?create=true` |
| **Overdue widget** | Returns null when no overdue (no empty block needed) |

---

## Persistence Flow

```
User action (create / edit / complete / delete)
  → ReminderProvider method
  → getReminderService().*()
  → supabaseReminderService (or mockReminderService)
  → Supabase reminders table (RLS enforced via pet ownership)
  → ReminderProvider.refresh() → setReminders()
  → All UI surfaces re-render
```

---

## Files Created (Summary)

| File |
|------|
| `supabase/migrations/20250531200000_create_reminders.sql` |
| `src/services/reminders/reminderTypes.ts` |
| `src/services/reminders/reminderMappers.ts` |
| `src/services/reminders/mockReminderService.ts` |
| `src/services/reminders/supabaseReminderService.ts` |
| `PetClues_Reminder_Migration_Report.md` |

---

## Files Modified (Summary)

| File | Change |
|------|--------|
| `src/services/reminders/reminderService.ts` | Factory + re-exports |
| `src/services/supabase/database.types.ts` | `reminders` table types |
| `src/reminders/ReminderProvider.tsx` | Uses `getReminderService()` |
| `src/components/reminders/ReminderForm.tsx` | Real pet picker via `usePets()` |
| `src/components/reminders/CreateReminderModal.tsx` | Active pet default, error handling |
| `src/components/reminders/EditReminderModal.tsx` | Error handling on save/delete |
| `src/components/reminders/ReminderModal.module.css` | Error + no-pet hint styles |
| `src/pages/RemindersPage.tsx` | Loading state while fetching |
| `src/components/dashboard/UpcomingRemindersWidget.tsx` | Premium empty state via `EmptyRemindersState` |
| `src/components/empty-states/EmptyRemindersState.tsx` | Create button in compact mode |

---

## Remaining Mock Reminder Dependencies

These still reference mock/hardcoded reminder data and are **out of scope**:

| Area | Mock source | Notes |
|------|-------------|-------|
| Demo seed data | `src/data/reminderData.ts` — `getSeedReminders()` | No longer auto-seeded; kept for optional demo use |
| Legacy default input | `reminderData.defaultCreateReminderInput` | Superseded by `reminderMappers.defaultCreateReminderInput` |
| Dashboard legacy card | `mockNextReminder` in `dashboardData.ts` | Unused `NextReminderCard` leftover |
| Dashboard activity | `mockRecentActivity` | Includes static reminder activity item |
| Notifications | `notificationData.ts` | Hardcoded Luna reminder notifications |
| Timeline events | `timelineData.ts` | Demo reminder-related events |
| PetCare Score | `petCareScoreData.ts` | Static copy mentions reminders |
| Scan results | `scanData.ts` | Mock extracted reminders |
| Smart suggestions | `SmartSuggestionsPlaceholder.tsx` | Static "coming soon" AI cards |

---

## Apply Migration

Run in Supabase SQL editor or via CLI:

```bash
supabase db push
```

Or apply `20250531200000_create_reminders.sql` manually after the pets migration.

---

## Testing Checklist

1. Ensure at least one pet exists (onboarding or profile).
2. Open **Reminders → New reminder** — verify pet picker shows real pets.
3. Create a reminder — confirm it appears in list, calendar, and dashboard upcoming widget.
4. Edit title/due date — confirm persistence after refresh.
5. Mark complete — confirm stats update; recurring reminders spawn next occurrence.
6. Delete — confirm removal from all views.
7. Create overdue reminder (past due date) — confirm **Needs attention** widget appears.
8. With empty account — confirm premium empty states on page and dashboard.
9. Without Supabase env — confirm localStorage mock path works.

---

## Next Recommended Steps (Not in Scope)

1. Notification scheduler on create/update/complete (push, email).
2. Pet filter UI in `ReminderFilters` (filter logic already exists).
3. Remove legacy `reminderData.ts` seed and `mockNextReminder`.
4. Wire scan-to-reminder extraction to real persistence.
5. Cron/edge function for due-date notification delivery.

---

*Generated as part of the Pet Identity Migration follow-up — reminder backend migration.*
