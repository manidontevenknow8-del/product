# PetClues Pre-Push Audit

**Date:** June 2, 2026  
**Project:** `source-code/` (PetClues V1 launch candidate)

---

## Build & Quality

| Check | Status | Notes |
|-------|--------|-------|
| `npm run build` | **PASS** | `tsc -b` + Vite production build succeeded |
| TypeScript errors | **PASS** | Zero compile errors |
| ESLint | **N/A** | No ESLint config or `lint` script in `package.json` |
| Broken imports | **PASS** | Build bundles 656 modules without resolution errors |
| Merge conflicts | **PASS** | No conflict markers in source |
| TODO/FIXME in `src/` | **PASS** | None found |

---

## Inventory

| Metric | Count |
|--------|------:|
| Route constants (`paths.ts`) | 49 |
| `<Route>` entries (`App.tsx`) | 48 (+ catch-all 404) |
| Page components (`src/pages/**/*.tsx`) | 50 |
| React providers (`main.tsx`) | 16 |
| Supabase migrations | 20 |
| Supabase tables (public) | 21 |
| Edge functions | 12 |
| Sitemap URLs | 41 |

### Providers

`AuthProvider`, `SubscriptionProvider`, `PetProvider`, `DocumentProvider`, `ReminderProvider`, `HealthRecordProvider`, `GrowthProvider`, `LostPetProvider`, `AgeTranslatorProvider`, `PetCareScoreProvider`, `DailyCheckInProvider`, `SettingsProvider`, `NotificationProvider`, `FamilySharingProvider`, `AnalyticsProvider`, `SEOProvider`

### Supabase tables

`profiles`, `pets`, `reminders`, `pet_documents`, `health_records`, `email_jobs`, `email_send_log`, `vet_bill_extractions`, `stripe_customers`, `subscriptions`, `stripe_webhook_events`, `founding_member_signups`, `referral_codes`, `referrals`, `referral_share_events`, `blog_posts`, `species`, `breeds`, `care_guidelines`, `daily_check_ins`, `rate_limit_windows`

### Edge functions

`create-checkout-session`, `create-portal-session`, `decode-vet-document`, `founding-member-signup`, `get-referral-code`, `get-referral-leaderboard`, `process-email-jobs`, `queue-welcome-email`, `send-email`, `send-referral-invite`, `stripe-webhook`, `track-referral-share`

---

## Environment & Supabase

| Check | Status |
|-------|--------|
| `.env.example` present | Yes (placeholders only) |
| `.env.local` gitignored | Yes - not staged |
| `dist/` gitignored | Yes |
| `node_modules/` gitignored | Yes |
| `supabase/.temp/` gitignored | Yes |
| Supabase project linked | `jjrmxdxswelusrtcvsjf` |
| Security migration applied | User confirmed |
| Edge functions deployed | Yes |
| `CRON_SECRET` configured | Yes |

---

## Remaining Launch Blockers (non-Git)

| Item | Severity | Action |
|------|----------|--------|
| Production hosting env vars | Required before go-live | Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` on Vercel |
| Supabase Auth redirect URLs | Required | Add production domain in Supabase Dashboard |
| Payments | Intentionally off | Keep `VITE_PAYMENTS_ENABLED` unset until Razorpay/Stripe prod ready |
| Resend domain verification | Required for email | Verify sending domain in Resend |

**Git push blockers:** None. Audit passed.

---

## Verdict

**READY TO PUSH** - build passes, no secrets in staged files, `.gitignore` correct.
