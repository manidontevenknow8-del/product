/**
 * Generate content-data/tools.json (110 gated ToolTemplate pages).
 * Run: node scripts/content-gen/generate-tools.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../../content-data/tools.json');

/** @typedef {'vaccination-record'|'emergency-card'|'vet-visit-log'|'pet-sitter-instructions'} Family */
/** @typedef {{ slug: string, family: Family, species: string, use_case: string, h1: string, primary_keyword: string, needsReview?: boolean }} Seed */

const SPECIES_LABEL = {
  dog: 'dog',
  cat: 'cat',
  puppy: 'puppy',
  kitten: 'kitten',
  'senior-dog': 'senior dog',
  'senior-cat': 'senior cat',
  'multi-pet': 'multi-pet household',
  rabbit: 'rabbit',
  bird: 'bird',
  ferret: 'ferret',
  pet: 'pet',
};

/** @type {Seed[]} */
const SEEDS = [
  // A. Vaccination record sheets (28)
  { slug: 'dog-vaccination-record-sheet', family: 'vaccination-record', species: 'dog', use_case: 'core-printable', h1: 'Printable dog vaccination record sheet', primary_keyword: 'printable dog vaccination record sheet' },
  { slug: 'puppy-vaccination-record-sheet', family: 'vaccination-record', species: 'puppy', use_case: 'series-tracker', h1: 'Puppy vaccine series record sheet', primary_keyword: 'puppy vaccination record sheet' },
  { slug: 'adult-dog-core-vaccine-record', family: 'vaccination-record', species: 'dog', use_case: 'adult-core', h1: 'Adult dog core vaccine record', primary_keyword: 'adult dog core vaccine record' },
  { slug: 'senior-dog-booster-record-sheet', family: 'vaccination-record', species: 'senior-dog', use_case: 'booster', h1: 'Senior dog booster record sheet', primary_keyword: 'senior dog booster record sheet' },
  { slug: 'dog-rabies-certificate-tracker', family: 'vaccination-record', species: 'dog', use_case: 'rabies', h1: 'Dog rabies certificate tracker', primary_keyword: 'dog rabies certificate tracker' },
  { slug: 'dog-lifestyle-vaccine-record', family: 'vaccination-record', species: 'dog', use_case: 'lifestyle', h1: 'Dog lifestyle vaccine record', primary_keyword: 'dog lifestyle vaccine record Bordetella Leptospira Lyme' },
  { slug: 'dog-boarding-vaccine-proof-sheet', family: 'vaccination-record', species: 'dog', use_case: 'boarding', h1: 'Dog boarding vaccine proof sheet', primary_keyword: 'dog boarding vaccine proof sheet' },
  { slug: 'dog-daycare-vaccine-checklist', family: 'vaccination-record', species: 'dog', use_case: 'daycare', h1: 'Dog daycare vaccine checklist', primary_keyword: 'dog daycare vaccine checklist' },
  { slug: 'dog-travel-vaccine-record-sheet', family: 'vaccination-record', species: 'dog', use_case: 'travel', h1: 'Dog travel vaccine record sheet', primary_keyword: 'dog travel vaccine record sheet' },
  { slug: 'multi-dog-household-vaccine-log', family: 'vaccination-record', species: 'multi-pet', use_case: 'multi-dog', h1: 'Multi-dog household vaccine log', primary_keyword: 'multi-dog household vaccine log' },
  { slug: 'rescue-dog-intake-vaccine-sheet', family: 'vaccination-record', species: 'dog', use_case: 'rescue-intake', h1: 'Rescue dog intake vaccine sheet', primary_keyword: 'rescue dog intake vaccine sheet' },
  { slug: 'dog-titer-and-vaccine-history-sheet', family: 'vaccination-record', species: 'dog', use_case: 'titer', h1: 'Dog titer and vaccine history sheet', primary_keyword: 'dog titer and vaccine history sheet', needsReview: true },
  { slug: 'cat-vaccination-record-sheet', family: 'vaccination-record', species: 'cat', use_case: 'core-printable', h1: 'Printable cat vaccination record sheet', primary_keyword: 'printable cat vaccination record sheet' },
  { slug: 'kitten-vaccination-record-sheet', family: 'vaccination-record', species: 'kitten', use_case: 'series-tracker', h1: 'Kitten vaccine series record sheet', primary_keyword: 'kitten vaccination record sheet' },
  { slug: 'adult-cat-core-vaccine-record', family: 'vaccination-record', species: 'cat', use_case: 'adult-core', h1: 'Adult cat core vaccine record', primary_keyword: 'adult cat core vaccine record' },
  { slug: 'senior-cat-booster-record-sheet', family: 'vaccination-record', species: 'senior-cat', use_case: 'booster', h1: 'Senior cat booster record sheet', primary_keyword: 'senior cat booster record sheet' },
  { slug: 'cat-fvrcp-rabies-record', family: 'vaccination-record', species: 'cat', use_case: 'fvrcp-rabies', h1: 'Cat FVRCP and rabies record', primary_keyword: 'cat FVRCP rabies record sheet' },
  { slug: 'cat-felv-lifestyle-vaccine-record', family: 'vaccination-record', species: 'cat', use_case: 'felv', h1: 'Cat FeLV lifestyle vaccine record', primary_keyword: 'cat FeLV vaccine record sheet' },
  { slug: 'cat-boarding-vaccine-proof-sheet', family: 'vaccination-record', species: 'cat', use_case: 'boarding', h1: 'Cat boarding vaccine proof sheet', primary_keyword: 'cat boarding vaccine proof sheet' },
  { slug: 'cat-travel-vaccine-record-sheet', family: 'vaccination-record', species: 'cat', use_case: 'travel', h1: 'Cat travel vaccine record sheet', primary_keyword: 'cat travel vaccine record sheet' },
  { slug: 'multi-cat-household-vaccine-log', family: 'vaccination-record', species: 'multi-pet', use_case: 'multi-cat', h1: 'Multi-cat household vaccine log', primary_keyword: 'multi-cat household vaccine log' },
  { slug: 'rescue-cat-intake-vaccine-sheet', family: 'vaccination-record', species: 'cat', use_case: 'rescue-intake', h1: 'Rescue cat intake vaccine sheet', primary_keyword: 'rescue cat intake vaccine sheet' },
  { slug: 'printable-pet-vaccine-checklist', family: 'vaccination-record', species: 'pet', use_case: 'general-checklist', h1: 'Printable pet vaccine checklist', primary_keyword: 'printable pet vaccine checklist' },
  { slug: 'pet-vaccine-and-parasite-prevention-sheet', family: 'vaccination-record', species: 'pet', use_case: 'parasite', h1: 'Pet vaccine and parasite prevention sheet', primary_keyword: 'pet vaccine and parasite prevention sheet' },
  { slug: 'rabbit-vaccination-record-sheet', family: 'vaccination-record', species: 'rabbit', use_case: 'core-printable', h1: 'Rabbit vaccination record sheet', primary_keyword: 'rabbit vaccination record sheet', needsReview: true },
  { slug: 'ferret-vaccination-record-sheet', family: 'vaccination-record', species: 'ferret', use_case: 'core-printable', h1: 'Ferret vaccination record sheet', primary_keyword: 'ferret vaccination record sheet', needsReview: true },
  { slug: 'pet-vaccine-due-date-planner', family: 'vaccination-record', species: 'pet', use_case: 'due-dates', h1: 'Pet vaccine due-date planner', primary_keyword: 'pet vaccine due date planner' },
  { slug: 'clinic-vaccine-history-transfer-sheet', family: 'vaccination-record', species: 'pet', use_case: 'clinic-transfer', h1: 'Clinic vaccine history transfer sheet', primary_keyword: 'clinic vaccine history transfer sheet' },

  // B. Emergency cards (28)
  { slug: 'dog-emergency-info-card', family: 'emergency-card', species: 'dog', use_case: 'standard', h1: 'Dog emergency information card', primary_keyword: 'dog emergency information card' },
  { slug: 'cat-emergency-info-card', family: 'emergency-card', species: 'cat', use_case: 'standard', h1: 'Cat emergency information card', primary_keyword: 'cat emergency information card' },
  { slug: 'puppy-emergency-card', family: 'emergency-card', species: 'puppy', use_case: 'standard', h1: 'Puppy emergency card', primary_keyword: 'puppy emergency card printable' },
  { slug: 'kitten-emergency-card', family: 'emergency-card', species: 'kitten', use_case: 'standard', h1: 'Kitten emergency card', primary_keyword: 'kitten emergency card printable' },
  { slug: 'senior-dog-emergency-card', family: 'emergency-card', species: 'senior-dog', use_case: 'senior', h1: 'Senior dog emergency card', primary_keyword: 'senior dog emergency card' },
  { slug: 'senior-cat-emergency-card', family: 'emergency-card', species: 'senior-cat', use_case: 'senior', h1: 'Senior cat emergency card', primary_keyword: 'senior cat emergency card' },
  { slug: 'multi-pet-household-emergency-card', family: 'emergency-card', species: 'multi-pet', use_case: 'household', h1: 'Multi-pet household emergency card', primary_keyword: 'multi-pet household emergency card' },
  { slug: 'wallet-size-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'wallet', h1: 'Wallet-size pet emergency card', primary_keyword: 'wallet size pet emergency card' },
  { slug: 'fridge-pet-emergency-sheet', family: 'emergency-card', species: 'pet', use_case: 'fridge', h1: 'Fridge pet emergency sheet', primary_keyword: 'fridge pet emergency sheet' },
  { slug: 'travel-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'travel', h1: 'Travel pet emergency card', primary_keyword: 'travel pet emergency card' },
  { slug: 'car-glovebox-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'car', h1: 'Car glovebox pet emergency card', primary_keyword: 'car glovebox pet emergency card' },
  { slug: 'pet-sitter-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'sitter', h1: 'Pet sitter emergency card', primary_keyword: 'pet sitter emergency card' },
  { slug: 'babysitter-kids-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'kids', h1: 'Babysitter and kids pet emergency card', primary_keyword: 'babysitter pet emergency card' },
  { slug: 'apartment-building-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'apartment', h1: 'Apartment building pet emergency card', primary_keyword: 'apartment pet emergency card' },
  { slug: 'medication-list-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'meds', h1: 'Medication-list emergency card', primary_keyword: 'pet medication list emergency card' },
  { slug: 'allergy-sensitive-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'allergy', h1: 'Allergy-sensitive pet emergency card', primary_keyword: 'allergy sensitive pet emergency card', needsReview: true },
  { slug: 'diabetic-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'diabetes', h1: 'Diabetic pet emergency card', primary_keyword: 'diabetic pet emergency card', needsReview: true },
  { slug: 'seizure-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'seizure', h1: 'Seizure pet emergency card', primary_keyword: 'seizure pet emergency card', needsReview: true },
  { slug: 'heart-condition-pet-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'cardiac', h1: 'Heart-condition pet emergency card', primary_keyword: 'heart condition pet emergency card', needsReview: true },
  { slug: 'brachycephalic-dog-emergency-card', family: 'emergency-card', species: 'dog', use_case: 'brachy', h1: 'Brachycephalic dog emergency card', primary_keyword: 'brachycephalic dog emergency card', needsReview: true },
  { slug: 'lost-pet-recovery-card', family: 'emergency-card', species: 'pet', use_case: 'lost-pet', h1: 'Lost pet recovery card', primary_keyword: 'lost pet recovery card printable' },
  { slug: 'microchip-and-id-emergency-card', family: 'emergency-card', species: 'pet', use_case: 'microchip', h1: 'Microchip and ID emergency card', primary_keyword: 'microchip and ID emergency card' },
  { slug: 'boarding-facility-emergency-contact-card', family: 'emergency-card', species: 'pet', use_case: 'boarding', h1: 'Boarding facility emergency contact card', primary_keyword: 'boarding facility emergency contact card' },
  { slug: 'pet-poison-hotline-quick-card', family: 'emergency-card', species: 'pet', use_case: 'poison', h1: 'Pet poison hotline quick card', primary_keyword: 'pet poison hotline quick card' },
  { slug: 'er-vet-authorization-card', family: 'emergency-card', species: 'pet', use_case: 'er-auth', h1: 'ER vet authorization card', primary_keyword: 'ER vet authorization card for pet sitter' },
  { slug: 'rabbit-emergency-info-card', family: 'emergency-card', species: 'rabbit', use_case: 'standard', h1: 'Rabbit emergency information card', primary_keyword: 'rabbit emergency information card' },
  { slug: 'bird-emergency-info-card', family: 'emergency-card', species: 'bird', use_case: 'standard', h1: 'Bird emergency information card', primary_keyword: 'bird emergency information card' },
  { slug: 'pet-first-aid-contacts-card', family: 'emergency-card', species: 'pet', use_case: 'first-aid', h1: 'Pet first-aid contacts card', primary_keyword: 'pet first aid contacts card' },

  // C. Vet visit logs (27)
  { slug: 'dog-vet-visit-log', family: 'vet-visit-log', species: 'dog', use_case: 'general', h1: 'Dog vet visit log template', primary_keyword: 'dog vet visit log template' },
  { slug: 'cat-vet-visit-log', family: 'vet-visit-log', species: 'cat', use_case: 'general', h1: 'Cat vet visit log template', primary_keyword: 'cat vet visit log template' },
  { slug: 'puppy-first-vet-visit-log', family: 'vet-visit-log', species: 'puppy', use_case: 'first-visit', h1: 'Puppy first vet visit log', primary_keyword: 'puppy first vet visit log' },
  { slug: 'kitten-first-vet-visit-log', family: 'vet-visit-log', species: 'kitten', use_case: 'first-visit', h1: 'Kitten first vet visit log', primary_keyword: 'kitten first vet visit log' },
  { slug: 'senior-dog-vet-visit-log', family: 'vet-visit-log', species: 'senior-dog', use_case: 'senior', h1: 'Senior dog vet visit log', primary_keyword: 'senior dog vet visit log' },
  { slug: 'senior-cat-vet-visit-log', family: 'vet-visit-log', species: 'senior-cat', use_case: 'senior', h1: 'Senior cat vet visit log', primary_keyword: 'senior cat vet visit log' },
  { slug: 'wellness-exam-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'wellness', h1: 'Wellness exam visit log', primary_keyword: 'pet wellness exam visit log' },
  { slug: 'sick-visit-symptom-log', family: 'vet-visit-log', species: 'pet', use_case: 'sick', h1: 'Sick visit symptom log', primary_keyword: 'sick visit pet symptom log' },
  { slug: 'emergency-vet-visit-summary', family: 'vet-visit-log', species: 'pet', use_case: 'er', h1: 'Emergency vet visit summary', primary_keyword: 'emergency vet visit summary template' },
  { slug: 'specialist-referral-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'specialist', h1: 'Specialist referral visit log', primary_keyword: 'pet specialist referral visit log' },
  { slug: 'dental-cleaning-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'dental', h1: 'Dental cleaning visit log', primary_keyword: 'pet dental cleaning visit log' },
  { slug: 'pre-surgery-vet-checklist-log', family: 'vet-visit-log', species: 'pet', use_case: 'pre-op', h1: 'Pre-surgery vet checklist log', primary_keyword: 'pre surgery pet checklist log' },
  { slug: 'post-surgery-recovery-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'post-op', h1: 'Post-surgery recovery visit log', primary_keyword: 'post surgery pet recovery visit log' },
  { slug: 'vaccine-only-appointment-log', family: 'vet-visit-log', species: 'pet', use_case: 'vaccine-visit', h1: 'Vaccine-only appointment log', primary_keyword: 'vaccine only vet appointment log' },
  { slug: 'telehealth-vet-follow-up-log', family: 'vet-visit-log', species: 'pet', use_case: 'telehealth', h1: 'Telehealth vet follow-up log', primary_keyword: 'telehealth vet follow up log' },
  { slug: 'chronic-condition-monitoring-log', family: 'vet-visit-log', species: 'pet', use_case: 'chronic', h1: 'Chronic condition monitoring log', primary_keyword: 'chronic pet condition monitoring log' },
  { slug: 'weight-check-vet-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'weight', h1: 'Weight-check vet visit log', primary_keyword: 'pet weight check visit log' },
  { slug: 'behavior-consult-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'behavior', h1: 'Behavior consult visit log', primary_keyword: 'pet behavior consult visit log' },
  { slug: 'allergy-dermatology-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'derm', h1: 'Allergy and dermatology visit log', primary_keyword: 'pet allergy dermatology visit log' },
  { slug: 'orthopedic-limping-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'ortho', h1: 'Orthopedic and limping visit log', primary_keyword: 'pet limping orthopedic visit log' },
  { slug: 'urinary-issue-vet-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'urinary', h1: 'Urinary issue vet visit log', primary_keyword: 'pet urinary issue vet visit log' },
  { slug: 'gastrointestinal-upset-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'gi', h1: 'Gastrointestinal upset visit log', primary_keyword: 'pet GI upset visit log' },
  { slug: 'annual-exam-prep-and-log', family: 'vet-visit-log', species: 'pet', use_case: 'annual', h1: 'Annual exam prep and visit log', primary_keyword: 'annual pet exam prep log' },
  { slug: 'multi-pet-vet-visit-tracker', family: 'vet-visit-log', species: 'multi-pet', use_case: 'household', h1: 'Multi-pet vet visit tracker', primary_keyword: 'multi-pet vet visit tracker' },
  { slug: 'lab-results-and-visit-notes-log', family: 'vet-visit-log', species: 'pet', use_case: 'labs', h1: 'Lab results and visit notes log', primary_keyword: 'pet lab results visit notes log' },
  { slug: 'medication-change-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'med-change', h1: 'Medication change visit log', primary_keyword: 'pet medication change visit log' },
  { slug: 'second-opinion-vet-visit-log', family: 'vet-visit-log', species: 'pet', use_case: 'second-opinion', h1: 'Second-opinion vet visit log', primary_keyword: 'second opinion vet visit log' },

  // D. Pet sitter instructions (27)
  { slug: 'dog-pet-sitter-instructions', family: 'pet-sitter-instructions', species: 'dog', use_case: 'standard', h1: 'Dog pet sitter instructions template', primary_keyword: 'dog pet sitter instructions template' },
  { slug: 'cat-pet-sitter-instructions', family: 'pet-sitter-instructions', species: 'cat', use_case: 'standard', h1: 'Cat pet sitter instructions template', primary_keyword: 'cat pet sitter instructions template' },
  { slug: 'puppy-sitter-instructions', family: 'pet-sitter-instructions', species: 'puppy', use_case: 'standard', h1: 'Puppy sitter instructions', primary_keyword: 'puppy sitter instructions template' },
  { slug: 'kitten-sitter-instructions', family: 'pet-sitter-instructions', species: 'kitten', use_case: 'standard', h1: 'Kitten sitter instructions', primary_keyword: 'kitten sitter instructions template' },
  { slug: 'senior-dog-sitter-instructions', family: 'pet-sitter-instructions', species: 'senior-dog', use_case: 'senior', h1: 'Senior dog sitter instructions', primary_keyword: 'senior dog sitter instructions' },
  { slug: 'senior-cat-sitter-instructions', family: 'pet-sitter-instructions', species: 'senior-cat', use_case: 'senior', h1: 'Senior cat sitter instructions', primary_keyword: 'senior cat sitter instructions' },
  { slug: 'overnight-pet-sitter-handoff', family: 'pet-sitter-instructions', species: 'pet', use_case: 'overnight', h1: 'Overnight pet sitter handoff', primary_keyword: 'overnight pet sitter handoff template' },
  { slug: 'daily-dog-walker-instruction-sheet', family: 'pet-sitter-instructions', species: 'dog', use_case: 'walker', h1: 'Daily dog walker instruction sheet', primary_keyword: 'daily dog walker instruction sheet' },
  { slug: 'house-sitter-with-pets-template', family: 'pet-sitter-instructions', species: 'pet', use_case: 'house-sitter', h1: 'House sitter with pets template', primary_keyword: 'house sitter with pets template' },
  { slug: 'boarding-kennel-handoff-sheet', family: 'pet-sitter-instructions', species: 'pet', use_case: 'boarding', h1: 'Boarding kennel handoff sheet', primary_keyword: 'boarding kennel handoff sheet' },
  { slug: 'daycare-drop-off-instruction-card', family: 'pet-sitter-instructions', species: 'dog', use_case: 'daycare', h1: 'Daycare drop-off instruction card', primary_keyword: 'dog daycare drop off instruction card' },
  { slug: 'multi-pet-household-sitter-sheet', family: 'pet-sitter-instructions', species: 'multi-pet', use_case: 'household', h1: 'Multi-pet household sitter sheet', primary_keyword: 'multi-pet household sitter instructions' },
  { slug: 'medication-heavy-pet-sitter-instructions', family: 'pet-sitter-instructions', species: 'pet', use_case: 'meds', h1: 'Medication-heavy pet sitter instructions', primary_keyword: 'medication pet sitter instructions template' },
  { slug: 'holiday-weekend-pet-sitter-template', family: 'pet-sitter-instructions', species: 'pet', use_case: 'holiday', h1: 'Holiday weekend pet sitter template', primary_keyword: 'holiday weekend pet sitter template' },
  { slug: 'travel-abroad-pet-care-handoff', family: 'pet-sitter-instructions', species: 'pet', use_case: 'travel-abroad', h1: 'Travel-abroad pet care handoff', primary_keyword: 'travel abroad pet care handoff' },
  { slug: 'reactive-dog-sitter-instructions', family: 'pet-sitter-instructions', species: 'dog', use_case: 'reactive', h1: 'Reactive dog sitter instructions', primary_keyword: 'reactive dog sitter instructions' },
  { slug: 'cat-only-apartment-sitter-sheet', family: 'pet-sitter-instructions', species: 'cat', use_case: 'apartment', h1: 'Cat-only apartment sitter sheet', primary_keyword: 'cat apartment sitter instructions' },
  { slug: 'puppy-potty-and-crate-sitter-sheet', family: 'pet-sitter-instructions', species: 'puppy', use_case: 'potty-crate', h1: 'Puppy potty and crate sitter sheet', primary_keyword: 'puppy potty crate sitter instructions' },
  { slug: 'special-diet-pet-sitter-instructions', family: 'pet-sitter-instructions', species: 'pet', use_case: 'diet', h1: 'Special-diet pet sitter instructions', primary_keyword: 'special diet pet sitter instructions' },
  { slug: 'anxious-pet-sitter-calm-plan', family: 'pet-sitter-instructions', species: 'pet', use_case: 'anxiety', h1: 'Anxious pet sitter calm plan', primary_keyword: 'anxious pet sitter calm plan' },
  { slug: 'dog-with-yard-access-sitter-sheet', family: 'pet-sitter-instructions', species: 'dog', use_case: 'yard', h1: 'Dog with yard-access sitter sheet', primary_keyword: 'dog yard access sitter instructions' },
  { slug: 'indoor-cat-enrichment-sitter-sheet', family: 'pet-sitter-instructions', species: 'cat', use_case: 'enrichment', h1: 'Indoor cat enrichment sitter sheet', primary_keyword: 'indoor cat enrichment sitter sheet' },
  { slug: 'pet-sitter-emergency-authorization-form', family: 'pet-sitter-instructions', species: 'pet', use_case: 'authorization', h1: 'Pet sitter emergency authorization form', primary_keyword: 'pet sitter emergency authorization form' },
  { slug: 'pet-sitter-feeding-and-meds-schedule', family: 'pet-sitter-instructions', species: 'pet', use_case: 'schedule', h1: 'Pet sitter feeding and meds schedule', primary_keyword: 'pet sitter feeding and meds schedule' },
  { slug: 'overnight-cat-sitter-checklist', family: 'pet-sitter-instructions', species: 'cat', use_case: 'overnight-cat', h1: 'Overnight cat sitter checklist', primary_keyword: 'overnight cat sitter checklist' },
  { slug: 'weekend-dog-boarding-prep-sheet', family: 'pet-sitter-instructions', species: 'dog', use_case: 'weekend-boarding', h1: 'Weekend dog boarding prep sheet', primary_keyword: 'weekend dog boarding prep sheet' },
  { slug: 'professional-petsitter-onboarding-packet', family: 'pet-sitter-instructions', species: 'pet', use_case: 'pro-onboarding', h1: 'Professional pet sitter onboarding packet', primary_keyword: 'professional pet sitter onboarding packet' },
];

function clipMeta(text) {
  if (text.length <= 157) return text;
  return `${text.slice(0, 157).trim()}...`;
}

function label(species) {
  return SPECIES_LABEL[species] || 'pet';
}

function vaccineRows(seed) {
  const s = seed.species;
  const base = [
    'Pet name, microchip ID, and primary clinic',
    'Vaccine name / product, date given, next due',
    'Clinic, veterinarian, and lot / serial if available',
    'Tag or certificate number (rabies when applicable)',
  ];
  const byUse = {
    'series-tracker': ['Series visit number and age/weight at dose', 'Notes on reactions or deferred doses'],
    booster: ['Last booster date and interval recommended by clinic', 'Senior wellness labs date if discussed'],
    rabies: ['Rabies product, duration (1-yr / 3-yr), tag number', 'Issuing clinic and certificate file name'],
    lifestyle: ['Bordetella / Leptospira / Lyme (or clinic alternatives)', 'Lifestyle risk notes (daycare, hiking, water)'],
    boarding: ['Facility name and required vaccine list', 'Proof ready checkbox and expiration dates'],
    daycare: ['Daycare vaccine requirements checklist', 'Fecal / Bordetella status if required'],
    travel: ['Destination and entry document checklist', 'Rabies and core vaccines with issue dates'],
    'multi-dog': ['Per-dog rows (name + chip)', 'Shared household due-date overview'],
    'multi-cat': ['Per-cat rows (name + chip)', 'Shared household due-date overview'],
    'rescue-intake': ['Unknown history checkbox', 'First series start date and shelter/clinic source'],
    titer: ['Titer test date, lab, and result summary', 'Clinic decision: boost / skip / recheck'],
    'fvrcp-rabies': ['FVRCP dates and next due', 'Rabies date, tag, and certificate'],
    felv: ['FeLV test date/result before vaccine when applicable', 'FeLV vaccine dates and lifestyle rationale'],
    parasite: ['Heartworm / flea / tick product and refill date', 'Fecal test date'],
    'due-dates': ['Next due calendar month grid', 'Reminder channel (app / calendar / paper)'],
    'clinic-transfer': ['Previous clinic contact block', 'Records requested / received checklist'],
    'general-checklist': ['Core vs lifestyle vaccine columns', 'Blank rows for clinic-specific products'],
    'core-printable': s === 'rabbit'
      ? ['RHDV / myxomatosis rows where used regionally', 'Clinic notes (protocols vary by country)']
      : s === 'ferret'
        ? ['Canine distemper and rabies rows as directed by clinic', 'Exotic-pet clinic contact']
        : ['Core vaccine rows for species', 'Optional lifestyle vaccine rows'],
  };
  return [...base, ...(byUse[seed.use_case] || byUse['core-printable'])];
}

function emergencyRows(seed) {
  const base = [
    'Pet name, photo space, species, age, weight',
    'Microchip number and ID tag text',
    'Owner phone(s) and backup contact',
    'Primary vet + nearest ER with addresses',
  ];
  const byUse = {
    standard: ['Known allergies and current medications', 'Authorization note for caregiver'],
    senior: ['Chronic conditions and mobility notes', 'Medication schedule snapshot'],
    household: ['Per-pet mini blocks', 'Who to call first for each pet'],
    wallet: ['Compact front/back layout', 'Critical meds and allergies only'],
    fridge: ['Large-print contacts', 'House access / crate location notes'],
    travel: ['Hotel / destination contacts', 'Airline or transporter notes'],
    car: ['Glovebox fold layout', 'After-hours ER along usual routes'],
    sitter: ['Sitter authorization checkbox', 'Spend limit / call-first rules'],
    kids: ['Simple “call this number” steps', 'Do-not-handle warnings'],
    apartment: ['Building / neighbor contact', 'Pet-friendly ER near building'],
    meds: ['Drug, dose, time, with/without food', 'Missed-dose instruction from clinic'],
    allergy: ['Known allergens and reactions', 'Rescue meds if prescribed'],
    diabetes: ['Insulin product and timing', 'Hypoglycemia watch signs (clinic-directed)'],
    seizure: ['Typical seizure description', 'When to go to ER (clinic thresholds)'],
    cardiac: ['Heart meds list', 'Breathing / gum-color watch notes'],
    brachy: ['Heat and airway risk notes', 'Preferred ER for respiratory distress'],
    'lost-pet': ['Distinctive marks and collar', 'Where last seen + microchip registry'],
    microchip: ['Chip number + registry phone', 'Tattoo / tag cross-check'],
    boarding: ['Facility manager contact', 'Owner unreachable protocol'],
    poison: ['ASPCA APCC / Pet Poison Helpline fields', 'Product packaging reminder'],
    'er-auth': ['Written spend authorization', 'Preferred clinic list'],
    'first-aid': ['First-aid kit location', 'Non-emergency vs ER decision prompts'],
  };
  return [...base, ...(byUse[seed.use_case] || byUse.standard)];
}

function visitLogRows(seed) {
  const base = [
    'Visit date, clinic, and veterinarian',
    'Reason for visit / chief concern',
    'Weight and vitals if provided',
    'Diagnoses, tests ordered, and home-care plan',
  ];
  const byUse = {
    general: ['Medications started or changed', 'Next appointment / reminder'],
    'first-visit': ['Diet, litter/potty, and housing notes', 'Vaccine and parasite plan started'],
    senior: ['Mobility, appetite, cognition notes', 'Lab panel dates and key trends'],
    wellness: ['Preventive care checklist', 'Questions to ask the vet'],
    sick: ['Symptom timeline (onset, frequency)', 'Appetite, water, stool, urine notes'],
    er: ['Triage time and presenting signs', 'Discharge instructions summary'],
    specialist: ['Referring clinic and records sent', 'Specialist recommendations'],
    dental: ['Dental grade / extractions teeth notes', 'Home dental care plan'],
    'pre-op': ['NPO / fasting instructions', 'Consent and drop-off checklist'],
    'post-op': ['Incision / e-collar checks', 'Pain med schedule and recheck'],
    'vaccine-visit': ['Vaccines given + next due', 'Reaction watch window'],
    telehealth: ['Platform / call time', 'In-person follow-up triggers'],
    chronic: ['Condition score or symptom scale', 'Medication adherence notes'],
    weight: ['Weight trend table', 'Diet change agreed with clinic'],
    behavior: ['Trigger and context notes', 'Training / meds plan'],
    derm: ['Itch / lesion map notes', 'Allergy trial or meds'],
    ortho: ['Which limb, when worse', 'Imaging / rest plan'],
    urinary: ['Litter/outdoor frequency and straining', 'Urinalysis follow-up'],
    gi: ['Vomiting / diarrhea timeline', 'Food trial or bland diet notes'],
    annual: ['Pre-visit question list', 'Vaccines + labs due'],
    household: ['Per-pet visit rows', 'Shared calendar of upcoming visits'],
    labs: ['Test names and draw date', 'Result interpretation fields'],
    'med-change': ['Old vs new regimen', 'Side-effect watch list'],
    'second-opinion': ['Prior diagnosis summary', 'Questions for second clinic'],
  };
  return [...base, ...(byUse[seed.use_case] || byUse.general)];
}

function sitterRows(seed) {
  const base = [
    'Daily routine (feed, potty, play, sleep)',
    'Medications with dose and timing',
    'Vet / ER contacts and authorization',
    'House access, alarms, and Wi-Fi notes',
  ];
  const byUse = {
    standard: ['Personality and “normal” behavior cues', 'Do-not-do list'],
    senior: ['Mobility aids and ramp/bedding notes', 'Night-time needs'],
    overnight: ['Evening lock-up checklist', 'Morning start checklist'],
    walker: ['Route preferences and leash tools', 'Dog-dog / stranger rules'],
    'house-sitter': ['Plant / mail / trash tasks', 'Pet + home combined schedule'],
    boarding: ['Packing list (food, meds, bedding)', 'Facility drop-off form fields'],
    daycare: ['Drop-off window and pickup person', 'Known play style / flags'],
    household: ['Per-pet feeding stations', 'Separation rules between pets'],
    meds: ['Med chart with checkboxes', 'Missed dose escalation'],
    holiday: ['Guest / firework noise plan', 'Backup sitter contact'],
    'travel-abroad': ['Time-zone med schedule', 'Owner unreachable windows'],
    reactive: ['Trigger list and management tools', 'Emergency muzzle / exit plan'],
    apartment: ['Litter locations and scooping', 'Quiet-hours rules'],
    'potty-crate': ['Potty interval schedule', 'Crate duration limits'],
    diet: ['Exact food brand, amount, and forbidden foods', 'Treat rules'],
    anxiety: ['Calm cues and safe space', 'When to call vs wait'],
    yard: ['Gate / fence checks', 'Off-leash rules'],
    enrichment: ['Play session ideas', 'Window / scratcher setup'],
    authorization: ['Spend limit and preferred ER', 'Signature / date lines'],
    schedule: ['Hour-by-hour feed/med grid', 'Water refresh reminders'],
    'overnight-cat': ['Litter scoop AM/PM', 'Hidey-spot check'],
    'weekend-boarding': ['Weekend packing checklist', 'Vaccine proof attached?'],
    'pro-onboarding': ['Key vault / lockbox', 'Photo of each pet + quirks'],
  };
  return [...base, ...(byUse[seed.use_case] || byUse.standard)];
}

function howToUse(family) {
  if (family === 'vaccination-record') {
    return [
      'Fill pet identity and clinic fields from your last visit summary',
      'Add each vaccine date exactly as written on the certificate',
      'Note next-due dates and set a reminder in PetClues after unlock',
      'Print a copy for boarding, daycare, or travel packets',
    ];
  }
  if (family === 'emergency-card') {
    return [
      'Complete contacts, chip ID, and medication fields while calm',
      'Print wallet and fridge sizes if both are useful',
      'Review the card with anyone who watches your pet',
      'Update after any clinic change or new prescription',
    ];
  }
  if (family === 'vet-visit-log') {
    return [
      'Fill the pre-visit section before you leave home',
      'Capture weight, plan, and next steps before you forget in the parking lot',
      'File the sheet with any discharge papers',
      'Upload a photo of the completed log into your PetClues vault',
    ];
  }
  return [
    'Customize feeding, meds, and house rules for this stay',
    'Walk through the sheet with your sitter once in person if possible',
    'Leave a printed copy and a digital unlock in PetClues',
    'Update after any schedule or medication change',
  ];
}

function formatFor(family) {
  const map = {
    'vaccination-record': 'Printable PDF vaccination record (gated)',
    'emergency-card': 'Printable PDF emergency card (gated)',
    'vet-visit-log': 'Printable PDF visit log (gated)',
    'pet-sitter-instructions': 'Printable PDF sitter handoff (gated)',
  };
  return map[family];
}

function includesFor(seed) {
  const sp = label(seed.species);
  const map = {
    'vaccination-record': `${sp} vaccine rows, dates, clinic fields, next-due blanks`,
    'emergency-card': `${sp} identity, contacts, meds, ER authorization fields`,
    'vet-visit-log': `${sp} visit notes, plan, follow-ups, and weight row`,
    'pet-sitter-instructions': `${sp} routine, meds, house rules, emergency contacts`,
  };
  return map[seed.family];
}

function buildVaccine(seed) {
  const sp = label(seed.species);
  const uc = seed.use_case.replace(/-/g, ' ');
  return {
    lead: `Download a printable ${sp} vaccination sheet built for ${uc}. Unlock with a free PetClues account and keep a vault copy beside reminders.`,
    meta_description: clipMeta(
      `Free printable ${seed.primary_keyword}. Gate unlocks the PDF after signup so you can store vaccine dates next to PetClues reminders.`,
    ),
    sections: [
      {
        heading: 'What this sheet organizes',
        paragraphs: [
          `Boarding desks, daycare intake, and travel check-ins ask for clear vaccine proof—not a pile of screenshots. This ${sp} sheet gives you blank rows for product names, dates, clinic, and next due so you can fill from certificates your veterinarian already issued.`,
          `It is an organizer, not a prescription. Timing and products always follow your clinic’s protocol and local law (especially rabies).`,
        ],
      },
      {
        heading: 'Why gate the download',
        paragraphs: [
          `Unlocking stores the template next to your pet vault so sitters and co-parents open the same packet. After you fill dates once, set booster reminders in PetClues instead of rewriting paper each year.`,
        ],
      },
      {
        heading: 'Tips for accurate records',
        paragraphs: [
          `Copy dates from the signed certificate or clinic portal. If history is incomplete (common with rescues), mark unknown fields clearly and ask the clinic how they want gaps documented.`,
          seed.use_case.includes('travel') || seed.use_case.includes('boarding')
            ? `Keep a PDF export plus this printable in one folder—facilities often want both a stampable paper copy and a digital backup.`
            : `Photograph completed rows after each visit so you can rebuild the sheet if the paper gets lost.`,
        ],
      },
    ],
    faqs: [
      {
        question: 'Is this a veterinary vaccine schedule?',
        answer:
          'No. It is a blank record sheet for dates and products your clinic provides. Ask your veterinarian which vaccines your pet needs and when.',
      },
      {
        question: 'Can boarding facilities accept this printout?',
        answer:
          'Many accept a clear owner-maintained log plus official certificates. Always confirm the facility’s required vaccines and whether they need stamped clinic forms.',
      },
      {
        question: 'How do I unlock the PDF?',
        answer:
          'Create a free PetClues account on the unlock button. You can then download the printable and save it beside your pet’s digital records.',
      },
    ],
  };
}

function buildEmergency(seed) {
  const sp = label(seed.species);
  return {
    lead: `Generate a printable ${sp} emergency card for caregivers, travel, or the fridge. Unlock free, then keep contacts and meds in your PetClues vault.`,
    meta_description: clipMeta(
      `Printable ${seed.primary_keyword}. Unlock after free signup—store ER contacts, chip ID, and meds next to your PetClues emergency passport.`,
    ),
    sections: [
      {
        heading: 'What belongs on an emergency card',
        paragraphs: [
          `When someone else is holding the leash—or finding a lost pet—minutes matter. This card focuses on identity, chip ID, owner phones, clinic/ER contacts, allergies, and current medications.`,
          `Condition-specific variants add fields your sitter should not have to guess (for example insulin timing or seizure notes). Those fields still follow your veterinarian’s written plan; the card does not diagnose.`,
        ],
      },
      {
        heading: 'Where to keep copies',
        paragraphs: [
          `Print a fridge sheet for the house, a wallet card for your bag, and share a digital unlock with sitters. Update after every medication change so the card never contradicts the bottle.`,
        ],
      },
      {
        heading: 'Pair with your vault',
        paragraphs: [
          `PetClues can hold the longer passport (vaccine PDFs, full history) while this card stays the one-page grab sheet. Unlocking the download is the bridge into that vault.`,
        ],
      },
    ],
    faqs: [
      {
        question: 'Should the card include a photo?',
        answer:
          'Yes when possible. A clear photo and markings help finders and ER staff confirm identity, especially in multi-pet homes.',
      },
      {
        question: 'Is this medical advice?',
        answer:
          'No. It is a blank organizer for contacts and clinician-directed medication details. Call your veterinarian or ER for urgent decisions.',
      },
      {
        question: 'Can sitters authorize treatment with this card?',
        answer:
          'Only if you complete the authorization fields and your clinic accepts caregiver consent. Confirm limits (spend cap, preferred ER) in writing.',
      },
    ],
  };
}

function buildVisitLog(seed) {
  const sp = label(seed.species);
  return {
    lead: `Print a ${sp} vet visit log for this use case, unlock the PDF free, and file notes beside your PetClues timeline.`,
    meta_description: clipMeta(
      `${seed.primary_keyword}—printable visit notes gated behind free signup. Capture plan, weight, and follow-ups in one sheet.`,
    ),
    sections: [
      {
        heading: 'Why write it down before you forget',
        paragraphs: [
          `Exam rooms move fast. A structured log helps you capture weight, what was discussed, tests ordered, and the home-care plan before details fade in the parking lot.`,
          `This template is tailored for ${seed.use_case.replace(/-/g, ' ')} visits so the prompts match what you usually need to remember.`,
        ],
      },
      {
        heading: 'Before and after the appointment',
        paragraphs: [
          `Use the pre-visit block for questions and symptom timelines. After discharge, copy medication changes and recheck dates, then photograph the sheet into PetClues so household members see the same plan.`,
        ],
      },
      {
        heading: 'Not a substitute for records',
        paragraphs: [
          `Keep official discharge papers and lab portals as source of truth. The log is your owner-facing summary and reminder trigger.`,
        ],
      },
    ],
    faqs: [
      {
        question: 'Do clinics need this form?',
        answer:
          'No. It is for your household. Bring it if it helps you ask clearer questions, but follow the clinic’s own records and discharge paperwork.',
      },
      {
        question: 'Can I use one log for multiple pets?',
        answer:
          'Use the multi-pet tracker variant for household calendars, or one sheet per pet for cleaner history.',
      },
      {
        question: 'How does unlocking help?',
        answer:
          'A free account unlocks the PDF and lets you store visit photos next to reminders so rechecks do not slip.',
      },
    ],
  };
}

function buildSitter(seed) {
  const sp = label(seed.species);
  return {
    lead: `Hand your sitter a clear ${sp} instruction sheet. Unlock the printable free and keep the same packet in PetClues for every stay.`,
    meta_description: clipMeta(
      `Printable ${seed.primary_keyword}. Unlock after signup—feeding, meds, house rules, and ER contacts in one gated PDF.`,
    ),
    sections: [
      {
        heading: 'What sitters actually need',
        paragraphs: [
          `Good sitters ask for routines, medications, personality quirks, and what to do if they cannot reach you. This template turns those answers into one printable page instead of a long text thread.`,
          `Variants for reactive dogs, special diets, overnight stays, and boarding drop-offs keep the prompts specific so nothing critical is buried.`,
        ],
      },
      {
        heading: 'Walkthrough checklist',
        paragraphs: [
          `Fill the sheet, then demonstrate one feeding and one medication if applicable. Show litter/crate/yard routines in person when you can. Leave ER authorization limits in writing.`,
        ],
      },
      {
        heading: 'Reuse for every trip',
        paragraphs: [
          `After unlock, keep the master copy in PetClues. Duplicate and tweak for holiday weekends, walkers, or professional sitters without rewriting from scratch.`,
        ],
      },
    ],
    faqs: [
      {
        question: 'Should I include Wi-Fi and door codes?',
        answer:
          'Yes if the sitter needs them—and update codes after the stay. Store sensitive access notes carefully and share only with the caregiver on duty.',
      },
      {
        question: 'What if my pet is on multiple medications?',
        answer:
          'Use the medication-heavy or feeding-and-meds schedule variants so each dose has a checkbox and escalation rule.',
      },
      {
        question: 'Can this replace a boarding form?',
        answer:
          'Use it as your owner packet. Facilities still need their own intake forms and vaccine proof—pair this with a boarding vaccine sheet when required.',
      },
    ],
  };
}

function downloadRows(seed) {
  if (seed.family === 'vaccination-record') return vaccineRows(seed);
  if (seed.family === 'emergency-card') return emergencyRows(seed);
  if (seed.family === 'vet-visit-log') return visitLogRows(seed);
  return sitterRows(seed);
}

function buildRecord(seed) {
  const body =
    seed.family === 'vaccination-record'
      ? buildVaccine(seed)
      : seed.family === 'emergency-card'
        ? buildEmergency(seed)
        : seed.family === 'vet-visit-log'
          ? buildVisitLog(seed)
          : buildSitter(seed);

  /** @type {Record<string, unknown>} */
  const record = {
    slug: seed.slug,
    family: seed.family,
    species: seed.species,
    use_case: seed.use_case,
    h1: seed.h1,
    primary_keyword: seed.primary_keyword,
    meta_description: body.meta_description,
    lead: body.lead,
    format: formatFor(seed.family),
    includes: includesFor(seed),
    download_rows: downloadRows(seed),
    how_to_use: howToUse(seed.family),
    sections: body.sections,
    faqs: body.faqs,
    gated: true,
  };

  if (seed.needsReview) {
    record.NEEDS_VET_REVIEW = true;
    record.source_notes =
      'Condition- or species-specific fields are organizers only; protocols vary by region and clinic. Editorial/clinical review before claiming medical specificity.';
  }

  return record;
}

if (SEEDS.length !== 110) {
  console.error(`Expected 110 seeds, got ${SEEDS.length}`);
  process.exit(1);
}

const slugs = new Set();
for (const s of SEEDS) {
  if (slugs.has(s.slug)) {
    console.error(`Duplicate slug: ${s.slug}`);
    process.exit(1);
  }
  slugs.add(s.slug);
}

const reserved = new Set(['vaccine-scheduler', 'qr-generator']);
for (const s of SEEDS) {
  if (reserved.has(s.slug)) {
    console.error(`Slug conflicts with existing tool route: ${s.slug}`);
    process.exit(1);
  }
}

const tools = SEEDS.map(buildRecord);
writeFileSync(outPath, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');

const byFamily = tools.reduce((acc, t) => {
  acc[t.family] = (acc[t.family] || 0) + 1;
  return acc;
}, {});

console.log(`Wrote ${tools.length} tools → ${outPath}`);
console.log(byFamily);
