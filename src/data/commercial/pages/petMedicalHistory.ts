import type { CommercialPageConfig } from '../types';
import { COMMERCIAL_WIKIDATA } from '../schemaTopics';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';

export const PET_MEDICAL_HISTORY_PAGE: CommercialPageConfig = {
  path: '/pet-medical-history',
  primaryKeyword: 'pet medical history',
  secondaryKeywords: [
    'pet health history',
    'chronic condition tracker for pets',
    'vet visit history',
    'pet diagnosis record',
  ],
  searchIntent:
    'Owners managing ongoing conditions or complex cases who need a coherent clinical narrative across years, clinics, and specialists.',
  title: 'Pet Medical History — A Clear Clinical Story Over Time',
  metaDescription:
    'Chronological pet medical history across vets and years. Diagnoses, treatments, labs, and owner notes in one timeline for better appointments and referrals.',
  schemaTopic: {
    topicName: 'Pet medical history',
    topicWikidataUrl: COMMERCIAL_WIKIDATA.electronicHealthRecord,
  },
  heroEyebrow: 'Medical history',
  heroTitle: 'Specialists ask what changed. Your answer should not start with “let me check.”',
  heroSubhead:
    'PetClues builds a chronological medical history—diagnoses, treatments, diagnostics, and outcomes—so every new clinician sees the story, not scattered fragments.',
  heroImage: PAGE_IMG.app.timeline,
  heroImageAlt: 'Chronological pet medical history timeline on a screen',
  featuresTitle: 'History is sequence, not storage',
  features: [
    {
      title: 'Chronological clinical timeline',
      body: 'Every visit, diagnosis, and treatment sits in order. Patterns—flare frequency, medication response—become visible without manual spreadsheets.',
    },
    {
      title: 'Diagnosis and problem list',
      body: 'Maintain active and resolved conditions explicitly. A new vet should not re-discover what last year’s team already established.',
    },
    {
      title: 'Lab and imaging attachments',
      body: 'Trends matter. Attach CBC panels, chemistry results, and imaging reports to the dates they were taken—not orphaned in email.',
    },
    {
      title: 'Medication trials documented',
      body: 'What worked, what failed, what caused side effects. Chronic care is iterative; your record should show the iteration.',
    },
    {
      title: 'Referral-ready exports',
      body: 'Send a structured summary before the specialist appointment. They prepare better; you repeat yourself less.',
    },
    {
      title: 'Owner observations with context',
      body: 'Log appetite, mobility, or behavior changes against dates. Observations do not replace exams, but they anchor conversations.',
    },
  ],
  trustTitle: 'Support better conversations, not self-diagnosis',
  trustPoints: [
    {
      title: 'Clinician-led interpretation',
      body: 'PetClues does not interpret labs or suggest diagnoses. It preserves what professionals documented and what you observed.',
    },
    {
      title: 'Continuity across clinics',
      body: 'Switching vets should not erase narrative. Your history travels with you as structured data and documents.',
    },
    {
      title: 'Sensitive data handled carefully',
      body: 'Medical histories include details you may not want public. Access stays account-controlled unless you explicitly share.',
    },
    {
      title: 'Longitudinal value grows',
      body: 'The longer you maintain history, the more useful it becomes—especially for chronic conditions and aging pets.',
    },
  ],
  proseSections: [
    {
      id: 'second-opinion',
      title: 'Second opinions need sequence, not snapshots',
      paragraphs: [
        'A specialist appointment succeeds when they understand trajectory: when symptoms began, what improved on steroids, whether diarrhea preceded or followed a diet change. Snapshots without sequence force redundant testing and slower conclusions.',
        'Pet medical history is fundamentally narrative. Dates anchor that narrative. Without them, even excellent clinicians reconstruct from memory and incomplete fax packets.',
        'Owners are not expected to speak clinically—but they are expected to bring coherence. A timeline turns your role from historian-by-anecdote to historian-by-record.',
      ],
    },
    {
      id: 'chronic-conditions',
      title: 'Chronic conditions punish discontinuous records',
      paragraphs: [
        'Allergies, arthritis, epilepsy, diabetes, inflammatory bowel disease—these unfold over years. Treatment shifts gradually. A medication that failed in 2023 is relevant in 2026 when someone proposes it again under a new brand name.',
        'Maintain a problem list with status: active, in remission, ruled out. Update at each visit. Clinics change software; your problem list should not depend on theirs.',
        'Attach objective data where it exists: weight trends, lab panels, imaging summaries. Subjective notes complement; they do not replace measurable change.',
      ],
    },
    {
      id: 'multi-clinic',
      title: 'Multiple clinics should not mean multiple truths',
      paragraphs: [
        'Emergency visits, relocations, and travel introduce new providers. Each may generate a discharge summary in a different format. Your job is consolidation, not duplication.',
        'When a new clinic asks for records, send the timeline export plus key documents—not a ZIP of every unrelated PDF. Curate for the question being asked.',
        'If two records conflict, note the conflict. Real-world data is messy; hiding mess creates false confidence.',
      ],
    },
    {
      id: 'before-appointments',
      title: 'Preparing history for a high-stakes appointment',
      paragraphs: [
        'Summarize the last twelve months on one screen: major diagnoses, current meds, recent labs, open questions. Bring that summary; let the full archive stay available if needed.',
        'List what you need from the appointment: refill authorization, referral, behavior referral, nutrition plan. History without agenda still wastes time.',
        'Afterward, update within twenty-four hours while nuance is fresh. Future appointments compound on today’s notes.',
      ],
    },
    {
      id: 'aging-pets',
      title: 'Aging pets turn history into proactive care',
      paragraphs: [
        'Senior pets accumulate comorbidities. The interaction between kidney values, blood pressure medication, and arthritis pain is not obvious without a dated view.',
        'Track quality-of-life observations honestly—good days versus bad days, mobility changes, cognitive signs. These inform humane decisions alongside clinical metrics.',
        'History is also legacy. When the time comes, you will want clarity about what was tried and why. Compassionate end-of-life choices deserve good records too.',
        'Behavioral health belongs in medical history when it intersects with treatment: anxiety medications, referral to a behaviorist, triggers that affect safe handling. Clinicians treating pain or prescribing sedatives need that context.',
      ],
    },
    {
      id: 'long-term-value',
      title: 'Medical history is an act of advocacy',
      paragraphs: [
        'You are the constant in your pet’s care; clinics and providers rotate. Advocacy is not confrontation—it is showing up with sequence so professionals can practice at the top of their license instead of reconstructing your story.',
        'PetClues does not replace clinical judgment. It protects it from fragmentation. When a vet sees that prednisone helped briefly in 2024 and failed in 2025, they choose the next step with fewer blind alleys.',
        'The emotional payoff is subtle: less repetition, fewer “we already tried that” moments, more time discussing what to do next rather than what happened before. That is worth maintaining even in healthy years.',
      ],
    },
    {
      id: 'surgery-recovery',
      title: 'Surgery and recovery deserve their own chapter',
      paragraphs: [
        'A procedure is not a single date—it is pre-op labs, anesthesia notes, discharge instructions, suture removal, and follow-up imaging. Group those on the timeline so recovery does not look like isolated incidents.',
        'Post-op medications often taper. Record the taper schedule and when you actually stopped—not just what was prescribed. Deviations are clinically meaningful.',
        'Complications may appear days later. A note tied to the surgery date (“day five: incision redness, called clinic, started antibiotics”) links sequelae to the original event without burying it in chat logs.',
      ],
    },
    {
      id: 'dental-derm',
      title: 'Dental, skin, and ear issues recur unless history connects them',
      paragraphs: [
        'Chronic ear infections, allergic dermatitis, and dental disease flare in cycles. Without dates, each flare looks like a first episode—leading to repeated first-line treatments that already failed.',
        'Photograph lesions at weekly intervals if your vet asks; attach to the timeline entry, not a generic photo album. Progression photos justify escalation.',
        'Dental cleanings, extractions, and home care regimens should sit as their own timeline chapter. Mouth pain masquerades as appetite loss and irritability.',
        'When a new groomer or sitter asks about skin sensitivities, export the relevant slice of history instead of improvising from memory.',
      ],
    },
    {
      id: 'nutrition-diet',
      title: 'Diet trials belong in medical history',
      paragraphs: [
        'Elimination diets and prescription foods fail when nobody records start dates, brands, or outcomes. The next vet proposes the same trial because the last one was invisible.',
        'Note who recommended the diet—primary vet, dermatologist, emergency clinician—and whether compliance was full or partial. Cheating the trial skews conclusions.',
        'Weight and stool changes during diet shifts are expected. Tie daily observations to the trial window so improvement or regression is attributable.',
        'When a diet works, keep the successful formula on the problem list even after transition. Relapse is faster when you forget what “worked” meant.',
      ],
    },
  ],
  faqs: [
    {
      question: 'How is medical history different from general health records?',
      answer:
        'Health records include any document—vaccines, invoices, notes. Medical history emphasizes the clinical narrative: conditions, treatments, and outcomes over time.',
    },
    {
      question: 'Can I import records from my vet’s portal?',
      answer:
        'Download PDFs from your clinic portal and attach them to dated timeline entries. Full automatic import depends on clinic systems; manual attachment works everywhere.',
    },
    {
      question: 'Should I log every small issue?',
      answer:
        'Log what might affect future decisions—recurring GI upset, limping episodes, medication reactions. Skip one-off trivia that will never matter clinically.',
    },
    {
      question: 'Can specialists access my history directly?',
      answer:
        'You control sharing. Export a summary or grant temporary access before the referral.',
    },
    {
      question: 'Does PetClues analyze trends in lab values?',
      answer:
        'You see values on a timeline; interpretation remains with your veterinarian.',
    },
    {
      question: 'Is long-term history storage included?',
      answer:
        'Yes. Core timeline storage is included free; advanced exports and multi-pet features scale with membership.',
    },
  ],
  ctaTitle: 'Build the story once. Benefit at every next visit.',
  ctaLead:
    'Start with the last year of visits. Order beats completeness on day one.',
  relatedLinks: [
    { href: `${ROUTES.LEARN}/build-a-pet-health-record-timeline`, label: 'Build a health record timeline' },
    { href: `${ROUTES.BLOG}/organize-pet-medical-records-online`, label: 'Organize pet medical records' },
    { href: `${ROUTES.BEST}/best-pet-health-record-app`, label: 'Best pet health record apps' },
    { href: ROUTES.SIGNUP, label: 'Create free account' },
    { href: ROUTES.PRICING, label: 'Membership pricing' },
  ],
};
