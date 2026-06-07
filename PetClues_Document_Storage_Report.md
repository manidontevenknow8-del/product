# PetClues Document Storage Report

**Date:** May 31, 2026  
**Scope:** Real document uploads to Supabase Storage with metadata in `pet_documents`, vault and passport hydration  
**Build status:** `npm run build` passes (575 modules)

**Constraints honored:** Storage only. No OCR, AI extraction, or OpenAI integration.

---

## Executive Summary

PetClues now supports **real document uploads** (PDF, JPG, PNG) stored in a private Supabase Storage bucket (`pet-documents`) with metadata in the `pet_documents` table. Files are linked to real pets via foreign key and RLS. The **Scan page** uploads files with progress/success/error states, the **Profile vault** displays real records, and the **Emergency Passport** surfaces uploaded documents alongside unchanged identity and mock medical text fields.

---

## Phase 1 — Storage Bucket

**File:** `supabase/migrations/20250531300000_create_pet_documents.sql`

### Bucket: `pet-documents`

| Setting | Value |
|---------|-------|
| Public | `false` (private) |
| Max file size | 10 MB (`10485760` bytes) |
| Allowed MIME types | `application/pdf`, `image/jpeg`, `image/png` |
| Access | Authenticated users only (Storage RLS) |

### Storage path format

```
{owner_id}/{pet_id}/{document_id}/{sanitized_file_name}
```

Example: `a1b2-uuid/pet-uuid/doc-uuid/vaccination_record.pdf`

### Storage RLS policies (`storage.objects`)

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read own pet document files | `SELECT` | `bucket_id = 'pet-documents'` AND folder[1] = `auth.uid()` |
| Users can upload own pet document files | `INSERT` | Same path prefix check |
| Users can delete own pet document files | `DELETE` | Same path prefix check |

---

## Phase 2 — Database Migration

### Table: `public.pet_documents`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `pet_id` | uuid | FK → `pets(id)` ON DELETE CASCADE |
| `file_name` | text | Original filename |
| `file_type` | text | MIME type |
| `storage_path` | text | Unique path in bucket |
| `uploaded_at` | timestamptz | Upload timestamp |
| `created_at` | timestamptz | Row creation time |

### Indexes

- `pet_documents_pet_id_idx` on `pet_id`
- `pet_documents_uploaded_at_idx` on `uploaded_at DESC`

### Table RLS policies

All policies verify pet ownership via `EXISTS` subquery on `public.pets`:

| Policy | Operation |
|--------|-----------|
| Users can read documents for own pets | `SELECT` |
| Users can insert documents for own pets | `INSERT` |
| Users can delete documents for own pets | `DELETE` |

---

## Phase 3 — Service Layer

### Files created

| File | Purpose |
|------|---------|
| `src/services/documents/documentTypes.ts` | `IDocumentService`, `PetDocumentRecord`, validation constants |
| `src/services/documents/documentMappers.ts` | Row mapping, path builder, formatters, file validation |
| `src/services/documents/mockDocumentService.ts` | localStorage metadata + base64 blob fallback |
| `src/services/documents/supabaseDocumentService.ts` | Storage upload + DB insert, signed download URLs |
| `src/services/documents/documentService.ts` | `getDocumentService()` factory |
| `src/documents/DocumentProvider.tsx` | Global document context for active pet |
| `src/documents/index.ts` | Public exports |

### Architecture

```
getDocumentService()
  ├── isSupabaseConfigured() → supabaseDocumentService
  └── else                   → mockDocumentService
```

### Service methods

| Method | Description |
|--------|-------------|
| `listByPet(ownerId, petId)` | All documents for a pet, newest first |
| `upload(ownerId, petId, file, onProgress?)` | Storage + metadata insert |
| `delete(ownerId, documentId)` | Remove DB row + storage object |
| `getDownloadUrl(ownerId, documentId)` | Signed URL (Supabase) or data URL (mock) |

---

## Phase 4 — Upload Flow (Scan Page)

```
User selects PDF/JPG/PNG
  → validateDocumentFile() (type + 10 MB limit)
  → DocumentProvider.uploadDocument()
  → supabaseDocumentService.upload()
       1. Upload to pet-documents bucket
       2. Insert pet_documents row
  → UploadZone shows progress bar (0–100%)
  → UploadSuccessCard on success
  → Recent scans list refreshes from DB
```

### Scan page changes

- Removed mock `buildExtractionFromFile` / OCR simulation
- Added `UploadSuccessCard` (storage confirmation, no AI badge)
- `UploadZone` supports uploading, error, and progress states
- `ScanHero` copy updated — no Luna/AI extraction references
- Requires active pet before upload

---

## Phase 5 — Vault Hydration

**Component:** `PetDocumentsVault` (Profile page)

- Uses `useDocuments()` instead of `mockVaultDocuments`
- Displays **file name**, **upload date**, **file type** per record
- Functional upload area with progress, success, and error feedback
- Empty state via `EmptyDocumentsState` when no documents exist

---

## Phase 6 — Passport Integration

**Component:** `PassportDocumentsCard` (new)

- Added to `EmergencyPassportPage` below `MedicalInfoCard`
- Lists uploaded documents for active pet (name, type, date)
- **Passport identity** (`PassportHeader`) unchanged — still from `activePet`
- **Medical text fields** (`MedicalInfoCard`) remain mock until health data migration

---

## Phase 7 — Error Handling

| State | UI |
|-------|-----|
| **Uploading** | Progress bar + percentage in Scan `UploadZone` and Profile vault |
| **Success** | `UploadSuccessCard` on Scan; inline “Document saved to vault” on Profile |
| **Failure** | Red error message in upload zone / vault; “Try again” button |

Validation errors (wrong type, file too large) surface before upload starts.

---

## Files Modified

| File | Change |
|------|--------|
| `src/services/supabase/database.types.ts` | Added `PetDocumentRow` and `pet_documents` table |
| `src/main.tsx` | Wrapped app with `DocumentProvider` (inside `PetProvider`) |
| `src/pages/ScanPage.tsx` | Real upload flow, document list, loading/empty states |
| `src/pages/PetProfilePage.tsx` | Vault uses provider (removed `mockVaultDocuments`) |
| `src/pages/EmergencyPassportPage.tsx` | Added `PassportDocumentsCard` |
| `src/components/scan/UploadZone.tsx` | Progress, error, upload copy (no OCR messaging) |
| `src/components/scan/UploadZone.module.css` | Progress bar + error styles |
| `src/components/scan/ScanHero.tsx` | Storage-focused copy, dynamic pet name |
| `src/components/scan/index.ts` | Export `UploadSuccessCard` |
| `src/components/pet-profile/PetDocumentsVault.tsx` | Real data + functional upload |
| `src/components/pet-profile/PetDocumentsVault.module.css` | Upload progress/error/success styles |
| `src/components/emergency/index.ts` | Export `PassportDocumentsCard` |

---

## Files Created (Summary)

| File |
|------|
| `supabase/migrations/20250531300000_create_pet_documents.sql` |
| `src/services/documents/documentTypes.ts` |
| `src/services/documents/documentMappers.ts` |
| `src/services/documents/mockDocumentService.ts` |
| `src/services/documents/supabaseDocumentService.ts` |
| `src/services/documents/documentService.ts` |
| `src/documents/DocumentProvider.tsx` |
| `src/documents/index.ts` |
| `src/components/scan/UploadSuccessCard.tsx` |
| `src/components/scan/UploadSuccessCard.module.css` |
| `src/components/emergency/PassportDocumentsCard.tsx` |
| `src/components/emergency/PassportDocumentsCard.module.css` |
| `PetClues_Document_Storage_Report.md` |

---

## Remaining Mock Document Dependencies

| Area | Mock source | Notes |
|------|-------------|-------|
| Vault demo data | `mockVaultDocuments` in `profileData.ts` | No longer used by UI |
| Scan extraction | `buildExtractionFromFile`, `mockScanExtraction` in `scanData.ts` | Replaced by storage flow; kept for reference |
| Scan results card | `ScanResultsCard.tsx` | Legacy AI extraction UI; unused on Scan page |
| Passport medical text | `mockMedicalInfo` in `passportData.ts` | Text fields not from documents |
| Health records | `mockHealthRecords` | Separate migration |
| Timeline | `timelineData.ts` document events/stats | Demo data |
| PetCare Score | `document_completeness` factor | Static mock count |
| Notifications | `notificationData.ts` vault messages | Not migrated |
| Demo flag | `DEMO_DATA.profileDocuments` | Never wired |

---

## Apply Migration

Run in Supabase SQL editor or via CLI after pets migration:

```bash
supabase db push
```

Or apply `20250531300000_create_pet_documents.sql` manually.

---

## Testing Checklist

1. Ensure a pet exists and Supabase env is configured.
2. **Scan page:** Upload PDF — verify progress, success card, recent list entry.
3. **Scan page:** Upload JPG/PNG — verify storage.
4. **Scan page:** Upload invalid type or >10 MB — verify error message.
5. **Profile vault:** Confirm documents appear with name, date, type.
6. **Profile vault:** Upload from vault area — verify persistence.
7. **Passport:** Confirm uploaded documents list appears below medical info.
8. Refresh browser — documents persist across sessions.
9. Without Supabase env — confirm localStorage mock path works.

---

## Next Recommended Steps (Not in Scope)

1. Document preview/download buttons (signed URLs already supported in service).
2. OCR / AI extraction pipeline on upload.
3. Scan-to-reminder automation from extracted dates.
4. Migrate pet photos from base64 to Storage.
5. PetCare Score `document_completeness` from real counts.
6. Delete document UI in vault.

---

*Generated as part of the Pet Identity Migration follow-up — document storage foundation.*
