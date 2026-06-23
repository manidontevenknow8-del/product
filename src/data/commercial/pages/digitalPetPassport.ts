import type { CommercialPageConfig } from '../types';
import { COMMERCIAL_WIKIDATA } from '../schemaTopics';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';

export const DIGITAL_PET_PASSPORT_PAGE: CommercialPageConfig = {
  path: '/digital-pet-passport',
  primaryKeyword: 'digital pet passport',
  secondaryKeywords: [
    'pet emergency card',
    'pet ID with medical info',
    'share pet health info',
    'pet passport app',
  ],
  searchIntent:
    'Owners who need critical pet identity and medical facts reachable in seconds, during travel, boarding, or an emergency, not buried in a vet portal.',
  title: 'Digital Pet Passport: Critical Info, One Tap Away',
  metaDescription:
    'A digital pet passport with allergies, medications, vet contacts, and microchip details, shareable with sitters, clinics, and border checks without digging through files.',
  schemaTopic: {
    topicName: 'Digital pet passport',
    topicWikidataUrl: COMMERCIAL_WIKIDATA.petPassport,
  },
  heroEyebrow: 'Digital pet passport',
  heroTitle: 'When someone else cares for your pet, they should not guess.',
  heroSubhead:
    'PetClues keeps identity, allergies, medications, and emergency contacts in a passport view you can share in seconds, before the flight, before boarding, before the ER intake form.',
  heroImage: PAGE_IMG.app.passport,
  heroImageAlt: 'Digital pet passport showing emergency medical details on a phone',
  featuresTitle: 'What a passport should answer immediately',
  features: [
    {
      title: 'Identity that travels',
      body: 'Name, species, breed, age, weight, microchip number, and a clear photo, formatted for humans and front-desk staff, not buried in a chart note.',
    },
    {
      title: 'Allergies and reactions up front',
      body: 'Drug and food sensitivities sit above the fold. No scrolling past vaccination history to find what must not be administered.',
    },
    {
      title: 'Active medications listed plainly',
      body: 'Drug, dose, and schedule in plain language. Relief staff and locum vets get continuity without calling you mid-dinner.',
    },
    {
      title: 'Vet and emergency contacts',
      body: 'Primary clinic, after-hours line, and your reachable number, because the right call at minute ten beats the perfect record at hour two.',
    },
    {
      title: 'Controlled sharing',
      body: 'Generate a link or card for a sitter, groomer, or airline check-in. Share facts, not your entire document archive.',
    },
    {
      title: 'Print when paper is required',
      body: 'Some kennels and carriers still want a sheet. Export a clean passport PDF that matches what they expect to see.',
    },
  ],
  trustTitle: 'Designed for urgency, not vanity profiles',
  trustPoints: [
    {
      title: 'Free passport basics',
      body: 'Core identity and emergency fields are included on the free tier, because safety should not wait for a subscription.',
    },
    {
      title: 'Updates sync instantly',
      body: 'Change a medication dose once; every shared view reflects it. No re-sending attachments after each vet visit.',
    },
    {
      title: 'Not a government travel document',
      body: 'PetClues complements official import/export paperwork where required. We make everyday handoffs reliable; embassies still issue their own forms.',
    },
    {
      title: 'Privacy by default',
      body: 'You choose who sees the passport. Links can be scoped and revoked when a trip ends.',
    },
  ],
  proseSections: [
    {
      id: 'emergency-minute',
      title: 'The first ten minutes are not for file archaeology',
      paragraphs: [
        'Emergencies compress time. Someone asks about drug allergies while your pet is triaged. A sitter notices labored breathing and needs your vet’s number. A hotel clerk wants confirmation that vaccines are current before they allow a late check-in.',
        'In those moments, “it’s somewhere in my email” is not an answer. A digital pet passport is a deliberate slice of your record, only what a stranger needs to act safely, nothing more.',
        'Paper cards get lost. Camera-roll screenshots lack structure. A maintained passport view is the middle path: fast, legible, and tied to the same source of truth as your full health timeline.',
      ],
    },
    {
      id: 'travel-boarding',
      title: 'Travel and boarding ask different questions than your vet',
      paragraphs: [
        'Airlines and kennels rarely want your entire medical history. They want proof of rabies, contact details, and sometimes a recent health certificate. Your passport should surface those fields without exposing unrelated diagnostics.',
        'Before international travel, confirm which documents are statutory versus which are simply prudent. PetClues holds the prudent layer, so you are not rebuilding a packet from scratch every trip.',
        'For domestic boarding, send the passport link when you book, not the morning of drop-off. Facilities appreciate lead time to file paperwork correctly.',
      ],
    },
    {
      id: 'sitter-handoff',
      title: 'The sitter handoff is a medical event, not a favor',
      paragraphs: [
        'Friends love your pet; they may not love decoding prescription labels. List medications in words a non-medical person understands. Note timing quirks, food requirements, anxiety protocols, when to call the vet versus wait.',
        'Include behavioral cues that affect safety: fear of men in hats, escape risk at doorways, aggression triggers with other dogs. Clinics need clinical facts; sitters need both clinical and household facts.',
        'Revoke access when the trip ends. A passport link for a two-night stay should not linger for months.',
      ],
    },
    {
      id: 'passport-vs-records',
      title: 'Passport versus full records: know the boundary',
      paragraphs: [
        'Your health record is the archive: labs, imaging reports, years of visits. Your passport is the executive summary for people who will spend five minutes with your pet, not fifty.',
        'Keep the passport current when anything changes: new allergy diagnosis, antibiotic course, temporary sedative for travel. Stale passports are worse than none, they breed false confidence.',
        'When a clinic needs depth, export from the timeline. When a stranger needs orientation, send the passport. Mixing the two creates noise.',
      ],
    },
    {
      id: 'building-passport',
      title: 'Building a passport that earns trust',
      paragraphs: [
        'Start with non-negotiables: photo, microchip, rabies date, primary vet phone, your phone. Add medications only if actively administered, do not list every drug tried last year.',
        'Use the notes field for judgment calls: “OK with small amounts of chicken as treat,” “Do not use retractable leash, shoulder injury.” These are the details loving owners know and strangers do not.',
        'Review quarterly even if nothing dramatic happened. Weight drifts, phone numbers change, clinics merge. A five-minute audit prevents a stressful correction later.',
        'Consider what a stranger must never do: foods that trigger pancreatitis, drugs that caused hives, restraint that panics your pet. The passport is where prohibitions live, not buried in narrative notes.',
      ],
    },
    {
      id: 'long-term-value',
      title: 'Passports work when they stay boring',
      paragraphs: [
        'The best emergency handoff is unremarkable: correct allergy listed, correct vet number, correct weight. No drama, no improvisation. Boring is the design goal, excitement means someone is filling gaps under stress.',
        'PetClues keeps passport fields tied to your living record. Update a prescription after a visit; the passport reflects it without a separate editing pass. That coupling is what separates a maintained passport from a PDF you emailed once in 2024.',
        'For households with multiple caregivers, the passport is the shared truth layer. Full records stay private; the passport is what everyone agrees on when they pick up from boarding or answer a clinic callback.',
      ],
    },
    {
      id: 'airline-kennel',
      title: 'Airlines and kennels read passports differently than vets',
      paragraphs: [
        'Front-desk staff are not clinicians. They scan for rabies date, contact phone, and sometimes breed restrictions. Your passport should answer those fields in the first screen, not after twelve scrolls of clinical history.',
        'If a carrier requires a health certificate within a narrow window, note the certificate date separately from the vaccine date. They are related but not identical; conflating them causes avoidable rejections.',
        'Keep a printed backup when crossing borders or flying legacy carriers with spotty Wi-Fi. Digital-first does not mean digital-only.',
      ],
    },
    {
      id: 'multi-pet-travel',
      title: 'Multiple pets multiply handoff complexity',
      paragraphs: [
        'Two passports, two rabies dates, two microchip numbers. Kennels will not sort this for you. Per-pet passports prevent cross-wiring when names sound similar or breeds look alike to staff.',
        'When only one pet travels, send only that passport link. Partial sharing reduces leak of unrelated medical detail.',
        'Household emergency contacts can be shared; medication lists must not be. Verify each passport before every trip.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Is a digital pet passport the same as an EU pet passport?',
      answer:
        'No. Official pet passports for international travel are issued by authorized veterinarians under specific regulations. PetClues provides a practical emergency and handoff summary for everyday use.',
    },
    {
      question: 'Can I share the passport without giving full account access?',
      answer:
        'Yes. Share a scoped view or export a PDF for kennels and carriers that require paper.',
    },
    {
      question: 'What if my pet has no known allergies?',
      answer:
        'State “none known” explicitly. Absence of information is often read as absence of risk, which is not the same thing.',
    },
    {
      question: 'Does the passport work offline?',
      answer:
        'Export a PDF for trips with limited connectivity. Keep it with travel documents as a backup.',
    },
    {
      question: 'Can multiple caregivers see the same passport?',
      answer:
        'Yes. Household members on your account see the same live passport; external sitters can receive a link.',
    },
    {
      question: 'Is the passport included on the free plan?',
      answer:
        'Core passport fields and sharing are included free for one pet.',
    },
  ],
  ctaTitle: 'Five minutes now beats panic later',
  ctaLead:
    'Fill the passport fields you already know. Add the rest after your next visit.',
  relatedLinks: [
    { href: `${ROUTES.BLOG}/pet-emergency-information-card-guide`, label: 'Pet emergency information card guide' },
    { href: `${ROUTES.BEST}/digital-pet-passport-app`, label: 'Best digital pet passport apps' },
    { href: `${ROUTES.FAQ}/can-i-print-a-pet-emergency-information-card`, label: 'Print a pet emergency card' },
    { href: ROUTES.PRICING, label: 'Membership pricing' },
    { href: ROUTES.SIGNUP, label: 'Create free account' },
  ],
};
