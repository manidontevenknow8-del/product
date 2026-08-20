/**
 * Expand content-data/breeds.json to 220 records (200 dogs + 20 cats)
 * using TOP_DOG_BREEDS from lifecycleMatrix.ts plus a curated cat list.
 * Preserves hand-authored sample records when present.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const breedsPath = path.join(root, 'content-data/breeds.json');
const matrixPath = path.join(root, 'src/data/lifecycleMatrix.ts');

const DOG_SCHEDULE = [
  { vaccine: 'DA2PP / DHPP (distemper, adenovirus, parvovirus, parainfluenza)', age_weeks: 8 },
  { vaccine: 'DA2PP / DHPP booster', age_weeks: 12 },
  { vaccine: 'DA2PP / DHPP booster (complete series ≥16 weeks)', age_weeks: 16 },
  { vaccine: 'Rabies (per local law; typically first dose ≥12 weeks)', age_weeks: 16 },
];

const CAT_SCHEDULE = [
  { vaccine: 'FVRCP (feline viral rhinotracheitis, calicivirus, panleukopenia)', age_weeks: 8 },
  { vaccine: 'FVRCP booster', age_weeks: 12 },
  { vaccine: 'FVRCP booster (complete kitten series)', age_weeks: 16 },
  { vaccine: 'Rabies (per local law; typically ≥12 weeks)', age_weeks: 16 },
];

/** Slight timing variants so size classes are not identical tables. */
const DOG_SCHEDULE_TOY = [
  { vaccine: 'DA2PP / DHPP (distemper, adenovirus, parvovirus, parainfluenza)', age_weeks: 8 },
  { vaccine: 'DA2PP / DHPP booster', age_weeks: 12 },
  { vaccine: 'DA2PP / DHPP booster (complete series ≥16 weeks)', age_weeks: 16 },
  { vaccine: 'Rabies (per local law; typically first dose ≥12 weeks)', age_weeks: 16 },
];

const DOG_SCHEDULE_GIANT = [
  { vaccine: 'DA2PP / DHPP (distemper, adenovirus, parvovirus, parainfluenza)', age_weeks: 8 },
  { vaccine: 'DA2PP / DHPP booster', age_weeks: 11 },
  { vaccine: 'DA2PP / DHPP booster', age_weeks: 14 },
  { vaccine: 'DA2PP / DHPP booster (complete series ≥16 weeks)', age_weeks: 16 },
  { vaccine: 'Rabies (per local law; typically first dose ≥12 weeks)', age_weeks: 16 },
];

const CATS = [
  {
    slug: 'domestic-shorthair',
    name: 'Domestic Shorthair',
    size_category: 'medium',
    avg_weight_range: '8-12 lb (3.5-5.5 kg)',
    avg_lifespan: '12-18 years (indoor)',
    common_health_issues: [
      'Dental disease',
      'Obesity',
      'Chronic kidney disease (senior)',
      'Hyperthyroidism (senior)',
      'Lower urinary tract disease (FLUTD/FIC)',
    ],
    grooming_needs:
      'Weekly brushing for most coats; nail trims and dental home care as advised by the veterinarian.',
    temperament_summary:
      'Variable mixed-breed temperaments; typically adaptable companion cats with individual energy levels.',
  },
  {
    slug: 'maine-coon',
    name: 'Maine Coon',
    size_category: 'large',
    avg_weight_range: '10-25 lb (4.5-11 kg)',
    avg_lifespan: '12-15 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Hip dysplasia',
      'Spinal muscular atrophy (SMA) in some lines',
      'Dental tartar',
      'Obesity if under-exercised',
    ],
    grooming_needs: 'Several brushings per week for the long coat; check for mats behind ears and under legs.',
    temperament_summary: 'Large, social companion breed often described as dog-like in attachment and play.',
  },
  {
    slug: 'siamese',
    name: 'Siamese',
    size_category: 'medium',
    avg_weight_range: '8-14 lb (3.5-6.5 kg)',
    avg_lifespan: '12-20 years',
    common_health_issues: [
      'Dental disease',
      'Respiratory sensitivity',
      'Amyloidosis (some lines)',
      'Progressive retinal atrophy risk',
      'Anxiety with understimulation',
    ],
    grooming_needs: 'Short coat; weekly wipe-downs and regular dental care.',
    temperament_summary: 'Vocal, people-oriented, high-engagement breed that thrives on interaction.',
  },
  {
    slug: 'ragdoll',
    name: 'Ragdoll',
    size_category: 'large',
    avg_weight_range: '10-20 lb (4.5-9 kg)',
    avg_lifespan: '12-17 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Obesity',
      'Urinary tract sensitivity',
      'Dental disease',
      'Low outdoor survival instinct',
    ],
    grooming_needs: 'Semi-long coat needs regular brushing to prevent mats.',
    temperament_summary: 'Relaxed, affectionate indoor companion often content with calm household routines.',
  },
  {
    slug: 'persian',
    name: 'Persian',
    size_category: 'medium',
    avg_weight_range: '7-12 lb (3-5.5 kg)',
    avg_lifespan: '12-17 years',
    common_health_issues: [
      'Brachycephalic airway concerns',
      'Tear staining and eye irritation',
      'Polycystic kidney disease (PKD) in some lines',
      'Dental crowding',
      'Heat intolerance',
    ],
    grooming_needs: 'Daily brushing for the long coat; clean facial folds and eye corners regularly.',
    temperament_summary: 'Quiet, indoor-oriented companion that prefers predictable, low-chaos spaces.',
  },
  {
    slug: 'bengal',
    name: 'Bengal',
    size_category: 'medium',
    avg_weight_range: '8-15 lb (3.5-7 kg)',
    avg_lifespan: '12-16 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'GI sensitivity',
      'Progressive retinal atrophy risk',
      'High enrichment needs (behavior stress if bored)',
      'Dental tartar',
    ],
    grooming_needs: 'Short sleek coat; weekly brushing and nail care.',
    temperament_summary: 'High-energy, athletic cat that needs climbing space and interactive play.',
  },
  {
    slug: 'british-shorthair',
    name: 'British Shorthair',
    size_category: 'medium',
    avg_weight_range: '9-18 lb (4-8 kg)',
    avg_lifespan: '12-17 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Obesity',
      'Dental disease',
      'Polycystic kidney disease screening in some lines',
      'Joint stiffness in seniors',
    ],
    grooming_needs: 'Dense coat benefits from weekly brushing, more in shed seasons.',
    temperament_summary: 'Even-tempered, moderately active companion that prefers steady routines.',
  },
  {
    slug: 'sphynx',
    name: 'Sphynx',
    size_category: 'medium',
    avg_weight_range: '6-12 lb (2.7-5.5 kg)',
    avg_lifespan: '12-14 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Skin oil buildup and dermatitis',
      'Temperature sensitivity',
      'Dental disease',
      'Ear wax accumulation',
    ],
    grooming_needs: 'Regular bathing for skin oils; frequent ear cleaning; keep warm indoors.',
    temperament_summary: 'Affectionate, heat-seeking companion that often seeks body contact.',
  },
  {
    slug: 'abyssinian',
    name: 'Abyssinian',
    size_category: 'medium',
    avg_weight_range: '6-10 lb (2.7-4.5 kg)',
    avg_lifespan: '12-15 years',
    common_health_issues: [
      'Dental disease',
      'Renal amyloidosis risk in some lines',
      'Progressive retinal atrophy risk',
      'Patellar luxation',
      'High activity joint wear',
    ],
    grooming_needs: 'Short coat; light weekly brushing and dental focus.',
    temperament_summary: 'Curious, athletic climber that needs vertical space and daily play.',
  },
  {
    slug: 'scottish-fold',
    name: 'Scottish Fold',
    size_category: 'medium',
    avg_weight_range: '6-13 lb (2.7-6 kg)',
    avg_lifespan: '11-15 years',
    common_health_issues: [
      'Osteochondrodysplasia / joint cartilage concerns',
      'Hypertrophic cardiomyopathy (HCM)',
      'Dental disease',
      'Obesity',
      'Mobility monitoring needs',
    ],
    grooming_needs: 'Weekly brushing; monitor comfort during handling of limbs and back.',
    temperament_summary: 'Gentle indoor companion; mobility comfort should guide play style.',
    NEEDS_VET_REVIEW: true,
  },
  {
    slug: 'russian-blue',
    name: 'Russian Blue',
    size_category: 'medium',
    avg_weight_range: '7-12 lb (3-5.5 kg)',
    avg_lifespan: '15-20 years',
    common_health_issues: [
      'Stress-sensitive bladder (FLUTD risk)',
      'Obesity if indoor-idle',
      'Dental tartar',
      'Anxiety with sudden household change',
      'Senior kidney monitoring',
    ],
    grooming_needs: 'Dense short coat sheds seasonally; weekly brushing helps.',
    temperament_summary: 'Reserved with strangers, bonded with familiar people, prefers calm homes.',
  },
  {
    slug: 'devon-rex',
    name: 'Devon Rex',
    size_category: 'small',
    avg_weight_range: '5-10 lb (2.3-4.5 kg)',
    avg_lifespan: '12-16 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Skin and ear oil maintenance',
      'Patellar luxation',
      'Dental crowding',
      'Temperature sensitivity',
    ],
    grooming_needs: 'Delicate coat; gentle wiping, regular ear care, avoid overbathing.',
    temperament_summary: 'Playful, people-focused cat that often seeks elevated perches near family.',
  },
  {
    slug: 'norwegian-forest-cat',
    name: 'Norwegian Forest Cat',
    size_category: 'large',
    avg_weight_range: '8-16 lb (3.5-7.5 kg)',
    avg_lifespan: '12-16 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Hip dysplasia',
      'Glycogen storage disease IV in some lines',
      'Coat matting if neglected',
      'Obesity',
    ],
    grooming_needs: 'Thick double coat needs frequent brushing, especially in shed seasons.',
    temperament_summary: 'Independent yet affectionate climber that enjoys vertical territory.',
  },
  {
    slug: 'american-shorthair',
    name: 'American Shorthair',
    size_category: 'medium',
    avg_weight_range: '8-15 lb (3.5-7 kg)',
    avg_lifespan: '15-20 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Obesity',
      'Dental disease',
      'Urinary crystal risk in some cats',
      'Senior arthritis',
    ],
    grooming_needs: 'Easy short coat; weekly brushing and nail trims.',
    temperament_summary: 'Even-keeled household companion adaptable to busy family life.',
  },
  {
    slug: 'birman',
    name: 'Birman',
    size_category: 'medium',
    avg_weight_range: '8-12 lb (3.5-5.5 kg)',
    avg_lifespan: '12-16 years',
    common_health_issues: [
      'Hypertrophic cardiomyopathy (HCM)',
      'Congenital hypotrichosis in rare lines',
      'Dental tartar',
      'Obesity',
      'Kidney monitoring in seniors',
    ],
    grooming_needs: 'Semi-long coat needs regular brushing to prevent mats.',
    temperament_summary: 'Gentle, social companion that usually prefers soft indoor routines.',
  },
  {
    slug: 'oriental-shorthair',
    name: 'Oriental Shorthair',
    size_category: 'medium',
    avg_weight_range: '7-12 lb (3-5.5 kg)',
    avg_lifespan: '12-15 years',
    common_health_issues: [
      'Dental disease',
      'Hepatic amyloidosis risk in some lines',
      'Progressive retinal atrophy risk',
      'Anxiety if left understimulated',
      'GI sensitivity',
    ],
    grooming_needs: 'Short coat; weekly wipe and strong dental focus.',
    temperament_summary: 'Highly social and vocal; bonds tightly and needs engagement.',
  },
  {
    slug: 'exotic-shorthair',
    name: 'Exotic Shorthair',
    size_category: 'medium',
    avg_weight_range: '7-14 lb (3-6.5 kg)',
    avg_lifespan: '12-15 years',
    common_health_issues: [
      'Brachycephalic airway concerns',
      'Tear staining',
      'Polycystic kidney disease screening',
      'Dental crowding',
      'Heat intolerance',
    ],
    grooming_needs: 'Plush short coat still needs weekly brushing; clean facial folds often.',
    temperament_summary: 'Calm indoor companion similar in temperament to Persians with easier coat care.',
  },
  {
    slug: 'burmese',
    name: 'Burmese',
    size_category: 'medium',
    avg_weight_range: '8-12 lb (3.5-5.5 kg)',
    avg_lifespan: '12-18 years',
    common_health_issues: [
      'Diabetes mellitus risk in some lines',
      'Hypokalemia (some lines)',
      'Dental disease',
      'Obesity',
      'Craniofacial defect screening in breeding programs',
    ],
    grooming_needs: 'Short satin coat; weekly brushing and weight monitoring.',
    temperament_summary: 'People-oriented, playful companion that often follows household members.',
  },
  {
    slug: 'savannah',
    name: 'Savannah',
    size_category: 'large',
    avg_weight_range: '12-25 lb (5.5-11 kg)',
    avg_lifespan: '12-20 years',
    common_health_issues: [
      'High enrichment / escape-driven stress',
      'Hypertrophic cardiomyopathy screening',
      'Dental tartar',
      'Joint wear from high activity',
      'Local hybrid ownership regulation issues',
    ],
    grooming_needs: 'Short coat; focus on enrichment and secure containment more than grooming.',
    temperament_summary: 'Highly active, curious hybrid-descended companion needing expert husbandry.',
    NEEDS_VET_REVIEW: true,
  },
  {
    slug: 'mixed-breed-cat',
    name: 'Mixed Breed Cat',
    size_category: 'medium',
    avg_weight_range: 'varies (often 7-14 lb)',
    avg_lifespan: '12-18 years (indoor)',
    common_health_issues: [
      'Dental disease',
      'Obesity',
      'FLUTD risk with stress',
      'Chronic kidney disease (senior)',
      'Individual hereditary unknowns',
    ],
    grooming_needs: 'Match coat type; most short-haired mixes need weekly brushing and nail care.',
    temperament_summary: 'Highly individual; base vaccine timing on age and exposure, not pedigree.',
  },
];

function issuesFromFocus(focus) {
  const parts = focus
    .split(/,| and |;|\//)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  const uniq = [...new Set(parts)];
  while (uniq.length < 3) uniq.push('Individual screening based on lineage and lifestyle');
  return uniq.slice(0, 5);
}

function dogSchedule(size) {
  if (size === 'giant') return DOG_SCHEDULE_GIANT;
  if (size === 'toy') return DOG_SCHEDULE_TOY;
  return DOG_SCHEDULE;
}

function parseDogs() {
  const text = fs.readFileSync(matrixPath, 'utf8');
  const m = text.match(/export const TOP_DOG_BREEDS[^=]*=\s*\[(.*?)\n\];/s);
  if (!m) throw new Error('TOP_DOG_BREEDS not found');
  const entries = [
    ...m[1].matchAll(
      /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*size:\s*'([^']+)',\s*group:\s*'([^']+)',\s*adultWeight:\s*'([^']+)',\s*lifespanYears:\s*'([^']+)',\s*healthFocus:\s*'([^']+)'/g,
    ),
  ];
  return entries.map((e) => ({
    slug: e[1],
    name: e[2],
    size: e[3],
    group: e[4],
    adultWeight: e[5],
    lifespanYears: e[6],
    healthFocus: e[7],
  }));
}

function buildDogRecord(d, existing) {
  if (existing) return existing;
  const weight = d.adultWeight.includes('lb') ? d.adultWeight : `${d.adultWeight} lb`;
  return {
    slug: d.slug,
    name: d.name,
    species: 'dog',
    size_category: d.size,
    avg_weight_range: weight,
    avg_lifespan: `${d.lifespanYears} years`,
    common_health_issues: issuesFromFocus(d.healthFocus),
    core_vaccines_schedule: dogSchedule(d.size),
    grooming_needs: `Coat and nail care scaled to a ${d.size} ${d.group} breed; ask your clinic about fold, ear, or coat specifics for ${d.name}s.`,
    temperament_summary: `${d.name}s are typically managed as a ${d.size} ${d.group} dog; plan vaccine visits around energy level and handling needs.`,
    source_notes: `Core vaccine ages follow AAHA-style canine windows. Health issues derived from documented focus: ${d.healthFocus}.`,
  };
}

function buildCatRecord(c, existing) {
  if (existing) return existing;
  const record = {
    slug: c.slug,
    name: c.name,
    species: 'cat',
    size_category: c.size_category,
    avg_weight_range: c.avg_weight_range,
    avg_lifespan: c.avg_lifespan,
    common_health_issues: c.common_health_issues,
    core_vaccines_schedule: CAT_SCHEDULE,
    grooming_needs: c.grooming_needs,
    temperament_summary: c.temperament_summary,
    source_notes:
      'Core kitten FVRCP series follows AAFP-style intervals until ~16-20 weeks; rabies per local law.',
  };
  if (c.NEEDS_VET_REVIEW) record.NEEDS_VET_REVIEW = true;
  return record;
}

const existing = JSON.parse(fs.readFileSync(breedsPath, 'utf8'));
const bySlug = Object.fromEntries(existing.map((b) => [b.slug, b]));

const dogs = parseDogs();
if (dogs.length !== 200) throw new Error(`Expected 200 dogs, got ${dogs.length}`);

const dogRecords = dogs.map((d) => buildDogRecord(d, bySlug[d.slug]));
const catRecords = CATS.map((c) => buildCatRecord(c, bySlug[c.slug]));

// Preserve French Bulldog NEEDS_VET_REVIEW from sample if present
const french = dogRecords.find((b) => b.slug === 'french-bulldog');
if (french && bySlug['french-bulldog']?.NEEDS_VET_REVIEW) {
  french.NEEDS_VET_REVIEW = true;
}

const all = [...dogRecords, ...catRecords];
if (all.length !== 220) throw new Error(`Expected 220 breeds, got ${all.length}`);

const slugs = new Set(all.map((b) => b.slug));
if (slugs.size !== 220) throw new Error('Duplicate breed slugs');

fs.writeFileSync(breedsPath, `${JSON.stringify(all, null, 2)}\n`);
console.log(`Wrote ${all.length} breeds (${dogRecords.length} dogs, ${catRecords.length} cats) → ${breedsPath}`);
