# Feature Gating Matrix

All gates use `useSubscription().canAccess(feature)` or entitlements helpers - **no hardcoded plan checks in components**.

## Pages

| Page | Free | Plus | Pro | Enterprise | Locked CTA |
|------|------|------|-----|------------|------------|
| **Dashboard** | Basic widgets, preview report | Full dashboard | Advanced score/insights cards | Full | Upgrade prompt on locked cards |
| **Pet creation** | 1 pet | 3 pets | 7 pets | 100 pets | `getLimitMessage('pets')` |
| **Pet profile** | 3 health records | Unlimited | Unlimited | Unlimited | Upgrade modal |
| **Reminders** | 2 active | Unlimited | Unlimited | Unlimited | Upgrade modal |
| **Timeline** | 6 months visible | Full history | Rich timeline | Rich | `PremiumUpgradePrompt` for older events |
| **Monthly reports** | Preview only | Download | Rich export | Rich | `monthlyReportExport` gate |
| **Passport** | Basic view | Export | Export | Export | Plus gate on export |
| **Scan / Decoder** | Locked | 5 decodes/mo | 30 decodes/mo | Unlimited | `PremiumGate` + upgrade modal |
| **PetCare Score** | Basic score | Basic | Advanced breakdown | Advanced | Pro gate |
| **Pet Match** | Available | Available | Available | Available | - |
| **Family sharing** | Locked | Unlocked | Unlocked | Unlocked | Plus gate |
| **Referrals** | Available | Available | Available | Available | - |
| **Founding members** | Available | Available | Available | Available | - |
| **Settings** | Full | Full | Full | Full | - |
| **Billing** | Upgrade CTAs | Upgrade to Pro | Upgrade to Enterprise | Contact support | Tier-aware |
| **Pricing** | 4-tier comparison | 4-tier comparison | 4-tier comparison | Contact CTA | - |

## Components

| Component | Gate mechanism |
|-----------|----------------|
| `PremiumGate` | `canAccess(feature)` + `PremiumUpgradePrompt` |
| `UpgradeModal` | `targetPlan: 'plus' \| 'pro'` |
| `AddAnotherPetButton` | `canAddPet(count)` |
| `SubscriptionCard` | Plan-aware CTA labels |
| `UserMenu` | Shows `planLabel`, `upgradeCta` |

## Locked-state UI

- Subtle lock overlay via `PremiumGate`
- Badge shows required tier (Plus / Pro / Enterprise)
- Single CTA button - no aggressive popups
- Calm upgrade copy from `planUpgradeCopy.ts`
