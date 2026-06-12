# Plan Gate QA Report

**Date:** June 2026  
**Build:** `npm run build` passes  
**DB migration:** `20250610300000_tiered_plan_entitlements.sql` applied  
**Edge functions deployed:** `create-razorpay-order`, `verify-razorpay-payment`, `decode-vet-document`

## Verification checklist

| Check | Status |
|-------|--------|
| Central entitlements in `entitlements.ts` | ✅ |
| No scattered `plan === 'premium'` in UI pages | ✅ (uses `canAccess` / `currentPlan`) |
| Free cannot access Plus features without upgrade | ✅ |
| Plus cannot access Pro-only features | ✅ |
| Pro cannot access Enterprise volume without prompt | ✅ |
| Enterprise shows contact CTA, not upgrade wall | ✅ |
| Pet limits: 1 / 3 / 7 / 100 | ✅ FE + DB |
| Razorpay checkout for Plus and Pro | ✅ |
| No Stripe code paths | ✅ |
| Legacy `premium` tier maps to Pro | ✅ |
| Legacy `family` tier maps to Enterprise | ✅ |
| `isPremium` deprecated but still works (`plan !== 'free'`) | ✅ |
| User-safe error messages (no DB leaks) | ✅ (prior session) |

## Manual test plan

1. **Free user** - create 1 pet OK, 2nd pet blocked with upgrade message
2. **Plus checkout** - Razorpay ₹799, profile shows `subscription_plan: plus`
3. **Plus user** - 3 pets OK, decoder works up to 5/month
4. **Pro checkout** - ₹1,999 (or ₹1,899 founding), advanced score unlocked
5. **Pro user** - 7 pets OK, monthly report download works
6. **Enterprise** - contact email link on pricing/billing

## Known items for manual review

- Plus price (₹799) not specified in original brief - confirm with product
- Enterprise must be provisioned manually in Supabase profiles
- Some components still use legacy `PremiumFeature` keys (mapped via `LEGACY_FEATURE_MAP`)
- `DailyCheckInCard` still uses `isPremium` for 7-day trends - maps to any paid plan (acceptable)

## Dead code / contradictions

| Item | Resolution |
|------|------------|
| `PlanTier = 'free' \| 'premium'` | Kept for backward compat; `commercialPlan` is canonical |
| `PREMIUM_FEATURE_GATES` | Re-exported as `LEGACY_FEATURE_MAP` alias |
| `proUpgradeCopy.ts` | Re-exports from `planUpgradeCopy.ts` |
| Stripe tables | Dropped in Razorpay migration; not re-added |
