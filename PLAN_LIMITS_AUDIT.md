# Plan Limits Audit

## Before

- Binary free vs Pro (`hasPremiumAccess`)
- Free: 1 pet; paid: unlimited pets
- DB trigger `enforce_free_pet_limit` checked only `subscription_tier IN ('premium','family')`
- Vet Bill Decoder: Pro-only (binary)
- No Plus or Enterprise tiers

## After

- Four tiers: free / plus / pro / enterprise
- Tiered pet limits enforced in **frontend** (`entitlements.ts`) and **backend** (`enforce_pet_limit` trigger)
- Decoder monthly caps enforced in edge function
- Reminder and health record limits tier-aware

## Enforcement layers

| Limit | Frontend | Backend |
|-------|----------|---------|
| Pet count | `PetProvider`, `AddAnotherPetButton`, `useSubscription().canAddPet` | `enforce_pet_limit` trigger on `pets` INSERT |
| Vet Bill Decoder access | `PremiumGate`, `ScanPage`, `canAccess('vetBillDecoder')` | `requirePlanTier('plus')` + monthly count in `decode-vet-document` |
| Vet Bill Decoder RLS | — | `Paid plans insert vet bill extractions` policy |
| Reminders | `RemindersPage`, `canCreateReminder` | Client-only (no DB trigger) |
| Health records | `PetProfilePage`, `canCreateHealthRecord` | Client-only |
| Timeline months | `TimelinePage`, `partitionTimelineEvents` | Client-only |
| Monthly report export | `MonthlyReportPage`, `canAccess('monthlyReportExport')` | Client-only |

## Migration applied

`supabase/migrations/20250610300000_tiered_plan_entitlements.sql`

- Replaces `enforce_free_pet_limit` with `enforce_pet_limit`
- Updates vet bill extraction RLS for plus/pro/enterprise
- Updates `sync_profile_subscription_tier` for plus/pro/enterprise mapping

## Gaps / manual review

- **Enterprise provisioning** is manual (email support@petclues.com) — no Razorpay SKU
- **Reminder/health record limits** rely on UI gates; consider DB triggers if abuse is observed
- **Decoder monthly count** uses calendar month on server; client usage display is lifetime count (cosmetic mismatch)
