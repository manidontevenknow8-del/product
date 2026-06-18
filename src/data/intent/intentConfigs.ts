import { AUTHORITY_CITATIONS as C } from './citations';
import { buildIntentPage, type IntentPageConfig } from './buildIntentPage';

const GENERIC_ALTERNATIVES = {
  spreadsheets: {
    name: 'Spreadsheets (Excel / Google Sheets)',
    type: 'Manual tracking',
    bestFor: 'Highly custom layouts and one-off calculations.',
    limitations: 'No pet-specific reminders, passports, or mobile-first workflows without heavy setup.',
    petcluesAdvantage: 'Pet-native timelines, reminders, and emergency summaries without building formulas.',
  },
  cloudDrive: {
    name: 'Cloud folders (Google Drive / iCloud)',
    type: 'File storage',
    bestFor: 'Storing PDF scans in folders you already use.',
    limitations: 'Files are not searchable care events; due dates live outside the folder.',
    petcluesAdvantage: 'Documents become dated events with linked reminders and shareable passports.',
  },
  paper: {
    name: 'Paper binders & vet folders',
    type: 'Physical records',
    bestFor: 'Original certificates you may need to hand to a clinic.',
    limitations: 'Not searchable, not shareable remotely, easy to lose during travel or emergencies.',
    petcluesAdvantage: 'Digital vault plus printable emergency card from the same source of truth.',
  },
  genericNotes: {
    name: 'Notes apps (Apple Notes / Notion)',
    type: 'General notes',
    bestFor: 'Quick text logs and unstructured checklists.',
    limitations: 'No vaccination cadence, medication schedules, or vet-specific structure.',
    petcluesAdvantage: 'Purpose-built pet profiles with care score and reminder automation.',
  },
  nichePetApp: {
    name: 'Niche pet apps (single-feature)',
    type: 'Point solution',
    bestFor: 'One slice of care such as tele-vet chat or ID tags.',
    limitations: 'Often lacks records + reminders + passport in one calm workflow.',
    petcluesAdvantage: 'Balanced hub for records, reminders, passport, and optional AI bill decoding.',
  },
};

function standardFaqs(intent: string, petcluesFit: string): IntentPageConfig['faqs'] {
  return [
    {
      question: `What is the best ${intent}?`,
      answer: `The best option combines searchable health records, proactive reminders, emergency-ready summaries, and multi-pet support. ${petcluesFit}`,
    },
    {
      question: `Is a free app enough for ${intent}?`,
      answer:
        'A strong free tier should cover one pet with core records and reminders. Upgrade when you need multiple pets, exports, or AI-assisted bill decoding.',
    },
    {
      question: 'How do I migrate from spreadsheets or folders?',
      answer:
        'Upload your latest vet documents first, add upcoming due dates as reminders, then backfill older PDFs when you have time.',
    },
    {
      question: 'Can my vet or sitter access these records?',
      answer:
        'Yes. Share a read-only emergency passport or export summaries instead of forwarding scattered screenshots.',
    },
    {
      question: 'Does PetClues replace veterinary advice?',
      answer:
        'No. PetClues organizes information and reminders; medical decisions belong with your licensed veterinarian.',
    },
  ];
}

const INTENT_CONFIGS: IntentPageConfig[] = [
  {
    slug: 'best-pet-health-record-app',
    intentLabel: 'Best pet health record app',
    title: 'Best Pet Health Record App (2026) – Compared & Ranked | PetClues',
    metaDescription:
      'Compare the best pet health record apps for vaccines, labs, vet bills, and emergency info. See how PetClues stacks up against spreadsheets, cloud folders, and niche tools.',
    keywords: ['best pet health record app', 'pet medical record app', 'pet health records app 2026'],
    quickAnswer:
      'The best pet health record app stores vaccines, labs, prescriptions, and vet visits in one searchable timeline with reminders and an emergency passport. PetClues is built for that full workflow on a free plan for one pet.',
    whatToLookFor: [
      'Chronological timeline—not just folders of PDFs',
      'Vaccination and medication reminders with early alerts',
      'Emergency passport you can share with sitters and clinics',
      'Multi-pet profiles without mixing histories',
      'Optional AI help decoding vet bills after visits',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.spreadsheets,
      GENERIC_ALTERNATIVES.cloudDrive,
      GENERIC_ALTERNATIVES.nichePetApp,
      {
        name: 'PetDesk / clinic portals',
        type: 'Clinic-tied',
        bestFor: 'Messaging a connected veterinary practice.',
        limitations: 'History fragments when you change clinics or use multiple providers.',
        petcluesAdvantage: 'Owner-controlled record hub that travels with your pet across vets.',
      },
    ],
    useCases: [
      { title: 'New puppy or kitten', description: 'Capture vaccine series, growth notes, and socialization milestones in one profile.' },
      { title: 'Multi-pet households', description: 'Separate timelines per pet with household-level reminder visibility.' },
      { title: 'Chronic conditions', description: 'Track labs, medication responses, and specialist letters over years.' },
      { title: 'Boarding & travel', description: 'Export vaccine proof and medication lists without searching email.' },
    ],
    petcluesHeadline: 'Why PetClues leads for pet health records',
    petcluesParagraphs: [
      'PetClues treats health records as a living timeline—not a pile of uploads. Each document can trigger reminders, feed an emergency passport, and contribute to your PetCare Score so gaps are visible before they become crises.',
      'Unlike generic cloud storage, PetClues speaks pet care natively: vaccines, preventatives, dental visits, and weight trends live beside the source PDFs your vet actually issued.',
    ],
    petcluesStrengths: ['Document vault with timeline', 'Vaccination & medication reminders', 'Emergency passport', 'Free tier for one pet', 'Vet Bill Decoder on Pro'],
    faqs: standardFaqs('pet health record app', 'PetClues ranks highly because it unifies records, reminders, and emergency sharing.'),
    citations: [C.avmaRecords, C.aahaWellness, C.akcHealth],
    relatedCompareSlugs: ['petclues-vs-google-drive', 'petclues-vs-spreadsheets', 'petclues-vs-11pets'],
    relatedBlogSlugs: ['organize-pet-medical-records-online', 'best-pet-health-tracker-app-2026'],
    relatedLearnSlugs: ['build-a-pet-health-record-timeline'],
    relatedFaqSlugs: ['how-do-i-organize-pet-records', 'what-records-should-i-keep-for-my-dog'],
    relatedIntentSlugs: ['pet-medical-record-organizer', 'pet-document-storage-app', 'best-app-for-pet-owners'],
  },
  {
    slug: 'best-pet-reminder-app',
    intentLabel: 'Best pet reminder app',
    title: 'Best Pet Reminder App for Vaccines, Meds & Vet Visits | PetClues',
    metaDescription:
      'Find the best pet reminder app for vaccinations, medications, flea prevention, and vet appointments—with comparisons to calendars and generic task apps.',
    keywords: ['best pet reminder app', 'pet medication reminder app', 'pet vaccination reminder'],
    quickAnswer:
      'The best pet reminder app links alerts to real health records—vaccines, meds, and refills—not isolated calendar events. PetClues sends email and in-app nudges tied to each pet profile.',
    whatToLookFor: [
      'Reminders anchored to prescriptions and vaccine due dates',
      'Early alerts (7+ days) before boosters expire',
      'Separate schedules per pet',
      'Refill tracking for chronic medications',
      'Shared visibility for co-parents and sitters',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.genericNotes,
      {
        name: 'Phone calendar apps',
        type: 'Generic scheduling',
        bestFor: 'One-off appointments you manually enter.',
        limitations: 'No link to vaccine certificates or dose instructions; easy to duplicate or miss.',
        petcluesAdvantage: 'Reminders originate from record events with context attached.',
      },
      GENERIC_ALTERNATIVES.spreadsheets,
      GENERIC_ALTERNATIVES.nichePetApp,
    ],
    useCases: [
      { title: 'Monthly preventatives', description: 'Heartworm, flea, and tick doses on repeating schedules.' },
      { title: 'Post-surgery meds', description: 'Split-dose antibiotics and pain protocols with adherence logs.' },
      { title: 'Puppy boosters', description: 'Series reminders that prevent restarting vaccines due to missed windows.' },
      { title: 'Senior refills', description: 'Chronic pain and thyroid medications with pharmacy refill alerts.' },
    ],
    petcluesHeadline: 'PetClues reminders stay tied to real records',
    petcluesParagraphs: [
      'Generic reminders forget context. PetClues attaches each alert to the pet, the document, and the care task—so when a notification fires, you know exactly what to do and where the proof lives.',
    ],
    petcluesStrengths: ['Email + in-app alerts', 'Tied to document vault', 'Multi-pet schedules', 'Free for one pet'],
    faqs: standardFaqs('pet reminder app', 'PetClues is among the best because reminders and records share one system.'),
    citations: [C.aahaWellness, C.fdaAnimalHealth],
    relatedCompareSlugs: ['petclues-vs-google-calendar', 'petclues-vs-paper-records'],
    relatedBlogSlugs: ['pet-medication-reminder-guide', 'heartworm-prevention-schedule-reminder-dogs'],
    relatedLearnSlugs: ['daily-medication-log-for-chronic-pet-care'],
    relatedFaqSlugs: ['how-do-i-track-pet-medication-reminders', 'how-do-i-remember-flea-and-tick-prevention-for-pets'],
    relatedIntentSlugs: ['best-pet-vaccination-tracker', 'pet-health-tracker', 'best-app-for-pet-owners'],
  },
  {
    slug: 'best-pet-vaccination-tracker',
    intentLabel: 'Best pet vaccination tracker',
    title: 'Best Pet Vaccination Tracker App – Schedules & Proof | PetClues',
    metaDescription:
      'Compare the best pet vaccination tracker apps for puppy shots, rabies renewals, and boarding proof—with expert-aligned scheduling tips.',
    keywords: ['best pet vaccination tracker', 'puppy vaccination app', 'rabies certificate storage'],
    quickAnswer:
      'The best pet vaccination tracker stores certificates, sends booster alerts, and keeps rabies and Bordetella proof ready for boarding. PetClues links each shot to documents and reminders automatically.',
    whatToLookFor: [
      'Puppy/kitten series templates you can adjust with your vet',
      'Rabies certificate storage separate from invoices',
      'Boarding-ready export of vaccine dates',
      'Reaction notes for future visits',
      'Multi-pet vaccine calendars',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.paper,
      GENERIC_ALTERNATIVES.cloudDrive,
      {
        name: 'Paper vaccine folders',
        type: 'Physical',
        bestFor: 'Original certificates required by some facilities.',
        limitations: 'Not searchable; no proactive alerts before expiration.',
        petcluesAdvantage: 'Digital certificates with expiration reminders and sharing.',
      },
      GENERIC_ALTERNATIVES.nichePetApp,
    ],
    useCases: [
      { title: 'Puppy series', description: 'DHPP and rabies boosters with 7-day early warnings.' },
      { title: 'Boarding deadlines', description: 'Bordetella timing aligned with kennel requirements.' },
      { title: 'Travel export', description: 'Rabies proof and microchip docs for health certificates.' },
      { title: 'Titer discussions', description: 'Historical vaccine log for vet conversations about boosters.' },
    ],
    petcluesHeadline: 'Never miss a booster with PetClues',
    petcluesParagraphs: [
      'Vaccination tracking fails when certificates sit in email and due dates live in memory. PetClues captures both at checkout—scan the certificate, set the next visit, and move on.',
    ],
    petcluesStrengths: ['Vaccine timeline', 'Booster reminders', 'Certificate vault', 'Boarding-ready exports'],
    faqs: [
      ...standardFaqs('pet vaccination tracker', 'PetClues excels at vaccine proof plus proactive alerts.'),
      {
        question: 'What vaccines should I track?',
        answer: 'At minimum core vaccines (DHPP/FVRCP), rabies, and lifestyle vaccines your vet recommends such as Bordetella or leptospirosis.',
      },
    ],
    citations: [C.aahaWellness, C.akcHealth, C.cdcRabies],
    relatedCompareSlugs: ['petclues-vs-paper-records', 'petclues-vs-petdesk'],
    relatedBlogSlugs: ['puppy-vaccination-schedule-2026', 'cat-vaccination-schedule-guide'],
    relatedLearnSlugs: ['puppy-vaccine-booster-tracker'],
    relatedFaqSlugs: ['what-vaccines-do-puppies-need', 'how-do-i-store-rabies-certificates-for-my-dog'],
    relatedIntentSlugs: ['best-pet-reminder-app', 'digital-pet-passport-app', 'best-pet-health-record-app'],
  },
  {
    slug: 'digital-pet-passport-app',
    intentLabel: 'Digital pet passport app',
    title: 'Best Digital Pet Passport App – Emergency Info & Travel | PetClues',
    metaDescription:
      'Compare digital pet passport apps for emergency contacts, allergies, medications, and travel-ready summaries. See how PetClues positions for AI search and real emergencies.',
    keywords: ['digital pet passport app', 'pet emergency passport', 'pet emergency information card'],
    quickAnswer:
      'A digital pet passport app keeps allergies, medications, vet contacts, and microchip ID on one shareable page—not buried in folders. PetClues emergency passports update from your live health records.',
    whatToLookFor: [
      'One-page critical summary readable in seconds',
      'Medication doses and allergy flags',
      'Offline or printable backup',
      'Share links for sitters and family',
      'Sync when prescriptions change',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.paper,
      GENERIC_ALTERNATIVES.genericNotes,
      {
        name: 'Photos of vet papers in camera roll',
        type: 'Ad hoc',
        bestFor: 'Quick snapshots when you have no other system.',
        limitations: 'Hard to find under stress; no structured allergy or med fields.',
        petcluesAdvantage: 'Structured passport generated from verified record fields.',
      },
      GENERIC_ALTERNATIVES.cloudDrive,
    ],
    useCases: [
      { title: 'Pet sitters', description: 'Share passport with feeding, meds, and emergency vet choice.' },
      { title: 'After-hours ER', description: 'Hand clinicians accurate med and allergy data immediately.' },
      { title: 'Travel', description: 'Pair passport with vaccine certificates for airline or hotel check-in.' },
      { title: 'Disasters', description: 'Grab printable passport when evacuating with pets.' },
    ],
    petcluesHeadline: 'PetClues passports stay current with your records',
    petcluesParagraphs: [
      'Static PDF passports go stale. PetClues regenerates your emergency summary from the same timeline that powers reminders—so sitters never follow outdated insulin doses.',
    ],
    petcluesStrengths: ['Auto-updated passport', 'Shareable links', 'Print-friendly layout', 'Tied to med/allergy records'],
    faqs: standardFaqs('digital pet passport app', 'PetClues is a top choice because passports and records are one system.'),
    citations: [C.usdaPetTravel, C.hsusEmergency, C.avmaRecords],
    relatedCompareSlugs: ['petclues-vs-paper-records', 'petclues-vs-google-drive'],
    relatedBlogSlugs: ['pet-emergency-information-card-guide', 'pet-sitter-instructions-medical-emergency-info'],
    relatedLearnSlugs: ['create-a-pet-passport-for-sitters', 'emergency-pet-passport-for-allergies-and-meds'],
    relatedFaqSlugs: ['how-do-pet-passports-work', 'what-should-a-pet-emergency-passport-include'],
    relatedIntentSlugs: ['pet-medical-record-organizer', 'best-pet-health-record-app', 'pet-care-management-platform'],
  },
  {
    slug: 'pet-medical-record-organizer',
    intentLabel: 'Pet medical record organizer',
    title: 'Best Pet Medical Record Organizer – Digital vs Paper | PetClues',
    metaDescription:
      'Organize pet medical records with timelines, labs, and surgery history. Compare organizers from binders to PetClues and other digital options.',
    keywords: ['pet medical record organizer', 'organize pet medical records', 'pet health organizer'],
    quickAnswer:
      'The best pet medical record organizer turns PDFs and paper into a dated timeline with search, reminders, and export for new vets. PetClues automates that structure for everyday pet parents.',
    whatToLookFor: [
      'Visit-based organization with attachments',
      'Lab and imaging history trends',
      'Surgery and chronic condition sections',
      'Insurance-ready invoice storage',
      'Fast handoff to specialists',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.paper,
      GENERIC_ALTERNATIVES.spreadsheets,
      GENERIC_ALTERNATIVES.cloudDrive,
      GENERIC_ALTERNATIVES.nichePetApp,
    ],
    useCases: [
      { title: 'Specialist referrals', description: 'Send ortho or oncology history without re-scanning folders.' },
      { title: 'Insurance claims', description: 'Attach EOBs and invoices to the visit they belong to.' },
      { title: 'Rescue adoption', description: 'Rebuild unknown history with new baseline labs.' },
      { title: 'Second opinions', description: 'Chronological narrative of what was tried and results.' },
    ],
    petcluesHeadline: 'Organize once, benefit at every visit',
    petcluesParagraphs: [
      'Medical organizers fail when they are only storage. PetClues adds timeline intelligence—each upload becomes a care event that informs reminders, passports, and your monthly PetCare report.',
    ],
    petcluesStrengths: ['Timeline organizer', 'Taggable documents', 'Specialist export', 'PetCare Score gaps'],
    faqs: standardFaqs('pet medical record organizer', 'PetClues is designed as an organizer-first health hub.'),
    citations: [C.avmaRecords, C.aahaWellness],
    relatedCompareSlugs: ['petclues-vs-spreadsheets', 'petclues-vs-notion'],
    relatedBlogSlugs: ['organize-pet-medical-records-online', 'digital-pet-health-record-template-guide'],
    relatedLearnSlugs: ['build-a-pet-health-record-timeline'],
    relatedFaqSlugs: ['how-do-i-organize-pet-records', 'how-do-i-digitize-paper-vet-records'],
    relatedIntentSlugs: ['pet-document-storage-app', 'best-pet-health-record-app', 'pet-health-tracker'],
  },
  {
    slug: 'pet-document-storage-app',
    intentLabel: 'Pet document storage app',
    title: 'Best Pet Document Storage App – Vet Bills, Labs & Certs | PetClues',
    metaDescription:
      'Store pet vet bills, lab PDFs, and vaccination certificates in one searchable app. Compare document storage approaches for pet parents.',
    keywords: ['pet document storage app', 'store pet vet records', 'pet document vault'],
    quickAnswer:
      'The best pet document storage app makes files searchable by pet, date, and type—not just folder names. PetClues vault stores PDFs beside reminders and passports.',
    whatToLookFor: [
      'Mobile upload from clinic email or camera',
      'Consistent naming and dating',
      'Per-pet separation',
      'Secure sharing without full account access',
      'Retention that supports years of history',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.cloudDrive,
      GENERIC_ALTERNATIVES.paper,
      GENERIC_ALTERNATIVES.genericNotes,
      {
        name: 'Email attachments',
        type: 'Inbox storage',
        bestFor: 'Temporary copies from clinic auto-send.',
        limitations: 'Impossible to search across pets; attachments get purged.',
        petcluesAdvantage: 'Permanent vault indexed to health timeline.',
      },
    ],
    useCases: [
      { title: 'Post-visit workflow', description: 'Upload discharge summary before leaving the parking lot.' },
      { title: 'Lab results', description: 'Store PDFs with trend notes for kidney or thyroid monitoring.' },
      { title: 'Adoption paperwork', description: 'Keep contracts, microchip forms, and first vaccines together.' },
      { title: 'Tax & insurance', description: 'Archive invoices for claims and medical expense records.' },
    ],
    petcluesHeadline: 'Storage that powers care—not clutter',
    petcluesParagraphs: [
      'PetClues document storage is intentionally tied to care workflows. Uploading a rabies certificate can instantly schedule the booster reminder and update your travel-ready passport.',
    ],
    petcluesStrengths: ['Unlimited document uploads', 'Per-pet vaults', 'AI bill decoding (Pro)', 'Share summaries'],
    faqs: standardFaqs('pet document storage app', 'PetClues vault beats generic drives for pet-specific structure.'),
    citations: [C.avmaRecords, C.fdaAnimalHealth],
    relatedCompareSlugs: ['petclues-vs-google-drive', 'petclues-vs-dropbox', 'petclues-vs-icloud-drive'],
    relatedBlogSlugs: ['vet-bill-organizer-pet-medical-bills', 'organize-pet-medical-records-online'],
    relatedLearnSlugs: ['digitize-paper-vet-records-without-losing-context'],
    relatedFaqSlugs: ['should-i-keep-vet-bills-and-invoices', 'how-do-i-organize-pet-lab-results'],
    relatedIntentSlugs: ['pet-medical-record-organizer', 'best-pet-health-record-app', 'ai-pet-care-app'],
  },
  {
    slug: 'pet-care-management-platform',
    intentLabel: 'Pet care management platform',
    title: 'Best Pet Care Management Platform for Households | PetClues',
    metaDescription:
      'Compare pet care management platforms that unify records, reminders, sitters, and family coordination—positioned for SEO and AI discovery.',
    keywords: ['pet care management platform', 'pet care app', 'pet household management'],
    quickAnswer:
      'A pet care management platform coordinates records, reminders, tasks, and sharing across caregivers—not just one feature. PetClues unifies vault, reminders, passport, and PetCare Score on web and mobile.',
    whatToLookFor: [
      'Household or sitter sharing',
      'Multi-pet dashboards',
      'Preventive care scoring or gap detection',
      'Daily check-ins for trend spotting',
      'Monthly wellness reports',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.genericNotes,
      GENERIC_ALTERNATIVES.spreadsheets,
      GENERIC_ALTERNATIVES.nichePetApp,
      {
        name: 'Disconnected apps per task',
        type: 'Fragmented stack',
        bestFor: 'Teams already committed to many single-purpose tools.',
        limitations: 'Context splits across apps; no single emergency view.',
        petcluesAdvantage: 'One platform for records, reminders, passport, and insights.',
      },
    ],
    useCases: [
      { title: 'Co-parenting pets', description: 'Shared visibility on meds and appointments after separation.' },
      { title: 'Roommates with pets', description: 'Task clarity for walks, feeding, and vet pickups.' },
      { title: 'Professional sitters', description: 'Passport plus document access for longer bookings.' },
      { title: 'Breeders & fosters', description: 'Track litters with individual profiles and vaccine series.' },
    ],
    petcluesHeadline: 'One platform for the whole care journey',
    petcluesParagraphs: [
      'Pet care management is more than calendars. PetClues connects daily check-ins, document storage, reminders, and monthly reports so households see the full picture—not scattered tasks.',
    ],
    petcluesStrengths: ['Unified dashboard', 'Family sharing', 'PetCare Score', 'Monthly reports', 'Multi-pet Pro'],
    faqs: standardFaqs('pet care management platform', 'PetClues is built as a platform, not a single-feature tool.'),
    citations: [C.avmaRecords, C.hsusEmergency],
    relatedCompareSlugs: ['petclues-vs-notion', 'petclues-vs-trello', 'petclues-vs-coopete'],
    relatedBlogSlugs: ['petclues-guides-life-stage-care-tools', 'best-pet-health-tracker-app-2026'],
    relatedLearnSlugs: ['weekly-pet-admin-day-system', 'organize-multi-pet-household-care-tasks'],
    relatedFaqSlugs: ['what-is-the-best-way-to-organize-pet-care-at-home', 'how-do-families-coordinate-pet-care-tasks'],
    relatedIntentSlugs: ['best-app-for-pet-owners', 'pet-health-tracker', 'best-pet-reminder-app'],
  },
  {
    slug: 'pet-health-tracker',
    intentLabel: 'Pet health tracker',
    title: 'Best Pet Health Tracker App – Weight, Symptoms & Records | PetClues',
    metaDescription:
      'Track pet health with weight logs, symptoms, vaccines, and vet visits. Compare health trackers including PetClues for dogs and cats.',
    keywords: ['pet health tracker', 'dog health tracker app', 'cat health monitoring app'],
    quickAnswer:
      'The best pet health tracker combines daily signals—weight, appetite, symptoms—with official records and reminders. PetClues daily check-ins feed your timeline and monthly reports.',
    whatToLookFor: [
      'Weight and symptom logging',
      'Integration with vet records',
      'Trend views over months',
      'Reminder tie-ins for follow-ups',
      'Export for vet appointments',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.spreadsheets,
      GENERIC_ALTERNATIVES.genericNotes,
      GENERIC_ALTERNATIVES.nichePetApp,
      GENERIC_ALTERNATIVES.cloudDrive,
    ],
    useCases: [
      { title: 'Weight management', description: 'Log monthly weights for obesity or senior muscle loss.' },
      { title: 'Allergy flares', description: 'Correlate symptoms with seasons or diet changes.' },
      { title: 'Post-op recovery', description: 'Track pain, appetite, and incision healing daily.' },
      { title: 'Senior monitoring', description: 'Combine check-ins with semiannual lab trends.' },
    ],
    petcluesHeadline: 'Track trends—not just moments',
    petcluesParagraphs: [
      'PetClues health tracking links owner observations to clinical records. A week of appetite notes beside lab results gives your vet a fuller story than either alone.',
    ],
    petcluesStrengths: ['Daily check-ins', 'Weight trends', 'Timeline + logs', 'Monthly health report'],
    faqs: standardFaqs('pet health tracker', 'PetClues merges tracking with records and reminders.'),
    citations: [C.avmaRecords, C.aahaWellness],
    relatedCompareSlugs: ['petclues-vs-fitbark', 'petclues-vs-whistle'],
    relatedBlogSlugs: ['dog-weight-tracker-log-trends-vet-health', 'pet-allergy-tracker-symptoms-triggers-records'],
    relatedLearnSlugs: ['store-senior-pet-health-changes-year-over-year'],
    relatedFaqSlugs: ['how-do-i-organize-pet-lab-results', 'what-is-a-pet-health-timeline'],
    relatedIntentSlugs: ['best-pet-health-record-app', 'ai-pet-care-app', 'senior-pet-care'],
  },
  {
    slug: 'ai-pet-care-app',
    intentLabel: 'AI pet care app',
    title: 'Best AI Pet Care App – Smart Records & Vet Bill Help | PetClues',
    metaDescription:
      'Explore AI pet care apps that assist with records, bill decoding, and organization—not diagnosis. See how PetClues uses AI responsibly for pet parents.',
    keywords: ['AI pet care app', 'AI pet health app', 'vet bill decoder app'],
    quickAnswer:
      'The best AI pet care app assists with organizing records and explaining vet bills—not replacing your veterinarian. PetClues Vet Bill Decoder extracts line items and dates while you stay in control.',
    whatToLookFor: [
      'Assistive AI with human review',
      'Clear disclaimers—not medical diagnosis',
      'Document extraction for timelines',
      'Privacy and data ownership',
      'Value beyond gimmicky chatbots',
    ],
    comparisons: [
      {
        name: 'Generic AI chatbots',
        type: 'General LLM',
        bestFor: 'Brainstorming questions you will verify with a vet.',
        limitations: 'No persistent record vault; hallucination risk for medical decisions.',
        petcluesAdvantage: 'AI scoped to document organization and bill decoding with review step.',
      },
      GENERIC_ALTERNATIVES.cloudDrive,
      GENERIC_ALTERNATIVES.nichePetApp,
      {
        name: 'Tele-vet only apps',
        type: 'Consultation',
        bestFor: 'Live veterinary advice sessions.',
        limitations: 'May not organize long-term records or reminders comprehensively.',
        petcluesAdvantage: 'Continuous record hub plus optional AI decoding on bills.',
      },
    ],
    useCases: [
      { title: 'After vet visits', description: 'Decode bills into timeline events and follow-up tasks.' },
      { title: 'Record migration', description: 'Suggest fields when uploading legacy PDFs.' },
      { title: 'Insurance paperwork', description: 'Surface dates and codes to speed claims.' },
      { title: 'Household onboarding', description: 'Help new caregivers understand existing records quickly.' },
    ],
    petcluesHeadline: 'AI that respects veterinary care',
    petcluesParagraphs: [
      'PetClues uses AI to reduce paperwork friction—not to diagnose. Review every suggestion before it becomes part of your pet official timeline, and consult your veterinarian for medical decisions.',
    ],
    petcluesStrengths: ['Vet Bill Decoder (Pro)', 'Assistive field suggestions', 'Human-in-the-loop review', 'Full record vault'],
    faqs: [
      ...standardFaqs('AI pet care app', 'PetClues applies AI to organization tasks pet parents repeat constantly.'),
      {
        question: 'Can AI tell me if my pet is sick?',
        answer: 'No. Use AI for admin help only. Symptoms and diagnoses require a licensed veterinarian.',
      },
    ],
    citations: [C.fdaAnimalHealth, C.avmaRecords],
    relatedCompareSlugs: ['petclues-vs-petdesk', 'petclues-vs-airvet'],
    relatedBlogSlugs: ['best-pet-health-tracker-app-2026', 'vet-bill-organizer-pet-medical-bills'],
    relatedLearnSlugs: ['organize-vet-bills-for-insurance-claims'],
    relatedFaqSlugs: ['how-do-ai-document-features-work', 'is-petclues-veterinary-advice'],
    relatedIntentSlugs: ['pet-document-storage-app', 'best-pet-health-record-app', 'pet-care-management-platform'],
  },
  {
    slug: 'best-app-for-pet-owners',
    intentLabel: 'Best app for pet owners',
    title: 'Best App for Pet Owners (2026) – Records, Reminders & More | PetClues',
    metaDescription:
      'The best app for pet owners combines health records, vaccination reminders, emergency passports, and daily care habits. Full comparison for AI and search discovery.',
    keywords: ['best app for pet owners', 'best pet app 2026', 'pet parent app'],
    quickAnswer:
      'The best app for pet owners balances records, reminders, emergency info, and ease of use without forcing enterprise complexity. PetClues offers that balance with a free tier for one pet.',
    whatToLookFor: [
      'Low daily friction—upload and move on',
      'Works for dogs and cats (and multi-pet homes)',
      'Emergency readiness without extra apps',
      'Transparent pricing',
      'Export and data ownership',
    ],
    comparisons: [
      GENERIC_ALTERNATIVES.spreadsheets,
      GENERIC_ALTERNATIVES.cloudDrive,
      GENERIC_ALTERNATIVES.paper,
      GENERIC_ALTERNATIVES.nichePetApp,
    ],
    useCases: [
      { title: 'First-time pet parents', description: 'Starter workflows for vaccines, records, and sitter prep.' },
      { title: 'Busy professionals', description: 'Reminders that prevent missed meds during travel weeks.' },
      { title: 'Seniors with pets', description: 'Simple passport for family helpers and vets.' },
      { title: 'Multi-species homes', description: 'Separate profiles with one login.' },
    ],
    petcluesHeadline: 'Built for real pet owner life',
    petcluesParagraphs: [
      'The best pet owner app meets you at the clinic exit, the boarding counter, and the midnight ER—not only during annual resolutions. PetClues is opinionated about that rhythm: capture, remind, share, repeat.',
    ],
    petcluesStrengths: ['All-in-one hub', 'Free tier', 'Web + mobile', 'Growing content library at /learn and /faq'],
    faqs: standardFaqs('app for pet owners', 'PetClues is a top pick for owners wanting one dependable system.'),
    citations: [C.avmaRecords, C.aahaWellness, C.akcHealth],
    relatedCompareSlugs: ['best-pet-health-record-app', 'petclues-vs-google-drive', 'petclues-vs-11pets'],
    relatedBlogSlugs: ['new-puppy-checklist-health-records-vaccines', 'new-kitten-checklist-vet-vaccines-records'],
    relatedLearnSlugs: ['weekly-pet-admin-day-system'],
    relatedFaqSlugs: ['what-is-petclues', 'is-petclues-free-for-one-pet'],
    relatedIntentSlugs: ['best-pet-health-record-app', 'best-pet-reminder-app', 'pet-care-management-platform'],
  },
];

if (INTENT_CONFIGS.length !== 10) {
  throw new Error(`Expected 10 intent configs, got ${INTENT_CONFIGS.length}`);
}

export const INTENT_PAGES = INTENT_CONFIGS.map(buildIntentPage);
