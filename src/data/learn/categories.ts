export type LearnCategoryId =
  | 'health-records'
  | 'vaccinations'
  | 'pet-passports'
  | 'pet-travel'
  | 'pet-emergencies'
  | 'pet-documentation'
  | 'medication-tracking'
  | 'pet-organization';

export type LearnCategory = {
  id: LearnCategoryId;
  label: string;
  description: string;
};

export const LEARN_CATEGORIES: LearnCategory[] = [
  {
    id: 'health-records',
    label: 'Health Records',
    description: 'Organize vaccines, labs, visits, and medical history in one searchable timeline.',
  },
  {
    id: 'vaccinations',
    label: 'Vaccinations',
    description: 'Schedules, boosters, reminders, and proof for clinics, boarding, and travel.',
  },
  {
    id: 'pet-passports',
    label: 'Pet Passports',
    description: 'Emergency summaries and portable pet information for sitters and clinics.',
  },
  {
    id: 'pet-travel',
    label: 'Pet Travel',
    description: 'Health certificates, vaccines, and documents for trips near and far.',
  },
  {
    id: 'pet-emergencies',
    label: 'Pet Emergencies',
    description: 'Prepare critical info before seconds matter at home or on the road.',
  },
  {
    id: 'pet-documentation',
    label: 'Pet Documentation',
    description: 'Vet bills, prescriptions, adoption papers, and insurance-ready records.',
  },
  {
    id: 'medication-tracking',
    label: 'Medication Tracking',
    description: 'Doses, refills, preventatives, and adherence habits that stick.',
  },
  {
    id: 'pet-organization',
    label: 'Pet Organization',
    description: 'Routines, handoffs, and household systems that keep care calm.',
  },
];

export function getLearnCategory(id: LearnCategoryId): LearnCategory {
  const found = LEARN_CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown learn category: ${id}`);
  return found;
}

export function getLearnCategoryLabel(id: LearnCategoryId): string {
  return getLearnCategory(id).label;
}
