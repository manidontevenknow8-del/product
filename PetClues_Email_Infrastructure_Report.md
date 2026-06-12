# PetClues Email Infrastructure Report

**Date:** May 31, 2026  
**Scope:** Resend-powered email delivery for care reminders and weekly summaries  
**Build status:** `npm run build` passes (600 modules)

**Constraints honored:** Email only via Resend. No push notifications implemented.

---

## Executive Summary

PetClues now has a **Resend email infrastructure** with three email types, branded mobile-friendly HTML templates, a future-proof scheduling architecture (cron + job queue), and integration with notification preferences stored on user profiles.

Delivery runs server-side via Supabase Edge Functions - the Resend API key never touches the frontend.

---

## Phase 1 - Resend integration

### Client email service

| File | Purpose |
|------|---------|
| `src/services/email/resendEmailService.ts` | `IEmailService` - invokes edge functions |
| `src/services/email/emailTypes.ts` | Shared types for payloads and jobs |
| `src/services/email/index.ts` | Public exports |

### Edge function (Resend SDK)

| File | Purpose |
|------|---------|
| `supabase/functions/_shared/email/resendClient.ts` | Resend client wrapper |
| `supabase/functions/send-email/index.ts` | On-demand single send (JWT required) |

### Environment secrets (Supabase Edge Function secrets)

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Resend API authentication |
| `RESEND_FROM_EMAIL` | Sender address (e.g. `PetClues <reminders@yourdomain.com>`) |
| `APP_BASE_URL` | Links in emails (reminders, dashboard) |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected for cron processor |

Documented in `.env.example` (secrets are **not** frontend env vars).

---

## Phase 2 - Email templates

### Location

`supabase/functions/_shared/email/`

| File | Purpose |
|------|---------|
| `layout.ts` | Branded wrapper - PetClues colors, serif logo, mobile viewport |
| `templates.ts` | Template builders + plain-text fallbacks |

### Design

- Warm neutral palette (`#FAF8F5` background, `#C4A882` accent)
- Single-column 560px max width - mobile-friendly
- Inline CSS for email client compatibility
- Preheader text for inbox previews
- Primary CTA button per email type

### Email types

| Type | Subject pattern | Content |
|------|-----------------|---------|
| **Upcoming Reminder** | `Upcoming: {title} for {pet}` | Task details, due label, link to `/reminders` |
| **Overdue Reminder** | `Overdue: {title} for {pet}` | Days overdue, original due date, link to `/reminders` |
| **Weekly Pet Summary** | `Weekly pet summary - {date}` | Per-pet upcoming/overdue counts, next task, link to `/dashboard` |

---

## Phase 3 - Scheduling architecture

### Three-layer design (future-proof)

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Cron (Supabase scheduled edge function)       │
│  process-email-jobs @ 08:00 UTC daily                   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Layer 2: Direct scan (V1 active path)                  │
│  Scan reminders + profiles → send eligible emails       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Layer 3: Job queue (V2+ deferred sends)                │
│  email_jobs table → processed by same edge function     │
└─────────────────────────────────────────────────────────┘
```

### Cron configuration

**File:** `supabase/config.toml`

```toml
[functions.process-email-jobs]
verify_jwt = false
schedule = "0 8 * * *"
```

### Client scheduler API

**File:** `src/services/email/emailScheduler.ts`

| Export | Purpose |
|--------|---------|
| `IEmailScheduler` | Interface for enqueue / cancel / list |
| `SupabaseEmailScheduler` | Writes to `email_jobs` table |
| `MockEmailScheduler` | Local dev no-op |
| `UPCOMING_REMINDER_LEAD_DAYS` | 3 days before due |
| `WEEKLY_SUMMARY_DAY` | Sunday (0) |

### Processor logic

**File:** `supabase/functions/process-email-jobs/index.ts`

| Email | Trigger rule | Dedup key |
|-------|--------------|-----------|
| Upcoming | Due exactly 3 days from today | `reminder:{id}:upcoming:{due_date}` |
| Overdue | Due date before today | `reminder:{id}:overdue:{today}` (daily) |
| Weekly summary | Sunday UTC | `weekly:{week_start}` |

### Database

**Migration:** `supabase/migrations/20250531600000_email_infrastructure.sql`

| Table | Purpose |
|-------|---------|
| `email_jobs` | Deferred send queue (`pending` → `sent` / `failed`) |
| `email_send_log` | Audit + deduplication (`unique user_id + email_type + dedup_key`) |
| `profiles.notification_preferences` | JSONB preferences read by processor |

---

## Phase 4 - Notification preferences

### New preference keys

| Key | Controls |
|-----|----------|
| `emailUpcomingReminders` | Upcoming reminder emails |
| `emailOverdueReminders` | Overdue reminder emails |
| `emailWeeklySummary` | Weekly pet summary emails |

### Policy gating

**File:** `src/services/email/notificationEmailPolicy.ts`

| Email type | Requires |
|------------|----------|
| Upcoming | `emailUpcomingReminders` + `upcomingCareAlerts` + `reminderNotifications` |
| Overdue | `emailOverdueReminders` + `reminderNotifications` |
| Weekly summary | `emailWeeklySummary` + `monthlyRecap` |

Edge function mirrors the same rules in `_shared/email/preferences.ts`.

### Settings persistence

| File | Change |
|------|--------|
| `src/services/settings/supabaseSettingsService.ts` | **New** - syncs preferences to `profiles.notification_preferences` |
| `src/services/settings/settingsService.ts` | `getSettingsService()` selects Supabase or mock |
| `src/components/settings/NotificationSettingsCard.tsx` | In-app vs Email (Resend) sections |
| `src/components/notifications/NotificationPreferences.tsx` | Updated copy - email via Resend, no push |

---

## Deployment checklist

1. Run migration: `supabase db push`
2. Set edge function secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx
   supabase secrets set RESEND_FROM_EMAIL="PetClues <reminders@yourdomain.com>"
   supabase secrets set APP_BASE_URL=https://your-app-url.com
   ```
3. Deploy functions:
   ```bash
   supabase functions deploy send-email
   supabase functions deploy process-email-jobs
   ```
4. Verify domain in Resend dashboard
5. Confirm cron schedule in Supabase dashboard → Edge Functions → Schedules

---

## Verification checklist

- [ ] Save email preferences in Settings → stored in `profiles.notification_preferences`
- [ ] Create reminder due in 3 days → upcoming email on next cron run
- [ ] Leave reminder overdue → daily overdue email (once per day)
- [ ] Sunday cron → weekly summary email per enabled user
- [ ] Disable `emailUpcomingReminders` → no upcoming emails sent
- [ ] Duplicate send blocked via `email_send_log`
- [x] `npm run build` passes

---

## Architecture diagram

```
User toggles email prefs (Settings UI)
  → supabaseSettingsService
  → profiles.notification_preferences

Daily cron (08:00 UTC)
  → process-email-jobs edge function
  → Read profiles + reminders
  → canSendEmailType(preferences)
  → Check email_send_log (dedup)
  → Resend API
  → Log to email_send_log

Future: enqueue exact-time jobs
  → email_jobs (scheduled_for)
  → Same processor picks up pending jobs
```

---

## Out of scope (by design)

| Item | Notes |
|------|-------|
| Push notifications | Not implemented |
| SMS | Not implemented |
| In-app notification delivery | Separate from email pipeline |
| Email open/click tracking | Can add via Resend webhooks later |

---

## Files touched

| File | Change |
|------|--------|
| `src/services/email/*` | **New** - client email layer |
| `supabase/functions/send-email/index.ts` | **New** - on-demand send |
| `supabase/functions/process-email-jobs/index.ts` | **New** - cron processor |
| `supabase/functions/_shared/email/*` | **New** - templates + Resend |
| `supabase/migrations/20250531600000_email_infrastructure.sql` | **New** - schema |
| `supabase/config.toml` | **New** - cron schedule |
| `src/services/settings/supabaseSettingsService.ts` | **New** - preference sync |
| `src/types/settings.ts` | Email preference keys |
| `src/data/settingsData.ts` | Labels + defaults |
| `src/components/settings/NotificationSettingsCard.tsx` | Email section UI |
| `src/services/supabase/database.types.ts` | New tables + profile column |
| `.env.example` | Resend secret documentation |
