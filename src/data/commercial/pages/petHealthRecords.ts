import type { CommercialPageConfig } from '../types';
import { COMMERCIAL_WIKIDATA } from '../schemaTopics';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';

export const PET_HEALTH_RECORDS_PAGE: CommercialPageConfig = {
  path: '/pet-health-records',
  primaryKeyword: 'pet health records',
  secondaryKeywords: [
    'pet medical records app',
    'digital pet health records',
    'organize vet records',
    'pet health record storage',
  ],
  searchIntent:
    'Pet parents searching for a dependable system to store, organize, and retrieve veterinary documents—not another folder of PDFs.',
  title: 'Pet Health Records — Organized, Searchable, Always Ready',
  metaDescription:
    'Store vaccines, lab results, prescriptions, and visit notes in one calm pet health record system. Reminders, timelines, and emergency access included.',
  schemaTopic: {
    topicName: 'Pet health record',
    topicWikidataUrl: COMMERCIAL_WIKIDATA.electronicHealthRecord,
  },
  heroEyebrow: 'Pet health records',
  heroTitle: 'Every vet visit. One record that actually makes sense.',
  heroSubhead:
    'PetClues turns scattered PDFs and paper folders into a searchable health timeline—so you walk into appointments prepared, not paging through email.',
  heroImage: PAGE_IMG.profile.vault,
  heroImageAlt: 'Pet parent reviewing organized digital health records on a phone',
  featuresTitle: 'Built for how care actually happens',
  features: [
    {
      title: 'Timeline, not folders',
      body: 'Visits, vaccines, labs, and notes land on a dated timeline per pet. You see what happened when—not which subfolder someone guessed three years ago.',
    },
    {
      title: 'Documents that stay linked',
      body: 'Upload invoices, radiology reports, and discharge summaries. Each file attaches to the visit or reminder it belongs to, so context never drifts away.',
    },
    {
      title: 'Reminders from real due dates',
      body: 'Rabies renewals, heartworm doses, and recheck labs become alerts—not calendar guesses. Set them when the vet mentions them, not when you remember at midnight.',
    },
    {
      title: 'Multi-pet without the mess',
      body: 'Separate profiles, shared household login. A vaccine certificate for the cat never hides inside the dog’s folder again.',
    },
    {
      title: 'Share when someone else steps in',
      body: 'Grant a sitter, co-parent, or emergency clinic a controlled view. They get facts—not your entire camera roll.',
    },
    {
      title: 'Export when a clinic asks',
      body: 'Pull a clean summary or document bundle before a specialist referral. No screenshot collage required.',
    },
  ],
  trustTitle: 'Serious about records. Restrained about claims.',
  trustPoints: [
    {
      title: 'You own your data',
      body: 'Export records on demand. Your pet’s history should not be trapped behind a paywall the day you switch vets.',
    },
    {
      title: 'Clear medical boundary',
      body: 'PetClues organizes information—it does not diagnose. We surface what you stored so conversations with your veterinarian stay grounded.',
    },
    {
      title: 'Encryption in transit and at rest',
      body: 'Health documents are sensitive. We treat them that way in storage and sync—not as generic attachments.',
    },
    {
      title: 'Free tier for one pet',
      body: 'Core records, reminders, and passport basics cost nothing. Upgrade when your household outgrows a single profile.',
    },
  ],
  proseSections: [
    {
      id: 'why-scattered-fails',
      title: 'The folder method breaks the moment care gets real',
      paragraphs: [
        'Most households start with good intentions: a drawer for vaccine booklets, a Google Drive folder labeled “Dog,” photos of pill bottles in a camera roll. It works until it doesn’t—usually the night before boarding, or in a lobby when a locum vet asks what changed since the last visit.',
        'The failure mode is not laziness. It is structure. Folders sort by file type or date scanned, not by clinical story. A PDF from 2022 and a handwritten note from last Tuesday carry equal weight in search, which means neither surfaces when you need a coherent answer.',
        'Pet health records are not archives. They are working documents. They should answer practical questions fast: What vaccines are current? Which medication dose did we settle on? Did the specialist already rule out X? A record system that cannot answer those in under a minute is not a record system—it is storage.',
      ],
    },
    {
      id: 'what-belongs',
      title: 'What belongs in a proper pet health record',
      paragraphs: [
        'Start with what clinics actually ask for: rabies certificate with product and lot, heartworm test date, current prescriptions with strength and frequency, and the most recent problem list. Add surgery reports with implant or suture notes if relevant.',
        'Layer owner observations that change decisions—appetite shifts, limping episodes, reaction notes after a new food. These do not replace exam findings, but they prevent repeating tests or missing patterns between visits.',
        'Keep financial paperwork if it helps you—itemized invoices often reveal which diagnostics ran even when the clinical summary is vague. Tag them to the visit date so they do not become orphaned expenses.',
        'Skip the noise. Every blurry photo of a label does not need permanent residence. Curate for retrieval, not hoarding. A lean, accurate record beats a comprehensive dump no one will scroll.',
      ],
    },
    {
      id: 'appointment-prep',
      title: 'Walking in prepared changes the appointment',
      paragraphs: [
        'Veterinarians work faster when history is legible. A two-minute pre-visit skim of a timeline can replace twenty minutes of reconstructing dates from memory. That is not courtesy—it is clinical efficiency that often translates to fewer duplicate tests.',
        'Before a wellness visit, confirm vaccine due dates against what you have on file. If the clinic’s reminder card disagrees with your record, resolve it before you are in the exam room.',
        'Before a sick visit, note onset, progression, and what you already tried. Attach photos only if they show something stable—fluctuating rashes confuse more than they help.',
        'After the visit, update the same day. The decay curve on memory is steep; the decay curve on PDFs left in your email is worse.',
      ],
    },
    {
      id: 'household-system',
      title: 'A household system beats a hero parent',
      paragraphs: [
        'One person should not be the sole keeper of health knowledge. Couples, roommates, and co-parents rotate who picks up from daycare or takes the 7 a.m. pill shift. If records live in one inbox, the system fails whenever that person travels.',
        'PetClues gives shared access with sensible defaults: everyone sees timelines and upcoming reminders; you choose what gets exported externally. Sitters receive passport summaries, not your entire document vault.',
        'Establish a light weekly rhythm—five minutes to confirm no reminders fired without follow-up, no new paperwork still sitting in “Downloads.” Annual membership aligns with how often most pets see the vet for meaningful updates, not with artificial monthly churn.',
      ],
    },
    {
      id: 'switching',
      title: 'Switching from paper or Drive without a weekend project',
      paragraphs: [
        'Do not attempt a full historical migration in one sitting. Import the last twelve months first—enough for any clinic to treat the pet responsibly. Backfill older years when a rainy afternoon appears.',
        'Photograph paper certificates in good light, straight-on, with all four corners visible. Name files boringly: `2025-rabies-cityvet.pdf` beats `IMG_8842`.',
        'When you upload, attach each document to the event it documents. A standalone file in a cloud folder is what you are leaving behind; a dated event with a reminder is what you are building toward.',
        'If you are overwhelmed, set a fifteen-minute timer each Sunday until the backlog shrinks. Consistency over a month beats a heroic weekend you will not repeat.',
      ],
    },
    {
      id: 'long-term-value',
      title: 'Records compound when you treat them as infrastructure',
      paragraphs: [
        'The return on organized records is not immediate. It appears the third time you avoid a duplicate blood panel, the second relocation, the first emergency where a locum vet actually believes your timeline. Infrastructure feels boring until the day it saves an afternoon—or prevents a mistake.',
        'PetClues is built for that compounding: documents stay attached to events, reminders roll forward when you log care, passports pull from the same source as your archive. You are not maintaining parallel systems for “storage” and “sharing.”',
        'Annual membership matches how most pets experience meaningful medical change—not on a monthly billing rhythm invented for software, but across seasons of wellness, illness, and recovery. Start free; deepen when your household needs more pets, exports, or advanced tracking.',
        'The measure of success is not how many files you uploaded—it is whether you can answer a clinic’s question in one calm minute. That is the bar PetClues is built for.',
      ],
    },
    {
      id: 'clinic-handoffs',
      title: 'When clinics ask for records, send structure—not volume',
      paragraphs: [
        'Veterinary staff rarely need your entire archive. They need the last relevant visit, current medications, vaccine proof, and any chronic problem context. A structured export respects their time and your privacy.',
        'Before a specialist referral, include the referring clinic’s summary plus objective data: lab dates, imaging reports, response notes to prior treatments. Narrative without numbers invites repetition; numbers without narrative invite misinterpretation.',
        'After any handoff, ask what format helped. Some clinics prefer PDF bundles; others want portal uploads. PetClues exports travel; you choose the channel.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Is PetClues a replacement for my veterinarian?',
      answer:
        'No. PetClues stores and organizes the information you and your clinic generate. Medical decisions stay with licensed professionals.',
    },
    {
      question: 'Can I keep records for more than one pet?',
      answer:
        'Yes. Free includes one pet profile. Paid plans add multiple pets, deeper exports, and advanced tracking.',
    },
    {
      question: 'What file types can I upload?',
      answer:
        'PDFs and photos work well for certificates, lab results, and invoices. Attach them to dated events on the timeline.',
    },
    {
      question: 'Will my clinic accept exported records?',
      answer:
        'Most clinics welcome a concise timeline and legible certificates. For referrals, use the export bundle rather than individual screenshots.',
    },
    {
      question: 'How is this different from Google Drive?',
      answer:
        'Drive stores files. PetClues structures care—timelines, reminders, passports, and pet-specific fields—without you inventing a taxonomy.',
    },
    {
      question: 'Do I need to pay to start?',
      answer:
        'No. Core health records, reminders, and emergency passport basics are free for one pet.',
    },
  ],
  ctaTitle: 'Start with today’s paperwork, not ten years of backlog',
  ctaLead:
    'Create a free account, upload your latest visit, and set the next due date before you close the app.',
  relatedLinks: [
    { href: `${ROUTES.BLOG}/organize-pet-medical-records-online`, label: 'How to organize pet medical records' },
    { href: `${ROUTES.LEARN}/build-a-pet-health-record-timeline`, label: 'Build a health record timeline' },
    { href: `${ROUTES.BEST}/best-pet-health-record-app`, label: 'Best pet health record apps' },
    { href: ROUTES.PRICING, label: 'Membership pricing' },
    { href: ROUTES.FOUNDING_MEMBERS, label: 'Founding members' },
  ],
};
