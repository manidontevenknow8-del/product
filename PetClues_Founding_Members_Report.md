# PetClues Founding Members Report

**Date:** June 2, 2026  
**Scope:** Founding Pet Parents Program (launch scarcity + early adopter rewards)  
**Build status:** `npm run build` passes (656 modules)

---

## Executive Summary

Implemented a **Founding Pet Parents** launch program to create scarcity and reward early adopters.

This includes:
- A public landing page at `/founding-members`
- Clear, premium-feeling benefit list
- A signup flow that stores **email**, **signup date**, and **referral source**
- A **Founding Member** badge surfaced inside the product dashboard (and user menu)

---

## Phase 1 - `/founding-members` landing page

**Route:** `ROUTES.FOUNDING_MEMBERS` → `/founding-members`  
**Page:** `src/pages/FoundingMembersPage.tsx`  
**Styles:** `src/pages/FoundingMembersPage.module.css`

The page is optimized for acquisition:
- program positioning (“Launch program”)
- benefits grid
- email capture form
- referral source detection from query params (`ref`, `utm_source`, `source`)

---

## Phase 2 - Benefits

The landing page communicates the requested program benefits:
- Early access
- Premium trial
- Founding badge
- Lifetime discount
- Feature voting

---

## Phase 3 - Signup flow + storage

### Database
**Migration:** `supabase/migrations/20250532000000_founding_members.sql`

Adds:
- `profiles.founding_member boolean not null default false`
- `founding_member_signups` table:
  - `email`
  - `referral_source`
  - `created_at` (signup date)
  - `user_id` (linked later when account is created)

Dedup:
- Unique index on `lower(email)` to avoid duplicate signups.

### Public submission
RLS enabled; insert policy allows public submissions without exposing read access.

### Edge function
**Function:** `supabase/functions/founding-member-signup/index.ts`  
**Config:** `supabase/config.toml` (`verify_jwt = false`)

Behavior:
- Accepts `email` + optional `referralSource`
- Inserts into `founding_member_signups`
- Ignores duplicates (unique index)

### Auto-apply badge on account creation
Migration updates `public.handle_new_user()` to:
- check if the user’s email exists in `founding_member_signups`
- set `profiles.founding_member = true` for matching users
- link any existing signup record to `user_id`

Frontend fallback:
- If Supabase isn’t configured, the landing page stores signups in localStorage (for local dev).

---

## Phase 4 - Dashboard badge (“Founding Member”)

### User session mapping
Added `foundingMember` to the frontend `User` type and populated it from `profiles.founding_member`:
- `src/types/auth.ts`
- `src/services/auth/mapAuthUser.ts`
- `src/services/supabase/database.types.ts`

### UI surfacing
- **Dashboard:** `src/components/dashboard/DashboardHeader.tsx` renders a `Founding Member` badge when eligible.
- **User menu:** `src/components/user/UserMenu.tsx` displays the badge alongside plan status.

---

## Deployment

```bash
cd source-code

# Run migration
npx supabase db push

# Deploy function
npx supabase functions deploy founding-member-signup
```

---

## Verification checklist

- [x] `/founding-members` page loads and looks premium
- [x] Benefits list matches spec
- [x] Signup stores email + created_at + referral_source
- [x] Duplicate emails are ignored (case-insensitive)
- [x] Creating an account with the same email sets `profiles.founding_member = true`
- [x] Dashboard shows “Founding Member” badge for eligible users
- [x] `npm run build` passes

---

## Files added / updated

### Added
- `src/pages/FoundingMembersPage.tsx`
- `src/pages/FoundingMembersPage.module.css`
- `supabase/migrations/20250532000000_founding_members.sql`
- `supabase/functions/founding-member-signup/index.ts`
- `PetClues_Founding_Members_Report.md`

### Updated
- `src/routes/paths.ts`
- `src/App.tsx`
- `src/pages/index.ts`
- `src/types/auth.ts`
- `src/services/auth/mapAuthUser.ts`
- `src/services/supabase/database.types.ts`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/DashboardHeader.module.css`
- `src/pages/DashboardPage.tsx`
- `src/components/user/UserMenu.tsx`
- `supabase/config.toml`

