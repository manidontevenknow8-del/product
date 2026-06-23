import type {
  ProgrammaticChecklistGroup,
  ProgrammaticFaq,
  ProgrammaticPage,
  ProgrammaticScheduleRow,
  ProgrammaticSection,
} from '@/types/programmaticPage';
import { CAT_BREED_SEEDS, type CatBreedSeed } from './seeds/catBreeds';
import { COUNTRY_SEEDS, type CountrySeed } from './seeds/countries';
import { DOG_BREED_SEEDS, type DogBreedSeed } from './seeds/dogBreeds';
import { EMERGENCY_SPECIES_SEEDS, type EmergencySpeciesSeed } from './seeds/emergencySpecies';
import {
  CARE_CHECKLIST_TEMPLATE_SEEDS,
  HEALTH_RECORD_TEMPLATE_SEEDS,
  MEDICATION_TEMPLATE_SEEDS,
  type TemplateSeed,
} from './seeds/templates';

const UPDATED_AT = '2026-06-18';

function standardFaqs(subject: string, context: string): ProgrammaticFaq[] {
  return [
    {
      question: `Does this ${subject} replace veterinary advice?`,
      answer: `No. ${context} Always confirm timing, products, and medical decisions with your licensed veterinarian.`,
    },
    {
      question: `Can I track this digitally instead of on paper?`,
      answer:
        'Yes. PetClues lets you log vaccines, medications, documents, and reminders in one timeline with emergency passport export.',
    },
    {
      question: 'What if my pet is behind on vaccines or doses?',
      answer:
        'Do not guess catch-up schedules. Your veterinarian can restart or adjust the series safely based on age and history.',
    },
    {
      question: 'How often should I review this plan?',
      answer:
        'Review at every wellness visit, before travel or boarding, and whenever lifestyle changes (new household pets, outdoor access, or chronic diagnosis).',
    },
  ];
}

function dogVaccineSchedule(seed: DogBreedSeed): ProgrammaticScheduleRow[] {
  const lifestyleNote =
    seed.lifestyle === 'active'
      ? 'Discuss leptospirosis and Lyme vaccines if your area or travel exposes your dog.'
      : 'Lifestyle vaccines depend on local risk, ask your vet before boarding or hiking.';

  return [
    { age: '6-8 weeks', vaccines: ['DHPP (distemper combo), 1st dose'], notes: `Start only if maternal antibodies allow; confirm with your vet for ${seed.name} puppies.` },
    { age: '10-12 weeks', vaccines: ['DHPP, 2nd dose', 'Optional: Bordetella'], notes: lifestyleNote },
    { age: '14-16 weeks', vaccines: ['DHPP, 3rd dose', 'Rabies (per local law)'], notes: `Final puppy series timing is critical for ${seed.size} breeds.` },
    { age: '12-16 months', vaccines: ['DHPP booster', 'Rabies booster (if due)'], notes: 'First adult booster; align with clinic protocol.' },
    { age: 'Every 1-3 years', vaccines: ['DHPP', 'Rabies', 'Lifestyle vaccines as needed'], notes: `Monitor ${seed.healthFocus} at annual exams.` },
  ];
}

function catVaccineSchedule(seed: CatBreedSeed): ProgrammaticScheduleRow[] {
  const exposureNote =
    seed.lifestyle === 'indoor'
      ? 'Indoor cats may use a reduced lifestyle vaccine set, confirm with your veterinarian.'
      : 'Outdoor or active cats often need feline leukemia (FeLV) vaccination.';

  return [
    { age: '6-8 weeks', vaccines: ['FVRCP, 1st dose'], notes: `Begin kitten series for ${seed.name} kittens under veterinary guidance.` },
    { age: '10-12 weeks', vaccines: ['FVRCP, 2nd dose'], notes: exposureNote },
    { age: '14-16 weeks', vaccines: ['FVRCP, 3rd dose', 'Rabies (per local law)'], notes: 'Complete core kitten series before high exposure environments.' },
    { age: '12-16 months', vaccines: ['FVRCP booster', 'Rabies booster (if due)', 'FeLV if lifestyle warrants'], notes: `Discuss ${seed.healthFocus} at the first adult visit.` },
    { age: 'Every 1-3 years', vaccines: ['FVRCP', 'Rabies', 'FeLV if continued risk'], notes: 'Revaccination intervals vary by product and local regulations.' },
  ];
}

function buildDogVaccinationPage(seed: DogBreedSeed): ProgrammaticPage {
  const subjectName = seed.name;
  const title = `${subjectName} Vaccination Schedule (2026): Puppy Shots & Boosters`;
  const metaDescription = `Complete ${subjectName} vaccination schedule: puppy shot timeline, core vaccines (DHPP, rabies), boosters, and breed-specific wellness notes.`;
  const quickAnswer = `${subjectName} puppies typically start DHPP at 6-8 weeks, complete the series by 16 weeks, and receive rabies per local law. Adult boosters follow every 1-3 years based on your veterinarian's protocol.`;

  return {
    collectionId: 'dog-vaccination-schedule',
    slug: seed.slug,
    subjectName,
    title: `${title} | PetClues Guides`,
    metaDescription,
    keywords: [`${subjectName.toLowerCase()} vaccination schedule`, `${seed.slug} puppy shots`, 'dog vaccine timeline 2026'],
    quickAnswer,
    updatedAt: UPDATED_AT,
    intro: [
      `This ${subjectName} vaccination schedule outlines core puppy shots, booster timing, and lifestyle vaccines to discuss with your veterinarian.`,
      `Because ${seed.name} dogs are ${seed.size} and ${seed.lifestyle}, your clinic may adjust timing, especially around ${seed.healthFocus}.`,
    ],
    sections: [
      {
        heading: 'Core vaccines for dogs',
        bullets: [
          'DHPP (distemper, hepatitis, parainfluenza, parvovirus)',
          'Rabies (legally required in most regions)',
          'Optional lifestyle: Bordetella, leptospirosis, Lyme, influenza',
        ],
      },
      {
        heading: `Breed-specific notes for ${subjectName}`,
        paragraphs: [
          `${subjectName} owners should document vaccine lot numbers, reaction notes, and titer discussions if your clinic offers them.`,
          `Watch for ${seed.healthFocus} during wellness visits, these concerns are separate from vaccines but belong in the same health record.`,
        ],
      },
    ],
    schedule: dogVaccineSchedule(seed),
    faqs: standardFaqs(`${subjectName} vaccine schedule`, `Schedules vary by region and clinic protocol for ${subjectName} dogs.`),
    petcluesWorkflow: {
      headline: 'Track vaccines in PetClues',
      steps: [
        'Create a pet profile for your dog with breed set to ' + subjectName + '.',
        'Log each vaccine with date, clinic, and lot number from the certificate.',
        'Set reminders for boosters and annual wellness visits.',
        'Share an emergency passport with sitters or boarding facilities.',
      ],
    },
    relatedLearnSlugs: ['puppy-vaccine-booster-tracker', 'multi-pet-vaccination-calendar-setup'],
    relatedBlogSlugs: [
      'puppy-vaccination-schedule-2026',
      seed.slug === 'golden-retriever'
        ? 'golden-retriever-health-records-wellness-guide'
        : seed.slug === 'labrador-retriever'
          ? 'labrador-weight-and-joint-care-records'
          : 'new-puppy-checklist-health-records-vaccines',
    ],
    relatedFaqSlugs: ['what-vaccines-do-puppies-need', 'how-do-i-store-vaccination-records-for-my-pet'],
    relatedPageKeys: ['health-record-template/puppy-health-record-template', 'pet-care-checklist/new-puppy-checklist'],
  };
}

function buildCatVaccinationPage(seed: CatBreedSeed): ProgrammaticPage {
  const subjectName = seed.name;
  const title = `${subjectName} Vaccination Schedule (2026): Kitten Shots & Boosters`;
  const metaDescription = `Complete ${subjectName} vaccination schedule: FVRCP kitten series, rabies timing, FeLV considerations, and adult boosters.`;
  const quickAnswer = `${subjectName} kittens begin FVRCP at 6-8 weeks, finish the series around 16 weeks, and receive rabies per local regulations. FeLV may be recommended based on outdoor exposure.`;

  return {
    collectionId: 'cat-vaccination-schedule',
    slug: seed.slug,
    subjectName,
    title: `${title} | PetClues Guides`,
    metaDescription,
    keywords: [`${subjectName.toLowerCase()} vaccination schedule`, `${seed.slug} kitten vaccines`, 'cat vaccine timeline 2026'],
    quickAnswer,
    updatedAt: UPDATED_AT,
    intro: [
      `This ${subjectName} vaccination schedule covers core kitten vaccines, rabies requirements, and optional feline leukemia (FeLV) planning.`,
      `${seed.name} cats (${seed.lifestyle}) should pair vaccines with screening for ${seed.healthFocus}.`,
    ],
    sections: [
      {
        heading: 'Core vaccines for cats',
        bullets: ['FVRCP (panleukopenia, calicivirus, rhinotracheitis)', 'Rabies (legally required in most regions)', 'FeLV for at-risk lifestyles'],
      },
      {
        heading: `Breed and lifestyle notes for ${subjectName}`,
        paragraphs: [
          `Indoor versus outdoor access changes which non-core vaccines your veterinarian recommends for ${subjectName} cats.`,
          `Keep vaccine records with dental, weight, and cardiac screening notes, especially for ${seed.healthFocus}.`,
        ],
      },
    ],
    schedule: catVaccineSchedule(seed),
    faqs: standardFaqs(`${subjectName} vaccine schedule`, `FeLV and rabies rules vary by region for ${subjectName} cats.`),
    petcluesWorkflow: {
      headline: 'Track cat vaccines in PetClues',
      steps: [
        'Add your cat with breed ' + subjectName + ' and lifestyle notes.',
        'Upload vaccine certificates after each visit.',
        'Set booster reminders before boarding or travel.',
        'Export a summary for groomers or cat sitters.',
      ],
    },
    relatedLearnSlugs: ['indoor-cat-vaccination-record-guide', 'puppy-vaccine-booster-tracker'],
    relatedBlogSlugs: [
      'kitten-core-vaccine-timeline-first-year',
      seed.slug === 'maine-coon'
        ? 'maine-coon-cat-health-monitoring-guide'
        : 'siamese-cat-vaccination-and-wellness-records',
    ],
    relatedFaqSlugs: ['what-vaccines-do-kittens-need', 'do-indoor-cats-still-need-vaccines'],
    relatedPageKeys: ['health-record-template/kitten-health-record-template', 'pet-care-checklist/new-kitten-checklist'],
  };
}

function buildTravelChecklistPage(seed: CountrySeed): ProgrammaticPage {
  const subjectName = seed.name;
  const title = `Pet Travel Checklist for ${subjectName} (2026)`;
  const metaDescription = `Step-by-step pet travel checklist for ${subjectName}: rabies rules, microchip requirements, health certificates, and pre-trip milestones.`;
  const quickAnswer = `Traveling to ${subjectName} typically requires ${seed.microchipRequired ? 'an ISO microchip before rabies vaccination, ' : ''}current rabies proof${seed.tapewormRequired ? ', tapeworm treatment for dogs,' : ''} and an endorsed health certificate. Start months ahead.`;

  const checklist: ProgrammaticChecklistGroup[] = [
    {
      title: '3-6 months before travel',
      items: [
        'Confirm import rules with official government sources for ' + subjectName,
        seed.microchipRequired ? 'Implant ISO microchip before rabies vaccine' : 'Verify identification requirements',
        'Ensure rabies vaccine meets minimum age and waiting-period rules',
        'Research approved airlines and transit countries',
      ],
    },
    {
      title: '30-60 days before departure',
      items: [
        'Book veterinary health certificate appointment',
        'Collect prior vaccine records and microchip number',
        seed.tapewormRequired ? 'Schedule tapeworm treatment within required window for dogs' : 'Confirm parasite treatment requirements',
        'Order travel crate that meets airline IATA standards',
      ],
    },
    {
      title: 'Travel day',
      items: [
        'Carry original health certificate and vaccine records',
        'Attach water bowl, absorbent bedding, and ID tag to crate',
        'Pack medications with labeled instructions',
        'Bring digital copies in PetClues for backup access',
      ],
    },
  ];

  return {
    collectionId: 'pet-travel-checklist',
    slug: seed.slug,
    subjectName,
    title: `${title} | PetClues Guides`,
    metaDescription,
    keywords: [`pet travel ${seed.slug}`, `bring dog to ${subjectName}`, 'international pet travel checklist'],
    quickAnswer,
    updatedAt: UPDATED_AT,
    intro: [
      `${seed.entrySummary}`,
      `This checklist is a planning aid for ${seed.region} travel to ${subjectName}, always verify current rules before booking.`,
    ],
    sections: [
      {
        heading: `Entry requirements snapshot for ${subjectName}`,
        bullets: [
          `Rabies vaccination: ${seed.rabiesRequired ? 'Required' : 'Check current policy'}`,
          `ISO microchip: ${seed.microchipRequired ? 'Required before rabies' : 'Recommended'}`,
          `Tapeworm treatment: ${seed.tapewormRequired ? 'Required for dogs' : 'Not standard'}`,
        ],
      },
    ],
    checklist,
    faqs: standardFaqs(`pet travel checklist for ${subjectName}`, `Import rules for ${subjectName} change- use official government sources.`),
    petcluesWorkflow: {
      headline: 'Organize travel documents in PetClues',
      steps: [
        'Store rabies certificates and microchip numbers in one vault.',
        'Set reminders for certificate expiration and booster due dates.',
        'Build a travel-day checklist note linked to your pet profile.',
        'Share read-only emergency passport with travel companions.',
      ],
    },
    relatedLearnSlugs: ['international-pet-travel-vaccine-timeline', 'create-a-pet-passport-for-sitters'],
    relatedBlogSlugs: ['international-pet-travel-health-certificate-guide', 'cross-country-move-pet-records-guide'],
    relatedFaqSlugs: [
      'how-do-international-pet-travel-health-certificates-work',
      'how-early-should-i-prepare-pet-travel-paperwork',
    ],
    relatedPageKeys: ['pet-care-checklist/travel-day-checklist', 'pet-travel-checklist/united-kingdom'],
  };
}

function buildEmergencyChecklistPage(seed: EmergencySpeciesSeed): ProgrammaticPage {
  const subjectName = seed.name;
  const title = `${subjectName} Emergency Checklist: First Aid & Urgent Vet Signs`;
  const metaDescription = `Species-specific ${subjectName.toLowerCase()} emergency checklist: normal vitals, first-aid kit items, and when to seek urgent veterinary care.`;
  const quickAnswer = `For ${subjectName.toLowerCase()}s, know normal vitals (heart ${seed.heartRate}), keep a species-appropriate first-aid kit, and seek urgent care for ${seed.uniqueRisk.toLowerCase()}.`;

  const checklist: ProgrammaticChecklistGroup[] = [
    {
      title: 'Emergency kit essentials',
      items: [
        'Veterinary emergency phone numbers and nearest 24-hour clinic',
        'Digital and printed medical summary',
        'Species-appropriate carrier or transport container',
        'Gloves, gauze, saline, and thermometer where applicable',
        'Any daily medications with dosing instructions',
      ],
    },
    {
      title: 'Know normal vitals',
      items: [
        `Heart rate: ${seed.heartRate}`,
        `Respiratory rate: ${seed.respiratoryRate}`,
        `Temperature: ${seed.temperature}`,
      ],
    },
    {
      title: 'Seek urgent care when you see',
      items: [
        seed.uniqueRisk,
        'Collapse, seizures, or uncontrolled bleeding',
        'Difficulty breathing or persistent vomiting',
        'Trauma, toxin ingestion, or sudden severe pain',
      ],
    },
  ];

  return {
    collectionId: 'pet-emergency-checklist',
    slug: seed.slug,
    subjectName,
    title: `${title} | PetClues Guides`,
    metaDescription,
    keywords: [`${seed.slug} emergency checklist`, `${seed.slug} first aid`, 'pet emergency preparedness'],
    quickAnswer,
    updatedAt: UPDATED_AT,
    intro: [
      `This ${subjectName} emergency checklist helps you prepare before a crisis and recognize when home monitoring is not enough.`,
      `Species-specific risks for ${subjectName.toLowerCase()}s include ${seed.uniqueRisk.toLowerCase()}.`,
    ],
    sections: [
      {
        heading: `Before an emergency with your ${subjectName.toLowerCase()}`,
        bullets: [
          'Save your primary vet and emergency clinic contacts',
          'Practice loading your pet into a carrier calmly',
          'Keep a printed and digital health summary updated quarterly',
        ],
      },
    ],
    checklist,
    faqs: standardFaqs(`${subjectName} emergency checklist`, `First aid stabilizes transport. It does not replace emergency veterinary care for ${subjectName.toLowerCase()}s.`),
    petcluesWorkflow: {
      headline: 'Emergency-ready records in PetClues',
      steps: [
        'Fill emergency contacts, allergies, and medications in your pet profile.',
        'Generate an emergency passport PDF for your fridge or sitter.',
        'Log prior ER visits so new clinicians see history fast.',
        'Set annual reminders to refresh kit supplies and contacts.',
      ],
    },
    relatedLearnSlugs: ['build-a-pet-emergency-info-card', 'emergency-pet-passport-for-allergies-and-meds'],
    relatedBlogSlugs: ['pet-emergency-information-card-guide', 'printable-pet-passport-template-emergency'],
    relatedFaqSlugs: [
      'what-should-a-pet-emergency-passport-include',
      'what-is-an-emergency-pet-information-card',
    ],
    relatedPageKeys: ['pet-care-checklist/emergency-kit-checklist', 'health-record-template/senior-pet-health-summary'],
  };
}

function buildTemplatePage(
  collectionId: 'medication-tracking-template' | 'health-record-template' | 'pet-care-checklist',
  seed: TemplateSeed,
): ProgrammaticPage {
  const typeLabel =
    collectionId === 'medication-tracking-template'
      ? 'Medication tracking template'
      : collectionId === 'health-record-template'
        ? 'Health record template'
        : 'Pet care checklist';

  const title = `${seed.name}: Free ${typeLabel}`;
  const metaDescription = `Use this ${seed.name.toLowerCase()} for ${seed.audience.toLowerCase()}. Track ${seed.focus} digitally in PetClues or print for your binder.`;
  const quickAnswer = `The ${seed.name} helps ${seed.audience.toLowerCase()} track ${seed.focus}. Duplicate it in PetClues for reminders and searchable history.`;

  const checklist: ProgrammaticChecklistGroup[] = [
    {
      title: 'Template sections',
      items: [
        'Pet name, species, breed, and date of birth',
        'Primary veterinarian and emergency contacts',
        `Focus area: ${seed.focus}`,
        'Notes column for reactions, symptoms, or completion checkmarks',
        'Next review or due date field',
      ],
    },
    {
      title: 'How to use this template',
      items: [
        'Fill baseline information once, then update after each visit or dose',
        'Photograph paper forms and store them in PetClues',
        'Set reminders for recurring tasks (doses, grooming, wellness)',
        'Share read-only summaries with sitters or family',
      ],
    },
  ];

  const sections: ProgrammaticSection[] = [
    {
      heading: `Who this template is for`,
      paragraphs: [`Designed for ${seed.audience.toLowerCase()} who need a repeatable system for ${seed.focus}.`],
    },
    {
      heading: 'Paper vs digital tracking',
      bullets: [
        'Paper works for quick fridge notes and vet handoffs',
        'Digital tracking adds search, reminders, and emergency export',
        'Many owners combine both: paper day-of, digital source of truth',
      ],
    },
  ];

  const workflowHeadline =
    collectionId === 'medication-tracking-template'
      ? 'Log medications in PetClues'
      : collectionId === 'health-record-template'
        ? 'Build health records in PetClues'
        : 'Run checklists in PetClues';

  return {
    collectionId,
    slug: seed.slug,
    subjectName: seed.name,
    title: `${title} | PetClues Guides`,
    metaDescription,
    keywords: [seed.slug.replace(/-/g, ' '), typeLabel.toLowerCase(), 'pet organizer template'],
    quickAnswer,
    updatedAt: UPDATED_AT,
    intro: [
      `This ${seed.name} gives ${seed.audience.toLowerCase()} a structured starting point for ${seed.focus}.`,
      'Customize fields with your veterinarian and save updates in one place.',
    ],
    sections,
    checklist,
    faqs: standardFaqs(seed.name.toLowerCase(), `Templates organize information. They do not diagnose or prescribe.`),
    petcluesWorkflow: {
      headline: workflowHeadline,
      steps: [
        'Create or select the pet profile this template belongs to.',
        'Add entries after each vet visit, dose, or checklist run.',
        'Attach photos of lab results, labels, or completed forms.',
        'Enable reminders so recurring tasks do not slip.',
      ],
    },
    relatedLearnSlugs: ['weekly-pet-admin-day-system', 'organize-multi-pet-household-care-tasks'],
    relatedBlogSlugs: ['organize-pet-medical-records-online', 'pet-medication-reminder-guide'],
    relatedFaqSlugs: ['how-do-i-upload-pet-documents-to-petclues', 'how-long-should-i-keep-pet-medical-records'],
    relatedPageKeys: [
      'health-record-template/annual-wellness-record-template',
      'medication-tracking-template/dog-daily-medication-log',
      'pet-care-checklist/annual-wellness-checklist',
    ],
  };
}

export function buildAllProgrammaticPages(): ProgrammaticPage[] {
  const pages: ProgrammaticPage[] = [
    ...DOG_BREED_SEEDS.map(buildDogVaccinationPage),
    ...CAT_BREED_SEEDS.map(buildCatVaccinationPage),
    ...COUNTRY_SEEDS.map(buildTravelChecklistPage),
    ...EMERGENCY_SPECIES_SEEDS.map(buildEmergencyChecklistPage),
    ...MEDICATION_TEMPLATE_SEEDS.map((seed) => buildTemplatePage('medication-tracking-template', seed)),
    ...HEALTH_RECORD_TEMPLATE_SEEDS.map((seed) => buildTemplatePage('health-record-template', seed)),
    ...CARE_CHECKLIST_TEMPLATE_SEEDS.map((seed) => buildTemplatePage('pet-care-checklist', seed)),
  ];

  const keys = new Set(pages.map((page) => `${page.collectionId}/${page.slug}`));
  if (keys.size !== pages.length) {
    throw new Error('Duplicate programmatic page keys detected');
  }

  return pages;
}

export const EXPECTED_PROGRAMMATIC_PAGE_COUNT = 91;
