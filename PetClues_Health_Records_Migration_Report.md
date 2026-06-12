# PetClues Health Records Migration Report

**Date:** May 31, 2026  
**Scope:** Replace mock health data with Supabase-backed pet-linked health records  
**Build status:** `npm run build` passes (587 modules)

**Constraints honored:** Health records infrastructure only. No AI, notifications, or billing.

---

## Executive Summary

PetClues now stores **real health records** in Supabase (or localStorage fallback) linked to pets and optionally to uploaded documents. The **Profile page** hydrates the Health Records section, Medical History timeline, and At a Glance health summary from `HealthRecordProvider`. Users can create, edit, and delete records with optional document linking.

---

## Phase 1 - Database

**File:** `supabase/migrations/20250531400000_create_health_records.sql`

### Table: `public.health_records`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `pet_id` | uuid | FK → `pets(id)` ON DELETE CASCADE |
| `source_document_id` | uuid | FK → `pet_documents(id)` ON DELETE SET NULL |
| `record_type` | text | See enum below |
| `title` | text | Required |
| `description` | text | Nullable |
| `date_recorded` | date | Required |
| `next_due_date` | date | Nullable |
| `severity` | text | Nullable: `low`, `medium`, `high` |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto via trigger |

### `record_type` values

`vaccination` · `allergy` · `medication` · `diagnosis` · `surgery` · `weight` · `wellness`

### Indexes

- `health_records_pet_id_idx`
- `health_records_record_type_idx`
- `health_records_date_recorded_idx` (DESC)

### Trigger

- `health_records_set_updated_at` - sets `updated_at = now()` on row update

---

## RLS Policies

All policies verify pet ownership via `EXISTS` subquery on `public.pets`:

| Policy | Operation |
|--------|-----------|
| Users can read health records for own pets | `SELECT` |
| Users can insert health records for own pets | `INSERT` |
| Users can update health records for own pets | `UPDATE` |
| Users can delete health records for own pets | `DELETE` |

Document FK is optional; inserts/updates with `source_document_id` must still pass pet ownership checks on `pet_id`.

---

## Phase 2 - Service Layer

### Files created

| File | Purpose |
|------|---------|
| `src/services/healthRecords/healthRecordTypes.ts` | Types, interface, labels |
| `src/services/healthRecords/healthRecordMappers.ts` | Row mapping, summary derivation, defaults |
| `src/services/healthRecords/mockHealthRecordService.ts` | localStorage CRUD |
| `src/services/healthRecords/supabaseHealthRecordService.ts` | Supabase CRUD with document join |
| `src/services/healthRecords/healthRecordService.ts` | `getHealthRecordService()` factory |
| `src/healthRecords/HealthRecordProvider.tsx` | Global context for active pet |
| `src/healthRecords/index.ts` | Public exports |

### Service methods

| Method | Description |
|--------|-------------|
| `getRecordsByPet(ownerId, petId)` | All records, newest `date_recorded` first |
| `getRecordsByType(ownerId, petId, recordType)` | Filtered by type |
| `createRecord(ownerId, input)` | Insert new record |
| `updateRecord(ownerId, recordId, input)` | Patch existing record |
| `deleteRecord(ownerId, recordId)` | Remove record |

Supabase queries join `pet_documents(file_name, uploaded_at)` for source document display.

---

## Phase 3 - UI Hydration

| Component | File | Behavior |
|-----------|------|----------|
| **Health Records** | `PetHealthRecords.tsx` | Grouped by type; edit/add; document links |
| **Medical History** | `PetMedicalHistory.tsx` | Chronological timeline |
| **Profile Health Summary** | `PetSummaryCard.tsx` | Vaccinations, allergies, weight, record count from real data |
| **Profile status badge** | `PetProfilePage.tsx` | Derived from record count (replaces `mockProfileStatus`) |
| **Add/Edit modal** | `HealthRecordModal.tsx` | Full CRUD form with document picker |

### Persistence flow

```
HealthRecordModal submit
  → HealthRecordProvider.createRecord / updateRecord
  → getHealthRecordService().*
  → Supabase health_records (RLS via pet ownership)
  → Provider state refresh → all profile sections re-render
```

---

## Phase 4 - Document Linking

Records may set optional `source_document_id`:

- **Form:** Document picker populated from `useDocuments()` (uploaded vault files)
- **Display:** Shows source document name and upload date on Health Records and Medical History entries
- **FK:** `ON DELETE SET NULL` if document is removed

---

## Phase 5 - Empty States

**Component:** `EmptyHealthRecordsState.tsx`

- Title: **"No health records yet"**
- Description: guidance to track vaccinations, medications, and care events
- CTA: **Add record** button
- Used in Health Records section and Medical History when empty

---

## Files Modified

| File | Change |
|------|--------|
| `src/services/supabase/database.types.ts` | Added `HealthRecordRow` and `health_records` table |
| `src/main.tsx` | Wrapped app with `HealthRecordProvider` |
| `src/pages/PetProfilePage.tsx` | Real health data; shared modal; derived profile status |
| `src/components/pet-profile/PetHealthRecords.tsx` | Real records; callbacks; document links |
| `src/components/pet-profile/PetHealthRecords.module.css` | New type colors, add/edit/document styles |
| `src/components/pet-profile/PetSummaryCard.tsx` | Health summary from `useHealthRecords()` |
| `src/components/pet-profile/index.ts` | Export new components |
| `src/components/empty-states/index.ts` | Export `EmptyHealthRecordsState` |

---

## Files Created (Summary)

| File |
|------|
| `supabase/migrations/20250531400000_create_health_records.sql` |
| `src/services/healthRecords/*` (5 files) |
| `src/healthRecords/HealthRecordProvider.tsx` |
| `src/healthRecords/index.ts` |
| `src/components/pet-profile/HealthRecordModal.tsx` |
| `src/components/pet-profile/HealthRecordModal.module.css` |
| `src/components/pet-profile/PetMedicalHistory.tsx` |
| `src/components/pet-profile/PetMedicalHistory.module.css` |
| `src/components/empty-states/EmptyHealthRecordsState.tsx` |
| `PetClues_Health_Records_Migration_Report.md` |

---

## Hydrated Components Summary

| Surface | Mock before | Now |
|---------|-------------|-----|
| `PetHealthRecords` | `mockHealthRecords` | `useHealthRecords().records` |
| `PetMedicalHistory` | (did not exist) | Chronological records from provider |
| `PetSummaryCard` vaccinations/allergies | Hardcoded in `petRecordToPetProfile` | `deriveProfileHealthSummary()` |
| `PetProfileHeader` status | `mockProfileStatus` | Derived from record count |

---

## Remaining Mock Health Dependencies

| Area | Mock source | Notes |
|------|-------------|-------|
| Legacy health entries | `mockHealthRecords` in `profileData.ts` | No longer used by UI |
| Legacy type | `HealthRecordEntry` in `types/profile.ts` | Superseded by `HealthRecord` service type |
| Pet profile placeholders | `petRecordToPetProfile()` diet, microchip, conditions | Not in health_records table |
| Passport medical text | `mockMedicalInfo` in `passportData.ts` | Text fields not migrated |
| PetCare Score | `petCareScoreData.ts` health factors | Static mock |
| Age Translator | `healthFocus` from mock service | Not linked to records |
| Timeline | `timelineData.ts` health events | Demo data |
| Onboarding health step | Weight only → pet record | Does not create health_records row |
| Notifications | `notificationData.ts` health vault messages | Not migrated |

---

## Apply Migration

Run after pets, reminders, and pet_documents migrations:

```bash
supabase db push
```

Or apply `20250531400000_create_health_records.sql` manually.

---

## Testing Checklist

1. Open **Pet Profile** with an active pet.
2. Confirm empty state shows **"No health records yet"** with **Add record** CTA.
3. Create a vaccination record - verify Health Records, Medical History, and At a Glance update.
4. Link an uploaded vault document - verify source document name and date display.
5. Edit and delete a record - confirm all sections refresh.
6. Add allergy and weight records - verify summary fields update.
7. Refresh browser - records persist via Supabase.
8. Without Supabase env - confirm localStorage mock path works.

---

## Next Recommended Steps (Not in Scope)

1. Auto-create health records from document scan/OCR pipeline.
2. Migrate passport `MedicalInfoCard` text from aggregated records.
3. Sync onboarding health step to initial wellness/weight records.
4. PetCare Score health factors from real record counts.
5. Timeline events generated from health record CRUD.

---

*Generated as part of the Pet Identity / Reminder / Document Storage follow-up - health records migration.*
