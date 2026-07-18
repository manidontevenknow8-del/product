import type { CommercialPageConfig } from '../types';
import { COMMERCIAL_WIKIDATA } from '../schemaTopics';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';

export const PET_VACCINATION_RECORDS_PAGE: CommercialPageConfig = {
  path: '/pet-vaccination-records',
  primaryKeyword: 'pet vaccination records',
  secondaryKeywords: [
    'dog vaccination record',
    'cat vaccine history',
    'rabies certificate storage',
    'pet vaccine reminder app',
  ],
  searchIntent:
    'Owners who need proof of vaccines for boarding, travel, or daycare, and want due dates tracked without relying on clinic postcards.',
  title: 'Pet Vaccination Records: Instant Proof & Due-Date Reminders',
  metaDescription:
    'Store pet vaccination records and rabies certificates with automatic due-date reminders. Boarding- and travel-ready exports plus multi-pet schedules in one place.',
  schemaTopic: {
    topicName: 'Vaccination',
    topicWikidataUrl: COMMERCIAL_WIKIDATA.vaccination,
  },
  additionalSchemaTopics: [
    {
      topicName: 'Pet health record',
      topicWikidataUrl: COMMERCIAL_WIKIDATA.electronicHealthRecord,
    },
  ],
  heroEyebrow: 'Vaccination records',
  heroTitle: 'Boarding opens tomorrow. Your rabies certificate should not be a mystery.',
  heroSubhead:
    'PetClues stores vaccine products, dates, and certificates, and reminds you before due dates slip. Proof when a facility asks; peace when they do not.',
  heroImage: PAGE_IMG.reminders.vet,
  heroImageAlt: 'Veterinary vaccination reminder and certificate on a phone',
  featuresTitle: 'Vaccines are dates, products, and paper handled together',
  features: [
    {
      title: 'Certificate storage that counts',
      body: 'Upload the signed rabies certificate, not just a note that says “done.” Kennels want manufacturer, lot, and veterinarian signature.',
    },
    {
      title: 'Due dates from the label, not memory',
      body: 'Set the next dose when you log the current one. PetClues reminds you before compliance becomes a crisis.',
    },
    {
      title: 'Puppy and kitten series tracking',
      body: 'Sequential doses matter. See which shot in the series was given and what the clinic scheduled next.',
    },
    {
      title: 'Species-aware defaults',
      body: 'Dogs and cats follow different core protocols. Templates reflect common schedules; your vet’s plan always wins.',
    },
    {
      title: 'Multi-pet household view',
      body: 'Three pets, three staggered rabies anniversaries. One dashboard shows who is current and who is due this month.',
    },
    {
      title: 'Export for facilities',
      body: 'Send a PDF bundle with certificates and dates formatted for front-desk staff, no retaking photos in the parking lot.',
    },
  ],
  trustTitle: 'Compliance without the guilt spiral',
  trustPoints: [
    {
      title: 'Your vet sets the schedule',
      body: 'Regional law and lifestyle change what a pet needs. PetClues tracks what you log; it does not replace veterinary protocol.',
    },
    {
      title: 'Titer discussions stay with your clinic',
      body: 'Some owners pursue titer testing. Store results like any lab, but vaccination decisions belong in exam-room conversations.',
    },
    {
      title: 'Free reminders for core vaccines',
      body: 'Rabies and routine due-date alerts are part of the free tier, because missed boosters are expensive in every sense.',
    },
    {
      title: 'Audit trail for your own sanity',
      body: 'When two clinics disagree on what was given, your dated entries settle the argument.',
    },
  ],
  proseSections: [
    {
      id: 'why-proof-matters',
      title: 'Proof is a product of how you store, not how diligent you are',
      paragraphs: [
        'Facilities do not accept diligence. They accept documentation. A verbal assurance that “she’s up to date” fails at check-in when the desk needs a rabies certificate with a visible expiration.',
        'Most owners were vaccinated on time. The failure is archival: the certificate went home in a paper folder, lived on a fridge magnet, then vanished during a move. Digital storage fails too when it is only a photo lost among thousands.',
        'A vaccination record system must hold three things together: what was given, when it was given, and the paper that proves it. Separate any one of those and you are back to scrambling.',
      ],
    },
    {
      id: 'core-vs-lifestyle',
      title: 'Core vaccines, lifestyle vaccines, and the conversation behind them',
      paragraphs: [
        'Core vaccines address diseases with serious public or animal health impact: rabies foremost among legal requirements in many regions. Lifestyle vaccines depend on exposure: boarding frequency, wildlife contact, geographic risk.',
        'Your record should tag which category each entry belongs to. When a daycare asks only for Bordetella, you should not scroll past unrelated entries.',
        'When a veterinarian recommends skipping or deferring a lifestyle vaccine, note the rationale. Future you, and future vets, will wonder why a gap exists.',
      ],
    },
    {
      id: 'puppy-kitten-series',
      title: 'Series vaccines punish small timing errors',
      paragraphs: [
        'Puppies and kittens do not receive full immunity from a single visit. Intervals between doses are part of the medicine. A record that shows “shot 2 of 3, due in three weeks” prevents accidental early revaccination or late gaps.',
        'If you switch clinics mid-series, the new team needs the prior product names and dates, not a guess from memory. Upload the invoice if the certificate is not ready yet; update when paperwork arrives.',
        'When the series completes, set the adult booster schedule immediately. The handoff from intensive puppy care to annual maintenance is where records most often stall.',
      ],
    },
    {
      id: 'boarding-travel',
      title: 'Boarding and travel deadlines are unforgiving',
      paragraphs: [
        'Kennels often require vaccines administered a minimum number of days before arrival, not merely “current.” Read their policy when you book, then back-calculate from your stored dates.',
        'International travel may require government-endorsed forms beyond routine certificates. PetClues holds your clinic-issued proof; statutory forms stay in the official channel your vet describes.',
        'Build a boarding packet once: rabies certificate, Bordetella if required, emergency contact, feeding notes. Reuse and update rather than rebuilding under stress.',
        'Daycares sometimes require explicit flea and tick proof during warm months. Tag those entries seasonally so spring does not surprise you in May.',
      ],
    },
    {
      id: 'reminder-discipline',
      title: 'Reminders only work if they attach to reality',
      paragraphs: [
        'Set reminders at the moment of vaccination, when the vet states the next due date. Waiting until you get home invites drift.',
        'If a reminder fires and you already vaccinated, log the new dose and roll the date forward. Stale reminders erode trust in the system.',
        'For multi-pet homes, stagger is normal. A single calendar for “pets” collapses under complexity; per-pet due dates do not.',
      ],
    },
    {
      id: 'long-term-value',
      title: 'Vaccination discipline is a household skill',
      paragraphs: [
        'Clinics send reminders; kennels send requirements; life sends distractions. Someone in the home must own the intersection, and that person should not be the only one who can prove compliance. Shared access means either partner can upload the certificate the night it arrives.',
        'PetClues does not guess your local law. It remembers what your veterinarian documented and when the next dose is due. That distinction matters in regions where titers, exemptions, or lifestyle vaccines change the conversation.',
        'Treat vaccination logging like paying a utility: small recurring attention prevents large urgent costs. A missed booster can mean cancelled travel, refused boarding, or an extra clinic visit to restart a series.',
      ],
    },
    {
      id: 'adult-boosters',
      title: 'Adult boosters are where good systems prove themselves',
      paragraphs: [
        'Puppy series intensity fades into annual or triennial rhythms. That is when memory fails, because nothing feels urgent for months at a time. Automated due dates matter more in year three than week three.',
        'When your municipality or landlord asks for proof, they rarely care about clinical nuance. They care whether the date on the certificate is valid today. Store the certificate image alongside the date entry so proof and record cannot separate.',
        'If you adopt an adult with unknown history, log what you know as “verified” and what you assume as “pending verification.” Honest gaps beat confident guesses when a new vet reviews the file.',
      ],
    },
    {
      id: 'lost-paperwork',
      title: 'When paperwork is lost, your log becomes the source of truth',
      paragraphs: [
        'Clinics reissue certificates, but not instantly. Your dated entry with product name and lot can unblock boarding while admin catches up.',
        'If a vet retires or a practice merges, records transfer slowly, or not at all. Owner-maintained history prevents amnesia during transitions.',
        'Scan certificates the day you receive them. The cost of five minutes now is smaller than the cost of a cancelled trip later.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Can PetClues tell me which vaccines my pet needs?',
      answer:
        'PetClues tracks what you and your veterinarian decide. Protocol varies by species, age, law, and lifestyle. Those decisions stay in the clinic.',
    },
    {
      question: 'What should I photograph for rabies proof?',
      answer:
        'Capture the full certificate: pet name, product, date given, expiration, vet signature, and clinic details. Avoid cropped corners.',
    },
    {
      question: 'Do you support non-rabies vaccines like Bordetella?',
      answer:
        'Yes. Log any vaccine with date, product, and optional certificate attachment.',
    },
    {
      question: 'Can I share records with a boarding facility?',
      answer:
        'Export a PDF or share your passport summary with vaccination dates and certificates attached.',
    },
    {
      question: 'What if my clinic uses a portal instead of paper?',
      answer:
        'Download PDFs from the portal and attach them to the matching dated entry in PetClues so everything lives in one timeline.',
    },
    {
      question: 'Are vaccine reminders free?',
      answer:
        'Yes. Due-date reminders for logged vaccines are included on the free tier.',
    },
  ],
  ctaTitle: 'Log the last visit before the next deadline',
  ctaLead:
    'Upload your rabies certificate, set the booster reminder, and stop relying on fridge magnets.',
  relatedLinks: [
    { href: `${ROUTES.BLOG}/puppy-vaccination-schedule-2026`, label: 'Puppy vaccination schedule' },
    { href: `${ROUTES.BLOG}/new-puppy-checklist-health-records-vaccines`, label: 'New puppy health checklist' },
    { href: `${ROUTES.BEST}/best-pet-vaccination-tracker`, label: 'Best pet vaccination trackers' },
    { href: ROUTES.FOUNDING_MEMBERS, label: 'Founding members' },
    { href: ROUTES.PRICING, label: 'Membership pricing' },
  ],
};
