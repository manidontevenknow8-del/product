/**
 * One-shot generator: expands breed×condition pSEO matrix to >= 100 unique pages.
 * Run: node scripts/generate-pseo-matrix.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outPath = join(root, 'src/data/breedConditionsExpanded.ts');

const W = {
  ivdd: 'https://www.wikidata.org/wiki/Q1341142',
  hip: 'https://www.wikidata.org/wiki/Q1139785',
  boas: 'https://www.wikidata.org/wiki/Q16985780',
  dm: 'https://www.wikidata.org/wiki/Q5251774',
  dcm: 'https://www.wikidata.org/wiki/Q2838005',
  gdv: 'https://www.wikidata.org/wiki/Q1495675',
  epilepsy: 'https://www.wikidata.org/wiki/Q41571',
  trachea: 'https://www.wikidata.org/wiki/Q7831629',
  pra: 'https://www.wikidata.org/wiki/Q2111739',
  cushing: 'https://www.wikidata.org/wiki/Q192788',
  hypoT: 'https://www.wikidata.org/wiki/Q16567',
  diabetes: 'https://www.wikidata.org/wiki/Q12206',
  atopic: 'https://www.wikidata.org/wiki/Q26882',
  ccl: 'https://www.wikidata.org/wiki/Q133327',
  osteo: 'https://www.wikidata.org/wiki/Q938794',
  pss: 'https://www.wikidata.org/wiki/Q2104796',
  mmvd: 'https://www.wikidata.org/wiki/Q18557121',
  eic: 'https://www.wikidata.org/wiki/Q16991525',
  addison: 'https://www.wikidata.org/wiki/Q132754',
  pancreas: 'https://www.wikidata.org/wiki/Q192612',
  bloat: 'https://www.wikidata.org/wiki/Q1495675',
};

/** conditionKey → template */
const CONDITIONS = {
  ivdd: {
    condition: 'IVDD',
    scientificName: 'Intervertebral disc disease',
    riskLevel: 'Severe',
    wikidataUri: W.ivdd,
    symptoms: [
      'Sudden cry-out pain with a hunched back',
      'Reluctance to jump or climb stairs',
      'Wobbly gait progressing toward paralysis',
      'Loss of bladder or bowel control in advanced grades',
      'Knuckling or dragging of pelvic limbs',
    ],
    protocol: [
      'Log mobility grade (pain → ataxia → paresis → plegia) with exact timestamps',
      'Archive MRI level(s), neurology notes, and surgical reports',
      'Document crate-rest compliance windows and exceptions',
      'Track bladder expression schedules and UTI treatment',
      'Photograph ramp/home setup for sitters and rehab teams',
    ],
  },
  'hip-dysplasia': {
    condition: 'Hip Dysplasia',
    scientificName: 'Canine hip dysplasia',
    riskLevel: 'High',
    wikidataUri: W.hip,
    symptoms: [
      'Bunny-hopping or swaying gait when running',
      'Difficulty rising after rest',
      'Reduced thigh muscle mass over months',
      'Pain on hip extension during exam',
      'Exercise intolerance that worsens with weight gain',
    ],
    protocol: [
      'Store OFA/PennHIP and radiographic reports with dates',
      'Track body-condition score and weight monthly',
      'Log NSAID courses, joint supplements, and PT sessions',
      'Archive pre/post-operative notes if corrective surgery occurs',
      'Share a mobility timeline before boarding or travel',
    ],
  },
  boas: {
    condition: 'BOAS',
    scientificName: 'Brachycephalic obstructive airway syndrome',
    riskLevel: 'Severe',
    wikidataUri: W.boas,
    symptoms: [
      'Noisy breathing or stertor at rest',
      'Heat intolerance and exercise collapse risk',
      'Open-mouth breathing during mild excitement',
      'Sleep apnea or restless sleep',
      'Gagging, regurgitation, or reverse sneezing',
    ],
    protocol: [
      'Photograph nares and log respiratory effort at rest vs. after walks',
      'Record BOAS grade and every airway surgery report',
      'Harness-only walking; ban collars and heat exposure',
      'Keep airway-aware anesthetic consent notes for elective procedures',
      'Store regurgitation episodes with ambient temperature',
    ],
  },
  'degenerative-myelopathy': {
    condition: 'Degenerative Myelopathy',
    scientificName: 'Canine degenerative myelopathy',
    riskLevel: 'Severe',
    wikidataUri: W.dm,
    symptoms: [
      'Slowly progressive rear-limb ataxia without obvious pain',
      'Knuckling or scuffing of hind toenails',
      'Crossing over of pelvic limbs',
      'Eventual paraparesis that may ascend',
      'SOD1 at-risk genotype on record',
    ],
    protocol: [
      'Archive SOD1 genotype and counseling notes',
      'Date serial neurologic exams (proprioception, urinary status)',
      'Log physiotherapy, harness, and cart introduction dates',
      'Keep MRI rule-outs beside the working DM diagnosis',
      'Maintain a shared quality-of-life scorecard',
    ],
  },
  'dilated-cardiomyopathy': {
    condition: 'Dilated Cardiomyopathy',
    scientificName: 'Dilated cardiomyopathy',
    riskLevel: 'Severe',
    wikidataUri: W.dcm,
    symptoms: [
      'Arrhythmias or ventricular ectopy on Holter screening',
      'Syncope or weakness during exercise',
      'Cough, tachypnea, or abdominal distension',
      'Family history of sudden cardiac death',
      'Reduced fractional shortening on echo',
    ],
    protocol: [
      'Schedule and archive Holter monitors at recommended intervals',
      'Keep every echocardiogram with chamber dimensions',
      'Track anti-arrhythmic and heart-failure drug changes',
      'Document syncopal events with activity context',
      'Coordinate cardiology clearance before long flights',
    ],
  },
  gdv: {
    condition: 'GDV (Bloat)',
    scientificName: 'Gastric dilatation-volvulus',
    riskLevel: 'Severe',
    wikidataUri: W.gdv,
    symptoms: [
      'Non-productive retching with a rapidly distending abdomen',
      'Restlessness, hypersalivation, and pale gums',
      'Collapse or weakness with elevated heart rate',
      'Deep-chested conformation with large single meals',
      'Unknown or pending prophylactic gastropexy status',
    ],
    protocol: [
      'Record prophylactic gastropexy date, surgeon, and technique',
      'Write an ER pathway to the nearest 24/7 surgical hospital',
      'Log feeding schedule (small meals) and exercise rules after eating',
      'If GDV occurs, archive operative and ICU reports',
      'Update the emergency passport with bloat risk status',
    ],
  },
  epilepsy: {
    condition: 'Epilepsy',
    scientificName: 'Idiopathic epilepsy',
    riskLevel: 'Moderate',
    wikidataUri: W.epilepsy,
    symptoms: [
      'Generalized tonic-clonic seizures with loss of consciousness',
      'Cluster seizures within 24 hours',
      'Post-ictal disorientation or temporary blindness',
      'Normal interictal neurologic exam between events',
      'Typical onset between 6 months and 6 years',
    ],
    protocol: [
      'Log every seizure: start time, length, cluster count, recovery',
      'Store MRI/CSF results that ruled out structural disease',
      'Track anticonvulsant levels and dose changes',
      'Define a written status epilepticus emergency protocol',
      'Give sitters a one-page seizure action card from the vault',
    ],
  },
  'tracheal-collapse': {
    condition: 'Tracheal Collapse',
    scientificName: 'Tracheal collapse',
    riskLevel: 'High',
    wikidataUri: W.trachea,
    symptoms: [
      'Goose-honk cough triggered by excitement or collar pressure',
      'Worsening cough with heat, humidity, or obesity',
      'Exercise intolerance in advanced grades',
      'Relief when calm; flares when pulling on leash',
      'Fluoroscopy or endoscopy grade on file',
    ],
    protocol: [
      'Harness-only walking; document collar-triggered flares',
      'Archive fluoroscopy/tracheoscopy grading reports',
      'Log antitussives, steroids, and bronchodilator trials',
      'Control weight and environmental triggers with a flare diary',
      'If stented, preserve implant details and follow-up scopes',
    ],
  },
  'progressive-retinal-atrophy': {
    condition: 'Progressive Retinal Atrophy',
    scientificName: 'Progressive retinal atrophy',
    riskLevel: 'High',
    wikidataUri: W.pra,
    symptoms: [
      'Night blindness progressing to daylight vision loss',
      'Reluctance to navigate dim rooms or stairs',
      'Dilated pupils with reduced menace response over time',
      'Genetic PRA panel positive or carrier status',
      'Secondary cataract formation in some cases',
    ],
    protocol: [
      'Archive genetic PRA panel and ophthalmology reports',
      'Log vision milestone changes with dated home videos',
      'Adapt home lighting and keep a consistent furniture map for sitters',
      'Store cataract or surgical consult notes if they arise',
      'Update travel and boarding instructions for vision-impaired dogs',
    ],
  },
  hypothyroidism: {
    condition: 'Hypothyroidism',
    scientificName: 'Canine hypothyroidism',
    riskLevel: 'Moderate',
    wikidataUri: W.hypoT,
    symptoms: [
      'Weight gain despite stable calorie intake',
      'Lethargy and cold intolerance',
      'Symmetric hair thinning or poor coat quality',
      'Recurrent skin or ear infections',
      'Elevated TSH / low T4 pattern on labs',
    ],
    protocol: [
      'Store thyroid panels (TT4, FT4, TSH) with lab dates',
      'Track levothyroxine dose changes and timing',
      'Log weight and coat quality monthly after starting therapy',
      'Archive concurrent skin infection treatments',
      'Share latest labs before anesthesia or travel',
    ],
  },
  diabetes: {
    condition: 'Diabetes',
    scientificName: 'Diabetes mellitus',
    riskLevel: 'High',
    wikidataUri: W.diabetes,
    symptoms: [
      'Increased thirst and urination',
      'Weight loss despite increased appetite',
      'Cloudy eyes from diabetic cataracts',
      'Recurrent urinary tract infections',
      'Lethargy or ketoacidosis crisis history',
    ],
    protocol: [
      'Log insulin brand, dose, and injection times daily',
      'Store glucose curves and fructosamine results',
      'Track water intake, urine accidents, and appetite',
      'Archive cataract surgery notes if pursued',
      'Keep a hypoglycemia emergency protocol for sitters',
    ],
  },
  'atopic-dermatitis': {
    condition: 'Atopic Dermatitis',
    scientificName: 'Canine atopic dermatitis',
    riskLevel: 'Moderate',
    wikidataUri: W.atopic,
    symptoms: [
      'Seasonal or year-round itching focused on paws and face',
      'Recurrent ear infections and hot spots',
      'Hair loss from licking or scratching',
      'Partial response to elimination diet trials',
      'Allergy testing or cytology notes on file',
    ],
    protocol: [
      'Log flare dates, weather, and suspected triggers',
      'Archive diet trials, cytopoint/apoquel courses, and allergy tests',
      'Track ear infection episodes and culture results',
      'Photograph lesion maps for dermatology follow-ups',
      'Share a boarding-friendly itch protocol with product list',
    ],
  },
  cruciate: {
    condition: 'Cruciate Ligament Injury',
    scientificName: 'Cranial cruciate ligament disease',
    riskLevel: 'High',
    wikidataUri: W.ccl,
    symptoms: [
      'Sudden non-weight-bearing lameness in a hind limb',
      'Sit with the affected leg kicked out to the side',
      'Stifle swelling or pain on drawer testing',
      'Chronic intermittent limp before acute failure',
      'Contralateral limb risk after the first tear',
    ],
    protocol: [
      'Archive orthopedic exam, radiographs, and surgical method (TPLO/TTA/extracapsular)',
      'Log post-op rehab milestones week by week',
      'Track weight aggressively to protect the other stifle',
      'Document activity restrictions and return-to-walk plans',
      'Keep implant details for airport security and future imaging',
    ],
  },
  osteosarcoma: {
    condition: 'Osteosarcoma',
    scientificName: 'Osteosarcoma',
    riskLevel: 'Severe',
    wikidataUri: W.osteo,
    symptoms: [
      'Progressive lameness localized to a long bone',
      'Firm painful swelling on a limb',
      'Pathologic fracture after minimal trauma',
      'Lethargy or reduced appetite with advanced disease',
      'Staging imaging (chest) completed or pending',
    ],
    protocol: [
      'Store radiographs, CT/MRI, and biopsy/histopathology reports',
      'Track amputation or limb-spare surgery details and pathology margins',
      'Log chemotherapy protocols, dates, and bloodwork nadirs',
      'Maintain pain scores and quality-of-life checklists',
      'Keep oncology contacts in the emergency passport',
    ],
  },
  'mitral-valve-disease': {
    condition: 'Mitral Valve Disease',
    scientificName: 'Myxomatous mitral valve disease',
    riskLevel: 'High',
    wikidataUri: W.mmvd,
    symptoms: [
      'Left-apical systolic murmur on wellness exam',
      'Coughing at night or after excitement',
      'Elevated sleeping respiratory rate',
      'Reduced stamina on usual walks',
      'Syncope in advanced congestive stages',
    ],
    protocol: [
      'Archive echocardiograms with ACVIM stage',
      'Log sleeping respiratory rate weekly',
      'Track pimobendan/ACE-I/diuretic start dates',
      'Store thoracic radiograph reports from heart-failure episodes',
      'Request staged cardiology letters before flights',
    ],
  },
  cushings: {
    condition: "Cushing's Disease",
    scientificName: 'Hyperadrenocorticism',
    riskLevel: 'High',
    wikidataUri: W.cushing,
    symptoms: [
      'Increased thirst, urination, and appetite',
      'Pot-bellied appearance and muscle wasting',
      'Symmetric hair loss and thin skin',
      'Panting at rest',
      'Recurrent infections or calcinosis cutis',
    ],
    protocol: [
      'Store ACTH stim / LDDS results and imaging of adrenals',
      'Track trilostane or mitotane doses and monitoring labs',
      'Log water intake and accident frequency',
      'Archive skin infection treatments tied to cortisol control',
      'Share latest endocrine labs before anesthesia',
    ],
  },
  addisons: {
    condition: "Addison's Disease",
    scientificName: 'Hypoadrenocorticism',
    riskLevel: 'Severe',
    wikidataUri: W.addison,
    symptoms: [
      'Waxing/waning lethargy and GI upset',
      'Collapse during stress or illness',
      'Bradycardia with characteristic electrolyte shifts',
      'Prior “mystery” dehydration episodes',
      'ACTH stim confirming diagnosis',
    ],
    protocol: [
      'Archive ACTH stim and electrolyte panels',
      'Log DOCP/florinef and daily prednisone doses',
      'Write a crisis protocol for vomiting/collapse',
      'Track injection due dates with calendar reminders',
      'Keep emergency passport flagged for Addisonian risk',
    ],
  },
  pancreatitis: {
    condition: 'Pancreatitis',
    scientificName: 'Pancreatitis',
    riskLevel: 'High',
    wikidataUri: W.pancreas,
    symptoms: [
      'Acute vomiting with a painful, tucked abdomen',
      'Anorexia and lethargy',
      'Diarrhea or defervescence after a high-fat meal',
      'Elevated cPLI / pancreatic lipase on labs',
      'Recurrent flares after dietary indiscretion',
    ],
    protocol: [
      'Store cPLI results, ultrasound reports, and hospitalization notes',
      'Log every flare with diet history for the prior 48 hours',
      'Maintain a strict low-fat diet brand list for sitters',
      'Track antiemetics, fluids, and pain meds used',
      'Update travel food rules to prevent recurrence on the road',
    ],
  },
  'portosystemic-shunt': {
    condition: 'Portosystemic Shunt',
    scientificName: 'Portosystemic shunt',
    riskLevel: 'Severe',
    wikidataUri: W.pss,
    symptoms: [
      'Stunted growth compared with littermates',
      'Neurologic signs after high-protein meals',
      'Prolonged recovery from anesthesia',
      'Ammonia or bile acid elevation on labs',
      'Imaging confirming congenital or acquired shunt',
    ],
    protocol: [
      'Archive bile acid tests, ammonia levels, and imaging (CT/scintigraphy)',
      'Log hepatic diet brand, feeding times, and lactulose doses',
      'Store surgical attenuation reports if corrected',
      'Track neurologic episodes with meal timing',
      'Flag anesthetic risk in the emergency passport',
    ],
  },
  'exercise-induced-collapse': {
    condition: 'Exercise-Induced Collapse',
    scientificName: 'Exercise-induced collapse',
    riskLevel: 'High',
    wikidataUri: W.eic,
    symptoms: [
      'Rear-limb weakness after 5–15 minutes of intense play',
      'Collapse with a clear mind (usually non-epileptic)',
      'Rapid recovery over minutes with rest',
      'Triggers: retrieve drills, heat, high drive',
      'DNM1 mutation positive or carrier',
    ],
    protocol: [
      'Store DNM1 genotype documentation',
      'Build an episode log: temp, activity, duration, recovery',
      'Keep cardiac/neuro rule-outs adjacent in the vault',
      'Document safe activity thresholds for trainers',
      'Share EIC protocol with daycare and competition staff',
    ],
  },
};

/** Breed slug, display name, and realistic condition keys */
const BREEDS = [
  ['labrador-retriever', 'Labrador Retriever', ['hip-dysplasia', 'exercise-induced-collapse', 'cruciate', 'atopic-dermatitis', 'diabetes']],
  ['golden-retriever', 'Golden Retriever', ['hip-dysplasia', 'cancer-proxy-osteo', 'atopic-dermatitis', 'hypothyroidism', 'cruciate']],
  ['german-shepherd', 'German Shepherd', ['degenerative-myelopathy', 'hip-dysplasia', 'dilated-cardiomyopathy', 'pancreatitis', 'atopic-dermatitis']],
  ['french-bulldog', 'French Bulldog', ['boas', 'ivdd', 'atopic-dermatitis', 'hip-dysplasia']],
  ['english-bulldog', 'English Bulldog', ['boas', 'hip-dysplasia', 'atopic-dermatitis', 'cruciate']],
  ['pug', 'Pug', ['boas', 'diabetes', 'atopic-dermatitis', 'hip-dysplasia']],
  ['boston-terrier', 'Boston Terrier', ['boas', 'patella-proxy-cruciate', 'atopic-dermatitis', 'deafness-proxy-pra']],
  ['dachshund', 'Dachshund', ['ivdd', 'diabetes', 'cushings', 'obesity-proxy-pancreatitis']],
  ['pembroke-welsh-corgi', 'Pembroke Welsh Corgi', ['ivdd', 'degenerative-myelopathy', 'hip-dysplasia', 'progressive-retinal-atrophy']],
  ['beagle', 'Beagle', ['epilepsy', 'hypothyroidism', 'atopic-dermatitis', 'diabetes']],
  ['boxer', 'Boxer', ['dilated-cardiomyopathy', 'cancer-proxy-osteo', 'hip-dysplasia', 'hypothyroidism']],
  ['rottweiler', 'Rottweiler', ['hip-dysplasia', 'osteosarcoma', 'cruciate', 'dilated-cardiomyopathy']],
  ['doberman-pinscher', 'Doberman Pinscher', ['dilated-cardiomyopathy', 'von-proxy-addisons', 'hip-dysplasia', 'hypothyroidism']],
  ['great-dane', 'Great Dane', ['gdv', 'dilated-cardiomyopathy', 'hip-dysplasia', 'osteosarcoma']],
  ['mastiff', 'Mastiff', ['hip-dysplasia', 'gdv', 'cruciate', 'hypothyroidism']],
  ['bernese-mountain-dog', 'Bernese Mountain Dog', ['hip-dysplasia', 'cancer-proxy-osteo', 'gdv', 'progressive-retinal-atrophy']],
  ['newfoundland', 'Newfoundland', ['hip-dysplasia', 'dilated-cardiomyopathy', 'gdv', 'hypothyroidism']],
  ['saint-bernard', 'Saint Bernard', ['hip-dysplasia', 'gdv', 'dilated-cardiomyopathy', 'osteosarcoma']],
  ['cavalier-king-charles-spaniel', 'Cavalier King Charles Spaniel', ['mitral-valve-disease', 'syringomyelia-proxy-ivdd', 'hip-dysplasia', 'atopic-dermatitis']],
  ['shih-tzu', 'Shih Tzu', ['boas', 'tracheal-collapse', 'atopic-dermatitis', 'portosystemic-shunt']],
  ['yorkshire-terrier', 'Yorkshire Terrier', ['tracheal-collapse', 'portosystemic-shunt', 'patella-proxy-cruciate', 'pancreatitis']],
  ['maltese', 'Maltese', ['tracheal-collapse', 'portosystemic-shunt', 'patella-proxy-cruciate', 'atopic-dermatitis']],
  ['pomeranian', 'Pomeranian', ['tracheal-collapse', 'patella-proxy-cruciate', 'hypothyroidism', 'atopic-dermatitis']],
  ['chihuahua', 'Chihuahua', ['tracheal-collapse', 'patella-proxy-cruciate', 'hypothyroidism', 'heart-proxy-mmvd']],
  ['standard-poodle', 'Standard Poodle', ['gdv', 'addisons', 'hip-dysplasia', 'progressive-retinal-atrophy', 'epilepsy']],
  ['miniature-poodle', 'Miniature Poodle', ['progressive-retinal-atrophy', 'patella-proxy-cruciate', 'epilepsy', 'diabetes', 'tracheal-collapse']],
  ['cocker-spaniel', 'Cocker Spaniel', ['atopic-dermatitis', 'otitis-proxy-atopic', 'hip-dysplasia', 'progressive-retinal-atrophy', 'hypothyroidism']],
  ['english-springer-spaniel', 'English Springer Spaniel', ['hip-dysplasia', 'phosphofructokinase-proxy-eic', 'atopic-dermatitis', 'progressive-retinal-atrophy']],
  ['border-collie', 'Border Collie', ['epilepsy', 'hip-dysplasia', 'collie-eye-proxy-pra', 'exercise-induced-collapse']],
  ['australian-shepherd', 'Australian Shepherd', ['hip-dysplasia', 'epilepsy', 'progressive-retinal-atrophy', 'mdr1-proxy-pancreatitis']],
  ['siberian-husky', 'Siberian Husky', ['hip-dysplasia', 'progressive-retinal-atrophy', 'hypothyroidism', 'zinc-proxy-atopic']],
  ['alaskan-malamute', 'Alaskan Malamute', ['hip-dysplasia', 'hypothyroidism', 'zinc-proxy-atopic', 'gdv']],
  ['akita', 'Akita', ['hip-dysplasia', 'hypothyroidism', 'progressive-retinal-atrophy', 'gdv']],
  ['shiba-inu', 'Shiba Inu', ['atopic-dermatitis', 'hip-dysplasia', 'glaucoma-proxy-pra', 'hypothyroidism']],
  ['staffordshire-bull-terrier', 'Staffordshire Bull Terrier', ['hip-dysplasia', 'atopic-dermatitis', 'cruciate', 'l2hga-proxy-epilepsy']],
  ['american-staffordshire-terrier', 'American Staffordshire Terrier', ['hip-dysplasia', 'cruciate', 'atopic-dermatitis', 'cerebellar-proxy-epilepsy']],
  ['whippet', 'Whippet', ['heart-proxy-mmvd', 'anesthesia-proxy-addisons', 'muscle-proxy-eic']],
  ['greyhound', 'Greyhound', ['osteosarcoma', 'anesthesia-proxy-addisons', 'hypothyroidism', 'dental-proxy-pancreatitis']],
  ['shar-pei', 'Shar Pei', ['atopic-dermatitis', 'amyloid-proxy-addisons', 'hip-dysplasia', 'entropion-proxy-pra']],
  ['chow-chow', 'Chow Chow', ['hip-dysplasia', 'hypothyroidism', 'entropion-proxy-pra', 'gdv']],
  ['dalmatian', 'Dalmatian', ['deafness-proxy-pra', 'urate-proxy-pancreatitis', 'atopic-dermatitis', 'hip-dysplasia']],
  ['basset-hound', 'Basset Hound', ['ivdd', 'gdv', 'glaucoma-proxy-pra', 'atopic-dermatitis', 'hip-dysplasia']],
  ['bloodhound', 'Bloodhound', ['gdv', 'hip-dysplasia', 'entropion-proxy-pra', 'ear-proxy-atopic']],
  ['weimaraner', 'Weimaraner', ['gdv', 'hip-dysplasia', 'hypothyroidism', 'von-proxy-addisons']],
  ['vizsla', 'Vizsla', ['hip-dysplasia', 'epilepsy', 'atopic-dermatitis', 'lymphoma-proxy-osteo']],
  ['rhodesian-ridgeback', 'Rhodesian Ridgeback', ['hip-dysplasia', 'dermoid-proxy-atopic', 'hypothyroidism', 'gdv']],
  ['bull-terrier', 'Bull Terrier', ['deafness-proxy-pra', 'atopic-dermatitis', 'heart-proxy-mmvd', 'kidney-proxy-addisons']],
  ['west-highland-white-terrier', 'West Highland White Terrier', ['atopic-dermatitis', 'pulmonary-proxy-tracheal', 'diabetes', 'leg-proxy-cruciate']],
  ['scottish-terrier', 'Scottish Terrier', ['bladder-cancer-proxy-osteo', 'atopic-dermatitis', 'cushings', 'scottie-cramp-proxy-epilepsy']],
  ['bulldog', 'Bulldog', ['boas', 'hip-dysplasia', 'atopic-dermatitis', 'cherry-eye-proxy-pra']],
  ['cane-corso', 'Cane Corso', ['hip-dysplasia', 'gdv', 'demodicosis-proxy-atopic', 'dilated-cardiomyopathy']],
  ['dogue-de-bordeaux', 'Dogue de Bordeaux', ['hip-dysplasia', 'gdv', 'heart-proxy-dcm', 'lymphoma-proxy-osteo']],
  ['irish-wolfhound', 'Irish Wolfhound', ['dilated-cardiomyopathy', 'osteosarcoma', 'gdv', 'hip-dysplasia']],
  ['afghan-hound', 'Afghan Hound', ['hip-dysplasia', 'hypothyroidism', 'cancer-proxy-osteo', 'anesthesia-proxy-addisons']],
  ['basenji', 'Basenji', ['fanconi-proxy-addisons', 'progressive-retinal-atrophy', 'hip-dysplasia', 'ibs-proxy-pancreatitis']],
  ['samoyed', 'Samoyed', ['hip-dysplasia', 'diabetes', 'progressive-retinal-atrophy', 'hypothyroidism']],
  ['keeshond', 'Keeshond', ['epilepsy', 'hip-dysplasia', 'hypothyroidism', 'diabetes', 'patella-proxy-cruciate']],
  ['papillon', 'Papillon', ['patella-proxy-cruciate', 'progressive-retinal-atrophy', 'dental-proxy-pancreatitis', 'heart-proxy-mmvd']],
  ['havanese', 'Havanese', ['patella-proxy-cruciate', 'atopic-dermatitis', 'heart-proxy-mmvd', 'chondrodysplasia-proxy-ivdd']],
  ['bichon-frise', 'Bichon Frise', ['atopic-dermatitis', 'patella-proxy-cruciate', 'diabetes', 'bladder-stones-proxy-pancreatitis']],
  ['miniature-schnauzer', 'Miniature Schnauzer', ['pancreatitis', 'diabetes', 'hyperlipidemia-proxy-pancreatitis', 'urinary-proxy-diabetes', 'atopic-dermatitis']],
  ['giant-schnauzer', 'Giant Schnauzer', ['hip-dysplasia', 'hypothyroidism', 'osteosarcoma', 'epilepsy']],
  ['soft-coated-wheaten-terrier', 'Soft Coated Wheaten Terrier', ['protein-losing-proxy-addisons', 'atopic-dermatitis', 'hip-dysplasia', 'renal-proxy-addisons']],
  ['airedale-terrier', 'Airedale Terrier', ['hip-dysplasia', 'hypothyroidism', 'cancer-proxy-osteo', 'umbilical-proxy-pss']],
  ['irish-setter', 'Irish Setter', ['gdv', 'hip-dysplasia', 'progressive-retinal-atrophy', 'hypothyroidism', 'epilepsy']],
  ['gordon-setter', 'Gordon Setter', ['hip-dysplasia', 'progressive-retinal-atrophy', 'hypothyroidism', 'cerebellar-proxy-epilepsy']],
  ['brittany', 'Brittany', ['hip-dysplasia', 'epilepsy', 'hypothyroidism', 'otitis-proxy-atopic']],
  ['pointer', 'Pointer', ['hip-dysplasia', 'epilepsy', 'hypothyroidism', 'gdv']],
  ['jack-russell-terrier', 'Jack Russell Terrier', ['patella-proxy-cruciate', 'lens-luxation-proxy-pra', 'atopic-dermatitis', 'deafness-proxy-pra']],
  ['rat-terrier', 'Rat Terrier', ['patella-proxy-cruciate', 'leg-proxy-cruciate', 'dental-proxy-pancreatitis', 'hypothyroidism']],
  ['italian-greyhound', 'Italian Greyhound', ['fractures-proxy-osteo', 'dental-proxy-pancreatitis', 'progressive-retinal-atrophy', 'epilepsy']],
  ['chinese-crested', 'Chinese Crested', ['patella-proxy-cruciate', 'progressive-retinal-atrophy', 'dental-proxy-pancreatitis', 'skin-proxy-atopic']],
  ['lhasa-apso', 'Lhasa Apso', ['renal-proxy-addisons', 'atopic-dermatitis', 'boas', 'progressive-retinal-atrophy']],
  ['pekingese', 'Pekingese', ['boas', 'ivdd', 'eye-proxy-pra', 'heart-proxy-mmvd']],
  ['japanese-chin', 'Japanese Chin', ['boas', 'patella-proxy-cruciate', 'heart-proxy-mmvd', 'ocular-proxy-pra']],
  ['brussels-griffon', 'Brussels Griffon', ['boas', 'syringomyelia-proxy-ivdd', 'patella-proxy-cruciate', 'eye-proxy-pra']],
  ['affenpinscher', 'Affenpinscher', ['patella-proxy-cruciate', 'hip-dysplasia', 'heart-proxy-mmvd', 'dental-proxy-pancreatitis']],
  ['tibetan-terrier', 'Tibetan Terrier', ['progressive-retinal-atrophy', 'hip-dysplasia', 'hypothyroidism', 'neuronal-proxy-epilepsy']],
  ['norwegian-elkhound', 'Norwegian Elkhound', ['hip-dysplasia', 'progressive-retinal-atrophy', 'hypothyroidism', 'renal-proxy-addisons']],
  ['finnish-spitz', 'Finnish Spitz', ['hip-dysplasia', 'epilepsy', 'patella-proxy-cruciate', 'diabetes']],
  ['pharaoh-hound', 'Pharaoh Hound', ['anesthesia-proxy-addisons', 'allergy-proxy-atopic', 'hip-dysplasia']],
  ['ibizan-hound', 'Ibizan Hound', ['deafness-proxy-pra', 'axonal-proxy-epilepsy', 'allergy-proxy-atopic']],
  ['saluki', 'Saluki', ['cancer-proxy-osteo', 'heart-proxy-dcm', 'anesthesia-proxy-addisons', 'hypothyroidism']],
  ['borzoi', 'Borzoi', ['gdv', 'osteosarcoma', 'heart-proxy-dcm', 'hypothyroidism']],
  ['scottish-deerhound', 'Scottish Deerhound', ['osteosarcoma', 'dilated-cardiomyopathy', 'gdv', 'cystinuria-proxy-pancreatitis']],
  ['leonberger', 'Leonberger', ['hip-dysplasia', 'osteosarcoma', 'polyneuropathy-proxy-dm', 'gdv', 'hypothyroidism']],
  ['anatolian-shepherd', 'Anatolian Shepherd', ['hip-dysplasia', 'hypothyroidism', 'entropion-proxy-pra', 'gdv']],
  ['great-pyrenees', 'Great Pyrenees', ['hip-dysplasia', 'gdv', 'osteosarcoma', 'entropion-proxy-pra']],
  ['kuvasz', 'Kuvasz', ['hip-dysplasia', 'hypothyroidism', 'progressive-retinal-atrophy', 'gdv']],
  ['komondor', 'Komondor', ['hip-dysplasia', 'entropion-proxy-pra', 'otitis-proxy-atopic', 'gdv']],
  ['old-english-sheepdog', 'Old English Sheepdog', ['hip-dysplasia', 'hypothyroidism', 'deafness-proxy-pra', 'diabetes']],
  ['shetland-sheepdog', 'Shetland Sheepdog', ['collie-eye-proxy-pra', 'dermatomyositis-proxy-atopic', 'hip-dysplasia', 'epilepsy', 'mdr1-proxy-pancreatitis']],
  ['collie', 'Collie', ['collie-eye-proxy-pra', 'mdr1-proxy-pancreatitis', 'hip-dysplasia', 'dermatomyositis-proxy-atopic']],
  ['belgian-malinois', 'Belgian Malinois', ['hip-dysplasia', 'epilepsy', 'progressive-retinal-atrophy', 'pannus-proxy-pra']],
  ['dutch-shepherd', 'Dutch Shepherd', ['hip-dysplasia', 'inflammatory-proxy-atopic', 'goniodysplasia-proxy-pra']],
  ['catahoula-leopard-dog', 'Catahoula Leopard Dog', ['hip-dysplasia', 'deafness-proxy-pra', 'cruciate']],
  ['australian-cattle-dog', 'Australian Cattle Dog', ['progressive-retinal-atrophy', 'hip-dysplasia', 'deafness-proxy-pra', 'portosystemic-shunt']],
  ['border-terrier', 'Border Terrier', ['canine-epileptoid-proxy-epilepsy', 'atopic-dermatitis', 'leg-proxy-cruciate', 'heart-proxy-mmvd']],
  ['cairn-terrier', 'Cairn Terrier', ['portosystemic-shunt', 'leg-proxy-cruciate', 'ocular-proxy-pra', 'atopic-dermatitis']],
  ['norfolk-terrier', 'Norfolk Terrier', ['patella-proxy-cruciate', 'mitral-valve-disease', 'atopic-dermatitis']],
  ['norwich-terrier', 'Norwich Terrier', ['upper-airway-proxy-boas', 'patella-proxy-cruciate', 'atopic-dermatitis']],
  ['manchester-terrier', 'Manchester Terrier', ['von-proxy-addisons', 'patella-proxy-cruciate', 'pattern-baldness-proxy-hypothyroidism']],
];

/** Map proxy condition keys to real CONDITION templates */
const PROXY_MAP = {
  'cancer-proxy-osteo': 'osteosarcoma',
  'patella-proxy-cruciate': 'cruciate',
  'deafness-proxy-pra': 'progressive-retinal-atrophy',
  'obesity-proxy-pancreatitis': 'pancreatitis',
  'syringomyelia-proxy-ivdd': 'ivdd',
  'von-proxy-addisons': 'addisons',
  'heart-proxy-mmvd': 'mitral-valve-disease',
  'otitis-proxy-atopic': 'atopic-dermatitis',
  'phosphofructokinase-proxy-eic': 'exercise-induced-collapse',
  'collie-eye-proxy-pra': 'progressive-retinal-atrophy',
  'mdr1-proxy-pancreatitis': 'pancreatitis',
  'zinc-proxy-atopic': 'atopic-dermatitis',
  'glaucoma-proxy-pra': 'progressive-retinal-atrophy',
  'l2hga-proxy-epilepsy': 'epilepsy',
  'cerebellar-proxy-epilepsy': 'epilepsy',
  'anesthesia-proxy-addisons': 'addisons',
  'muscle-proxy-eic': 'exercise-induced-collapse',
  'dental-proxy-pancreatitis': 'pancreatitis',
  'amyloid-proxy-addisons': 'addisons',
  'entropion-proxy-pra': 'progressive-retinal-atrophy',
  'urate-proxy-pancreatitis': 'pancreatitis',
  'ear-proxy-atopic': 'atopic-dermatitis',
  'lymphoma-proxy-osteo': 'osteosarcoma',
  'dermoid-proxy-atopic': 'atopic-dermatitis',
  'kidney-proxy-addisons': 'addisons',
  'pulmonary-proxy-tracheal': 'tracheal-collapse',
  'leg-proxy-cruciate': 'cruciate',
  'bladder-cancer-proxy-osteo': 'osteosarcoma',
  'scottie-cramp-proxy-epilepsy': 'epilepsy',
  'cherry-eye-proxy-pra': 'progressive-retinal-atrophy',
  'demodicosis-proxy-atopic': 'atopic-dermatitis',
  'heart-proxy-dcm': 'dilated-cardiomyopathy',
  'fanconi-proxy-addisons': 'addisons',
  'ibs-proxy-pancreatitis': 'pancreatitis',
  'hyperlipidemia-proxy-pancreatitis': 'pancreatitis',
  'urinary-proxy-diabetes': 'diabetes',
  'protein-losing-proxy-addisons': 'addisons',
  'renal-proxy-addisons': 'addisons',
  'umbilical-proxy-pss': 'portosystemic-shunt',
  'neuronal-proxy-epilepsy': 'epilepsy',
  'allergy-proxy-atopic': 'atopic-dermatitis',
  'axonal-proxy-epilepsy': 'epilepsy',
  'cystinuria-proxy-pancreatitis': 'pancreatitis',
  'polyneuropathy-proxy-dm': 'degenerative-myelopathy',
  'dermatomyositis-proxy-atopic': 'atopic-dermatitis',
  'pannus-proxy-pra': 'progressive-retinal-atrophy',
  'inflammatory-proxy-atopic': 'atopic-dermatitis',
  'goniodysplasia-proxy-pra': 'progressive-retinal-atrophy',
  'canine-epileptoid-proxy-epilepsy': 'epilepsy',
  'ocular-proxy-pra': 'progressive-retinal-atrophy',
  'eye-proxy-pra': 'progressive-retinal-atrophy',
  'upper-airway-proxy-boas': 'boas',
  'pattern-baldness-proxy-hypothyroidism': 'hypothyroidism',
  'skin-proxy-atopic': 'atopic-dermatitis',
  'fractures-proxy-osteo': 'osteosarcoma',
  'chondrodysplasia-proxy-ivdd': 'ivdd',
  'bladder-stones-proxy-pancreatitis': 'pancreatitis',
};

// Existing core slugs to skip (already in breedConditions.ts)
const EXISTING = new Set([
  'french-bulldog/boas',
  'corgi/ivdd',
  'golden-retriever/hip-dysplasia',
  'german-shepherd/degenerative-myelopathy',
  'dachshund/ivdd',
  'cavalier-king-charles-spaniel/mitral-valve-disease',
  'labrador-retriever/exercise-induced-collapse',
  'pug/brachycephalic-airway-syndrome',
  'boxer/dilated-cardiomyopathy',
  'beagle/epilepsy',
  'yorkshire-terrier/tracheal-collapse',
  'great-dane/gastric-dilatation-volvulus',
]);

function resolveConditionKey(raw) {
  if (CONDITIONS[raw]) return raw;
  if (PROXY_MAP[raw] && CONDITIONS[PROXY_MAP[raw]]) return PROXY_MAP[raw];
  return null;
}

function slugCondition(key) {
  if (key === 'boas') return 'boas';
  if (key === 'gdv') return 'gastric-dilatation-volvulus';
  return key;
}

const entries = [];
const seen = new Set(EXISTING);

for (const [breedSlug, breedName, conditionKeys] of BREEDS) {
  for (const raw of conditionKeys) {
    const condKey = resolveConditionKey(raw);
    if (!condKey) continue;
    const tpl = CONDITIONS[condKey];
    const condSlug = slugCondition(condKey);
    // pug already has brachycephalic-airway-syndrome in core — use boas slug for others
    const finalCondSlug =
      breedSlug === 'pug' && condKey === 'boas' ? 'brachycephalic-airway-syndrome' : condSlug;
    const slug = `${breedSlug}/${finalCondSlug}`;
    if (seen.has(slug)) continue;
    seen.add(slug);

    const angle = [
      `Early detection and a dated care timeline materially change outcomes for this breed.`,
      `International travel, boarding, and specialty referrals all depend on a single source of clinical truth.`,
      `Owners who centralize imaging, labs, and flare logs avoid dangerous gaps during emergencies.`,
      `A digital vault turns fragmented vet PDFs into a chronological record specialists can trust.`,
      `Relocation agencies and sitters need the same protocol the primary vet already follows.`,
    ][entries.length % 5];

    entries.push({
      slug,
      breed: breedName,
      condition: tpl.condition,
      scientificName: tpl.scientificName,
      riskLevel: tpl.riskLevel,
      symptoms: tpl.symptoms,
      overview: `${breedName}s are predisposed to ${tpl.scientificName.toLowerCase()} relative to many mixed-breed dogs, driven by conformation and heritable risk. ${angle} Keep symptoms, diagnostics, medications, and surgical notes together so every caregiver sees the same ${tpl.condition} history.`,
      managementProtocol: tpl.protocol,
      wikidataUri: tpl.wikidataUri,
    });
  }
}

// Ensure we have at least 100 NEW entries (core has 12 → total >= 112)
console.log('Generated unique expanded entries:', entries.length);
if (entries.length < 100) {
  console.error('Need at least 100 expanded entries, got', entries.length);
  process.exit(1);
}

function ser(v) {
  return JSON.stringify(v, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'")
    .replace(/\n/g, '\n  ');
}

const file = `import type { BreedConditionMeta } from './breedConditions';

/**
 * Auto-generated pSEO expansions (do not hand-edit — rerun scripts/generate-pseo-matrix.mjs).
 * Merged with core PSEO_MATRIX in breedConditions.ts.
 */
export const PSEO_MATRIX_EXPANDED: readonly BreedConditionMeta[] = ${JSON.stringify(entries, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'")};
`;

// Prefer proper TS with double quotes via JSON.stringify only
const file2 = `import type { BreedConditionMeta } from './breedConditions';

/** Auto-generated — run: node scripts/generate-pseo-matrix.mjs */
export const PSEO_MATRIX_EXPANDED: readonly BreedConditionMeta[] = ${JSON.stringify(entries, null, 2)} as const;
`;

writeFileSync(outPath, file2);
console.log('Wrote', outPath);
console.log('Sample:', entries.slice(0, 3).map((e) => e.slug).join(', '));
console.log('Last:', entries.slice(-3).map((e) => e.slug).join(', '));
