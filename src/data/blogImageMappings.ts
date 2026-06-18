/**
 * Maps expanded blog slugs to related hero images.
 * Prefer reusing correlated originals; `custom` slugs use dedicated photo assets.
 */
export const EXPANDED_BLOG_IMAGE_FILE: Record<string, string> = {
  // Vaccinations
  'adult-dog-vaccination-booster-schedule-guide': 'blog-dog-vaccination-guide.png',
  'kitten-core-vaccine-timeline-first-year': 'blog-cat-vaccination.png',
  'rabies-vaccine-record-requirements-by-state': 'blog-microchip-registration.png',
  'bordetella-vaccine-boarding-daycare-guide': 'blog-pet-boarding.png',
  'leptospirosis-vaccine-risk-lifestyle-guide': 'blog-flea-tick-prevention.png',
  'canine-influenza-vaccine-outbreak-prep': 'blog-dog-vaccination-guide.png',
  'vaccine-reaction-documentation-for-vets': 'blog-puppy-vaccination.png',

  // Health records
  'digital-pet-health-record-template-guide': 'blog-pet-records.png',
  'pet-lab-results-tracking-normal-ranges': 'blog-pet-records.png',
  'chronic-condition-pet-record-system': 'blog-pet-records-timeline.png',
  'multi-pet-household-health-records-setup': 'blog-pet-records.png',
  'pet-imaging-reports-mri-xray-storage': 'blog-pet-records.png',
  'pet-dental-records-cleaning-history-guide': 'blog-dog-dental-care.png',
  'transferring-pet-records-between-vets': 'blog-pet-records.png',

  // Medical history
  'building-complete-pet-medical-history-timeline': 'blog-pet-records-timeline.png',
  'pet-surgery-history-documentation-guide': 'blog-pet-records.png',
  'allergy-and-reaction-history-for-pets': 'blog-pet-allergy-tracker.png',
  'hereditary-conditions-family-pet-history': 'blog-pet-records.png',
  'rescue-pet-unknown-medical-history-guide': 'blog-puppy-checklist.png',
  'second-opinion-vet-medical-history-prep': 'blog-pet-records.png',

  // Pet passports
  'printable-pet-passport-template-emergency': 'blog-emergency-passport.png',
  'pet-passport-for-groomers-and-trainers': 'blog-pet-sitter-instructions.png',
  'pet-passport-allergy-medication-summary': 'blog-emergency-passport.png',
  'multi-pet-passport-household-system': 'blog-emergency-passport.png',
  'pet-passport-for-relatives-and-neighbors': 'blog-pet-sitter-instructions.png',
  'updating-pet-passport-after-vet-visit': 'blog-emergency-passport.png',

  // Pet travel
  'international-pet-travel-health-certificate-guide': 'blog-travel-pets.png',
  'flying-with-cats-health-documents-checklist': 'blog-flying-with-cats.png',
  'cross-country-move-pet-records-guide': 'blog-travel-pets.png',
  'pet-friendly-hotel-documentation-requirements': 'blog-travel-pets.png',
  'rv-travel-pet-medical-emergency-prep': 'blog-travel-pets.png',

  // Medication management
  'split-dose-pet-medication-schedule-guide': 'blog-medication-reminder.png',
  'pet-prescription-refill-tracking-system': 'blog-medication-reminder.png',
  'compounded-pet-medication-label-guide': 'blog-medication-reminder.png',
  'antibiotic-course-completion-tracking-pets': 'blog-medication-reminder.png',
  'pain-management-log-for-recovering-pets': 'blog-medication-reminder.png',

  // Emergency preparedness
  'pet-first-aid-kit-records-checklist': 'blog-emergency-passport.png',
  'natural-disaster-pet-evacuation-records': 'blog-emergency-passport.png',
  'pet-poison-control-information-card-guide': 'blog-emergency-passport.png',
  'after-hours-emergency-vet-information-sheet': 'blog-emergency-passport.png',
  'lost-pet-search-medical-summary-template': 'blog-microchip-registration.png',
  'household-fire-safety-pet-records-plan': 'blog-emergency-passport.png',

  // Pet organization
  'monthly-pet-care-admin-routine-guide': 'blog-daily-checkin.png',
  'pet-supply-inventory-and-medication-sync': 'blog-daily-checkin.png',
  'shared-family-pet-care-calendar-system': 'blog-life-stage-care.png',
  'pet-binder-vs-digital-records-comparison': 'blog-best-pet-health-app.png',
  'end-of-year-pet-health-records-review': 'blog-vet-bill-organizer.png',

  // Breed-specific (dedicated photos)
  'golden-retriever-health-records-wellness-guide': 'blog-senior-dog.png',
  'labrador-weight-and-joint-care-records': 'blog-labrador-joint-care.png',
  'french-bulldog-respiratory-health-tracking': 'blog-french-bulldog-health.png',
  'german-shepherd-hip-health-documentation': 'blog-german-shepherd-hip.png',
  'poodle-grooming-and-health-record-routine': 'blog-poodle-grooming-health.png',
  'maine-coon-cat-health-monitoring-guide': 'blog-maine-coon-health.png',
  'siamese-cat-vaccination-and-wellness-records': 'blog-siamese-cat-wellness.png',
  'dachshund-back-health-mobility-tracking': 'blog-dachshund-mobility.png',

  // Senior pet care
  'senior-cat-medication-and-lab-tracking-guide': 'blog-senior-cat-care.png',
  'senior-pet-mobility-pain-journal-template': 'blog-senior-dog.png',
  'end-of-life-pet-comfort-care-documentation': 'blog-senior-dog.png',
  'senior-pet-cognitive-decline-behavior-log': 'blog-senior-dog.png',
  'arthritis-management-records-senior-dogs': 'blog-senior-dog.png',
  'senior-pet-nutrition-and-weight-trends': 'blog-dog-weight-tracker.png',
  'hospice-vet-coordination-records-guide': 'blog-senior-dog.png',

  // New pet owner guides
  'first-30-days-new-dog-owner-records-guide': 'blog-puppy-checklist.png',
  'first-30-days-new-cat-owner-records-guide': 'blog-new-kitten-checklist.png',
  'adopting-shelter-pet-medical-records-setup': 'blog-puppy-checklist.png',
  'puppy-socialization-health-record-guide': 'blog-puppy-vaccination.png',
  'kitten-indoor-transition-wellness-checklist': 'blog-new-kitten-checklist.png',
  'new-pet-owner-vet-visit-question-list': 'blog-puppy-vaccination.png',

  // Exotic pets
  'bearded-dragon-health-log-temperature-tracking': 'blog-exotic-pet-records.png',
  'guinea-pig-wellness-weight-records-guide': 'blog-guinea-pig-wellness.png',
  'rabbit-vaccination-and-dental-records': 'blog-rabbit-care.png',
  'snake-shedding-feeding-health-journal': 'blog-snake-care.png',
  'ferret-vaccination-and-adrenal-health-records': 'blog-ferret-care.png',
  'parrot-annual-avian-wellness-documentation': 'blog-bird-care.png',
};
