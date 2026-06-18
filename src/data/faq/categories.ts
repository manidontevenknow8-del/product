export type FaqCategoryId =
  | 'pet-records'
  | 'vaccinations'
  | 'pet-passports'
  | 'pet-travel'
  | 'medication-management'
  | 'emergency-preparedness'
  | 'pet-organization'
  | 'medical-history'
  | 'new-pet-owners'
  | 'senior-pet-care'
  | 'exotic-specialty-care'
  | 'petclues-app';

export type FaqCategory = {
  id: FaqCategoryId;
  label: string;
  description: string;
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'pet-records',
    label: 'Pet Records',
    description: 'Organize, store, and share health records, labs, and vet documents.',
  },
  {
    id: 'vaccinations',
    label: 'Vaccinations',
    description: 'Schedules, boosters, proof, and reminders for dogs and cats.',
  },
  {
    id: 'pet-passports',
    label: 'Pet Passports',
    description: 'Emergency summaries and portable info for sitters, vets, and travel.',
  },
  {
    id: 'pet-travel',
    label: 'Pet Travel',
    description: 'Flying, driving, hotels, and health certificates for trips.',
  },
  {
    id: 'medication-management',
    label: 'Medication Management',
    description: 'Doses, refills, preventatives, and adherence tracking.',
  },
  {
    id: 'emergency-preparedness',
    label: 'Emergency Preparedness',
    description: 'Crisis plans, ER info, poison control, and evacuation records.',
  },
  {
    id: 'pet-organization',
    label: 'Pet Organization',
    description: 'Household routines, multi-pet systems, and care calendars.',
  },
  {
    id: 'medical-history',
    label: 'Medical History',
    description: 'Timelines, chronic conditions, allergies, and surgical history.',
  },
  {
    id: 'new-pet-owners',
    label: 'New Pet Owners',
    description: 'First vet visits, adoption records, puppy and kitten basics.',
  },
  {
    id: 'senior-pet-care',
    label: 'Senior Pet Care',
    description: 'Aging wellness, pain logs, labs, and comfort-focused care.',
  },
  {
    id: 'exotic-specialty-care',
    label: 'Exotic & Specialty Care',
    description: 'Birds, reptiles, and small mammals documentation needs.',
  },
  {
    id: 'petclues-app',
    label: 'PetClues App',
    description: 'Product features, pricing, privacy, and account questions.',
  },
];

export function getFaqCategory(id: FaqCategoryId): FaqCategory {
  const found = FAQ_CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown FAQ category: ${id}`);
  return found;
}

export function getFaqCategoryLabel(id: FaqCategoryId): string {
  return getFaqCategory(id).label;
}
