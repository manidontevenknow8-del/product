# PetClues V1 Product Audit Report

**Audit date:** May 31, 2026  
**Scope:** Full static inspection of `source-code/` (35 page components, 506 build modules)  
**Method:** Route/navigation mapping, component inventory, content review, auth flow tracing, responsive CSS audit  
**Build status:** `npm run build` passes (verified in prior session)  
**No code changes were made during this audit.**

---

## Executive Summary

PetClues V1 is a **coherent, well-structured frontend product** with a consistent design system, modular architecture, and complete route coverage for all major features. The app is **ready for backend integration** as a closed beta, with clear service interfaces (`IAuthService`, `IReminderService`, etc.) and provider patterns throughout.

Primary gaps before production: **mock data layer** (single hardcoded pet "Luna"), **onboarding data not persisted**, **internal dev routes exposed in user navigation**, and a handful of **dead/orphan UI paths**.

---

## Launch Readiness Scores

| Category | Score | Notes |
|----------|------:|-------|
| **Routing** | **88/100** | All routes registered; minor orphans and layout mismatches |
| **UX / User Flow** | **82/100** | Core journey works; friction at onboarding→data disconnect |
| **Mobile** | **86/100** | Strong breakpoint coverage; bottom nav density |
| **Design Consistency** | **84/100** | Shared tokens/UI; legacy duplicate components remain |
| **Product Completeness** | **78/100** | UI complete; backend placeholders throughout |
| **Overall V1 Readiness** | **84/100** | Suitable for beta + backend wiring |

---

## PART 1: ROUTING AUDIT

### Route Map (Primary Product Surface)

```
Landing (/)
├── Auth
│   ├── Signup (/signup) → Verify Email (/verify-email) → Onboarding (/onboarding)
│   ├── Login (/login)
│   └── Forgot Password (/forgot-password)
├── Growth (public)
│   ├── Waitlist (/waitlist)
│   ├── Referrals (/referrals)
│   └── Pricing (/pricing)
├── Legal (public)
│   ├── Privacy (/privacy)
│   ├── Terms (/terms)
│   └── Cookies (/cookies)
└── App (protected)
    ├── Dashboard (/dashboard)
    ├── Pet Profile (/pet-profile)
    ├── Scan (/scan)
    ├── Timeline (/timeline)
    ├── Emergency Passport (/emergency-passport)
    ├── Reminders (/reminders)
    ├── PetCare Score (/pet-care-score)
    ├── Age Translator (/age-translator)
    ├── Settings (/settings)
    ├── Family Sharing (/family)
    ├── Notifications (/notifications)
    ├── Lost Pet (/lost-pet)
    ├── Billing (/billing)
    └── Beta Feedback (/beta-feedback)

Public emergency
└── Lost Pet Report (/lost-pet/report)

Internal / ops (protected, not in primary user IA)
├── Launch Readiness (/launch-readiness)
├── Beta Release Report (/beta-release)
├── Analytics (/analytics) ⚠ orphan
└── Legacy redirects
    ├── /settings/account → /settings
    └── /settings/profile → /settings?section=account ⚠ query ignored

Public ops ⚠ layout mismatch
└── System Status (/status) — uses AppLayout but route is public

Catch-all
└── 404 (*)
```

### Per-Route Detail

| Route | Auth | Reachable From | Status | Missing Dependencies |
|-------|------|----------------|--------|----------------------|
| `/` Landing | Public | Direct, logo links | ✅ Working | None |
| `/signup` | Guest | Landing CTA, pricing, header | ✅ Working | Supabase Auth |
| `/login` | Guest | Header, signup link, 404 | ✅ Working | Supabase Auth |
| `/forgot-password` | Guest | Login page | ✅ Working (mock) | Email delivery |
| `/verify-email` | Protected* | Post-signup | ✅ Working (demo skip) | Real email verification |
| `/onboarding` | Protected* | Post-verify | ✅ Working | Pet persistence to DB |
| `/dashboard` | Protected | Nav, post-onboarding, logo | ✅ Working | Real pet/user data |
| `/pet-profile` | Protected | Primary nav, header (unused) | ✅ Working | Backend profile sync |
| `/scan` | Protected | Primary nav, quick actions | ✅ Working | File storage + OCR |
| `/timeline` | Protected | Primary nav | ⚠ Partial | Add event is no-op; mock data only |
| `/emergency-passport` | Protected | Primary nav, quick actions | ✅ Working | Live medical data |
| `/reminders` | Protected | Primary nav, widgets, `?create=true` | ✅ Working | Backend reminders |
| `/pet-care-score` | Protected | Secondary nav, dashboard widget, profile | ✅ Working | Score calculation job |
| `/age-translator` | Protected | Secondary nav, profile, quick actions | ✅ Working | Pet age from real DOB |
| `/settings` | Protected | User menu, secondary nav, quick actions | ✅ Working | Settings persistence |
| `/family` | Protected | Secondary nav, user menu, dashboard widget | ✅ Working | Invitations + RLS |
| `/notifications` | Protected | User menu, bell dropdown, secondary nav | ✅ Working | Push/email delivery |
| `/lost-pet` | Protected | Secondary nav, profile, quick actions, passport | ✅ Working | Real-time alerts |
| `/lost-pet/report` | Public | Shared links | ✅ Working | Sighting backend |
| `/billing` | Protected | User menu | ✅ Working | Stripe |
| `/pricing` | Public/Auth | Footer, user menu, landing | ✅ Working | Stripe |
| `/waitlist` | Public | Landing, footer, secondary nav† | ✅ Working | Waitlist DB |
| `/referrals` | Public | Footer area, secondary nav† | ✅ Working | Referral tracking |
| `/privacy`, `/terms`, `/cookies` | Public | Footer | ✅ Working | Legal review |
| `/status` | Public‡ | Footer | ⚠ Layout issue | Public layout needed |
| `/beta-feedback` | Protected | User menu, top nav, error page | ✅ Working | Feedback backend |
| `/launch-readiness` | Protected | Secondary nav | ✅ Dev tool | Hide from prod nav |
| `/beta-release` | Protected | Secondary nav, status page | ✅ Dev tool | Hide from prod nav |
| `/analytics` | Protected | **None** | ⚠ Orphan | Add to dev nav or remove |
| `/settings/account` | Protected | — | ✅ Redirects to `/settings` | — |
| `/settings/profile` | Protected | — | ⚠ Redirect broken | Query param not read |
| `*` 404 | Public | Unknown URLs | ✅ Working | — |

\* `requireOnboardingComplete={false}` for verify/onboarding  
† Visible in authenticated sidebar — odd for logged-in users  
‡ Public route renders `AppLayout` (sidebar, bottom nav) without auth

### Routing Issues Found

| Severity | Issue |
|----------|-------|
| **Medium** | `/analytics` registered but not linked anywhere in navigation |
| **Medium** | `/status` is public but uses `AppLayout` — unauthenticated visitors see app chrome and protected nav links |
| **Low** | `/settings/profile` redirects with `?section=account` but `SettingsPage` ignores URL params |
| **Low** | Duplicate route aliases (`/settings/account`, `/settings/profile`) — redirects work but add noise |
| **Low** | Internal audit routes (`/launch-readiness`, `/beta-release`) exposed in production secondary nav |
| **None** | No circular routing detected |
| **None** | No duplicate route paths |
| **None** | No broken footer/legal links (previously `#privacy` — now fixed) |

---

## PART 2: USER FLOW AUDIT

### Primary Journey Map

```
Landing → Signup → Verify Email → Onboarding → Dashboard
                                                      ↓
                    ┌─────────────────────────────────┼─────────────────────────┐
                    ↓                                 ↓                         ↓
              Pet Profile                          Reminders                    Scan
                    ↓                                 ↓                         ↓
              (feature cards)                      Timeline                 Passport
                    ↓                                                           ↓
         PetCare Score / Age Translator / Lost Pet / Family              PetCare Score
```

### Flow Verification

| Step | Connects? | Notes |
|------|-----------|-------|
| Landing → Signup | ✅ | Multiple CTAs (hero, header) |
| Signup → Verify | ✅ | Auto-navigate on success |
| Verify → Onboarding | ✅ | "Continue to setup" + demo skip |
| Onboarding → Dashboard | ✅ | `completeOnboarding()` then navigate |
| Dashboard → Profile | ✅ | Bottom nav, primary nav |
| Dashboard → Reminders | ✅ | Bottom nav, widgets |
| Dashboard → Scan | ✅ | Bottom nav, quick actions |
| Dashboard → Timeline | ✅ | Bottom nav |
| Dashboard → Passport | ✅ | Bottom nav, quick actions |
| Dashboard → PetCare Score | ✅ | Widget + quick actions |
| Back navigation | ✅ | Browser back works; no trap routes |
| Mobile navigation | ✅ | Bottom nav (6 items) + hamburger menu |
| Auth guard | ✅ | Unauthenticated → `/login` with return state |
| Onboarding guard | ✅ | Incomplete onboarding → `/onboarding` |
| Email guard | ✅ | Unverified → `/verify-email` |

### Friction Points

| Severity | Issue | Impact |
|----------|-------|--------|
| **High** | Onboarding collects pet name/species/health but **does not persist** to app state — dashboard always shows mock "Luna" | User confusion post-setup |
| **Medium** | Timeline "Add event" button calls `onAddEvent={() => {}}` — dead action | User gets stuck expecting modal |
| **Medium** | Scan page shows **empty** recent scans until upload; Timeline/Profile show **mock** data — inconsistent first-run experience | Uneven empty-state behavior |
| **Medium** | Verify email has "Skip for now (demo)" — acceptable for beta but bypasses security gate | Must remove for production |
| **Low** | 8 quick actions on dashboard — high choice density on mobile (2×4 grid) | Mild cognitive load |
| **Low** | "Profile" in primary nav = **pet profile**, not user settings — naming could confuse | Terminology |
| **Low** | Referrals/Waitlist in sidebar for authenticated users | Growth pages in app nav feel out of place |

### Auth Flow Edge Cases

- **Logged-in user visits `/login`** → Redirected to dashboard/onboarding ✅
- **Logged-in user visits `/signup`** → Redirected ✅
- **404 "Go to dashboard"** while logged out → Redirects to login via ProtectedRoute... actually 404 is public, link goes to `/dashboard` which triggers login ✅
- **Guest visits `/pricing` upgrade** → Redirected to signup ✅

---

## PART 3: CONTENT AUDIT

No lorem ipsum detected. Copy is on-brand, calm, and pet-focused throughout.

### Page-by-Page Content Report

| Page | Headline | Supporting Text | CTAs | Empty State | Content Quality |
|------|----------|-----------------|------|-------------|-----------------|
| Landing | ✅ Hero H1 | ✅ Subtitle + sections | ✅ Start free, waitlist, pricing | N/A | Strong |
| Signup/Login | ✅ | ✅ | ✅ Labeled buttons | N/A | Good |
| Verify Email | ✅ | ✅ | ✅ Continue, skip demo | N/A | Good (demo caveat) |
| Onboarding | ✅ Step titles | ✅ Form hints | ✅ Navigation labels | N/A | Good |
| Dashboard | ✅ Pet header | ✅ Widget copy | ✅ Quick actions (8) | ✅ EmptyDashboardState | Good; crowded |
| Pet Profile | ✅ Header | ✅ Feature cards | ✅ View score, translate, lost pet | ✅ Vault empty state | Good |
| Scan | ✅ ScanHero | ✅ Upload hints | ✅ Upload zone | ✅ EmptyDocumentsState | Good |
| Timeline | ✅ Header + stats | ✅ Event descriptions | ⚠ Add event (dead) | ✅ EmptyTimelineState | Good |
| Passport | ✅ Header | ✅ Medical sections | ✅ Share, QR, lost pet | N/A | Realistic mock |
| Reminders | ✅ SectionHeader | ✅ Filters | ✅ New reminder | ✅ EmptyRemindersState | Good |
| PetCare Score | ✅ SectionHeader | ✅ Encouraging copy | N/A | Loading state only | Good |
| Age Translator | ✅ | ✅ Insight cards | ✅ Share | N/A | Good |
| Settings | ✅ | ✅ Per-card descriptions | ✅ Save buttons | N/A | Good |
| Family | ✅ | ✅ Permission descriptions | ✅ Invite caretaker | ✅ Shared pets list | Good |
| Notifications | ✅ | ✅ | ✅ Mark all read | ✅ EmptyNotificationsState | Good |
| Lost Pet | ✅ | ✅ Recovery copy | ✅ Activate modal | Context-dependent | Serious tone ✅ |
| Pricing | ✅ H1 | ✅ Plan descriptions | ✅ Select plan | N/A | Good |
| Billing | ✅ | ✅ | ✅ Manage | N/A | Mock subscription |
| Waitlist/Referrals | ✅ | ✅ Growth stats | ✅ Join, share | N/A | Good |
| Legal pages | ✅ | ✅ Sections | Back link | N/A | Placeholder legal ⚠ |
| 404 | ✅ | ✅ | ✅ Go home, dashboard | N/A | Good |

### Content Flags

| Flag | Location | Severity |
|------|----------|----------|
| Hardcoded "Luna" in 14+ data files | All pet-facing pages | **High** for backend |
| "Coming soon" placeholders | Settings security/privacy, family future access, smart suggestions | **Expected** for V1 |
| Legal pages marked "Legal review required" | `/privacy`, `/terms`, `/cookies` | **High** for GA |
| Generic mock activity feed | Dashboard RecentActivityFeed | **Low** |
| Duplicate insight cards | Dashboard has WeeklyInsightWidget + ImportantInsightCard | **Low** |

---

## PART 4: COMPONENT AUDIT

### Design System Usage

**Shared UI (`components/ui/`):** Button, Card, Input, Textarea, Badge, Avatar, EmptyState, PageContainer, SectionHeader — used consistently across pages.

### Violations / Duplicates

| Issue | Files | Severity |
|-------|-------|----------|
| **Legacy PetCareScoreCard** (dashboard) superseded by `pet-care-score/PetCareScoreCard` | `components/dashboard/PetCareScoreCard.tsx` still exported | Low — dead code |
| **Legacy AccountSettings / ProfileSettings** superseded by Settings cards | `components/user/AccountSettings.tsx`, `ProfileSettings.tsx` — orphaned | Low — dead code |
| **Custom toggle in AccountSettings** vs **SettingsToggle** | Duplicate toggle implementations | Low |
| **Header `variant="app"`** never used | `components/layout/Header.tsx` — app nav dead branch | Low |
| **Modal patterns** — 9 modals, mostly consistent bottom-sheet on mobile | All use overlay + escape + body lock ✅ | None |
| **Card styling** — mix of CSS module cards vs `ui/Card` component | Many feature cards use custom `.card` classes instead of `Card` | Low — visual consistency maintained via tokens |

### Component Health

| Component Type | Consistent? | Notes |
|----------------|-------------|-------|
| Buttons | ✅ | Single `Button` with variants sm/md/lg |
| Inputs | ✅ | Shared Input with labels |
| Cards | ⚠️ | Tokens consistent; not always `Card` wrapper |
| Badges | ✅ | Shared Badge |
| Navigation | ✅ | Single PRIMARY/SECONDARY nav config |
| Modals | ✅ | Shared ReminderModal.module.css pattern replicated |
| Empty states | ✅ | Unified `empty-states/` module |

---

## PART 5: DASHBOARD & CORE PAGE AUDIT

### Dashboard

| Criterion | Assessment |
|-----------|------------|
| Information hierarchy | ⚠️ Score row → family → overdue → invite → reminders → quick actions — **many competing sections** |
| Visual balance | Good on desktop; mobile stacks cleanly |
| Card consistency | ✅ Shared tokens; widgets match |
| Mobile responsiveness | ✅ 2-col → 1-col at 768px |
| CTA placement | ✅ Quick actions at bottom; widgets link to features |
| Weak sections | InviteFriendsCard may feel promotional mid-dashboard |
| Overcrowding | **8 quick actions + 9 dashboard sections** — consider prioritization |

### Pet Profile

| Criterion | Assessment |
|-----------|------------|
| Hierarchy | ✅ Header → feature links → summary → details → records → vault |
| Feature links | ✅ Score, age translator, lost pet — good cross-linking |
| Mobile | ✅ Feature links stack at 640px |

### Scan

| Criterion | Assessment |
|-----------|------------|
| Flow | ✅ Hero → upload → results → supported docs → recent |
| Empty state | ✅ Shows until first upload |
| Processing | ✅ Mock 1.8s delay with extraction |

### Timeline

| Criterion | Assessment |
|-----------|------------|
| Filters | ✅ Working with empty filtered state |
| Add event | ❌ **No-op handler** |
| Content | Mock events always present — empty state rarely shown |

### Passport

| Criterion | Assessment |
|-----------|------------|
| Layout | ✅ Single-column card stack — mobile-friendly |
| Lost pet integration | ✅ CTA when inactive/active |
| QR reveal | ✅ Toggle works |

### PetCare Score

| Criterion | Assessment |
|-----------|------------|
| Layout | ✅ Score → history/breakdown → factors → insights grid |
| Mobile | ✅ Grids collapse at 900px |
| Completeness | Full page with all sub-cards |

---

## PART 6: MOBILE AUDIT

### Breakpoint Strategy

- **900px:** Sidebar hidden, bottom nav shown, hamburger menu
- **768px:** Most grids → single column
- **640px:** Padding reduction, touch targets 44px
- **480px:** Fine-tuned card layouts (score, age translator)

### Device Simulation Results (CSS/code review)

| Check | iPhone | Android | Tablet |
|-------|--------|---------|--------|
| Bottom navigation | ✅ 6 items tight but functional | ✅ Same | Hidden — sidebar shown |
| Hamburger menu | ✅ Full secondary nav | ✅ | N/A |
| Card stacking | ✅ | ✅ | ✅ 2-col where designed |
| Horizontal scroll | ✅ Prevented globally | ✅ | ✅ |
| Modals (bottom sheet) | ✅ | ✅ | ✅ Centered on wider |
| Form inputs (16px anti-zoom) | ✅ | ✅ | ✅ |
| Notification dropdown | ✅ Fixed position mobile | ✅ | ✅ Dropdown |
| Quick actions 2×4 grid | ✅ | ✅ | 4-col on desktop |

### Mobile Issues List

| # | Issue | Severity |
|---|-------|----------|
| 1 | Bottom nav has **6 items** — labels truncate on narrow screens | Medium |
| 2 | Dashboard is **long scroll** with 9+ sections on mobile | Medium |
| 3 | Analytics table requires horizontal scroll on mobile | Low (dev page) |
| 4 | Settings nav horizontal scroll on mobile — works but easy to miss sections | Low |
| 5 | `/status` public page shows full app chrome on mobile without login | Medium |

---

## PART 7: DESIGN CONSISTENCY AUDIT

### Token Adherence (`styles/tokens.css`)

| Token | Consistent? |
|-------|-------------|
| Colors (cream/sage/gold palette) | ✅ |
| Typography (Cormorant + Inter) | ✅ |
| Spacing scale | ✅ |
| Border radius (sm/md/lg/xl/full) | ✅ |
| Shadows (sm/md/lg) | ✅ |
| Transitions | ✅ |

### Premium Language Breaks

| Issue | Location |
|-------|----------|
| Inline styles on SystemStatusPage link | Minor |
| GuestRoute loading returns `null` (blank flash) vs ProtectedRoute "Loading…" | Minor inconsistency |
| `ProtectedRoute` loading uses inline styles instead of shared component | Minor |
| Referral/waitlist pages use `PublicLayout` — slightly different from landing footer/header | Acceptable |

**Overall:** Design language is cohesive and premium. No major visual breaks detected.

---

## PART 8: LAUNCH READINESS — ISSUE REGISTER

### Critical Issues (must fix before production GA)

| # | Issue | Area |
|---|-------|------|
| C1 | All core data is **mock/localStorage** — no Supabase connection | Backend |
| C2 | Onboarding pet data **not persisted** — user sees unrelated mock pet | UX/Data |
| C3 | Legal pages are **placeholders** requiring counsel review | Legal |
| C4 | Email verification is **bypassable** via demo skip | Auth |

### High Priority Issues

| # | Issue | Area |
|---|-------|------|
| H1 | Single hardcoded pet "Luna" across entire app | Data model |
| H2 | Timeline "Add event" is a dead button | UX |
| H3 | `/status` public route uses authenticated app layout | Routing |
| H4 | No real file upload/storage for scan documents | Backend |
| H5 | No payment processor (Stripe) connected | Billing |
| H6 | Internal dev routes visible in user-facing sidebar | Navigation |

### Medium Priority Issues

| # | Issue | Area |
|---|-------|------|
| M1 | `/analytics` orphan route | Routing |
| M2 | `/settings/profile` redirect query param ignored | Routing |
| M3 | Inconsistent empty vs mock data (scan empty, timeline full) | UX |
| M4 | Dashboard section density — cognitive overload | UX |
| M5 | Waitlist/referrals in authenticated secondary nav | IA |
| M6 | Legacy dead components still in codebase | Maintenance |
| M7 | No skeleton loading states — text-only "Loading…" | Polish |
| M8 | Bundle size 547KB — needs code splitting | Performance |

### Nice-to-Have Improvements

| # | Issue |
|---|-------|
| N1 | Hide dev routes behind env flag or admin role |
| N2 | Read `?section=` param in SettingsPage |
| N3 | Use shared `Card` wrapper everywhere |
| N4 | Remove legacy `dashboard/PetCareScoreCard`, `user/AccountSettings` |
| N5 | Add "More" bottom nav item to reduce 6-icon density |
| N6 | Consolidate dashboard insight widgets |
| N7 | Connect onboarding → `appState.hasActivePet` dynamically |
| N8 | Add sitemap.xml generation at deploy |

---

## RECOMMENDED FIXES (Pre-Supabase Priority Order)

### Phase 1 — Before backend integration (frontend-only, ~1–2 days)

1. Remove or env-gate dev routes from `SECONDARY_NAV` (launch-readiness, beta-release, analytics)
2. Fix `/status` to use `PublicLayout` instead of `AppLayout`
3. Wire Timeline "Add event" to placeholder modal or link to scan
4. Read URL search params in `SettingsPage` for section deep-linking
5. Delete or deprecate legacy duplicate components
6. Connect `appState.hasActivePet` to onboarding completion locally

### Phase 2 — Backend integration (Supabase)

1. Replace `mockAuthService` → Supabase Auth
2. Create `pets` table; wire onboarding → pet creation
3. Wire reminders, notifications, settings, family sharing to Supabase + RLS
4. File storage bucket for scan documents
5. Real email verification (remove demo skip)

### Phase 3 — Beta launch

1. Legal counsel review
2. Enable analytics provider (PostHog/Plausible)
3. Stripe billing
4. Error monitoring (Sentry)
5. Deploy with OG images, sitemap, env-based config

---

## APPENDIX: Architecture Readiness for Backend

| Layer | Ready? | Interface |
|-------|--------|-----------|
| Auth | ✅ | `IAuthService` |
| Reminders | ✅ | `IReminderService` |
| Settings | ✅ | `ISettingsService` |
| Notifications | ✅ | `INotificationService` |
| Family sharing | ✅ | `IFamilySharingService` |
| PetCare Score | ✅ | `IPetCareScoreService` |
| Growth/Referral | ✅ | `IGrowthService` |
| Lost Pet | ✅ | `ILostPetService` |
| Subscription | ✅ | `ISubscriptionService` |
| Feedback | ✅ | `IFeedbackService` |
| Analytics | ✅ | `EventTracker` + adapters |

**Verdict:** Architecture is clean and swap-ready. Backend integration can proceed module-by-module without UI rewrites.

---

*End of report — PetClues V1 Product Audit*
