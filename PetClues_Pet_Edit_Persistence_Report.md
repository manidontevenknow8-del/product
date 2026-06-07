# PetClues Pet Edit Persistence Report

**Date:** May 31, 2026  
**Scope:** Persist pet profile edits to Supabase and hydrate all active-pet surfaces  
**Build status:** `npm run build` passes (562 modules)

**Constraints honored:** Pet updates only. No reminders, uploads (storage service), AI, or billing work.

---

## Executive Summary

Users can now edit their pet from **Pet Profile → Edit profile** and have changes saved to Supabase (or localStorage when Supabase is not configured). `PetProvider.updatePet()` writes through the pet service and updates in-memory state immediately, so **Dashboard**, **Profile**, **Passport**, **Timeline header**, and **PetCare Score** all reflect the new identity without a full page reload.

---

## Phase 1 — Audit (Before Implementation)

| Component | Prior behavior |
|-----------|----------------|
| `EditProfileModal` | Local-only save via `onSave(updated: PetProfile)`; included non-persisted fields (diet, vaccination, allergies, microchip, conditions) |
| `PetProfilePage` | Derived profile from `activePet` but `onSave={setProfile}` bypassed Supabase and `PetProvider` |
| `PetProvider` | Exposed `createPet`, `refreshPets`, `setActivePet` — **no `updatePet`** |
| `petService` | `updatePet()` already implemented in both `supabasePetService` and `mockPetService` |

**Gap:** Service layer was ready; UI and context were not wired.

---

## Phase 2 — Implementation

### Persistence flow

```
EditProfileModal
  → editPetFormToUpdateInput(form)
  → PetProfilePage.handleSave(input)
  → PetProvider.updatePet(petId, input)
  → getPetService().updatePet(ownerId, petId, input)   // Supabase or mock
  → setPets(prev => prev.map(...))                     // in-place context update
  → activePet recomputes → all usePets() consumers re-render
```

### Editable fields (mapped to `pets` table)

| UI field | DB column | Notes |
|----------|-----------|-------|
| Pet name | `name` | Required; validated in modal |
| Species | `species` | `dog` / `cat` / `other` |
| Breed | `breed` | Nullable |
| Age | `birth_date` | Free text → `parseAgeToBirthDate()` (same as onboarding) |
| Weight | `weight` | Nullable text |
| Gender | `gender` | `male` / `female` / `unknown` / null |
| Photo | `photo_url` | Base64 data URL (same pattern as onboarding; no upload service) |

Non-persisted profile fields (diet, vaccination, allergies, microchip, conditions) were **removed from the edit modal** — they remain display-only placeholders in `petRecordToPetProfile()` until future health-record migrations.

---

## Phase 3 — Hydration Verification

All surfaces read from `usePets().activePet` (or derived mappers). After `updatePet()` updates the `pets` array, these re-render automatically:

| Page / surface | Data source | Updates on edit |
|----------------|-------------|-----------------|
| **Dashboard** | `petRecordToPet(activePet)` → `DashboardHeader` | Name, species, breed, age, weight, photo |
| **Pet Profile** | `petRecordToPetProfile(activePet)` | Full identity + gender, date of birth display |
| **Emergency Passport** | `petRecordToPassportMeta(activePet)` | Name, breed, age, photo, last updated |
| **Timeline header** | `activePet?.name` | Pet name in header copy |
| **PetCare Score** | `activePet.id` in `PetCareScoreProvider` | Score keyed by pet id (unchanged on edit); provider stays in sync with active pet |

No additional refresh call is needed — local state patch avoids a loading flash from `refreshPets()`.

---

## Phase 4 — Error Handling & UX

`EditProfileModal` now implements:

| State | Behavior |
|-------|----------|
| **Loading** | Primary button shows "Saving…"; cancel/close/fields disabled |
| **Success** | Green banner "Profile saved successfully."; modal auto-closes after ~900ms |
| **Error** | Red banner with message (validation or Supabase error); modal stays open for retry |

Styling matches existing PetClues patterns (auth/onboarding error banners; onboarding photo picker layout).

---

## Files Modified

| File | Change |
|------|--------|
| `src/services/pets/petTypes.ts` | Added `EditPetForm` type |
| `src/services/pets/petUtils.ts` | Added `petRecordToEditPetForm()`, `editPetFormToUpdateInput()` |
| `src/services/pets/petService.ts` | Exported new helpers and `EditPetForm` type |
| `src/pets/PetProvider.tsx` | Added `updatePet(petId, input)` with in-memory state sync |
| `src/components/pet-profile/EditProfileModal.tsx` | Async save; persisted fields only; photo + gender; loading/success/error UI |
| `src/components/pet-profile/EditProfileModal.module.css` | Photo section, error/success banners |
| `src/pages/PetProfilePage.tsx` | Wired `updatePet`; removed local profile state; passes `activePet` to modal |

---

## Files Unchanged (Already Supported Updates)

| File | Role |
|------|------|
| `src/services/pets/supabasePetService.ts` | `updatePet()` → Supabase `.update()` + RLS |
| `src/services/pets/mockPetService.ts` | `updatePet()` → localStorage fallback |
| `src/pages/DashboardPage.tsx` | Already hydrates from `activePet` |
| `src/pages/EmergencyPassportPage.tsx` | Already hydrates from `activePet` |
| `src/pages/TimelinePage.tsx` | Already uses `activePet?.name` |
| `src/petCareScore/PetCareScoreProvider.tsx` | Already uses `activePet.id` |

---

## Remaining Pet-Related Mock Dependencies

These still use hardcoded or mock data and are **out of scope** for this task:

| Area | Mock source | Notes |
|------|-------------|-------|
| Profile status badge | `mockProfileStatus` | Wellness/status not in DB |
| Health records | `mockHealthRecords` | Not migrated |
| Document vault | `mockVaultDocuments` | Not migrated |
| Dashboard status chip | `mockPetStatus` | Not in `pets` table |
| Dashboard activity / insight | `mockRecentActivity`, demo insight | Demo data |
| PetCare Score content | `mockPetCareScoreService` | Score logic not tied to real health data |
| Age Translator | `mockPetProfile` in service | Should use `activePet` (future) |
| Lost Pet mode | `mockPet` in provider/service | Should use `activePet` (future) |
| Reminders | `mockPet`, `reminderData` | Explicitly deferred |
| Timeline events | `mockTimelineEvents` | Demo data |
| Passport medical/vet/owner | `passportData` mocks | Health/contact not migrated |
| Notifications | `notificationData` (Luna) | Not migrated |
| Family sharing widget | Hardcoded "Luna" copy + `familySharingData` | Not migrated |
| Scan hero | Hardcoded "Luna" copy | Not migrated |
| `src/data/mockData.ts` | Legacy `mockPet` | Still referenced by lost pet + reminders |

---

## Testing Checklist

1. Sign in and open **Pet Profile → Edit profile**.
2. Change name, breed, weight, gender, age — save.
3. Confirm **Dashboard** header shows updated name/photo.
4. Confirm **Profile** details grid reflects changes.
5. Confirm **Emergency Passport** identity section updates (including "Last updated").
6. Confirm **Timeline** header uses new pet name.
7. Force an error (e.g. disconnect network) — verify error banner and retry.
8. Without Supabase env vars — confirm localStorage mock path still updates via `mockPetService`.

---

## Next Recommended Steps (Not in Scope)

1. Migrate health records, diet, allergies, microchip to real tables.
2. Replace `mockPet` in Lost Pet and Age Translator with `activePet`.
3. Dedicated birth-date picker (instead of age text) for precision.
4. Real photo upload to Supabase Storage (replace base64 in `photo_url`).

---

*Generated as part of the Pet Identity Migration follow-up — pet edit persistence.*
