# Premium Pricing Restructure — QA Report

Generated: 2026-06-08

## 1. Updated pricing pages

| Location | Status |
|----------|--------|
| `/pricing` (`PricingPage.tsx`) | ✅ Premium hero copy, 4 plan cards, billing toggle, feature matrix |
| `SubscriptionCard` | ✅ Apple-like tiers: Free minimal, Plus highlighted, Pro glow + MOST POPULAR, Enterprise dark |
| `BillingPage` | ✅ Uses centralized `pricingConfig` (₹2,999 Plus / ₹4,999 Pro) |
| `UpgradeModal` | ✅ Updated copy (3 pets / 10 pets) |

### Monthly pricing

| Plan | Price |
|------|-------|
| Free | ₹0/month |
| Plus | ₹2,999/month |
| Pro | ₹4,999/month |
| Enterprise | Custom — support@petclues.com |

### Annual pricing (2 months free)

| Plan | Annual | Savings display |
|------|--------|-----------------|
| Plus | ₹29,990/year | Save ₹5,998/year |
| Pro | ₹49,990/year | Save ₹9,998/year |
| Enterprise | Hidden | Contact Sales |

---

## 2. Updated billing logic

| Component | Status |
|-----------|--------|
| `src/config/pricingConfig.ts` | ✅ Single source of truth (INR + paise) |
| `create-razorpay-order` edge function | ✅ Accepts `interval: monthly \| yearly` |
| `verify-razorpay-payment` | ✅ Passes interval to activation |
| `syncSubscription.ts` | ✅ 30-day expiry (monthly), 365-day (yearly) |
| `razorpayCheckoutService` | ✅ Interval passed through checkout + verify |
| `SubscriptionProvider.startCheckout` | ✅ Interval forwarded to service |
| `subscriptions.billing_interval` column | ✅ Migration `20250610400000_premium_pricing_restructure.sql` |

**Deploy required:** Run migration + redeploy edge functions (`create-razorpay-order`, `verify-razorpay-payment`).

---

## 3. Updated pet limits

| Plan | Limit | Enforcement |
|------|-------|---------------|
| Free | 1 | DB trigger + `entitlements.ts` |
| Plus | 3 | DB trigger + `entitlements.ts` |
| Pro | **10** (was 7) | DB trigger + `entitlements.ts` |
| Enterprise | 100 (manual provisioning) | DB trigger + contact-only above 10 |

Pro users hitting 10 pets see: *"Need more than 10? Contact support@petclues.com for Enterprise pricing."*

No self-service checkout above 10 pets.

---

## 4. Updated upgrade prompts

| User tier | Trigger | CTA |
|-----------|---------|-----|
| Free | Pet limit | Upgrade to Plus |
| Free | Passport | Upgrade to Plus (`EmergencyPassportPage`) |
| Free | Monthly reports | Upgrade to Plus (`MonthlyReportPage`) |
| Free | PetCare Score | Upgrade to Plus (`PetCareScorePage`) |
| Free | Vet Bill Decoder / Scan | Upgrade to Plus (`ScanPage`) |
| Plus | Pet limit | Upgrade to Pro |
| Plus | Advanced AI / Score | Upgrade to Pro |
| Plus | Priority support | Upgrade to Pro |
| Plus | Coming Soon features | Upgrade to Pro |
| Pro | 10+ pets | Contact Enterprise Sales |

Copy centralized in `planUpgradeCopy.ts` and `entitlements.ts`.

---

## 5. Homepage hero comparison section

| Item | Status |
|------|--------|
| `PlanComparisonSection` component | ✅ Created |
| Placement | ✅ After `HeroSection`, before `FeatureHighlights` |
| Headline | ✅ "Choose the plan that fits your pet's journey." |
| 4 horizontal cards | ✅ Free / Plus / Pro / Enterprise with price, pet limit, features, CTA |
| Mobile | ✅ Responsive grid (4 → 2 → 1 columns) |

---

## 6. Feature comparison matrix

| Item | Status |
|------|--------|
| `FeatureComparisonTable` | ✅ Full SaaS matrix |
| Desktop | ✅ Table with checkmarks / text cells |
| Mobile | ✅ Stacked per-plan cards |
| Launching Soon list | ✅ Pro + Enterprise |
| Enterprise exclusive list | ✅ Enterprise-only section |
| 10+ pets note | ✅ Contact support@petclues.com |

Data source: `src/data/pricingMatrix.ts`

---

## 7. Gated features verified

| Page | Gate | Min plan |
|------|------|----------|
| Dashboard | Pet limits via `PetProvider` | tiered |
| Reminders | `canCreateReminder` (2 free) | Plus unlimited |
| Profile / health records | `canCreateHealthRecord` (3 free) | Plus unlimited |
| Scan / Decoder | `vetBillDecoder` | Plus |
| Passport | `petPassport` | Plus |
| Timeline | `premiumTimeline` (6 mo free) | Plus |
| PetCare Score | `petCareScore` / `advancedPetCareScore` | Plus / Pro |
| Monthly Report | `monthlyReportExport` | Plus |
| Referrals | No premium gate | — |
| Settings | No premium gate | — |
| Billing | Display only | — |

**Backend enforcement:**
- Pet insert: `enforce_pet_limit()` trigger (updated Pro=10)
- Vet bill decoder: RLS policy (Plus+)
- Subscription activation: Razorpay edge functions

---

## 8. Mobile responsive verification

| Component | Breakpoints |
|-----------|-------------|
| Pricing grid | 4-col → 2-col → 1-col |
| Feature matrix | Table hidden <768px, stacked cards shown |
| Plan comparison (landing) | 4-col → 2-col → 1-col |
| Billing toggle | Centered, touch-friendly |

Build passes: `npm run build` ✅

---

## 9. Razorpay pricing verification

| Plan | Interval | Paise | INR |
|------|----------|-------|-----|
| Plus | monthly | 299,900 | ₹2,999 |
| Plus | yearly | 2,999,000 | ₹29,990 |
| Pro | monthly | 499,900 | ₹4,999 |
| Pro | yearly | 4,999,000 | ₹49,990 |
| Pro (founding 5%) | monthly | 474,905 | ₹4,749 |
| Pro (founding 5%) | yearly | 4,749,050 | ₹47,491 |

Client (`pricingConfig.ts`) and server (`_shared/razorpay/client.ts`) amounts aligned.

---

## 10. Remaining issues

| Issue | Severity | Action |
|-------|----------|--------|
| Migration not applied to production | **High** | `npx supabase db push` |
| Edge functions not redeployed | **High** | `npx supabase functions deploy create-razorpay-order verify-razorpay-payment` |
| Stale docs (`ENTITLEMENT_MATRIX.md`, etc.) | Low | Regenerate or archive old reports |
| `seoConfig.ts` meta still mentions "free for one pet" generically | Low | Optional copy pass |
| Enterprise features (clinic dashboard, API) | Info | Matrix shows as coming; not yet built |
| Family sharing member limit (2 on Plus) | Medium | Entitlement constant exists; invite flow may need enforcement audit |
| Frontend redeploy | **High** | Deploy `dist/` after merge |

---

## Files changed (summary)

- `src/config/pricingConfig.ts` (new)
- `src/config/razorpayConfig.ts`
- `src/subscription/entitlements.ts`
- `src/data/subscriptionData.ts`, `pricingMatrix.ts`, `planUpgradeCopy.ts`
- `src/components/subscription/*` (cards, toggle, matrix)
- `src/components/landing/PlanComparisonSection.*`
- `src/pages/subscription/PricingPage.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/EmergencyPassportPage.tsx`, `PetCareScorePage.tsx`
- `supabase/functions/create-razorpay-order`, `verify-razorpay-payment`, `_shared/razorpay/*`
- `supabase/migrations/20250610400000_premium_pricing_restructure.sql`
