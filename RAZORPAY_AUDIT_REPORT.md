# Razorpay Audit Report

Generated: 2026-06-08

## Pre-Implementation State

| Area | Finding |
|------|---------|
| Payment provider | Stripe edge functions only (`create-checkout-session`, `create-portal-session`, `stripe-webhook`) |
| Razorpay | UI copy only + test-user script |
| Lemon Squeezy | **None** |
| Checkout | Gated by `VITE_PAYMENTS_ENABLED`; redirected to Stripe Checkout |
| DB | `stripe_customers`, Stripe-shaped `subscriptions`, `stripe_webhook_events` |
| Premium gates | `profiles.subscription_tier` + client `featureGates.ts` |
| Invoices | Empty placeholder |

## Stripe Files Removed

| File | Action |
|------|--------|
| `supabase/functions/create-checkout-session/index.ts` | **Deleted** |
| `supabase/functions/create-portal-session/index.ts` | **Deleted** |
| `supabase/functions/stripe-webhook/index.ts` | **Deleted** |
| `supabase/functions/_shared/stripe/client.ts` | **Deleted** |
| `supabase/functions/_shared/stripe/syncSubscription.ts` | **Deleted** |
| `supabase/config.toml` Stripe function entries | **Removed** |
| `src/services/subscription/supabaseSubscriptionService.ts` Stripe invokes | **Replaced** with Razorpay |
| `src/services/supabase/database.types.ts` Stripe table types | **Replaced** |

## Stripe Remnants (Historical Only)

| File | Note |
|------|------|
| `supabase/migrations/20250531900000_premium_subscriptions.sql` | Original Stripe schema — superseded by `20250608100000_razorpay_subscriptions.sql` |
| `PetClues_Premium_Subscriptions_Report.md` | Legacy documentation — not runtime code |

**No Stripe imports remain in `src/` or active edge functions.**

## Missing Infrastructure (Now Implemented)

| Gap | Resolution |
|-----|------------|
| Razorpay order creation | `create-razorpay-order` edge function |
| Payment verification | `verify-razorpay-payment` edge function |
| Webhook handler | `razorpay-webhook` edge function |
| Razorpay DB schema | Migration `20250608100000_razorpay_subscriptions.sql` |
| Frontend checkout | `razorpayCheckoutService.ts` |
| Premium source of truth | `profiles.subscription_status` + `subscription_plan` |
| PostHog payment events | `premium_checkout_started`, `premium_payment_success`, etc. |
| Billing page data | Dynamic plan, status, renewal, payment history |

## Current Billing UI Map

| File | Role |
|------|------|
| `src/pages/subscription/PricingPage.tsx` | Public/authenticated pricing — Pro ₹299/month |
| `src/pages/subscription/BillingPage.tsx` | Plan status, usage, payment history, upgrade |
| `src/components/subscription/UpgradeModal.tsx` | Razorpay checkout modal |
| `src/components/subscription/PremiumFeatureGuard.tsx` | `subscription_status` gate |
| `src/components/subscription/PremiumGate.tsx` | Legacy wrapper (still used) |
| `src/subscription/SubscriptionProvider.tsx` | Checkout orchestration |
| `src/services/payments/razorpayCheckoutService.ts` | Razorpay Checkout.js integration |

## Pricing Alignment

| Plan | Backend | Frontend |
|------|---------|----------|
| Pro monthly | ₹299 (29900 paise) — server-only | `PRO_MONTHLY_PRICE_DISPLAY` |
| Yearly | **Not offered V1** | Removed from pricing UI |
