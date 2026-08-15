import type { ResourceMatrixEntry } from './resourceMatrix';

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
};

function titleFor(entry: ResourceMatrixEntry): string {
  return `${entry.topic.label} in ${entry.city.name}, ${entry.city.stateAbbr}`;
}

function vaultLine(cityName: string): string {
  return `Keep the ${cityName} packet in one PetClues vault so boarding, sitters, and the ER read the same dates.`;
}

const BUILDERS: Record<string, (entry: ResourceMatrixEntry) => Omit<ResourcePageContent, 'title'>> = {
  'dog-boarding-vaccine-requirements': (entry) => ({
    lead: `What ${entry.city.name} dog boarding desks usually want on file before drop-off, and how to keep those certificates ready on your phone.`,
    overview: `${entry.city.facilityNote} ${entry.city.climateNote.slice(0, 1).toUpperCase()}${entry.city.climateNote.slice(1)} changes how often Bordetella and parasite notes get asked. This page is a lead-gen checklist for ${entry.city.name}, ${entry.city.state} households that keep getting turned away at intake because a PDF is on a different phone.`,
    checklist: [
      'Rabies certificate with clinic, lot, and expiration',
      'DHPP or DA2PP dates that match the dog in front of the desk',
      'Bordetella (intranasal or injectable) if group play is booked',
      'Fecal or parasite prevention dates if the kennel asks',
      'Microchip number that matches the rabies record',
    ],
    steps: [
      { title: 'Photograph every certificate the day it is issued', detail: `Full page, no glare. Store it on the ${entry.city.name} pet profile, not in camera roll chaos.` },
      { title: 'Build a one-screen boarding packet', detail: 'Vaccines, meds, feeding, and the emergency vet phone for this metro.' },
      { title: 'Share a read-only link', detail: 'Front-desk staff should not need your iCloud password.' },
    ],
    localNote: entry.city.facilityNote,
    ctaTitle: `Save ${entry.city.name} boarding proof in one vault`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `What vaccines does dog boarding in ${entry.city.name} require?`,
        answer: `Most ${entry.city.name} kennels want current rabies and DHPP. Group play usually adds Bordetella. Ask your facility for a written list, then store those exact PDFs in PetClues.`,
      },
      {
        question: 'How recent do the shots need to be?',
        answer: 'Many desks want dates within 12 months. Some accept 3-year rabies labels if the certificate is clear. Keep both the label interval and the PDF.',
      },
    ],
  }),
  'cat-boarding-vaccine-requirements': (entry) => ({
    lead: `Cattery and clinic boarding intake for cats in ${entry.city.name}: FVRCP, rabies, and the extras that stall drop-off.`,
    overview: `Cat boarding in ${entry.city.name} is less standardized than dog daycare, but FVRCP and rabies still win most arguments at the desk. ${entry.city.facilityNote} Indoor-only cats are not exempt when a cattery requires proof.`,
    checklist: [
      'FVRCP series or adult booster PDF',
      'Rabies certificate that matches the cat',
      'FeLV status if the cattery houses mixed-testing cats',
      'Medication and diet list for a stressed boarder',
      `Emergency clinic in ${entry.city.name} with after-hours hours`,
    ],
    steps: [
      { title: 'Confirm the cattery list in writing', detail: 'Do not guess FeLV. Screenshot the email into the vault.' },
      { title: 'Pack meds with dose times', detail: 'Thyroid and kidney meds are the usual miss.' },
      { title: 'Leave a digital packet', detail: vaultLine(entry.city.name) },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Keep ${entry.city.name} cat boarding records ready`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `Do indoor cats in ${entry.city.name} still need boarding vaccines?`,
        answer: `If the cattery requires them, yes. Indoor status does not override facility policy. Store FVRCP and rabies PDFs before you book.`,
      },
      {
        question: 'What about FeLV?',
        answer: 'Some catteries require a recent negative test for group housing. Keep the lab PDF next to the vaccine file.',
      },
    ],
  }),
  'dog-daycare-shot-records': (entry) => ({
    lead: `Daycare playgroup intake in ${entry.city.name}: the shot record packet that gets a dog onto the floor instead of sitting in a crate.`,
    overview: `${entry.city.facilityNote} Daycare is stricter than overnight boarding because of nose-to-nose contact. ${entry.city.climateNote} is why influenza and fecal asks show up more in some seasons.`,
    checklist: [
      'DHPP, rabies, Bordetella',
      'Canine influenza if the daycare lists it',
      'Fecal test if required for first visit',
      'Temperament or trial-day notes',
      'Digital packet the front desk can open without an app login fight',
    ],
    steps: [
      { title: 'Ask for the written vaccine policy', detail: `Save it on the ${entry.city.name} profile so the next daycare gets the same packet.` },
      { title: 'Put fecal dates next to vaccines', detail: 'Staff look for one sheet, not five emails.' },
      { title: 'Update after every booster', detail: 'Expired Bordetella is the most common bounce.' },
    ],
    localNote: entry.city.facilityNote,
    ctaTitle: `Build a ${entry.city.name} daycare packet`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `Does ${entry.city.name} dog daycare require Bordetella?`,
        answer: 'Group play usually does. Overnight-only stays sometimes skip it. Get the policy in writing and store the matching certificate.',
      },
      {
        question: 'Can I show records on my phone?',
        answer: 'Yes if the PDFs open offline. PetClues is built for that handoff.',
      },
    ],
  }),
  'pet-sitter-medical-handoff': (entry) => ({
    lead: `A sitter packet for ${entry.city.name} households: meds, allergies, vet phone, and feeding, without a 14-text thread.`,
    overview: `Sitters in ${entry.city.name} fail when the only copy of thyroid meds lives in your head. ${entry.city.climateNote} raises heat, ice, or storm risks that belong on the same card as the pill schedule.`,
    checklist: [
      'Medication names, mg, and times',
      'Allergy and food-trial rules',
      'Regular vet and after-hours ER in this metro',
      'Behavior notes (resource guarding, escape, doorbell)',
      'Permission to treat and a payment method note',
    ],
    steps: [
      { title: 'Write the med schedule once', detail: 'AM/PM with food or empty stomach.' },
      { title: 'Pin the ER', detail: `Name the after-hours clinic you actually use in ${entry.city.name}.` },
      { title: 'Share a read-only link', detail: 'Sitters should not hunt through your camera roll.' },
    ],
    localNote: `Climate context for sitters: ${entry.city.climateNote}.`,
    ctaTitle: `Hand your ${entry.city.name} sitter a real packet`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What should a pet sitter packet include?',
        answer: 'Meds, feeding, vet phones, allergies, and how to get into the house. Photos of pills help. PetClues keeps that on one profile.',
      },
      {
        question: `Which ER should I list in ${entry.city.name}?`,
        answer: 'List the clinic you would actually drive to at 1 a.m., not the closest pin on a map you have never used.',
      },
    ],
  }),
  'emergency-vet-records-kit': (entry) => ({
    lead: `An ER intake kit for ${entry.city.name}: meds, conditions, and vaccine dates that a triage nurse can read in 30 seconds.`,
    overview: `Emergency clinics in ${entry.city.name} do not have time to reverse-engineer your email. ${entry.city.climateNote} drives heat stroke, ice injuries, or storm-related toxin calls. A one-page kit plus PDFs is the lead-gen job of this page.`,
    checklist: [
      'Current medications and last dose time',
      'Known conditions and last specialist letter',
      'Vaccine dates, especially rabies',
      'Allergies and previous anesthesia notes',
      'Your name, phone, and permission to treat',
    ],
    steps: [
      { title: 'Keep a one-screen summary', detail: 'Weight, meds, conditions, vet phone.' },
      { title: 'Attach the last two lab PDFs', detail: 'Kidney and liver values change ER drug choices.' },
      { title: 'Share from the parking lot', detail: 'A link beats a dying phone flashlight on a paper folder.' },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Build a ${entry.city.name} ER kit tonight`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What records does an emergency vet need?',
        answer: 'Meds, allergies, major diagnoses, and recent labs. Vaccine PDFs help but the medication list saves lives first.',
      },
      {
        question: 'Should I bring paper?',
        answer: 'Paper is fine. Digital that opens without cell service is better. Keep both in PetClues and a printed card.',
      },
    ],
  }),
  'rabies-certificate-copy': (entry) => ({
    lead: `How to keep a usable rabies certificate for ${entry.city.name} licensing, boarding, and bite-quarantine questions.`,
    overview: `${entry.city.state} rabies proof is a legal document, not a text message. ${entry.city.facilityNote} A blurry photo that cuts off the expiration is why people get turned away.`,
    checklist: [
      'Clinic name and veterinarian signature or stamp',
      'Lot number and expiration',
      'Pet name and description matching the license',
      'Microchip if it is printed on the certificate',
      'Tag number if the county issued one',
    ],
    steps: [
      { title: 'Scan the full certificate', detail: 'Edges included. Store the PDF on the pet profile.' },
      { title: 'Match it to the license', detail: `${entry.city.name} clerks bounce mismatches between name, breed, and chip.` },
      { title: 'Keep the booster reminder', detail: '1-year vs 3-year labels are easy to mix up.' },
    ],
    localNote: `${entry.city.state} clerks and ${entry.city.name} facilities both want a complete certificate, not a cropped screenshot.`,
    ctaTitle: `Store the ${entry.city.name} rabies PDF`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `Where do I get a rabies certificate copy in ${entry.city.name}?`,
        answer: 'Ask the clinic that gave the vaccine. Many portals expire. Save the PDF in PetClues the same day.',
      },
      {
        question: 'Is a tag enough?',
        answer: 'No. The certificate is the record. The tag is a pointer.',
      },
    ],
  }),
  'titer-records-for-travel': (entry) => ({
    lead: `FAVN and rabies titer paperwork for ${entry.city.name} households flying or driving pets across borders.`,
    overview: `Titer wait times wreck last-minute trips. If you live in ${entry.city.name}, start the packet before you book. ${entry.city.facilityNote}`,
    checklist: [
      'Microchip implanted before the titer draw',
      'Rabies vaccine certificate',
      'Approved lab result PDF (FAVN when required)',
      'ISO dates that match the passport or health cert',
      'Airline crate and health certificate timing',
    ],
    steps: [
      { title: 'Chip first, then draw', detail: 'A titer before the chip is a common expensive redo.' },
      { title: 'Archive the lab PDF', detail: 'Portals disappear. Your vault should not.' },
      { title: 'Count the waiting period', detail: 'Some destinations need months. Put the dates on a timeline.' },
    ],
    localNote: `Travel from ${entry.city.name} often routes through major hubs. Keep digital copies that a broker can open.`,
    ctaTitle: `Keep ${entry.city.name} titer PDFs in order`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What is a rabies titer for travel?',
        answer: 'A lab test showing antibody levels, often FAVN, required by some countries after rabies vaccination. It is not a substitute for the vaccine certificate.',
      },
      {
        question: 'How long does it take?',
        answer: 'Lab turnaround plus destination waiting periods. Plan in months, not days. Store every date in one timeline.',
      },
    ],
  }),
  'puppy-class-vaccine-proof': (entry) => ({
    lead: `Puppy class intake in ${entry.city.name}: which DA2PP dates trainers actually accept.`,
    overview: `Trainers in ${entry.city.name} want proof the puppy started core vaccines, not a finished adult series. Socialization still matters. ${entry.city.climateNote} just changes whether class is indoors.`,
    checklist: [
      'First DA2PP/DHPP date',
      'Deworming log if the school asks',
      'Rabies if the puppy is old enough under local rules',
      'Fecal if required',
      'A PDF the trainer can open at the door',
    ],
    steps: [
      { title: 'Do not skip class waiting for every booster', detail: 'Bring the started-series proof. Ask the trainer for the written rule.' },
      { title: 'Update after each visit', detail: 'Week 12 shots should replace week 8 in the same folder.' },
      { title: 'Keep a timeline', detail: vaultLine(entry.city.name) },
    ],
    localNote: entry.city.facilityNote,
    ctaTitle: `Show ${entry.city.name} puppy class proof`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `Can my puppy attend class in ${entry.city.name} before all shots?`,
        answer: 'Many trainers accept a started core series plus clean classmates. Confirm in writing. Store the certificates you already have.',
      },
      {
        question: 'What if the school wants a titer?',
        answer: 'Unusual for puppies. If they ask, get the requirement in writing before you pay for a lab.',
      },
    ],
  }),
  'airline-pet-health-certificate': (entry) => ({
    lead: `Airline health-certificate timing for pets flying out of ${entry.city.name}: 10-day windows, APHIS, and the PDFs that miss the flight.`,
    overview: `Airlines and USDA-endorsed exams run on a short clock. ${entry.city.name} flyers lose money when the certificate is in a portal they cannot open at the counter. ${entry.city.climateNote} also changes crate and heat or cold rules.`,
    checklist: [
      'Exam inside the airline window (often 10 days)',
      'Rabies certificate',
      'Microchip scan that matches paperwork',
      'Breed-specific airline restrictions checked',
      'Crate photos and weight',
    ],
    steps: [
      { title: 'Book the exam after the ticket, not before', detail: 'Too early and it expires. Too late and you miss endorsement.' },
      { title: 'Save every PDF the same hour', detail: 'APHIS endorsements are easy to lose in email.' },
      { title: 'Carry digital and paper', detail: `Counter staff at ${entry.city.name} airports still ask for a printout.` },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Pack the ${entry.city.name} flight file`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'How many days before a flight is a health certificate valid?',
        answer: 'Often 10 days for domestic airline exams. International rules differ. Confirm with the airline and store the dated PDF.',
      },
      {
        question: 'Do I need USDA endorsement?',
        answer: 'For many international trips, yes. Domestic usually no. Keep both the exam and any endorsement in PetClues.',
      },
    ],
  }),
  'lost-pet-qr-id': (entry) => ({
    lead: `A lost-pet QR and microchip packet for ${entry.city.name}: what a finder can open without calling you 40 times.`,
    overview: `Finders in ${entry.city.name} will scan a tag before they drive to a shelter. ${entry.city.climateNote} means more off-leash parks, heat, or snow that separate pets from owners. The lead magnet is an emergency profile that shows meds and a phone number.`,
    checklist: [
      'Microchip registered to a live phone number',
      'Collar QR that opens a public emergency page',
      'Recent photo',
      'Meds and conditions a finder should know',
      'Your vet and a backup contact',
    ],
    steps: [
      { title: 'Register the chip', detail: 'An unregistered chip is jewelry.' },
      { title: 'Put a QR on the collar', detail: `PetClues public profiles are built for ${entry.city.name} finders with a phone.` },
      { title: 'Keep meds current', detail: 'Seizure and diabetes notes change what a finder should do.' },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Make a ${entry.city.name} lost-pet QR`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'Is a microchip enough?',
        answer: 'It helps at a clinic or shelter. A QR on the collar helps the neighbor who finds your dog at 9 p.m.',
      },
      {
        question: 'What should the public page show?',
        answer: 'Your phone, meds that matter, and a photo. Not your home address.',
      },
    ],
  }),
  'new-puppy-health-folder': (entry) => ({
    lead: `A first-90-days health folder for puppies in ${entry.city.name}: vaccines, deworming, and the receipts you will need at boarding.`,
    overview: `New puppy chaos in ${entry.city.name} is a stack of clinic printouts. ${entry.city.facilityNote} Start the vault before the second vaccine visit.`,
    checklist: [
      'DA2PP dates',
      'Deworming and fecal',
      'Rabies when due',
      'Breeder or rescue medical handoff',
      'Microchip registration',
    ],
    steps: [
      { title: 'Photograph the first visit packet', detail: 'Same day. Portals lag.' },
      { title: 'Set booster reminders', detail: 'The 16-week visit is the one people miss.' },
      { title: 'Add boarding fields early', detail: vaultLine(entry.city.name) },
    ],
    localNote: entry.city.facilityNote,
    ctaTitle: `Start a ${entry.city.name} puppy folder`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What goes in a puppy health folder?',
        answer: 'Vaccines, deworming, chip, diet, and the clinic that knows the puppy. PetClues is that folder with reminders.',
      },
      {
        question: 'When do I add rabies?',
        answer: 'When your veterinarian and local law say so, often around 12-16 weeks. Store the certificate immediately.',
      },
    ],
  }),
  'new-kitten-health-folder': (entry) => ({
    lead: `A first-90-days kitten folder for ${entry.city.name}: FVRCP, fecal, FeLV/FIV testing, and rabies timing.`,
    overview: `Kitten paperwork in ${entry.city.name} disappears between the first two visits. ${entry.city.climateNote} Outdoor access decisions also belong in the same file as vaccines.`,
    checklist: [
      'FVRCP series',
      'Fecal and deworming',
      'FeLV/FIV test PDF',
      'Rabies when due',
      'Diet and litter notes for sitters',
    ],
    steps: [
      { title: 'Save lab PDFs, not just verbal negatives', detail: 'FeLV/FIV results get lost.' },
      { title: 'Track FVRCP intervals', detail: 'Kittens need a series, not one shot.' },
      { title: 'Decide indoor policy in writing', detail: 'Sitters should not freelance outdoor time.' },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Start a ${entry.city.name} kitten folder`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What vaccines does a kitten need?',
        answer: 'FVRCP series and rabies per local law. FeLV depends on lifestyle. Store every result in one profile.',
      },
      {
        question: 'When can a kitten be boarded?',
        answer: 'When the cattery policy and the vaccine series line up. Keep the PDFs ready.',
      },
    ],
  }),
  'senior-dog-medication-log': (entry) => ({
    lead: `A senior medication log for dogs in ${entry.city.name}: NSAIDs, thyroid, heart, and kidney meds with last-dose times.`,
    overview: `Senior dogs in ${entry.city.name} often take more than one daily drug. ${entry.city.climateNote} changes how NSAIDs and heat or ice interact. An ER kit without last-dose time is incomplete.`,
    checklist: [
      'Drug name, mg, and time',
      'Food vs empty stomach',
      'Last bloodwork date',
      'NSAID and steroid warnings',
      'Pharmacy and prescribing clinic',
    ],
    steps: [
      { title: 'Log doses the same day', detail: 'Missed NSAIDs and double doses both show up at 2 a.m.' },
      { title: 'Attach the last chemistry panel', detail: 'Kidney values change what the ER can give.' },
      { title: 'Share with the sitter', detail: vaultLine(entry.city.name) },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Keep ${entry.city.name} senior meds in one log`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What should a senior dog medication log include?',
        answer: 'Name, dose, time, with-food flag, and the last lab date. Photos of the bottles help sitters.',
      },
      {
        question: 'Do I still need vaccine records?',
        answer: 'Yes for boarding. Meds are the ER priority. Keep both in the same vault.',
      },
    ],
  }),
  'multi-pet-household-records': (entry) => ({
    lead: `One household vault for every dog and cat in ${entry.city.name}: vaccines, meds, and who is due next.`,
    overview: `Multi-pet homes in ${entry.city.name} mix species and clinics. ${entry.city.facilityNote} One shared calendar stops the cat from missing FVRCP while the dog is current.`,
    checklist: [
      'Profile per animal',
      'Shared sitter packet',
      'Staggered vaccine reminders',
      'Species-specific boarding lists',
      'One emergency contact card',
    ],
    steps: [
      { title: 'Split profiles, share the household', detail: 'Do not keep three camera rolls.' },
      { title: 'Color-code due dates', detail: 'The next missed Bordetella is usually the second dog.' },
      { title: 'One QR per collar', detail: `Finders in ${entry.city.name} should not guess which pet is which.` },
    ],
    localNote: entry.city.facilityNote,
    ctaTitle: `Run a ${entry.city.name} multi-pet vault`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'Can I store dogs and cats together?',
        answer: 'Yes, as separate profiles in one household. Sitters still need per-pet meds.',
      },
      {
        question: 'How do I handle different clinics?',
        answer: 'Upload each PDF to the right pet. PetClues does not care which clinic portal it came from.',
      },
    ],
  }),
  'groomer-vaccine-proof': (entry) => ({
    lead: `Groomer intake in ${entry.city.name}: rabies proof and the extras salons now ask for.`,
    overview: `${entry.city.facilityNote} Groomers are not boarding, but rabies is still the usual gate. A digital certificate that opens in the lobby is the whole job.`,
    checklist: [
      'Rabies certificate',
      'DHPP if the salon asks',
      'Flea prevention date',
      'Behavior notes (muzzle, mats, heart disease)',
      'Emergency contact',
    ],
    steps: [
      { title: 'Ask the salon list once', detail: 'Save it. Do not rediscover it at drop-off.' },
      { title: 'Keep rabies at the top of the profile', detail: 'That is the document they want.' },
      { title: 'Add heart and airway notes', detail: `Heat in ${entry.city.name} plus a dryer is a medical issue for some breeds.` },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Show ${entry.city.name} groomer proof`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `Do ${entry.city.name} groomers require rabies?`,
        answer: 'Most do. Some also want DHPP. Keep the PDFs on your phone.',
      },
      {
        question: 'What if the certificate is expired by a week?',
        answer: 'Expect a no. Book the booster, store the new PDF, then rebook the groom.',
      },
    ],
  }),
  'dog-park-vaccine-rules': (entry) => ({
    lead: `Public dog-park vaccine expectations in ${entry.city.name}: rabies, DHPP, and what a ranger or volunteer may ask.`,
    overview: `Off-leash parks in ${entry.city.name} vary by city ordinance. Rabies is the usual legal floor. ${entry.city.climateNote} also drives leptospirosis and parasite conversations.`,
    checklist: [
      'Rabies certificate',
      'DHPP dates',
      'License if the city requires it',
      'Leash rules screenshot',
      'Emergency profile on a collar QR',
    ],
    steps: [
      { title: 'Carry digital rabies', detail: 'A volunteer ask should not end the visit.' },
      { title: 'Keep the license current', detail: `${entry.city.name} clerks and park signs may both mention it.` },
      { title: 'Add a QR', detail: 'Parks are where dogs get lost.' },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Carry ${entry.city.name} park-ready records`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `Does ${entry.city.name} require vaccines at dog parks?`,
        answer: 'Rabies is commonly required by ordinance even if no one checks daily. DHPP is wise for group play. Store both.',
      },
      {
        question: 'Is Bordetella required?',
        answer: 'Rarely by ordinance. Daycare yes, parks usually no. Still useful if your dog plays hard.',
      },
    ],
  }),
  'foster-intake-records': (entry) => ({
    lead: `Foster intake paperwork for ${entry.city.name} rescue homes: vaccines, tests, and the meds that arrive in a grocery bag.`,
    overview: `Fosters in ${entry.city.name} inherit incomplete histories. ${entry.city.facilityNote} A structured intake folder is how you avoid giving the wrong dewormer twice.`,
    checklist: [
      'Rescue ID and chip number',
      'Vaccines already given',
      'Test results (Heartworm, FeLV/FIV)',
      'Current meds and last dose',
      'Quarantine and isolation notes',
    ],
    steps: [
      { title: 'Photograph everything at pickup', detail: 'Bags get lost in the car.' },
      { title: 'Create a PetClues profile the same night', detail: 'Reminders start immediately.' },
      { title: 'Share with the rescue coordinator', detail: 'One link beats a group-chat photo dump.' },
    ],
    localNote: entry.city.facilityNote,
    ctaTitle: `Run ${entry.city.name} foster records cleanly`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What if the foster has no vaccine history?',
        answer: 'Start a new dated record with the first clinic visit. Do not invent old dates. PetClues can still hold the new timeline.',
      },
      {
        question: 'Can adopters get the file?',
        answer: 'Yes. Export or share the profile so the next home does not start from zero.',
      },
    ],
  }),
  'moving-with-pets-documents': (entry) => ({
    lead: `A moving packet for pets leaving or arriving in ${entry.city.name}: health certificates, vaccines, and county licensing.`,
    overview: `Relocating through ${entry.city.name} mixes ${entry.city.state} licensing with airline or highway rules. ${entry.city.facilityNote}`,
    checklist: [
      'Rabies and core vaccines',
      'Health certificate if flying or crossing certain borders',
      'Microchip registration with a new address',
      'Prescriptions that will run out during the move',
      'County license steps at the destination',
    ],
    steps: [
      { title: 'Update the chip address before the truck', detail: 'Finders should not call the old landline.' },
      { title: 'Bundle PDFs by pet', detail: 'Movers and airlines do not want a zip of 80 files.' },
      { title: 'Add the new ER', detail: `Look up after-hours care in the new ${entry.city.name} neighborhood before you need it.` },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Pack the ${entry.city.name} pet move file`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'Do I need a health certificate to move states?',
        answer: 'Driving often no. Flying and some destinations yes. Confirm, then store the dated exam.',
      },
      {
        question: `How soon should I license a pet in ${entry.city.name}?`,
        answer: 'Check city or county rules. Have the rabies PDF ready. PetClues keeps that certificate findable.',
      },
    ],
  }),
  'pet-insurance-claim-packet': (entry) => ({
    lead: `An insurance claim packet for ${entry.city.name} clinics: invoices, records, and the timeline that speeds reimbursement.`,
    overview: `Claims stall when invoices and medical notes live in different inboxes. ${entry.city.name} clinics will not rebuild your file for the insurer. Keep both in one vault.`,
    checklist: [
      'Itemized invoice',
      'Medical notes or discharge summary',
      'Diagnosis codes if provided',
      'Vaccine and prior-condition timeline',
      'Policy number and claim portal login hint stored privately',
    ],
    steps: [
      { title: 'Upload the invoice the day you pay', detail: 'Portals expire.' },
      { title: 'Attach the matching visit notes', detail: 'Insurers want the story, not just the total.' },
      { title: 'Keep a condition timeline', detail: 'Pre-existing fights are won with dates.' },
    ],
    localNote: `${entry.city.name} multi-clinic households should still use one vault so claims do not mix pets.`,
    ctaTitle: `File ${entry.city.name} claims from one folder`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: 'What documents do pet insurers want?',
        answer: 'Itemized invoices and medical records. Vaccine history helps for wellness riders. Store PDFs as they arrive.',
      },
      {
        question: 'Can PetClues submit the claim?',
        answer: 'You still submit to the insurer. PetClues keeps the packet complete so you are not hunting files at midnight.',
      },
    ],
  }),
  'after-hours-emergency-card': (entry) => ({
    lead: `A night-stand emergency card for ${entry.city.name}: ER phone, meds, and a QR a roommate can scan.`,
    overview: `After-hours care in ${entry.city.name} is a driving decision, not a Google surprise. ${entry.city.climateNote} Put the clinic name, meds, and your phone on one card plus a digital profile.`,
    checklist: [
      'After-hours ER name and phone',
      'Regular clinic phone',
      'Meds and last dose',
      'Allergies',
      'QR to a public emergency profile',
    ],
    steps: [
      { title: 'Pick the ER before you need it', detail: `Drive the route from home in ${entry.city.name} once.` },
      { title: 'Print a card and keep a digital twin', detail: 'Phones die. Paper gets lost. Use both.' },
      { title: 'Update meds when they change', detail: 'A stale card is a dangerous card.' },
    ],
    localNote: entry.city.climateNote,
    ctaTitle: `Make a ${entry.city.name} night ER card`,
    ctaBody: vaultLine(entry.city.name),
    faqs: [
      {
        question: `What is the after-hours vet in ${entry.city.name}?`,
        answer: 'It depends on your neighborhood. Choose one, save the phone, and put it on the pet profile before 2 a.m.',
      },
      {
        question: 'Should roommates see the card?',
        answer: 'Yes. A QR plus a fridge printout is how someone else can act if you are not home.',
      },
    ],
  }),
};

export function getResourcePageContent(entry: ResourceMatrixEntry): ResourcePageContent {
  const builder = BUILDERS[entry.topic.slug] ?? BUILDERS['dog-boarding-vaccine-requirements'];
  return {
    title: titleFor(entry),
    ...builder(entry),
  };
}
