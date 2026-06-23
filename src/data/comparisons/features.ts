import type { ComparisonFeature, ComparisonFeatureId } from '@/types/comparison';

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    id: 'health_records',
    label: 'Structured pet health records',
    petcluesDescription: 'Vaccines, labs, visits, and notes organized per pet with a searchable timeline.',
  },
  {
    id: 'vaccination_reminders',
    label: 'Vaccination due-date reminders',
    petcluesDescription: 'Automatic alerts before boosters expire so puppy and adult schedules stay on track.',
  },
  {
    id: 'medication_reminders',
    label: 'Medication reminders',
    petcluesDescription: 'Recurring dose alerts tied to each pet, not a generic phone alarm.',
  },
  {
    id: 'vet_bill_storage',
    label: 'Vet bill & invoice storage',
    petcluesDescription: 'Upload invoices and receipts in one vault instead of scattered folders.',
  },
  {
    id: 'emergency_passport',
    label: 'Emergency pet passport',
    petcluesDescription: 'Critical allergies, meds, and vet contacts ready for sitters or ER visits.',
  },
  {
    id: 'multi_pet',
    label: 'Multi-pet household support',
    petcluesDescription: 'Separate profiles, reminders, and records for every dog, cat, or exotic pet.',
  },
  {
    id: 'ai_vet_decoder',
    label: 'AI vet bill decoder',
    petcluesDescription: 'Upload a bill and get structured line items to save into health records faster.',
  },
  {
    id: 'mobile_access',
    label: 'Mobile-first access',
    petcluesDescription: 'Check records and reminders from your phone at the clinic or on a trip.',
  },
  {
    id: 'sitter_vet_sharing',
    label: 'Share with sitters & vets',
    petcluesDescription: 'Export or share the right summary without handing over your entire cloud drive.',
  },
  {
    id: 'pet_specific_workflows',
    label: 'Purpose-built pet workflows',
    petcluesDescription: 'Designed around vaccines, preventatives, and care timelines, not generic folders.',
  },
];

export const COMPARISON_FEATURE_IDS = COMPARISON_FEATURES.map((f) => f.id) as ComparisonFeatureId[];

export function ratingLabel(rating: 'yes' | 'partial' | 'no'): string {
  if (rating === 'yes') return 'Strong';
  if (rating === 'partial') return 'Limited';
  return 'Not built for this';
}
