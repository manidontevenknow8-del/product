# PetClues Referral Report (Infrastructure V1)

**Date:** June 2, 2026  
**Scope:** Invite infrastructure + tracking (no reward issuance)  
**Build status:** `npm run build` passes (656 modules)

---

## Executive Summary

Implemented **Referral Infrastructure V1** to allow PetClues users to invite other pet owners and track:
- invitations
- signups
- conversions (when the invitee becomes Premium)

Rewards are modeled as architecture only:
- **1 successful referral = 1 month Premium**
- No automatic reward issuing is performed yet.

---

## Phase 1 - `referrals` table

**Migration:** `supabase/migrations/20250532100000_referrals_v1.sql`

Adds:

### `referral_codes`
One referral code per user:
- `user_id` (unique)
- `code` (unique)

### `referrals`
Tracks the funnel:
- `inviter_user_id`
  - `invitee_email` (optional)
  - `invitee_user_id` (set on signup attribution)
  - `status`: `invited` → `signed_up` → `converted`
  - `invited_at`, `signed_up_at`, `converted_at`
  - `referral_source` (channel/source label)

Dedup:
- Unique index on `(inviter_user_id, lower(invitee_email))` when `invitee_email` exists.

RLS:
- Users can **read** their own referrals.
- Writes happen via service role edge functions (no direct public insert).

---

## Phase 2 - Generate referral codes

Edge function:
- `supabase/functions/get-referral-code/index.ts` (JWT required)

Behavior:
- Returns existing code if present
- Otherwise generates a unique code and inserts into `referral_codes` (with retry on collision)

Shared helper:
- `supabase/functions/_shared/referrals/code.ts`

---

## Phase 3 - Tracking invitations, signups, conversions

### Invitations
Edge function:
- `supabase/functions/send-referral-invite/index.ts` (JWT required)

Behavior:
- Requires invitee email
- Uses existing referral code for inviter
- Inserts `referrals` row with `status = invited`
- Ignores duplicates per inviter+email

### Signups
Signup attribution is recorded in the **database trigger** `public.handle_new_user()` (redefined in the migration):
- `SignupPage` reads `?ref=CODE` and passes it into Supabase signup metadata (`referral_code`)
- On auth user creation, the trigger:
  - resolves `inviter_user_id` from `referral_codes.code`
  - updates an existing invite row (matching email) OR inserts a new `signed_up` row

Frontend change:
- `src/pages/auth/SignupPage.tsx` now accepts `?ref=` in URL
- `src/services/auth/supabaseAuthService.ts` forwards the referral code to Supabase `user_metadata`

### Conversions
Conversion is recorded when an invitee becomes **Premium**:
- `supabase/functions/_shared/stripe/syncSubscription.ts` marks referrals with `invitee_user_id = userId` as `converted`
- This runs when Stripe subscription status becomes `active` or `trialing`

---

## Phase 4 - Rewards architecture (no issuing)

V1 supports reward **eligibility calculation**:
- Each `converted` referral counts as **1 eligible Premium month**
- No subscription extension / coupon / credit is applied automatically yet

Recommended next step (future):
- Add `referral_rewards_issued` table and a manual admin workflow or scheduled job.

---

## Minimal client service

Added `src/services/referrals/referralService.ts`:
- `getMyReferralCode()`
- `sendInvite()`
- `getStats()` (counts from the `referrals` table)

This intentionally keeps UI minimal while enabling product integration later.

---

## Deployment

```bash
cd source-code

# Run migration
npx supabase db push

# Deploy edge functions
npx supabase functions deploy get-referral-code
npx supabase functions deploy send-referral-invite
```

---

## Verification checklist

- [ ] Run migration `20250532100000_referrals_v1.sql`
- [ ] Deploy edge functions `get-referral-code` + `send-referral-invite`
- [ ] Call `get-referral-code` while authed → returns code
- [ ] Call `send-referral-invite` while authed → creates `referrals` row (invited)
- [ ] Signup using `/signup?ref=<code>` → referral row becomes `signed_up` (or new one created)
- [ ] Convert to Premium via Stripe → referral row becomes `converted`
- [x] `npm run build` passes

---

## Files added / updated

### Added
- `supabase/migrations/20250532100000_referrals_v1.sql`
- `supabase/functions/get-referral-code/index.ts`
- `supabase/functions/send-referral-invite/index.ts`
- `supabase/functions/_shared/referrals/code.ts`
- `src/services/referrals/referralService.ts`
- `PetClues_Referral_Report.md`

### Updated
- `supabase/config.toml`
- `supabase/functions/_shared/stripe/syncSubscription.ts`
- `src/pages/auth/SignupPage.tsx`
- `src/services/auth/supabaseAuthService.ts`
- `src/types/auth.ts`
- `src/services/supabase/database.types.ts`
