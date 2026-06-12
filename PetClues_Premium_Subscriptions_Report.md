# PetClues Premium Subscriptions Report

**Date:** May 31, 2026  
**Scope:** Stripe billing, subscription state, feature gates, billing UI  
**Build status:** `npm run build` passes (613 modules)

**Principle:** Monetize only after value exists - free tier keeps core care tools; Premium unlocks AI and advanced intelligence.

---

## Executive Summary

PetClues now has a **Premium subscription layer** powered by **Stripe Checkout** and **Supabase-backed subscription state**. Free users get one pet, basic reminders, passport, and document vault. Premium unlocks unlimited pets, Vet Bill Decoder, advanced PetCare Score, advanced health insights, and priority support.

Billing UI, upgrade modals, and server-side enforcement are wired. Mock/localStorage billing still works when Supabase is not configured (local dev).

---

## Plan tiers

### Free

| Feature | Access |
|---------|--------|
| Pets | 1 profile |
| Reminders | Basic |
| Emergency passport | Basic |
| Document vault | Upload & store (no AI decode) |
| PetCare Score | Score + factor cards only |

### Premium ($9/mo · $79/yr)

| Feature | Access |
|---------|--------|
| Pets | Unlimited |
| Vet Bill Decoder | AI extraction + review flow |
| PetCare Score | History, breakdown, trends |
| Health insights | Recommendations, attention items, progress |
| Support | Priority email (`founder@petclues.com`) |
| Future features | Reserved via `futurePremium` gate |

---

## Phase 1 - Stripe integration

### Edge functions

| Function | JWT | Purpose |
|----------|-----|---------|
| `create-checkout-session` | Yes | Create Stripe Checkout for Premium (monthly/yearly) |
| `create-portal-session` | Yes | Open Stripe Customer Portal (manage/cancel) |
| `stripe-webhook` | No | Sync subscription events → database |

### Shared modules

| Path | Purpose |
|------|---------|
| `supabase/functions/_shared/stripe/client.ts` | Stripe SDK, price ID lookup |
| `supabase/functions/_shared/stripe/syncSubscription.ts` | Upsert subscription + sync profile tier |
| `supabase/functions/_shared/subscription/requirePremium.ts` | Server-side premium check |

### Required Supabase secrets

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set STRIPE_PRICE_PREMIUM_MONTHLY=price_...
npx supabase secrets set STRIPE_PRICE_PREMIUM_YEARLY=price_...
npx supabase secrets set APP_BASE_URL=https://app.petclues.app
```

### Stripe Dashboard setup

1. Create **Premium** product with monthly ($9) and yearly ($79) prices.
2. Add webhook endpoint: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Deploy

```bash
cd source-code
npx supabase db push   # or run migration 20250531900000_premium_subscriptions.sql
npx supabase functions deploy create-checkout-session
npx supabase functions deploy create-portal-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy decode-vet-document   # includes premium gate
```

---

## Phase 2 - Subscription tables

**Migration:** `supabase/migrations/20250531900000_premium_subscriptions.sql`

| Table | Purpose |
|-------|---------|
| `stripe_customers` | Maps `user_id` → Stripe customer ID |
| `subscriptions` | Active subscription state (status, interval, period end) |
| `stripe_webhook_events` | Webhook idempotency |

### Profile sync

`profiles.subscription_tier` remains the **denormalized cache** (`free` | `premium` | `family`).

Function `sync_profile_subscription_tier(user_id)` sets tier to `premium` when subscription status is `active` or `trialing`, otherwise `free`.

### Database enforcement

| Rule | Mechanism |
|------|-----------|
| Free = 1 pet | `BEFORE INSERT` trigger on `pets` |
| Vet decoder = Premium | RLS policy on `vet_bill_extractions` INSERT |

---

## Phase 3 - Feature gates

### Gate definitions

**File:** `src/subscription/featureGates.ts`

| Feature key | Premium only |
|-------------|--------------|
| `unlimitedPets` | Yes |
| `vetBillDecoder` | Yes |
| `advancedPetCareScore` | Yes |
| `advancedHealthInsights` | Yes |
| `prioritySupport` | Yes |
| `futurePremium` | Yes |

### Client enforcement

| Location | Gate |
|----------|------|
| `PetProvider.createPet` | Blocks 2nd pet on free plan |
| `ScanPage` | Upload allowed; AI decode requires Premium |
| `PetCareScorePage` | Basic score free; charts/insights Premium |
| `PremiumGate` / `PremiumUpgradePrompt` | Reusable UI wrappers |

### Server enforcement

| Location | Gate |
|----------|------|
| `decode-vet-document` edge function | 403 if not Premium |
| `pets` INSERT trigger | DB error if free user has 1 pet |
| `vet_bill_extractions` RLS | Premium-only INSERT |

### Provider order

`SubscriptionProvider` now wraps `PetProvider` in `main.tsx` so pet limits can read subscription state.

---

## Phase 4 - Billing UI & upgrade flow

### Pages

| Route | Component | Behavior |
|-------|-----------|----------|
| `/pricing` | `PricingPage` | Plan comparison; Premium → Stripe Checkout |
| `/billing` | `BillingPage` | Plan status, usage, portal link, checkout success banner |

### Components

| Component | Purpose |
|-----------|---------|
| `UpgradeModal` | In-app upgrade → `startCheckout(interval)` |
| `PremiumGate` | Blur + overlay for locked features |
| `PremiumUpgradePrompt` | Compact upgrade CTA |
| `SubscriptionCard` | Pricing page plan cards |

### User flows

**Upgrade**

1. User clicks Upgrade (Billing, Pricing, Scan, or PetCare Score gate)
2. `create-checkout-session` → redirect to Stripe Checkout
3. Success → `/billing?checkout=success` → refresh subscription state

**Manage / cancel**

1. Premium user clicks **Manage subscription** on Billing
2. `create-portal-session` → Stripe Customer Portal
3. Webhook updates `subscriptions` + `profiles.subscription_tier`

### Subscription service

| File | Role |
|------|------|
| `src/services/subscription/subscriptionService.ts` | Interface + mock (localStorage) |
| `src/services/subscription/supabaseSubscriptionService.ts` | Stripe + Supabase reads |
| `src/subscription/SubscriptionProvider.tsx` | React context: `isPremium`, `canAccess`, `startCheckout`, `openBillingPortal` |

---

## Architecture

```
User → Pricing / UpgradeModal
  → create-checkout-session (JWT)
  → Stripe Checkout
  → stripe-webhook
  → subscriptions + profiles.subscription_tier

Feature request (e.g. decode-vet-document)
  → requirePremiumTier() + RLS
  → allow or 403 premium_required
```

---

## Verification checklist

- [ ] Run migration `20250531900000_premium_subscriptions.sql`
- [ ] Set Stripe secrets and deploy edge functions
- [ ] Configure Stripe webhook URL + events
- [ ] Free user: create 1 pet ✓, 2nd pet blocked (UI + DB)
- [ ] Free user: upload document ✓, AI decode shows upgrade prompt
- [ ] Premium checkout → success banner on `/billing`
- [ ] Premium user: Vet Bill Decoder works end-to-end
- [ ] Premium user: PetCare Score shows history + insights
- [ ] Manage subscription opens Stripe portal
- [ ] Webhook cancel → tier reverts to `free`
- [x] `npm run build` passes

---

## Files touched

| File | Change |
|------|--------|
| `supabase/migrations/20250531900000_premium_subscriptions.sql` | **New** - tables, triggers, RLS |
| `supabase/functions/create-checkout-session/index.ts` | **New** |
| `supabase/functions/create-portal-session/index.ts` | **New** |
| `supabase/functions/stripe-webhook/index.ts` | **New** |
| `supabase/functions/_shared/stripe/*` | **New** |
| `supabase/functions/_shared/subscription/requirePremium.ts` | **New** |
| `supabase/functions/decode-vet-document/index.ts` | Premium gate |
| `supabase/config.toml` | Stripe function JWT settings |
| `src/services/subscription/supabaseSubscriptionService.ts` | **New** |
| `src/services/subscription/subscriptionService.ts` | Stripe interface + mock |
| `src/subscription/featureGates.ts` | **New** |
| `src/subscription/SubscriptionProvider.tsx` | Checkout + portal + `canAccess` |
| `src/data/subscriptionData.ts` | Updated plan copy |
| `src/components/subscription/PremiumGate.tsx` | **New** |
| `src/components/subscription/PremiumUpgradePrompt.tsx` | **New** |
| `src/components/subscription/UpgradeModal.tsx` | Stripe checkout redirect |
| `src/pages/subscription/BillingPage.tsx` | Portal, usage, success banner |
| `src/pages/subscription/PricingPage.tsx` | Stripe checkout flow |
| `src/pages/ScanPage.tsx` | Vet decoder gate |
| `src/pages/PetCareScorePage.tsx` | Advanced score/insights gate |
| `src/pets/PetProvider.tsx` | Pet limit gate |
| `src/main.tsx` | Provider order |
| `src/services/supabase/database.types.ts` | Subscription tables |
| `.env.example` | Stripe secret docs |

---

## Out of scope

| Item | Notes |
|------|-------|
| Family plan tier | DB supports `family`; maps to Premium gates today |
| Usage-based billing | Flat subscription only |
| Trial periods | Can add via Stripe price config |
| Invoice list in-app | Redirects to Stripe portal |
| Email on subscription change | Future enhancement |

---

## Local dev (no Stripe)

When `VITE_SUPABASE_*` is unset, `mockSubscriptionService` activates Premium instantly via localStorage - same pattern as before. Feature gates still work for UI testing.
