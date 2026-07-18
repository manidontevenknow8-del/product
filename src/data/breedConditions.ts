import { PSEO_MATRIX_EXPANDED } from './breedConditionsExpanded';

export type BreedConditionRiskLevel = 'High' | 'Moderate' | 'Severe';

export type BreedConditionMeta = {
  /** Path segment pair, e.g. `french-bulldog/boas` → `/guides/french-bulldog/boas` */
  slug: string;
  breed: string;
  condition: string;
  scientificName: string;
  riskLevel: BreedConditionRiskLevel;
  symptoms: string[];
  overview: string;
  managementProtocol: string[];
  /** Canonical Wikidata entity URI for the disease / syndrome */
  wikidataUri: string;
};

/**
 * Programmatic SEO matrix: breed × high-risk clinical condition.
 * Keep `wikidataUri` pointed at the disease entity (not the breed).
 * Core hand-authored entries + generated expansions (scripts/generate-pseo-matrix.mjs).
 */
const PSEO_MATRIX_CORE: readonly BreedConditionMeta[] = [
  {
    slug: 'french-bulldog/boas',
    breed: 'French Bulldog',
    condition: 'BOAS',
    scientificName: 'Brachycephalic obstructive airway syndrome',
    riskLevel: 'Severe',
    symptoms: [
      'Noisy breathing, snoring, or stertor at rest',
      'Exercise intolerance and heat collapse risk',
      'Cyanosis or pale gums during excitement',
      'Sleep apnea / restless sleep with open-mouth breathing',
      'Frequent gagging, regurgitation, or reverse sneezing',
    ],
    overview:
      'French Bulldogs are a brachycephalic breed with shortened skulls that compress the upper airway. BOAS is a progressive, multi-level airway obstruction (stenotic nares, elongated soft palate, everted laryngeal saccules, and often hypoplastic trachea). Untreated, it elevates lifetime risk of heat stroke, aspiration, and perioperative anesthetic crises—making structured airway timelines and surgery records essential for relocation and specialty care.',
    managementProtocol: [
      'Keep a dated photo log of nares and respiratory effort at rest vs. after short walks',
      'Record every anesthetic event, BOAS grading, and soft-palate / nares surgery report',
      'Avoid heat, neck pressure, and high-intensity exercise; use a harness only',
      'Pre-board and pre-flight airway clearance notes from a veterinarian familiar with brachycephalics',
      'Store spit-up / regurgitation episodes alongside weight and ambient temperature',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q16985780',
  },
  {
    slug: 'corgi/ivdd',
    breed: 'Corgi',
    condition: 'IVDD',
    scientificName: 'Intervertebral disc disease',
    riskLevel: 'High',
    symptoms: [
      'Reluctance to jump onto furniture or climb stairs',
      'Kyphosis (hunched back) or yelping when picked up',
      'Ataxia, knuckling, or dragging of the pelvic limbs',
      'Loss of bladder / bowel control in advanced grades',
      'Acute paralysis after a jump or rough play',
    ],
    overview:
      'Pembroke and Cardigan Welsh Corgis are chondrodystrophic breeds with early disc degeneration. Hansen Type I disc extrusion can convert a “sore back” into a surgical emergency within hours. A chronological symptom and mobility timeline—paired with MRI dates, crate-rest protocols, and neurology reports—is the difference between recoverable paresis and permanent deficit.',
    managementProtocol: [
      'Log daily mobility grade (pain → ataxia → paresis → plegia) with timestamps',
      'Enforce crate rest windows exactly as prescribed; document exceptions',
      'Archive neurology consults, MRI summaries, and surgical decompression reports',
      'Track bladder expression schedules and urinary tract infection treatment',
      'Use ramps and ban jumping; photograph home setup for sitters and rehab teams',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q1341142',
  },
  {
    slug: 'golden-retriever/hip-dysplasia',
    breed: 'Golden Retriever',
    condition: 'Hip Dysplasia',
    scientificName: 'Canine hip dysplasia',
    riskLevel: 'High',
    symptoms: [
      'Bunny-hopping gait or swaying hips when running',
      'Difficulty rising after rest; reluctance to climb stairs',
      'Reduced thigh muscle mass over time',
      'Clicking hips or pain on hip extension',
      'Exercise intolerance that worsens with age or weight gain',
    ],
    overview:
      'Golden Retrievers carry elevated genetic risk for hip dysplasia—a developmental incongruity of the coxofemoral joint that progresses to osteoarthritis. Early PennHIP / OFA imaging, weight curves, and NSAID response logs create a defensible orthopedic dossier for breeding decisions, insurance claims, and surgical planning (FHO, TPS, or total hip replacement).',
    managementProtocol: [
      'Store OFA/PennHIP reports and radiographic dates in one vault folder',
      'Track body-condition score and weight monthly; correlate with lameness flares',
      'Log joint supplements, NSAID courses, and physical-therapy sessions',
      'Document pre- and post-operative outcomes if corrective surgery is pursued',
      'Share a mobility timeline with rehab and boarding partners before travel',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q1139785',
  },
  {
    slug: 'german-shepherd/degenerative-myelopathy',
    breed: 'German Shepherd',
    condition: 'Degenerative Myelopathy',
    scientificName: 'Canine degenerative myelopathy',
    riskLevel: 'Severe',
    symptoms: [
      'Slowly progressive rear-limb ataxia without obvious pain',
      'Knuckling or scuffing of toenails on the hind feet',
      'Crossing over of pelvic limbs when walking',
      'Eventual paraparesis progressing toward thoracic limbs',
      'SOD1 mutation carrier / at-risk genetic status on record',
    ],
    overview:
      'Degenerative myelopathy (DM) is an SOD1-associated neurodegenerative disease disproportionately seen in German Shepherds. It mimics chronic disc disease but is typically non-painful and relentlessly progressive. Genetic test results, serial neurologic exams, and assistive-device timelines help families plan quality-of-life decisions and distinguish DM from compressive myelopathy.',
    managementProtocol: [
      'Archive SOD1 genotype reports and counseling notes',
      'Perform and date serial neurologic exams (proprioception, withdrawal, urinary status)',
      'Log physiotherapy, hydrotherapy, and harness / cart introduction dates',
      'Rule-out imaging (MRI) summaries should live beside the DM working diagnosis',
      'Maintain a quality-of-life scorecard shared with all caregivers',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q5251774',
  },
  {
    slug: 'dachshund/ivdd',
    breed: 'Dachshund',
    condition: 'IVDD',
    scientificName: 'Intervertebral disc disease',
    riskLevel: 'Severe',
    symptoms: [
      'Sudden cry-out pain with a hunched posture',
      'Refusal to move the neck or back',
      'Wobbly gait progressing to inability to walk',
      'Loss of deep pain sensation (surgical emergency marker)',
      'Recurrent episodes after prior conservative management',
    ],
    overview:
      'Dachshunds are the archetype for chondrodystrophic IVDD risk. Disc calcification can begin young; a single jump off a sofa may trigger extrusion. Because recurrence risk remains high after an episode, a lifetime vault of flare dates, crate-rest compliance, and surgical levels (e.g., T12–T13) is critical for every subsequent neurology consult.',
    managementProtocol: [
      'Never delay ER evaluation when pelvic limbs weaken—log onset to the minute',
      'Preserve MRI level(s), surgeon name, and hemilaminectomy operative notes',
      'Document post-op rehab milestones and deep-pain return',
      'Prevent recurrence: ramps, weight control, no stair freedom unsupervised',
      'Keep emergency passport contacts + preferred neurology hospital on file',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q1341142',
  },
  {
    slug: 'cavalier-king-charles-spaniel/mitral-valve-disease',
    breed: 'Cavalier King Charles Spaniel',
    condition: 'Mitral Valve Disease',
    scientificName: 'Myxomatous mitral valve disease',
    riskLevel: 'High',
    symptoms: [
      'Soft left-apical systolic murmur first noted on wellness exam',
      'Coughing, especially at night or after excitement',
      'Reduced stamina / reluctance to walk usual distances',
      'Elevated resting respiratory rate at home',
      'Syncope or collapse in advanced congestive stages',
    ],
    overview:
      'Cavaliers have extraordinary predisposition to myxomatous mitral valve disease (MMVD). A murmur in early adulthood can progress over years to congestive heart failure. Serial echo reports (ACVIM stage B1→B2→C), resting respiratory rate logs, and diuretic response curves form the clinical spine of long-term cardiology care—and of international travel clearance.',
    managementProtocol: [
      'Archive every echocardiogram with ACVIM stage and vertebral heart score',
      'Train owners to log sleeping respiratory rate; store weekly averages',
      'Track pimobendan / ACE-inhibitor / diuretic start dates and dose changes',
      'Keep thoracic radiograph reports with heart-failure episode timestamps',
      'Pre-flight cardiology letters should reference the latest staged echo',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q18557121',
  },
  {
    slug: 'labrador-retriever/exercise-induced-collapse',
    breed: 'Labrador Retriever',
    condition: 'Exercise-Induced Collapse',
    scientificName: 'Exercise-induced collapse',
    riskLevel: 'High',
    symptoms: [
      'Weakness or wobbly rear limbs after 5–15 minutes of intense excitement',
      'Collapse with a clear mind (usually non-epileptic)',
      'Rapid recovery over 5–25 minutes with rest',
      'Triggers: retrieve drills, hot weather, high drive play',
      'DNM1 mutation positive or carrier status on genetic panel',
    ],
    overview:
      'Exercise-induced collapse (EIC) is a DNM1-related syndrome common in Labrador Retrievers. Episodes look dramatic but are often recoverable—yet they are easily confused with cardiac syncope or heat stroke. Genetic proof plus an episode diary (temperature, duration, recovery) protects dogs from misdiagnosis and unsafe training regimens.',
    managementProtocol: [
      'Store DNM1 genotype and counseling documentation',
      'Build an episode log: ambient temp, activity type, duration, recovery time',
      'Rule out cardiac and neurologic differentials; keep those workups adjacent',
      'Modify training intensity; document what activity thresholds are safe',
      'Share the EIC protocol with trainers, daycare, and competition organizers',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q16991525',
  },
  {
    slug: 'pug/brachycephalic-airway-syndrome',
    breed: 'Pug',
    condition: 'Brachycephalic Airway Syndrome',
    scientificName: 'Brachycephalic obstructive airway syndrome',
    riskLevel: 'Severe',
    symptoms: [
      'Chronic stertor and open-mouth breathing at mild exertion',
      'Overheating quickly on short walks',
      'Sleep-disordered breathing and daytime fatigue',
      'Gagging when swallowing or pulling on a collar',
      'Post-anesthetic airway obstruction risk history',
    ],
    overview:
      'Pugs share the brachycephalic airway complex with other flat-faced breeds, often compounded by obesity and concurrent ocular or spinal disease. Surgical airway correction can be transformative—but only when preoperative grading, recovery notes, and heat-risk protocols are preserved for every future anesthetic and airline journey.',
    managementProtocol: [
      'Photograph stenotic nares and document BOAS clinical grade over time',
      'Maintain strict weight curves; obesity multiplies airway work of breathing',
      'Centralize soft-palate resection and naresplasty operative reports',
      'Ban collars; harness-only walking with heat-index limits written down',
      'Require airway-aware anesthetic consent forms before elective procedures',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q16985780',
  },
  {
    slug: 'boxer/dilated-cardiomyopathy',
    breed: 'Boxer',
    condition: 'Dilated Cardiomyopathy',
    scientificName: 'Dilated cardiomyopathy',
    riskLevel: 'Severe',
    symptoms: [
      'Arrhythmias (especially ventricular ectopy) on screening Holter',
      'Syncope or sudden weakness during exercise',
      'Cough, tachypnea, or abdominal distension from heart failure',
      'Family history of sudden cardiac death in related Boxers',
      'Reduced fractional shortening on echocardiography',
    ],
    overview:
      'Boxer cardiomyopathy sits at the intersection of arrhythmogenic and dilated phenotypes. Occult disease can precede overt failure by years—making Holter monitors, echo serials, and anti-arrhythmic medication logs non-negotiable for breeding and high-stakes travel clearance.',
    managementProtocol: [
      'Schedule and archive Holter monitors at breed-recommended intervals',
      'Keep every echocardiogram with chamber dimensions and rhythm notes',
      'Track anti-arrhythmic and heart-failure drug changes with exact dates',
      'Document syncopal events with activity context and ECG strips if available',
      'Coordinate emergency plans with a boarded cardiologist before long flights',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q2838005',
  },
  {
    slug: 'beagle/epilepsy',
    breed: 'Beagle',
    condition: 'Epilepsy',
    scientificName: 'Idiopathic epilepsy',
    riskLevel: 'Moderate',
    symptoms: [
      'Generalized tonic-clonic seizures with loss of consciousness',
      'Cluster seizures within 24 hours',
      'Post-ictal disorientation, blindness, or hunger',
      'Normal interictal neurologic exam between events',
      'Onset typically between 6 months and 6 years of age',
    ],
    overview:
      'Beagles are overrepresented in idiopathic epilepsy caseloads. Diagnosis is one of exclusion after metabolic and structural workups. A meticulous seizure diary—duration, triggers, meds, and cluster patterns—drives phenobarbital / levetiracetam titration and is invaluable for ER handoffs and boarding facilities.',
    managementProtocol: [
      'Log every seizure: start time, length, cluster count, and recovery quality',
      'Store MRI / CSF results that ruled out structural disease',
      'Track anticonvulsant levels, dose changes, and side-effect notes',
      'Define a written cluster / status epilepticus emergency protocol',
      'Provide sitters with a one-page seizure action card from the vault',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q41571',
  },
  {
    slug: 'yorkshire-terrier/tracheal-collapse',
    breed: 'Yorkshire Terrier',
    condition: 'Tracheal Collapse',
    scientificName: 'Tracheal collapse',
    riskLevel: 'High',
    symptoms: [
      'Goose-honk cough triggered by excitement or collar pressure',
      'Worsening cough with heat, humidity, or obesity',
      'Exercise intolerance and cyanosis in advanced grades',
      'Relief when calm; flares with pulling on leash',
      'Fluoroscopy or endoscopy grade documented by a specialist',
    ],
    overview:
      'Tracheal collapse is classic in Yorkshire Terriers and other toy breeds. Softening of tracheal cartilage creates dynamic airway obstruction that is managed medically for years—or stented surgically in select cases. Cough diaries, grading studies, and medication response logs keep pulmonology and anesthesia teams aligned.',
    managementProtocol: [
      'Use harnesses only; document collar-related exacerbation history',
      'Archive fluoroscopy / tracheoscopy grading reports',
      'Log antitussives, corticosteroids, and bronchodilator trials',
      'Control weight and environmental triggers; note flare correlations',
      'If a stent is placed, preserve implant details and follow-up scopes',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q7831629',
  },
  {
    slug: 'great-dane/gastric-dilatation-volvulus',
    breed: 'Great Dane',
    condition: 'GDV (Bloat)',
    scientificName: 'Gastric dilatation-volvulus',
    riskLevel: 'Severe',
    symptoms: [
      'Non-productive retching with a rapidly distending abdomen',
      'Restlessness, hypersalivation, and pale gums',
      'Collapse or weakness with elevated heart rate',
      'History of deep-chested conformation and large single meals',
      'Prior prophylactic gastropexy status (done / not done)',
    ],
    overview:
      'Gastric dilatation-volvulus (GDV) is a true surgical emergency overrepresented in Great Danes. Minutes matter: stomach torsion cuts off blood flow and precipitates shock. Prophylactic gastropexy status, feeding protocols, and a rehearsed ER pathway should live in a digital vault long before the first crisis.',
    managementProtocol: [
      'Record prophylactic gastropexy date, surgeon, and technique',
      'Define a written GDV emergency script with nearest 24/7 surgical hospital',
      'Log feeding schedule (small meals), elevated bowl policy, and exercise rules',
      'If GDV occurs, archive operative reports, splenectomy notes, and ICU course',
      'Update the emergency passport with bloat risk and gastropexy confirmation',
    ],
    wikidataUri: 'https://www.wikidata.org/wiki/Q1495675',
  },
] as const;

export const PSEO_MATRIX: readonly BreedConditionMeta[] = [
  ...PSEO_MATRIX_CORE,
  ...PSEO_MATRIX_EXPANDED,
];

export function getBreedConditionPath(meta: BreedConditionMeta): string {
  return `/guides/${meta.slug}`;
}

export function getBreedConditionBySegments(
  breedSegment: string | undefined,
  conditionSegment: string | undefined,
): BreedConditionMeta | null {
  if (!breedSegment || !conditionSegment) return null;
  const slug = `${breedSegment}/${conditionSegment}`.toLowerCase();
  return PSEO_MATRIX.find((entry) => entry.slug === slug) ?? null;
}

export function getBreedConditionBySlug(slug: string): BreedConditionMeta | null {
  const normalized = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
  return PSEO_MATRIX.find((entry) => entry.slug === normalized) ?? null;
}

export function listBreedConditions(): readonly BreedConditionMeta[] {
  return PSEO_MATRIX;
}

export function isBreedConditionPath(pathname: string): boolean {
  if (!pathname.startsWith('/guides/')) return false;
  const rest = pathname.slice('/guides/'.length);
  const parts = rest.split('/').filter(Boolean);
  if (parts.length !== 2) return false;
  return getBreedConditionBySegments(parts[0], parts[1]) != null;
}
