# PetClues Entitlement Matrix

**Source of truth:** `src/subscription/entitlements.ts`  
**Server mirror:** `supabase/functions/_shared/subscription/entitlements.ts`

## Plans

| Plan | Label | Pets | Razorpay | Price |
|------|-------|------|----------|-------|
| `free` | Free | 1 | No | ₹0 |
| `plus` | Plus | 3 | Yes | ₹799/mo |
| `pro` | Pro | 7 | Yes | ₹1,999/mo (₹1,899 founding) |
| `enterprise` | Enterprise | 100 | Contact | Custom |

## Usage Limits

| Limit | Free | Plus | Pro | Enterprise |
|-------|------|------|-----|------------|
| Pets | 1 | 3 | 7 | 100 |
| Active reminders | 2 | ∞ | ∞ | ∞ |
| Health records | 3 | ∞ | ∞ | ∞ |
| Timeline history | 6 months | Full | Rich | Rich |
| Vet Bill Decoder / month | 0 | 5 | 30 | ∞ |

## Feature Access (minimum plan)

| Feature key | Free | Plus | Pro | Enterprise |
|-------------|------|------|-----|------------|
| `basicDashboard` | ✓ | ✓ | ✓ | ✓ |
| `basicReminders` | ✓ (2) | ✓ | ✓ | ✓ |
| `basicPassport` | ✓ | ✓ | ✓ | ✓ |
| `basicTimeline` | ✓ (6mo) | ✓ | ✓ | ✓ |
| `limitedHealthRecords` | ✓ (3) | ✓ | ✓ | ✓ |
| `reportPreview` | ✓ | ✓ | ✓ | ✓ |
| `limitedAiInsight` | ✓ | ✓ | ✓ | ✓ |
| `vetBillDecoder` | — | ✓ | ✓ | ✓ |
| `familySharing` | — | ✓ | ✓ | ✓ |
| `monthlyReportExport` | — | ✓ | ✓ | ✓ |
| `careAutomation` | — | ✓ | ✓ | ✓ |
| `premiumTimeline` | — | ✓ | ✓ | ✓ |
| `advancedAiInsights` | — | — | ✓ | ✓ |
| `advancedPetCareScore` | — | — | ✓ | ✓ |
| `richMonthlyReports` | — | — | ✓ | ✓ |
| `richTimeline` | — | — | ✓ | ✓ |
| `advancedAutomation` | — | — | ✓ | ✓ |
| `prioritySupport` | — | — | ✓ | ✓ |
| `enterprisePetVolume` | — | — | — | ✓ |
| `customLimitsSupport` | — | — | — | ✓ |

## Upgrade CTAs

| Current plan | CTA |
|--------------|-----|
| Free | Upgrade to Plus |
| Plus | Upgrade to Pro |
| Pro | Upgrade to Enterprise |
| Enterprise | Contact support@petclues.com for custom limits |

## Legacy mapping

| Legacy field | Maps to |
|--------------|---------|
| `subscription_tier: premium` | Pro capability |
| `subscription_tier: family` | Enterprise capability |
| `subscription_plan: pro` | Pro |
| `subscription_plan: plus` | Plus |
| `hasPremiumAccess()` | `currentPlan !== 'free'` |

## API

```typescript
resolveEffectivePlan({ subscriptionPlan, subscriptionTier, subscriptionStatus })
canAccessPlanFeature(plan, feature)
canAddPet(plan, count)
canDecodeVetBill(plan, monthlyCount)
getLimitReachedMessage(plan, 'pets' | 'reminders' | 'healthRecords' | 'decoder')
```
