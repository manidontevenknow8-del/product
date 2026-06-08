# PostHog Integration Audit

**Date:** June 2, 2026  
**Project:** PetClues (`source-code/`)

---

## Executive summary

PostHog was **installed** and partially wired, but events were not reaching the dashboard because:

1. **Initialization was lazy** — `posthog.ts` was only loaded via dynamic `import()` inside `EventTracker`, so `posthog.init()` did not run at application startup.
2. **Production env vars** — `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` must be set in **Vercel** (not Supabase secrets). Vite inlines them at **build time**. If missing during deploy, the production bundle silently skips PostHog.

These issues are now fixed. Local verification confirms the API key is valid and events are accepted by PostHog's ingest endpoint.

---

## Phase 1 — Installation verification

| Check | Result |
|-------|--------|
| `posthog-js` installed | ✅ `package.json` → `posthog-js@^1.382.0` |
| PostHog provider | ✅ `AnalyticsProvider` (`src/analytics/AnalyticsProvider.tsx`) — app-level analytics context; no separate `posthog-js/react` provider (not required) |
| PostHog initialized | ✅ **Fixed** — `initPostHog()` called once in `src/main.tsx` before React render |
| Mounted at startup | ✅ `main.tsx` line: `initPostHog()` |
| `VITE_POSTHOG_KEY` read | ✅ From `import.meta.env.VITE_POSTHOG_KEY` in `src/analytics/posthog.ts` |
| `VITE_POSTHOG_HOST` read | ✅ From `import.meta.env.VITE_POSTHOG_HOST` in `src/analytics/posthog.ts` |

### Previous root cause

Before this fix, `posthog.init()` only ran when the first analytics event triggered a dynamic import of `posthog.ts`. On a cold visit with no routed analytics activity, PostHog never initialized — matching the dashboard symptom **"Waiting for events"**.

---

## Phase 2 — Initialization (current setup)

**File:** `src/analytics/posthog.ts`  
**Startup call:** `src/main.tsx` → `initPostHog()`

```typescript
posthog.init(VITE_POSTHOG_KEY, {
  api_host: VITE_POSTHOG_HOST,
  person_profiles: 'identified_only',
  capture_pageview: false,        // SPA: manual $pageview on route change
  autocapture: true,              // clicks, form interactions
  disable_session_recording: false,
  session_recording: { maskAllInputs: true },
  loaded: () => capture('posthog_test_app_loaded'),
});
```

- Keys are **never hardcoded** — env vars only.
- Init runs **exactly once** at startup.
- `initialized` flag is set in the `loaded` callback (SDK fully ready).

---

## Phase 3 — Environment variables

### Local (`.env.local`)

```
VITE_POSTHOG_KEY=phc_…   ✅ present
VITE_POSTHOG_HOST=https://us.i.posthog.com   ✅ present
```

Verified via Vite `loadEnv()` — both values load in development and production modes.

### Production (Vercel) — action required

Add these to **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_POSTHOG_KEY` | Your `phc_…` project key |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` |

Then **redeploy**. Without redeploy, the old bundle still has no PostHog config.

> ⚠️ Supabase Edge Function secrets do **not** reach the frontend. PostHog keys in Supabase secrets alone will not fix "Waiting for events."

---

## Phase 4 — Verification events added

| Event | When fired | File |
|-------|------------|------|
| `posthog_test_app_loaded` | PostHog SDK `loaded` callback (every app start) | `src/analytics/posthog.ts` |
| `dashboard_viewed` | Dashboard page mount | `src/pages/DashboardPage.tsx` |
| `user_logged_in` | Successful sign-in | `src/auth/AuthProvider.tsx` |
| `pet_created` | Pet created | `src/pets/PetProvider.tsx` |
| `$pageview` | Every route change | `src/analytics/EventTracker.ts` → `posthogAdapter` |
| `posthog_manual_verification_click` | "Send test event" on `/status` | `src/components/analytics/PostHogVerification.tsx` |

All custom events also flow through `eventTracker` → `posthogAdapter` where applicable.

---

## Phase 5 — User identification

**File:** `src/analytics/AnalyticsProvider.tsx`

When authenticated:

```typescript
posthog.identify(user.id, {
  email: user.email,
  plan: user.subscriptionTier ?? subscription.plan ?? 'free',
});
```

On sign-out: `posthog.reset()` via `resetPostHog()` in `EventTracker.setUserId(undefined)`.

Event properties are sanitized (`src/analytics/sanitizeProperties.ts`) — passwords, tokens, etc. are stripped from **event** payloads. Identify traits intentionally include `email` and `plan` per product analytics requirements.

---

## Phase 6 — Debug logging

All logs use the prefix **`[POSTHOG DEBUG]`**:

- PostHog key loaded (masked)
- PostHog host loaded
- PostHog initialized
- Event successfully fired (`<event name>`)
- Event skipped — PostHog not initialized
- User identified
- PostHog session reset

Open browser DevTools → Console on any page after load.

---

## Phase 7 — Verification utility

**Page:** `/status` (System Status)  
**Component:** `PostHogVerification`

Shows:

- Initialized / Not initialized
- Masked key + host from env
- **Send test event** button → fires `posthog_manual_verification_click`

### How to verify in PostHog

1. Open the app (local or production after Vercel redeploy).
2. Open browser console — confirm `[POSTHOG DEBUG] PostHog initialized` and `Event successfully fired posthog_test_app_loaded`.
3. In PostHog → **Activity** (or Live events), filter for `posthog_test_app_loaded`.
4. Visit `/status` and click **Send test event** — look for `posthog_manual_verification_click`.
5. Sign in → `user_logged_in`; open dashboard → `dashboard_viewed`; create pet → `pet_created`.

### API verification (performed during audit)

Direct ingest test to `https://us.i.posthog.com/capture/` returned `{"status":"Ok"}` for:

- `posthog_test_app_loaded`
- `posthog_manual_verification_click`
- `$pageview`

This confirms the project key and host are valid.

---

## Phase 8 — Session replay

**Client:** enabled (`disable_session_recording: false`, inputs masked).

**PostHog dashboard:** ensure Session Replay is enabled for the project:

PostHog → **Project settings** → **Session replay** → turn on recording.

Replay appears after pageviews/events from real browser sessions (may take a few minutes). Ad blockers and strict browser privacy settings can block replay scripts.

---

## File reference

| Purpose | File |
|---------|------|
| Init + debug helpers | `src/analytics/posthog.ts` |
| Startup init call | `src/main.tsx` |
| Provider / identify / pageviews | `src/analytics/AnalyticsProvider.tsx` |
| PostHog adapter | `src/analytics/EventTracker.ts` |
| Verification UI | `src/components/analytics/PostHogVerification.tsx` |
| Status page | `src/pages/SystemStatusPage.tsx` (`/status`) |
| Env documentation | `.env.example` |
| TypeScript env types | `src/vite-env.d.ts` |

---

## Remaining issues / checklist

| Item | Status |
|------|--------|
| Code integration | ✅ Complete |
| Local env vars | ✅ Present in `.env.local` |
| Vercel env vars | ⚠️ **You must confirm** both `VITE_POSTHOG_*` are set and redeploy |
| PostHog Activity shows events | ✅ API accepts events; confirm in UI after redeploy |
| Session Replay | ⚠️ Enable in PostHog project settings + visit site from non-blocked browser |
| Funnels | ✅ Available once Activity receives `$pageview` and custom events |
| Remove debug logs later | Optional — search `[POSTHOG DEBUG]` before GA launch |

---

## Quick fix if still "Waiting for events"

1. Vercel → add `VITE_POSTHOG_KEY` + `VITE_POSTHOG_HOST` (Production + Preview).
2. Trigger a new deployment (env changes require rebuild).
3. Open production URL → DevTools console → `[POSTHOG DEBUG]`.
4. PostHog → Activity → search `posthog_test_app_loaded`.

If console shows `missing VITE_POSTHOG_KEY` — the deploy was built without env vars.
