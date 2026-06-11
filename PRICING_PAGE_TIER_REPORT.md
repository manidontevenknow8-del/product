# Pricing Page Tier Report

## Changes

**File:** `src/pages/subscription/PricingPage.tsx`

- Renders **4 plan cards** from `PLANS` in `subscriptionData.ts`
- Added **comparison table** (`PLAN_COMPARISON`)
- Checkout via Razorpay for **Plus** and **Pro** only
- **Enterprise** opens `mailto:support@petclues.com`
- **Free** routes to billing or stays current
- Uses `currentPlan` from `useSubscription()` for "Current plan" badge

## Plan cards

| Card | Price | CTA |
|------|-------|-----|
| Free | Free | Stay on Free |
| Plus | ₹799/month | Upgrade to Plus |
| Pro | ₹1,999/month | Upgrade to Pro (highlighted) |
| Enterprise | Custom | Contact support |

## Hero copy

> Start free with one pet. Upgrade to Plus, Pro, or Enterprise as your household grows.

## No Stripe

- No Stripe imports, UI, or checkout paths
- Razorpay only via `startCheckout('plus' | 'pro')`
