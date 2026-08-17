import type { LifecycleBreed, LifecycleMatrixEntry, LifecycleStage } from './lifecycleMatrix';
import { libraryLinksForLifecycle, type LibraryLink } from './pseoLibraryLinks';
import { uniqueLifecycleParagraphs } from './pseoUniqueCopy';

const LIFECYCLE_HERO: Record<string, string> = {
  "puppy-vaccination-schedule": "/images/blog/blog-puppy-vaccination.webp",
  "puppy-nutrition-guide": "/images/blog/blog-life-stage-care.webp",
  "teething-and-dental-care": "/images/blog/blog-dog-dental-care.webp",
  "spay-neuter-recovery-timeline": "/images/blog/blog-puppy-checklist.webp",
  "adolescent-growth-diet": "/images/blog/blog-dog-weight-tracker.webp",
  "adult-weight-management": "/images/blog/blog-labrador-joint-care.webp",
  "best-food-for-allergies": "/images/blog/blog-pet-allergy-tracker.webp",
  "working-dog-fueling-plan": "/images/blog/blog-daily-checkin.webp",
  "breeding-pregnancy-diet": "/images/blog/blog-life-stage-care.webp",
  "postpartum-recovery-care": "/images/blog/blog-puppy-checklist.webp",
  "adult-heart-health-screening": "/images/blog/blog-best-pet-health-app.webp",
  "senior-joint-care": "/images/blog/blog-dachshund-mobility.webp",
  "senior-kidney-support-diet": "/images/blog/blog-senior-dog.webp",
  "senior-cognitive-care": "/images/blog/blog-senior-dog.webp",
  "end-of-life-comfort-care": "/images/blog/blog-emergency-passport.webp"
};

export type LifecycleChecklistItem = {
  id: string;
  label: string;
  urgency: 'routine' | 'watch' | 'urgent';
};

export type LifecycleTimelineStep = {
  label: string;
  title: string;
  detail: string;
};

export type LifecycleFaq = {
  question: string;
  answer: string;
};

export type LifecyclePageContent = {
  title: string;
  lead: string;
  overview: string;
  checklistHeading: string;
  checklist: LifecycleChecklistItem[];
  timelineHeading: string;
  timeline: LifecycleTimelineStep[];
  protocolHeading: string;
  protocol: string[];
  dietHeading: string;
  dietNotes: string[];
  faqs: LifecycleFaq[];
  heroImage: string;
  uniqueParagraphs: string[];
  library: LibraryLink[];
};

const SIZE_GROWTH_CLOSE: Record<LifecycleBreed['size'], string> = {
  toy: '8-10 months',
  small: '10-12 months',
  medium: '12-14 months',
  large: '14-18 months',
  giant: '18-24 months',
};

const SIZE_SPAY_WINDOW: Record<LifecycleBreed['size'], string> = {
  toy: '6-9 months, after the first heat discussion with your veterinarian',
  small: '6-12 months depending on orthopedic risk',
  medium: '9-15 months if joint screening is pending',
  large: '12-18 months so growth plates can close',
  giant: '18-24 months unless medical need requires earlier surgery',
};

const SIZE_CALORIE_NOTE: Record<LifecycleBreed['size'], string> = {
  toy: 'Toy breeds burn quickly and crash if meals are skipped - split calories into 3-4 feedings while young.',
  small: 'Small breeds need calorie-dense growth food without free-feeding that pads the ribcage.',
  medium: 'Medium breeds tolerate twice-daily meals once teething settles; weigh every two weeks.',
  large: 'Large breeds need controlled-calcium large-breed puppy diets - extra calories now become orthopedic debt later.',
  giant: 'Giant breeds should stay lean through the growth window; never "push" weight to look finished.',
};

function article(entry: LifecycleMatrixEntry): string {
  return `${entry.stage.label} for ${entry.breed.name}s`;
}

function sizePhrase(breed: LifecycleBreed): string {
  return `${breed.size}-breed ${breed.name} (${breed.adultWeight} adult, typical lifespan ${breed.lifespanYears} years)`;
}


function expandLifecycleBuilder(
  entry: LifecycleMatrixEntry,
  base: Omit<LifecyclePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>,
): Omit<LifecyclePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'> {
  const { breed, stage } = entry;
  const sizeBit =
    breed.size === 'toy'
      ? `Toy-breed ${breed.name}s chill fast, hide dental pain, and can drop blood sugar if a meal is skipped around clinic day.`
      : breed.size === 'giant'
        ? `Giant-breed ${breed.name}s need growth-aware handling: lean muscle, careful jumps, and anesthesia plans that respect their size.`
        : `For a ${breed.size} ${breed.name}, keep portions honest and write down what the clinic actually did, not what you meant to ask.`;

  const focusBit = `Because this breed watches ${breed.healthFocus}, put that line on the same page as this ${stage.label.toLowerCase()} plan so a new veterinarian is not guessing.`;

  const extraChecklist = [
    { id: 'vault', label: `PetClues (or equivalent) vault updated the same day for this ${breed.name}`, urgency: 'routine' as const },
    { id: 'share', label: 'Sitter or co-parent has read-only access to the current packet', urgency: 'routine' as const },
  ].filter((item) => !base.checklist.some((existing) => existing.id === item.id));

  const extraProtocol = [
    `Note the clinic name and city every time. ${breed.name} families move; portals do not travel with them.`,
    `If ${breed.healthFocus} changes handling (heat, stairs, sedation), write that in the visit note before you forget.`,
    'Export a PDF before boarding, relocation, or a specialist referral.',
  ].filter((line) => !base.protocol.includes(line));

  const extraDiet = [
    sizeBit,
    `Do not start a new protein, supplement, or "joint chew" the same week you change this ${stage.label.toLowerCase()} plan. You will not know what caused a flare.`,
    focusBit,
  ].filter((line) => !base.dietNotes.includes(line));

  const extraFaqs = [
    {
      question: `What should I bring to a ${breed.name} appointment about ${stage.label.toLowerCase()}?`,
      answer: `The last certificates, the current food bag photo, a weight, and a short list of meds. If you use PetClues, open the timeline on your phone. Clinics work faster when they are not reconstructing history from memory.`,
    },
    {
      question: `How is this ${breed.name} page different from a generic dog article?`,
      answer: `It is built around a ${breed.size} ${breed.group} dog at ${breed.adultWeight}, lifespan ${breed.lifespanYears} years, with ${breed.healthFocus} on the watch list. If a tip would fit a Chihuahua and a Mastiff the same way, it does not belong here.`,
    },
  ].filter((faq) => !base.faqs.some((existing) => existing.question === faq.question));

  return {
    ...base,
    overview: `${base.overview} ${sizeBit} ${focusBit}`,
    checklist: [...base.checklist, ...extraChecklist].slice(0, 10),
    protocol: [...base.protocol, ...extraProtocol].slice(0, 10),
    dietNotes: [...base.dietNotes, ...extraDiet].slice(0, 8),
    faqs: [...base.faqs, ...extraFaqs].slice(0, 8),
  };
}

const BUILDERS: Record<string, (entry: LifecycleMatrixEntry) => Omit<LifecyclePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>> = {
  'puppy-vaccination-schedule': (entry) => {
    const { breed } = entry;
    return {
      lead: `A first-year immunity timeline for the ${sizePhrase(breed)}, with DA2PP/DHPP, rabies, and lifestyle vaccines dated so no booster is guessed at a border, boarding desk, or ER.`,
      overview: `${breed.name} puppies finish core immunization later than many owners expect. Because this is a ${breed.size} ${breed.group} dog - with ${breed.healthFocus} already on the watch list - every vaccine lot number, clinic, and next-due date belongs in one vault. Socialization can start after the first core vaccine, but public dog-park density should wait until the series is complete. Store the certificate images beside weight and stool notes so titer or travel paperwork does not stall.`,
      checklistHeading: `${breed.name} puppy vaccine watch list`,
      checklist: [
        { id: 'da2pp', label: `DA2PP/DHPP series started and interval logged for this ${breed.name}`, urgency: 'urgent' },
        { id: 'rabies', label: 'Rabies certificate photographed (lot, expiration, clinic)', urgency: 'urgent' },
        { id: 'lifestyle', label: 'Lifestyle vaccines (Bordetella, leptospirosis, influenza) matched to boarding/travel', urgency: 'watch' },
        { id: 'reaction', label: 'Vaccine reaction log (facial swelling, vomiting, lethargy >24h)', urgency: 'watch' },
        { id: 'next', label: 'Next-due date on a shared calendar, not a paper card in a drawer', urgency: 'routine' },
        { id: 'fecal', label: `Fecal check and deworming dates stored with the ${breed.name} vaccine packet`, urgency: 'routine' },
      ],
      timelineHeading: 'First-year immunization timeline',
      timeline: [
        { label: '6-8 wk', title: 'First core vaccine', detail: `Start DA2PP/DHPP. Weigh the ${breed.name} puppy; toy/small dogs can be under-dosed if the clinic uses an outdated weight.` },
        { label: '10-12 wk', title: 'Second core + fecal', detail: 'Repeat core vaccine. Deworming and fecal antigen reduce "failure to thrive" that owners mistake for food issues.' },
        { label: '14-16 wk', title: 'Third core + rabies', detail: `${breed.size === 'giant' || breed.size === 'large' ? 'Large and giant breeds often receive the last core dose at 16 weeks.' : 'Complete the core series; rabies timing follows local ordinance.'}` },
        { label: '20-26 wk', title: 'Lifestyle boosters', detail: 'Add Bordetella/lepto/influenza if daycare, travel, or standing water is in this household\'s pattern.' },
        { label: '12 mo', title: 'First annual review', detail: 'Confirm which antigens move to 1-year vs 3-year labels. Archive the full packet before the puppy record is "lost" at a new clinic.' },
      ],
      protocolHeading: 'How to keep the schedule legally useful',
      protocol: [

        `Photograph every ${breed.name} vaccine certificate the day it is issued - glare-free, full margins.`,
        'Record lot number, route (SQ vs IN), and any antihistamine pre-med in the same timestamped note.',
        'If a dose is delayed by illness, log the reason so the series is not accidentally restarted.',
        `Flag ${breed.healthFocus} so the veterinarian can adjust handling (airway, joints, heat) on vaccine day.`,
        'Export a PDF before boarding, relocation, or a new specialist visit.',
        `Bring the ${breed.name} weight from home if the clinic scale disagrees - dose math follows the real number.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Vaccine-day feeding notes',
      dietNotes: [

        SIZE_CALORIE_NOTE[breed.size],
        'A light meal 2-3 hours before vaccination reduces nausea; do not fast a toy-breed puppy overnight.',
        'If an elimination diet is already underway, do not change proteins on vaccine day - you will not know what caused a flare.',
        `Skip new treats the day a ${breed.name} is vaccinated so stool or itch changes have one clear suspect.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `When is a ${breed.name} puppy fully vaccinated?`,
          answer: `Core immunization is typically complete 2 weeks after the last DA2PP/DHPP dose around 16 weeks of age. Rabies timing is set by local law. Until then, structured socialization is still important - choose vaccinated-adult play, not high-density dog parks.`,
        },
        {
          question: `Can I titer instead of boosting my ${breed.name}?`,
          answer: `Titers can document antibody for some core viruses in adult dogs. Puppies still need the initial series. Store titer lab PDFs next to the vaccine history so a boarding facility or border official can read both.`,
        },
        {
          question: `Which lifestyle vaccines does a ${breed.name} need?`,
          answer: `It depends on boarding, dog daycare, standing water, and travel - not on the breed name alone. Ask for Bordetella, leptospirosis, and influenza only when exposure is real, then put those due dates in the same vault as core vaccines.`,
        },
        {
          question: `What if my ${breed.name} has a vaccine reaction?`,
          answer: `Log time of onset, signs, and which antigen was given. Mild lethargy under a day is common; facial swelling, hives, vomiting, or collapse need a same-day call. Future visits may need pre-meds or a split schedule.`,
        },
      ],
    };
  },
  'puppy-nutrition-guide': (entry) => {
    const { breed } = entry;
    return {
      lead: `A growth-diet brief for ${sizePhrase(breed)} puppies - calorie density, calcium limits, and feeding frequency that protect ${breed.healthFocus}.`,
      overview: `${breed.name} puppies should finish growth looking athletic, not "well covered." Adult weight lands around ${breed.adultWeight}; overshooting in the first six months is how ${breed.healthFocus} shows up years early. ${SIZE_CALORIE_NOTE[breed.size]} Growth typically closes near ${SIZE_GROWTH_CLOSE[breed.size]} for this size class. Keep a weekly weight chart in the same vault as stool quality and vaccine dates.`,
      checklistHeading: `${breed.name} puppy diet checklist`,
      checklist: [
        { id: 'lifestage', label: `AAFCO growth (or all-life-stages with growth claim) food appropriate for a ${breed.size} ${breed.name}`, urgency: 'urgent' },
        { id: 'calcium', label: 'No extra calcium/joint powders unless a veterinarian prescribed them', urgency: 'urgent' },
        { id: 'bcs', label: 'Ribs easy to feel; waist visible from above', urgency: 'watch' },
        { id: 'split', label: 'Calories split across 3+ meals until six months', urgency: 'routine' },
        { id: 'treats', label: 'Training treats counted inside the daily calorie budget (<10%)', urgency: 'routine' },
        { id: 'scale', label: `Weekly weigh-in logged for this ${breed.name} on the same scale`, urgency: 'routine' },
      ],
      timelineHeading: 'Feeding timeline through growth close',
      timeline: [
        { label: '8-12 wk', title: 'Transition from breeder diet', detail: 'Change foods over 7 days. Log stool score daily so a protein or fat jump is obvious.' },
        { label: '3-6 mo', title: 'Peak growth calories', detail: `Expect rapid gain. Recalculate portions every 2 weeks for this ${breed.name}.` },
        { label: '6-9 mo', title: 'Slow the curve', detail: 'If the waist disappears, cut 10% calories before adding joint supplements as a "fix."' },
        { label: SIZE_GROWTH_CLOSE[breed.size], title: 'Adult food decision', detail: 'Move to adult maintenance when the veterinarian confirms growth-plate timing for this size.' },
        { label: '12 mo+', title: 'Audit the pantry', detail: 'Drop puppy-density food. Archive the brand/lot that agreed with this dog for future elimination trials.' },
      ],
      protocolHeading: 'Vault protocol for diet changes',
      protocol: [

        'Photograph the bag (guaranteed analysis + lot) whenever you change formulas.',
        `Record body-condition score beside weight - ${breed.name} coats can hide a rib layer.`,
        'Note fish-oil, probiotic, and chew calories; they are not free.',
        `Keep a one-line log if stools or itch flare - relevant to ${breed.healthFocus}.`,
        'Share the feeding timeline before boarding so staff do not "be kind" with extra cups.',
        `Write the gram target for each ${breed.name} meal so sitters are not guessing cup scoops.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'What "best food" means for this breed',
      dietNotes: [

        `${breed.size === 'large' || breed.size === 'giant' ? 'Large-breed puppy formulas cap calcium; adult "all life stages" with high calcium is the wrong default.' : 'A calorie-dense small-breed puppy kibble or a complete fresh plan both work if portions are weighed.'}`,
        'Home cooking is not "healthier" unless a veterinary nutritionist balances it - growth diets are easy to get wrong.',
        `Watch ${breed.healthFocus}: diet is one lever, not a cure. Pair feeding notes with the clinical briefs linked below.`,
        `If the ${breed.name} puppy leaves food, cut the portion before you add toppers that erase the calorie math.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `How many times a day should I feed a ${breed.name} puppy?`,
          answer: `Three to four meals until about six months, then two. Toy and small ${breed.name}s are hypoglycemia-prone if a meal is skipped. Weigh portions; cup-scoops drift.`,
        },
        {
          question: `When do I switch my ${breed.name} off puppy food?`,
          answer: `Around ${SIZE_GROWTH_CLOSE[breed.size]} for this size class, or when your veterinarian says growth plates and body condition support adult calories. Giant breeds stay on controlled-growth diets longer than toys.`,
        },
        {
          question: `Can I free-feed my ${breed.name} puppy?`,
          answer: `Not if you care about growth curves. Free-feeding hides intake and pads the ribcage. Measure grams, then adjust every two weeks against weight and waist.`,
        },
        {
          question: `Do ${breed.name} puppies need joint supplements?`,
          answer: `Usually no. Extra calcium and random joint powders can harm large-breed growth. Lean body condition and the right growth formula matter more than a chew.`,
        },
      ],
    };
  },
  'teething-and-dental-care': (entry) => {
    const { breed } = entry;
    return {
      lead: `A teething-to-adult dental timeline for ${breed.name}s - deciduous loss, chew safety, and how crowded mouths in ${breed.size} dogs become periodontal disease by year three.`,
      overview: `${breed.name} puppies typically shed deciduous teeth between 12 and 24 weeks. ${breed.size === 'toy' || breed.size === 'small' ? 'Small and toy jaws crowd easily; retained baby canines are common.' : 'Chew drive is high in this size class - inappropriate bones fracture teeth that then abscess.'} Pair a chew log with vaccine visits so retained teeth are extracted while the dog is already under anesthesia for spay/neuter when appropriate. Adult dental care is cheaper than extracting a fractured carnassial later.`,
      checklistHeading: 'Oral health symptom checklist',
      checklist: [
        { id: 'retained', label: 'Double fangs (retained deciduous canines) after 6 months', urgency: 'urgent' },
        { id: 'fracture', label: 'Broken tooth, drooling, or pawing at the mouth', urgency: 'urgent' },
        { id: 'halitosis', label: 'Persistent bad breath after teething should have finished', urgency: 'watch' },
        { id: 'chews', label: 'No antlers, ice cubes, or weight-bearing bones', urgency: 'watch' },
        { id: 'brush', label: 'Daily brush or veterinary-approved dental chew logged', urgency: 'routine' },
        { id: 'photo', label: `Gum-line photo archived every 90 days for this ${breed.name}`, urgency: 'routine' },
      ],
      timelineHeading: `${breed.name} dental timeline`,
      timeline: [
        { label: '3-4 mo', title: 'Incisors shed', detail: 'Expect extra chewing. Redirect to textured rubber, not household wood.' },
        { label: '4-6 mo', title: 'Canines and premolars', detail: `Check weekly for two teeth in one socket - common in ${breed.size} ${breed.name}s.` },
        { label: '6-7 mo', title: 'Adult set in', detail: 'Ask the veterinarian to confirm no retained deciduous teeth before spay/neuter day.' },
        { label: '12 mo', title: 'Baseline dental photo', detail: 'Gum line photos make tartar progression obvious at the next annual.' },
        { label: '2-3 yr', title: 'First professional assessment', detail: 'Toy and small breeds often need earlier cleaning under anesthesia than giant breeds.' },
      ],
      protocolHeading: 'Records that change dental outcomes',
      protocol: [

        'Date-stamped photos of the gum line every 90 days.',
        'List of chews that caused fractures or diarrhea - share with sitters.',
        'Anesthesia dental reports with extracted tooth numbers (Triadan).',
        `Note if ${breed.healthFocus} affects anesthesia planning (airway, heart, kidneys).`,
        'Home-care product name and frequency - "we brush sometimes" is not a protocol.',
        `Schedule the next ${breed.name} oral check on the same calendar as vaccines so it is not skipped.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Diet and chews',
      dietNotes: [

        'Kibble is not a dental treatment. If tartar is already present, brushing or professional care is required.',
        'Dental treats count toward calories - critical for adult weight management later.',
        'Avoid cooked bones. They splinter and do not "clean teeth."',
        `If a ${breed.name} prefers soft food only, plan earlier professional cleanings - texture preference is not a cleaning method.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `When do ${breed.name} puppies lose their baby teeth?`,
          answer: `Most deciduous teeth are gone by 6-7 months. If you still see a baby canine beside an adult canine, schedule extraction - especially in toy and small ${breed.name}s.`,
        },
        {
          question: `Are antlers safe teething chews for a ${breed.name}?`,
          answer: `No. Hard chews (antlers, nylon, ice, hooves) are a leading cause of slab fractures. Use flexible rubber and supervised food puzzles instead.`,
        },
        {
          question: `How often should I brush my ${breed.name}'s teeth?`,
          answer: `Daily is the goal. A few times a week still beats never. Use a dog toothpaste; human paste is not for swallowing.`,
        },
        {
          question: `When does a ${breed.name} need a professional dental cleaning?`,
          answer: `When tartar, gum inflammation, or breath persists despite home care - often earlier in toy and small mouths. Your veterinarian decides anesthesia timing from the exam, not from a calendar meme.`,
        },
      ],
    };
  },
  'spay-neuter-recovery-timeline': (entry) => {
    const { breed } = entry;
    return {
      lead: `A day-by-day spay/neuter recovery map for ${sizePhrase(breed)} - incision checks, cone compliance, and when this size class should wait for growth plates.`,
      overview: `Timing for a ${breed.name} is not a calendar meme. ${SIZE_SPAY_WINDOW[breed.size]}. That window exists because ${breed.healthFocus} interacts with hormones, growth plates, and anesthesia risk. Recovery itself is 10-14 days of movement control - not "they seem fine on day three." Photograph the incision daily in the same lighting so a surgeon can triage redness over text.`,
      checklistHeading: 'Recovery red-flag checklist',
      checklist: [
        { id: 'dehiscence', label: 'Incision opening, discharge, or sudden swelling', urgency: 'urgent' },
        { id: 'pale', label: 'Pale gums, collapse, or unproductive retching (especially deep-chested breeds)', urgency: 'urgent' },
        { id: 'lick', label: 'Licking the incision or missing the cone/suit', urgency: 'watch' },
        { id: 'appetite', label: 'Refusing food or water beyond the first evening', urgency: 'watch' },
        { id: 'meds', label: 'Pain and anti-nausea doses given on schedule, not "as needed by vibe"', urgency: 'routine' },
        { id: 'activity', label: `No off-leash play or stairs until written clearance for this ${breed.name}`, urgency: 'watch' },
      ],
      timelineHeading: '14-day recovery timeline',
      timeline: [
        { label: 'Day 0', title: 'Surgery + discharge sheet', detail: 'Photograph discharge instructions. Confirm suture vs glue, and whether an e-collar is mandatory overnight.' },
        { label: 'Day 1-2', title: 'Pain control window', detail: `${breed.size === 'toy' ? 'Toy breeds chill quickly - keep them warm and offer small meals.' : 'Leash only. No stairs, sofas, or wrestling with housemates.'}` },
        { label: 'Day 3-5', title: 'False "all better" phase', detail: 'This is when incisions open. Keep the cone. Short potty breaks only.' },
        { label: 'Day 7-10', title: 'Suture check', detail: 'Many clinics recheck now. Bring your photo log if the incision looks different than day 2.' },
        { label: 'Day 14', title: 'Clearance', detail: 'Wait for written clearance before off-leash play. Archive the operative note in the vault.' },
      ],
      protocolHeading: 'What to store before and after surgery',
      protocol: [

        'Pre-anesthetic bloodwork PDF and NPO (fasting) time actually used.',
        `Airway and cardiac notes if ${breed.healthFocus} is relevant to anesthesia.`,
        'Daily incision photos (same angle, same light).',
        'Medication times and any vomiting after pain meds.',
        'Written activity clearance date - not a verbal "should be fine."',
        `Emergency clinic number taped where anyone watching the ${breed.name} can see it.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Feeding during recovery',
      dietNotes: [

        'Offer 50-75% of normal calories the first night if nauseated; return to normal by day 2 if stools are formed.',
        'Do not introduce a new protein during recovery - GI upset will be blamed on surgery.',
        'If the dog is on a prescription diet, send the exact bag with any boarding or pet-sitter.',
        `Keep ${breed.name} meal times predictable so skipped bowls stand out against normal post-op nausea.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `When should I spay or neuter my ${breed.name}?`,
          answer: `Discuss timing with a veterinarian who knows this size class. ${SIZE_SPAY_WINDOW[breed.size]}. Medical need (pyometra risk, cryptorchidism, roaming) can override elective delay.`,
        },
        {
          question: `How long is ${breed.name} spay recovery?`,
          answer: `Plan on 10-14 days of restricted activity. Internal healing lags the "they want to run" behavior you will see around day 3-4.`,
        },
        {
          question: `Does my ${breed.name} need the cone the whole time?`,
          answer: `Yes until the incision is closed and the clinic says otherwise. A surgical suit only works if it stays on and the dog cannot reach the wound. Licking is how tidy incisions fail.`,
        },
        {
          question: `When can my ${breed.name} climb stairs after surgery?`,
          answer: `After written clearance, usually around day 10-14. Carry small dogs; use a sling or block stairs for larger ones. Day-three energy is not permission.`,
        },
      ],
    };
  },
  'adolescent-growth-diet': (entry) => {
    const { breed } = entry;
    return {
      lead: `The awkward middle: calories, calcium, and training fuel for a ${breed.name} between puppyhood and adult weight (${breed.adultWeight}).`,
      overview: `Adolescence is when ${breed.name} owners either lock in a lean athlete or a lifelong weight problem. Growth plates close near ${SIZE_GROWTH_CLOSE[breed.size]}. ${SIZE_CALORIE_NOTE[breed.size]} Keep protein high enough for muscle, calories low enough that the waist stays. This is also when ${breed.healthFocus} first becomes visible on exam - diet notes belong next to orthopedic and cardiac screening.`,
      checklistHeading: 'Adolescent feeding checklist',
      checklist: [
        { id: 'waist', label: 'Waist visible; abdominal tuck present', urgency: 'watch' },
        { id: 'switch', label: `Written plan for puppy -> adult food around ${SIZE_GROWTH_CLOSE[breed.size]}`, urgency: 'routine' },
        { id: 'jumps', label: 'No repetitive jumping from heights during the growth window', urgency: 'watch' },
        { id: 'treats', label: 'Training treats still inside 10% of calories', urgency: 'routine' },
        { id: 'screen', label: `Screening scheduled for ${breed.healthFocus}`, urgency: 'urgent' },
        { id: 'weigh', label: `Biweekly weight logged for this adolescent ${breed.name}`, urgency: 'routine' },
      ],
      timelineHeading: 'Growth-to-adult feeding timeline',
      timeline: [
        { label: '5-7 mo', title: 'Recalculate portions', detail: 'Adolescent hunger is not a portion size. Weigh every 2 weeks.' },
        { label: '8-10 mo', title: 'Activity vs calories', detail: `A bored ${breed.name} looks "starving." Increase scent work, not kibble.` },
        { label: SIZE_GROWTH_CLOSE[breed.size], title: 'Adult maintenance', detail: 'Transition food over 7-10 days. Log any itch or stool change.' },
        { label: 'Adult', title: 'Lock the recipe', detail: 'Photograph the successful adult formula. Future allergy trials need a known baseline.' },
        { label: 'Post-switch', title: '30-day audit', detail: `Confirm the ${breed.name} waist held after the calorie density drop. Adjust grams before adding oils.` },
      ],
      protocolHeading: 'Records for the growth window',
      protocol: [

        'Weight + BCS chart (not weight alone).',
        'Orthopedic notes if limp appears after play.',
        'Food bag lots during the transition.',
        `Reminders for ${breed.healthFocus} screening.`,
        'Training-treat calorie budget written for sitters.',
        `Jump and fetch limits stated in writing while the ${breed.name} is still growing.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Adolescent diet rules',
      dietNotes: [

        'Do not add calcium, extra puppy milk, or "performance" fat without a veterinarian.',
        `${breed.size === 'giant' || breed.size === 'large' ? 'Keep large-breed growth diets until the vet agrees plates are closed.' : 'Small breeds can move to adult calories earlier if BCS is creeping up.'}`,
        'Free-feeding hides intake. Use a gram scale.',
        `If the ${breed.name} is in classes, pull training calories from the daily ration instead of adding a second pantry.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `Is my ${breed.name} still a puppy at 10 months?`,
          answer: `Behaviorally yes. Skeletal growth for this size class continues until about ${SIZE_GROWTH_CLOSE[breed.size]}. Diet and jump control should stay conservative until then.`,
        },
        {
          question: `Should adolescent ${breed.name}s get joint supplements?`,
          answer: `Supplements are not a substitute for lean body condition and controlled exercise. Ask your veterinarian; extra calcium can harm large-breed growth.`,
        },
        {
          question: `Why is my ${breed.name} always hungry as a teen?`,
          answer: `Growth, boredom, and training culture all inflate appetite. Check the waist and the scale before you raise the bowl. Enrichment beats another cup of kibble.`,
        },
        {
          question: `When can my ${breed.name} do repetitive jumping?`,
          answer: `After growth plates close for this size - around ${SIZE_GROWTH_CLOSE[breed.size]} - and only if the dog is sound. Sport skills can wait; orthopedic debt cannot be refunded.`,
        },
      ],
    };
  },
  'adult-weight-management': (entry) => {
    const { breed } = entry;
    return {
      lead: `A body-condition protocol for adult ${breed.name}s (${breed.adultWeight}) - because extra weight is the fastest way to worsen ${breed.healthFocus}.`,
      overview: `Adult ${breed.name}s should keep a palpable rib grid and a waist. "They look like a ${breed.name}" is not a BCS. This ${breed.size} ${breed.group} breed already carries ${breed.healthFocus}; adipose tissue amplifies orthopedic, airway, and metabolic load. Weigh every 30 days on the same scale. Treats, dental chews, and table scraps are the usual leak - not the breakfast kibble.`,
      checklistHeading: 'Weight-management symptom checklist',
      checklist: [
        { id: 'ribs', label: 'Cannot feel ribs without pressing hard', urgency: 'watch' },
        { id: 'exercise', label: 'Slower recovery after walks or heat intolerance', urgency: 'watch' },
        { id: 'scale', label: 'No monthly weight logged for 90+ days', urgency: 'routine' },
        { id: 'labs', label: 'Unexplained weight gain - screen thyroid/metabolic causes', urgency: 'urgent' },
        { id: 'chews', label: 'Dental chews and toppers not counted in calories', urgency: 'routine' },
        { id: 'waist', label: `No overhead waist photo for this ${breed.name} in the last 90 days`, urgency: 'routine' },
      ],
      timelineHeading: '90-day lean-down timeline',
      timeline: [
        { label: 'Day 0', title: 'Baseline', detail: 'Weight, BCS photo (from above and side), and current calorie estimate.' },
        { label: 'Day 1-14', title: 'Close the leaks', detail: 'Weigh food. Cut treats to <10%. Switch training to kibble from the daily ration.' },
        { label: 'Day 15-45', title: 'Adjust 10%', detail: 'If weight has not moved 1-2%, reduce calories 10% or add structured walking, not weekend heroics.' },
        { label: 'Day 46-90', title: 'Reassess labs if stuck', detail: `Plateau plus coat/energy changes may relate to ${breed.healthFocus} - do not just keep cutting food.` },
        { label: 'Day 90', title: 'Lock maintenance', detail: `Write the new ${breed.name} gram target and treat rules so the weight does not creep back in month four.` },
      ],
      protocolHeading: 'What the vault should show a veterinarian',
      protocol: [

        'Monthly weights with the same scale.',
        'BCS photos, not just a number.',
        'Full calorie list including chews and toppers.',
        'Activity notes (walk minutes, weather) for airway-sensitive breeds.',
        'Any steroid, seizure, or thyroid medication that drives appetite.',
        `Ideal weight range agreed with the clinic for this ${breed.name}, not a breed-forum average.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Adult feeding framework',
      dietNotes: [

        `Target the lean end of ${breed.adultWeight} unless your veterinarian sets a different ideal.`,
        'Weight-management formulas help only if portions are measured.',
        'Crash diets in giant breeds raise hyperlipidemia and pancreatitis risk - slow is safer.',
        `Count dental chews and "just a bite" scraps in the ${breed.name} daily total or the chart will lie.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `What is a healthy weight for an adult ${breed.name}?`,
          answer: `Most adults land in the ${breed.adultWeight} range, but rib feel beats the chart. Two dogs of this breed can differ by sex, bone, and neuter status. Use BCS 4-5/9 as the operational target.`,
        },
        {
          question: `How fast should my ${breed.name} lose weight?`,
          answer: `About 1% of body weight per week is a common veterinary target. Faster loss is not kinder - it is how muscle and liver values suffer.`,
        },
        {
          question: `Why is my ${breed.name} still heavy on a diet food?`,
          answer: `Diet bags do not portion themselves. Measure grams, cut treat leaks, and confirm the dog is not stealing from another bowl. If still stuck, ask for labs before another cut.`,
        },
        {
          question: `Do adult ${breed.name}s need fewer calories after neutering?`,
          answer: `Many do. Appetite can rise while needs fall. Recalculate portions within a month of surgery and watch the waist, not the bag's feeding chart alone.`,
        },
      ],
    };
  },
  'best-food-for-allergies': (entry) => {
    const { breed } = entry;
    return {
      lead: `An elimination-diet playbook for ${breed.name}s - itch, ear flares, and GI signs - without rotating proteins every week and erasing the data.`,
      overview: `${breed.name}s are often labeled "allergic" after one grocery-aisle experiment. True food-adverse dogs need an 8-week strict elimination diet, then a challenge. Environmental itch is more common than food itch; both can coexist with ${breed.healthFocus}. The "best food" is the one that completes a documented trial - hydrolyzed, novel-protein prescription, or a veterinary nutritionist home-cooked plan - not a boutique kangaroo kibble started on a Friday.`,
      checklistHeading: 'Allergy symptom checklist',
      checklist: [
        { id: 'ears', label: 'Recurrent ear infections or head shaking', urgency: 'watch' },
        { id: 'paws', label: 'Paw licking, stained fur, or scooting', urgency: 'watch' },
        { id: 'gi', label: 'Chronic soft stool, gas, or vomiting on a schedule', urgency: 'watch' },
        { id: 'face', label: 'Facial swelling or hives after a meal - stop and call the clinic', urgency: 'urgent' },
        { id: 'cheat', label: 'Flavored meds, dental chews, or training treats during a "strict" trial', urgency: 'urgent' },
        { id: 'photos', label: `Baseline belly/paw photos dated for this ${breed.name} before the trial`, urgency: 'routine' },
      ],
      timelineHeading: '8-week elimination timeline',
      timeline: [
        { label: 'Week 0', title: 'Baseline photos', detail: 'Ears, belly, paws. List every edible item in the house including the roommate\'s food.' },
        { label: 'Week 1-2', title: 'Strict start', detail: 'One diet only. Flavored preventives need a veterinary swap. Expect a mess while the gut resets.' },
        { label: 'Week 3-6', title: 'Hold the line', detail: `Do not rotate. ${breed.name} itch often improves after week 4 if food is the driver.` },
        { label: 'Week 7-8', title: 'Score the skin', detail: 'If improved, challenge one antigen at a time. If not, treat as environmental and keep the diary anyway.' },
        { label: 'After', title: 'Lock the recipe', detail: 'Photograph the winning bag. Future pancreatitis or kidney diets must respect this constraint.' },
      ],
      protocolHeading: 'Allergy records that actually help dermatology',
      protocol: [

        'Start date, diet name, and every cheat (even "one fry").',
        'Cytology results from ears/skin - not just "antibiotics again."',
        'Parasite prevention proof (itch is often fleas).',
        'Steroid or Apoquel/Cytopoint dates so you do not call a trial a failure during a drug taper.',
        `Cross-link ${breed.healthFocus} so systemic disease is not missed.`,
        `Sitter instructions that the ${breed.name} gets zero table scraps during the trial window.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Choosing a trial food',
      dietNotes: [

        'Over-the-counter "limited ingredient" diets are frequently cross-contaminated. Prescription hydrolyzed or novel-protein diets are the diagnostic tool.',
        'Chicken fat is still chicken for some dogs. Read the full ingredient list.',
        SIZE_CALORIE_NOTE[breed.size],
        `Weigh the ${breed.name} every two weeks on a trial diet - itch diets still need a waist.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `What is the best dog food for ${breed.name} allergies?`,
          answer: `The best food is the one that survives an 8-week veterinary elimination trial. There is no universal "hypoallergenic ${breed.name} kibble." Grain-free is not a synonym for hypoallergenic and has its own cardiac questions.`,
        },
        {
          question: `How long before I know if a ${breed.name} elimination diet is working?`,
          answer: `Skin usually needs 6-8 weeks. GI signs may shift in 2-3 weeks. Changing foods at day 10 guarantees you will never know.`,
        },
        {
          question: `Can I use an over-the-counter food for my ${breed.name} food trial?`,
          answer: `Risky. Many limited-ingredient bags are cross-contaminated with common proteins. Prescription hydrolyzed or novel-protein diets are built for diagnosis.`,
        },
        {
          question: `What if my ${breed.name} still itches on the trial food?`,
          answer: `Food may not be the driver, or something cheated. Recheck fleas, ears, and meds with your veterinarian. Keep the diary - a failed food trial is still useful data.`,
        },
      ],
    };
  },
  'working-dog-fueling-plan': (entry) => {
    const { breed } = entry;
    return {
      lead: `A performance-fueling brief for active ${breed.name}s - sport, herding, detection, or high-mileage hiking - without blowing up ${breed.healthFocus}.`,
      overview: `${breed.group === 'herding' || breed.group === 'sporting' || breed.group === 'working' ? `This ${breed.group} ${breed.name} was built for output.` : `Even companion ${breed.name}s can be working dogs if they hike, run, or do sport.`} Fueling is not "more kibble." It is timing, water, and GI tolerance. Extra fat on a rest day becomes weight. Under-fueling on a trial day becomes a medical event. Keep a session log (duration, temperature, stool, water) next to the diet so a sports veterinarian can see the pattern.`,
      checklistHeading: 'Performance fueling checklist',
      checklist: [
        { id: 'rest', label: 'Rest-day calories still look like a work day', urgency: 'watch' },
        { id: 'heat', label: 'Heat + humidity plan (especially airway-compromised dogs)', urgency: 'urgent' },
        { id: 'gi', label: 'Pre-event meal timing that avoids vomiting on the start line', urgency: 'watch' },
        { id: 'pads', label: 'Pad and nail wear logged after hard surfaces', urgency: 'routine' },
        { id: 'bcs', label: 'Off-season BCS creeping above 5/9', urgency: 'routine' },
        { id: 'water', label: `Water offers logged during long ${breed.name} work blocks`, urgency: 'routine' },
      ],
      timelineHeading: 'Work-week fueling timeline',
      timeline: [
        { label: 'Rest day', title: 'Maintenance calories', detail: `Drop the sport toppers. This is how ${breed.name}s stay in the ${breed.adultWeight} band.` },
        { label: 'T-3 h', title: 'Pre-work meal', detail: 'Easily digested meal. Avoid high fat immediately before intense work.' },
        { label: 'During', title: 'Water first', detail: 'Offer water frequently. Electrolyte products are not automatic - GI upset is common.' },
        { label: 'T+30 min', title: 'Recovery', detail: 'Small meal after cool-down. Watch for collapse, brick-red gums, or unproductive retching.' },
        { label: 'Weekly', title: 'Audit', detail: 'If stools fall apart only on work days, the fuel - not a mystery allergy - is the suspect.' },
      ],
      protocolHeading: 'Sport records worth keeping',
      protocol: [

        'Event calendar with temperature and duration.',
        'Rest vs work calorie split.',
        `Cardiac/respiratory notes tied to ${breed.healthFocus}.`,
        'Injury dates (shoulder, iliopsoas, pads) beside surface type.',
        'Pre-event meal time that actually worked without vomiting.',
        `Off-season weigh-ins so the ${breed.name} does not enter the next season already heavy.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Performance diet notes',
      dietNotes: [

        `${breed.size === 'giant' ? 'Giant breeds should not be asked for repetitive jump work on a calorie surplus.' : 'Increase calories with work, not in anticipation of work.'}`,
        'High-fat racing formulas are not the default for weekend hikers.',
        'Never use chocolate, xylitol, or grape "energy" human foods.',
        `Pack the usual ${breed.name} kibble for travel trials so a hotel pantry swap does not cause GI failure on game day.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `Do working ${breed.name}s need a different food?`,
          answer: `They need a complete diet plus a documented calorie swing between rest and work. A dedicated sport formula is optional; portion timing is not.`,
        },
        {
          question: `How soon can I feed my ${breed.name} after exercise?`,
          answer: `Wait until respiratory rate settles - often 30-60 minutes. Deep-chested ${breed.name}s should avoid a huge meal immediately before or after strenuous work because of bloat risk.`,
        },
        {
          question: `Should I give my ${breed.name} electrolytes on long hikes?`,
          answer: `Water comes first. Electrolyte products upset many dogs and are not automatic. Ask a sports veterinarian before you add them to a routine.`,
        },
        {
          question: `How do I keep a working ${breed.name} lean in the off-season?`,
          answer: `Cut the work-day toppers when the calendar goes quiet. Weigh weekly. Rest-day calories that match peak training are how off-season weight sticks.`,
        },
      ],
    };
  },
  'breeding-pregnancy-diet': (entry) => {
    const { breed } = entry;
    return {
      lead: `Gestation nutrition and screening for ${breed.name}s - from pre-breed labs to week-8 calorie ramps - with ${breed.healthFocus} on the risk register.`,
      overview: `Breeding a ${breed.name} is a medical project, not a diet trend. Bitches should enter heat at ideal BCS, vaccinated/titered, and screened for this breed's known issues (${breed.healthFocus}). Calories stay near maintenance through week 5, then rise as fetal mass increases. Calcium supplementation before whelping is a classic way to cause eclampsia. Store progesterone timing, Brucella tests, and feeding charts in one dossier for the reproductive veterinarian.`,
      checklistHeading: 'Pre-breed and pregnancy checklist',
      checklist: [
        { id: 'screen', label: `Genetic/orthopedic/cardiac screening relevant to ${breed.healthFocus}`, urgency: 'urgent' },
        { id: 'brucella', label: 'Brucella testing before every breeding', urgency: 'urgent' },
        { id: 'bcs', label: 'BCS 4.5-5.5/9 at breeding - not underweight, not fat', urgency: 'watch' },
        { id: 'calcium', label: 'No extra calcium in mid-pregnancy unless prescribed', urgency: 'urgent' },
        { id: 'xray', label: 'Day-55+ radiograph or ultrasound count logged', urgency: 'routine' },
        { id: 'diet', label: `Gestation/lactation food plan written before week 6 for this ${breed.name}`, urgency: 'routine' },
      ],
      timelineHeading: '63-day nutrition timeline',
      timeline: [
        { label: 'Pre-breed', title: 'Fix the baseline', detail: 'Adult maintenance diet that already agrees with this bitch. Do not start a new protein now.' },
        { label: 'Wk 1-5', title: 'Maintenance calories', detail: 'Quality over quantity. Folic acid/omega-3 only if the reproductive vet agrees.' },
        { label: 'Wk 6-8', title: 'Ramp calories 10-30%', detail: `Split meals. A giant ${breed.name} should not be asked to eat one huge late-pregnancy meal.` },
        { label: 'Wk 8-9', title: 'Whelp prep', detail: 'Puppy-growth or gestation/lactation diet. Know the 24-hour emergency clinic route.' },
        { label: 'Whelp', title: 'Labor fuel', detail: 'Small, frequent meals. Have calcium protocols from the veterinarian - not internet paste.' },
      ],
      protocolHeading: 'Reproductive records',
      protocol: [

        'Progesterone curve and breeding dates.',
        'Sire health disclosures and genetic tests.',
        'Weekly weight of the dam.',
        'Ultrasound/radiograph reports.',
        `Anesthesia and airway notes if C-section is likely (${breed.healthFocus}).`,
        `Emergency whelping contacts saved where anyone helping the ${breed.name} can find them.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Gestation diet notes',
      dietNotes: [

        'Switch to a gestation/lactation or puppy-growth formula in the last third - not a random "high protein" adult food.',
        'Free-choice is acceptable for some small dams in late pregnancy; large dams still need meal control to reduce bloat risk.',
        'Raw diets raise infection risk in pregnant bitches and neonates. Discuss pathogens with your veterinarian.',
        `Do not start a new treat protein mid-pregnancy in a ${breed.name} - GI flares are a bad distraction near whelp.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `How much should I feed a pregnant ${breed.name}?`,
          answer: `Near maintenance until the last third of pregnancy, then increase under veterinary guidance. The dam's BCS and puppy count matter more than a generic "double the food" rule.`,
        },
        {
          question: `Should I give calcium while my ${breed.name} is pregnant?`,
          answer: `Usually not before whelping. Unnecessary calcium can suppress parathyroid function and increase eclampsia risk. Follow the reproductive veterinarian - not supplement marketing.`,
        },
        {
          question: `When do I change food for a pregnant ${breed.name}?`,
          answer: `Often in the last third, to a gestation/lactation or puppy-growth formula the dam already tolerates. Do not rotate brands weekly for "extra nutrition."`,
        },
        {
          question: `What pre-breed tests does a ${breed.name} need?`,
          answer: `At minimum Brucella, and screening that matches ${breed.healthFocus} plus any club or veterinary reproduction requirements. Ideal BCS and vaccine/titer status belong in the same packet.`,
        },
      ],
    };
  },
  'postpartum-recovery-care': (entry) => {
    const { breed } = entry;
    return {
      lead: `A whelping-to-weaning recovery timeline for ${breed.name} dams - mastitis, eclampsia, and calorie math while puppies double their weight.`,
      overview: `The two weeks after a ${breed.name} whelps are a medical watch, not a photo shoot. Eclampsia, metritis, mastitis, and hypoglycemia in toy neonates are time-critical. Lactation calories can double or triple maintenance. Weigh the dam and each puppy daily. If this breed carries ${breed.healthFocus}, anesthesia leftovers from C-section, airway compromise, or orthopedic pain will stack on top of nursing load.`,
      checklistHeading: 'Dam and neonate red flags',
      checklist: [
        { id: 'eclampsia', label: 'Tremors, restlessness, stiffness, or fever in the dam', urgency: 'urgent' },
        { id: 'mastitis', label: 'Hot, purple, or painful mammary gland; reluctant to nurse', urgency: 'urgent' },
        { id: 'discharge', label: 'Foul or heavy vaginal discharge after day 1-2', urgency: 'urgent' },
        { id: 'pups', label: 'Puppy not gaining (or losing) over 24 hours', urgency: 'urgent' },
        { id: 'appetite', label: 'Dam off food while puppies still demand milk', urgency: 'watch' },
        { id: 'water', label: `Fresh water always available beside the ${breed.name} whelping area`, urgency: 'routine' },
      ],
      timelineHeading: 'Weaning-era timeline',
      timeline: [
        { label: '0-48 h', title: 'Colostrum window', detail: 'Confirm every puppy nurses. Tube-feed only with veterinary instruction.' },
        { label: 'Day 3-7', title: 'Peak eclampsia risk', detail: `Especially small ${breed.name}s with large litters. Keep the emergency clinic number on the whelping box.` },
        { label: 'Wk 2-3', title: 'Peak milk demand', detail: 'Free-choice or many small meals of lactation diet. Water always available.' },
        { label: 'Wk 3-4', title: 'Start weaning gruel', detail: 'Reduce dam calories as puppies eat more, or mastitis risk rises.' },
        { label: 'Wk 6-8', title: 'Wean + dam diet reset', detail: 'Return the dam toward adult calories. Schedule her postpartum exam and this litter\'s vaccine start.' },
      ],
      protocolHeading: 'Postpartum vault',
      protocol: [

        'Daily dam temperature and appetite.',
        'Daily puppy weights (same scale, grams).',
        'C-section or whelping notes, placenta count, and medications.',
        'Calcium or oxytocin administration times if used.',
        'Photos of mammary glands if any gland looks different.',
        `Postpartum exam date booked before the ${breed.name} leaves the clinic after whelp or C-section.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Lactation diet',
      dietNotes: [

        'Gestation/lactation or puppy-growth formulas are the default, not leftover pregnancy portions of adult food.',
        SIZE_CALORIE_NOTE[breed.size],
        'Do not crash-diet a nursing dam to "get her figure back." That is how milk and liver values fail.',
        `Keep a second bowl of water; a nursing ${breed.name} will drain the first faster than you expect.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `How long does ${breed.name} postpartum recovery take?`,
          answer: `Uterine involution takes weeks; most dams look clinically stable by 2-3 weeks if there is no infection. Full return to sport or breeding condition is longer. Keep the 2-week veterinary check.`,
        },
        {
          question: `When do I start weaning ${breed.name} puppies?`,
          answer: `Around 3-4 weeks introduce gruel; most litters wean by 6-8 weeks. Match the dam's calories down as milk demand falls.`,
        },
        {
          question: `What are eclampsia signs in a ${breed.name} dam?`,
          answer: `Restlessness, tremors, stiffness, panting, or collapse - especially in small dams with big litters in the first week. This is an emergency, not a wait-and-see moment.`,
        },
        {
          question: `How much should a nursing ${breed.name} eat?`,
          answer: `Often well above maintenance - sometimes double or more - using a lactation or puppy-growth diet. Follow appetite, milk supply, and BCS; do not force a crash diet while puppies are still nursing hard.`,
        },
      ],
    };
  },
  'adult-heart-health-screening': (entry) => {
    const { breed } = entry;
    return {
      lead: `A murmur-to-echo screening calendar for adult ${breed.name}s - because ${breed.healthFocus} and cardiac disease share the same appointment slot more often than owners think.`,
      overview: `Adult ${breed.name}s should have heart auscultation at every physical. Some lines in this breed need earlier echocardiography, Holter monitoring, or blood pressure checks. Do not wait for collapse. Store every murmur grade, echo PDF, and medication start date in chronological order - that is the difference between a useful cardiology referral and a shoebox of paper. Pair cardiac notes with weight: extra pounds are afterload the heart did not ask for.`,
      checklistHeading: 'Cardiac symptom checklist',
      checklist: [
        { id: 'collapse', label: 'Fainting, collapse, or sudden weakness', urgency: 'urgent' },
        { id: 'cough', label: 'Night cough, faster breathing at rest, or abdominal swell', urgency: 'urgent' },
        { id: 'exercise', label: 'Exercise intolerance that is new for this dog', urgency: 'watch' },
        { id: 'gums', label: 'Pale, blue, or brick-red gums with effort', urgency: 'urgent' },
        { id: 'meds', label: 'Cardiac meds given at inconsistent times', urgency: 'watch' },
        { id: 'rrr', label: `Asleep resting respiratory rate logged for this ${breed.name}`, urgency: 'routine' },
      ],
      timelineHeading: `Adult ${breed.name} screening timeline`,
      timeline: [
        { label: 'Annual', title: 'Auscultation + history', detail: 'Resting respiratory rate at home (count while asleep) is free surveillance.' },
        { label: 'If murmur', title: 'Echo decision', detail: 'Grade, timing, and breed risk decide urgency - not "we\'ll watch it."' },
        { label: 'Diagnosed', title: 'Staging', detail: 'Archive ACVIM stage, radiographs, blood pressure, and kidney values before meds start.' },
        { label: 'q 3-12 mo', title: 'Recheck', detail: 'Cardiology cadence depends on disease. Put the next echo in the same reminder system as vaccines.' },
        { label: 'Before dental', title: 'Clearance packet', detail: `Send the latest ${breed.name} echo date and med list with every anesthesia request.` },
      ],
      protocolHeading: 'Cardiac vault protocol',
      protocol: [

        'Resting respiratory rate log (goal typically <30/min asleep unless your cardiologist sets another number).',
        'Every ECG, Holter, and echo as PDF - not a portal screenshot that expires.',
        'Medication list with mg and time, including missed doses.',
        `Cross-link ${breed.healthFocus} so orthopedic limping is not misread as "just getting old."`,
        'Anesthesia history - last echo date must travel with the dog to dental procedures.',
        `Weight trend beside cardiac notes - a heavier ${breed.name} is harder on a stressed heart.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Heart-aware feeding',
      dietNotes: [

        'Ask before using boutique grain-free or exotic-legume formulas if dilated cardiomyopathy is on the differential.',
        'Moderate sodium if congestive failure is diagnosed - home-cooked "treats" are a hidden salt source.',
        'Keep the dog lean. Cardiac diets still require a gram scale.',
        `Do not add fish-oil or "heart chews" the same week you change a ${breed.name} cardiac med - change one variable at a time.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `When should a ${breed.name} get a heart echo?`,
          answer: `Any new murmur, arrhythmia, collapse, or unexplained cough deserves a conversation now. Some breeds screen before breeding even if they sound normal. Bring the full history; a single auscultation is not a lifetime clearance.`,
        },
        {
          question: `What resting respiratory rate is too high for a ${breed.name}?`,
          answer: `Many cardiologists want asleep rates consistently under about 30 breaths per minute. A rising trend is more useful than a single number. Log it in the vault.`,
        },
        {
          question: `Can diet prevent heart disease in a ${breed.name}?`,
          answer: `Diet supports care; it does not replace screening. Ask before boutique grain-free or exotic-legume formulas if DCM is a concern, and keep the dog lean either way.`,
        },
        {
          question: `What should I bring to a ${breed.name} cardiology visit?`,
          answer: `Prior echo PDFs, murmur grades, med times, resting respiratory rates, and a current weight. Clinics move faster when they are not rebuilding the timeline from memory.`,
        },
      ],
    };
  },
  'senior-joint-care': (entry) => {
    const { breed } = entry;
    return {
      lead: `A mobility-preservation plan for senior ${breed.name}s (typical lifespan ${breed.lifespanYears} years) - stairs, pain scores, and the overlap with ${breed.healthFocus}.`,
      overview: `Senior joint care is not a glucosamine commercial. It is lean mass, pain control, traction, and a dated limp diary. ${breed.size === 'giant' || breed.size === 'large' ? 'Large and giant breeds often show osteoarthritis in middle age, not "true senior."' : 'Small breeds hide pain by skipping jumps they used to take.'} Pair orthopedic notes with weight-management and cardiac screening so NSAIDs are not started on a dog with undiagnosed kidney or gut disease.`,
      checklistHeading: 'Mobility symptom checklist',
      checklist: [
        { id: 'rise', label: 'Hesitates to rise, jump, or use stairs', urgency: 'watch' },
        { id: 'yelp', label: 'Yelping when picked up or touched along the spine', urgency: 'urgent' },
        { id: 'knuckle', label: 'Knuckling, dragging nails, or incontinence - neurology, not "arthritis"', urgency: 'urgent' },
        { id: 'heat', label: 'Seeks heat, licks joints, or lags on the walk home', urgency: 'watch' },
        { id: 'weight', label: 'Weight up 10% from adult baseline', urgency: 'routine' },
        { id: 'video', label: `Gait video of this ${breed.name} dated within the last 90 days`, urgency: 'routine' },
      ],
      timelineHeading: 'Senior mobility timeline',
      timeline: [
        { label: 'Baseline', title: 'Video the gait', detail: `Film your ${breed.name} on leash, from the side, on a non-slip floor. Repeat every 90 days.` },
        { label: 'Workup', title: 'Pain vs neurology', detail: 'IVDD, lumbosacral disease, and cruciate tears are not all "give him a chew."' },
        { label: 'Plan', title: 'Multimodal', detail: 'Weight, NSAID or other analgesic, PT, ramps. One lever is not a plan.' },
        { label: 'q 3-6 mo', title: 'Kidney/liver check', detail: 'If on chronic NSAIDs, labs belong in the same vault as the limp diary.' },
        { label: 'Home', title: 'Environment pass', detail: `Add rugs and ramps where this ${breed.name} slips. Photograph the setup for sitters.` },
      ],
      protocolHeading: 'Joint-care records',
      protocol: [

        'Gait videos with dates.',
        'Radiograph/MRI summaries.',
        'Pain medication trials and side effects.',
        'Home modifications (ramps, rugs) photographed for sitters.',
        `Links to ${breed.healthFocus} clinical briefs when relevant.`,
        'NSAID start date beside the latest kidney/liver panel.',
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Joints and the bowl',
      dietNotes: [

        'The highest-yield "joint supplement" is a lean BCS.',
        'Prescription joint diets can help some dogs; they still require portion control.',
        'Omega-3 doses used in studies are higher than a fish-oil pearl from the grocery aisle - ask for mg of EPA/DHA.',
        `Do not add a new joint chew the same week you change ${breed.name} pain meds - you will not know what helped.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `When is a ${breed.name} a senior for joint care?`,
          answer: `Giant breeds may need a senior orthopedic plan by age 5-6; toy breeds often later. Use function, not birthday. Typical lifespan for this breed is ${breed.lifespanYears} years.`,
        },
        {
          question: `Do glucosamine chews work for ${breed.name}s?`,
          answer: `Evidence is mixed. They are optional. Weight control, pain assessment, and treating the actual diagnosis (cruciate, IVDD, hip dysplasia) are not optional.`,
        },
        {
          question: `Should I put my stiff ${breed.name} on an NSAID?`,
          answer: `Only after a veterinarian examines the dog and checks that kidneys, liver, and gut can tolerate it. Never start human pain meds. Track stool and appetite after the first doses.`,
        },
        {
          question: `How do ramps help a senior ${breed.name}?`,
          answer: `They cut repetitive jumping that flares joints and spines. Use them for cars and sofas, add rugs on slick floors, and keep nails short so traction stays honest.`,
        },
      ],
    };
  },
  'senior-kidney-support-diet': (entry) => {
    const { breed } = entry;
    return {
      lead: `A renal-aware feeding and staging guide for senior ${breed.name}s - creatinine trends, phosphorus, and appetite when ${breed.healthFocus} is already in the chart.`,
      overview: `Chronic kidney disease is staged with SDMA/creatinine, urine specific gravity, and blood pressure - not with a sudden switch to "senior food." ${breed.name}s in the ${breed.lifespanYears}-year lifespan band should have baseline labs while they still eat well. Prescription renal diets are a therapy once staging supports them. Early, aggressive protein restriction in a muscle-wasted senior can do harm. Keep every lab PDF in order; a 0.2 rise in creatinine is a story, not a single appointment.`,
      checklistHeading: 'Kidney watch list',
      checklist: [
        { id: 'thirst', label: 'New or marked increase in thirst and urination', urgency: 'watch' },
        { id: 'appetite', label: 'Dropping appetite, weight, or muscle along the spine', urgency: 'watch' },
        { id: 'vomit', label: 'Vomiting, oral ulcers, or ammonia breath', urgency: 'urgent' },
        { id: 'bp', label: 'No blood pressure check despite known kidney disease', urgency: 'urgent' },
        { id: 'nsaids', label: 'Over-the-counter pain meds given for joints', urgency: 'urgent' },
        { id: 'labs', label: `Last chemistry/SDMA date logged for this senior ${breed.name}`, urgency: 'routine' },
      ],
      timelineHeading: 'Renal staging timeline',
      timeline: [
        { label: 'Baseline', title: 'Adult senior labs', detail: 'Chemistry, SDMA, urinalysis, blood pressure. Archive as the comparison set.' },
        { label: 'IRIS I-II', title: 'Early disease', detail: 'Phosphorus control, blood pressure, and a diet discussion - not panic protein stripping.' },
        { label: 'IRIS III-IV', title: 'Prescription renal diet', detail: 'Appetite is the outcome. A perfect phosphorus number on a starving dog is a failure.' },
        { label: 'Ongoing', title: 'Recheck cadence', detail: 'Your veterinarian sets 1-6 month intervals. Put them in the same reminder engine as vaccines.' },
        { label: 'Flare', title: 'Appetite crash plan', detail: `Know which anti-nausea options the clinic wants for this ${breed.name} before a bad weekend hits.` },
      ],
      protocolHeading: 'Renal vault',
      protocol: [

        'Labs in chronological order with reference ranges.',
        'Blood pressure readings and cuff size.',
        'Diet name, phosphorus, and how much the dog actually ate.',
        'All NSAIDs, supplements, and flavored preventives.',
        'Hydration plans (SQ fluids) with volumes and dates.',
        `Muscle-condition notes beside weight so a skinny ${breed.name} is not called "stable" on the scale alone.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Kidney diet notes',
      dietNotes: [

        'Renal prescription foods are tools after diagnosis, not a birthday present at age 7.',
        'If the dog refuses the renal diet, talk to the veterinarian about rotation among renal formulas before giving up.',
        SIZE_CALORIE_NOTE[breed.size],
        `Warm the food slightly and schedule quiet meals - a nauseated ${breed.name} will not eat in a busy kitchen.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `When should I put my senior ${breed.name} on kidney food?`,
          answer: `After staging, not because the bag says senior. Early CKD may need phosphorus attention and blood pressure control first. Your veterinarian will match IRIS stage to diet.`,
        },
        {
          question: `Is a low-protein grocery diet enough for my ${breed.name}?`,
          answer: `No. Renal diets also manage phosphorus, sodium, and omega-3s, and they are feeding-trial tested. Random "low protein" adult food is not a kidney protocol.`,
        },
        {
          question: `My ${breed.name} refuses the renal diet - now what?`,
          answer: `Call the clinic before you quit. There are multiple renal formulas and textures. Appetite support often matters more than forcing one bag the dog hates.`,
        },
        {
          question: `Can my kidney ${breed.name} still take joint pain meds?`,
          answer: `Many over-the-counter and some prescription pain options are hard on kidneys. Do not add NSAIDs without the veterinarian who knows the latest creatinine and SDMA.`,
        },
      ],
    };
  },
  'senior-cognitive-care': (entry) => {
    const { breed } = entry;
    return {
      lead: `A cognitive-dysfunction watch and enrichment plan for aging ${breed.name}s - sleep disruption, sundowning, and ruling out pain first.`,
      overview: `Senior ${breed.name}s (lifespan often ${breed.lifespanYears} years) can look "confused" from pain, vision/hearing loss, metabolic disease, or true cognitive dysfunction. Treat the reversible list first. Then build a dated behavior log: night waking, house-soiling in a previously trained dog, getting stuck in corners, or failing to greet. Enrichment, lighting, and medication trials belong in the vault beside ${breed.healthFocus} so a neurologist sees the whole animal.`,
      checklistHeading: 'Cognitive and look-alike checklist',
      checklist: [
        { id: 'night', label: 'Pacing or vocalizing at night (sundowning)', urgency: 'watch' },
        { id: 'soil', label: 'Indoor soiling after years of being reliable', urgency: 'watch' },
        { id: 'pain', label: 'Pain not scored - arthritis can mimic dementia', urgency: 'urgent' },
        { id: 'labs', label: 'No senior labs this year (thyroid, kidney, liver)', urgency: 'urgent' },
        { id: 'vision', label: 'Bumping furniture; no recent eye exam', urgency: 'watch' },
        { id: 'video', label: `Night-pacing video saved for this ${breed.name} before the consult`, urgency: 'routine' },
      ],
      timelineHeading: 'Workup-to-support timeline',
      timeline: [
        { label: 'Week 0', title: 'Video the behavior', detail: 'Night pacing is easier to show than to describe. Note last meal and last pain med.' },
        { label: 'Week 1', title: 'Medical rule-out', detail: 'Labs, blood pressure, pain score, hearing/vision. Fix what is fixable.' },
        { label: 'Week 2-4', title: 'Environment', detail: 'Night lights, non-slip floors, a predictable routine. Reduce furniture rearranging.' },
        { label: 'Ongoing', title: 'Enrichment + meds', detail: 'Scent work, short training, prescription diets or selegiline if prescribed. Re-score monthly.' },
        { label: 'Monthly', title: 'Rescore', detail: `Update sleep, soiling, and orientation notes for this ${breed.name} so interventions have a before/after.` },
      ],
      protocolHeading: 'Cognitive care records',
      protocol: [

        'DISHAA or similar scores with dates.',
        'Pain and mobility notes - they confound cognition.',
        'Medication start/stop dates and sleep quality.',
        'Eye and hearing exam summaries.',
        'Senior lab PDFs from the rule-out visit.',
        `Household routine written so sitters do not scramble a fragile ${breed.name} schedule.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Brain-aging nutrition',
      dietNotes: [

        'Some therapeutic diets and MCT oil protocols are used as adjuncts - they are not a replacement for pain control.',
        'Keep feeding times predictable. Hunger at 3 a.m. is a routine problem as much as a brain problem.',
        'Watch calories; reduced activity plus "comfort snacks" accelerates joint decline.',
        `If you trial a brain-support diet for a ${breed.name}, change nothing else that week so sleep notes stay readable.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `How do I know if my ${breed.name} has dog dementia?`,
          answer: `You do not diagnose it from one odd night. Your veterinarian rules out pain, metabolic disease, and sensory loss, then looks at a pattern: disorientation, sleep-wake change, house-soiling, interaction change, and activity change.`,
        },
        {
          question: `Can diet reverse cognitive dysfunction in a ${breed.name}?`,
          answer: `Diet may support some dogs as part of a plan. It will not reverse severe disease. Track sleep and orientation so you can tell if an intervention did anything.`,
        },
        {
          question: `Why is my senior ${breed.name} pacing at night?`,
          answer: `Pain, full bladder, hunger, vision loss, and cognitive dysfunction all make the list. Video the behavior and bring med times to the appointment instead of guessing.`,
        },
        {
          question: `What enrichment helps an aging ${breed.name}?`,
          answer: `Short scent games, easy food puzzles, and familiar walks beat long chaotic outings. Keep the layout stable and light the hallway at night.`,
        },
      ],
    };
  },
  'end-of-life-comfort-care': (entry) => {
    const { breed } = entry;
    return {
      lead: `A hospice and quality-of-life framework for ${breed.name}s - pain, appetite, dignity, and the records a veterinarian needs for humane decisions.`,
      overview: `End-of-life care for a ${breed.name} is still medicine: pain scores, hydration, hygiene, and honest function. Typical lifespan is ${breed.lifespanYears} years, but ${breed.healthFocus} may shorten the good years if it was never tracked. Hospice is not "no vet." It is a plan for comfort with exit criteria written down before a crisis at 11 p.m. Keep a daily log the family can agree on - eating, walking, breathing, joy - so the last week is not argued from memory.`,
      checklistHeading: 'Comfort and crisis checklist',
      checklist: [
        { id: 'breathe', label: 'Labored breathing, collapse, or unrelenting cry-out pain', urgency: 'urgent' },
        { id: 'eat', label: 'Refusing food and water, or repeated vomiting', urgency: 'urgent' },
        { id: 'hygiene', label: 'Unable to rise to eliminate; sores from lying', urgency: 'watch' },
        { id: 'joy', label: 'No interest in people, place, or previously loved routines', urgency: 'watch' },
        { id: 'plan', label: 'No written after-hours euthanasia plan', urgency: 'routine' },
        { id: 'meds', label: `Current ${breed.name} comfort meds stocked with clear dosing times`, urgency: 'routine' },
      ],
      timelineHeading: 'Hospice planning timeline',
      timeline: [
        { label: 'Now', title: 'Quality-of-life scale', detail: 'Pick a 0-10 the household understands. Score daily. Trends matter more than one bad afternoon.' },
        { label: 'This week', title: 'Comfort orders', detail: 'Pain meds, anti-nausea, bedding, sling. Confirm which drugs are already in the house.' },
        { label: 'Before crisis', title: 'Logistics', detail: 'After-hours clinic, home euthanasia contacts, burial/cremation wishes, and who can legally consent.' },
        { label: 'Hard day', title: 'Use the scale', detail: `If the ${breed.name} scores below the family's written threshold, call - do not renegotiate the criteria at midnight.` },
        { label: 'After', title: 'Records', detail: 'Keep the medical timeline. It helps surviving pets\' veterinarians and helps the family see that care was complete.' },
      ],
      protocolHeading: 'Documents to have in one place',
      protocol: [

        'Current medication list with last doses.',
        `Latest labs and diagnosis list, including ${breed.healthFocus}.`,
        'Quality-of-life scores with dates.',
        'Emergency clinic and home-euthanasia phone numbers.',
        'Household decision-makers and the pet\'s microchip/clinic IDs.',
        `Written "good day / bad day" rules the whole family agreed on for this ${breed.name}.`,
        `Photograph labels and certificates the same day they are issued for this ${breed.name}.`,
      ],
      dietHeading: 'Comfort feeding',
      dietNotes: [

        'Appetite stimulants and anti-nausea meds often matter more than the "perfect" senior diet.',
        'Offer what the dog will eat unless a veterinarian has forbidden it for a specific reason (e.g. toxins).',
        'Do not force syringe feeding without a plan - aspiration is a miserable way to steal remaining time.',
        `Keep a short list of foods this ${breed.name} still accepts so night shifts are not inventing meals from scratch.`,
        `Keep the current bag photo and first ingredient list next to this ${breed.name} plan.`,
      ],
      faqs: [
        {
          question: `How do I know it is time for my ${breed.name}?`,
          answer: `When bad days outnumber good ones on a written scale, or when breathing, pain, or panic cannot be controlled. Your veterinarian can help interpret the log. You do not have to wait for a catastrophic night.`,
        },
        {
          question: `Is hospice giving up on a ${breed.name}?`,
          answer: `Hospice is structured comfort with a humane endpoint. It still uses veterinarians, pain control, and records. What it refuses is unhelpful heroics that only prolong distress.`,
        },
        {
          question: `What should I track daily for a hospice ${breed.name}?`,
          answer: `Appetite, water, pain, breathing ease, ability to rise and eliminate, and whether any joy moments still happen. Trends beat one hard afternoon.`,
        },
        {
          question: `Do I need an after-hours plan for my ${breed.name}?`,
          answer: `Yes. Write the clinic or home-euthanasia contact, who can consent, and where meds live before you need them at 11 p.m. Crisis improvisation is how families get stuck.`,
        },
      ],
    };
  },
};

export function getLifecyclePageContent(entry: LifecycleMatrixEntry): LifecyclePageContent {
  const builder = BUILDERS[entry.stage.slug];
  const raw = builder ? builder(entry) : BUILDERS['adult-weight-management'](entry);
  const rest = expandLifecycleBuilder(entry, raw);
  return {
    title: article(entry),
    ...rest,
    heroImage: LIFECYCLE_HERO[entry.stage.slug] ?? '/images/blog/blog-life-stage-care.webp',
    uniqueParagraphs: uniqueLifecycleParagraphs(entry),
    library: libraryLinksForLifecycle(entry.breed.slug, entry.stage.slug, entry.breed.healthFocus),
  };
}

export function getLifecycleHeadline(breed: LifecycleBreed, stage: LifecycleStage): string {
  return `${stage.label} for ${breed.name}s`;
}
