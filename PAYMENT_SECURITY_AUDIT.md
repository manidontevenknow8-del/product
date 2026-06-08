# Payment Security Audit

Generated: 2026-06-08

## Secret Exposure

| Secret | Location | Client exposure |
|--------|----------|-----------------|
| `RAZORPAY_KEY_SECRET` | Supabase Edge Function secrets | ❌ Never |
| `RAZORPAY_WEBHOOK_SECRET` | Supabase Edge Function secrets | ❌ Never |
| `RAZORPAY_KEY_ID` | Supabase secrets + returned in order response | ⚠️ Public by design (same as `VITE_RAZORPAY_KEY_ID`) |
| `VITE_RAZORPAY_KEY_ID` | Vercel frontend env | ✅ Allowed |

## Frontend Audit

```bash
rg -i "RAZORPAY_KEY_SECRET|KEY_SECRET|webhook_secret" src/
# Expected: zero matches
```

| Check | Status |
|-------|--------|
| No secret in `src/` | ✅ |
| Amount set server-side only (`PRO_MONTHLY_AMOUNT_PAISE = 29900`) | ✅ |
| Plan validated server-side (`plan === 'pro'`) | ✅ |
| Payment signature verified server-side (HMAC SHA256) | ✅ |
| Webhook signature verified (`x-razorpay-signature`) | ✅ |
| JWT required on order + verify functions | ✅ |
| Webhook JWT disabled (signature auth) | ✅ |
| Rate limiting on order + verify | ✅ |
| Duplicate payment idempotency | ✅ `razorpay_payment_id` unique index |
| Webhook idempotency | ✅ `webhook_events` table |

## RLS

| Table | Policy |
|-------|--------|
| `subscriptions` | Users read own rows only |
| `webhook_events` | Service role only (no user policies) |

## Recommendations

1. Set `VITE_PAYMENTS_ENABLED=true` only after migration + edge function deploy
2. Configure Razorpay webhook URL: `https://jjrmxdxswelusrtcvsjf.supabase.co/functions/v1/razorpay-webhook`
3. Use live keys only on production Vercel + Supabase
4. Rotate webhook secret if exposed
