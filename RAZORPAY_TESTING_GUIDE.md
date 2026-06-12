# Razorpay Testing Guide

## Prerequisites

1. Apply migration: `supabase db push` or run `20250608100000_razorpay_subscriptions.sql`
2. Deploy edge functions: `create-razorpay-order`, `verify-razorpay-payment`, `razorpay-webhook`
3. Set Supabase secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
4. Set Vercel env: `VITE_RAZORPAY_KEY_ID`, `VITE_PAYMENTS_ENABLED=true`

## 1. Test Payment Flow

1. Sign in at https://petclues.com/login
2. Go to **Billing** → **Upgrade to Pro**
3. Razorpay Checkout opens for **₹299**
4. Complete test payment (Razorpay test mode card)
5. Verify redirect/state refresh - plan shows **Pro / Active**

## 2. Success Scenario

- PostHog events: `premium_checkout_started` → `premium_payment_success` → `premium_subscription_activated`
- `subscriptions` row: `status=active`, `plan=pro`, `razorpay_payment_id` set
- `profiles`: `subscription_plan=pro`, `subscription_status=active`, `subscription_tier=premium`
- Vet Bill Decoder unlocks on Scan page

## 3. Failure Scenario

- Dismiss Razorpay modal → `premium_payment_failed` with `checkout_dismissed`
- Failed card → `premium_payment_failed` with `payment_failed`
- No profile/subscription upgrade

## 4. Expired Session Scenario

- Open checkout with expired JWT → `create-razorpay-order` returns 401
- Re-login and retry

## 5. Duplicate Webhook Scenario

- Replay same webhook payload → `webhook_events` duplicate detected, no double activation
- Replay verify with same `razorpay_payment_id` → returns `{ success: true }` without duplicate insert

## 6. Subscription Persistence (Logout/Login)

1. Complete payment
2. Sign out → sign back in
3. Billing shows Pro / Active
4. Premium features remain unlocked

## 7. Premium Unlock Verification

| Feature | Test |
|---------|------|
| Vet Bill Decoder | Upload vet bill on Scan - decode runs |
| Second pet | Add 2nd pet - succeeds on Pro |
| Monthly report PNG | Download enabled |
| Free user | All above blocked with upgrade prompt |

## Razorpay Dashboard

- Webhook events: `payment.captured`, `payment.failed`
- Orders: receipt prefix `pro_`
