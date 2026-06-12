# PetClues Supabase Foundation Report

**Date:** May 31, 2026  
**Scope:** Supabase foundation layer only - auth, profiles, configuration  
**Build status:** `npm run build` passes (555 modules)

**Constraints honored:** No pet/reminder/timeline/upload/billing migration. Mock data layers remain active for all feature domains except authentication.

---

## Executive Summary

PetClues now has a production-ready **Supabase foundation**: client configuration, environment validation, `profiles` table migration, real Supabase Auth service, automatic profile creation on signup, auth state listener, and real email verification flow (demo skip removed).

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, the app uses **real Supabase Auth**. Without them, the app **falls back to mock auth** so local development and CI builds continue to work.

---

## 1. Files Created

| File | Purpose |
|------|---------|
| `src/services/supabase/config.ts` | Env validation, `isSupabaseConfigured()`, redirect URL helper |
| `src/services/supabase/client.ts` | Singleton Supabase client |
| `src/services/supabase/database.types.ts` | Typed `profiles` table schema |
| `src/services/supabase/index.ts` | Public Supabase module exports |
| `src/services/auth/types.ts` | `IAuthService` interface |
| `src/services/auth/mockAuthService.ts` | LocalStorage mock (fallback when Supabase not configured) |
| `src/services/auth/supabaseAuthService.ts` | Real Supabase Auth implementation |
| `src/services/auth/mapAuthUser.ts` | Maps Supabase user + profile → app `User` |
| `src/services/auth/profileService.ts` | Profile fetch, ensure, onboarding update |
| `src/pages/auth/AuthCallbackPage.tsx` | Handles email confirmation & recovery redirects |
| `src/pages/auth/ResetPasswordPage.tsx` | Set new password after recovery link |
| `supabase/migrations/20250531000000_create_profiles.sql` | Profiles table, RLS, auto-create trigger |
| `.env.example` | Required environment variable template |

---

## 2. Files Modified

| File | Change |
|------|--------|
| `package.json` | Added `@supabase/supabase-js` dependency |
| `package-lock.json` | Lockfile updated |
| `src/services/auth/authService.ts` | Refactored to export `getAuthService()` selector |
| `src/types/auth.ts` | Extended `AuthResult` for pending email verification |
| `src/auth/AuthProvider.tsx` | Real auth listener, `refreshSession`, `resendVerificationEmail`, `updatePassword`, pending verification state |
| `src/auth/GuestRoute.tsx` | Redirects unverified users to verify email |
| `src/auth/ProtectedRoute.tsx` | Unchanged behavior - still uses real auth state via provider |
| `src/pages/auth/SignupPage.tsx` | Handles pending verification signup flow |
| `src/pages/auth/LoginPage.tsx` | Redirects unverified users to verify email |
| `src/pages/auth/VerifyEmailPage.tsx` | Removed demo skip; added resend + verification check |
| `src/pages/auth/AuthPages.module.css` | Styles for resend button and success message |
| `src/App.tsx` | Added `/auth/callback`, `/reset-password`; verify email is public |
| `src/routes/paths.ts` | Added `AUTH_CALLBACK`, `RESET_PASSWORD` routes |
| `src/vite-env.d.ts` | Typed Supabase env vars |

---

## 3. Supabase Configuration Summary

### Architecture

```
src/services/supabase/
├── config.ts      → env validation, isSupabaseConfigured()
├── client.ts      → singleton createClient()
├── database.types.ts → ProfileRow, Database types
└── index.ts       → public exports

src/services/auth/
├── types.ts           → IAuthService interface
├── authService.ts     → getAuthService() selector
├── mockAuthService.ts → fallback (no env vars)
├── supabaseAuthService.ts → real auth
├── profileService.ts  → profiles table access
└── mapAuthUser.ts     → user mapping
```

### Service selection

```ts
// authService.ts
export function getAuthService(): IAuthService {
  return isSupabaseConfigured() ? supabaseAuthService : mockAuthService;
}
```

### Client options

- Session persistence enabled
- Auto token refresh enabled
- URL hash detection for email confirmation callbacks

---

## 4. Auth Flow Summary

### Signup

1. User submits signup form
2. `supabase.auth.signUp()` with `name` in user metadata
3. DB trigger `on_auth_user_created` creates `profiles` row (`onboarding_completed=false`, `subscription_tier='free'`)
4. Fallback `ensureProfile()` if trigger hasn't run yet
5. If email confirmation required → navigate to `/verify-email` (no session)
6. If confirmation disabled → session created, proceed to verify/onboarding

### Login

1. `supabase.auth.signInWithPassword()`
2. Profile fetched from `profiles` table
3. `needsOnboarding` derived from `onboarding_completed`
4. Unverified users redirected to `/verify-email`

### Email verification

1. User clicks link in email → redirects to `/auth/callback`
2. Supabase processes token; session refreshed
3. Verified users → onboarding or dashboard
4. **Demo skip removed** - "Continue to setup" checks real `email_confirmed_at`
5. **Resend verification** via `supabase.auth.resend()`

### Forgot / reset password

1. `resetPasswordForEmail()` sends link to `/auth/callback?type=recovery`
2. Callback redirects to `/reset-password`
3. `updateUser({ password })` sets new password

### Logout

- `supabase.auth.signOut()` clears session
- Auth state listener updates UI

### Onboarding completion

- Updates `profiles.onboarding_completed = true` (not pets table - pets migration deferred)
- `setHasActivePet(true)` in frontend still runs for empty-state logic

### Auth state listener

- `AuthProvider` subscribes via `onAuthStateChange`
- Profile re-fetched on each auth event
- Loading state preserved until first auth event

---

## 5. Database Objects Created

### Table: `public.profiles`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | - | FK → `auth.users`, unique |
| `name` | text | null | From signup metadata |
| `email` | text | - | From auth user |
| `avatar_url` | text | null | Future use |
| `onboarding_completed` | boolean | `false` | Drives onboarding guard |
| `subscription_tier` | text | `'free'` | Check: free/premium/family |
| `created_at` | timestamptz | `now()` | |
| `updated_at` | timestamptz | `now()` | Auto-updated on change |

### RLS policies

- Users can **read** own profile
- Users can **update** own profile
- Users can **insert** own profile (fallback if trigger delayed)

### Triggers & functions

- `handle_new_user()` - auto-creates profile on `auth.users` insert
- `set_profiles_updated_at()` - maintains `updated_at`

### Migration file

`supabase/migrations/20250531000000_create_profiles.sql`

Apply with Supabase CLI:

```bash
supabase db push
# or run SQL manually in Supabase Dashboard → SQL Editor
```

---

## 6. Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes (for real auth) | Project URL, e.g. `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes (for real auth) | Public anon key from Supabase dashboard |

Copy `.env.example` to `.env.local` and fill in values.

### Supabase dashboard configuration

1. **Authentication → URL Configuration**
   - Site URL: `http://localhost:5173` (dev) or production URL
   - Redirect URLs: `http://localhost:5173/auth/callback`, production equivalent

2. **Authentication → Email**
   - Enable email confirmation (recommended for production)
   - Configure SMTP or use Supabase default mailer

3. **Run migration** in SQL Editor or via CLI

---

## 7. Remaining Mock Systems Still Active

These services **still use localStorage/mock data** and were **not migrated**:

| Domain | Service | Storage |
|--------|---------|---------|
| Pets / profile UI | `mockData`, `mockPet` ("Luna") | Static mock |
| Reminders | `mockReminderService` | localStorage |
| Settings | `mockSettingsService` | localStorage |
| Notifications | `mockNotificationService` | localStorage |
| Family sharing | `mockFamilySharingService` | localStorage |
| PetCare Score | `mockPetCareScoreService` | localStorage |
| Subscription / billing | `mockSubscriptionService` | localStorage |
| Growth / waitlist | `mockGrowthService` | localStorage |
| Lost pet | `mockLostPetService` | localStorage |
| Timeline | `demoData` gated mock | Static / flag |
| Scan uploads | Mock processing | No storage |
| Dashboard activity | `dashboardData` mock | Static |

### Auth fallback

When Supabase env vars are **not** set, `mockAuthService` is used automatically. Mock auth still allows email verification via the UI flow (local state only) - useful for offline development.

---

## 8. Manual Testing Checklist

| Flow | Status | Notes |
|------|--------|-------|
| Signup | ✅ Implemented | Requires Supabase project + migration |
| Login | ✅ Implemented | Blocks unconfirmed email when Supabase requires it |
| Logout | ✅ Implemented | Clears Supabase session |
| Forgot password | ✅ Implemented | Sends Supabase reset email |
| Reset password | ✅ Implemented | `/reset-password` after recovery callback |
| Email verification | ✅ Implemented | Demo skip removed; resend works |
| Protected routes | ✅ Preserved | Redirect to login / verify / onboarding |
| Guest routes | ✅ Preserved | Redirect authenticated users appropriately |
| Feature pages | ✅ Unchanged | Still use mock pet/reminder data |

---

## 9. Recommended Next Steps

1. Create Supabase project and apply migration
2. Configure redirect URLs and email templates
3. Test full auth flow in staging
4. **Next migration phase:** `pets` table + replace `mockPet`
5. Then: reminders, settings sync, notifications, family sharing

---

*End of report - PetClues Supabase Foundation Layer*
