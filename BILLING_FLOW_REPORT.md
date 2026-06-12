# Billing Flow Report

## Active provider

**Razorpay only** - no Stripe implementation.

## Checkout flow

1. User selects Plus or Pro on Pricing / Upgrade modal / Billing
2. `SubscriptionProvider.startCheckout(plan)` → `razorpayCheckoutService.startCheckout`
3. Edge function `create-razorpay-order` with `{ plan: 'plus' | 'pro' }`
4. Founding discount applied server-side for Pro only
5. Razorpay modal opens
6. `verify-razorpay-payment` confirms signature + `activatePaidSubscription(plan)`
7. Profile updated: `subscription_plan`, `subscription_status`, `subscription_tier`
8. `sync_profile_subscription_tier` RPC syncs state

## Files

| Layer | Path |
|-------|------|
| Config | `src/config/razorpayConfig.ts` |
| Server pricing | `supabase/functions/_shared/razorpay/client.ts` |
| Checkout UI | `UpgradeModal.tsx`, `PricingPage.tsx`, `BillingPage.tsx` |
| Activation | `syncSubscription.ts` → `activatePaidSubscription` |

## Billing page

- Shows `planLabel`, usage (pets, decodes, reminders, timeline)
- Dynamic upgrade CTA from `upgradeCta` / `upgradeHeadline`
- Enterprise → contact support CTA
- Payment history from `subscriptions` table

## Enterprise

- No Razorpay checkout
- `mailto:support@petclues.com` for sales / custom limits
- Manual profile update required (`subscription_plan: enterprise`, `subscription_tier: family`)

## Stripe readiness

- `subscriptions` table is Razorpay-shaped (no Stripe tables)
- `billingProvider: 'razorpay'` on `Subscription` type
- Future Stripe: add provider field + parallel sync path without removing Razorpay
