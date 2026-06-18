import type { LearnArticleConfig } from './buildArticle';

type LearnCategoryId = LearnArticleConfig['categoryId'];
type LearnArticleDraft = Omit<
  LearnArticleConfig,
  'relatedSlugs' | 'relatedBlogSlugs' | 'relatedCompareSlugs'
>;
type LearnFaq = LearnArticleConfig['faqs'][number];

const RELATED_BLOG_SLUG_POOL = [
  'organize-pet-medical-records-online',
  'pet-medication-reminder-guide',
  'new-puppy-checklist-health-records-vaccines',
  'cat-health-records-checklist',
  'vet-bill-organizer-pet-medical-bills',
  'puppy-vaccination-schedule-2026',
  'pet-emergency-information-card-guide',
  'traveling-with-pets-health-documents-checklist',
];

const RELATED_COMPARE_SLUG_POOL = [
  'petclues-vs-google-drive',
  'petclues-vs-spreadsheets',
  'best-pet-health-record-app',
  'petclues-vs-paper-records',
  'petclues-vs-petdesk',
];

function rotateTake<T>(items: readonly T[], start: number, count: number): T[] {
  return Array.from({ length: count }, (_, offset) => items[(start + offset) % items.length]);
}

type HealthRecordsSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  focus: string;
  contents: string;
  problem: string;
  benefit: string;
  workflow: string;
};

function makeHealthRecordsArticle(seed: HealthRecordsSeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `How far back should I build ${seed.focus}?`,
      answer:
        'Start with the last year of records, then add older documents that still affect current care such as diagnoses, surgeries, allergies, or long-term medications.',
    },
    {
      question: `Which documents matter most for ${seed.focus}?`,
      answer: `Prioritize ${seed.contents}, plus any clinician instructions that explain changes in treatment, symptoms, or follow-up timing.`,
    },
    {
      question: 'Should family members be able to see the same record?',
      answer:
        'Yes, if they help with appointments or daily care. Shared access reduces conflicting notes and makes it easier to answer vet questions with the same facts.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'health-records',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is a practical way to keep ${seed.contents} inside ${seed.focus}. Instead of treating each visit as an isolated event, it organizes evidence in order so you can see how symptoms, tests, and recommendations connect over time.`,
      `A strong health record pairs source files with brief owner context. That means you keep the original documents, but also add short notes about what changed, what the vet wanted monitored, and what follow-up still needs to happen.`,
    ],
    whyParagraphs: [
      `${seed.problem}. Fragmented records slow down appointments and make it harder to remember what was already tried, what results came back, and what the next decision should be.`,
      `${seed.benefit}. Clean records also support second opinions, smoother handoffs between clinics, and more confident care when another adult needs to step in.`,
    ],
    howSteps: [
      `Define the scope of ${seed.focus} so you know whether it should cover one issue, one year, or the pet's full medical history.`,
      `Gather ${seed.contents} from email, clinic portals, paper folders, and your phone camera roll.`,
      'Sort everything by visit date, not upload date, so the timeline reflects what actually happened.',
      'Add a one-line summary for each visit covering the main reason, decision, and next action.',
      'Link test results, invoices, and discharge notes back to the appointment that generated them.',
      'Review the record before every appointment and update it again when new results arrive.',
    ],
    bestPractices: [
      'Use consistent labels for visit type, clinic, and body system.',
      'Keep the original PDF or photo even after you write a summary.',
      'Record unresolved questions so they are visible at the next visit.',
      'Capture weight, diagnosis, and medication changes as separate searchable details.',
      'Audit the record quarterly to merge duplicates and fix missing dates.',
    ],
    commonMistakes: [
      'Saving files with vague names like "vet note" or "bloodwork".',
      'Keeping labs in one place and the visit summary somewhere else.',
      'Relying on memory instead of noting symptoms and follow-up deadlines.',
      'Uploading old paper records without preserving their original dates.',
      'Sharing screenshots that cut off the clinic name, date, or dosage.',
    ],
    workflowParagraphs: [
      `PetClues works well for this topic because ${seed.workflow}. You can store the source document, add a searchable summary, and keep the record ready for the next appointment without rebuilding the story from scratch.`,
      `Because the record stays centralized, household members can review the same timeline, confirm what has already happened, and prepare better questions before they call the vet or leave home.`,
    ],
    workflowSteps: [
      'Create or open the pet profile and add the visit date as the anchor for the record.',
      `Upload ${seed.contents} and tag each file so related items stay grouped.`,
      'Write a short summary with symptoms, diagnosis, and the next recommended action.',
      'Share the updated record with any family member who helps manage appointments or care.',
    ],
    faqs,
  };
}

type VaccinationsSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  contents: string;
  proofUse: string;
  risk: string;
  benefit: string;
  cadence: string;
};

function makeVaccinationsArticle(seed: VaccinationsSeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `What belongs in a vaccination record for ${seed.proofUse}?`,
      answer: `Keep ${seed.contents}, plus the clinic name and the date each vaccine becomes due again so you can prove compliance without guessing.`,
    },
    {
      question: `How often should I review this plan during ${seed.cadence}?`,
      answer:
        'Review it after every vaccine visit and again two to four weeks before any boarding, travel, or licensing deadline that depends on proof.',
    },
    {
      question: 'Should I save the certificate even if the clinic has a portal?',
      answer:
        'Yes. Portals change, links expire, and some facilities want a downloadable PDF or photo that you can send immediately from your phone.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'vaccinations',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is an organized record of ${seed.contents}. It keeps both the medical timeline and the proof you may need later for ${seed.proofUse}, rather than treating vaccines as a one-time appointment note.`,
      `Good vaccine tracking also captures context, such as when a series started, whether a dose was delayed, and what follow-up the clinic recommended. That context matters whenever another provider asks what was given and when.`,
    ],
    whyParagraphs: [
      `${seed.risk}. Vaccine records often matter outside the exam room because boarding facilities, landlords, trainers, and travel providers may ask for proof on short notice.`,
      `${seed.benefit}. When the record is current, you can plan ahead instead of reacting to a last-minute request for certificates or booster timing.`,
    ],
    howSteps: [
      `Collect ${seed.contents} from the clinic, breeder, rescue, or previous owner and confirm which dates are verified.`,
      `Create a simple schedule for ${seed.cadence} so due dates are visible before they become urgent.`,
      'Attach the official certificate or invoice for every completed vaccine, not just a handwritten reminder.',
      'Record why any dose was postponed, repeated, or replaced with a titer or alternate plan.',
      `Check the record against the requirements for ${seed.proofUse} before you need to submit it.`,
      'Set reminders early enough to account for appointment availability and any waiting period after vaccination.',
    ],
    bestPractices: [
      'Keep the certificate image and the typed date together.',
      'Track vaccine brand or lot details when they appear on the record.',
      'Separate due-soon vaccines from fully current vaccines for quick review.',
      'Review facility or travel rules because they may differ from your clinic schedule.',
      'Retain old certificates after renewal so you can reconstruct history if needed.',
    ],
    commonMistakes: [
      'Assuming a calendar reminder is the same as proof.',
      'Saving the invoice but not the vaccine certificate.',
      'Forgetting that puppies and rescues may have partial histories.',
      'Waiting until the night before travel or boarding to verify requirements.',
      'Failing to note delays that changed the original schedule.',
    ],
    workflowParagraphs: [
      'PetClues helps by pairing date-based reminders with the actual proof file, so the schedule and the certificate stay in the same place.',
      `That makes it easier to answer both medical questions and paperwork requests for ${seed.proofUse}, especially when you are away from your desktop.`,
    ],
    workflowSteps: [
      'Add each completed vaccine with its administration date and next due date.',
      `Upload the certificate, invoice, or rescue paperwork that proves ${seed.contents}.`,
      'Create a reminder before the due date so you have time to book the appointment.',
      `Keep the finished record ready to share when ${seed.proofUse} requires documentation.`,
    ],
    faqs,
  };
}

type PetPassportSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  audience: string;
  coreInfo: string;
  trigger: string;
  benefit: string;
  workflow: string;
};

function makePetPassportArticle(seed: PetPassportSeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `Who should receive ${seed.title.toLowerCase()}?`,
      answer: `Share it with ${seed.audience} and anyone else who might suddenly need to make care decisions or transport your pet without you.`,
    },
    {
      question: 'How detailed should a pet passport be?',
      answer:
        'Aim for quick clarity, not a full chart. Include the essentials first, then link or reference where the deeper records live if someone needs more context.',
    },
    {
      question: 'When should I update the passport?',
      answer:
        'Update it after medication changes, new diagnoses, routine shifts, and any contact change that would matter during a handoff or urgent situation.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'pet-passports',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is a condensed care summary designed for ${seed.audience}. It pulls together ${seed.coreInfo} so another person can understand the essentials without reading the pet's entire archive.`,
      `A passport is different from a full medical record because it is built for portability. It highlights the information that is hardest to recall quickly and easiest to misunderstand when you are not there to explain it.`,
    ],
    whyParagraphs: [
      `${seed.trigger}. In those moments, long folders and fragmented text threads are a poor substitute for a single clear summary.`,
      `${seed.benefit}. A passport protects continuity of care while still letting you keep deeper documents in a separate record system.`,
    ],
    howSteps: [
      `List the core sections your ${seed.audience} will need first, including ${seed.coreInfo}.`,
      'Write each section in plain language that a non-clinician can understand at a glance.',
      'Add emergency contacts, preferred clinics, and any must-know restrictions near the top.',
      'Remove outdated details that could create conflicting instructions.',
      'Test the passport by asking another adult to read it and explain the routine back to you.',
      'Review and refresh it whenever travel, medication, feeding, or behavior needs change.',
    ],
    bestPractices: [
      'Keep the summary short enough to read in under two minutes.',
      'Use headings so a sitter or clinic can scan for the right section quickly.',
      "Include the pet's normal baseline behavior, not only warnings.",
      'State what requires immediate contact with you or the vet.',
      'Link the passport to the deeper record for people who need more detail.',
    ],
    commonMistakes: [
      'Treating the passport like a dumping ground for every old document.',
      'Leaving out medication timing because it feels obvious to you.',
      'Forgetting to update care instructions after routine changes.',
      'Using abbreviations that make sense only to your household.',
      'Sharing a version that hides the latest emergency contacts.',
    ],
    workflowParagraphs: [
      `PetClues supports this well because ${seed.workflow}. You can keep a concise passport visible while the supporting records remain stored in the same pet profile.`,
      'That balance is useful when a sitter needs a clear handoff but you still want quick access to vaccines, prescriptions, and past visit notes if questions come up.',
    ],
    workflowSteps: [
      'Open the pet profile and collect the key routine, medical, and contact details.',
      'Create a concise summary that foregrounds the information another caregiver needs first.',
      'Attach supporting records for medications, vaccines, or recent visits behind the summary.',
      'Share or review the passport before each handoff so the recipient has the current version.',
    ],
    faqs,
  };
}

type TravelSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  tripType: string;
  documents: string;
  leadTime: string;
  risk: string;
  workflow: string;
};

function makeTravelArticle(seed: TravelSeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `When should I start gathering documents for ${seed.tripType}?`,
      answer: `${seed.leadTime}. Starting early gives you time to replace missing paperwork and confirm requirements with providers before travel week.`,
    },
    {
      question: `Which records matter most for ${seed.tripType}?`,
      answer: `Start with ${seed.documents}, then add anything specific your airline, lodging, state, or destination country requires.`,
    },
    {
      question: 'Should travel documents live separately from routine medical records?',
      answer:
        'They should be easy to access as a travel packet, but they work best when they remain linked to the underlying health record so dates and supporting documents stay accurate.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'pet-travel',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is a travel preparation system for ${seed.tripType}. It brings together ${seed.documents} so you can meet provider requirements and still respond quickly if something changes mid-trip.`,
      'Travel paperwork is more than a stack of certificates. It usually combines proof of health status, identity details, destination rules, and practical care information that becomes important once you are away from your regular support system.',
    ],
    whyParagraphs: [
      `${seed.risk}. Travel issues often appear at the exact moment when you have the least flexibility to solve them.`,
      `${seed.leadTime}. A complete packet lowers stress at check-in, helps you answer questions on the road, and gives backup caregivers better context if plans change.`,
    ],
    howSteps: [
      `Research the exact requirements for ${seed.tripType} before booking or finalizing the route.`,
      `Collect ${seed.documents} and note which items expire before or during the trip.`,
      'Confirm whether any health certificate, vaccine window, or endorsement has a strict timing rule.',
      'Store digital copies and keep a quick-access travel summary on your phone.',
      'Add emergency clinic contacts for the destination or route, not just your home vet.',
      'Recheck every document one week before departure so last-minute gaps do not derail the plan.',
    ],
    bestPractices: [
      'Keep provider-specific instructions with the document packet.',
      'Save both printable files and mobile-friendly copies.',
      'Track expiration dates separately from the trip dates.',
      'Store the pet microchip number where it can be accessed offline.',
      'Review document requirements again if the itinerary changes.',
    ],
    commonMistakes: [
      'Assuming one airline or hotel policy applies everywhere.',
      'Waiting too long to learn about health certificate timing.',
      'Packing proof of vaccination but not the broader travel summary.',
      'Forgetting medication refill timing for trips longer than expected.',
      'Failing to keep backup copies outside the suitcase or carrier.',
    ],
    workflowParagraphs: [
      `PetClues is useful here because ${seed.workflow}. It lets you keep the trip-specific packet alongside the medical records that support it, which makes updates less error-prone.`,
      'That is especially helpful when a travel requirement changes and you need to confirm the underlying vaccine date, certificate, or prescription quickly.',
    ],
    workflowSteps: [
      `Create a travel checklist for ${seed.tripType} and add the required due dates.`,
      `Upload ${seed.documents} into the pet profile so proof and source files stay together.`,
      'Save destination contacts, travel notes, and any provider-specific instructions.',
      'Review the packet from your phone before leaving home and again at the first checkpoint.',
    ],
    faqs,
  };
}

type EmergencySeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  emergencyType: string;
  criticalInfo: string;
  failurePoint: string;
  benefit: string;
  workflow: string;
};

function makeEmergencyArticle(seed: EmergencySeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `What information should I surface first during ${seed.emergencyType}?`,
      answer: `Put ${seed.criticalInfo} at the top so the first person helping your pet can make safer decisions immediately.`,
    },
    {
      question: 'How often should I review emergency prep?',
      answer:
        'Review it whenever medications, phone numbers, addresses, or care routines change, and run a quick audit every few months even if nothing major happened.',
    },
    {
      question: 'Should emergency notes include routine history too?',
      answer:
        'Include only the history that changes urgent decisions, such as allergies, recent diagnoses, active medications, or events that explain the current problem.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'pet-emergencies',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is a rapid-reference system for ${seed.emergencyType}. It gathers ${seed.criticalInfo} so you are not forced to reconstruct the essentials while stressed, driving, or handing the pet to someone else.`,
      'Emergency prep is not about predicting every scenario. It is about making the first minutes more useful by moving critical facts into a format that can be scanned fast and shared without confusion.',
    ],
    whyParagraphs: [
      `${seed.failurePoint}. When the first details are incomplete, triage can slow down and family members may give conflicting answers.`,
      `${seed.benefit}. Clear emergency preparation also helps neighbors, sitters, and relatives act more confidently if they are the ones present when something goes wrong.`,
    ],
    howSteps: [
      `Decide what a responder would need to know first for ${seed.emergencyType}.`,
      `Collect ${seed.criticalInfo} and verify every phone number, clinic address, and dosage entry.`,
      'Put the most urgent warnings first, such as allergies, active medications, or time-sensitive exposures.',
      'Create a portable summary that can be shown on a phone or printed for a go-bag.',
      'Store supporting documents nearby, including recent visit notes or lab results if they affect treatment.',
      'Practice finding the summary quickly so the system works when stress is high.',
    ],
    bestPractices: [
      'Favor short facts over long narrative paragraphs.',
      'Keep one version for the go-bag and one version in your phone.',
      'Add a recent photo when identification could matter.',
      'Mark the date of the last emergency prep review.',
      'Tell backup caregivers where the emergency summary lives.',
    ],
    commonMistakes: [
      'Listing outdated medications or old clinic numbers.',
      'Burying allergies or urgent warnings in the middle of the page.',
      'Assuming another adult knows where the information is stored.',
      'Saving the documents but never testing retrieval under pressure.',
      'Ignoring scenario-specific details like toxin timing or seizure duration.',
    ],
    workflowParagraphs: [
      `PetClues supports this by ${seed.workflow}. That lets you keep the fast summary and the deeper supporting records in one place instead of scattering them across apps and paper folders.`,
      'When seconds matter, being able to open the pet profile and immediately see the right facts reduces friction for both caregivers and clinicians.',
    ],
    workflowSteps: [
      'Create an emergency note in the pet profile with the highest-priority facts at the top.',
      `Attach supporting records for ${seed.criticalInfo} so context is available if the clinic asks for more.`,
      'Add emergency contacts and verify they are visible from mobile.',
      'Review the emergency summary after any medication, diagnosis, or contact change.',
    ],
    faqs,
  };
}

type DocumentationSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  documentSet: string;
  useCase: string;
  risk: string;
  workflow: string;
};

function makeDocumentationArticle(seed: DocumentationSeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `What should I collect first for ${seed.useCase}?`,
      answer: `Start with ${seed.documentSet}, then add any notes that explain dates, providers, or decisions another person might question later.`,
    },
    {
      question: 'How should I name pet documents so they stay searchable?',
      answer:
        'Use a consistent pattern with the date, provider, and document type. That gives you context immediately and makes duplicates easier to spot.',
    },
    {
      question: 'Do I need to keep old versions once a new document arrives?',
      answer:
        'Usually yes. Older versions help you prove timelines, track changes, and answer disputes about previous instructions, ownership, or billing.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'pet-documentation',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is a document management approach focused on ${seed.useCase}. It keeps ${seed.documentSet} organized so the paperwork remains useful instead of becoming a pile you only revisit when something is already overdue.`,
      'Good documentation systems preserve both the file and the meaning behind it. That means dates, provider names, and short notes matter just as much as the PDF itself when you need to prove what happened.',
    ],
    whyParagraphs: [
      `${seed.risk}. Once records spread across portals, inboxes, and paper envelopes, retrieving the right page becomes slower than it should be.`,
      `A stronger documentation system improves ${seed.useCase}, reduces repeated requests from clinics or insurers, and gives you more confidence when a process depends on exact paperwork.`,
    ],
    howSteps: [
      `Gather ${seed.documentSet} from every source where it currently lives.`,
      `Group each document by the real-world purpose it serves for ${seed.useCase}.`,
      'Rename files with dates and provider names so they are understandable out of context.',
      'Add a short note when a document explains a dispute, exception, or follow-up deadline.',
      'Keep final versions and supporting evidence together instead of in separate folders.',
      'Review the set after every appointment, claim, refill, or ownership update.',
    ],
    bestPractices: [
      'Separate identity documents from treatment documents while linking both.',
      'Retain receipts, claim numbers, and correspondence with the primary file.',
      'Use tags or folders that reflect real workflows, not vague categories.',
      'Scan paper documents in full resolution before storing them.',
      'Build a habit of filing new paperwork within twenty-four hours.',
    ],
    commonMistakes: [
      'Keeping only screenshots instead of the full document.',
      'Saving claim paperwork without the supporting medical note.',
      'Dropping records into one folder with no date or provider naming pattern.',
      'Throwing away older versions that still prove a timeline.',
      'Assuming the clinic or insurer will always keep accessible copies for you.',
    ],
    workflowParagraphs: [
      `PetClues is useful here because ${seed.workflow}. You can pair the actual file with quick context, which makes later searches more reliable than relying on a filename alone.`,
      'That is especially helpful when another person needs the same paperwork and you want them to understand what it is for without re-explaining the whole backstory.',
    ],
    workflowSteps: [
      'Upload each document to the pet profile and label it with the event date.',
      `Add a short description that explains its role in ${seed.useCase}.`,
      'Link related bills, prescriptions, or visit notes so one search surfaces the full packet.',
      'Review completed workflows and archive them in a way that keeps old proof accessible.',
    ],
    faqs,
  };
}

type MedicationSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  regimen: string;
  trackingPoint: string;
  risk: string;
  benefit: string;
  workflow: string;
};

function makeMedicationArticle(seed: MedicationSeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `What should I log for ${seed.regimen}?`,
      answer: `Track ${seed.trackingPoint}, especially anything that explains whether the regimen was completed as planned or needs a vet follow-up.`,
    },
    {
      question: 'How detailed does a medication log need to be?',
      answer:
        'Detailed enough to answer what was given, when it was given, and what happened afterward. Anything beyond that should support a real care decision.',
    },
    {
      question: 'Should I track missed doses too?',
      answer:
        'Yes. Missed, delayed, or vomited doses often matter more than perfect doses because they explain why symptoms changed or why a refill lasted longer than expected.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'medication-tracking',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is a structured way to manage ${seed.regimen}. It records ${seed.trackingPoint} so the treatment history stays visible between appointments instead of living in memory or scattered reminders.`,
      'Medication tracking is most useful when it combines timing, response, and practical context. A simple yes-or-no reminder rarely explains whether a treatment actually happened as intended or whether the pet tolerated it well.',
    ],
    whyParagraphs: [
      `${seed.risk}. Treatment routines often drift gradually, which means problems can build before anyone notices the pattern.`,
      `${seed.benefit}. Better tracking also helps with refill planning, caregiver handoffs, and conversations with the vet about whether the current plan is working.`,
    ],
    howSteps: [
      `List every part of the ${seed.regimen} that needs active tracking.`,
      `Decide which details matter most, including ${seed.trackingPoint}.`,
      'Create a repeatable log format for normal doses, exceptions, and side effects.',
      'Set reminders early enough that you can prepare food, supplies, or a second caregiver if needed.',
      'Review the log weekly to spot missed doses, drifting times, or response changes.',
      'Bring the recent log to appointments so treatment decisions are based on actual data.',
    ],
    bestPractices: [
      'Keep the dose log close to the prescription instructions.',
      'Use exact times when the medication depends on consistency.',
      'Record side effects in the same place as the dose that preceded them.',
      'Track refill runway before the bottle or box is nearly empty.',
      'Share the same log with every person who may administer medication.',
    ],
    commonMistakes: [
      'Using separate reminder apps and notes that never get reconciled.',
      'Ignoring late doses because they feel too minor to record.',
      'Writing symptom changes without tying them to medication timing.',
      'Running out of medication because refill dates were not tracked.',
      'Assuming everyone in the household understands the regimen the same way.',
    ],
    workflowParagraphs: [
      `PetClues supports this routine because ${seed.workflow}. The log stays connected to prescriptions, visit notes, and reminders instead of becoming an isolated checklist.`,
      'That makes it easier to share updates with the vet and with anyone else who covers a dose when your normal routine changes.',
    ],
    workflowSteps: [
      `Create a medication entry for ${seed.regimen} and record the prescribed schedule.`,
      `Log ${seed.trackingPoint} after each dose or preventive administration.`,
      'Attach refill details, instructions, or relevant lab work to the same profile.',
      'Review the trend view before appointments or when symptoms change.',
    ],
    faqs,
  };
}

type OrganizationSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  system: string;
  scope: string;
  painPoint: string;
  payoff: string;
  workflow: string;
};

function makeOrganizationArticle(seed: OrganizationSeed): LearnArticleDraft {
  const faqs: LearnFaq[] = [
    {
      question: `What should ${seed.system} include first?`,
      answer: `Start with ${seed.scope}, then expand only when the system is easy enough to maintain during a busy week.`,
    },
    {
      question: 'How do I keep a pet organization system from becoming cluttered?',
      answer:
        'Review it on a schedule, archive completed tasks, and remove categories that no longer help real decisions or handoffs.',
    },
    {
      question: 'Should the whole household use the same system?',
      answer:
        'Yes, whenever multiple adults share care work. One shared system reduces duplicate reminders and prevents information from being trapped with one person.',
    },
  ];

  return {
    slug: seed.slug,
    title: seed.title,
    categoryId: 'pet-organization',
    excerpt: seed.excerpt,
    metaDescription: seed.metaDescription,
    keywords: seed.keywords,
    whatParagraphs: [
      `${seed.title} is an organization system built around ${seed.scope}. It gives routine pet administration a clear home so the work is easier to see, delegate, and finish.`,
      `${seed.system} should make daily life simpler, not more complicated. The best version is lightweight enough to use every week and flexible enough to absorb appointments, paperwork, and sudden schedule changes.`,
    ],
    whyParagraphs: [
      `${seed.painPoint}. Without a system, small tasks get postponed until they become urgent and emotionally expensive.`,
      `${seed.payoff}. Better organization also makes sitter handoffs, travel prep, and emergency response much smoother because the basics are already in place.`,
    ],
    howSteps: [
      `Define what ${seed.system} is supposed to cover, including ${seed.scope}.`,
      'Choose a simple structure for tasks, documents, and reminders that the whole household can understand.',
      'Add due dates for recurring work and ownership for anything that could otherwise be assumed.',
      'Link each task to the record, document, or supply it depends on.',
      'Run a short weekly review so open items are visible before they become last-minute problems.',
      'Archive finished work and refine the system whenever something repeatedly falls through.',
    ],
    bestPractices: [
      'Keep active items separate from long-term reference material.',
      'Use labels that reflect real routines, not abstract categories.',
      'Assign responsibility when more than one adult could handle a task.',
      'Make emergency and travel information visible even in a routine system.',
      'Protect time for a quick weekly reset instead of sporadic deep cleanups.',
    ],
    commonMistakes: [
      'Building a system that is too complicated to maintain.',
      'Leaving key tasks ownerless in a shared household.',
      'Storing reminders separately from the documents they depend on.',
      'Treating organization as a one-time setup rather than an ongoing rhythm.',
      'Ignoring seasonal or travel-related tasks until the last minute.',
    ],
    workflowParagraphs: [
      `PetClues fits this well because ${seed.workflow}. It gives you one place to connect tasks, documents, and caregiver context instead of splitting them across chat threads and random notes.`,
      'That shared view makes routine admin work less fragile when schedules change, someone is traveling, or a new provider needs information quickly.',
    ],
    workflowSteps: [
      `Set up ${seed.system} in the pet profile with clear task or document categories.`,
      `Add recurring items for ${seed.scope} so the routine runs on schedule.`,
      'Attach the records or notes each task depends on, especially for shared household work.',
      'Review the dashboard weekly and clear, reassign, or reschedule outstanding items.',
    ],
    faqs,
  };
}

const ARTICLE_DRAFTS: LearnArticleDraft[] = [
  makeHealthRecordsArticle({
    slug: 'build-a-pet-health-record-timeline',
    title: 'Build a Pet Health Record Timeline',
    excerpt:
      'Create a chronological medical record that shows what happened, when it happened, and what needs follow-up next.',
    metaDescription:
      'Learn how to build a pet health record timeline that keeps visits, tests, diagnoses, and follow-up plans easy to review before every appointment.',
    keywords: ['pet health record timeline', 'medical history for pets', 'vet records', 'pet care organization'],
    focus: 'a chronological medical timeline',
    contents: 'exam notes, diagnoses, invoices, and home observations',
    problem:
      'When visits are stored in separate emails and folders, you lose the sequence of symptoms and follow-up decisions',
    benefit:
      'A timeline helps you walk into appointments with facts instead of guesses and makes second opinions much easier to support',
    workflow:
      'it keeps every visit in date order and surfaces the summary before you leave for the clinic',
  }),
  makeHealthRecordsArticle({
    slug: 'annual-wellness-record-checklist-for-pets',
    title: 'Annual Wellness Record Checklist for Pets',
    excerpt:
      'Build a yearly wellness checklist that captures routine care details before they fade into a vague memory of the last exam.',
    metaDescription:
      'Use an annual wellness record checklist for pets to track weights, screenings, dental notes, and preventive renewals across each year of care.',
    keywords: ['annual pet wellness records', 'wellness visit checklist', 'pet records checklist', 'routine vet care'],
    focus: 'an annual wellness record checklist',
    contents: 'weight trends, dental notes, parasite screens, and preventive renewals',
    problem:
      'Yearly appointments can feel routine until you realize the previous recommendations are impossible to find',
    benefit:
      'Consistent wellness records reveal slow changes in weight, mobility, and behavior before they become urgent',
    workflow:
      'it lets you group routine screenings and wellness notes under one recurring yearly review',
  }),
  makeHealthRecordsArticle({
    slug: 'keep-lab-results-with-pet-records',
    title: 'Keep Lab Results With Pet Records',
    excerpt:
      'Stop separating bloodwork and test reports from the visit that ordered them so each result keeps its clinical context.',
    metaDescription:
      'Organize pet lab results with the related vet visit so bloodwork, urinalysis, and fecal reports stay easy to compare over time.',
    keywords: ['pet lab results', 'bloodwork records for pets', 'vet test reports', 'pet medical files'],
    focus: 'a lab-first filing system',
    contents: 'CBC panels, urinalysis, fecal tests, cytology reports, and reference ranges',
    problem:
      'Lab results often arrive days after the appointment and get separated from the visit that ordered them',
    benefit:
      'Keeping the report beside the clinical note makes it easier to compare values over time and answer follow-up questions quickly',
    workflow:
      'it lets you attach delayed lab PDFs to the original visit record instead of creating disconnected files',
  }),
  makeHealthRecordsArticle({
    slug: 'track-specialist-visits-for-chronic-pet-care',
    title: 'Track Specialist Visits for Chronic Pet Care',
    excerpt:
      'Combine primary care and specialist records so complex cases stop living in disconnected portals and referral emails.',
    metaDescription:
      'Track specialist visits for chronic pet care by linking referrals, imaging, treatment plans, and recheck notes in one medical history.',
    keywords: ['specialist pet records', 'chronic pet care', 'referral records', 'complex vet history'],
    focus: 'specialist notes inside the main medical record',
    contents: 'referral letters, treatment plans, imaging summaries, and recheck instructions',
    problem:
      'Chronic cases create parallel records across primary vets, specialists, and emergency clinics',
    benefit:
      'Bringing those threads together reduces repeated history taking and helps each clinician see the same treatment context',
    workflow:
      'it keeps referrals, specialist feedback, and follow-up tasks connected inside one pet profile',
  }),
  makeHealthRecordsArticle({
    slug: 'digitize-paper-vet-records-without-losing-context',
    title: 'Digitize Paper Vet Records Without Losing Context',
    excerpt:
      'Scan older paper records in a way that preserves dates, visit reasons, and outcomes instead of creating a digital junk drawer.',
    metaDescription:
      'Digitize paper vet records without losing context by preserving dates, visit reasons, and treatment outcomes in searchable files.',
    keywords: ['digitize vet records', 'scan pet medical records', 'paper vet files', 'pet record storage'],
    focus: 'a clean digitization process for paper charts',
    contents: 'printed visit summaries, handwritten discharge notes, vaccine stickers, and stapled receipts',
    problem:
      'Scanning old records without naming and grouping them clearly creates a digital junk drawer',
    benefit:
      'Good digitization preserves dates, visit reasons, and outcomes so older records stay usable instead of merely archived',
    workflow:
      'it gives each scanned record a date, label, and note so old paper files remain searchable after upload',
  }),
  makeHealthRecordsArticle({
    slug: 'create-a-shared-pet-medical-history-for-family',
    title: 'Create a Shared Pet Medical History for Family',
    excerpt:
      'Keep every caregiver on the same page with a shared pet history that reduces mixed messages and missed instructions.',
    metaDescription:
      'Create a shared pet medical history for family members so appointments, medication updates, and follow-up questions stay aligned.',
    keywords: ['shared pet medical history', 'family pet records', 'caregiver handoff', 'pet health coordination'],
    focus: 'a shared household medical history',
    contents: 'visit summaries, medication changes, questions for the next appointment, and caretaker notes',
    problem:
      'In homes with multiple caregivers, everyone remembers a slightly different version of what the vet said',
    benefit:
      'A shared record keeps instructions aligned and prevents missed doses, duplicate calls, or conflicting updates',
    workflow:
      'it gives the whole household one current source of truth instead of scattered messages and screenshots',
  }),
  makeHealthRecordsArticle({
    slug: 'store-senior-pet-health-changes-year-over-year',
    title: 'Store Senior Pet Health Changes Year Over Year',
    excerpt:
      'Track gradual changes in appetite, mobility, labs, and comfort so slow decline does not disappear into day-to-day routine.',
    metaDescription:
      'Store senior pet health changes year over year to compare mobility, appetite, bloodwork, and quality-of-life observations over time.',
    keywords: ['senior pet health records', 'aging pet monitoring', 'quality of life notes', 'pet health trends'],
    focus: 'year-over-year tracking for senior pets',
    contents: 'mobility notes, appetite shifts, bloodwork trends, and quality-of-life observations',
    problem:
      'Senior pets often change gradually, which makes meaningful decline easy to normalize or overlook',
    benefit:
      'Long-range comparisons help you spot important patterns and support more informed comfort-care decisions',
    workflow:
      'it makes annual comparisons easy by keeping senior-care notes tied to dates and supporting records',
  }),

  makeVaccinationsArticle({
    slug: 'puppy-vaccine-booster-tracker',
    title: 'Puppy Vaccine Booster Tracker',
    excerpt:
      'Track early puppy vaccines and boosters with enough detail to know what is done, what is due, and what activities should wait.',
    metaDescription:
      'Use a puppy vaccine booster tracker to manage early series dates, breeder records, deworming history, and upcoming reminders.',
    keywords: ['puppy vaccine tracker', 'puppy booster schedule', 'vaccine reminders for puppies', 'new puppy records'],
    contents: 'core vaccine dates, breeder paperwork, deworming history, and future appointment reminders',
    proofUse: 'daycare, training classes, and first boarding stays',
    risk:
      'Puppy series are time-sensitive, and a missed or duplicated dose can disrupt the full schedule',
    benefit:
      'A clear tracker shows what was already given, what is due next, and which activities should wait until protection improves',
    cadence: 'the first year',
  }),
  makeVaccinationsArticle({
    slug: 'indoor-cat-vaccination-record-guide',
    title: 'Indoor Cat Vaccination Record Guide',
    excerpt:
      'Keep indoor cat vaccine records organized so lifestyle-based decisions and proof requests stay grounded in actual documents.',
    metaDescription:
      'Follow an indoor cat vaccination record guide to track FVRCP, rabies proof, lifestyle notes, and future due dates in one place.',
    keywords: ['indoor cat vaccination record', 'cat rabies proof', 'FVRCP schedule', 'cat vaccine organization'],
    contents: 'FVRCP dates, rabies proof, lifestyle notes, and vet recommendations',
    proofUse: 'boarding, grooming, and apartment compliance',
    risk:
      'Indoor cats still need documented vaccines, but owners often lose track because appointments happen less frequently',
    benefit:
      'A clean record preserves the reasoning behind lifestyle-based decisions instead of relying on memory alone',
    cadence: 'an adult indoor cat schedule',
  }),
  makeVaccinationsArticle({
    slug: 'manage-rabies-certificate-renewals',
    title: 'Manage Rabies Certificate Renewals',
    excerpt:
      'Treat rabies paperwork like both a medical record and a legal document so renewals never become a last-minute scramble.',
    metaDescription:
      'Manage rabies certificate renewals with tag numbers, expiration dates, municipality reminders, and backup proof for licensing or travel.',
    keywords: ['rabies certificate renewal', 'pet rabies records', 'pet licensing documents', 'rabies proof'],
    contents: 'rabies certificates, tag numbers, lot details, and municipality reminders',
    proofUse: 'licensing and travel',
    risk:
      'Rabies paperwork is a legal record as much as a medical one, so missing a certificate creates hassles fast',
    benefit:
      'Tracking certificate expiration and backups keeps you ready for licensing offices, groomers, or border checks',
    cadence: 'multi-year rabies renewal cycles',
  }),
  makeVaccinationsArticle({
    slug: 'vaccine-records-for-boarding-and-daycare',
    title: 'Vaccine Records for Boarding and Daycare',
    excerpt:
      'Organize vaccine proof around facility requirements so check-in does not depend on searching old email attachments.',
    metaDescription:
      'Prepare vaccine records for boarding and daycare by tracking facility rules, expiration dates, and shareable proof files ahead of check-in.',
    keywords: ['boarding vaccine records', 'daycare vaccine proof', 'pet vaccine paperwork', 'boarding checklist'],
    contents: 'facility requirements, expiration dates, and PDF proof files',
    proofUse: 'boarding and daycare intake',
    risk:
      'Each facility phrases vaccine requirements differently, which makes last-minute check-ins stressful',
    benefit:
      'An organized record lets you confirm eligibility early and send the right proof without digging through email',
    cadence: 'each boarding season',
  }),
  makeVaccinationsArticle({
    slug: 'track-titer-tests-and-booster-decisions',
    title: 'Track Titer Tests and Booster Decisions',
    excerpt:
      'Keep the reasoning behind titer results and booster timing in one record so future decisions do not restart from zero.',
    metaDescription:
      'Track titer tests and booster decisions with report files, previous vaccine dates, clinician recommendations, and reminder notes.',
    keywords: ['pet titer tests', 'booster decision records', 'vaccine exemption tracking', 'pet immunity records'],
    contents: 'titer reports, previous vaccine dates, clinician recommendations, and reminder notes',
    proofUse: 'wellness planning and lifestyle reviews',
    risk:
      'Titer testing adds nuance, and it is easy to lose the reasoning behind why a booster was delayed or approved',
    benefit:
      'Keeping the decision trail together helps you revisit the plan with your vet instead of rebuilding the context every time',
    cadence: 'periodic immunity reviews',
  }),
  makeVaccinationsArticle({
    slug: 'multi-pet-vaccination-calendar-setup',
    title: 'Multi-Pet Vaccination Calendar Setup',
    excerpt:
      'Build one household vaccine calendar that keeps species-specific schedules clear without mixing up records across pets.',
    metaDescription:
      'Set up a multi-pet vaccination calendar to organize due dates, species-specific schedules, and clinic reminders across the whole household.',
    keywords: ['multi-pet vaccine calendar', 'household pet reminders', 'vaccination schedule organizer', 'multiple pets'],
    contents: 'species-specific schedules, due dates, and clinic preferences',
    proofUse: 'household scheduling and family handoffs',
    risk:
      'Multi-pet homes multiply reminders, paperwork, and exceptions until something important slips through',
    benefit:
      'A shared calendar reduces duplicate trips and helps you batch care without confusing one pet with another',
    cadence: 'year-round household planning',
  }),
  makeVaccinationsArticle({
    slug: 'rescue-dog-vaccine-history-reconstruction',
    title: 'Rescue Dog Vaccine History Reconstruction',
    excerpt:
      'Rebuild a rescue dog vaccine history from partial paperwork so your first vet has a cleaner starting point for future boosters.',
    metaDescription:
      'Reconstruct a rescue dog vaccine history using shelter intake papers, transport records, sticker labels, and first-clinic confirmations.',
    keywords: ['rescue dog vaccine history', 'adopted dog records', 'shelter vaccine paperwork', 'dog booster planning'],
    contents: 'shelter intake papers, transport records, sticker labels, and first-clinic confirmations',
    proofUse: 'adoption follow-up and future boosters',
    risk:
      'Rescue dogs sometimes arrive with partial or inconsistent vaccine histories',
    benefit:
      'Reconstructing the best available history prevents needless repetition and gives your new vet a cleaner baseline',
    cadence: 'the first adoption year',
  }),

  makePetPassportArticle({
    slug: 'create-a-pet-passport-for-sitters',
    title: 'Create a Pet Passport for Sitters',
    excerpt:
      'Give sitters and walkers a concise care summary so they can step in confidently without combing through your full archive.',
    metaDescription:
      'Create a pet passport for sitters with feeding, medication, behavior, and emergency details that make caregiver handoffs easier.',
    keywords: ['pet passport for sitters', 'caregiver handoff', 'dog sitter instructions', 'pet care summary'],
    audience: 'pet sitters and dog walkers',
    coreInfo: 'feeding schedule, vet contacts, medication notes, behavior triggers, and home routines',
    trigger:
      'Caregiver handoffs happen when you are away and sometimes unreachable',
    benefit:
      'A concise passport lets someone step in confidently without sorting through the full medical history',
    workflow:
      'you can keep the summary visible while still linking to deeper records if the sitter has questions',
  }),
  makePetPassportArticle({
    slug: 'emergency-pet-passport-for-allergies-and-meds',
    title: 'Emergency Pet Passport for Allergies and Meds',
    excerpt:
      'Build a portable summary of allergies and active medications so emergency decisions are not slowed by missing context.',
    metaDescription:
      'Use an emergency pet passport for allergies and meds to surface drug warnings, active prescriptions, and urgent contact details fast.',
    keywords: ['pet allergy passport', 'medication emergency summary', 'emergency pet information', 'drug allergy record'],
    audience: 'emergency clinics, sitters, and relatives',
    coreInfo: 'drug allergies, current medications, dosing times, and recent diagnoses',
    trigger:
      'Urgent care decisions can happen before you have time to explain the full history',
    benefit:
      'The passport gives responders the essentials first and reduces the chance of avoidable medication conflicts',
    workflow:
      'the summary can sit beside prescriptions and recent visit notes inside the same pet profile',
  }),
  makePetPassportArticle({
    slug: 'puppy-pet-passport-for-first-year-care',
    title: 'Puppy Pet Passport for First-Year Care',
    excerpt:
      'Keep first-year puppy care instructions current for everyone involved, from family members to trainers and sitters.',
    metaDescription:
      'Build a puppy pet passport for first-year care with vaccines, crate routine, feeding details, and training handoff notes.',
    keywords: ['puppy pet passport', 'first year puppy care', 'puppy sitter instructions', 'new puppy organization'],
    audience: 'trainers, family members, and first-time puppy caregivers',
    coreInfo: 'booster schedule, house-training cues, food brand, crate routine, and socialization rules',
    trigger:
      'Puppy care changes every few weeks and verbal instructions become outdated fast',
    benefit:
      'A first-year passport keeps everyone aligned during the busiest stage of early care',
    workflow:
      'it keeps changing routines easy to update without rewriting the whole handoff every week',
  }),
  makePetPassportArticle({
    slug: 'senior-pet-passport-for-complex-needs',
    title: 'Senior Pet Passport for Complex Needs',
    excerpt:
      'Summarize complex senior care in a format that backup caregivers can follow without missing the details that matter most.',
    metaDescription:
      'Create a senior pet passport for complex needs with mobility support, meds, comfort preferences, and backup caregiver guidance.',
    keywords: ['senior pet passport', 'complex pet care summary', 'backup caregiver notes', 'aging pet routine'],
    audience: 'pet sitters, adult children, and backup caregivers',
    coreInfo: 'mobility support, medication routine, appetite notes, and comfort preferences',
    trigger:
      'Senior pets often have small but important care details that are hard to remember under pressure',
    benefit:
      'A passport shortens the learning curve for anyone helping with a more delicate routine',
    workflow:
      'you can keep comfort-care notes, current meds, and emergency contacts visible in one portable summary',
  }),
  makePetPassportArticle({
    slug: 'pet-passport-for-divorced-or-co-parented-pets',
    title: 'Pet Passport for Divorced or Co-Parented Pets',
    excerpt:
      'Use one shared passport to keep two households aligned on meds, appointments, supplies, and exchange-day notes.',
    metaDescription:
      'Create a pet passport for divorced or co-parented pets to share routines, exchange-day supplies, meds, and upcoming appointments.',
    keywords: ['co-parented pet passport', 'shared pet custody', 'pet care between homes', 'pet handoff document'],
    audience: 'two households sharing the same pet',
    coreInfo: 'exchange-day supplies, medication status, behavior notes, and upcoming appointments',
    trigger:
      'Co-parented pets can end up with split information and duplicate purchases',
    benefit:
      'A shared passport travels with the pet and keeps both homes working from the same facts',
    workflow:
      'the shared profile makes routine updates visible to both households without relying on memory after each handoff',
  }),
  makePetPassportArticle({
    slug: 'weekend-trip-pet-passport-packing-list',
    title: 'Weekend Trip Pet Passport and Packing List',
    excerpt:
      'Prepare a short-trip passport that covers care instructions and the paperwork most likely to matter while you are away.',
    metaDescription:
      'Build a weekend trip pet passport and packing list with meal portions, vaccine proof, microchip details, and sitter notes.',
    keywords: ['weekend trip pet passport', 'pet packing list', 'short trip pet care', 'pet sitter checklist'],
    audience: 'friends, neighbors, and short-term boarding staff',
    coreInfo: 'meal portions, potty schedule, vaccine proof, microchip number, and packing checklist',
    trigger:
      'Short trips feel simple, which is exactly why important details are easy to forget',
    benefit:
      'A compact passport handles both care instructions and the last-minute paperwork you may suddenly need',
    workflow:
      'the passport can combine trip-specific instructions with the supporting documents you may need to send from your phone',
  }),

  makeTravelArticle({
    slug: 'domestic-flight-pet-document-checklist',
    title: 'Domestic Flight Pet Document Checklist',
    excerpt:
      'Organize airline-specific pet paperwork before travel day so check-in problems do not derail the whole trip.',
    metaDescription:
      'Use a domestic flight pet document checklist to organize airline forms, rabies proof, IDs, and health summaries before check-in.',
    keywords: ['domestic flight pet documents', 'airline pet paperwork', 'pet travel checklist', 'flying with pets'],
    tripType: 'domestic flights',
    documents: 'airline pet forms, rabies proof, ID tags, and recent health summaries',
    leadTime:
      'Airlines may ask for specific paperwork within narrow booking or departure windows',
    risk:
      'Missing one carrier-specific requirement can ruin the itinerary right at check-in',
    workflow:
      'you can keep the airline packet and the supporting health records together in one travel-ready profile',
  }),
  makeTravelArticle({
    slug: 'road-trip-health-documents-for-pets',
    title: 'Road Trip Health Documents for Pets',
    excerpt:
      'Prepare the records that matter most on the road, even when you are far from your regular clinic and stable internet.',
    metaDescription:
      'Organize road trip health documents for pets, including rabies proof, meds, microchip details, and route-based clinic contacts.',
    keywords: ['road trip pet documents', 'pet travel records', 'traveling with dogs paperwork', 'pet road trip prep'],
    tripType: 'road trips',
    documents: 'rabies certificates, medication lists, microchip details, and clinic contacts along the route',
    leadTime:
      'You still need a plan for refills, emergencies, and lodging rules even without airline paperwork',
    risk:
      'Many road-trip problems happen far from your regular vet when internet access is unreliable',
    workflow:
      'it keeps travel proof, meds, and route contacts available offline-friendly from the same pet profile',
  }),
  makeTravelArticle({
    slug: 'international-pet-travel-vaccine-timeline',
    title: 'International Pet Travel Vaccine Timeline',
    excerpt:
      'Track the long lead times behind international pet travel so one missed deadline does not unravel months of planning.',
    metaDescription:
      'Build an international pet travel vaccine timeline with country rules, rabies windows, microchip details, and certificate milestones.',
    keywords: ['international pet travel timeline', 'pet passport vaccines', 'country entry rules for pets', 'travel certificate schedule'],
    tripType: 'international travel',
    documents: 'country entry rules, rabies timelines, ISO microchip details, and endorsed certificates',
    leadTime: 'International moves often begin months before departure',
    risk:
      'A missed deadline can force quarantine, rebooking, expensive repeats, or denied entry',
    workflow:
      'the timeline helps you connect long-range deadlines with the exact documents and appointments that satisfy them',
  }),
  makeTravelArticle({
    slug: 'move-to-a-new-state-with-pet-records',
    title: 'Move to a New State With Pet Records',
    excerpt:
      'Package the records new vets, landlords, and service providers ask for first when you are moving across state lines.',
    metaDescription:
      'Move to a new state with pet records organized for new vets, landlords, prescriptions, and faster onboarding after arrival.',
    keywords: ['moving with pet records', 'new state pet paperwork', 'new vet onboarding', 'pet relocation documents'],
    tripType: 'a cross-state move',
    documents: 'full medical history, vaccine proof, prescriptions, and previous clinic contact details',
    leadTime:
      'New clinics and landlords often request records before you are fully settled',
    risk:
      'Moving chaos makes it easy to lose the one document you need first',
    workflow:
      'it gives you a relocation packet that still stays tied to the broader medical record when follow-up questions appear',
  }),
  makeTravelArticle({
    slug: 'boarding-before-travel-record-prep',
    title: 'Boarding Before Travel Record Prep',
    excerpt:
      'Get boarding paperwork ready before your own trip so you are not solving documentation gaps on departure day.',
    metaDescription:
      'Prepare boarding-before-travel records with facility forms, vaccine proof, feeding notes, and emergency authorization details.',
    keywords: ['boarding paperwork for pets', 'travel boarding prep', 'pet facility forms', 'pet departure checklist'],
    tripType: 'pre-travel boarding',
    documents: 'facility forms, vaccine records, feeding instructions, and emergency authorization notes',
    leadTime:
      'Boarding reservations often surface document gaps right before your own departure',
    risk:
      'If records are incomplete, you can end up scrambling on the same day you are trying to leave',
    workflow:
      'the boarding packet can sit in the same profile as the medical proof you need to submit with it',
  }),
  makeTravelArticle({
    slug: 'campground-and-hotel-pet-paperwork-guide',
    title: 'Campground and Hotel Pet Paperwork Guide',
    excerpt:
      'Prepare a lighter travel packet for road lodging so proof, rules, and emergency contacts stay easy to access on the move.',
    metaDescription:
      'Use a campground and hotel pet paperwork guide to carry vaccine proof, licensing, care notes, and local emergency contacts.',
    keywords: ['hotel pet paperwork', 'campground pet documents', 'pet-friendly lodging prep', 'traveling with pets'],
    tripType: 'campgrounds and pet-friendly hotels',
    documents: 'vaccine proof, licensing, behavior notes, and local emergency contacts',
    leadTime:
      'Lodging rules vary widely and can change from one stop to the next',
    risk:
      'Assuming all pet-friendly places ask for the same documentation causes avoidable check-in friction',
    workflow:
      'it lets you reuse a core travel profile while adding lodging-specific notes for each stop',
  }),

  makeEmergencyArticle({
    slug: 'build-a-pet-emergency-info-card',
    title: 'Build a Pet Emergency Info Card',
    excerpt:
      'Create a fast, portable emergency card that surfaces the facts someone needs before you even reach the clinic door.',
    metaDescription:
      'Build a pet emergency info card with weight, meds, allergies, vet contacts, and backup numbers for faster urgent care decisions.',
    keywords: ['pet emergency card', 'urgent pet information', 'emergency vet prep', 'pet medical summary'],
    emergencyType: 'any urgent visit',
    criticalInfo:
      'species, age, weight, primary vet, emergency contacts, allergies, and current medications',
    failurePoint:
      'In a true emergency, even prepared owners can blank on exact doses or phone numbers',
    benefit:
      'A compact card turns panic into usable information for family members, neighbors, or the ER team',
    workflow:
      'keeping the card linked to deeper records like prescriptions and recent diagnoses',
  }),
  makeEmergencyArticle({
    slug: 'poison-exposure-response-records-for-pets',
    title: 'Poison Exposure Response Records for Pets',
    excerpt:
      'Prepare for toxin emergencies by organizing the details a poison hotline or emergency clinic asks for first.',
    metaDescription:
      'Organize poison exposure response records for pets with substance details, timing, symptoms, and urgent contact numbers.',
    keywords: ['pet poison exposure log', 'toxin emergency prep', 'poison hotline pet info', 'pet emergency records'],
    emergencyType: 'possible toxin exposure',
    criticalInfo:
      'suspected substance, time of exposure, estimated amount, symptoms, and poison hotline contacts',
    failurePoint:
      'Minutes matter, and vague recollections can slow down triage or produce bad estimates',
    benefit:
      'Structured notes help you answer the first questions fast and avoid dangerous guesswork',
    workflow:
      'storing toxin-specific notes beside emergency contacts and recent medication information',
  }),
  makeEmergencyArticle({
    slug: 'seizure-log-and-emergency-prep-for-pets',
    title: 'Seizure Log and Emergency Prep for Pets',
    excerpt:
      'Track seizure details in a way that improves both emergency response and follow-up care with the neurologist or primary vet.',
    metaDescription:
      'Keep a seizure log and emergency prep record for pets with episode timing, recovery notes, meds, and escalation thresholds.',
    keywords: ['pet seizure log', 'neurology records for pets', 'seizure emergency prep', 'anti-seizure tracking'],
    emergencyType: 'seizure events',
    criticalInfo:
      'episode duration, recovery behavior, medication history, trigger notes, and emergency thresholds',
    failurePoint:
      'After a seizure, the details that matter most disappear quickly from memory',
    benefit:
      'A clean log improves follow-up care and helps you know when the pattern has meaningfully changed',
    workflow:
      'linking event logs to medication timing and the emergency threshold summary in one place',
  }),
  makeEmergencyArticle({
    slug: 'disaster-evacuation-folder-for-pets',
    title: 'Disaster Evacuation Folder for Pets',
    excerpt:
      'Prepare a grab-and-go folder for wildfire, flood, storm, or evacuation scenarios when normal paperwork access disappears.',
    metaDescription:
      'Build a disaster evacuation folder for pets with vaccine proof, microchip records, prescriptions, shelter docs, and recent photos.',
    keywords: ['pet evacuation folder', 'disaster prep for pets', 'emergency pet documents', 'shelter paperwork'],
    emergencyType: 'wildfire, flood, storm, or evacuation',
    criticalInfo:
      'vaccines, microchip proof, prescriptions, shelter requirements, and recent photos',
    failurePoint:
      'Evacuations force fast decisions when paper files may be impossible to gather',
    benefit:
      'A ready folder helps you move quickly and still meet shelter, hotel, or rescue requirements',
    workflow:
      'keeping go-bag documents and the supporting medical records available from the same profile',
  }),
  makeEmergencyArticle({
    slug: 'after-hours-vet-visit-information-checklist',
    title: 'After-Hours Vet Visit Information Checklist',
    excerpt:
      'Carry the context an emergency clinic will ask for when your regular vet is closed and you are answering questions under stress.',
    metaDescription:
      'Use an after-hours vet visit information checklist to organize symptoms, last meal, meds, diagnoses, and transport contacts.',
    keywords: ['after-hours vet checklist', 'emergency clinic prep', 'urgent vet information', 'pet ER records'],
    emergencyType: 'late-night or weekend emergency visits',
    criticalInfo:
      'recent symptoms, last meal, medications, previous diagnoses, and payment or transport contacts',
    failurePoint:
      'After-hours clinics see your pet without the continuity and baseline your regular vet already knows',
    benefit:
      'Bringing a concise checklist reduces repeated history taking and speeds up safer decisions',
    workflow:
      'keeping urgent symptom summaries next to the medication list and recent visit notes that an ER team may need',
  }),
  makeEmergencyArticle({
    slug: 'lost-pet-medical-summary-for-fast-recovery',
    title: 'Lost Pet Medical Summary for Fast Recovery',
    excerpt:
      'Prepare a medical summary that shelters, finders, and rescuers can use if your lost pet needs immediate care before reunion.',
    metaDescription:
      'Create a lost pet medical summary with microchip details, urgent health needs, medication timing, and recent identifying photos.',
    keywords: ['lost pet medical summary', 'microchip emergency info', 'pet recovery prep', 'finder care instructions'],
    emergencyType: 'a lost pet situation',
    criticalInfo:
      'microchip number, unique health needs, medication urgency, and recent photos',
    failurePoint:
      'People searching for a lost pet often focus on posters first and forget the medical details rescuers may need',
    benefit:
      'A medical summary helps shelters and finders provide safer care until the pet is reunited',
    workflow:
      'storing an identification-ready summary alongside chip records and current medical needs',
  }),

  makeDocumentationArticle({
    slug: 'organize-vet-bills-for-insurance-claims',
    title: 'Organize Vet Bills for Insurance Claims',
    excerpt:
      'Keep invoices, notes, and receipts tied together so reimbursement requests move faster and are easier to defend if questioned.',
    metaDescription:
      'Organize vet bills for insurance claims with invoices, SOAP notes, receipts, and claim IDs that stay linked by visit.',
    keywords: ['vet bills for insurance', 'pet insurance claim docs', 'vet invoice organizer', 'pet reimbursement records'],
    documentSet: 'invoices, SOAP summaries, receipts, and claim numbers',
    useCase: 'insurance reimbursement and tax or budget tracking',
    risk:
      'Billing paperwork often gets scattered across email, clinic portals, and paper folders',
    workflow:
      'you can keep every bill attached to the visit that generated it, along with the claim notes and receipt proof',
  }),
  makeDocumentationArticle({
    slug: 'keep-prescriptions-and-refill-history-together',
    title: 'Keep Prescriptions and Refill History Together',
    excerpt:
      'Organize prescriptions with refill history so dosage changes and pharmacy messages stop disappearing into inbox clutter.',
    metaDescription:
      'Keep pet prescriptions and refill history together with dosage changes, pharmacy messages, and fill dates in one record.',
    keywords: ['pet prescriptions organizer', 'refill history tracking', 'pharmacy records for pets', 'medication paperwork'],
    documentSet: 'prescriptions, dosage changes, refill dates, and pharmacy messages',
    useCase: 'ongoing treatment and refill coordination',
    risk:
      'It is surprisingly easy to forget when a script changed or which pharmacy filled the last order',
    workflow:
      'the prescription file, refill history, and medication notes can all live in the same searchable timeline',
  }),
  makeDocumentationArticle({
    slug: 'adoption-papers-and-microchip-record-storage',
    title: 'Adoption Papers and Microchip Record Storage',
    excerpt:
      'Protect ownership and identity documents so adoption paperwork is easy to retrieve when a provider or shelter asks for proof.',
    metaDescription:
      'Store adoption papers and microchip records with registration numbers, rescue details, and ownership proof in one secure place.',
    keywords: ['adoption papers storage', 'microchip records', 'pet ownership documents', 'rescue paperwork'],
    documentSet: 'adoption contracts, chip registration numbers, breeder or rescue details, and ownership records',
    useCase: 'proof of ownership and onboarding with new providers',
    risk:
      'Core identity documents are often filed once and then lost until you urgently need them',
    workflow:
      'identity records can stay easy to retrieve without mixing them into routine medical paperwork',
  }),
  makeDocumentationArticle({
    slug: 'surgery-discharge-paperwork-organizer',
    title: 'Surgery Discharge Paperwork Organizer',
    excerpt:
      'Keep post-op instructions, pathology notes, and recovery evidence together while the recovery period is still changing every day.',
    metaDescription:
      'Organize surgery discharge paperwork for pets with instructions, pathology results, anesthesia notes, and recovery photos.',
    keywords: ['surgery discharge paperwork', 'post-op pet records', 'recovery instructions organizer', 'pet surgery notes'],
    documentSet: 'discharge instructions, pathology results, anesthesia notes, and recovery photos',
    useCase: 'post-op recovery and follow-up visits',
    risk:
      'After surgery, paperwork arrives in pieces while you are focused on care at home',
    workflow:
      'recovery notes, medication instructions, and follow-up questions can stay attached to the surgery record itself',
  }),
  makeDocumentationArticle({
    slug: 'pet-insurance-claim-document-checklist',
    title: 'Pet Insurance Claim Document Checklist',
    excerpt:
      'Use a repeatable claim checklist so missing attachments and mismatched dates stop delaying reimbursement.',
    metaDescription:
      'Follow a pet insurance claim document checklist that keeps bills, diagnosis notes, codes, and insurer correspondence organized.',
    keywords: ['pet insurance checklist', 'claim documentation', 'reimbursement paperwork', 'pet insurance organizer'],
    documentSet: 'itemized bills, diagnosis notes, treatment codes, and reimbursement correspondence',
    useCase: 'cleaner and faster insurance claims',
    risk:
      'Claim delays frequently come from one missing attachment or one date that does not match across documents',
    workflow:
      'the claim packet can include the bill, note, insurer messages, and your submission status in one place',
  }),
  makeDocumentationArticle({
    slug: 'hospice-and-quality-of-life-documentation-for-pets',
    title: 'Hospice and Quality-of-Life Documentation for Pets',
    excerpt:
      'Track sensitive observations with enough structure to support difficult family and veterinary decisions over time.',
    metaDescription:
      'Document hospice and quality-of-life changes for pets with appetite notes, meds, comfort observations, and family updates.',
    keywords: ['pet hospice documentation', 'quality of life tracking', 'end of life pet records', 'comfort care notes'],
    documentSet: 'quality-of-life notes, medication changes, appetite records, and home comfort observations',
    useCase: 'end-of-life decision support and family communication',
    risk:
      'Sensitive decisions become even harder when observations are scattered or emotional memory takes over',
    workflow:
      'daily observations and clinical notes can sit together so conversations stay grounded in a real timeline',
  }),

  makeMedicationArticle({
    slug: 'daily-medication-log-for-chronic-pet-care',
    title: 'Daily Medication Log for Chronic Pet Care',
    excerpt:
      'Build a daily medication log that captures doses, side effects, and symptom response for long-term conditions.',
    metaDescription:
      'Use a daily medication log for chronic pet care to track dose time, appetite, side effects, and missed-dose notes.',
    keywords: ['daily pet medication log', 'chronic pet care tracking', 'dose log', 'pet meds organizer'],
    regimen: 'daily chronic-care medications',
    trackingPoint: 'dose time, symptom response, appetite, and missed-dose notes',
    risk:
      'Long-term treatment problems often build quietly when adherence becomes fuzzy',
    benefit:
      'A reliable daily log shows what really happened and gives the vet better information for dose adjustments',
    workflow:
      'the daily log can stay tied to prescriptions, follow-up visits, and refill planning',
  }),
  makeMedicationArticle({
    slug: 'flea-tick-and-heartworm-preventive-tracker',
    title: 'Flea, Tick, and Heartworm Preventive Tracker',
    excerpt:
      'Track monthly preventives with dates and product details so routine protection does not drift over time.',
    metaDescription:
      'Track flea, tick, and heartworm preventives with product name, lot details, due dates, and next-dose reminders.',
    keywords: ['preventive tracker for pets', 'heartworm reminder', 'flea tick log', 'monthly pet meds'],
    regimen: 'monthly preventives',
    trackingPoint: 'product name, lot details, administration date, and next due reminder',
    risk:
      'Preventives feel simple until doses drift and you cannot remember exactly what was given',
    benefit:
      'A tracker closes those gaps and helps you answer clinic questions quickly during wellness or travel planning',
    workflow:
      'monthly reminders and product details stay next to the rest of the pet health record',
  }),
  makeMedicationArticle({
    slug: 'insulin-and-glucose-routine-for-diabetic-pets',
    title: 'Insulin and Glucose Routine for Diabetic Pets',
    excerpt:
      'Track insulin timing, meals, and readings in one routine so dose discussions are based on real patterns instead of impression.',
    metaDescription:
      'Manage an insulin and glucose routine for diabetic pets with timing, meal notes, readings, and symptom observations.',
    keywords: ['diabetic pet log', 'insulin schedule for pets', 'glucose tracking', 'pet diabetes routine'],
    regimen: 'insulin injections and glucose checks',
    trackingPoint: 'dose timing, meal timing, readings, and behavior around lows or highs',
    risk:
      'Small schedule changes can have outsized consequences for diabetic pets',
    benefit:
      'Consistent logs make dose discussions with the vet far more precise and help caregivers stay synchronized',
    workflow:
      'dose records, readings, and supporting lab work can stay connected in the same timeline',
  }),
  makeMedicationArticle({
    slug: 'post-surgery-medication-schedule-for-pets',
    title: 'Post-Surgery Medication Schedule for Pets',
    excerpt:
      'Manage temporary post-op medications with a schedule that prevents skipped doses during a tiring recovery window.',
    metaDescription:
      'Create a post-surgery medication schedule for pets that tracks pain meds, antibiotics, taper instructions, and stop dates.',
    keywords: ['post surgery pet meds', 'recovery medication schedule', 'pet antibiotic tracker', 'post-op care log'],
    regimen: 'short-term recovery medications',
    trackingPoint: 'pain control, antibiotics, anti-nausea drugs, and taper instructions',
    risk:
      'Post-op routines stack multiple temporary drugs at the exact moment everyone is tired and distracted',
    benefit:
      'A clear schedule reduces skipped doses and makes it obvious what can stop when recovery progresses',
    workflow:
      'the medication schedule can live beside discharge instructions, refill notes, and recovery observations',
  }),
  makeMedicationArticle({
    slug: 'seizure-medication-adherence-tracker',
    title: 'Seizure Medication Adherence Tracker',
    excerpt:
      'Track seizure medication timing precisely enough to connect adherence, side effects, and breakthrough episodes.',
    metaDescription:
      'Use a seizure medication adherence tracker to log exact dose times, side effects, breakthrough events, and refill runway.',
    keywords: ['seizure medication tracker', 'anti-seizure adherence', 'neurology medication log', 'pet dose timing'],
    regimen: 'anti-seizure medication',
    trackingPoint: 'exact administration times, breakthrough episodes, side effects, and refill runway',
    risk:
      'Seizure medications often demand unusually consistent timing, and small drifts can matter',
    benefit:
      'Tracking adherence and episodes together gives your neurologist better decision data than memory alone',
    workflow:
      'timing logs can stay linked to seizure event notes and prescription history in one profile',
  }),
  makeMedicationArticle({
    slug: 'supplement-and-joint-care-routine-tracker',
    title: 'Supplement and Joint Care Routine Tracker',
    excerpt:
      'Give supportive care the same structure as prescriptions so you can tell whether mobility routines are actually helping.',
    metaDescription:
      'Track supplements and joint care routines for pets with daily doses, exercise notes, weight trends, and response over time.',
    keywords: ['pet supplement tracker', 'joint care routine', 'mobility support log', 'senior dog supplement schedule'],
    regimen: 'supplements and mobility-support routines',
    trackingPoint: 'daily supplements, mobility exercises, weight notes, and response to activity',
    risk:
      'Supportive care is easy to treat casually, which makes it hard to judge whether it is helping',
    benefit:
      'A routine tracker turns vague impressions into trend data you can use during senior-care planning',
    workflow:
      'supportive-care logs can sit beside weights, lab trends, and vet recommendations for the same issue',
  }),

  makeOrganizationArticle({
    slug: 'weekly-pet-admin-day-system',
    title: 'Weekly Pet Admin Day System',
    excerpt:
      'Use one short weekly block to manage pet paperwork, refills, and reminders before they turn into scattered mini-emergencies.',
    metaDescription:
      'Set up a weekly pet admin day system for records review, refill checks, reminder cleanup, and household pet planning.',
    keywords: ['weekly pet admin day', 'pet organization routine', 'pet planning system', 'pet paperwork workflow'],
    system: 'a weekly admin day',
    scope: 'records review, refills, reminders, and supply checks',
    painPoint:
      'Small pet tasks rarely feel urgent until three of them collide at once',
    payoff:
      'A scheduled admin rhythm keeps care work short, predictable, and much less stressful',
    workflow:
      'it gives recurring admin tasks and the records they depend on one shared operating space',
  }),
  makeOrganizationArticle({
    slug: 'organize-multi-pet-household-care-tasks',
    title: 'Organize Multi-Pet Household Care Tasks',
    excerpt:
      'Build a household system that keeps appointments, exceptions, and responsibilities clear across several pets.',
    metaDescription:
      'Organize multi-pet household care tasks with one shared system for appointments, preventives, feeding exceptions, and ownership.',
    keywords: ['multi-pet organization', 'household pet tasks', 'multiple pet reminders', 'pet care coordination'],
    system: 'a multi-pet household board',
    scope: 'feeding exceptions, appointments, preventives, and shared responsibilities',
    painPoint:
      'When several pets share one home, verbal coordination breaks down fast',
    payoff:
      'A visible shared system reduces duplicate work and surfaces what still needs attention',
    workflow:
      'each pet can keep separate records while the household still sees the tasks that affect everyone',
  }),
  makeOrganizationArticle({
    slug: 'prepare-pet-information-for-house-sitters',
    title: 'Prepare Pet Information for House Sitters',
    excerpt:
      'Package the exact information a house sitter needs so the handoff is calm, complete, and easy to review later.',
    metaDescription:
      'Prepare pet information for house sitters with feeding, walk, medication, behavior, and emergency instructions in one packet.',
    keywords: ['house sitter pet packet', 'pet sitting information', 'caregiver handoff checklist', 'pet routine summary'],
    system: 'a sitter handoff packet',
    scope: 'feeding, walks, medication, behavior notes, and emergency instructions',
    painPoint:
      'Handoff messages sent across texts, sticky notes, and memory create preventable confusion',
    payoff:
      'A single packet lets a sitter care confidently even if you are unreachable for part of the trip',
    workflow:
      'the handoff packet can sit on top of the full record so the sitter sees essentials first and deeper context only if needed',
  }),
  makeOrganizationArticle({
    slug: 'create-a-pet-care-command-center-at-home',
    title: 'Create a Pet Care Command Center at Home',
    excerpt:
      'Bring pet supplies, key records, and schedules into one home system that reduces friction during normal care and urgent moments.',
    metaDescription:
      'Create a pet care command center at home with documents, supplies, schedules, and contacts organized for fast daily access.',
    keywords: ['pet care command center', 'home pet organization', 'pet supplies and records', 'family pet system'],
    system: 'a home pet care command center',
    scope: 'documents, supplies, schedules, and contact information',
    painPoint:
      'Families lose time when the right document lives in one room and the medication lives in another',
    payoff:
      'A command center reduces friction during normal routines and gives everyone a better response point during stress',
    workflow:
      'digital records can mirror the physical command center so the same information is available inside and outside the house',
  }),
  makeOrganizationArticle({
    slug: 'seasonal-pet-care-reminder-calendar',
    title: 'Seasonal Pet Care Reminder Calendar',
    excerpt:
      'Map repeating seasonal care tasks before weather, travel, or shedding cycles make them urgent again.',
    metaDescription:
      'Use a seasonal pet care reminder calendar to plan grooming, preventives, travel prep, and weather-specific care across the year.',
    keywords: ['seasonal pet calendar', 'pet reminders by season', 'grooming and preventive calendar', 'yearly pet planning'],
    system: 'a seasonal reminder calendar',
    scope: 'grooming cycles, preventives, travel prep, and weather-specific tasks',
    painPoint:
      'Seasonal chores are easy to forget because they return just as you stopped thinking about them',
    payoff:
      'A calendar spreads care across the year so nothing becomes a scramble at the same time',
    workflow:
      'recurring reminders can stay linked to the records, bookings, or checklists each season requires',
  }),
  makeOrganizationArticle({
    slug: 'pet-moving-folder-for-new-vets-and-groomers',
    title: 'Pet Moving Folder for New Vets and Groomers',
    excerpt:
      'Prepare one onboarding folder that helps new providers understand your pet without asking you to resend the basics repeatedly.',
    metaDescription:
      'Build a pet moving folder for new vets and groomers with vaccines, history, preferences, and onboarding records ready to share.',
    keywords: ['pet moving folder', 'new vet paperwork', 'groomer onboarding records', 'provider handoff'],
    system: 'a moving and onboarding folder',
    scope: 'records for new vets, groomers, boarding facilities, and landlords',
    painPoint:
      'Starting over with new providers often means answering the same questions repeatedly',
    payoff:
      'A ready folder lets you onboard faster and present complete, accurate information from the first interaction',
    workflow:
      'you can reuse the same verified records for each new provider while keeping notes about who received what',
  }),
];

const EXPECTED_ARTICLE_COUNT = 50;
const MINIMUM_PER_CATEGORY = 6;

const CATEGORY_COUNTS: Record<LearnCategoryId, number> = {
  'health-records': 0,
  vaccinations: 0,
  'pet-passports': 0,
  'pet-travel': 0,
  'pet-emergencies': 0,
  'pet-documentation': 0,
  'medication-tracking': 0,
  'pet-organization': 0,
};

const SLUGS_BY_CATEGORY: Record<LearnCategoryId, string[]> = {
  'health-records': [],
  vaccinations: [],
  'pet-passports': [],
  'pet-travel': [],
  'pet-emergencies': [],
  'pet-documentation': [],
  'medication-tracking': [],
  'pet-organization': [],
};

for (const article of ARTICLE_DRAFTS) {
  CATEGORY_COUNTS[article.categoryId] += 1;
  SLUGS_BY_CATEGORY[article.categoryId].push(article.slug);
}

if (ARTICLE_DRAFTS.length !== EXPECTED_ARTICLE_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_ARTICLE_COUNT} learn articles, received ${ARTICLE_DRAFTS.length}.`,
  );
}

for (const [categoryId, count] of Object.entries(CATEGORY_COUNTS)) {
  if (count < MINIMUM_PER_CATEGORY) {
    throw new Error(
      `Expected at least ${MINIMUM_PER_CATEGORY} learn articles in ${categoryId}, received ${count}.`,
    );
  }
}

function getRelatedSlugs(article: LearnArticleDraft): string[] {
  const categorySlugs = SLUGS_BY_CATEGORY[article.categoryId];
  const index = categorySlugs.indexOf(article.slug);

  if (index === -1) {
    throw new Error(`Could not resolve related slugs for article ${article.slug}.`);
  }

  return [1, 2, 3].map((offset) => categorySlugs[(index + offset) % categorySlugs.length]);
}

export const LEARN_ARTICLE_CONFIGS: LearnArticleConfig[] = ARTICLE_DRAFTS.map(
  (article, index) => ({
    ...article,
    relatedSlugs: getRelatedSlugs(article),
    relatedBlogSlugs: rotateTake(RELATED_BLOG_SLUG_POOL, index, 4),
    relatedCompareSlugs: rotateTake(RELATED_COMPARE_SLUG_POOL, index, 3),
  }),
);
