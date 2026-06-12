# Premium Feature Matrix - PetClues V1

Source of truth: `profiles.subscription_status = 'active'` (Razorpay Pro)  
Fallback: `profiles.subscription_tier` in `premium` / `family` (founding, manual grants)

| Feature | Free | Pro (₹299/mo) | Gate key |
|---------|------|---------------|----------|
| 1 pet profile | ✅ | - | `unlimitedPets` |
| Unlimited pets | - | ✅ | `unlimitedPets` |
| Daily check-in | ✅ | ✅ | - |
| Up to 2 active reminders | ✅ | - | `unlimitedReminders` |
| Unlimited reminders | - | ✅ | `unlimitedReminders` |
| Up to 3 health records | ✅ | - | `unlimitedHealthRecords` |
| Unlimited health records | - | ✅ | `unlimitedHealthRecords` |
| Document vault | ✅ | ✅ | - |
| Emergency passport | ✅ | ✅ | - |
| Basic PetCare Score | ✅ | ✅ | - |
| Monthly report (view) | ✅ | ✅ | - |
| **Vet Bill Decoder** | - | ✅ | `vetBillDecoder` |
| **Advanced AI insights** | - | ✅ | `advancedHealthInsights` |
| **Unlimited monthly report exports** | - | ✅ | `unlimitedMonthlyReports` |
| Timeline (last 6 months) | ✅ | - | `premiumTimeline` |
| **Full timeline history** | - | ✅ | `premiumTimeline` |
| Advanced PetCare Score | - | ✅ | `advancedPetCareScore` |
| Priority support | - | ✅ | `prioritySupport` |
| **Future AI companion** | - | ✅ (reserved) | `futureAiCompanion` |
| **Future breed intelligence** | - | ✅ (reserved) | `futureBreedIntelligence` |

## Enforcement Layers

| Layer | Mechanism |
|-------|-----------|
| UI | `PremiumFeatureGuard`, `PremiumGate`, `useSubscription().canAccess()` |
| API | `requirePremiumTier()` in `decode-vet-document` |
| Database | `enforce_free_pet_limit` trigger, vet bill RLS policy |

## Component Usage

```tsx
import { PremiumFeatureGuard } from '@/components/subscription';

<PremiumFeatureGuard feature="vetBillDecoder">
  <VetBillDecoderPanel />
</PremiumFeatureGuard>
```
