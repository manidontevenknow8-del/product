# PetClues Pet Identity Migration Report

**Date:** May 31, 2026  
**Scope:** Replace hardcoded mock pet ("Luna") with real user-owned pets in Supabase  
**Build status:** `npm run build` passes (561 modules)

**Constraints honored:** No reminders, uploads, billing, or notifications migration. Pet creation, storage, retrieval, and UI hydration only.

---

## Executive Summary

PetClues now stores **real user-owned pets** in Supabase (or localStorage fallback when Supabase is not configured). Onboarding creates a pet record in the database, `PetProvider` hydrates the app globally, and **Dashboard**, **Pet Profile**, and **Emergency Passport** identity sections use the active pet instead of hardcoded Luna data.

---

## 1. Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20250531100000_create_pets.sql` | `pets` table, RLS, updated_at trigger |
| `src/services/pets/petTypes.ts` | `PetRecord`, `CreatePetInput`, `IPetService` interface |
| `src/services/pets/petUtils.ts` | Mapping, age parsing, onboarding → pet input |
| `src/services/pets/mockPetService.ts` | localStorage fallback CRUD |
| `src/services/pets/supabasePetService.ts` | Supabase CRUD implementation |
| `src/services/pets/petService.ts` | Service selector (`getPetService()`) |
| `src/pets/PetProvider.tsx` | Global pet context + active pet management |
| `src/pets/index.ts` | Public exports |
| `src/components/empty-states/EmptyPetProfileState.tsx` | Empty state with "Add your first pet" CTA |
| `PetClues_Pet_Identity_Migration_Report.md` | This report |

---

## 2. Files Modified

| File | Change |
|------|--------|
| `src/services/supabase/database.types.ts` | Added `PetRow` and `pets` table types |
| `src/components/onboarding/OnboardingFlow.tsx` | Creates real pet on completion; sets profile onboarding flag |
| `src/components/onboarding/OnboardingShell.module.css` | Error message styling |
| `src/main.tsx` | Wrapped app with `PetProvider` (inside `AuthProvider`) |
| `src/pages/DashboardPage.tsx` | Uses `usePets()` + `petRecordToPet()` instead of `mockPet` |
| `src/pages/PetProfilePage.tsx` | Hydrates from active pet; empty/loading states |
| `src/pages/EmergencyPassportPage.tsx` | Identity from active pet; health sections remain mock |
| `src/pages/TimelinePage.tsx` | Uses active pet name instead of `mockPet.name` |
| `src/components/dashboard/DashboardHeader.tsx` | Photo support + loading export |
| `src/components/dashboard/DashboardHeader.module.css` | Pet photo styles |
| `src/components/dashboard/index.ts` | Export `DashboardHeaderLoading` |
| `src/components/pet-profile/PetProfileHeader.tsx` | Displays real pet photo when available |
| `src/components/pet-profile/PetProfileHeader.module.css` | Photo styles |
| `src/components/empty-states/EmptyDashboardState.tsx` | CTA text → "Add your first pet" |
| `src/components/empty-states/index.ts` | Export `EmptyPetProfileState` |
| `src/petCareScore/PetCareScoreProvider.tsx` | Uses `activePet.id` instead of `mockPet.id` |

---

## 3. Database Objects

### Table: `public.pets`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `owner_id` | uuid | FK → `auth.users`, cascade delete |
| `name` | text | Required |
| `species` | text | `dog`, `cat`, or `other` |
| `breed` | text | Nullable |
| `birth_date` | date | Parsed from onboarding age string |
| `weight` | text | From onboarding health step |
| `gender` | text | Nullable (`male`, `female`, `unknown`) |
| `photo_url` | text | Base64 data URL until upload service exists |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto via trigger |

### Index

- `pets_owner_id_idx` on `owner_id`

### Trigger

- `pets_set_updated_at` - maintains `updated_at` on row changes

---

## 4. RLS Policies

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read own pets | `SELECT` | `auth.uid() = owner_id` |
| Users can insert own pets | `INSERT` | `auth.uid() = owner_id` |
| Users can update own pets | `UPDATE` | `auth.uid() = owner_id` |
| Users can delete own pets | `DELETE` | `auth.uid() = owner_id` |

---

## 5. Components Hydrated

| Surface | Data source | Fields hydrated |
|---------|-------------|-----------------|
| **Dashboard** | `activePet` via `petRecordToPet()` | Photo, name, breed, age, avatar initials |
| **Pet Profile header** | `petRecordToPetProfile()` | Photo, name, breed, species, age |
| **Pet Profile summary** | Active pet record | Weight, species (health/vault remain mock) |
| **Pet Profile details grid** | Active pet record | Breed, species, weight, birth date, gender |
| **Emergency Passport header** | `petRecordToPassportMeta()` | Photo, name, breed, age, last updated |
| **Passport lost-pet CTA** | Active pet name | Dynamic pet name in copy |
| **Timeline header** | Active pet name | Pet name in feed (events still demo-gated) |
| **PetCare Score provider** | `activePet.id` | Score keyed to real pet ID |

### Empty states

| Page | Behavior |
|------|----------|
| Dashboard | `EmptyDashboardState` - "Add your first pet" → onboarding |
| Pet Profile | `EmptyPetProfileState` - same CTA |
| Emergency Passport | `EmptyPetProfileState` - same CTA |

---

## 6. Auth & Onboarding Flow (Updated)

```
Signup → Verify email → Onboarding
                              ↓
                    createPetFromOnboarding(data)
                              ↓
                    completeOnboarding() → profiles.onboarding_completed = true
                              ↓
                    PetProvider.refreshPets() → activePet set
                              ↓
                         Dashboard (hydrated)
```

Onboarding maps form data to pet record:

- **Basics:** name, species, breed, age → `birth_date`, photo → `photo_url`
- **Health:** weight stored; vaccination/allergies/diet deferred (not in `pets` schema yet)

---

## 7. PetProvider API

```ts
usePets() → {
  pets,              // All pets for current user
  activePet,         // Currently selected pet (defaults to first)
  activePetId,
  isLoading,
  error,
  hasPets,
  refreshPets(),
  setActivePet(id),  // Multi-pet ready
  createPet(input),
  createPetFromOnboarding(data),
}
```

Active pet ID persisted per user in `localStorage` (`petclues_active_pet_{userId}`).

---

## 8. Remaining Mock Pet Dependencies

These areas **still reference mock/Luna data** and are **out of scope** for this migration:

| Area | File(s) | Notes |
|------|---------|-------|
| Reminders | `reminderData.ts`, `ReminderForm.tsx` | Mock Luna reminders |
| Notifications | `notificationData.ts` | Luna in notification copy |
| Family sharing | `familySharingData.ts`, `FamilySharingWidget.tsx` | Hardcoded Luna pet |
| Lost pet | `lostPetService.ts`, `LostPetPage.tsx` | Uses `mockPet` |
| Age translator | `ageTranslatorService.ts` | Uses `mockPetProfile` |
| Scan | `scanData.ts`, `ScanHero.tsx` | Luna in copy/mock results |
| Timeline events | `timelineData.ts` | Demo-gated mock events with Luna content |
| Dashboard activity | `dashboardData.ts` | Mock activity feed mentions Luna |
| PetCare Score insights | `petCareScoreData.ts` | Insight copy references Luna |
| Profile health records | `profileData.ts` | `mockHealthRecords`, vault documents |
| Passport health sections | `passportData.ts` | Medical, vet, owner contacts |
| Profile edit modal | `EditProfileModal` | Local state only; no DB persist yet |
| `mockData.ts` | `mockPet` export | Retained for legacy references; no longer primary source |

---

## 9. Migration Completion Status

| Phase | Status |
|-------|--------|
| 1. Database (`pets` + RLS) | ✅ Complete |
| 2. Pet service layer | ✅ Complete |
| 3. Onboarding integration | ✅ Complete |
| 4. PetProvider context | ✅ Complete |
| 5. Dashboard hydration | ✅ Complete |
| 6. Profile hydration | ✅ Complete (identity; health/vault mock) |
| 7. Passport hydration | ✅ Complete (identity; health mock) |
| 8. Empty states | ✅ Complete |
| 9. Build verification | ✅ Passes |

### Deployment checklist

1. Apply migration: `supabase db push` or run SQL in dashboard
2. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Test flow: signup → verify → onboarding → dashboard shows created pet
4. Test persistence: logout → login → pet data reloads from Supabase

### Recommended next migration

1. **Profile edit persist** - wire `EditProfileModal` to `updatePet()`
2. **Age translator** - hydrate from `activePet.birthDate`
3. **Lost pet** - use `activePet` for case activation
4. **Reminders** - link to real `pet_id`
5. **Photo uploads** - replace base64 `photo_url` with Supabase Storage

---

## 10. Service Architecture

```
getPetService()
├── isSupabaseConfigured() → supabasePetService (PostgreSQL)
└── else                     → mockPetService (localStorage)

PetProvider
└── consumes IPetService
    └── pages/components use usePets()
```

Consistent with auth layer pattern established in Supabase Foundation pass.

---

*End of report - PetClues Pet Identity Migration*
