/**
 * Maps programmatic pages onto existing editorial blog posts.
 * Extra links are hashed from the page seed so two breeds/cities do not
 * show the identical reading list.
 */

export type LibraryLink = {
  href: string;
  label: string;
};

type BlogRef = { slug: string; title: string };

const BLOG = {
  puppyVax: { slug: 'puppy-vaccination-schedule-2026', title: 'Puppy vaccination schedule 2026' },
  records: { slug: 'organize-pet-medical-records-online', title: 'Organize pet medical records online' },
  emergency: { slug: 'pet-emergency-information-card-guide', title: 'Pet emergency information card' },
  catVax: { slug: 'cat-vaccination-schedule-guide', title: 'Cat vaccination schedule' },
  meds: { slug: 'pet-medication-reminder-guide', title: 'Pet medication reminder guide' },
  feeding: { slug: 'dog-feeding-schedule-walk-tracker', title: 'Dog feeding schedule and walk tracker' },
  tracker: { slug: 'best-pet-health-tracker-app-2026', title: 'Best pet health tracker app 2026' },
  bills: { slug: 'vet-bill-organizer-pet-medical-bills', title: 'Vet bill organizer' },
  puppyCheck: { slug: 'new-puppy-checklist-health-records-vaccines', title: 'New puppy checklist' },
  kittenCheck: { slug: 'new-kitten-checklist-vet-vaccines-records', title: 'New kitten checklist' },
  senior: { slug: 'senior-dog-care-health-records-medication-tracker', title: 'Senior dog care and medication tracker' },
  sitter: { slug: 'pet-sitter-instructions-medical-emergency-info', title: 'Pet sitter medical instructions' },
  microchip: { slug: 'microchip-registration-guide-dogs-cats', title: 'Microchip registration guide' },
  heartworm: { slug: 'heartworm-prevention-schedule-reminder-dogs', title: 'Heartworm prevention schedule' },
  heartwormTracker: { slug: 'heartworm-pill-tracker', title: 'Heartworm pill tracker' },
  flea: { slug: 'flea-tick-prevention-calendar-pets', title: 'Flea and tick prevention calendar' },
  dental: { slug: 'dog-dental-care-schedule-cleanings-reminders', title: 'Dog dental care schedule' },
  travel: { slug: 'traveling-with-pets-health-documents-checklist', title: 'Traveling with pets document checklist' },
  boarding: { slug: 'pet-boarding-preparation-vaccination-records-health-forms', title: 'Boarding vaccination records and health forms' },
  weight: { slug: 'dog-weight-tracker-log-trends-vet-health', title: 'Dog weight tracker' },
  allergy: { slug: 'pet-allergy-tracker-symptoms-triggers-records', title: 'Pet allergy tracker' },
  clone: { slug: 'how-much-does-it-cost-to-clone-a-dog-2026', title: 'How much it costs to clone a dog in 2026' },
  ivdd: { slug: 'how-common-is-ivdd-in-corgis', title: 'How common IVDD is in Corgis' },
  rxFood: { slug: 'vet-authorization-certificate-prescription-food', title: 'Vet authorization for prescription food' },
  passport: { slug: 'what-is-a-digital-pet-passport', title: 'What a digital pet passport is' },
  push: { slug: 'veterinary-push-notification-reminders', title: 'Veterinary push notification reminders' },
  share: { slug: 'share-folders-for-pets', title: 'Share folders for pets' },
} as const;

const POOL: BlogRef[] = Object.values(BLOG);

export const LIFECYCLE_STAGE_BLOGS: Record<string, BlogRef[]> = {
  'puppy-vaccination-schedule': [BLOG.puppyVax, BLOG.puppyCheck, BLOG.push, BLOG.records],
  'puppy-nutrition-guide': [BLOG.feeding, BLOG.weight, BLOG.puppyCheck, BLOG.tracker],
  'teething-and-dental-care': [BLOG.dental, BLOG.puppyCheck, BLOG.meds, BLOG.records],
  'spay-neuter-recovery-timeline': [BLOG.meds, BLOG.emergency, BLOG.bills, BLOG.push],
  'adolescent-growth-diet': [BLOG.feeding, BLOG.weight, BLOG.tracker, BLOG.puppyVax],
  'adult-weight-management': [BLOG.weight, BLOG.feeding, BLOG.tracker, BLOG.heartworm],
  'best-food-for-allergies': [BLOG.allergy, BLOG.rxFood, BLOG.feeding, BLOG.records],
  'working-dog-fueling-plan': [BLOG.feeding, BLOG.weight, BLOG.tracker, BLOG.heartwormTracker],
  'breeding-pregnancy-diet': [BLOG.feeding, BLOG.records, BLOG.meds, BLOG.share],
  'postpartum-recovery-care': [BLOG.emergency, BLOG.meds, BLOG.sitter, BLOG.records],
  'adult-heart-health-screening': [BLOG.tracker, BLOG.records, BLOG.senior, BLOG.bills],
  'senior-joint-care': [BLOG.senior, BLOG.weight, BLOG.ivdd, BLOG.meds],
  'senior-kidney-support-diet': [BLOG.senior, BLOG.rxFood, BLOG.meds, BLOG.tracker],
  'senior-cognitive-care': [BLOG.senior, BLOG.emergency, BLOG.sitter, BLOG.share],
  'end-of-life-comfort-care': [BLOG.emergency, BLOG.share, BLOG.records, BLOG.passport],
};

export const RESOURCE_TOPIC_BLOGS: Record<string, BlogRef[]> = {
  'dog-boarding-vaccine-requirements': [BLOG.boarding, BLOG.puppyVax, BLOG.passport, BLOG.records],
  'cat-boarding-vaccine-requirements': [BLOG.catVax, BLOG.boarding, BLOG.kittenCheck, BLOG.passport],
  'dog-daycare-shot-records': [BLOG.boarding, BLOG.puppyVax, BLOG.flea, BLOG.records],
  'pet-sitter-medical-handoff': [BLOG.sitter, BLOG.share, BLOG.meds, BLOG.emergency],
  'emergency-vet-records-kit': [BLOG.emergency, BLOG.passport, BLOG.meds, BLOG.records],
  'rabies-certificate-copy': [BLOG.records, BLOG.passport, BLOG.puppyVax, BLOG.microchip],
  'titer-records-for-travel': [BLOG.travel, BLOG.passport, BLOG.records, BLOG.puppyVax],
  'puppy-class-vaccine-proof': [BLOG.puppyVax, BLOG.puppyCheck, BLOG.boarding, BLOG.push],
  'airline-pet-health-certificate': [BLOG.travel, BLOG.passport, BLOG.records, BLOG.microchip],
  'lost-pet-qr-id': [BLOG.microchip, BLOG.passport, BLOG.emergency, BLOG.share],
  'new-puppy-health-folder': [BLOG.puppyCheck, BLOG.puppyVax, BLOG.heartwormTracker, BLOG.share],
  'new-kitten-health-folder': [BLOG.kittenCheck, BLOG.catVax, BLOG.records, BLOG.share],
  'senior-dog-medication-log': [BLOG.senior, BLOG.meds, BLOG.push, BLOG.rxFood],
  'multi-pet-household-records': [BLOG.share, BLOG.records, BLOG.meds, BLOG.heartwormTracker],
  'groomer-vaccine-proof': [BLOG.boarding, BLOG.puppyVax, BLOG.passport, BLOG.records],
  'dog-park-vaccine-rules': [BLOG.puppyVax, BLOG.boarding, BLOG.flea, BLOG.heartworm],
  'foster-intake-records': [BLOG.records, BLOG.share, BLOG.meds, BLOG.microchip],
  'moving-with-pets-documents': [BLOG.travel, BLOG.records, BLOG.passport, BLOG.share],
  'pet-insurance-claim-packet': [BLOG.bills, BLOG.records, BLOG.share, BLOG.tracker],
  'after-hours-emergency-card': [BLOG.emergency, BLOG.passport, BLOG.sitter, BLOG.meds],
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function toLink(ref: BlogRef): LibraryLink {
  return { href: `/blog/${ref.slug}`, label: ref.title };
}

function healthFocusExtras(healthFocus: string): BlogRef[] {
  const text = healthFocus.toLowerCase();
  const extras: BlogRef[] = [];
  if (text.includes('ivdd') || text.includes('disc') || text.includes('spine')) extras.push(BLOG.ivdd);
  if (text.includes('heart') || text.includes('cardiac') || text.includes('valve') || text.includes('cardiomyopathy')) {
    extras.push(BLOG.tracker, BLOG.senior);
  }
  if (text.includes('allerg') || text.includes('atopic') || text.includes('skin')) extras.push(BLOG.allergy, BLOG.rxFood);
  if (text.includes('dental') || text.includes('tracheal')) extras.push(BLOG.dental);
  if (text.includes('obes') || text.includes('weight') || text.includes('joint') || text.includes('hip')) {
    extras.push(BLOG.weight, BLOG.feeding);
  }
  if (text.includes('kidney') || text.includes('renal')) extras.push(BLOG.rxFood, BLOG.senior);
  if (text.includes('bloat') || text.includes('gastric')) extras.push(BLOG.emergency, BLOG.feeding);
  if (extras.length === 0) extras.push(BLOG.clone);
  return extras;
}

export function libraryLinksForLifecycle(breedSlug: string, stageSlug: string, healthFocus: string): LibraryLink[] {
  const primary = LIFECYCLE_STAGE_BLOGS[stageSlug] ?? [BLOG.records, BLOG.tracker, BLOG.passport];
  const extras = healthFocusExtras(healthFocus);
  const seed = `${breedSlug}/${stageSlug}`;
  const offset = hashSeed(seed) % POOL.length;
  const salted = POOL[offset]!;
  const merged = [...primary, ...extras, salted];
  const seen = new Set<string>();
  const links: LibraryLink[] = [];
  for (const ref of merged) {
    if (seen.has(ref.slug)) continue;
    seen.add(ref.slug);
    links.push(toLink(ref));
    if (links.length >= 5) break;
  }
  return links;
}

export function libraryLinksForResource(citySlug: string, topicSlug: string): LibraryLink[] {
  const primary = RESOURCE_TOPIC_BLOGS[topicSlug] ?? [BLOG.records, BLOG.passport, BLOG.share];
  const offset = hashSeed(`${citySlug}/${topicSlug}`) % POOL.length;
  const salted = POOL[(offset + 7) % POOL.length]!;
  const merged = [...primary, salted];
  const seen = new Set<string>();
  const links: LibraryLink[] = [];
  for (const ref of merged) {
    if (seen.has(ref.slug)) continue;
    seen.add(ref.slug);
    links.push(toLink(ref));
    if (links.length >= 5) break;
  }
  return links;
}
