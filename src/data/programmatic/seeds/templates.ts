export type TemplateSeed = {
  slug: string;
  name: string;
  audience: string;
  focus: string;
};

export const MEDICATION_TEMPLATE_SEEDS: TemplateSeed[] = [
  { slug: 'dog-daily-medication-log', name: 'Dog Daily Medication Log', audience: 'Dogs on one or more daily prescriptions', focus: 'dose time, amount, and missed-dose notes' },
  { slug: 'cat-daily-medication-log', name: 'Cat Daily Medication Log', audience: 'Cats receiving oral or topical medications', focus: 'dose tracking and appetite side effects' },
  { slug: 'puppy-medication-schedule', name: 'Puppy Medication Schedule', audience: 'Puppies on deworming or early treatments', focus: 'weight-based dosing and series completion' },
  { slug: 'senior-dog-medication-tracker', name: 'Senior Dog Medication Tracker', audience: 'Senior dogs with multiple chronic meds', focus: 'drug interactions, lab rechecks, and refill dates' },
  { slug: 'senior-cat-medication-tracker', name: 'Senior Cat Medication Tracker', audience: 'Senior cats on kidney, thyroid, or pain meds', focus: 'appetite, hydration, and kidney values' },
  { slug: 'chronic-condition-medication-log', name: 'Chronic Condition Medication Log', audience: 'Pets with diabetes, epilepsy, or heart disease', focus: 'symptom trends tied to medication timing' },
  { slug: 'post-surgery-medication-checklist', name: 'Post-Surgery Medication Checklist', audience: 'Pets recovering from surgery', focus: 'pain meds, antibiotics, and incision monitoring' },
  { slug: 'flea-tick-prevention-log', name: 'Flea & Tick Prevention Log', audience: 'Year-round parasite prevention routines', focus: 'product name, application date, and next due' },
  { slug: 'heartworm-prevention-tracker', name: 'Heartworm Prevention Tracker', audience: 'Dogs and cats on monthly preventives', focus: 'monthly dose confirmation and test dates' },
  { slug: 'multi-pet-medication-calendar', name: 'Multi-Pet Medication Calendar', audience: 'Households with several medicated pets', focus: 'per-pet columns and shared reminder cadence' },
];

export const HEALTH_RECORD_TEMPLATE_SEEDS: TemplateSeed[] = [
  { slug: 'puppy-health-record-template', name: 'Puppy Health Record Template', audience: 'New puppy parents', focus: 'vaccine series, deworming, and microchip' },
  { slug: 'kitten-health-record-template', name: 'Kitten Health Record Template', audience: 'New kitten parents', focus: 'FVRCP series, fecal tests, and spay/neuter planning' },
  { slug: 'adult-dog-health-record', name: 'Adult Dog Health Record', audience: 'Adult dogs with annual wellness visits', focus: 'boosters, dental, and screening labs' },
  { slug: 'adult-cat-health-record', name: 'Adult Cat Health Record', audience: 'Adult cats with indoor wellness routines', focus: 'weight, dental, and parasite prevention' },
  { slug: 'senior-pet-health-summary', name: 'Senior Pet Health Summary', audience: 'Senior dogs and cats', focus: 'chronic conditions, mobility, and quality of life' },
  { slug: 'multi-pet-household-records', name: 'Multi-Pet Household Records', audience: 'Homes with multiple pets', focus: 'separate profiles with shared emergency contacts' },
  { slug: 'adoption-health-record', name: 'Adoption Health Record', audience: 'Rescue and shelter adoptions', focus: 'intake vaccines, behavior notes, and transfer paperwork' },
  { slug: 'breeder-puppy-record', name: 'Breeder Puppy Record', audience: 'Puppies from breeders', focus: 'litter health checks, first vaccines, and pedigree docs' },
  { slug: 'exotic-pet-health-log', name: 'Exotic Pet Health Log', audience: 'Birds, rabbits, and reptiles', focus: 'species-specific vitals and husbandry logs' },
  { slug: 'annual-wellness-record-template', name: 'Annual Wellness Record Template', audience: 'All pets at yearly exam time', focus: 'exam findings, labs, and next-year plan' },
];

export const CARE_CHECKLIST_TEMPLATE_SEEDS: TemplateSeed[] = [
  { slug: 'new-puppy-checklist', name: 'New Puppy Checklist', audience: 'First-week puppy parents', focus: 'vet visit, crate, vaccines, and socialization' },
  { slug: 'new-kitten-checklist', name: 'New Kitten Checklist', audience: 'First-week kitten parents', focus: 'litter setup, vaccines, and enrichment' },
  { slug: 'annual-wellness-checklist', name: 'Annual Wellness Checklist', audience: 'Yearly preventive care planning', focus: 'exam, labs, dental, and parasite review' },
  { slug: 'boarding-prep-checklist', name: 'Boarding Prep Checklist', audience: 'Pets staying at kennels or sitters', focus: 'vaccine proof, meds, and emergency contacts' },
  { slug: 'grooming-care-checklist', name: 'Grooming Care Checklist', audience: 'Coat, nail, and ear maintenance routines', focus: 'breed-specific grooming cadence' },
  { slug: 'dental-care-checklist', name: 'Dental Care Checklist', audience: 'Pets needing home dental prevention', focus: 'brushing, chews, and professional cleanings' },
  { slug: 'weight-management-checklist', name: 'Weight Management Checklist', audience: 'Overweight or growing pets', focus: 'body condition scoring and feeding logs' },
  { slug: 'travel-day-checklist', name: 'Travel Day Checklist', audience: 'Day-of-trip preparation', focus: 'carrier, documents, meds, and comfort items' },
  { slug: 'emergency-kit-checklist', name: 'Emergency Kit Checklist', audience: 'All pet households', focus: 'first-aid supplies and evacuation prep' },
  { slug: 'senior-pet-care-checklist', name: 'Senior Pet Care Checklist', audience: 'Aging dogs and cats', focus: 'mobility, pain, appetite, and vet cadence' },
];
