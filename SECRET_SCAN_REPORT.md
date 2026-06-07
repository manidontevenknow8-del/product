# PetClues Secret Scan Report

**Date:** June 2, 2026  
**Scope:** `source-code/` (excluding `node_modules/`, `dist/`)

---

## Scan patterns

Searched for: `sk_live`, `sk_test`, `sk-or-v1`, `re_`, `whsec_`, `service_role`, `eyJhbGci` (JWT), `password`, `api_key`, hardcoded tokens.

---

## Findings

### Critical — must NOT commit

| File | Finding | Status |
|------|---------|--------|
| `.env.local` | Live `VITE_SUPABASE_ANON_KEY` JWT | **GITIGNORED** — not staged |
| `dist/assets/*.js` | Inlined anon key from build | **GITIGNORED** — not staged |

### Safe — placeholders or documentation only

| File | Finding |
|------|---------|
| `.env.example` | `your-anon-key`, commented `sk-or-v1-...`, `re_xxxxxxxx`, `sk_test_...` |
| `PetClues_*_Report.md` | Example CLI commands with `sk_test_...`, `whsec_...` placeholders |
| `scripts/smoke-welcome-email.mjs` | Fetches `service_role` at runtime via Supabase CLI (not stored) |
| `supabase/functions/**/*.ts` | `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` etc. — env only |
| `supabase/migrations/*.sql` | `grant ... to service_role` (Postgres role name, not a key) |
| `supabase/config.toml` | `project_id` only (public project ref) |

### No matches in application source

- No hardcoded Stripe, OpenRouter, Resend, Razorpay, or PostHog keys in `src/` or `supabase/functions/`
- No service-role key strings in tracked TypeScript/SQL

---

## `.gitignore` verification

```
.env / .env.local / .env.*.local  ✅
.env.production / .env.staging    ✅
node_modules/                     ✅
dist/                             ✅
supabase/.temp/                   ✅
*.pem, credentials.json           ✅
```

`git check-ignore` confirmed: `.env.local`, `dist`, `node_modules`, `supabase/.temp` are ignored.

---

## Staged-files check

```
git diff --cached — no .env.local, dist/, or node_modules/ files
```

---

## Verdict

**PASS** — Safe to push. No secrets in tracked/staged files.

**Post-push reminder:** Rotate Supabase anon key if `.env.local` or `dist/` were ever committed to any remote in the past (not applicable to this first push).
