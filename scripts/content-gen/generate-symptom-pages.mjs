#!/usr/bin/env node
/**
 * Expand symptoms.json (80 base) and generate symptom guide page payloads
 * under content-data/generated/symptoms/ in batches of 40.
 *
 * Usage:
 *   node scripts/content-gen/generate-symptom-pages.mjs --write-data
 *   node scripts/content-gen/generate-symptom-pages.mjs --batch 1
 *   node scripts/content-gen/generate-symptom-pages.mjs --batch all
 *   node scripts/content-gen/generate-symptom-pages.mjs --manifest
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const DATA_DIR = join(ROOT, 'content-data');
const OUT_DIR = join(DATA_DIR, 'generated/symptoms');
const MANIFEST = join(OUT_DIR, 'manifest.json');
const BATCH_SIZE = 40;

const DISCLAIMER =
  'This is general information, not a diagnosis. Contact your vet for anything urgent or unclear.';

const PRODUCT_TIE_IN =
  "Logging symptoms over time helps you and your vet spot patterns — that's what PetClues' health timeline is for.";

/** @typedef {'emergency' | 'urgent' | 'monitor'} Urgency */
/** @typedef {'dog' | 'cat' | 'both'} Species */

/**
 * 80 base symptoms. Species "both" expands to dog + cat pages.
 * Dog/cat-only stay single-species. Separate cause/urgency notes where clinically useful.
 */
const BASE_SYMPTOMS = [
  // Keep / evolve the three approved samples
  {
    base: 'vomiting',
    name: 'Vomiting',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Dietary indiscretion (scavenging, sudden food change)',
      'Gastroenteritis',
      'Pancreatitis',
      'Foreign body obstruction',
      'Toxin ingestion',
    ],
    when_to_see_vet_immediately: [
      'Repeated unproductive retching (possible GDV/bloat risk in deep-chested dogs)',
      'Vomiting with blood or coffee-ground material',
      'Collapse, pale gums, or severe lethargy',
      'Known toxin or foreign object ingestion',
      'Abdominal distension or extreme pain',
    ],
    related_breed_predispositions: ['labrador-retriever', 'german-shepherd', 'great-dane'],
    related_emergency_slug: 'bloat-gdv',
    dog_notes: 'Unproductive retching in deep-chested dogs can signal GDV — treat as emergency.',
    cat_notes: 'Cats that hide after vomiting or stop eating for more than a day need prompt vet advice.',
  },
  {
    base: 'difficulty-breathing',
    name: 'Difficulty breathing',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Asthma / allergic airway disease',
      'Congestive heart failure / cardiomyopathy complications',
      'Pleural effusion',
      'Upper respiratory infection with obstruction',
      'Trauma or foreign body',
    ],
    when_to_see_vet_immediately: [
      'Open-mouth breathing (especially in cats)',
      'Blue or gray gums/tongue',
      'Extreme effort or abdominal breathing',
      'Collapse or inability to lie down comfortably',
      'Sudden onset after possible toxin or trauma',
    ],
    related_breed_predispositions: ['maine-coon', 'ragdoll', 'persian', 'french-bulldog', 'pug'],
    related_emergency_slug: 'difficulty-breathing',
    source_notes: 'Open-mouth breathing in cats is generally treated as an emergency.',
  },
  {
    base: 'limping',
    name: 'Limping',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Soft tissue sprain/strain',
      'Paw pad injury or foreign body',
      'Cruciate ligament injury',
      'Developmental orthopedic disease (e.g., hip dysplasia)',
      'IVDD or neurologic weakness',
    ],
    when_to_see_vet_immediately: [
      'Non-weight-bearing lameness',
      'Limb held at abnormal angle (possible fracture/dislocation)',
      'Dragged limbs, knuckling, or sudden paralysis',
      'Severe pain, crying, or aggression when touched',
      'Limping after known trauma (hit by car, fall)',
    ],
    related_breed_predispositions: ['labrador-retriever', 'french-bulldog', 'dachshund'],
    NEEDS_VET_REVIEW: true,
  },
  {
    base: 'diarrhea',
    name: 'Diarrhea',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Dietary change or scavenging',
      'Parasites',
      'Viral or bacterial gastroenteritis',
      'Stress colitis',
      'Food intolerance',
    ],
    when_to_see_vet_immediately: [
      'Bloody or black tarry stool',
      'Diarrhea with repeated vomiting',
      'Puppy/kitten with diarrhea lasting more than a few hours',
      'Severe lethargy or dehydration signs',
      'Known toxin exposure',
    ],
    related_breed_predispositions: ['german-shepherd', 'domestic-shorthair'],
  },
  {
    base: 'lethargy',
    name: 'Lethargy',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Infection or fever',
      'Pain from injury or illness',
      'Metabolic disease (e.g., diabetes, kidney disease)',
      'Anemia or cardiovascular issues',
      'Toxin exposure',
    ],
    when_to_see_vet_immediately: [
      'Collapse or inability to stand',
      'Pale, blue, or yellow gums',
      'Difficulty breathing with low energy',
      'Sudden extreme weakness',
      'Lethargy with repeated vomiting or not eating',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'loss-of-appetite',
    name: 'Loss of appetite',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Dental pain',
      'Nausea or GI upset',
      'Infection',
      'Kidney or liver disease',
      'Stress or environmental change',
    ],
    when_to_see_vet_immediately: [
      'Cat not eating for more than 24 hours',
      'Puppy/kitten refusing food',
      'Appetite loss with vomiting or jaundice',
      'Signs of pain when chewing',
      'Dehydration or extreme lethargy',
    ],
    related_breed_predispositions: ['domestic-shorthair'],
    cat_notes: 'Cats can develop hepatic lipidosis after short periods without food — escalate sooner than for dogs.',
  },
  {
    base: 'coughing',
    name: 'Coughing',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Kennel cough / infectious tracheobronchitis',
      'Heart disease with congestive changes',
      'Allergies or inhaled irritants',
      'Collapsing trachea',
      'Pneumonia or lower airway disease',
    ],
    when_to_see_vet_immediately: [
      'Coughing with blue gums or collapse',
      'Cough that produces blood',
      'Difficulty breathing between coughs',
      'Cough after known choking episode',
      'Puppy with harsh cough and fever',
    ],
    related_breed_predispositions: ['yorkshire-terrier', 'cavalier-king-charles-spaniel', 'pomeranian'],
  },
  {
    base: 'sneezing',
    name: 'Sneezing',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Upper respiratory infection',
      'Allergies',
      'Nasal foreign body',
      'Dental disease extending into nasal passages',
      'Irritants (dust, smoke, strong cleaners)',
    ],
    when_to_see_vet_immediately: [
      'Sneezing with facial swelling',
      'Bloody nasal discharge',
      'Open-mouth breathing',
      'Sudden onset after possible toxin spray',
      'Kitten/puppy unable to nurse due to congestion',
    ],
    related_breed_predispositions: ['persian', 'himalayan'],
  },
  {
    base: 'seizures',
    name: 'Seizures',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Idiopathic epilepsy',
      'Toxin ingestion',
      'Metabolic imbalance (low blood sugar, liver disease)',
      'Brain inflammation or injury',
      'Heatstroke',
    ],
    when_to_see_vet_immediately: [
      'First-time seizure',
      'Seizure lasting longer than 2–3 minutes',
      'Cluster seizures (more than one in 24 hours)',
      'Seizure after possible toxin exposure',
      'Not returning to normal within a short recovery window',
    ],
    related_breed_predispositions: ['border-collie', 'labrador-retriever', 'beagle'],
    related_emergency_slug: 'seizure',
  },
  {
    base: 'excessive-thirst',
    name: 'Excessive thirst',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Diabetes mellitus',
      'Kidney disease',
      'Cushing’s disease (more common in dogs)',
      'Hyperthyroidism (cats)',
      'Pyometra in intact females',
    ],
    when_to_see_vet_immediately: [
      'Sudden extreme thirst with lethargy',
      'Inability to urinate despite drinking',
      'Vomiting with increased thirst',
      'Collapse or disorientation',
      'Known toxin (e.g., antifreeze) exposure',
    ],
    related_breed_predispositions: ['domestic-shorthair', 'poodle'],
  },
  {
    base: 'frequent-urination',
    name: 'Frequent urination',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Urinary tract infection',
      'Bladder stones',
      'Diabetes',
      'Kidney disease',
      'Behavioral marking (rule out medical first)',
    ],
    when_to_see_vet_immediately: [
      'Straining with little or no urine produced',
      'Crying while trying to urinate',
      'Blood in urine with lethargy',
      'Male cat with a blocked appearance (emergency)',
      'Fever or vomiting with urinary signs',
    ],
    related_breed_predispositions: ['domestic-shorthair', 'dalmatian'],
    related_emergency_slug: 'urinary-blockage',
  },
  {
    base: 'straining-to-urinate',
    name: 'Straining to urinate',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Urethral obstruction (especially male cats)',
      'Urinary stones',
      'Severe cystitis',
      'Prostate disease (intact male dogs)',
      'Neurologic dysfunction',
    ],
    when_to_see_vet_immediately: [
      'Repeated trips to litter box/outside with no urine',
      'Vocalizing while posturing to urinate',
      'Distended, painful abdomen',
      'Vomiting or collapse with urinary straining',
      'Any male cat that cannot produce a stream',
    ],
    related_breed_predispositions: ['domestic-shorthair', 'persian'],
    related_emergency_slug: 'urinary-blockage',
    cat_notes: 'Male cat urethral blockage is a true emergency — do not wait overnight.',
  },
  {
    base: 'blood-in-urine',
    name: 'Blood in urine',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Urinary tract infection',
      'Bladder stones or crystals',
      'Idiopathic cystitis (cats)',
      'Trauma',
      'Clotting disorders or neoplasia (less common)',
    ],
    when_to_see_vet_immediately: [
      'Blood in urine plus inability to urinate',
      'Blood with pale gums or weakness',
      'Trauma to the abdomen',
      'Profuse bleeding',
      'Straining without producing urine',
    ],
    related_breed_predispositions: ['dalmatian', 'domestic-shorthair'],
  },
  {
    base: 'constipation',
    name: 'Constipation',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Dehydration',
      'Hairballs (cats)',
      'Dietary fiber imbalance',
      'Pain when posturing (orthopedic or anal disease)',
      'Megacolon (cats)',
    ],
    when_to_see_vet_immediately: [
      'Straining with vocalization and no stool for more than a day',
      'Vomiting with constipation',
      'Bloated, painful abdomen',
      'Blood from the rectum with straining',
      'Complete inability to defecate in a kitten/puppy',
    ],
    related_breed_predispositions: ['domestic-shorthair'],
  },
  {
    base: 'bloody-stool',
    name: 'Bloody stool',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Colitis / stress diarrhea',
      'Parasites',
      'Dietary indiscretion',
      'Hemorrhagic gastroenteritis (dogs)',
      'Foreign body or ulceration',
    ],
    when_to_see_vet_immediately: [
      'Large volumes of blood',
      'Black tarry stool',
      'Bloody stool with vomiting and lethargy',
      'Puppy with bloody diarrhea (parvo concern)',
      'Collapse or pale gums',
    ],
    related_breed_predispositions: ['german-shepherd', 'labrador-retriever'],
  },
  {
    base: 'itching',
    name: 'Itching',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Flea allergy dermatitis',
      'Environmental allergies',
      'Food allergy',
      'Yeast or bacterial skin infection',
      'Dry skin or contact irritants',
    ],
    when_to_see_vet_immediately: [
      'Face/muzzle swelling with itching',
      'Difficulty breathing with hives',
      'Open, bleeding wounds from self-trauma',
      'Sudden severe itching after a new medication or sting',
      'Fever with widespread skin infection',
    ],
    related_breed_predispositions: ['labrador-retriever', 'french-bulldog', 'domestic-shorthair'],
  },
  {
    base: 'hair-loss',
    name: 'Hair loss',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Allergies and over-grooming',
      'Fleas or mites',
      'Hormonal disease',
      'Ringworm',
      'Stress-related over-grooming (cats)',
    ],
    when_to_see_vet_immediately: [
      'Rapid hair loss with open sores',
      'Hair loss with severe lethargy',
      'Suspected toxin on the coat',
      'Painful, hot swollen skin',
      'Kitten/puppy with widespread lesions and not eating',
    ],
    related_breed_predispositions: ['german-shepherd', 'domestic-shorthair'],
  },
  {
    base: 'ear-scratching',
    name: 'Ear scratching',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Ear mites',
      'Yeast or bacterial otitis',
      'Allergies',
      'Foreign material in the ear',
      'Polyps (cats) or masses',
    ],
    when_to_see_vet_immediately: [
      'Head tilt with circling or falling',
      'Bloody discharge from the ear after trauma',
      'Facial paralysis or inability to blink',
      'Severe pain when the ear is touched',
      'Balance loss',
    ],
    related_breed_predispositions: ['cocker-spaniel', 'basset-hound', 'domestic-shorthair'],
  },
  {
    base: 'head-shaking',
    name: 'Head shaking',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Otitis externa',
      'Ear mites',
      'Allergies',
      'Foreign body',
      'Aural hematoma secondary to shaking',
    ],
    when_to_see_vet_immediately: [
      'Sudden head tilt or inability to stand',
      'Bleeding from the ear canal',
      'Neurologic signs (circling, seizures)',
      'Swollen ear flap that is hot and painful',
      'Trauma to the head',
    ],
    related_breed_predispositions: ['cocker-spaniel', 'labrador-retriever'],
  },
  {
    base: 'red-eyes',
    name: 'Red eyes',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Conjunctivitis',
      'Corneal ulcer',
      'Allergies',
      'Glaucoma',
      'Uveitis or systemic disease',
    ],
    when_to_see_vet_immediately: [
      'Squinting with a cloudy or blue cornea',
      'Eye trauma or a protruding eye',
      'Sudden vision loss',
      'Thick green discharge with swelling',
      'Painful eye that the pet will not open',
    ],
    related_breed_predispositions: ['pug', 'shih-tzu', 'persian'],
  },
  {
    base: 'squinting',
    name: 'Squinting',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Corneal ulcer or scratch',
      'Foreign body under the eyelid',
      'Uveitis',
      'Glaucoma',
      'Severe dry eye irritation',
    ],
    when_to_see_vet_immediately: [
      'Squinting after a cat scratch or trauma',
      'Cloudy eye with pain',
      'Bulging eye',
      'Sudden blindness',
      'Bleeding from the eye',
    ],
    related_breed_predispositions: ['pug', 'boston-terrier', 'persian'],
  },
  {
    base: 'pale-gums',
    name: 'Pale gums',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Anemia (blood loss, destruction, or underproduction)',
      'Shock',
      'Internal bleeding',
      'Severe dehydration',
      'Heart disease with poor perfusion',
    ],
    when_to_see_vet_immediately: [
      'Gums that are white or gray',
      'Pale gums with collapse',
      'Rapid breathing with pale gums',
      'Known trauma or rodenticide exposure',
      'Bloody vomit or black stool with pale gums',
    ],
    related_breed_predispositions: [],
    related_emergency_slug: 'collapse',
  },
  {
    base: 'blue-gums',
    name: 'Blue or gray gums',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Severe respiratory distress',
      'Heart failure',
      'Airway obstruction',
      'Smoke or toxin exposure',
      'Circulatory collapse',
    ],
    when_to_see_vet_immediately: [
      'Any blue/gray mucous membranes',
      'Open-mouth breathing with blue gums',
      'Collapse',
      'Choking signs',
      'Heatstroke with color change',
    ],
    related_breed_predispositions: ['french-bulldog', 'pug', 'english-bulldog'],
    related_emergency_slug: 'difficulty-breathing',
  },
  {
    base: 'bloated-abdomen',
    name: 'Bloated abdomen',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'GDV / bloat (dogs)',
      'Fluid accumulation (ascites)',
      'Organ enlargement',
      'Pregnancy (rule out with history)',
      'Obstruction with gas buildup',
    ],
    when_to_see_vet_immediately: [
      'Sudden hard, distended belly',
      'Unproductive retching',
      'Restlessness and pacing with a swollen abdomen',
      'Pale gums or collapse',
      'Known deep-chested breed with acute bloating',
    ],
    related_breed_predispositions: ['great-dane', 'german-shepherd', 'standard-poodle'],
    related_emergency_slug: 'bloat-gdv',
    dog_notes: 'Acute bloating with retching in large/deep-chested dogs is a surgical emergency until proven otherwise.',
  },
  {
    base: 'collapse',
    name: 'Collapse',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Cardiac arrhythmia or heart failure',
      'Vasovagal / situational syncope',
      'Severe anemia or bleeding',
      'Neurologic event',
      'Heatstroke or toxin',
    ],
    when_to_see_vet_immediately: [
      'Any sudden collapse',
      'Collapse with pale or blue gums',
      'Seizure-like activity during collapse',
      'Inability to stand after the episode',
      'Repeated fainting episodes',
    ],
    related_breed_predispositions: ['boxer', 'doberman-pinscher', 'cavalier-king-charles-spaniel'],
    related_emergency_slug: 'collapse',
  },
  {
    base: 'tremors',
    name: 'Tremors',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Toxin exposure (e.g., chocolate, xylitol, certain insecticides)',
      'Low blood sugar',
      'Pain or anxiety',
      'Neurologic disease',
      'Fever or infection',
    ],
    when_to_see_vet_immediately: [
      'Tremors with vomiting after possible toxin',
      'Tremors progressing toward seizures',
      'Inability to walk',
      'Puppy tremors with weakness',
      'Heatstroke signs',
    ],
    related_breed_predispositions: ['west-highland-white-terrier'],
    related_emergency_slug: 'toxin-ingestion',
  },
  {
    base: 'disorientation',
    name: 'Disorientation',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Cognitive dysfunction (seniors)',
      'Vestibular disease',
      'Toxin or medication effect',
      'Metabolic disease',
      'Head trauma',
    ],
    when_to_see_vet_immediately: [
      'Sudden circling into walls',
      'Head trauma',
      'Seizure activity',
      'Inability to stand',
      'Rapidly worsening confusion',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'head-pressing',
    name: 'Head pressing',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Brain inflammation or swelling',
      'Toxin exposure',
      'Metabolic encephalopathy (e.g., liver disease)',
      'Brain tumor (less common)',
      'Severe hypertension',
    ],
    when_to_see_vet_immediately: [
      'Any persistent head pressing against walls or furniture',
      'Head pressing with seizures',
      'Blindness or pacing',
      'Known toxin exposure',
      'Rapid behavior change',
    ],
    related_breed_predispositions: [],
    related_emergency_slug: 'collapse',
    NEEDS_VET_REVIEW: true,
  },
  {
    base: 'circling',
    name: 'Circling',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Vestibular disease',
      'Ear infection affecting balance',
      'Brain lesion or inflammation',
      'Toxin',
      'Stroke-like event',
    ],
    when_to_see_vet_immediately: [
      'Circling with inability to stand',
      'Circling after head trauma',
      'Seizures',
      'Rapidly worsening neurologic signs',
      'Vomiting that prevents drinking',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'panting-excessively',
    name: 'Excessive panting',
    species: 'dog',
    urgency_level: 'urgent',
    common_causes: [
      'Heat stress',
      'Pain or anxiety',
      'Heart or lung disease',
      'Cushing’s disease',
      'Medication side effects',
    ],
    when_to_see_vet_immediately: [
      'Panting with blue gums',
      'Panting that does not settle in a cool space',
      'Collapse or weakness',
      'Distended abdomen with panting',
      'Suspected heatstroke',
    ],
    related_breed_predispositions: ['french-bulldog', 'pug', 'english-bulldog'],
    related_emergency_slug: 'heatstroke',
  },
  {
    base: 'reverse-sneezing',
    name: 'Reverse sneezing',
    species: 'dog',
    urgency_level: 'monitor',
    common_causes: [
      'Nasal/throat irritation',
      'Allergies',
      'Excitement',
      'Elongated soft palate (brachycephalic dogs)',
      'Post-nasal drip',
    ],
    when_to_see_vet_immediately: [
      'Episode that does not stop and progresses to true distress',
      'Blue gums during an episode',
      'Collapse',
      'New onset with facial swelling',
      'Suspected foreign body inhalation',
    ],
    related_breed_predispositions: ['yorkshire-terrier', 'pug', 'shih-tzu'],
  },
  {
    base: 'hiding',
    name: 'Hiding or withdrawal',
    species: 'cat',
    urgency_level: 'urgent',
    common_causes: [
      'Pain',
      'Illness (cats mask symptoms)',
      'Stress or household change',
      'Urinary discomfort',
      'Nausea',
    ],
    when_to_see_vet_immediately: [
      'Hiding plus not eating',
      'Hiding with labored breathing',
      'Hiding after trauma',
      'Inability to walk normally',
      'Vocalizing in pain while hidden',
    ],
    related_breed_predispositions: ['domestic-shorthair'],
  },
  {
    base: 'inappropriate-urination',
    name: 'Inappropriate urination',
    species: 'cat',
    urgency_level: 'urgent',
    common_causes: [
      'Feline idiopathic cystitis',
      'Urinary tract infection',
      'Litter box aversion',
      'Stress marking',
      'Kidney disease or diabetes',
    ],
    when_to_see_vet_immediately: [
      'Straining without producing urine',
      'Crying in the litter box',
      'Blood in urine with lethargy',
      'Vomiting with urinary accidents',
      'Male cat with sudden house soiling and straining',
    ],
    related_breed_predispositions: ['domestic-shorthair', 'persian'],
    related_emergency_slug: 'urinary-blockage',
  },
  {
    base: 'litter-box-avoidance',
    name: 'Litter box avoidance',
    species: 'cat',
    urgency_level: 'monitor',
    common_causes: [
      'Dirty or disliked litter substrate',
      'Pain associated with elimination',
      'Multi-cat conflict',
      'Medical urinary or GI disease',
      'Location stress',
    ],
    when_to_see_vet_immediately: [
      'Avoidance plus straining',
      'No urine produced',
      'Blood visible in voided urine',
      'Lethargy or vomiting',
      'Sudden complete stop of litter use with distress',
    ],
    related_breed_predispositions: ['domestic-shorthair'],
  },
  {
    base: 'hot-spots',
    name: 'Hot spots',
    species: 'dog',
    urgency_level: 'monitor',
    common_causes: [
      'Flea bites',
      'Allergies',
      'Moisture trapped in coat',
      'Anal gland discomfort leading to chewing',
      'Ear disease driving face rubbing',
    ],
    when_to_see_vet_immediately: [
      'Rapidly spreading infected wound',
      'Fever with skin infection',
      'Face swelling',
      'Pet in severe pain',
      'Hot spot near the eye',
    ],
    related_breed_predispositions: ['golden-retriever', 'labrador-retriever', 'german-shepherd'],
  },
  {
    base: 'scooting',
    name: 'Scooting',
    species: 'dog',
    urgency_level: 'monitor',
    common_causes: [
      'Full or infected anal glands',
      'Tapeworms',
      'Allergies causing anal pruritus',
      'Impacted feces',
      'Perianal dermatitis',
    ],
    when_to_see_vet_immediately: [
      'Scooting with bloody discharge',
      'Swollen, painful anal area',
      'Inability to defecate',
      'Fever',
      'Sudden severe pain when sitting',
    ],
    related_breed_predispositions: ['chihuahua', 'poodle'],
  },
  {
    base: 'weight-loss',
    name: 'Weight loss',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Dental disease limiting intake',
      'Parasites',
      'Hyperthyroidism (cats)',
      'Diabetes, kidney, or GI disease',
      'Cancer (needs veterinary workup)',
    ],
    when_to_see_vet_immediately: [
      'Rapid weight loss with lethargy',
      'Weight loss with vomiting/diarrhea',
      'Jaundice',
      'Difficulty breathing',
      'Not eating at all',
    ],
    related_breed_predispositions: ['domestic-shorthair', 'siamese'],
  },
  {
    base: 'weight-gain',
    name: 'Sudden weight gain',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Fluid retention (heart/liver/kidney disease)',
      'Overfeeding',
      'Hormonal disease',
      'Pregnancy',
      'Reduced mobility after injury',
    ],
    when_to_see_vet_immediately: [
      'Rapid belly enlargement',
      'Weight gain with breathing difficulty',
      'Collapse',
      'Distended abdomen that is hard or painful',
      'Coughing at night with weight change',
    ],
    related_breed_predispositions: ['labrador-retriever', 'beagle'],
  },
  {
    base: 'bad-breath',
    name: 'Bad breath',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Periodontal disease',
      'Oral foreign body or wound',
      'Kidney disease (uremic odor)',
      'GI disease',
      'Oral tumor',
    ],
    when_to_see_vet_immediately: [
      'Sudden foul odor with facial swelling',
      'Inability to close the mouth',
      'Bleeding from the mouth',
      'Choking on a foreign object',
      'Drooling with extreme pain',
    ],
    related_breed_predispositions: ['yorkshire-terrier', 'persian', 'domestic-shorthair'],
  },
  {
    base: 'drooling',
    name: 'Drooling',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Nausea',
      'Oral pain or foreign body',
      'Toxin exposure',
      'Heat stress',
      'Neurologic disease affecting swallowing',
    ],
    when_to_see_vet_immediately: [
      'Drooling after possible toxin (including lilies in cats)',
      'Inability to swallow',
      'Choking or pawing at the mouth',
      'Facial swelling',
      'Seizures with drooling',
    ],
    related_breed_predispositions: [],
    related_emergency_slug: 'toxin-ingestion',
  },
  {
    base: 'gagging',
    name: 'Gagging',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Kennel cough',
      'Soft palate issues',
      'Foreign body',
      'Nausea',
      'Laryngeal disease',
    ],
    when_to_see_vet_immediately: [
      'Gagging with blue gums',
      'Complete obstruction suspicion',
      'Collapse',
      'Continuous unproductive gagging',
      'After chewing a bone or toy piece',
    ],
    related_breed_predispositions: ['french-bulldog', 'pug'],
    related_emergency_slug: 'choking',
  },
  {
    base: 'difficulty-swallowing',
    name: 'Difficulty swallowing',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Oral/pharyngeal pain',
      'Foreign body',
      'Megaesophagus',
      'Neurologic disease',
      'Mass or inflammation',
    ],
    when_to_see_vet_immediately: [
      'Food or water coming from the nose',
      'Choking while eating',
      'Sudden inability to swallow saliva',
      'Blue gums',
      'Known string or bone ingestion',
    ],
    related_breed_predispositions: ['german-shepherd'],
  },
  {
    base: 'regurgitation',
    name: 'Regurgitation',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Megaesophagus',
      'Esophagitis',
      'Obstruction',
      'Motility disorders',
      'Eating too fast (vs true regurgitation — vet can help differentiate)',
    ],
    when_to_see_vet_immediately: [
      'Regurgitation with difficulty breathing',
      'Aspiration suspicion (coughing after meals)',
      'Inability to keep water down',
      'Weight loss with regurgitation',
      'Puppy with frequent tube-like food return',
    ],
    related_breed_predispositions: ['german-shepherd', 'great-dane'],
    NEEDS_VET_REVIEW: true,
  },
  {
    base: 'vomiting-yellow-bile',
    name: 'Vomiting yellow bile',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Empty-stomach bilious vomiting',
      'Dietary indiscretion',
      'GI inflammation',
      'Reflux',
      'Systemic disease',
    ],
    when_to_see_vet_immediately: [
      'Bile vomiting with bloody material',
      'Repeated vomiting preventing hydration',
      'Abdominal pain or bloating',
      'Lethargy or pale gums',
      'Known toxin ingestion',
    ],
    related_breed_predispositions: ['labrador-retriever'],
  },
  {
    base: 'dry-heaving',
    name: 'Dry heaving',
    species: 'dog',
    urgency_level: 'emergency',
    common_causes: [
      'GDV / bloat',
      'Foreign body',
      'Kennel cough irritation',
      'Nausea without productive vomit',
      'Laryngeal spasm',
    ],
    when_to_see_vet_immediately: [
      'Unproductive retching with a swollen belly',
      'Restlessness and pacing',
      'Pale gums',
      'Collapse',
      'Deep-chested breed with sudden dry heaving',
    ],
    related_breed_predispositions: ['great-dane', 'german-shepherd', 'standard-poodle'],
    related_emergency_slug: 'bloat-gdv',
  },
  {
    base: 'bloody-vomit',
    name: 'Bloody vomit',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Gastric ulceration',
      'Severe gastroenteritis',
      'Toxin (including rodenticide)',
      'Foreign body trauma',
      'Coagulopathy',
    ],
    when_to_see_vet_immediately: [
      'Any vomit containing frank blood or coffee-ground material',
      'Bloody vomit with pale gums',
      'Collapse',
      'Known rodenticide exposure',
      'Abdominal distension',
    ],
    related_breed_predispositions: [],
    related_emergency_slug: 'toxin-ingestion',
  },
  {
    base: 'black-tarry-stool',
    name: 'Black tarry stool',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Digested blood from upper GI bleeding',
      'Ulcers',
      'Toxin-related bleeding',
      'Severe inflammation',
      'Swallowed blood from oral/nasal bleeding',
    ],
    when_to_see_vet_immediately: [
      'Black tarry stool with weakness',
      'Pale gums',
      'Collapse',
      'Known rodenticide or NSAID overdose',
      'Vomiting with melena',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'excessive-hunger',
    name: 'Excessive hunger',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Diabetes',
      'Hyperthyroidism (cats)',
      'Inadequate calories',
      'Parasites',
      'Steroid medication effects',
    ],
    when_to_see_vet_immediately: [
      'Ravenous appetite with sudden weight loss',
      'Excessive hunger with vomiting',
      'Collapse in a known diabetic',
      'Polyuria/polydipsia with extreme hunger',
      'Behavioral frantic eating with choking risk',
    ],
    related_breed_predispositions: ['labrador-retriever', 'domestic-shorthair'],
  },
  {
    base: 'eating-grass',
    name: 'Eating grass',
    species: 'dog',
    urgency_level: 'monitor',
    common_causes: [
      'Dietary curiosity / boredom',
      'GI upset',
      'Learned behavior',
      'Nutrient-seeking myth (usually not proven)',
      'Anxiety',
    ],
    when_to_see_vet_immediately: [
      'Grass eating followed by repeated vomiting with blood',
      'Suspected chemically treated lawn ingestion',
      'Choking on grass mats',
      'Lethargy after scavenging outdoors',
      'Known toxic plant exposure while grazing',
    ],
    related_breed_predispositions: ['labrador-retriever'],
  },
  {
    base: 'wheezing',
    name: 'Wheezing',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Feline asthma',
      'Allergic airway disease',
      'Heart disease',
      'Airway foreign body',
      'Chronic bronchitis',
    ],
    when_to_see_vet_immediately: [
      'Wheezing with open-mouth breathing',
      'Blue gums',
      'Wheezing after a choking episode',
      'Collapse',
      'Cat crouching with neck extended to breathe',
    ],
    related_breed_predispositions: ['siamese', 'maine-coon', 'french-bulldog'],
    related_emergency_slug: 'difficulty-breathing',
  },
  {
    base: 'nasal-discharge',
    name: 'Nasal discharge',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Upper respiratory infection',
      'Allergies',
      'Foreign body',
      'Dental disease',
      'Fungal or neoplastic disease (chronic cases)',
    ],
    when_to_see_vet_immediately: [
      'Bloody one-sided discharge after trauma',
      'Discharge with facial deformity',
      'Open-mouth breathing',
      'Neurologic signs',
      'Kitten unable to nurse due to congestion',
    ],
    related_breed_predispositions: ['persian', 'domestic-shorthair'],
  },
  {
    base: 'exercise-intolerance',
    name: 'Exercise intolerance',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Heart disease',
      'Anemia',
      'Respiratory disease',
      'Musculoskeletal pain',
      'Obesity or poor conditioning',
    ],
    when_to_see_vet_immediately: [
      'Collapse during mild activity',
      'Blue gums with exercise',
      'Fainting',
      'Coughing up foam',
      'Sudden inability to walk after exertion',
    ],
    related_breed_predispositions: ['labrador-retriever', 'boxer', 'maine-coon'],
  },
  {
    base: 'heat-sensitivity',
    name: 'Heat sensitivity',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Brachycephalic airway syndrome',
      'Obesity',
      'Heart or lung disease',
      'Thick coats in warm climates',
      'Prior heatstroke injury',
    ],
    when_to_see_vet_immediately: [
      'Heavy panting that does not improve with cooling',
      'Vomiting or diarrhea in heat',
      'Collapse in warm weather',
      'Bright red or blue gums',
      'Rectal temperature concern — go to ER',
    ],
    related_breed_predispositions: ['french-bulldog', 'pug', 'english-bulldog', 'persian'],
    related_emergency_slug: 'heatstroke',
  },
  {
    base: 'stiffness',
    name: 'Stiffness',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Osteoarthritis',
      'Muscle strain',
      'IVDD',
      'Infectious or immune joint disease',
      'Post-exercise soreness',
    ],
    when_to_see_vet_immediately: [
      'Sudden inability to walk',
      'Cry-out pain with paralysis signs',
      'Stiffness with high fever',
      'Neck pain with reluctance to move',
      'Trauma',
    ],
    related_breed_predispositions: ['labrador-retriever', 'german-shepherd', 'dachshund'],
  },
  {
    base: 'reluctance-to-jump',
    name: 'Reluctance to jump',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Orthopedic pain (hips, knees, elbows)',
      'Back pain / IVDD',
      'Arthritis',
      'Obesity',
      'Vision changes affecting depth perception',
    ],
    when_to_see_vet_immediately: [
      'Sudden paralysis or knuckling',
      'Crying when picked up',
      'Incontinence with back pain',
      'Non-weight-bearing lameness',
      'Trauma',
    ],
    related_breed_predispositions: ['dachshund', 'maine-coon', 'persian'],
  },
  {
    base: 'back-pain',
    name: 'Back pain',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Intervertebral disc disease',
      'Muscle strain',
      'Spinal trauma',
      'Infection or inflammation',
      'Referred abdominal pain',
    ],
    when_to_see_vet_immediately: [
      'Dragging rear limbs',
      'Loss of bladder/bowel control',
      'Severe pain, crying, or aggression on touch',
      'Knuckling paws',
      'Trauma',
    ],
    related_breed_predispositions: ['dachshund', 'french-bulldog', 'corgi'],
  },
  {
    base: 'hind-leg-weakness',
    name: 'Hind-leg weakness',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'IVDD',
      'Lumbosacral disease',
      'Hip dysplasia / arthritis',
      'Neurologic disease',
      'Aortic thromboembolism (cats — emergency)',
    ],
    when_to_see_vet_immediately: [
      'Sudden paralysis of hind limbs',
      'Cold hind limbs with severe pain (cats)',
      'Incontinence',
      'Rapidly ascending weakness',
      'Trauma',
    ],
    related_breed_predispositions: ['dachshund', 'german-shepherd', 'maine-coon'],
    related_emergency_slug: 'collapse',
    cat_notes: 'Sudden painful hind-limb paralysis in cats can be a saddle thrombus — emergency care now.',
  },
  {
    base: 'swollen-joints',
    name: 'Swollen joints',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Injury',
      'Infection (septic joint)',
      'Immune-mediated arthritis',
      'Tick-borne disease',
      'Developmental joint disease',
    ],
    when_to_see_vet_immediately: [
      'Hot, extremely painful joint',
      'Fever with joint swelling',
      'Inability to bear weight',
      'Swelling after a bite wound',
      'Multiple joints swelling rapidly',
    ],
    related_breed_predispositions: ['labrador-retriever', 'german-shepherd'],
  },
  {
    base: 'paw-licking',
    name: 'Paw licking',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Allergies',
      'Yeast between toes',
      'Foreign body in the pad',
      'Anxiety',
      'Contact irritants',
    ],
    when_to_see_vet_immediately: [
      'Paw swollen and hot after a bite or sting',
      'Bleeding that will not stop',
      'Lameness with a deep wound',
      'Licking with facial swelling / hives',
      'Suspected pad burn',
    ],
    related_breed_predispositions: ['labrador-retriever', 'french-bulldog', 'domestic-shorthair'],
  },
  {
    base: 'excessive-licking',
    name: 'Excessive licking',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Allergies',
      'Pain at a body site',
      'Anxiety / compulsive behavior',
      'Anal gland discomfort',
      'Skin infection',
    ],
    when_to_see_vet_immediately: [
      'Licking creating open bleeding wounds',
      'Licking genitals with urinary obstruction signs',
      'Sudden frantic licking after toxin on coat',
      'Swelling of the face or throat',
      'Fever with infected sores',
    ],
    related_breed_predispositions: ['domestic-shorthair', 'golden-retriever'],
  },
  {
    base: 'rashes-hives',
    name: 'Rashes or hives',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Allergic reaction (insect, food, medication)',
      'Contact dermatitis',
      'Vaccine reaction',
      'Infection',
      'Autoimmune skin disease (less common)',
    ],
    when_to_see_vet_immediately: [
      'Hives with facial swelling',
      'Difficulty breathing',
      'Vomiting/diarrhea with hives after a known allergen',
      'Collapse',
      'Rapidly spreading welts',
    ],
    related_breed_predispositions: [],
    related_emergency_slug: 'allergic-reaction',
  },
  {
    base: 'swollen-face',
    name: 'Swollen face',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Allergic reaction / insect sting',
      'Dental abscess',
      'Trauma',
      'Snake bite (region-dependent)',
      'Infection',
    ],
    when_to_see_vet_immediately: [
      'Facial swelling with breathing changes',
      'Swelling after a sting or new food/medication',
      'Eye swelling shut',
      'Drooling with inability to swallow',
      'Rapidly worsening swelling',
    ],
    related_breed_predispositions: [],
    related_emergency_slug: 'allergic-reaction',
  },
  {
    base: 'lumps-bumps',
    name: 'Lumps and bumps',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Lipomas',
      'Cysts',
      'Infected hair follicles',
      'Vaccine-site reactions',
      'Malignant masses (need cytology)',
    ],
    when_to_see_vet_immediately: [
      'Rapidly growing mass',
      'Bleeding or ulcerated lump',
      'Mass interfering with breathing or walking',
      'Lump with fever and lethargy',
      'Sudden painful swelling',
    ],
    related_breed_predispositions: ['boxer', 'labrador-retriever', 'golden-retriever'],
  },
  {
    base: 'swollen-lymph-nodes',
    name: 'Swollen lymph nodes',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Local infection',
      'Systemic infection',
      'Immune disease',
      'Lymphoma or other cancer',
      'Reactive nodes after vaccination',
    ],
    when_to_see_vet_immediately: [
      'Generalized node enlargement with fever',
      'Difficulty breathing',
      'Severe lethargy',
      'Nodes that are rock-hard and rapidly enlarging',
      'Pale gums',
    ],
    related_breed_predispositions: ['golden-retriever', 'boxer'],
    NEEDS_VET_REVIEW: true,
  },
  {
    base: 'fever',
    name: 'Fever',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Infection',
      'Inflammation',
      'Immune-mediated disease',
      'Heatstroke (vs true fever)',
      'Post-vaccination response',
    ],
    when_to_see_vet_immediately: [
      'Fever with collapse',
      'Fever with petechiae or bruising',
      'Fever after a tick bite with severe pain',
      'Fever with labored breathing',
      'Suspected heatstroke',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'restlessness',
    name: 'Restlessness',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Pain',
      'Anxiety',
      'GDV early signs (dogs)',
      'Cognitive dysfunction at night',
      'Urinary obstruction discomfort',
    ],
    when_to_see_vet_immediately: [
      'Restlessness with unproductive retching',
      'Pacing with a hard belly',
      'Restlessness plus pale gums',
      'Inability to get comfortable after trauma',
      'Male cat restless and visiting litter constantly',
    ],
    related_breed_predispositions: ['great-dane', 'domestic-shorthair'],
  },
  {
    base: 'pacing-at-night',
    name: 'Pacing at night',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Cognitive dysfunction',
      'Pain that worsens when settling',
      'Anxiety',
      'Sensory loss (vision/hearing)',
      'Metabolic disease',
    ],
    when_to_see_vet_immediately: [
      'Sudden frantic pacing with distress',
      'Pacing with seizures',
      'Disorientation into walls after trauma',
      'Pacing with bloating/retching',
      'Collapse',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'aggression-sudden',
    name: 'Sudden aggression',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Pain',
      'Neurologic disease',
      'Fear after a scary event',
      'Resource guarding escalation',
      'Toxin or metabolic encephalopathy',
    ],
    when_to_see_vet_immediately: [
      'Aggression with neurologic signs',
      'Aggression after head trauma',
      'Sudden personality change with seizures',
      'Suspected pain so severe the pet cannot be handled safely',
      'Rabies-risk exposure history (urgent public-health protocol)',
    ],
    related_breed_predispositions: [],
    NEEDS_VET_REVIEW: true,
  },
  {
    base: 'excessive-vocalization',
    name: 'Excessive vocalization',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Pain',
      'Anxiety or attention seeking',
      'Cognitive dysfunction',
      'Hyperthyroidism (cats)',
      'Sensory decline',
    ],
    when_to_see_vet_immediately: [
      'Sudden screaming in pain',
      'Vocalizing while straining to urinate',
      'Cry-out with paralysis signs',
      'Vocalizing after trauma',
      'Distress vocalization with breathing trouble',
    ],
    related_breed_predispositions: ['siamese'],
  },
  {
    base: 'urinary-incontinence',
    name: 'Urinary incontinence',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Hormone-responsive incontinence (spayed dogs)',
      'Urinary tract infection',
      'Neurologic disease',
      'Age-related sphincter weakness',
      'Overflow from partial obstruction',
    ],
    when_to_see_vet_immediately: [
      'Incontinence with inability to empty the bladder',
      'Incontinence after spinal signs',
      'Blood with dribbling and lethargy',
      'Straining without a stream',
      'Trauma',
    ],
    related_breed_predispositions: ['doberman-pinscher', 'boxer'],
  },
  {
    base: 'discharge-from-eyes',
    name: 'Eye discharge',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Conjunctivitis',
      'Allergies',
      'Blocked tear ducts',
      'Corneal disease',
      'Upper respiratory infection (cats)',
    ],
    when_to_see_vet_immediately: [
      'Thick discharge with a closed, painful eye',
      'Discharge after trauma',
      'Cloudy cornea',
      'Sudden vision loss',
      'Swelling around the eye with fever',
    ],
    related_breed_predispositions: ['pug', 'persian', 'shih-tzu'],
  },
  {
    base: 'wound-not-healing',
    name: 'Wound not healing',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Infection',
      'Licking trauma',
      'Foreign material in the wound',
      'Poor blood supply',
      'Systemic disease delaying healing',
    ],
    when_to_see_vet_immediately: [
      'Wound with severe swelling and fever',
      'Foul discharge and lethargy',
      'Bleeding that will not stop',
      'Wound over a joint with sudden lameness',
      'Bite wound near the chest/abdomen',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'snoring-sudden',
    name: 'Sudden snoring or stertor',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Upper airway swelling',
      'Foreign body',
      'Brachycephalic airway crisis',
      'Nasopharyngeal polyp (cats)',
      'Infection',
    ],
    when_to_see_vet_immediately: [
      'New loud breathing with effort',
      'Blue gums',
      'Collapse',
      'After a choking episode',
      'Heat stress in a flat-faced breed',
    ],
    related_breed_predispositions: ['french-bulldog', 'pug', 'persian', 'english-bulldog'],
    related_emergency_slug: 'difficulty-breathing',
  },
  {
    base: 'fainting',
    name: 'Fainting (syncope)',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Heart arrhythmia',
      'Obstructive heart disease',
      'Severe coughing fits',
      'Low blood sugar',
      'Vasovagal events',
    ],
    when_to_see_vet_immediately: [
      'Any fainting episode',
      'Fainting with pale/blue gums',
      'Repeated episodes',
      'Fainting during excitement or exercise',
      'Not recovering promptly',
    ],
    related_breed_predispositions: ['boxer', 'doberman-pinscher', 'miniature-schnauzer'],
    related_emergency_slug: 'collapse',
  },
  {
    base: 'coughing-at-night',
    name: 'Coughing at night',
    species: 'both',
    urgency_level: 'urgent',
    common_causes: [
      'Congestive heart failure',
      'Kennel cough',
      'Collapsing trachea',
      'Airway irritation',
      'Aspiration',
    ],
    when_to_see_vet_immediately: [
      'Night cough with labored breathing',
      'Pink frothy fluid',
      'Blue gums',
      'Collapse',
      'Inability to lie down comfortably',
    ],
    related_breed_predispositions: ['cavalier-king-charles-spaniel', 'doberman-pinscher', 'maine-coon'],
    related_emergency_slug: 'difficulty-breathing',
  },
  {
    base: 'anal-gland-issues',
    name: 'Anal gland issues',
    species: 'dog',
    urgency_level: 'monitor',
    common_causes: [
      'Impacted anal sacs',
      'Infection/abscess',
      'Allergies contributing to inflammation',
      'Soft stools reducing natural expression',
      'Anatomical predisposition in small breeds',
    ],
    when_to_see_vet_immediately: [
      'Ruptured anal gland abscess',
      'Fever with perianal swelling',
      'Inability to defecate',
      'Severe pain / aggression on approach',
      'Heavy bleeding',
    ],
    related_breed_predispositions: ['chihuahua', 'poodle', 'french-bulldog'],
  },
  {
    base: 'dental-pain',
    name: 'Dental pain',
    species: 'both',
    urgency_level: 'monitor',
    common_causes: [
      'Periodontal disease',
      'Tooth fracture',
      'Tooth root abscess',
      'Resorptive lesions (cats)',
      'Oral foreign body',
    ],
    when_to_see_vet_immediately: [
      'Facial swelling under the eye',
      'Uncontrolled oral bleeding',
      'Inability to close the mouth',
      'Choking on a foreign object',
      'Refusal to eat with drooling and distress',
    ],
    related_breed_predispositions: ['yorkshire-terrier', 'persian', 'domestic-shorthair'],
  },
  {
    base: 'house-soiling',
    name: 'House soiling',
    species: 'dog',
    urgency_level: 'monitor',
    common_causes: [
      'Incomplete house training',
      'Urinary tract infection',
      'Anxiety / separation distress',
      'Cognitive dysfunction',
      'Incontinence',
    ],
    when_to_see_vet_immediately: [
      'Soiling with straining and no urine',
      'Blood in urine',
      'Soiling with neurologic weakness',
      'Sudden incontinence after trauma',
      'Lethargy and vomiting with accidents',
    ],
    related_breed_predispositions: [],
  },
  {
    base: 'open-mouth-breathing',
    name: 'Open-mouth breathing',
    species: 'cat',
    urgency_level: 'emergency',
    common_causes: [
      'Severe respiratory distress',
      'Heart failure / cardiomyopathy crisis',
      'Asthma attack',
      'Heat stress',
      'Pain or extreme stress (still needs urgent assessment)',
    ],
    when_to_see_vet_immediately: [
      'Any open-mouth breathing at rest',
      'Blue or gray tongue',
      'Crouching with neck extended',
      'Collapse',
      'Open-mouth breathing after possible toxin or trauma',
    ],
    related_breed_predispositions: ['maine-coon', 'ragdoll', 'siamese'],
    related_emergency_slug: 'difficulty-breathing',
  },
  {
    base: 'yellow-gums-jaundice',
    name: 'Yellow gums (jaundice)',
    species: 'both',
    urgency_level: 'emergency',
    common_causes: [
      'Liver disease or bile duct obstruction',
      'Immune-mediated hemolytic anemia',
      'Toxin exposure affecting red cells or liver',
      'Severe infection / sepsis',
      'Gallbladder disease',
    ],
    when_to_see_vet_immediately: [
      'Yellow gums, eyes, or skin',
      'Jaundice with collapse or extreme lethargy',
      'Jaundice with dark urine or pale stool',
      'Known toxin exposure',
      'Rapid breathing with yellow membranes',
    ],
    related_breed_predispositions: [],
    related_emergency_slug: 'collapse',
  },
];

if (BASE_SYMPTOMS.length !== 80) {
  console.error(`Expected 80 base symptoms, got ${BASE_SYMPTOMS.length}`);
  process.exit(1);
}

const SEO_ANGLES = [
  {
    id: 'when-to-worry',
    slugSuffix: 'when-to-worry',
    h1: (speciesLabel, name) => `${speciesLabel} ${name.toLowerCase()}: when to worry`,
    keyword: (speciesLabel, name) => `${speciesLabel.toLowerCase()} ${name.toLowerCase()} when to worry`,
    focus: 'triage thresholds and what “watchful waiting” still requires you to track',
  },
  {
    id: 'causes',
    slugSuffix: 'causes',
    h1: (speciesLabel, name) => `What causes ${name.toLowerCase()} in ${speciesLabel.toLowerCase()}s`,
    keyword: (speciesLabel, name) => `${speciesLabel.toLowerCase()} ${name.toLowerCase()} causes`,
    focus: 'plain-language causes and what information helps a vet narrow them down',
  },
];

/** High-search combination pairs (top 15). */
const COMBINATION_PAIRS = [
  ['vomiting', 'lethargy'],
  ['diarrhea', 'vomiting'],
  ['loss-of-appetite', 'lethargy'],
  ['coughing', 'lethargy'],
  ['limping', 'lethargy'],
  ['excessive-thirst', 'frequent-urination'],
  ['straining-to-urinate', 'lethargy'],
  ['difficulty-breathing', 'lethargy'],
  ['seizures', 'tremors'],
  ['itching', 'hair-loss'],
  ['vomiting', 'diarrhea'],
  ['pale-gums', 'lethargy'],
  ['bloated-abdomen', 'dry-heaving'],
  ['hiding', 'loss-of-appetite'],
  ['coughing-at-night', 'exercise-intolerance'],
];

const COMBINATION_ANGLES = [
  {
    id: 'together',
    slugSuffix: 'together',
    h1: (speciesLabel, a, b) => `${speciesLabel} ${a} and ${b}: what it can mean`,
    keyword: (speciesLabel, a, b) => `${speciesLabel.toLowerCase()} ${a} and ${b}`,
  },
  {
    id: 'when-to-worry',
    slugSuffix: 'when-to-worry',
    h1: (speciesLabel, a, b) => `${speciesLabel} ${a} and ${b}: when to worry`,
    keyword: (speciesLabel, a, b) => `${speciesLabel.toLowerCase()} ${a} and ${b} when to worry`,
  },
  {
    id: 'emergency-signs',
    slugSuffix: 'emergency-signs',
    h1: (speciesLabel, a, b) => `Emergency signs: ${speciesLabel.toLowerCase()} with ${a} and ${b}`,
    keyword: (speciesLabel, a, b) => `${speciesLabel.toLowerCase()} ${a} ${b} emergency`,
  },
  {
    id: 'what-to-tell-vet',
    slugSuffix: 'what-to-tell-vet',
    h1: (speciesLabel, a, b) => `What to tell the vet about ${speciesLabel.toLowerCase()} ${a} + ${b}`,
    keyword: (speciesLabel, a, b) => `${speciesLabel.toLowerCase()} ${a} and ${b} vet`,
  },
];

function titleCaseSpecies(species) {
  return species === 'dog' ? 'Dog' : 'Cat';
}

function humanize(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildSymptomRecords() {
  /** @type {import('../../content-types/symptom.ts').SymptomRecord[]} */
  const records = [];
  for (const s of BASE_SYMPTOMS) {
    const speciesList = s.species === 'both' ? ['dog', 'cat'] : [s.species];
    for (const species of speciesList) {
      const slug = `${s.base}-${species}`;
      const when = [...s.when_to_see_vet_immediately];
      // Soften dog-specific GDV lines for cats
      const filteredWhen =
        species === 'cat'
          ? when.filter((line) => !/GDV|deep-chested dogs|deep-chested breed/i.test(line))
          : when;
      if (species === 'cat' && filteredWhen.length < when.length) {
        filteredWhen.push('Repeated vomiting with a painful or swollen abdomen');
      }
      const record = {
        slug,
        name: `${s.name} (${species})`,
        species,
        urgency_level: s.urgency_level,
        common_causes: s.common_causes,
        when_to_see_vet_immediately: filteredWhen,
        related_breed_predispositions: (s.related_breed_predispositions || []).filter((b) => {
          // keep cross-species predispositions that exist in naming; filter obvious mismatches later if needed
          return true;
        }),
        ...(s.related_emergency_slug ? { related_emergency_slug: s.related_emergency_slug } : {}),
        ...(s.NEEDS_VET_REVIEW ? { NEEDS_VET_REVIEW: true } : {}),
        source_notes: [
          s.source_notes,
          species === 'dog' ? s.dog_notes : s.cat_notes,
        ]
          .filter(Boolean)
          .join(' '),
      };
      if (!record.source_notes) delete record.source_notes;
      records.push(record);
    }
  }
  return records;
}

function urgencyLead(urgency, speciesLabel, name) {
  if (urgency === 'emergency') {
    return `${name} in ${speciesLabel.toLowerCase()}s is treated as time-sensitive. If any red-flag sign below is present, contact an emergency veterinarian now — do not wait to “see if it passes.”`;
  }
  if (urgency === 'urgent') {
    return `${name} often needs same-day veterinary guidance, especially if it is new, worsening, or paired with other symptoms. Use the red-flag list to decide whether to call now versus schedule promptly.`;
  }
  return `${name} can be mild and short-lived, but patterns matter. Stay calm, watch for the escalation signs below, and write down timing so your vet is not guessing from memory.`;
}

function explainCauses(causes, speciesLabel, name, angleFocus) {
  const intro = `Owners searching about ${speciesLabel.toLowerCase()} ${name.toLowerCase()} usually want ${angleFocus}. Common reasons veterinarians consider include:`;
  const explained = causes.map((cause) => {
    const plain = cause.replace(/\s*\([^)]*\)/g, '').trim();
    return `${cause} — in plain terms, this means something in the “${plain.toLowerCase()}” category may be irritating or stressing your pet’s body. Only an exam (and sometimes tests) can sort which one.`;
  });
  return { intro, explained };
}

function buildSinglePage(record, angle, baseMeta) {
  const speciesLabel = titleCaseSpecies(record.species);
  const shortName = baseMeta.name;
  const pageSlug = `${baseMeta.base}-${angle.slugSuffix}`;
  const path = `/symptoms/${record.species}/${pageSlug}`;
  const primaryKeyword = angle.keyword(speciesLabel, shortName);
  const { intro, explained } = explainCauses(
    record.common_causes,
    speciesLabel,
    shortName,
    angle.focus,
  );

  const sections = [
    {
      heading: 'What this urgency level means',
      paragraphs: [
        urgencyLead(record.urgency_level, speciesLabel, shortName),
        angle.id === 'causes'
            ? `Cause lists are starting points, not a checklist for home diagnosis. Two pets can share the same symptom for entirely different reasons.`
            : `“When to worry” is less about a single episode and more about intensity, duration, and what else showed up at the same time.`,
      ],
    },
    {
      heading: 'Common causes (plain language)',
      paragraphs: [intro, ...explained.slice(0, 5)],
    },
    {
      heading: 'Call the vet now if you see',
      paragraphs: [
        'These signs come from the symptom record’s immediate-care list. If any apply, treat the situation as needing veterinary contact now:',
      ],
      bullets: record.when_to_see_vet_immediately,
    },
    {
      heading: 'What to write down before you call',
      paragraphs: [
        `Note when ${shortName.toLowerCase()} started, how many times it happened, whether appetite/energy changed, gum color if you can check calmly, and any toxin/trash/new food access. Bring medication names and doses.`,
      ],
    },
  ];

  if (record.related_breed_predispositions?.length) {
    sections.push({
      heading: 'Breed predispositions to keep in mind',
      paragraphs: [
        'Some breeds appear more often in discussions of related conditions. Predisposition is not destiny — it is a reason to escalate sooner and to keep better records:',
      ],
      breedLinks: record.related_breed_predispositions,
    });
  }

  if (record.urgency_level === 'emergency' && record.related_emergency_slug) {
    sections.push({
      heading: 'Related emergency guide',
      paragraphs: [
        'Because this symptom is marked emergency-level, pair this page with the step-by-step emergency guide:',
      ],
      emergencySlug: record.related_emergency_slug,
    });
  }

  sections.push({
    heading: 'Track the pattern',
    paragraphs: [PRODUCT_TIE_IN],
  });

  const metaDescription = `${primaryKeyword}: urgency ${record.urgency_level}, plain-language causes, and clear call-the-vet-now signs. ${DISCLAIMER}`;

  return {
    id: `${record.species}-${pageSlug}`,
    kind: 'single',
    species: record.species,
    pageSlug,
    path,
    symptomSlug: record.slug,
    symptomSlugs: [record.slug],
    angle: angle.id,
    h1: angle.h1(speciesLabel, shortName),
    primaryKeyword,
    metaDescription: metaDescription.slice(0, 160),
    urgency_level: record.urgency_level,
    lead: urgencyLead(record.urgency_level, speciesLabel, shortName),
    disclaimer: DISCLAIMER,
    productTieIn: PRODUCT_TIE_IN,
    sections,
    faqs: [
      {
        question: `Is ${shortName.toLowerCase()} in ${speciesLabel.toLowerCase()}s always an emergency?`,
        answer: `This guide marks urgency as ${record.urgency_level}. Escalate immediately if any red-flag sign appears. ${DISCLAIMER}`,
      },
      {
        question: `What should I tell the vet about ${shortName.toLowerCase()}?`,
        answer: `Share onset time, frequency, appetite/energy changes, gum color if observed, possible toxin or foreign material access, and any breed predispositions. ${DISCLAIMER}`,
      },
      {
        question: 'Can PetClues diagnose my pet?',
        answer: `No. PetClues helps you log timing and details for your veterinarian. ${DISCLAIMER}`,
      },
    ],
    related_breed_predispositions: record.related_breed_predispositions || [],
    related_emergency_slug:
      record.urgency_level === 'emergency' ? record.related_emergency_slug || null : null,
  };
}

function maxUrgency(a, b) {
  const rank = { emergency: 0, urgent: 1, monitor: 2 };
  return rank[a] <= rank[b] ? a : b;
}

function buildComboPage(recA, recB, baseA, baseB, species, angle) {
  const speciesLabel = titleCaseSpecies(species);
  const aName = baseA.name.toLowerCase();
  const bName = baseB.name.toLowerCase();
  const pageSlug = `${baseA.base}-and-${baseB.base}-${angle.slugSuffix}`;
  const path = `/symptoms/${species}/${pageSlug}`;
  const urgency = maxUrgency(recA.urgency_level, recB.urgency_level);
  const primaryKeyword = angle.keyword(speciesLabel, aName, bName);
  const redFlags = [
    ...new Set([...recA.when_to_see_vet_immediately, ...recB.when_to_see_vet_immediately]),
  ].slice(0, 8);

  const sections = [
    {
      heading: 'Why these two symptoms together matter',
      paragraphs: [
        `Searchers often look up ${aName} and ${bName} together because the combination can change urgency. Alone, one sign might be “monitor”; together, veterinarians often want a faster call.`,
        urgencyLead(urgency, speciesLabel, `${baseA.name} with ${baseB.name}`),
        angle.id === 'what-to-tell-vet'
          ? `Lead with the timeline: which sign started first, how far apart they appeared, and whether either is getting worse hour by hour.`
          : `Treat overlapping red flags from either symptom as actionable — you do not need both lists to “fully match.”`,
      ],
    },
    {
      heading: 'Causes veterinarians may consider',
      paragraphs: [
        `Possible contributors to ${aName}: ${recA.common_causes.slice(0, 3).join('; ')}.`,
        `Possible contributors to ${bName}: ${recB.common_causes.slice(0, 3).join('; ')}.`,
        'Overlapping causes (infection, toxins, pain, organ disease) are why combination pages exist — still not a diagnosis.',
      ],
    },
    {
      heading: 'Call the vet now if you see',
      paragraphs: ['If either symptom’s emergency signs appear, contact a veterinarian now:'],
      bullets: redFlags,
    },
    {
      heading: 'Track the pattern',
      paragraphs: [PRODUCT_TIE_IN],
    },
  ];

  const breeds = [
    ...new Set([
      ...(recA.related_breed_predispositions || []),
      ...(recB.related_breed_predispositions || []),
    ]),
  ].slice(0, 5);
  if (breeds.length) {
    sections.splice(3, 0, {
      heading: 'Breed predispositions to keep in mind',
      paragraphs: ['If your pet’s breed appears here, escalate sooner and keep tighter notes:'],
      breedLinks: breeds,
    });
  }

  const emergencySlug =
    urgency === 'emergency'
      ? recA.related_emergency_slug || recB.related_emergency_slug || null
      : null;
  if (emergencySlug) {
    sections.splice(-1, 0, {
      heading: 'Related emergency guide',
      paragraphs: ['This combination can reach emergency urgency. See also:'],
      emergencySlug,
    });
  }

  return {
    id: `${species}-${pageSlug}`,
    kind: 'combination',
    species,
    pageSlug,
    path,
    symptomSlug: recA.slug,
    symptomSlugs: [recA.slug, recB.slug],
    angle: angle.id,
    combination: { a: baseA.base, b: baseB.base },
    h1: angle.h1(speciesLabel, aName, bName),
    primaryKeyword,
    metaDescription: `${primaryKeyword}: combined urgency ${urgency}, shared red flags, and what to tell your vet. ${DISCLAIMER}`.slice(
      0,
      160,
    ),
    urgency_level: urgency,
    lead: urgencyLead(urgency, speciesLabel, `${baseA.name} with ${baseB.name}`),
    disclaimer: DISCLAIMER,
    productTieIn: PRODUCT_TIE_IN,
    sections,
    faqs: [
      {
        question: `Is ${aName} with ${bName} always an emergency in ${speciesLabel.toLowerCase()}s?`,
        answer: `Combined urgency on this page is ${urgency}. If any red-flag sign appears, contact a vet now. ${DISCLAIMER}`,
      },
      {
        question: 'Should I treat the symptoms separately?',
        answer: `Track both, but decide urgency from the worse sign and from overlap. ${DISCLAIMER}`,
      },
      {
        question: 'Can an app replace a veterinary exam?',
        answer: `No. Logging helps communication; it does not diagnose. ${DISCLAIMER}`,
      },
    ],
    related_breed_predispositions: breeds,
    related_emergency_slug: emergencySlug,
  };
}

function buildCatalog(records) {
  const byBaseSpecies = new Map();
  for (const r of records) {
    const base = r.slug.replace(/-dog$|-cat$/, '');
    byBaseSpecies.set(`${base}:${r.species}`, r);
  }
  const baseByKey = new Map(BASE_SYMPTOMS.map((b) => [b.base, b]));

  const pages = [];

  // Core + SEO angles for every species-specific record
  for (const base of BASE_SYMPTOMS) {
    const speciesList = base.species === 'both' ? ['dog', 'cat'] : [base.species];
    for (const species of speciesList) {
      const record = byBaseSpecies.get(`${base.base}:${species}`);
      if (!record) continue;
      for (const angle of SEO_ANGLES) {
        pages.push(buildSinglePage(record, angle, base));
      }
    }
  }

  // Combination pages
  for (const [a, b] of COMBINATION_PAIRS) {
    const baseA = baseByKey.get(a);
    const baseB = baseByKey.get(b);
    if (!baseA || !baseB) {
      console.warn(`Missing base for combo ${a}+${b}`);
      continue;
    }
    const speciesSet = new Set();
    for (const s of [baseA.species, baseB.species]) {
      if (s === 'both') {
        speciesSet.add('dog');
        speciesSet.add('cat');
      } else speciesSet.add(s);
    }
    // Only keep species both symptoms support
    const supported = [...speciesSet].filter((sp) => {
      const okA = baseA.species === 'both' || baseA.species === sp;
      const okB = baseB.species === 'both' || baseB.species === sp;
      return okA && okB;
    });
    for (const species of supported) {
      const recA = byBaseSpecies.get(`${a}:${species}`);
      const recB = byBaseSpecies.get(`${b}:${species}`);
      if (!recA || !recB) continue;
      for (const angle of COMBINATION_ANGLES) {
        pages.push(buildComboPage(recA, recB, baseA, baseB, species, angle));
      }
    }
  }

  // Stable order with high-intent URLs first so batch 1 is demo-ready
  const PRIORITY_PATHS = [
    '/symptoms/dog/vomiting-when-to-worry',
    '/symptoms/cat/vomiting-when-to-worry',
    '/symptoms/dog/difficulty-breathing-when-to-worry',
    '/symptoms/cat/difficulty-breathing-when-to-worry',
    '/symptoms/dog/limping-when-to-worry',
    '/symptoms/cat/limping-when-to-worry',
    '/symptoms/dog/diarrhea-when-to-worry',
    '/symptoms/cat/diarrhea-when-to-worry',
    '/symptoms/dog/lethargy-when-to-worry',
    '/symptoms/cat/lethargy-when-to-worry',
    '/symptoms/dog/seizures-when-to-worry',
    '/symptoms/cat/seizures-when-to-worry',
    '/symptoms/dog/straining-to-urinate-when-to-worry',
    '/symptoms/cat/straining-to-urinate-when-to-worry',
    '/symptoms/dog/vomiting-and-lethargy-when-to-worry',
    '/symptoms/cat/vomiting-and-lethargy-when-to-worry',
    '/symptoms/dog/diarrhea-and-vomiting-when-to-worry',
    '/symptoms/cat/diarrhea-and-vomiting-when-to-worry',
    '/symptoms/cat/hiding-and-loss-of-appetite-when-to-worry',
    '/symptoms/dog/pale-gums-and-lethargy-when-to-worry',
  ];
  const priorityIndex = new Map(PRIORITY_PATHS.map((p, i) => [p, i]));
  pages.sort((x, y) => {
    const px = priorityIndex.has(x.path) ? priorityIndex.get(x.path) : 1000;
    const py = priorityIndex.has(y.path) ? priorityIndex.get(y.path) : 1000;
    if (px !== py) return px - py;
    // Prefer when-to-worry before causes before combinations within the same band
    const kindRank = (p) => (p.kind === 'combination' ? 2 : p.angle === 'when-to-worry' ? 0 : 1);
    return kindRank(x) - kindRank(y) || x.path.localeCompare(y.path);
  });
  return pages;
}

function writeSymptomsJson(records) {
  const out = join(DATA_DIR, 'symptoms.json');
  // Strip generator-only fields not in published type if needed — related_emergency_slug is additive
  writeFileSync(out, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Wrote ${records.length} symptom records → ${out}`);
}

function writeManifest(pages) {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalPages: pages.length,
    batchSize: BATCH_SIZE,
    batchCount: Math.ceil(pages.length / BATCH_SIZE),
    disclaimer: DISCLAIMER,
    pages: pages.map((p, i) => ({
      index: i + 1,
      batch: Math.floor(i / BATCH_SIZE) + 1,
      id: p.id,
      path: p.path,
      species: p.species,
      pageSlug: p.pageSlug,
      kind: p.kind,
      urgency_level: p.urgency_level,
      primaryKeyword: p.primaryKeyword,
    })),
  };
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Manifest: ${pages.length} pages, ${manifest.batchCount} batches → ${MANIFEST}`);
  return manifest;
}

function writeBatch(pages, batchNum) {
  mkdirSync(OUT_DIR, { recursive: true });
  const start = (batchNum - 1) * BATCH_SIZE;
  const slice = pages.slice(start, start + BATCH_SIZE);
  if (!slice.length) {
    console.error(`Batch ${batchNum} is empty (total ${pages.length})`);
    process.exit(1);
  }
  const file = join(OUT_DIR, `batch-${String(batchNum).padStart(2, '0')}.json`);
  const payload = {
    batch: batchNum,
    count: slice.length,
    startIndex: start + 1,
    endIndex: start + slice.length,
    disclaimer: DISCLAIMER,
    pages: slice,
  };
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Batch ${batchNum}: pages ${payload.startIndex}–${payload.endIndex} → ${file}`);
  return payload;
}

function main() {
  const args = process.argv.slice(2);
  const writeData = args.includes('--write-data');
  const manifestOnly = args.includes('--manifest');
  const batchIdx = args.indexOf('--batch');
  const batchArg = batchIdx >= 0 ? args[batchIdx + 1] : null;

  const records = buildSymptomRecords();
  if (writeData) writeSymptomsJson(records);

  // Prefer on-disk symptoms.json if present and write-data not forcing rebuild of catalog from BASE
  let catalogRecords = records;
  const diskPath = join(DATA_DIR, 'symptoms.json');
  if (existsSync(diskPath) && !writeData) {
    catalogRecords = JSON.parse(readFileSync(diskPath, 'utf8'));
  }

  // Catalog always built from BASE + records derived the same way
  const pages = buildCatalog(records);
  if (manifestOnly || writeData || !batchArg) {
    writeManifest(pages);
  }

  if (batchArg === 'all') {
    const count = Math.ceil(pages.length / BATCH_SIZE);
    for (let i = 1; i <= count; i += 1) writeBatch(pages, i);
    // index file for the app loader
    writeFileSync(
      join(OUT_DIR, 'index.json'),
      `${JSON.stringify(
        {
          totalPages: pages.length,
          batches: count,
          paths: pages.map((p) => p.path),
        },
        null,
        2,
      )}\n`,
    );
  } else if (batchArg) {
    const n = Number(batchArg);
    if (!Number.isFinite(n) || n < 1) {
      console.error('Invalid --batch');
      process.exit(1);
    }
    writeBatch(pages, n);
    // Update lightweight index of generated batches
    writeManifest(pages);
  }

  console.log(
    JSON.stringify(
      {
        baseSymptoms: BASE_SYMPTOMS.length,
        symptomRecords: records.length,
        totalPages: pages.length,
        batches: Math.ceil(pages.length / BATCH_SIZE),
        singles: pages.filter((p) => p.kind === 'single').length,
        combinations: pages.filter((p) => p.kind === 'combination').length,
      },
      null,
      2,
    ),
  );
}

main();
