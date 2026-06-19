import type { BlogCategoryId } from '@/data/blogCategories';
import { DOMINANCE_BLOG_IMAGE_FILE } from '@/data/dominanceBlogImageMappings';

/** All local blog hero assets (public/images/blog). */
export const BLOG_HERO_IMAGE_FILES = [
  'blog-best-pet-health-app.webp',
  'blog-bird-care.webp',
  'blog-cat-health-records.webp',
  'blog-cat-vaccination.webp',
  'blog-dachshund-mobility.webp',
  'blog-daily-checkin.webp',
  'blog-dog-dental-care.webp',
  'blog-dog-vaccination-guide.webp',
  'blog-dog-weight-tracker.webp',
  'blog-emergency-passport.webp',
  'blog-exotic-pet-records.webp',
  'blog-ferret-care.webp',
  'blog-flea-tick-prevention.webp',
  'blog-flying-with-cats.webp',
  'blog-french-bulldog-health.webp',
  'blog-german-shepherd-hip.webp',
  'blog-guinea-pig-wellness.webp',
  'blog-heartworm-prevention.webp',
  'blog-labrador-joint-care.webp',
  'blog-life-stage-care.webp',
  'blog-maine-coon-health.webp',
  'blog-medication-reminder.webp',
  'blog-microchip-registration.webp',
  'blog-new-kitten-checklist.webp',
  'blog-pet-allergy-tracker.webp',
  'blog-pet-boarding.webp',
  'blog-pet-records-timeline.webp',
  'blog-pet-records.webp',
  'blog-pet-sitter-instructions.webp',
  'blog-poodle-grooming-health.webp',
  'blog-puppy-checklist.webp',
  'blog-puppy-vaccination.webp',
  'blog-rabbit-care.webp',
  'blog-senior-cat-care.webp',
  'blog-senior-dog.webp',
  'blog-siamese-cat-wellness.webp',
  'blog-snake-care.webp',
  'blog-travel-pets.webp',
  'blog-vet-bill-organizer.webp',
] as const;

type HeroImageRule = {
  pattern: RegExp;
  file: (typeof BLOG_HERO_IMAGE_FILES)[number];
};

/** Ordered most-specific first. No hash/random fallbacks. */
const HERO_IMAGE_RULES: HeroImageRule[] = [
  { pattern: /french.?bulldog|boas|brachycephalic/i, file: 'blog-french-bulldog-health.webp' },
  { pattern: /german.?shepherd|husky|guard.?dog|marathon|high.?energy/i, file: 'blog-german-shepherd-hip.webp' },
  { pattern: /golden.?retriever|labrador|retriever|tplo|cruciate|acl/i, file: 'blog-labrador-joint-care.webp' },
  { pattern: /dachshund|corgi|ivdd|spine|mobility/i, file: 'blog-dachshund-mobility.webp' },
  { pattern: /poodle|doodle|groom|shed/i, file: 'blog-poodle-grooming-health.webp' },
  { pattern: /maine.?coon/i, file: 'blog-maine-coon-health.webp' },
  { pattern: /siamese|bengal|oriental|vocal.?cat/i, file: 'blog-siamese-cat-wellness.webp' },
  { pattern: /sphynx/i, file: 'blog-cat-health-records.webp' },
  { pattern: /parrot|avian/i, file: 'blog-bird-care.webp' },
  { pattern: /bird(?!.?care)/i, file: 'blog-bird-care.webp' },
  { pattern: /snake|reptile|bearded|iguana/i, file: 'blog-snake-care.webp' },
  { pattern: /rabbit/i, file: 'blog-rabbit-care.webp' },
  { pattern: /guinea.?pig/i, file: 'blog-guinea-pig-wellness.webp' },
  { pattern: /ferret/i, file: 'blog-ferret-care.webp' },
  { pattern: /exotic/i, file: 'blog-exotic-pet-records.webp' },
  { pattern: /dental|teeth|plaque|gingivitis|cleaning/i, file: 'blog-dog-dental-care.webp' },
  { pattern: /kitten|cat.?vaccin|felv/i, file: 'blog-cat-vaccination.webp' },
  { pattern: /puppy|parvo|puppy.?vaccin/i, file: 'blog-puppy-vaccination.webp' },
  { pattern: /vaccin|rabies|bordetella|kennel.?cough|titer/i, file: 'blog-dog-vaccination-guide.webp' },
  { pattern: /heartworm|parvo/i, file: 'blog-heartworm-prevention.webp' },
  { pattern: /flea|tick|lepto|fecal|worm|ringworm/i, file: 'blog-flea-tick-prevention.webp' },
  { pattern: /allerg|cytopoint|apoquel|itch|paw.?lick|hot.?spot|hypoallergenic/i, file: 'blog-pet-allergy-tracker.webp' },
  { pattern: /diabetes|insulin|librela|solensia|cbd|prescription|refill|medication/i, file: 'blog-medication-reminder.webp' },
  { pattern: /bill|invoice|insurance|cost|price|wellness.?plan|negotiat/i, file: 'blog-vet-bill-organizer.webp' },
  { pattern: /fly.*cat|cat.*cabin|flying.?with.?cat/i, file: 'blog-flying-with-cats.webp' },
  { pattern: /travel|flight|airline|cargo|hawaii|mexico|defra|usda|quarantine|border|hotel/i, file: 'blog-travel-pets.webp' },
  { pattern: /passport|sitter|rover|boarder|walker|neighbor|handoff|daycare|boarding/i, file: 'blog-pet-sitter-instructions.webp' },
  { pattern: /euthanasia|snake.?bite|toxic|poison|seizure|paresis|collapse|emergency|urgent|er /i, file: 'blog-emergency-passport.webp' },
  { pattern: /microchip/i, file: 'blog-microchip-registration.webp' },
  { pattern: /weight|obesity|great.?dane|giant.?breed|feed/i, file: 'blog-dog-weight-tracker.webp' },
  { pattern: /senior.?cat|hyperthyroid|kidney|urine|litter.?box|uti|flutd/i, file: 'blog-senior-cat-care.webp' },
  { pattern: /senior|arthritis|hospice|end.?of.?life/i, file: 'blog-senior-dog.webp' },
  { pattern: /tracker|gadget|smart|tech|airtag|fi.?collar|whistle|furbo|dna|microbiome|ai |telehealth|petclues/i, file: 'blog-best-pet-health-app.webp' },
  { pattern: /new.?kitten/i, file: 'blog-new-kitten-checklist.webp' },
  { pattern: /new.?dog|adopt|puppy|shelter/i, file: 'blog-puppy-checklist.webp' },
  { pattern: /timeline|history|record|organiz|vault|archive|bloodwork|cbc|chem|mri|x-?ray|ultrasound|oncology|tumor/i, file: 'blog-pet-records-timeline.webp' },
  { pattern: /daily|check.?in|routine|schedule/i, file: 'blog-daily-checkin.webp' },
  { pattern: /life.?stage|lifestyle|low.?maintenance/i, file: 'blog-life-stage-care.webp' },
  { pattern: /cat|feline/i, file: 'blog-cat-health-records.webp' },
  { pattern: /dog|canine/i, file: 'blog-dog-vaccination-guide.webp' },
];

const CATEGORY_DEFAULT: Partial<Record<BlogCategoryId, (typeof BLOG_HERO_IMAGE_FILES)[number]>> = {
  'vet-finance': 'blog-vet-bill-organizer.webp',
  'breed-lifestyle': 'blog-life-stage-care.webp',
  'symptom-triage': 'blog-emergency-passport.webp',
  'pet-travel': 'blog-travel-pets.webp',
  'pet-tech': 'blog-best-pet-health-app.webp',
  'dog-health': 'blog-dog-vaccination-guide.webp',
  'cat-health': 'blog-cat-health-records.webp',
  'bird-care': 'blog-bird-care.webp',
  'exotic-pets': 'blog-exotic-pet-records.webp',
  'pet-records': 'blog-pet-records.webp',
  'petclues-guides': 'blog-life-stage-care.webp',
};

export function resolveBlogHeroImageFile(
  slug: string,
  title: string,
  tags: string[] = [],
  category?: BlogCategoryId,
): (typeof BLOG_HERO_IMAGE_FILES)[number] {
  const dominance = DOMINANCE_BLOG_IMAGE_FILE[slug];
  if (dominance) {
    return dominance as (typeof BLOG_HERO_IMAGE_FILES)[number];
  }

  const haystack = `${slug} ${title} ${tags.join(' ')}`;

  for (const rule of HERO_IMAGE_RULES) {
    if (rule.pattern.test(haystack)) {
      return rule.file;
    }
  }

  if (category && CATEGORY_DEFAULT[category]) {
    return CATEGORY_DEFAULT[category]!;
  }

  return 'blog-pet-records.webp';
}

export function resolveBlogHeroImagePath(
  slug: string,
  title: string,
  tags: string[] = [],
  category?: BlogCategoryId,
): string {
  return `/images/blog/${resolveBlogHeroImageFile(slug, title, tags, category)}`;
}

export function resolveBlogInlineImagePath(
  slug: string,
  title: string,
  tags: string[] = [],
  category?: BlogCategoryId,
): string {
  const primary = resolveBlogHeroImageFile(slug, title, tags, category);
  const haystack = `${slug} ${title} ${tags.join(' ')}`;

  for (const rule of HERO_IMAGE_RULES) {
    if (rule.pattern.test(haystack) && rule.file !== primary) {
      return `/images/blog/${rule.file}`;
    }
  }

  if (primary.includes('cat')) return '/images/blog/blog-cat-vaccination.webp';
  if (primary.includes('dog')) return '/images/blog/blog-puppy-checklist.webp';
  if (primary.includes('travel')) return '/images/blog/blog-emergency-passport.webp';
  if (primary.includes('emergency')) return '/images/blog/blog-vet-bill-organizer.webp';
  return '/images/blog/blog-pet-records-timeline.webp';
}
