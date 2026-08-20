/**
 * Generate vaccination schedule page JSON in batches of 40.
 * Usage: node scripts/content-gen/generate-vaccination-pages.mjs [--batch N] [--all]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const breeds = JSON.parse(fs.readFileSync(path.join(root, 'content-data/breeds.json'), 'utf8'));
const outDir = path.join(root, 'content-data/generated/vaccinations');
const manifestPath = path.join(outDir, '_manifest.json');
const BATCH = 40;

fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const allFlag = args.includes('--all');
const batchIdx = (() => {
  const i = args.indexOf('--batch');
  return i >= 0 ? Number(args[i + 1]) : 1;
})();

function pickBooster(schedule) {
  const booster = schedule.find((e) => /booster/i.test(e.vaccine)) ?? schedule[schedule.length - 2] ?? schedule[0];
  return booster.vaccine.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function adultStage(species) {
  return species === 'cat' ? 'adult' : 'adult';
}

function clipMeta(s, max = 155) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trim()}…`;
}

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function weeksList(schedule) {
  return schedule.map((e) => `${e.age_weeks} weeks (${e.vaccine.split('(')[0].trim()})`).join('; ');
}

function firstIssue(breed) {
  return breed.common_health_issues[0] ?? 'breed-typical screening topics';
}

function secondIssue(breed) {
  return breed.common_health_issues[1] ?? breed.common_health_issues[0] ?? 'clinic wellness checks';
}

function bodyForBreed(breed) {
  const h = hashSlug(breed.slug);
  const young = breed.species === 'cat' ? 'kitten' : 'puppy';
  const coreName = breed.species === 'cat' ? 'FVRCP' : 'DA2PP / DHPP';
  const disease = breed.species === 'cat' ? 'panleukopenia' : 'parvovirus';
  const ages = breed.core_vaccines_schedule.map((e) => e.age_weeks).join(', ');
  const lastAge =
    breed.core_vaccines_schedule.find((v) => v.age_weeks >= 16)?.age_weeks ??
    breed.core_vaccines_schedule[breed.core_vaccines_schedule.length - 1]?.age_weeks ??
    16;
  const midAge = breed.core_vaccines_schedule[1]?.age_weeks ?? 12;
  const firstAge = breed.core_vaccines_schedule[0]?.age_weeks ?? 8;
  const issueA = firstIssue(breed);
  const issueB = secondIssue(breed);
  const issueC = breed.common_health_issues[2] ?? issueA;
  const n = breed.name;
  const variants = h % 5;

  const timingBlocks = [
    [
      `The ${n} core series (${coreName} plus rabies per law) is plotted at ${ages} weeks in the table above so a ${breed.size_category} ${young} is covered as maternal antibodies fade.`,
      `At ${breed.avg_weight_range}, ${n} visit logistics matter as much as antigens: book the ${lastAge}-week appointment before class, daycare, or boarding asks for proof.`,
      `Bring ${issueA.toLowerCase()} and ${issueB.toLowerCase()} into the ${n} exam-room conversation while you are already there for shots.`,
      `Rabies for a ${n} still follows local statute, and when the clinic allows you can pair it with the ≥${lastAge}-week core finish, then photograph the certificate into PetClues the same day.`,
    ],
    [
      `${n} owners tracking ${breed.avg_lifespan} lifespans still lose the mid-series booster more often than the first shot, and the unprotected gap after week ${firstAge} is where ${disease} risk concentrates for this ${young}.`,
      `Use the ${breed.core_vaccines_schedule.length}-row ${n} schedule as your only planning spine: ${weeksList(breed.core_vaccines_schedule)}.`,
      `Temperament note for ${n} handling: ${breed.temperament_summary.slice(0, 120)}. Schedule quieter appointment slots if that profile makes clinic visits harder, but do not skip the ${n} dose.`,
      `Lifestyle add-ons stay off this ${n} core list until your veterinarian maps exposure, so keep core dates sacred either way.`,
    ],
    [
      `Why timing is non-negotiable for ${n}s: each booster lands after the previous dose’s immunology window, usually every 2–4 weeks, until the ${n} series closes at about ${lastAge} weeks.`,
      `Size class ${breed.size_category} does not invent new viruses for the ${n}, but it does change crate fit, blood-draw ease, and how early you lock travel relative to the final ${coreName} booster.`,
      `Flag ${issueC.toLowerCase()} at ${n} vaccine checkups so the ${young}’s chart accumulates breed-relevant context, not just sticker dates.`,
      `When the ${n} series is complete, switch reminders to adult booster cadence instead of deleting the vaccine thread entirely.`,
    ],
    [
      `Colostrum fade is the clock behind this ${n} table, and doses at ${ages} weeks exist to immunize the ${young} while exposure (parks, foster homes, boarding intros) is rising.`,
      `Boarding desks ask for finished ${n} dates, not intentions, so a ${n} with only the first ${coreName} dose is still incomplete for most facilities.`,
      `${issueA} shows up often enough in ${n}s that vaccine day is also screening day — keep both on the same visit when possible.`,
      `Store the rabies label with the ${n} profile immediately; lost paperwork is the most common reason ${n} travel and kennel check-ins stall.`,
    ],
    [
      `Plan ${n} social milestones around the schedule rows, not the other way around, because the ${lastAge}-week finish is the usual green light clinics cite for broader ${n} exposure.`,
      `Weight range ${breed.avg_weight_range} and grooming needs (${breed.grooming_needs.slice(0, 80)}) belong in the same ${n} household ops list as vaccine dates when busy weeks collide.`,
      `If your ${n} is also monitored for ${issueB.toLowerCase()}, ask whether bloodwork or orthopedic checks can share a visit with a booster to cut missed ${n} appointments.`,
      `After the ${n} puppy/kitten series, keep adult ${coreName} and rabies renewals on 7/3/1-day reminders so year-two surprises disappear.`,
    ],
  ];

  const missedBlocks = [
    [
      `If your ${n} misses the dose scheduled near week ${midAge}, call the clinic the same day with product names — do not restart the ${n} series from memory.`,
      `The danger for a delayed ${n} is the gap, not the embarrassment, because ${disease} pressure stays real for an under-vaccinated ${young} even in clean-looking neighborhoods.`,
      `While waiting for the make-up ${coreName} visit, skip high-traffic dog parks / unknown-cat intros and keep the ${n} away from unvaccinated animals.`,
      `After catch-up, rewrite reminders for the next ${n} due date (7, 3, and 1 day prior) so the same miss does not recur.`,
    ],
    [
      `Delayed ${n} boosters usually need one well-timed catch-up, not a homemade double dose, because spacing rules protect the ${young} and guilt math does not.`,
      `Bring prior dates for every ${n} row (${ages} weeks on this page’s plan) so clinics can decide whether an extra ${coreName} booster is required based on gap length and age.`,
      `If rabies was the missed ${n} item, legal and boarding consequences stack on top of medical ones — restore compliance before the next ${n} kennel reservation.`,
      `PetClues should hold both the new ${n} due date and the certificate photo so household members stop arguing about which fridge sticky note is current.`,
    ],
    [
      `Owners postpone ${n} shots when the ${young} seems “a little off,” travel intervenes, or ${issueA.toLowerCase()} worries dominate the week — ask the clinic whether a same-week ${n} make-up is still appropriate instead of sliding to the annual exam.`,
      `Long gaps can leave ${n} antibody levels uncertain, so expect either an added booster or a titer conversation rather than a shrug.`,
      `Do not trade the missed ${n} dose for extra socialization; finish immunity first for this ${breed.size_category} ${breed.species}.`,
      `Reset the ${n} reminder stack the evening of the make-up appointment — including the eventual adult booster after the ${lastAge}-week finish.`,
    ],
  ];

  return [
    {
      heading: 'Why timing matters for this schedule',
      paragraphs: timingBlocks[variants],
    },
    {
      heading: 'If a dose is missed or delayed',
      paragraphs: missedBlocks[h % missedBlocks.length],
    },
  ];
}

function faqsForBreed(breed) {
  const finish =
    breed.core_vaccines_schedule.find((v) => v.age_weeks >= 16)?.age_weeks ?? 16;
  const young = breed.species === 'cat' ? 'kitten' : 'puppy';
  return [
    {
      question: `When does the ${breed.name} core vaccine series usually finish?`,
      answer: `This breed record completes core vaccines around ${finish} weeks of age, with rabies timed per local law. Your clinic may adjust intervals for the individual ${young}.`,
    },
    {
      question: `What should I do if my ${breed.name} misses a booster?`,
      answer: `Contact your veterinarian for a catch-up plan instead of restarting or skipping ahead. Keep prior dates handy and limit high-risk exposure until the series is current again.`,
    },
    {
      question: `Where can I read ${breed.name} health context beyond vaccines?`,
      answer: `See the ${breed.name} adult health guide for breed predispositions such as ${firstIssue(breed).toLowerCase()}, then bring those notes to wellness and vaccine visits.`,
    },
  ];
}

function breedPage(breed) {
  const reminderVaccine = pickBooster(breed.core_vaccines_schedule);
  const stage = adultStage(breed.species);
  const pathSlug = `${breed.slug}-vaccine-schedule`;
  const primaryKeyword = `${breed.name} vaccine schedule`;
  return {
    slug: pathSlug,
    path: `/vaccinations/${pathSlug}`,
    kind: 'breed',
    breedSlug: breed.slug,
    subjectName: breed.name,
    species: breed.species,
    primaryKeyword,
    metaDescription: clipMeta(
      `${primaryKeyword} with core ages in weeks. Set reminders so ${breed.name} boosters are not missed.`,
    ),
    reminderVaccine,
    breedHealthHref: `/breeds/${breed.slug}/${stage}-health-guide`,
    breedHealthLabel: `${breed.name} ${stage} health guide`,
    bodySections: bodyForBreed(breed),
    faqs: faqsForBreed(breed),
  };
}

/** 30 general (species / situation) pages — not breed-specific */
const GENERAL_SPECS = [
  {
    slug: 'puppy-vaccine-schedule',
    subjectName: 'Puppy',
    species: 'dog',
    primaryKeyword: 'puppy vaccine schedule',
    reminderVaccine: 'DA2PP / DHPP booster',
    schedule: [
      { vaccine: 'DA2PP / DHPP', age_weeks: 8 },
      { vaccine: 'DA2PP / DHPP booster', age_weeks: 12 },
      { vaccine: 'DA2PP / DHPP booster (complete series ≥16 weeks)', age_weeks: 16 },
      { vaccine: 'Rabies (per local law)', age_weeks: 16 },
    ],
    issues: ['Parvovirus exposure risk', 'Incomplete series before daycare', 'Lost shot records at rehoming'],
  },
  {
    slug: 'kitten-vaccine-schedule',
    subjectName: 'Kitten',
    species: 'cat',
    primaryKeyword: 'kitten vaccine schedule',
    reminderVaccine: 'FVRCP booster',
    schedule: [
      { vaccine: 'FVRCP', age_weeks: 8 },
      { vaccine: 'FVRCP booster', age_weeks: 12 },
      { vaccine: 'FVRCP booster (complete kitten series)', age_weeks: 16 },
      { vaccine: 'Rabies (per local law)', age_weeks: 16 },
    ],
    issues: ['Panleukopenia risk', 'Multi-cat household exposure', 'FeLV risk assessment'],
  },
  {
    slug: 'adult-dog-booster-schedule',
    subjectName: 'Adult dog',
    species: 'dog',
    primaryKeyword: 'adult dog booster schedule',
    reminderVaccine: 'DA2PP / DHPP adult booster',
    schedule: [
      { vaccine: 'DA2PP / DHPP adult booster', age_weeks: 52, age_label: '~1 year after puppy series' },
      { vaccine: 'Rabies booster (1- or 3-year product per law)', age_weeks: 52, age_label: 'Per product & law' },
      { vaccine: 'Lifestyle vaccines as indicated', age_weeks: 52, age_label: 'Annual risk review' },
    ],
    issues: ['Expired boarding proof', 'Mixed 1- vs 3-year labels', 'Forgotten lifestyle shots'],
  },
  {
    slug: 'adult-cat-booster-schedule',
    subjectName: 'Adult cat',
    species: 'cat',
    primaryKeyword: 'adult cat booster schedule',
    reminderVaccine: 'FVRCP adult booster',
    schedule: [
      { vaccine: 'FVRCP adult booster', age_weeks: 52, age_label: '~1 year after kitten series' },
      { vaccine: 'Rabies booster (per law / product)', age_weeks: 52, age_label: 'Per product & law' },
      { vaccine: 'FeLV if risk persists', age_weeks: 52, age_label: 'Lifestyle-dependent' },
    ],
    issues: ['Indoor-only assumptions', 'Multi-cat FeLV status', 'Lost clinic reminders'],
  },
  {
    slug: 'senior-dog-vaccine-schedule',
    subjectName: 'Senior dog',
    species: 'dog',
    primaryKeyword: 'senior dog vaccine schedule',
    reminderVaccine: 'core adult booster',
    schedule: [
      { vaccine: 'Core booster per titer/clinic protocol', age_weeks: 52, age_label: 'Annual wellness visit' },
      { vaccine: 'Rabies per local law', age_weeks: 52, age_label: 'Legal interval' },
      { vaccine: 'Risk-based lifestyle vaccines', age_weeks: 52, age_label: 'Discuss with vet' },
    ],
    issues: ['Comorbidity timing', 'Anesthesia-adjacent visits', 'Boarding still requires proof'],
  },
  {
    slug: 'senior-cat-vaccine-schedule',
    subjectName: 'Senior cat',
    species: 'cat',
    primaryKeyword: 'senior cat vaccine schedule',
    reminderVaccine: 'FVRCP booster',
    schedule: [
      { vaccine: 'FVRCP per clinic protocol', age_weeks: 52, age_label: 'Annual or risk-based' },
      { vaccine: 'Rabies per local law', age_weeks: 52, age_label: 'Legal interval' },
      { vaccine: 'FeLV only if exposure risk remains', age_weeks: 52, age_label: 'Lifestyle review' },
    ],
    issues: ['Kidney disease scheduling', 'Stress of clinic trips', 'Indoor risk reassessment'],
  },
  {
    slug: 'dog-rabies-vaccine-schedule',
    subjectName: 'Dog rabies',
    species: 'dog',
    primaryKeyword: 'dog rabies vaccine schedule',
    reminderVaccine: 'rabies booster',
    schedule: [
      { vaccine: 'First rabies dose', age_weeks: 16, age_label: 'Typically ≥12–16 weeks' },
      { vaccine: 'Rabies booster', age_weeks: 52, age_label: '~1 year later' },
      { vaccine: 'Subsequent 1- or 3-year boosters', age_weeks: 156, age_label: 'Per product & jurisdiction' },
    ],
    issues: ['Legal compliance', 'Travel certificates', 'Boarding denial without proof'],
  },
  {
    slug: 'cat-rabies-vaccine-schedule',
    subjectName: 'Cat rabies',
    species: 'cat',
    primaryKeyword: 'cat rabies vaccine schedule',
    reminderVaccine: 'rabies booster',
    schedule: [
      { vaccine: 'First rabies dose', age_weeks: 16, age_label: 'Typically ≥12–16 weeks' },
      { vaccine: 'Rabies booster', age_weeks: 52, age_label: '~1 year later' },
      { vaccine: 'Subsequent boosters per law', age_weeks: 156, age_label: 'Per product & jurisdiction' },
    ],
    issues: ['Local ordinance rules', 'Indoor exemption myths', 'Certificate mismatches'],
  },
  {
    slug: 'indoor-cat-vaccine-schedule',
    subjectName: 'Indoor cat',
    species: 'cat',
    primaryKeyword: 'indoor cat vaccine schedule',
    reminderVaccine: 'FVRCP booster',
    schedule: [
      { vaccine: 'FVRCP kitten series', age_weeks: 8, age_label: 'Start ~6–8 weeks' },
      { vaccine: 'FVRCP boosters through ≥16 weeks', age_weeks: 16 },
      { vaccine: 'Rabies per local law', age_weeks: 16 },
      { vaccine: 'Adult FVRCP / rabies boosters', age_weeks: 52, age_label: 'Risk-based interval' },
    ],
    issues: ['Under-vaccinating indoor cats', 'Window/door escape risk', 'Visitor pet exposure'],
  },
  {
    slug: 'outdoor-cat-vaccine-schedule',
    subjectName: 'Outdoor cat',
    species: 'cat',
    primaryKeyword: 'outdoor cat vaccine schedule',
    reminderVaccine: 'FeLV booster',
    schedule: [
      { vaccine: 'FVRCP series', age_weeks: 8 },
      { vaccine: 'FVRCP complete', age_weeks: 16 },
      { vaccine: 'Rabies', age_weeks: 16 },
      { vaccine: 'FeLV series if outdoor / multi-cat risk', age_weeks: 12, age_label: 'Per clinic protocol' },
    ],
    issues: ['FeLV/FIV exposure', 'Fight wound risk', 'Missed boosters during roaming season'],
  },
  {
    slug: 'rescue-dog-vaccine-catch-up',
    subjectName: 'Rescue dog catch-up',
    species: 'dog',
    primaryKeyword: 'rescue dog vaccine catch-up',
    reminderVaccine: 'DA2PP catch-up booster',
    schedule: [
      { vaccine: 'Exam + unknown-history core start', age_weeks: 0, age_label: 'Intake week' },
      { vaccine: 'Core booster', age_weeks: 2, age_label: '~2–4 weeks later' },
      { vaccine: 'Core booster to finish', age_weeks: 4, age_label: 'Until ≥16 weeks old or protocol met' },
      { vaccine: 'Rabies if due / unknown', age_weeks: 0, age_label: 'Per law & age' },
    ],
    issues: ['Unknown prior vaccines', 'Shelter paperwork gaps', 'Quarantine vs socialization timing'],
  },
  {
    slug: 'rescue-cat-vaccine-catch-up',
    subjectName: 'Rescue cat catch-up',
    species: 'cat',
    primaryKeyword: 'rescue cat vaccine catch-up',
    reminderVaccine: 'FVRCP catch-up booster',
    schedule: [
      { vaccine: 'Intake FVRCP if unknown', age_weeks: 0, age_label: 'Intake week' },
      { vaccine: 'FVRCP booster', age_weeks: 2, age_label: '~2–4 weeks later' },
      { vaccine: 'Series completion', age_weeks: 4, age_label: 'Until protocol met' },
      { vaccine: 'Rabies / FeLV per risk', age_weeks: 0, age_label: 'Clinic decision' },
    ],
    issues: ['URI during intake', 'FeLV/FIV testing first', 'Incomplete foster records'],
  },
  {
    slug: 'boarding-dog-vaccine-requirements',
    subjectName: 'Dog boarding vaccines',
    species: 'dog',
    primaryKeyword: 'dog boarding vaccine requirements',
    reminderVaccine: 'Bordetella booster',
    schedule: [
      { vaccine: 'DA2PP current', age_weeks: 0, age_label: 'Facility policy' },
      { vaccine: 'Rabies current', age_weeks: 0, age_label: 'Legal + facility' },
      { vaccine: 'Bordetella (often required)', age_weeks: 0, age_label: 'Per kennel' },
      { vaccine: 'Canine influenza (sometimes)', age_weeks: 0, age_label: 'Regional / facility' },
    ],
    issues: ['Last-minute booking denials', '14-day vaccine lead times', 'Certificate name mismatches'],
  },
  {
    slug: 'boarding-cat-vaccine-requirements',
    subjectName: 'Cat boarding vaccines',
    species: 'cat',
    primaryKeyword: 'cat boarding vaccine requirements',
    reminderVaccine: 'FVRCP booster',
    schedule: [
      { vaccine: 'FVRCP current', age_weeks: 0, age_label: 'Facility policy' },
      { vaccine: 'Rabies current', age_weeks: 0, age_label: 'Legal + facility' },
      { vaccine: 'FeLV sometimes required', age_weeks: 0, age_label: 'Ask cattery' },
    ],
    issues: ['Stress-related URI after boarding', 'Proof not on phone', 'Expired rabies labels'],
  },
  {
    slug: 'dog-distemper-parvo-schedule',
    subjectName: 'Dog distemper-parvo',
    species: 'dog',
    primaryKeyword: 'dog distemper parvo vaccine schedule',
    reminderVaccine: 'DA2PP / DHPP booster',
    schedule: [
      { vaccine: 'DA2PP / DHPP start', age_weeks: 8 },
      { vaccine: 'Booster', age_weeks: 12 },
      { vaccine: 'Final puppy booster ≥16 weeks', age_weeks: 16 },
      { vaccine: 'Adult booster', age_weeks: 52, age_label: 'Per clinic protocol' },
    ],
    issues: ['Parvo in under-vaccinated areas', 'Early socialization vs immunity tradeoff', 'Missed mid-series dose'],
  },
  {
    slug: 'cat-fvrcp-schedule',
    subjectName: 'Cat FVRCP',
    species: 'cat',
    primaryKeyword: 'cat FVRCP vaccine schedule',
    reminderVaccine: 'FVRCP booster',
    schedule: [
      { vaccine: 'FVRCP start', age_weeks: 8 },
      { vaccine: 'FVRCP booster', age_weeks: 12 },
      { vaccine: 'FVRCP complete', age_weeks: 16 },
      { vaccine: 'Adult FVRCP booster', age_weeks: 52, age_label: 'Annual or risk-based' },
    ],
    issues: ['Calicivirus outbreaks', 'Panleukopenia in rescues', 'Assuming one kitten shot is enough'],
  },
  {
    slug: 'first-year-puppy-shots',
    subjectName: 'First-year puppy shots',
    species: 'dog',
    primaryKeyword: 'first year puppy shots schedule',
    reminderVaccine: 'first adult DA2PP booster',
    schedule: [
      { vaccine: 'Core series visit 1', age_weeks: 8 },
      { vaccine: 'Core series visit 2', age_weeks: 12 },
      { vaccine: 'Core series visit 3 + rabies', age_weeks: 16 },
      { vaccine: 'First adult booster', age_weeks: 52, age_label: '~1 year of age' },
    ],
    issues: ['Gap after last puppy shot', 'Forgetting the 1-year booster', 'Daycare card expired'],
  },
  {
    slug: 'first-year-kitten-shots',
    subjectName: 'First-year kitten shots',
    species: 'cat',
    primaryKeyword: 'first year kitten shots schedule',
    reminderVaccine: 'first adult FVRCP booster',
    schedule: [
      { vaccine: 'FVRCP visit 1', age_weeks: 8 },
      { vaccine: 'FVRCP visit 2', age_weeks: 12 },
      { vaccine: 'FVRCP visit 3 + rabies', age_weeks: 16 },
      { vaccine: 'First adult booster', age_weeks: 52, age_label: '~1 year of age' },
    ],
    issues: ['Stopping after two kitten visits', 'FeLV decision deferred forever', 'Lost year-one reminder'],
  },
  {
    slug: 'dog-bordetella-timing',
    subjectName: 'Dog Bordetella',
    species: 'dog',
    primaryKeyword: 'dog Bordetella vaccine timing',
    reminderVaccine: 'Bordetella booster',
    schedule: [
      { vaccine: 'Initial Bordetella (intranasal/oral/injectable per clinic)', age_weeks: 8, age_label: 'Often ≥8 weeks' },
      { vaccine: 'Booster if protocol requires', age_weeks: 12, age_label: 'Product-dependent' },
      { vaccine: 'Repeat for boarding / daycare', age_weeks: 26, age_label: 'Every 6–12 months common' },
    ],
    issues: ['Facility 7–14 day lead time', 'Wrong route assumed valid', 'Annual vs every-6-months policies'],
  },
  {
    slug: 'dog-lepto-vaccine-timing',
    subjectName: 'Dog leptospirosis',
    species: 'dog',
    primaryKeyword: 'dog leptospirosis vaccine timing',
    reminderVaccine: 'Leptospirosis booster',
    schedule: [
      { vaccine: 'Lepto dose 1 (risk-based)', age_weeks: 12, age_label: 'Often ≥12 weeks' },
      { vaccine: 'Lepto dose 2', age_weeks: 15, age_label: '~2–4 weeks later' },
      { vaccine: 'Annual lepto booster if risk continues', age_weeks: 52, age_label: 'Yearly' },
    ],
    issues: ['Water/wildlife exposure', 'Urban flooding risk', 'Stopping after the first dose of the pair'],
  },
  {
    slug: 'multi-dog-household-vaccine-calendar',
    subjectName: 'Multi-dog household',
    species: 'dog',
    primaryKeyword: 'multi dog household vaccine calendar',
    reminderVaccine: 'shared booster reminders',
    schedule: [
      { vaccine: 'Per-dog core status audit', age_weeks: 0, age_label: 'Same week for all dogs' },
      { vaccine: 'Staggered appointments if needed', age_weeks: 1, age_label: 'Avoid same-day overload' },
      { vaccine: 'Aligned annual booster month', age_weeks: 52, age_label: 'Household calendar' },
    ],
    issues: ['One dog current, one overdue', 'Shared yard exposure', 'Confused certificate ownership'],
  },
  {
    slug: 'multi-cat-household-vaccine-calendar',
    subjectName: 'Multi-cat household',
    species: 'cat',
    primaryKeyword: 'multi cat household vaccine calendar',
    reminderVaccine: 'FVRCP household booster',
    schedule: [
      { vaccine: 'FeLV/FIV status known before mixing', age_weeks: 0, age_label: 'Before introductions' },
      { vaccine: 'FVRCP/rabies current for all', age_weeks: 0, age_label: 'Household baseline' },
      { vaccine: 'Aligned booster month', age_weeks: 52, age_label: 'Annual planning' },
    ],
    issues: ['New cat introducing URI', 'FeLV unknown newcomers', 'Carrier stress at clinic'],
  },
  {
    slug: 'traveling-dog-vaccine-checklist',
    subjectName: 'Traveling dog',
    species: 'dog',
    primaryKeyword: 'traveling dog vaccine checklist',
    reminderVaccine: 'rabies certificate renewal',
    schedule: [
      { vaccine: 'Rabies within destination rules', age_weeks: 0, age_label: 'Check country/state' },
      { vaccine: 'Core vaccines current', age_weeks: 0, age_label: 'Airline / boarding' },
      { vaccine: 'Health certificate timing', age_weeks: 0, age_label: 'Often ≤10 days before travel' },
    ],
    issues: ['Rabies titer / waiting periods', 'Certificate expiry mid-trip', 'Airline breed/vaccine forms'],
  },
  {
    slug: 'traveling-cat-vaccine-checklist',
    subjectName: 'Traveling cat',
    species: 'cat',
    primaryKeyword: 'traveling cat vaccine checklist',
    reminderVaccine: 'rabies certificate renewal',
    schedule: [
      { vaccine: 'Rabies within destination rules', age_weeks: 0, age_label: 'Check country/state' },
      { vaccine: 'FVRCP current', age_weeks: 0, age_label: 'Carrier / boarding' },
      { vaccine: 'Health certificate timing', age_weeks: 0, age_label: 'Often ≤10 days before travel' },
    ],
    issues: ['Carrier stress vs appointment timing', 'International microchip + rabies order', 'PDF not accepted at desk'],
  },
  {
    slug: 'dog-vaccine-after-missed-dose',
    subjectName: 'Dog missed dose',
    species: 'dog',
    primaryKeyword: 'dog vaccine after missed dose',
    reminderVaccine: 'catch-up DA2PP booster',
    schedule: [
      { vaccine: 'Call clinic with exact prior dates', age_weeks: 0, age_label: 'Same day you notice' },
      { vaccine: 'Catch-up core dose', age_weeks: 0, age_label: 'Clinic-directed' },
      { vaccine: 'Follow-up booster if required', age_weeks: 3, age_label: '~2–4 weeks if needed' },
    ],
    issues: ['DIY restart mistakes', 'Continued park visits while overdue', 'No updated reminders'],
  },
  {
    slug: 'cat-vaccine-after-missed-dose',
    subjectName: 'Cat missed dose',
    species: 'cat',
    primaryKeyword: 'cat vaccine after missed dose',
    reminderVaccine: 'catch-up FVRCP booster',
    schedule: [
      { vaccine: 'Call clinic with prior product names', age_weeks: 0, age_label: 'Same day' },
      { vaccine: 'Catch-up FVRCP', age_weeks: 0, age_label: 'Clinic-directed' },
      { vaccine: 'Additional booster if gap was long', age_weeks: 3, age_label: 'If advised' },
    ],
    issues: ['Assuming indoor = zero risk', 'URI postponements that never reschedule', 'FeLV plan abandoned'],
  },
  {
    slug: 'small-breed-puppy-vaccine-schedule',
    subjectName: 'Small-breed puppy',
    species: 'dog',
    primaryKeyword: 'small breed puppy vaccine schedule',
    reminderVaccine: 'DA2PP / DHPP booster',
    size_category: 'small',
    schedule: [
      { vaccine: 'DA2PP / DHPP', age_weeks: 8 },
      { vaccine: 'DA2PP / DHPP booster', age_weeks: 12 },
      { vaccine: 'DA2PP / DHPP final ≥16 weeks', age_weeks: 16 },
      { vaccine: 'Rabies', age_weeks: 16 },
    ],
    issues: ['Hypoglycemia postponing visits', 'Tracheal sensitivity handling', 'Same antigens, careful visit logistics'],
  },
  {
    slug: 'large-breed-puppy-vaccine-schedule',
    subjectName: 'Large-breed puppy',
    species: 'dog',
    primaryKeyword: 'large breed puppy vaccine schedule',
    reminderVaccine: 'DA2PP / DHPP booster',
    size_category: 'large',
    schedule: [
      { vaccine: 'DA2PP / DHPP', age_weeks: 8 },
      { vaccine: 'DA2PP / DHPP booster', age_weeks: 12 },
      { vaccine: 'DA2PP / DHPP final ≥16 weeks', age_weeks: 16 },
      { vaccine: 'Rabies', age_weeks: 16 },
    ],
    issues: ['Rapid growth visit scheduling', 'Joint discussion at vaccine exams', 'Early training class proof needs'],
  },
  {
    slug: 'toy-breed-puppy-vaccine-schedule',
    subjectName: 'Toy-breed puppy',
    species: 'dog',
    primaryKeyword: 'toy breed puppy vaccine schedule',
    reminderVaccine: 'DA2PP / DHPP booster',
    size_category: 'toy',
    schedule: [
      { vaccine: 'DA2PP / DHPP', age_weeks: 8 },
      { vaccine: 'DA2PP / DHPP booster', age_weeks: 12 },
      { vaccine: 'DA2PP / DHPP final ≥16 weeks', age_weeks: 16 },
      { vaccine: 'Rabies', age_weeks: 16 },
    ],
    issues: ['Tiny-patient handling stress', 'Dental topics crowding the visit', 'Missed doses after mild GI days'],
  },
  {
    slug: 'giant-breed-puppy-vaccine-schedule',
    subjectName: 'Giant-breed puppy',
    species: 'dog',
    primaryKeyword: 'giant breed puppy vaccine schedule',
    reminderVaccine: 'DA2PP / DHPP booster',
    size_category: 'giant',
    schedule: [
      { vaccine: 'DA2PP / DHPP', age_weeks: 8 },
      { vaccine: 'DA2PP / DHPP booster', age_weeks: 11 },
      { vaccine: 'DA2PP / DHPP booster', age_weeks: 14 },
      { vaccine: 'DA2PP / DHPP final ≥16 weeks', age_weeks: 16 },
      { vaccine: 'Rabies', age_weeks: 16 },
    ],
    issues: ['Extra booster visit logistics', 'Growth plate / nutrition questions at visits', 'Bloat education alongside vaccines'],
  },
];

function generalPage(spec) {
  const slug = spec.slug;
  const young = spec.species === 'cat' ? 'kitten' : 'puppy';
  const pet = spec.species === 'cat' ? 'cat' : 'dog';
  const issue0 = spec.issues[0];
  const issue1 = spec.issues[1] ?? spec.issues[0];
  const issue2 = spec.issues[2] ?? issue0;
  const ages = spec.schedule
    .map((e) => e.age_label ?? `${e.age_weeks} weeks`)
    .join('; ');
  const subject = spec.subjectName;

  return {
    slug,
    path: `/vaccinations/${slug}`,
    kind: 'general',
    subjectName: subject,
    species: spec.species,
    primaryKeyword: spec.primaryKeyword,
    metaDescription: clipMeta(
      `${spec.primaryKeyword}: timing table, what to do if a dose is late, and reminders before boosters are due.`,
    ),
    reminderVaccine: spec.reminderVaccine,
    size_category: spec.size_category,
    common_health_issues: spec.issues,
    schedule: spec.schedule,
    bodySections: [
      {
        heading: 'Why timing matters',
        paragraphs: [
          `This ${subject.toLowerCase()} plan sequences doses against ${issue0.toLowerCase()}, not against a vague “sometime this season” intention for your ${pet}.`,
          `Milestone labels on the ${subject.toLowerCase()} table (${ages}) are operational deadlines for daycare, boarding, travel, and multi-pet intros — a nearly finished ${subject.toLowerCase()} ${young} series is still incomplete.`,
          `If your household also wrestles with ${issue1.toLowerCase()} or ${issue2.toLowerCase()}, put those constraints on the same calendar thread as the ${spec.reminderVaccine} so one reminder system owns the ${subject.toLowerCase()} week.`,
        ],
      },
      {
        heading: 'If a dose is missed or delayed',
        paragraphs: [
          `Call the clinic with product names and prior dates the day you notice a missed ${subject.toLowerCase()} dose; catch-up timing depends on age and gap length for this ${pet} scenario.`,
          `Until the ${subject.toLowerCase()} series is current again, reduce the exposure pattern that matches ${issue0.toLowerCase()}, and do not wait for an annual wellness slot to ask about a ${subject.toLowerCase()} make-up dose.`,
          `After the visit, enable 7-, 3-, and 1-day nudges for the next ${spec.reminderVaccine} due date so the same ${subject.toLowerCase()} miss cannot hide inside a shared family calendar.`,
        ],
      },
    ],
    faqs: [
      {
        question: `Is this ${spec.primaryKeyword} a prescription?`,
        answer: `No. It is an editorial planning table aligned with common AAHA/AAFP-style windows and facility patterns. Your veterinarian sets the legal and medical plan for the individual ${pet}.`,
      },
      {
        question: `What if we already missed a date on this ${subject.toLowerCase()} schedule?`,
        answer: `Contact the clinic for catch-up timing. Bring prior records, limit high-risk exposure tied to ${issue0.toLowerCase()}, and reset reminders as soon as the next ${subject.toLowerCase()} due date is known.`,
      },
      {
        question: `How do reminders help with ${spec.reminderVaccine}?`,
        answer: `PetClues can nudge you 7, 3, and 1 day before that ${subject.toLowerCase()} booster is due so boarding and travel deadlines stop arriving as surprises.`,
      },
    ],
  };
}

const breedPages = breeds.map(breedPage);
const generalPages = GENERAL_SPECS.map(generalPage);
const allPages = [...breedPages, ...generalPages];

if (generalPages.length !== 30) throw new Error(`Expected 30 general pages, got ${generalPages.length}`);
if (breedPages.length !== 220) throw new Error(`Expected 220 breed pages, got ${breedPages.length}`);

const totalBatches = Math.ceil(allPages.length / BATCH);

function writeManifest(writtenSlugs) {
  const existing = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : { pages: [], updatedAt: null };
  const map = new Map(existing.pages.map((p) => [p.slug, p]));
  for (const slug of writtenSlugs) {
    const page = allPages.find((p) => p.slug === slug);
    map.set(slug, { slug, path: page.path, kind: page.kind, breedSlug: page.breedSlug ?? null });
  }
  const pages = [...map.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify({ updatedAt: new Date().toISOString(), count: pages.length, pages }, null, 2)}\n`,
  );
}

function writeBatch(batchNumber) {
  const start = (batchNumber - 1) * BATCH;
  const slice = allPages.slice(start, start + BATCH);
  if (slice.length === 0) {
    console.log(`Batch ${batchNumber} is empty (total batches ${totalBatches}).`);
    return [];
  }
  const written = [];
  for (const page of slice) {
    const file = path.join(outDir, `${page.slug}.json`);
    fs.writeFileSync(file, `${JSON.stringify(page, null, 2)}\n`);
    written.push(page.slug);
  }
  writeManifest(written);
  console.log(
    `Batch ${batchNumber}/${totalBatches}: wrote ${written.length} pages (${start + 1}–${start + written.length} of ${allPages.length})`,
  );
  return written;
}

if (allFlag) {
  for (let b = 1; b <= totalBatches; b++) writeBatch(b);
  console.log(`Done. Total pages: ${allPages.length} (220 breed + 30 general).`);
} else {
  writeBatch(batchIdx);
  console.log(`Next: node scripts/content-gen/generate-vaccination-pages.mjs --batch ${batchIdx + 1}`);
}
