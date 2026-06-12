# Complete Plan & Gating Report

## 1. Final plan structure

| Tier | Pets | Price | Checkout |
|------|------|-------|----------|
| **Free** | 1 | ₹0 | - |
| **Plus** | 3 | ₹799/mo | Razorpay |
| **Pro** | 7 | ₹1,999/mo (₹1,899 founding) | Razorpay |
| **Enterprise** | 100 | Custom | support@petclues.com |

Value progression: **Free → Plus → Pro → Enterprise**

## 2. Feature matrix

See [`ENTITLEMENT_MATRIX.md`](ENTITLEMENT_MATRIX.md) and [`FEATURE_GATING_MATRIX.md`](FEATURE_GATING_MATRIX.md).

## 3. Limits by plan

See [`PLAN_LIMITS_AUDIT.md`](PLAN_LIMITS_AUDIT.md).

## 4. Upgrade prompts

| From | Message | CTA |
|------|---------|-----|
| Free | Want more pets? Upgrade to Plus. | Upgrade to Plus |
| Plus | Need more pets or advanced features? Upgrade to Pro. | Upgrade to Pro |
| Pro | Managing more than 7 pets? Upgrade to Enterprise. | Contact support |
| Enterprise | Need a custom deployment? Contact support. | support@petclues.com |

Implemented in `entitlements.ts` (`UPGRADE_CTA`, `UPGRADE_HEADLINE`) and surfaced on Billing, UserMenu, Pricing.

## 5. Backend enforcement

| Mechanism | Location |
|-----------|----------|
| Pet limit trigger | `enforce_pet_limit()` on `pets` INSERT |
| Vet bill RLS | Plus+ with active/trialing status |
| Decoder plan check | `requirePlanTier('plus')` |
| Decoder monthly cap | Count in `decode-vet-document` |
| Razorpay activation | `activatePaidSubscription(plan)` |
| Profile sync | `sync_profile_subscription_tier` |

## 6. Frontend architecture

```
entitlements.ts          ← single source of truth
    ↓
featureGates.ts        ← compatibility wrapper
    ↓
SubscriptionProvider   ← currentPlan, canAccess, limits, checkout
    ↓
PremiumGate / pages    ← UI gates only
```

**Key files created/updated:**
- `src/subscription/entitlements.ts`
- `src/data/planUpgradeCopy.ts`
- `src/data/subscriptionData.ts` (4 plans + comparison)
- `src/config/razorpayConfig.ts` (Plus + Pro pricing)
- `supabase/migrations/20250610300000_tiered_plan_entitlements.sql`

## 7. Remaining blockers

| Item | Owner | Notes |
|------|-------|-------|
| Confirm Plus price ₹799 | Product | Placeholder middle tier |
| Enterprise provisioning | Ops | Manual DB update |
| Frontend redeploy | DevOps | Required for UI changes |
| Decoder usage display | Engineering | Show monthly vs lifetime count |
| Family sharing UI gate | Engineering | Entitlement defined; verify page wiring |

## 8. Stripe

**Not implemented.** `billingProvider: 'razorpay'` on subscription type. Code structured so a future `stripe` provider can parallel Razorpay without removing existing flows.

## 9. Reports generated

- `ENTITLEMENT_MATRIX.md`
- `PLAN_LIMITS_AUDIT.md`
- `PRICING_PAGE_TIER_REPORT.md`
- `BILLING_FLOW_REPORT.md`
- `FEATURE_GATING_MATRIX.md`
- `PLAN_GATE_QA_REPORT.md`
- `COMPLETE_PLAN_AND_GATING_REPORT.md` (this file)

---

PetClues is now a **tiered subscription product** with centralized entitlements, strict feature gating, Razorpay billing for Plus/Pro, and Enterprise via support contact.
