import type { ResourceMatrixEntry } from './resourceMatrix';
import { libraryLinksForResource, type LibraryLink } from './pseoLibraryLinks';
import { uniqueResourceParagraphs } from './pseoUniqueCopy';

const RESOURCE_HERO: Record<string, string> = {
  "dog-boarding-vaccine-requirements": "/images/blog/blog-pet-boarding.webp",
  "cat-boarding-vaccine-requirements": "/images/blog/blog-cat-vaccination.webp",
  "dog-daycare-shot-records": "/images/blog/blog-dog-vaccination-guide.webp",
  "pet-sitter-medical-handoff": "/images/blog/blog-pet-sitter-instructions.webp",
  "emergency-vet-records-kit": "/images/blog/blog-emergency-passport.webp",
  "rabies-certificate-copy": "/images/blog/blog-pet-records.webp",
  "titer-records-for-travel": "/images/blog/blog-travel-pets.webp",
  "puppy-class-vaccine-proof": "/images/blog/blog-puppy-vaccination.webp",
  "airline-pet-health-certificate": "/images/blog/blog-flying-with-cats.webp",
  "lost-pet-qr-id": "/images/blog/blog-microchip-registration.webp",
  "new-puppy-health-folder": "/images/blog/blog-puppy-checklist.webp",
  "new-kitten-health-folder": "/images/blog/blog-new-kitten-checklist.webp",
  "senior-dog-medication-log": "/images/blog/blog-medication-reminder.webp",
  "multi-pet-household-records": "/images/blog/blog-pet-records-timeline.webp",
  "groomer-vaccine-proof": "/images/blog/blog-poodle-grooming-health.webp",
  "dog-park-vaccine-rules": "/images/blog/blog-dog-vaccination-guide.webp",
  "foster-intake-records": "/images/blog/blog-pet-records.webp",
  "moving-with-pets-documents": "/images/blog/blog-travel-pets.webp",
  "pet-insurance-claim-packet": "/images/blog/blog-vet-bill-organizer.webp",
  "after-hours-emergency-card": "/images/blog/blog-emergency-passport.webp"
};

export type ResourceFaq = {
  question: string;
  answer: string;
};

export type ResourcePageContent = {
  title: string;
  lead: string;
  overview: string;
  checklist: string[];
  steps: { title: string; detail: string }[];
  localNote: string;
  ctaTitle: string;
  ctaBody: string;
  faqs: ResourceFaq[];
  heroImage: string;
  uniqueParagraphs: string[];
  library: LibraryLink[];
};

function titleFor(entry: ResourceMatrixEntry): string {
  return `${entry.topic.label} in ${entry.city.name}, ${entry.city.stateAbbr}`;
}

function expandResourceBuilder(
  entry: ResourceMatrixEntry,
  base: Omit<ResourcePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>,
): Omit<ResourcePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'> {
  const { city, topic } = entry;
  const climate = city.climateNote.endsWith('.') ? city.climateNote : `${city.climateNote}.`;
  const facility = city.facilityNote.endsWith('.') ? city.facilityNote : `${city.facilityNote}.`;

  const extraChecklist = [
    `Written policy or email from the ${city.name} facility saved as a PDF`,
    'Backup contact who can open the same vault if your phone dies',
    `County or city license steps for ${city.state} if they apply to this packet`,
  ].filter((item) => !base.checklist.includes(item));

  const extraSteps = [
    {
      title: 'Name the file like a human',
      detail: `Use dates and the pet name, not IMG_4421. A ${city.name} desk will not sort your camera roll.`,
    },
    {
      title: 'Test the link offline',
      detail: 'Open the packet on airplane mode once. If it fails in your kitchen, it will fail in their lobby.',
    },
  ].filter((step) => !base.steps.some((existing) => existing.title === step.title));

  const extraFaqs = [
    {
      question: `Why does this ${topic.label.toLowerCase()} page mention ${city.name} climate?`,
      answer: `Because ${climate} That changes parasite pressure, heat notes, storm go-bags, and how often desks ask for Bordetella or fecals. A generic national checklist misses that.`,
    },
    {
      question: `What do ${city.name} facilities usually want first?`,
      answer: `${facility} Start with rabies and core vaccines, then add whatever this ${topic.kicker.toLowerCase()} packet lists. Put the PDFs in one vault before drop-off day.`,
    },
    {
      question: `Can I keep this packet for more than one pet in ${city.name}?`,
      answer: `Yes, as separate profiles in one household. Sitters and clinics still need the right animal matched to the right certificate. Shared folders without names are how mix-ups start.`,
    },
  ].filter((faq) => !base.faqs.some((existing) => existing.question === faq.question));

  return {
    ...base,
    overview: `${base.overview} Households in ${city.name}, ${city.stateAbbr} (${city.region}) lose the most time when certificates live in three inboxes. Build the packet once, then reuse it for every ${topic.kicker.toLowerCase()} ask.`,
    localNote: `${base.localNote} Search intent people type for this page includes: ${topic.searchIntent}.`,
    checklist: [...base.checklist, ...extraChecklist].slice(0, 12),
    steps: [...base.steps, ...extraSteps].slice(0, 8),
    faqs: [...base.faqs, ...extraFaqs].slice(0, 8),
    ctaBody: `${base.ctaBody} When a ${city.name} desk asks for proof, you should be able to open it in under thirty seconds.`,
  };
}

const BUILDERS: Record<string, (entry: ResourceMatrixEntry) => Omit<ResourcePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>> = {
  'dog-boarding-vaccine-requirements': (entry) => ({
    lead: `What ${entry.city.name} dog boarding desks usually want on file before drop-off, and how to keep those certificates ready on your phone.`,
    overview: `${entry.city.facilityNote} Households around ${entry.city.name} still show up with a blurry camera-roll shot and get waved back to the car. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} changes how often desks ask for Bordetella, fecal dates, and heartworm notes on top of rabies and DHPP. Treat boarding vaccines like a standing packet, not a scramble the night before. A digital passport with the same PDFs your kennel already listed beats five email threads.`,
    checklist: [
      'Rabies certificate with clinic, lot, and expiration',
      'DHPP or DA2PP dates that match the dog in front of the desk',
      'Bordetella (intranasal or injectable) if group play is booked',
      'Fecal or parasite prevention dates if the kennel asks',
      'Microchip number that matches the rabies record',
      'Heartworm prevention date next to the vaccine PDFs',
      'Emergency vet phone and permission-to-treat note for this metro',
      'Feeding, meds, and crate notes on the same one-screen packet',
    ],
    steps: [
      { title: 'Photograph every certificate the day it is issued', detail: `Full page, no glare. Store it on the ${entry.city.name} pet profile, not in camera roll chaos.` },
      { title: 'Build a one-screen boarding packet', detail: `Vaccines, meds, feeding, heartworm tracker date, and the emergency vet phone for ${entry.city.name}.` },
      { title: 'Share a read-only link', detail: 'Front-desk staff should not need your iCloud password. A digital passport link is enough.' },
      { title: 'Re-check dates before you book', detail: `Expired Bordetella is the usual ${entry.city.name} bounce. Update the vault the same day as the booster.` },
    ],
    localNote: `${entry.city.facilityNote} Local climate pressure matters too: ${entry.city.climateNote}. Keep parasite and heartworm dates in the same vault as the boarding vaccines so intake is one open, not a scavenger hunt.`,
    ctaTitle: `Save ${entry.city.name} boarding proof in one vault`,
    ctaBody: `Build the ${entry.city.name} boarding vaccine packet once in PetClues so the desk, sitter handoff, and ER all read the same dates.`,
    faqs: [
      {
        question: `What vaccines does dog boarding in ${entry.city.name} require?`,
        answer: `Most ${entry.city.name} kennels want current rabies and DHPP. Group play usually adds Bordetella. Ask your facility for a written list, then store those exact PDFs in PetClues next to your heartworm tracker.`,
      },
      {
        question: `How recent do boarding vaccines need to be in ${entry.city.name}?`,
        answer: `Many ${entry.city.name} desks want dates within 12 months. Some accept 3-year rabies labels if the certificate is clear. Keep both the label interval and the PDF in the digital passport.`,
      },
      {
        question: `Can I use the same packet for a sitter handoff in ${entry.city.name}?`,
        answer: `Yes. Sitters need the same vaccines, meds, and ER phone. Share a read-only link so the ${entry.city.name} sitter is not hunting through texts.`,
      },
      {
        question: `Where should I keep heartworm proof for ${entry.city.name} kennels?`,
        answer: `In the same vault as rabies and DHPP. ${entry.city.name} desks that ask for parasite prevention want one packet, not a separate app screenshot.`,
      },
    ],
  }),
  'cat-boarding-vaccine-requirements': (entry) => ({
    lead: `Cattery and clinic boarding intake for cats in ${entry.city.name}: FVRCP, rabies, and the extras that stall drop-off.`,
    overview: `Cat boarding in ${entry.city.name} is less standardized than dog daycare, but FVRCP and rabies still win most arguments at the desk. ${entry.city.facilityNote} Indoor-only cats are not exempt when a cattery requires proof. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} also shapes stress, parasite asks, and how often sitters need a backup plan if boarding falls through. Keep boarding vaccines and a digital passport ready before you book the suite.`,
    checklist: [
      'FVRCP series or adult booster PDF',
      'Rabies certificate that matches the cat',
      'FeLV status if the cattery houses mixed-testing cats',
      'Medication and diet list for a stressed boarder',
      `Emergency clinic in ${entry.city.name} with after-hours hours`,
      'Litter, feeding, and hiding-spot notes for staff',
      'Microchip number that matches the rabies record',
      'Sitter handoff link if boarding cancels last minute',
    ],
    steps: [
      { title: 'Confirm the cattery list in writing', detail: `Do not guess FeLV. Screenshot the email into the ${entry.city.name} vault.` },
      { title: 'Pack meds with dose times', detail: 'Thyroid and kidney meds are the usual miss. Put last-dose time on the same screen.' },
      { title: 'Leave a digital packet', detail: `A digital passport for ${entry.city.name} staff beats a paper folder that stays in the car.` },
      { title: 'Prep a backup sitter handoff', detail: `If the ${entry.city.name} cattery is full, the same vault should work for a sitter without rewriting everything.` },
    ],
    localNote: `${entry.city.facilityNote} Climate context for cat boarders: ${entry.city.climateNote}. Store FVRCP, rabies, and stress notes together so ${entry.city.name} intake is not a debate about indoor-only status.`,
    ctaTitle: `Keep ${entry.city.name} cat boarding records ready`,
    ctaBody: `Keep ${entry.city.name} boarding vaccines and meds in one PetClues vault so cattery staff and your backup sitter see the same file.`,
    faqs: [
      {
        question: `Do indoor cats in ${entry.city.name} still need boarding vaccines?`,
        answer: `If the ${entry.city.name} cattery requires them, yes. Indoor status does not override facility policy. Store FVRCP and rabies PDFs before you book.`,
      },
      {
        question: `What about FeLV for cat boarding in ${entry.city.name}?`,
        answer: `Some ${entry.city.name} catteries require a recent negative test for group housing. Keep the lab PDF next to the vaccine file in the digital passport.`,
      },
      {
        question: `Can a sitter handoff replace boarding in ${entry.city.name}?`,
        answer: `Sometimes. Build the packet once so a ${entry.city.name} sitter gets the same meds, diet, and ER phone the cattery would have used.`,
      },
      {
        question: `How do I share cat records with a ${entry.city.name} desk?`,
        answer: `Use a read-only link. ${entry.city.name} staff should open PDFs without your portal password or a dying phone flashlight.`,
      },
    ],
  }),
  'dog-daycare-shot-records': (entry) => ({
    lead: `Daycare playgroup intake in ${entry.city.name}: the shot record packet that gets a dog onto the floor instead of sitting in a crate.`,
    overview: `${entry.city.facilityNote} Daycare in ${entry.city.name} is stricter than overnight boarding because of nose-to-nose contact. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} is why influenza, fecal, and parasite asks spike in some seasons. Keep boarding vaccines and daycare shots in one digital passport so you are not rebuilding the folder every time the facility updates its list.`,
    checklist: [
      'DHPP, rabies, and Bordetella certificates',
      'Canine influenza if the daycare lists it',
      'Fecal test if required for first visit',
      'Temperament or trial-day notes',
      'Digital packet the front desk can open without an app login fight',
      'Heartworm prevention date on the same profile',
      'Emergency contact and regular vet phone',
      'Microchip number matching the rabies PDF',
    ],
    steps: [
      { title: 'Ask for the written vaccine policy', detail: `Save it on the ${entry.city.name} profile so the next daycare gets the same packet.` },
      { title: 'Put fecal dates next to vaccines', detail: 'Staff look for one sheet, not five emails.' },
      { title: 'Update after every booster', detail: `Expired Bordetella is the most common ${entry.city.name} bounce.` },
      { title: 'Reuse the packet for boarding', detail: `Overnight stays in ${entry.city.name} often want the same boarding vaccines. Keep one digital passport for both.` },
    ],
    localNote: `${entry.city.facilityNote} With ${entry.city.climateNote}, parasite and fecal asks are not optional fluff. Pair those dates with the daycare shot record and your heartworm tracker so ${entry.city.name} intake stays boring.`,
    ctaTitle: `Build a ${entry.city.name} daycare packet`,
    ctaBody: `Store ${entry.city.name} daycare shot records in PetClues so playgroup intake and boarding vaccines share one digital passport.`,
    faqs: [
      {
        question: `Does ${entry.city.name} dog daycare require Bordetella?`,
        answer: `Group play in ${entry.city.name} usually does. Overnight-only stays sometimes skip it. Get the policy in writing and store the matching certificate.`,
      },
      {
        question: `Can I show ${entry.city.name} daycare records on my phone?`,
        answer: `Yes if the PDFs open offline. A digital passport built for ${entry.city.name} handoffs is safer than a portal that needs cell service.`,
      },
      {
        question: `Do ${entry.city.name} daycares ask for heartworm proof?`,
        answer: `Some do, especially where parasite pressure is high. Keep the heartworm tracker date next to DHPP and rabies.`,
      },
      {
        question: `Should the same file work for a sitter handoff in ${entry.city.name}?`,
        answer: `Yes. Daycare staff and sitters both need vaccines, meds, and an ER phone. Share one vault link for ${entry.city.name} caregivers.`,
      },
    ],
  }),
  'pet-sitter-medical-handoff': (entry) => ({
    lead: `A sitter packet for ${entry.city.name} households: meds, allergies, vet phone, and feeding, without a 14-text thread.`,
    overview: `Sitters in ${entry.city.name} fail when the only copy of thyroid meds lives in your head. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} raises heat, ice, or storm risks that belong on the same card as the pill schedule. ${entry.city.facilityNote} A real sitter handoff is a medical packet plus boarding vaccines if the backup plan is a kennel, not a stack of texts.`,
    checklist: [
      'Medication names, mg, and times',
      'Allergy and food-trial rules',
      'Regular vet and after-hours ER in this metro',
      'Behavior notes (resource guarding, escape, doorbell)',
      'Permission to treat and a payment method note',
      'Vaccine PDFs in case the sitter must use boarding',
      'Heartworm and flea prevention dates',
      'House access notes and who else has a key',
    ],
    steps: [
      { title: 'Write the med schedule once', detail: 'AM/PM with food or empty stomach. Photos of bottles help.' },
      { title: 'Pin the ER', detail: `Name the after-hours clinic you actually use in ${entry.city.name}.` },
      { title: 'Share a read-only link', detail: `Sitters in ${entry.city.name} should not hunt through your camera roll.` },
      { title: 'Add boarding vaccines as backup', detail: `If the sitter cancels, the same digital passport should satisfy a ${entry.city.name} kennel desk.` },
    ],
    localNote: `Climate context for ${entry.city.name} sitters: ${entry.city.climateNote}. ${entry.city.facilityNote} Put heat or storm notes on the same screen as meds so the sitter handoff is not a guessing game.`,
    ctaTitle: `Hand your ${entry.city.name} sitter a real packet`,
    ctaBody: `Give your ${entry.city.name} sitter a PetClues handoff with meds, vaccines, and ER phones in one digital passport.`,
    faqs: [
      {
        question: `What should a pet sitter packet include in ${entry.city.name}?`,
        answer: `Meds, feeding, vet phones, allergies, and how to get into the house. Photos of pills help. PetClues keeps that on one ${entry.city.name} profile.`,
      },
      {
        question: `Which ER should I list for a sitter handoff in ${entry.city.name}?`,
        answer: `List the clinic you would actually drive to at 1 a.m. in ${entry.city.name}, not the closest pin on a map you have never used.`,
      },
      {
        question: `Do sitters in ${entry.city.name} need vaccine records?`,
        answer: `Yes if they may board, groom, or visit a clinic. Keep boarding vaccines in the same vault as the sitter handoff.`,
      },
      {
        question: `How do I track heartworm pills for a ${entry.city.name} sitter?`,
        answer: `Put the heartworm tracker date on the med schedule. Sitters miss monthly pills when the only reminder is in your calendar.`,
      },
    ],
  }),
  'emergency-vet-records-kit': (entry) => ({
    lead: `An ER intake kit for ${entry.city.name}: meds, conditions, and vaccine dates that a triage nurse can read in 30 seconds.`,
    overview: `Emergency clinics in ${entry.city.name} do not have time to reverse-engineer your email. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} drives heat stroke, ice injuries, or storm-related toxin calls. ${entry.city.facilityNote} A one-page kit plus PDFs is the job: meds first, then rabies and boarding vaccines if the desk asks. A digital passport that opens in the parking lot beats a paper folder left at home.`,
    checklist: [
      'Current medications and last dose time',
      'Known conditions and last specialist letter',
      'Vaccine dates, especially rabies',
      'Allergies and previous anesthesia notes',
      'Your name, phone, and permission to treat',
      'Last two lab PDFs (kidney and liver if you have them)',
      'Heartworm status and prevention date',
      'Regular clinic phone and after-hours ER name',
    ],
    steps: [
      { title: 'Keep a one-screen summary', detail: `Weight, meds, conditions, and the vet phone you use in ${entry.city.name}.` },
      { title: 'Attach the last two lab PDFs', detail: 'Kidney and liver values change ER drug choices.' },
      { title: 'Share from the parking lot', detail: 'A digital passport link beats a dying phone flashlight on a paper folder.' },
      { title: 'Mirror the sitter handoff', detail: `If a roommate or sitter drives in ${entry.city.name}, they need the same kit without calling you.` },
    ],
    localNote: `${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} makes after-hours trips more likely in ${entry.city.name}. ${entry.city.facilityNote} Keep the ER kit and boarding vaccines in one vault so triage and kennel desks are not different scavenger hunts.`,
    ctaTitle: `Build a ${entry.city.name} ER kit tonight`,
    ctaBody: `Build a ${entry.city.name} ER kit in PetClues so triage, sitters, and boarding desks open the same digital passport.`,
    faqs: [
      {
        question: `What records does an emergency vet in ${entry.city.name} need?`,
        answer: `Meds, allergies, major diagnoses, and recent labs. Vaccine PDFs help, but the medication list saves lives first at ${entry.city.name} ERs.`,
      },
      {
        question: `Should I bring paper to a ${entry.city.name} ER?`,
        answer: `Paper is fine. Digital that opens without cell service is better. Keep both in PetClues and a printed card for ${entry.city.name} trips.`,
      },
      {
        question: `Do ${entry.city.name} ERs care about boarding vaccines?`,
        answer: `Rabies matters for bite and licensing questions. Full boarding vaccines matter less than last-dose times, but keep them in the same vault.`,
      },
      {
        question: `Can a sitter handoff use the same ${entry.city.name} ER kit?`,
        answer: `Yes. Share the read-only link so a ${entry.city.name} sitter can open meds and the ER phone without a text thread.`,
      },
    ],
  }),
  'rabies-certificate-copy': (entry) => ({
    lead: `How to keep a usable rabies certificate for ${entry.city.name} licensing, boarding, and bite-quarantine questions.`,
    overview: `${entry.city.state} rabies proof is a legal document, not a text message. ${entry.city.facilityNote} A blurry photo that cuts off the expiration is why people get turned away in ${entry.city.name}. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} does not change the law, but it does change how often you need that PDF for boarding vaccines, park checks, and travel. Store the full certificate in a digital passport the day it is issued.`,
    checklist: [
      'Clinic name and veterinarian signature or stamp',
      'Lot number and expiration',
      'Pet name and description matching the license',
      'Microchip if it is printed on the certificate',
      'Tag number if the county issued one',
      'Booster interval note (1-year vs 3-year label)',
      'Digital PDF that opens offline',
      'Matching county or city license receipt if required',
    ],
    steps: [
      { title: 'Scan the full certificate', detail: `Edges included. Store the PDF on the ${entry.city.name} pet profile the same day.` },
      { title: 'Match it to the license', detail: `${entry.city.name} clerks bounce mismatches between name, breed, and chip.` },
      { title: 'Keep the booster reminder', detail: '1-year vs 3-year labels are easy to mix up. Put the next due date on a timeline.' },
      { title: 'Reuse it for boarding and sitters', detail: `Kennels and a sitter handoff in ${entry.city.name} both ask for the same rabies PDF.` },
    ],
    localNote: `${entry.city.state} clerks and ${entry.city.name} facilities both want a complete certificate, not a cropped screenshot. ${entry.city.facilityNote} Climate does not rewrite rabies law, but ${entry.city.climateNote} is why you will open this file again for boarding and travel.`,
    ctaTitle: `Store the ${entry.city.name} rabies PDF`,
    ctaBody: `Store the ${entry.city.name} rabies certificate in PetClues so licensing, boarding vaccines, and sitter handoffs share one PDF.`,
    faqs: [
      {
        question: `Where do I get a rabies certificate copy in ${entry.city.name}?`,
        answer: `Ask the clinic that gave the vaccine in ${entry.city.name}. Many portals expire. Save the PDF in PetClues the same day.`,
      },
      {
        question: `Is a rabies tag enough in ${entry.city.name}?`,
        answer: `No. The certificate is the record. The tag is a pointer. ${entry.city.name} desks and clerks want the full PDF.`,
      },
      {
        question: `Do ${entry.city.name} boarding desks accept a phone photo?`,
        answer: `Only if every edge and date is readable. A clean digital passport PDF is safer for ${entry.city.name} boarding vaccines intake.`,
      },
      {
        question: `Should sitters in ${entry.city.name} have the rabies PDF?`,
        answer: `Yes. A sitter handoff that ends at a clinic or kennel needs the same certificate you would bring yourself.`,
      },
    ],
  }),
  'titer-records-for-travel': (entry) => ({
    lead: `FAVN and rabies titer paperwork for ${entry.city.name} households flying or driving pets across borders.`,
    overview: `Titer wait times wreck last-minute trips. If you live in ${entry.city.name}, start the packet before you book. ${entry.city.facilityNote} ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} can also change crate rules and heat or cold holds at the airport. Keep the titer, rabies certificate, chip proof, and boarding vaccines timeline in one digital passport so a broker or airline desk is not waiting on your inbox.`,
    checklist: [
      'Microchip implanted before the titer draw',
      'Rabies vaccine certificate',
      'Approved lab result PDF (FAVN when required)',
      'ISO dates that match the passport or health cert',
      'Airline crate and health certificate timing',
      'Waiting-period dates written on a timeline',
      'Broker or airline contact notes',
      'Backup boarding vaccine PDFs if the pet stays at a kennel mid-trip',
    ],
    steps: [
      { title: 'Chip first, then draw', detail: 'A titer before the chip is a common expensive redo.' },
      { title: 'Archive the lab PDF', detail: `Portals disappear. Your ${entry.city.name} vault should not.` },
      { title: 'Count the waiting period', detail: 'Some destinations need months. Put the dates on a timeline next to boarding vaccines.' },
      { title: 'Pack digital and paper', detail: `${entry.city.name} travelers still get asked for a printout at the counter.` },
    ],
    localNote: `Travel from ${entry.city.name} often routes through major hubs. ${entry.city.facilityNote} Keep digital copies a broker can open. Climate note for crate and timing: ${entry.city.climateNote}.`,
    ctaTitle: `Keep ${entry.city.name} titer PDFs in order`,
    ctaBody: `Keep ${entry.city.name} titer and rabies PDFs in PetClues so travel desks and boarding vaccines stay on one digital passport.`,
    faqs: [
      {
        question: `What is a rabies titer for travel from ${entry.city.name}?`,
        answer: `A lab test showing antibody levels, often FAVN, required by some countries after rabies vaccination. ${entry.city.name} households still need the vaccine certificate too.`,
      },
      {
        question: `How long does titer paperwork take in ${entry.city.name}?`,
        answer: `Lab turnaround plus destination waiting periods. Plan in months, not days. Store every date in one ${entry.city.name} timeline.`,
      },
      {
        question: `Do I still need boarding vaccines for a ${entry.city.name} trip?`,
        answer: `If the pet stays at a kennel before or after the flight, yes. Keep boarding vaccines next to the titer file.`,
      },
      {
        question: `Can a sitter handoff use my ${entry.city.name} travel packet?`,
        answer: `Share a read-only link. A ${entry.city.name} sitter who takes the pet to a final check needs the same PDFs.`,
      },
    ],
  }),
  'puppy-class-vaccine-proof': (entry) => ({
    lead: `Puppy class intake in ${entry.city.name}: which DA2PP dates trainers actually accept.`,
    overview: `Trainers in ${entry.city.name} want proof the puppy started core vaccines, not a finished adult series. Socialization still matters. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} just changes whether class is indoors. ${entry.city.facilityNote} Keep early DA2PP dates, deworming, and a growing boarding vaccines folder in one digital passport so class, daycare, and future kennels share a timeline.`,
    checklist: [
      'First DA2PP/DHPP date',
      'Deworming log if the school asks',
      'Rabies if the puppy is old enough under local rules',
      'Fecal if required',
      'A PDF the trainer can open at the door',
      'Heartworm prevention start date when due',
      'Clinic name and next booster due date',
      'Microchip registration when implanted',
    ],
    steps: [
      { title: 'Do not skip class waiting for every booster', detail: `Bring the started-series proof. Ask the ${entry.city.name} trainer for the written rule.` },
      { title: 'Update after each visit', detail: 'Week 12 shots should replace week 8 in the same folder.' },
      { title: 'Keep a timeline', detail: `Build the ${entry.city.name} puppy vault early so boarding vaccines are ready later.` },
      { title: 'Share with family and sitters', detail: `A sitter handoff for a young puppy needs the same vaccine dates the trainer saw.` },
    ],
    localNote: `${entry.city.facilityNote} Class rooms in ${entry.city.name} still care about started-series proof. Climate for indoor vs outdoor sessions: ${entry.city.climateNote}. Keep the heartworm tracker adjacent once monthly prevention starts.`,
    ctaTitle: `Show ${entry.city.name} puppy class proof`,
    ctaBody: `Keep ${entry.city.name} puppy class vaccine proof in PetClues so trainers, sitters, and future boarding vaccines share one timeline.`,
    faqs: [
      {
        question: `Can my puppy attend class in ${entry.city.name} before all shots?`,
        answer: `Many ${entry.city.name} trainers accept a started core series plus clean classmates. Confirm in writing. Store the certificates you already have.`,
      },
      {
        question: `What if a ${entry.city.name} school wants a titer?`,
        answer: `Unusual for puppies. If a ${entry.city.name} school asks, get the requirement in writing before you pay for a lab.`,
      },
      {
        question: `When do boarding vaccines matter for a ${entry.city.name} puppy?`,
        answer: `As soon as you book daycare or overnight care. Start the digital passport now so the kennel packet is not empty.`,
      },
      {
        question: `Should a sitter handoff include puppy vaccines in ${entry.city.name}?`,
        answer: `Yes. Sitters and trainers both need the current DA2PP dates. Share one ${entry.city.name} vault link.`,
      },
    ],
  }),
  'airline-pet-health-certificate': (entry) => ({
    lead: `Airline health-certificate timing for pets flying out of ${entry.city.name}: 10-day windows, APHIS, and the PDFs that miss the flight.`,
    overview: `Airlines and USDA-endorsed exams run on a short clock. ${entry.city.name} flyers lose money when the certificate is in a portal they cannot open at the counter. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} also changes crate and heat or cold rules. ${entry.city.facilityNote} Keep the exam, rabies, chip scan, and boarding vaccines history in one digital passport so airline staff and a kennel before the flight read the same dates.`,
    checklist: [
      'Exam inside the airline window (often 10 days)',
      'Rabies certificate',
      'Microchip scan that matches paperwork',
      'Breed-specific airline restrictions checked',
      'Crate photos and weight',
      'APHIS endorsement PDF when required',
      'Heartworm and flea prevention dates if asked',
      'Backup kennel packet if the flight delays',
    ],
    steps: [
      { title: 'Book the exam after the ticket, not before', detail: 'Too early and it expires. Too late and you miss endorsement.' },
      { title: 'Save every PDF the same hour', detail: `APHIS endorsements are easy to lose in email. Put them in the ${entry.city.name} vault immediately.` },
      { title: 'Carry digital and paper', detail: `Counter staff at ${entry.city.name} airports still ask for a printout.` },
      { title: 'Prep a delay plan', detail: `If the flight slips, a sitter handoff or kennel needs boarding vaccines ready without rebuilding the file.` },
    ],
    localNote: `Flying out of ${entry.city.name} means heat, cold, or humidity rules collide with airline windows. Climate: ${entry.city.climateNote}. ${entry.city.facilityNote} Keep the health cert beside boarding vaccines so a delay does not strand you without a kennel packet.`,
    ctaTitle: `Pack the ${entry.city.name} flight file`,
    ctaBody: `Pack the ${entry.city.name} airline health certificate and vaccine PDFs in PetClues so the counter and any backup kennel share one digital passport.`,
    faqs: [
      {
        question: `How many days before a flight from ${entry.city.name} is a health certificate valid?`,
        answer: `Often 10 days for domestic airline exams. International rules differ. Confirm with the airline and store the dated PDF for ${entry.city.name} travel.`,
      },
      {
        question: `Do I need USDA endorsement leaving ${entry.city.name}?`,
        answer: `For many international trips, yes. Domestic usually no. Keep both the exam and any endorsement in a ${entry.city.name} digital passport.`,
      },
      {
        question: `What if my ${entry.city.name} flight is delayed overnight?`,
        answer: `You may need boarding. Keep boarding vaccines next to the airline file so a ${entry.city.name} kennel can intake without delay.`,
      },
      {
        question: `Can a sitter handoff use my ${entry.city.name} flight packet?`,
        answer: `Yes. Share a read-only link so a ${entry.city.name} sitter can show the same PDFs at the airport or clinic.`,
      },
    ],
  }),
  'lost-pet-qr-id': (entry) => ({
    lead: `A lost-pet QR and microchip packet for ${entry.city.name}: what a finder can open without calling you 40 times.`,
    overview: `Finders in ${entry.city.name} will scan a tag before they drive to a shelter. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} means more off-leash parks, heat, or snow that separate pets from owners. ${entry.city.facilityNote} The lead magnet is an emergency profile that shows meds and a phone number. Pair the QR with chip registration and a digital passport that also holds boarding vaccines if a finder ends up at a clinic.`,
    checklist: [
      'Microchip registered to a live phone number',
      'Collar QR that opens a public emergency page',
      'Recent photo',
      'Meds and conditions a finder should know',
      'Your vet and a backup contact',
      'Rabies certificate available to a clinic that scans the chip',
      'Heartworm or seizure notes if they change first aid',
      'Secondary contact who answers when you cannot',
    ],
    steps: [
      { title: 'Register the chip', detail: `An unregistered chip is jewelry. Update the ${entry.city.name} phone number when you move.` },
      { title: 'Put a QR on the collar', detail: `PetClues public profiles are built for ${entry.city.name} finders with a phone.` },
      { title: 'Keep meds current', detail: 'Seizure and diabetes notes change what a finder should do.' },
      { title: 'Link the full vault privately', detail: `Keep boarding vaccines and the sitter handoff behind login; the public QR only needs what a finder must see.` },
    ],
    localNote: `Lost-pet risk in ${entry.city.name} tracks local life: ${entry.city.climateNote}. ${entry.city.facilityNote} A QR plus chip beats a name tag alone when a finder reaches a clinic desk.`,
    ctaTitle: `Make a ${entry.city.name} lost-pet QR`,
    ctaBody: `Make a ${entry.city.name} lost-pet QR in PetClues so finders see your phone while your digital passport keeps meds and vaccines ready for clinic intake.`,
    faqs: [
      {
        question: `Is a microchip enough in ${entry.city.name}?`,
        answer: `It helps at a ${entry.city.name} clinic or shelter. A QR on the collar helps the neighbor who finds your dog at 9 p.m.`,
      },
      {
        question: `What should a public lost-pet page show in ${entry.city.name}?`,
        answer: `Your phone, meds that matter, and a photo. Not your home address. Keep full boarding vaccines in the private vault.`,
      },
      {
        question: `Should sitters in ${entry.city.name} know about the QR?`,
        answer: `Yes. A sitter handoff should include how the QR works and which phone rings first in ${entry.city.name}.`,
      },
      {
        question: `Do ${entry.city.name} finders need vaccine records?`,
        answer: `Finders need your phone first. Clinics that scan the chip may ask for rabies. Keep the digital passport ready.`,
      },
    ],
  }),
  'new-puppy-health-folder': (entry) => ({
    lead: `A first-90-days health folder for puppies in ${entry.city.name}: vaccines, deworming, and the receipts you will need at boarding.`,
    overview: `New puppy chaos in ${entry.city.name} is a stack of clinic printouts. ${entry.city.facilityNote} Start the vault before the second vaccine visit. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} changes parasite pressure and outdoor timing, so deworming and a heartworm tracker belong next to DA2PP dates. Build boarding vaccines into the folder early so daycare intake is not a surprise at week 16.`,
    checklist: [
      'DA2PP dates',
      'Deworming and fecal',
      'Rabies when due',
      'Breeder or rescue medical handoff',
      'Microchip registration',
      'Heartworm prevention start date',
      'Diet and treat rules for sitters',
      'Clinic phone and next booster reminder',
    ],
    steps: [
      { title: 'Photograph the first visit packet', detail: `Same day in ${entry.city.name}. Portals lag.` },
      { title: 'Set booster reminders', detail: 'The 16-week visit is the one people miss.' },
      { title: 'Add boarding fields early', detail: `Kennels in ${entry.city.name} will ask for boarding vaccines before you feel ready.` },
      { title: 'Prep a sitter handoff', detail: 'Family helpers need the same feeding and vaccine timeline without a group chat dump.' },
    ],
    localNote: `${entry.city.facilityNote} Puppy households in ${entry.city.name} also deal with ${entry.city.climateNote}. Keep parasite dates and the heartworm tracker beside vaccines so the folder stays useful past the first month.`,
    ctaTitle: `Start a ${entry.city.name} puppy folder`,
    ctaBody: `Start a ${entry.city.name} puppy health folder in PetClues so vaccines, heartworm dates, and future boarding vaccines live in one digital passport.`,
    faqs: [
      {
        question: `What goes in a puppy health folder in ${entry.city.name}?`,
        answer: `Vaccines, deworming, chip, diet, and the clinic that knows the puppy. PetClues is that folder with reminders for ${entry.city.name} households.`,
      },
      {
        question: `When do I add rabies for a ${entry.city.name} puppy?`,
        answer: `When your veterinarian and local law say so, often around 12-16 weeks. Store the certificate immediately in the ${entry.city.name} vault.`,
      },
      {
        question: `When can a ${entry.city.name} puppy start boarding?`,
        answer: `When the kennel policy and vaccine series line up. Keep boarding vaccines ready before you book.`,
      },
      {
        question: `How do I set up a sitter handoff for a ${entry.city.name} puppy?`,
        answer: `Share a read-only link with meds, feeding, and vaccine dates. Sitters should not rely on texts alone in ${entry.city.name}.`,
      },
    ],
  }),
  'new-kitten-health-folder': (entry) => ({
    lead: `A first-90-days kitten folder for ${entry.city.name}: FVRCP, fecal, FeLV/FIV testing, and rabies timing.`,
    overview: `Kitten paperwork in ${entry.city.name} disappears between the first two visits. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} Outdoor access decisions also belong in the same file as vaccines. ${entry.city.facilityNote} Save lab PDFs, FVRCP dates, and a future boarding vaccines list in one digital passport so cattery intake and a sitter handoff are not rebuilt from memory.`,
    checklist: [
      'FVRCP series',
      'Fecal and deworming',
      'FeLV/FIV test PDF',
      'Rabies when due',
      'Diet and litter notes for sitters',
      'Microchip registration',
      'Indoor vs outdoor policy in writing',
      'Emergency clinic phone for this metro',
    ],
    steps: [
      { title: 'Save lab PDFs, not just verbal negatives', detail: `FeLV/FIV results get lost between ${entry.city.name} visits.` },
      { title: 'Track FVRCP intervals', detail: 'Kittens need a series, not one shot.' },
      { title: 'Decide indoor policy in writing', detail: 'Sitters should not freelance outdoor time.' },
      { title: 'Add boarding fields early', detail: `Catteries in ${entry.city.name} will ask for boarding vaccines before you expect it.` },
    ],
    localNote: `Climate and lifestyle for ${entry.city.name} kittens: ${entry.city.climateNote}. ${entry.city.facilityNote} Keep FeLV results next to FVRCP so the folder answers desk questions without a clinic callback.`,
    ctaTitle: `Start a ${entry.city.name} kitten folder`,
    ctaBody: `Start a ${entry.city.name} kitten folder in PetClues so FVRCP, labs, and boarding vaccines stay in one digital passport for sitters and catteries.`,
    faqs: [
      {
        question: `What vaccines does a kitten in ${entry.city.name} need?`,
        answer: `FVRCP series and rabies per local law. FeLV depends on lifestyle. Store every result in one ${entry.city.name} profile.`,
      },
      {
        question: `When can a kitten be boarded in ${entry.city.name}?`,
        answer: `When the cattery policy and the vaccine series line up. Keep boarding vaccines PDFs ready for ${entry.city.name} intake.`,
      },
      {
        question: `What belongs in a kitten sitter handoff in ${entry.city.name}?`,
        answer: `Diet, litter, meds, indoor rules, and vaccine dates. Share a read-only link so the ${entry.city.name} sitter is not guessing.`,
      },
      {
        question: `Do ${entry.city.name} catteries want FeLV proof?`,
        answer: `Many do for group housing. Keep the lab PDF in the digital passport next to FVRCP.`,
      },
    ],
  }),
  'senior-dog-medication-log': (entry) => ({
    lead: `A senior medication log for dogs in ${entry.city.name}: NSAIDs, thyroid, heart, and kidney meds with last-dose times.`,
    overview: `Senior dogs in ${entry.city.name} often take more than one daily drug. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} changes how NSAIDs and heat or ice interact. ${entry.city.facilityNote} An ER kit without last-dose time is incomplete, and boarding vaccines alone will not save a kennel from a missed NSAID. Pair the med log with a heartworm tracker and a sitter handoff that shows exact times.`,
    checklist: [
      'Drug name, mg, and time',
      'Food vs empty stomach',
      'Last bloodwork date',
      'NSAID and steroid warnings',
      'Pharmacy and prescribing clinic',
      'Heartworm and flea prevention dates',
      'Vaccine PDFs for boarding or daycare',
      'Emergency contact and permission to treat',
    ],
    steps: [
      { title: 'Log doses the same day', detail: `Missed NSAIDs and double doses both show up at 2 a.m. in ${entry.city.name}.` },
      { title: 'Attach the last chemistry panel', detail: 'Kidney values change what the ER can give.' },
      { title: 'Share with the sitter', detail: `A sitter handoff in ${entry.city.name} needs last-dose times, not just bottle photos.` },
      { title: 'Keep boarding vaccines current', detail: `Kennels still bounce expired Bordetella even when the med log is perfect.` },
    ],
    localNote: `Senior care in ${entry.city.name} tracks weather risk: ${entry.city.climateNote}. ${entry.city.facilityNote} Keep the med log, heartworm tracker, and boarding vaccines in one vault so ER and kennel desks are not different folders.`,
    ctaTitle: `Keep ${entry.city.name} senior meds in one log`,
    ctaBody: `Keep ${entry.city.name} senior meds, labs, and boarding vaccines in one PetClues log so sitters and ERs see last-dose times.`,
    faqs: [
      {
        question: `What should a senior dog medication log include in ${entry.city.name}?`,
        answer: `Name, dose, time, with-food flag, and the last lab date. Photos of the bottles help ${entry.city.name} sitters.`,
      },
      {
        question: `Do I still need vaccine records for a senior dog in ${entry.city.name}?`,
        answer: `Yes for boarding. Meds are the ER priority. Keep boarding vaccines in the same ${entry.city.name} vault.`,
      },
      {
        question: `How do I hand off senior meds to a sitter in ${entry.city.name}?`,
        answer: `Use a sitter handoff link with last-dose times and warnings. Do not leave it as a sticky note on the fridge alone.`,
      },
      {
        question: `Where does a heartworm tracker fit for seniors in ${entry.city.name}?`,
        answer: `On the same schedule as daily drugs. Monthly pills get missed when they are not next to the NSAID log in ${entry.city.name}.`,
      },
    ],
  }),
  'multi-pet-household-records': (entry) => ({
    lead: `One household vault for every dog and cat in ${entry.city.name}: vaccines, meds, and who is due next.`,
    overview: `Multi-pet homes in ${entry.city.name} mix species and clinics. ${entry.city.facilityNote} One shared calendar stops the cat from missing FVRCP while the dog is current. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} also means staggered parasite pressure across animals. Use separate profiles, one digital passport per pet, and a shared sitter handoff so boarding vaccines do not get applied to the wrong animal.`,
    checklist: [
      'Profile per animal',
      'Shared sitter packet',
      'Staggered vaccine reminders',
      'Species-specific boarding lists',
      'One emergency contact card',
      'Heartworm tracker per dog',
      'Collar QR per pet',
      'Clinic list with which pet uses which hospital',
    ],
    steps: [
      { title: 'Split profiles, share the household', detail: `Do not keep three camera rolls for ${entry.city.name} pets.` },
      { title: 'Color-code due dates', detail: 'The next missed Bordetella is usually the second dog.' },
      { title: 'One QR per collar', detail: `Finders in ${entry.city.name} should not guess which pet is which.` },
      { title: 'Build one sitter handoff', detail: 'Sitters need per-pet meds and which boarding vaccines belong to which animal.' },
    ],
    localNote: `${entry.city.facilityNote} Multi-pet life in ${entry.city.name} also means ${entry.city.climateNote}. Keep heartworm trackers and boarding vaccines on the correct profile so a desk never vaccinates the wrong name.`,
    ctaTitle: `Run a ${entry.city.name} multi-pet vault`,
    ctaBody: `Run a ${entry.city.name} multi-pet vault in PetClues so each animal has boarding vaccines, meds, and a sitter handoff without mix-ups.`,
    faqs: [
      {
        question: `Can I store dogs and cats together in ${entry.city.name}?`,
        answer: `Yes, as separate profiles in one ${entry.city.name} household. Sitters still need per-pet meds.`,
      },
      {
        question: `How do I handle different clinics in ${entry.city.name}?`,
        answer: `Upload each PDF to the right pet. PetClues does not care which ${entry.city.name} clinic portal it came from.`,
      },
      {
        question: `How should boarding vaccines work in a ${entry.city.name} multi-pet home?`,
        answer: `One packet per animal. Shared folders without names are how ${entry.city.name} desks mix certificates.`,
      },
      {
        question: `What belongs in a multi-pet sitter handoff in ${entry.city.name}?`,
        answer: `Per-pet meds, feeding, ER phones, and which digital passport link opens which animal.`,
      },
    ],
  }),
  'groomer-vaccine-proof': (entry) => ({
    lead: `Groomer intake in ${entry.city.name}: rabies proof and the extras salons now ask for.`,
    overview: `${entry.city.facilityNote} Groomers in ${entry.city.name} are not boarding, but rabies is still the usual gate. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} plus a dryer is a medical issue for brachycephalic and senior dogs. A digital passport that opens in the lobby is the whole job. Keep boarding vaccines nearby if the salon shares a building with daycare.`,
    checklist: [
      'Rabies certificate',
      'DHPP if the salon asks',
      'Flea prevention date',
      'Behavior notes (muzzle, mats, heart disease)',
      'Emergency contact',
      'Heat or airway risk note for dryer time',
      'Heart disease or seizure meds list',
      'Digital PDF that opens offline in the lobby',
    ],
    steps: [
      { title: 'Ask the salon list once', detail: `Save it on the ${entry.city.name} profile. Do not rediscover it at drop-off.` },
      { title: 'Keep rabies at the top of the profile', detail: 'That is the document they want.' },
      { title: 'Add heart and airway notes', detail: `Heat in ${entry.city.name} plus a dryer is a medical issue for some breeds.` },
      { title: 'Reuse the vault for daycare', detail: `If the salon books boarding or play, the same boarding vaccines packet should already be ready.` },
    ],
    localNote: `Groomer desks in ${entry.city.name} still start with rabies. Climate risk: ${entry.city.climateNote}. ${entry.city.facilityNote} Put flea dates and airway notes next to the certificate so intake is one open.`,
    ctaTitle: `Show ${entry.city.name} groomer proof`,
    ctaBody: `Show ${entry.city.name} groomer vaccine proof from PetClues so the lobby, daycare, and sitter handoff share one digital passport.`,
    faqs: [
      {
        question: `Do ${entry.city.name} groomers require rabies?`,
        answer: `Most ${entry.city.name} salons do. Some also want DHPP. Keep the PDFs on your phone.`,
      },
      {
        question: `What if the certificate is expired by a week in ${entry.city.name}?`,
        answer: `Expect a no. Book the booster, store the new PDF, then rebook the ${entry.city.name} groom.`,
      },
      {
        question: `Do ${entry.city.name} groomers want full boarding vaccines?`,
        answer: `Usually rabies is enough. If the salon is attached to daycare, expect Bordetella and DHPP too.`,
      },
      {
        question: `Should a sitter handoff include groomer notes in ${entry.city.name}?`,
        answer: `Yes if the sitter drops off. Include muzzle, meds, and the digital passport link for ${entry.city.name} salon staff.`,
      },
    ],
  }),
  'dog-park-vaccine-rules': (entry) => ({
    lead: `Public dog-park vaccine expectations in ${entry.city.name}: rabies, DHPP, and what a ranger or volunteer may ask.`,
    overview: `Off-leash parks in ${entry.city.name} vary by city ordinance. Rabies is the usual legal floor. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} also drives leptospirosis and parasite conversations. ${entry.city.facilityNote} Carry a digital passport with rabies and DHPP even if no one checks daily, and keep boarding vaccines ready if a park injury ends at daycare or a kennel hold.`,
    checklist: [
      'Rabies certificate',
      'DHPP dates',
      'License if the city requires it',
      'Leash rules screenshot',
      'Emergency profile on a collar QR',
      'Heartworm prevention date',
      'Recent photo for lost-pet posts',
      'Backup contact who can open the vault',
    ],
    steps: [
      { title: 'Carry digital rabies', detail: `A volunteer ask in ${entry.city.name} should not end the visit.` },
      { title: 'Keep the license current', detail: `${entry.city.name} clerks and park signs may both mention it.` },
      { title: 'Add a QR', detail: `Parks are where dogs get lost in ${entry.city.name}.` },
      { title: 'Mirror the daycare packet', detail: 'If your dog also does group play, boarding vaccines should already be in the same vault.' },
    ],
    localNote: `Park rules in ${entry.city.name} sit on top of climate risk: ${entry.city.climateNote}. ${entry.city.facilityNote} Keep rabies, license, and a heartworm tracker date together so a ranger ask or a clinic visit is one open.`,
    ctaTitle: `Carry ${entry.city.name} park-ready records`,
    ctaBody: `Carry ${entry.city.name} park-ready rabies and DHPP records in PetClues so a QR, license check, and boarding vaccines stay in one digital passport.`,
    faqs: [
      {
        question: `Does ${entry.city.name} require vaccines at dog parks?`,
        answer: `Rabies is commonly required by ordinance even if no one checks daily in ${entry.city.name}. DHPP is wise for group play. Store both.`,
      },
      {
        question: `Is Bordetella required at ${entry.city.name} dog parks?`,
        answer: `Rarely by ordinance. Daycare yes, parks usually no. Still useful if your dog plays hard in ${entry.city.name}.`,
      },
      {
        question: `Should I bring boarding vaccines proof to a ${entry.city.name} park?`,
        answer: `Not usually. Keep them in the same digital passport in case a park injury leads to boarding or daycare.`,
      },
      {
        question: `What if a sitter takes my dog to a ${entry.city.name} park?`,
        answer: `Include park rules and the QR in the sitter handoff. Sitters need the same rabies PDF you would show.`,
      },
    ],
  }),
  'foster-intake-records': (entry) => ({
    lead: `Foster intake paperwork for ${entry.city.name} rescue homes: vaccines, tests, and the meds that arrive in a grocery bag.`,
    overview: `Fosters in ${entry.city.name} inherit incomplete histories. ${entry.city.facilityNote} A structured intake folder is how you avoid giving the wrong dewormer twice. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} raises parasite and heartworm pressure that belongs on day-one paperwork. Photograph everything at pickup, then build a digital passport that can become boarding vaccines proof or an adopter sitter handoff later.`,
    checklist: [
      'Rescue ID and chip number',
      'Vaccines already given',
      'Test results (Heartworm, FeLV/FIV)',
      'Current meds and last dose',
      'Quarantine and isolation notes',
      'Deworming dates already administered',
      'Behavior and bite-history notes if known',
      'Coordinator phone and clinic used by the rescue',
    ],
    steps: [
      { title: 'Photograph everything at pickup', detail: `Bags get lost in the car between the ${entry.city.name} rescue and home.` },
      { title: 'Create a PetClues profile the same night', detail: 'Reminders start immediately.' },
      { title: 'Share with the rescue coordinator', detail: 'One link beats a group-chat photo dump.' },
      { title: 'Prepare adopter handoff fields', detail: `Boarding vaccines and a sitter handoff should travel with the pet when they leave ${entry.city.name} foster care.` },
    ],
    localNote: `${entry.city.facilityNote} Foster homes in ${entry.city.name} also manage ${entry.city.climateNote}. Keep heartworm test results and a heartworm tracker start date next to vaccines so intake is not rebuilt from memory.`,
    ctaTitle: `Run ${entry.city.name} foster records cleanly`,
    ctaBody: `Run ${entry.city.name} foster intake in PetClues so vaccines, tests, and a future sitter handoff live in one digital passport.`,
    faqs: [
      {
        question: `What if a ${entry.city.name} foster has no vaccine history?`,
        answer: `Start a new dated record with the first clinic visit in ${entry.city.name}. Do not invent old dates. PetClues can still hold the new timeline.`,
      },
      {
        question: `Can adopters get the ${entry.city.name} foster file?`,
        answer: `Yes. Export or share the profile so the next home in or near ${entry.city.name} does not start from zero.`,
      },
      {
        question: `When do boarding vaccines matter for a ${entry.city.name} foster?`,
        answer: `As soon as the rescue books daycare or overnight care. Keep boarding vaccines on the foster profile from day one.`,
      },
      {
        question: `How do I set up a sitter handoff for a ${entry.city.name} foster?`,
        answer: `Share a read-only link with meds, quarantine rules, and vaccine dates. Sitters should not rely on rescue group chat alone.`,
      },
    ],
  }),
  'moving-with-pets-documents': (entry) => ({
    lead: `A moving packet for pets leaving or arriving in ${entry.city.name}: health certificates, vaccines, and county licensing.`,
    overview: `Relocating through ${entry.city.name} mixes ${entry.city.state} licensing with airline or highway rules. ${entry.city.facilityNote} ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} changes crate, heat, and storm timing on move week. Update the chip address, bundle boarding vaccines by pet, and keep a sitter handoff ready if movers run late and someone else does the first night.`,
    checklist: [
      'Rabies and core vaccines',
      'Health certificate if flying or crossing certain borders',
      'Microchip registration with a new address',
      'Prescriptions that will run out during the move',
      'County license steps at the destination',
      'Heartworm prevention supply for the travel week',
      'New ER phone for the destination neighborhood',
      'Sitter or boarding backup packet',
    ],
    steps: [
      { title: 'Update the chip address before the truck', detail: 'Finders should not call the old landline.' },
      { title: 'Bundle PDFs by pet', detail: `Movers and airlines do not want a zip of 80 files. One digital passport per ${entry.city.name} pet.` },
      { title: 'Add the new ER', detail: `Look up after-hours care in the new ${entry.city.name} neighborhood before you need it.` },
      { title: 'Prep boarding or sitter backup', detail: 'If the closing slips, boarding vaccines and a sitter handoff should already be in the vault.' },
    ],
    localNote: `Move week in ${entry.city.name} collides with climate timing: ${entry.city.climateNote}. ${entry.city.facilityNote} Keep licensing, health certs, and boarding vaccines in one folder so county clerks and kennels are not separate scavenger hunts.`,
    ctaTitle: `Pack the ${entry.city.name} pet move file`,
    ctaBody: `Pack the ${entry.city.name} pet move file in PetClues so licensing, boarding vaccines, and a backup sitter handoff stay in one digital passport.`,
    faqs: [
      {
        question: `Do I need a health certificate to move through ${entry.city.name}?`,
        answer: `Driving often no. Flying and some destinations yes. Confirm, then store the dated exam in the ${entry.city.name} vault.`,
      },
      {
        question: `How soon should I license a pet in ${entry.city.name}?`,
        answer: `Check city or county rules. Have the rabies PDF ready. PetClues keeps that certificate findable for ${entry.city.name} clerks.`,
      },
      {
        question: `Should boarding vaccines be ready during a ${entry.city.name} move?`,
        answer: `Yes. Delays happen. A kennel packet ready for ${entry.city.name} intake beats rebuilding PDFs on moving day.`,
      },
      {
        question: `What belongs in a move-week sitter handoff in ${entry.city.name}?`,
        answer: `Meds, feeding, new ER phone, and vault links. Sitters covering the first night need the same digital passport you would use.`,
      },
    ],
  }),
  'pet-insurance-claim-packet': (entry) => ({
    lead: `An insurance claim packet for ${entry.city.name} clinics: invoices, records, and the timeline that speeds reimbursement.`,
    overview: `Claims stall when invoices and medical notes live in different inboxes. ${entry.city.name} clinics will not rebuild your file for the insurer. ${entry.city.facilityNote} ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} often drives the ER visits that start claims in the first place. Keep invoices, discharge notes, vaccine history, and a heartworm tracker timeline in one digital passport so wellness riders and illness claims pull from the same vault.`,
    checklist: [
      'Itemized invoice',
      'Medical notes or discharge summary',
      'Diagnosis codes if provided',
      'Vaccine and prior-condition timeline',
      'Policy number and claim portal login hint stored privately',
      'Lab and imaging PDFs from the same visit',
      'Heartworm and wellness dates if the rider asks',
      'Photos of the pet matching the claim if requested',
    ],
    steps: [
      { title: 'Upload the invoice the day you pay', detail: `${entry.city.name} portal downloads expire. Save them the same hour.` },
      { title: 'Attach the matching visit notes', detail: 'Insurers want the story, not just the total.' },
      { title: 'Keep a condition timeline', detail: 'Pre-existing fights are won with dates.' },
      { title: 'Reuse the vault for boarding', detail: `Boarding vaccines and claim PDFs can live in the same ${entry.city.name} digital passport without mixing pets.` },
    ],
    localNote: `${entry.city.name} multi-clinic households should still use one vault so claims do not mix pets. ${entry.city.facilityNote} Climate-driven ER spikes (${entry.city.climateNote}) are why invoice day is the wrong day to start organizing.`,
    ctaTitle: `File ${entry.city.name} claims from one folder`,
    ctaBody: `File ${entry.city.name} pet insurance claims from one PetClues folder so invoices, notes, and vaccine timelines stay with your digital passport.`,
    faqs: [
      {
        question: `What documents do pet insurers want in ${entry.city.name}?`,
        answer: `Itemized invoices and medical records from ${entry.city.name} clinics. Vaccine history helps for wellness riders. Store PDFs as they arrive.`,
      },
      {
        question: `Can PetClues submit a claim for a ${entry.city.name} visit?`,
        answer: `You still submit to the insurer. PetClues keeps the ${entry.city.name} packet complete so you are not hunting files at midnight.`,
      },
      {
        question: `Do boarding vaccines help an insurance claim in ${entry.city.name}?`,
        answer: `They help wellness riders and prove continuity of care. Keep boarding vaccines next to invoices in the same vault.`,
      },
      {
        question: `Should a sitter handoff include claim documents in ${entry.city.name}?`,
        answer: `Sitters need meds and ER phones, not your policy number. Keep claims private; share only the medical sitter handoff link.`,
      },
    ],
  }),
  'after-hours-emergency-card': (entry) => ({
    lead: `A night-stand emergency card for ${entry.city.name}: ER phone, meds, and a QR a roommate can scan.`,
    overview: `After-hours care in ${entry.city.name} is a driving decision, not a Google surprise. ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} Put the clinic name, meds, and your phone on one card plus a digital profile. ${entry.city.facilityNote} Roomates and sitters need the same card. Keep boarding vaccines in the vault too, but last-dose times and the ER phone are what matter at 2 a.m.`,
    checklist: [
      'After-hours ER name and phone',
      'Regular clinic phone',
      'Meds and last dose',
      'Allergies',
      'QR to a public emergency profile',
      'Permission to treat note',
      'Backup contact who answers',
      'Route note from home to the ER',
    ],
    steps: [
      { title: 'Pick the ER before you need it', detail: `Drive the route from home in ${entry.city.name} once.` },
      { title: 'Print a card and keep a digital twin', detail: 'Phones die. Paper gets lost. Use both.' },
      { title: 'Update meds when they change', detail: 'A stale card is a dangerous card.' },
      { title: 'Brief sitters and roommates', detail: `A sitter handoff in ${entry.city.name} should include the same ER card and QR.` },
    ],
    localNote: `Night emergencies in ${entry.city.name} track local weather and traffic: ${entry.city.climateNote}. ${entry.city.facilityNote} Keep the card, QR, and full digital passport (including boarding vaccines) aligned so whoever is home can act.`,
    ctaTitle: `Make a ${entry.city.name} night ER card`,
    ctaBody: `Make a ${entry.city.name} night ER card in PetClues so roommates and sitters open the same digital passport with meds and clinic phones.`,
    faqs: [
      {
        question: `What is the after-hours vet in ${entry.city.name}?`,
        answer: `It depends on your neighborhood. Choose one, save the phone, and put it on the pet profile before 2 a.m. in ${entry.city.name}.`,
      },
      {
        question: `Should roommates see the ${entry.city.name} emergency card?`,
        answer: `Yes. A QR plus a fridge printout is how someone else can act in ${entry.city.name} if you are not home.`,
      },
      {
        question: `Does a ${entry.city.name} ER card need boarding vaccines?`,
        answer: `Not for triage. Keep boarding vaccines in the vault anyway so daytime kennel intake is ready after the crisis.`,
      },
      {
        question: `How does a sitter handoff use the ${entry.city.name} ER card?`,
        answer: `Share the same QR and med list. Sitters should not invent a clinic at 1 a.m. in ${entry.city.name}.`,
      },
    ],
  }),
};


export function getResourcePageContent(entry: ResourceMatrixEntry): ResourcePageContent {
  const builder = BUILDERS[entry.topic.slug] ?? BUILDERS['dog-boarding-vaccine-requirements'];
  const rest = expandResourceBuilder(entry, builder(entry));
  return {
    title: titleFor(entry),
    ...rest,
    heroImage: RESOURCE_HERO[entry.topic.slug] ?? '/images/blog/blog-pet-records.webp',
    uniqueParagraphs: uniqueResourceParagraphs(entry),
    library: libraryLinksForResource(entry.city.slug, entry.topic.slug),
  };
}
