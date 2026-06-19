/**
 * Maps expanded blog slugs to related hero images.
 * Prefer reusing correlated originals; `custom` slugs use dedicated photo assets.
 */
export const EXPANDED_BLOG_IMAGE_FILE: Record<string, string> = {
  // Vaccinations
  'adult-dog-vaccination-booster-schedule-guide': 'blog-dog-vaccination-guide.webp',
  'kitten-core-vaccine-timeline-first-year': 'blog-cat-vaccination.webp',
  'rabies-vaccine-record-requirements-by-state': 'blog-microchip-registration.webp',
  'bordetella-vaccine-boarding-daycare-guide': 'blog-pet-boarding.webp',
  'leptospirosis-vaccine-risk-lifestyle-guide': 'blog-flea-tick-prevention.webp',
  'canine-influenza-vaccine-outbreak-prep': 'blog-dog-vaccination-guide.webp',
  'vaccine-reaction-documentation-for-vets': 'blog-puppy-vaccination.webp',

  // Health records
  'digital-pet-health-record-template-guide': 'blog-pet-records.webp',
  'pet-lab-results-tracking-normal-ranges': 'blog-pet-records.webp',
  'chronic-condition-pet-record-system': 'blog-pet-records-timeline.webp',
  'multi-pet-household-health-records-setup': 'blog-pet-records.webp',
  'pet-imaging-reports-mri-xray-storage': 'blog-pet-records.webp',
  'pet-dental-records-cleaning-history-guide': 'blog-dog-dental-care.webp',
  'transferring-pet-records-between-vets': 'blog-pet-records.webp',

  // Medical history
  'building-complete-pet-medical-history-timeline': 'blog-pet-records-timeline.webp',
  'pet-surgery-history-documentation-guide': 'blog-pet-records.webp',
  'allergy-and-reaction-history-for-pets': 'blog-pet-allergy-tracker.webp',
  'hereditary-conditions-family-pet-history': 'blog-pet-records.webp',
  'rescue-pet-unknown-medical-history-guide': 'blog-puppy-checklist.webp',
  'second-opinion-vet-medical-history-prep': 'blog-pet-records.webp',

  // Pet passports
  'printable-pet-passport-template-emergency': 'blog-emergency-passport.webp',
  'pet-passport-for-groomers-and-trainers': 'blog-pet-sitter-instructions.webp',
  'pet-passport-allergy-medication-summary': 'blog-emergency-passport.webp',
  'multi-pet-passport-household-system': 'blog-emergency-passport.webp',
  'pet-passport-for-relatives-and-neighbors': 'blog-pet-sitter-instructions.webp',
  'updating-pet-passport-after-vet-visit': 'blog-emergency-passport.webp',

  // Pet travel
  'international-pet-travel-health-certificate-guide': 'blog-travel-pets.webp',
  'flying-with-cats-health-documents-checklist': 'blog-flying-with-cats.webp',
  'cross-country-move-pet-records-guide': 'blog-travel-pets.webp',
  'pet-friendly-hotel-documentation-requirements': 'blog-travel-pets.webp',
  'rv-travel-pet-medical-emergency-prep': 'blog-travel-pets.webp',

  // Medication management
  'split-dose-pet-medication-schedule-guide': 'blog-medication-reminder.webp',
  'pet-prescription-refill-tracking-system': 'blog-medication-reminder.webp',
  'compounded-pet-medication-label-guide': 'blog-medication-reminder.webp',
  'antibiotic-course-completion-tracking-pets': 'blog-medication-reminder.webp',
  'pain-management-log-for-recovering-pets': 'blog-medication-reminder.webp',

  // Emergency preparedness
  'pet-first-aid-kit-records-checklist': 'blog-emergency-passport.webp',
  'natural-disaster-pet-evacuation-records': 'blog-emergency-passport.webp',
  'pet-poison-control-information-card-guide': 'blog-emergency-passport.webp',
  'after-hours-emergency-vet-information-sheet': 'blog-emergency-passport.webp',
  'lost-pet-search-medical-summary-template': 'blog-microchip-registration.webp',
  'household-fire-safety-pet-records-plan': 'blog-emergency-passport.webp',

  // Pet organization
  'monthly-pet-care-admin-routine-guide': 'blog-daily-checkin.webp',
  'pet-supply-inventory-and-medication-sync': 'blog-daily-checkin.webp',
  'shared-family-pet-care-calendar-system': 'blog-life-stage-care.webp',
  'pet-binder-vs-digital-records-comparison': 'blog-best-pet-health-app.webp',
  'end-of-year-pet-health-records-review': 'blog-vet-bill-organizer.webp',

  // Breed-specific (dedicated photos)
  'golden-retriever-health-records-wellness-guide': 'blog-senior-dog.webp',
  'labrador-weight-and-joint-care-records': 'blog-labrador-joint-care.webp',
  'french-bulldog-respiratory-health-tracking': 'blog-french-bulldog-health.webp',
  'german-shepherd-hip-health-documentation': 'blog-german-shepherd-hip.webp',
  'poodle-grooming-and-health-record-routine': 'blog-poodle-grooming-health.webp',
  'maine-coon-cat-health-monitoring-guide': 'blog-maine-coon-health.webp',
  'siamese-cat-vaccination-and-wellness-records': 'blog-siamese-cat-wellness.webp',
  'dachshund-back-health-mobility-tracking': 'blog-dachshund-mobility.webp',

  // Senior pet care
  'senior-cat-medication-and-lab-tracking-guide': 'blog-senior-cat-care.webp',
  'senior-pet-mobility-pain-journal-template': 'blog-senior-dog.webp',
  'end-of-life-pet-comfort-care-documentation': 'blog-senior-dog.webp',
  'senior-pet-cognitive-decline-behavior-log': 'blog-senior-dog.webp',
  'arthritis-management-records-senior-dogs': 'blog-senior-dog.webp',
  'senior-pet-nutrition-and-weight-trends': 'blog-dog-weight-tracker.webp',
  'hospice-vet-coordination-records-guide': 'blog-senior-dog.webp',

  // New pet owner guides
  'first-30-days-new-dog-owner-records-guide': 'blog-puppy-checklist.webp',
  'first-30-days-new-cat-owner-records-guide': 'blog-new-kitten-checklist.webp',
  'adopting-shelter-pet-medical-records-setup': 'blog-puppy-checklist.webp',
  'puppy-socialization-health-record-guide': 'blog-puppy-vaccination.webp',
  'kitten-indoor-transition-wellness-checklist': 'blog-new-kitten-checklist.webp',
  'new-pet-owner-vet-visit-question-list': 'blog-puppy-vaccination.webp',

  // Exotic pets
  'bearded-dragon-health-log-temperature-tracking': 'blog-exotic-pet-records.webp',
  'guinea-pig-wellness-weight-records-guide': 'blog-guinea-pig-wellness.webp',
  'rabbit-vaccination-and-dental-records': 'blog-rabbit-care.webp',
  'snake-shedding-feeding-health-journal': 'blog-snake-care.webp',
  'ferret-vaccination-and-adrenal-health-records': 'blog-ferret-care.webp',
  'parrot-annual-avian-wellness-documentation': 'blog-bird-care.webp',
};
