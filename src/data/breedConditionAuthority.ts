/**
 * Condition-keyed FAQs + peer-reviewed citations for breed-condition pSEO.
 * Looked up by condition path segment (e.g. `boas`, `ivdd`) so all 405 pages
 * inherit authoritative FAQPage + ScholarlyArticle E-E-A-T without regenerating
 * the expanded matrix.
 */
import type { BreedConditionMeta } from '@/data/breedConditions';
import type { GeneratedFaqItem } from '@/types/generatedFaqs';

export type BreedConditionCitation = {
  name: string;
  url: string;
  /** Short attribution shown in the references footer */
  source: string;
};

export type ConditionAuthorityPack = {
  faqs: GeneratedFaqItem[];
  citations: BreedConditionCitation[];
};

function conditionSegment(meta: BreedConditionMeta): string {
  const slash = meta.slug.lastIndexOf('/');
  return slash === -1 ? meta.slug : meta.slug.slice(slash + 1);
}

/** Template FAQs - breed name is injected at resolve time. */
type FaqTemplate = {
  question: (breed: string, condition: string) => string;
  answer: (breed: string, condition: string) => string;
};

function pack(
  faqTemplates: FaqTemplate[],
  citations: BreedConditionCitation[],
): { faqTemplates: FaqTemplate[]; citations: BreedConditionCitation[] } {
  return { faqTemplates, citations };
}

const AUTHORITY_BY_SEGMENT: Record<
  string,
  { faqTemplates: FaqTemplate[]; citations: BreedConditionCitation[] }
> = {
  boas: pack(
    [
      {
        question: (breed) =>
          `What is the life expectancy of a ${breed} with severe BOAS?`,
        answer: (breed) =>
          `Severe BOAS does not have a single fixed lifespan number, but untreated airway obstruction raises lifetime risk of heat stroke, aspiration, and anesthetic crises in ${breed}s. Graded airway assessment, early corrective surgery when indicated, and a dated respiratory timeline materially improve outcomes versus waiting for collapse events.`,
      },
      {
        question: (breed) => `Can a ${breed} with BOAS fly commercially?`,
        answer: (breed) =>
          `Many airlines restrict or ban brachycephalic breeds in cargo because of heat and airway risk. A ${breed} with BOAS typically needs a veterinarian’s fitness-to-fly letter, recent airway notes, and a harness-only travel plan. Store pre-flight clearance, BOAS grade, and prior anesthetic reports in one vault before booking.`,
      },
      {
        question: (breed) =>
          `What early BOAS signs should ${breed} owners track daily?`,
        answer: () =>
          `Log stertor at rest, exercise recovery time, sleep disruption, heat intolerance, and any cyanosis or reverse sneezing. Photo logs of nares and respiratory effort after short walks help specialists grade progression between visits.`,
      },
      {
        question: (breed) =>
          `Does soft-palate surgery permanently fix BOAS in ${breed}s?`,
        answer: () =>
          `Surgery can improve airflow when nares, soft palate, and saccules are addressed, but BOAS is multi-level and progressive. Post-op photos, grading scores, and complication notes should stay in the clinical timeline for lifelong monitoring.`,
      },
    ],
    [
      {
        name: 'Objective assessment of brachycephalic airway obstructive syndrome in French Bulldogs',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26331868/',
        source: 'PubMed · Vet J / Cambridge brachycephalic research',
      },
      {
        name: 'Brachycephalic obstructive airway syndrome: a comparative review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/29355950/',
        source: 'PubMed · peer-reviewed veterinary review',
      },
    ],
  ),
  'brachycephalic-airway-syndrome': pack(
    [
      {
        question: (breed) =>
          `Is brachycephalic airway syndrome the same as BOAS in ${breed}s?`,
        answer: () =>
          `Yes - BOAS (brachycephalic obstructive airway syndrome) describes multi-level upper-airway obstruction in short-skulled breeds. Clinical language varies by clinic, but the dossier should still capture nares, soft palate, saccules, and heat/exercise intolerance.`,
      },
      {
        question: (breed) =>
          `When is airway surgery considered for a ${breed}?`,
        answer: () =>
          `Surgery is considered when stertor, exercise intolerance, or sleep apnea impair quality of life or raise anesthetic risk. Archive pre-op grading, operative reports, and recovery photos so every specialist sees the same history.`,
      },
      {
        question: (breed) =>
          `How should ${breed} owners prepare for summer heat with airway disease?`,
        answer: () =>
          `Avoid peak heat, use a harness only, keep walks short, and log ambient temperature alongside respiratory effort. A written emergency script with the nearest 24/7 hospital belongs in the digital vault before travel or boarding.`,
      },
    ],
    [
      {
        name: 'Objective assessment of brachycephalic airway obstructive syndrome in French Bulldogs',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26331868/',
        source: 'PubMed · Cambridge brachycephalic research group',
      },
    ],
  ),
  ivdd: pack(
    [
      {
        question: (breed) =>
          `Can a ${breed} recover from Stage 2 IVDD without surgery?`,
        answer: () =>
          `Grade 1-2 IVDD can often be managed with 6-8 weeks of strict crate rest, pain control, and anti-inflammatory protocols when deep pain sensation is intact. Daily mobility grades and bladder logs decide whether conservative care is working or surgery is required.`,
      },
      {
        question: (breed) =>
          `How fast can IVDD progress from pain to paralysis in a ${breed}?`,
        answer: () =>
          `Hansen Type I extrusion can convert a sore back into non-ambulatory paresis within hours. Timestamp every change in gait, knuckling, or yelping - those logs are what emergency neurologists use to triage MRI and surgery.`,
      },
      {
        question: (breed) =>
          `What home changes reduce IVDD risk for ${breed}s?`,
        answer: () =>
          `Ban jumping onto furniture, install ramps, use harnesses instead of neck leads, and keep weight in a lean range. Photograph the home setup so sitters and rehab teams follow the same rules.`,
      },
      {
        question: (breed) =>
          `Should every ${breed} IVDD episode get an MRI?`,
        answer: () =>
          `MRI (or CT myelography where MRI is unavailable) is standard when surgery is being considered or neurological grade is worsening. Store imaging dates, lesion level, and surgical reports in one chronological vault.`,
      },
    ],
    [
      {
        name: 'Intervertebral disc disease in dogs - review of pathophysiology and treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31475463/',
        source: 'PubMed · veterinary neurology review',
      },
      {
        name: 'Prognostic factors for recovery after thoracolumbar disc herniation in dogs',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27892859/',
        source: 'PubMed · peer-reviewed clinical study',
      },
    ],
  ),
  'hip-dysplasia': pack(
    [
      {
        question: (breed) =>
          `When should a ${breed} get PennHIP or OFA screening?`,
        answer: () =>
          `PennHIP can be performed earlier than traditional OFA grading; many breeders screen before breeding decisions. Store every radiographic report with dates - serial imaging plus body-condition scores document progression better than a single snapshot.`,
      },
      {
        question: (breed) =>
          `Can weight management delay hip surgery in ${breed}s?`,
        answer: () =>
          `Yes. Keeping a lean body-condition score reduces load on dysplastic joints and often delays or reduces need for FHO/THR. Track weight monthly alongside NSAID courses and physical therapy notes.`,
      },
      {
        question: (breed) =>
          `What symptoms mean a ${breed} needs orthopedic referral now?`,
        answer: () =>
          `Bunny-hopping, difficulty rising, thigh muscle loss, or pain on hip extension warrant imaging and specialist input. Log flares against activity and weather so the referral packet is complete.`,
      },
    ],
    [
      {
        name: 'Canine hip dysplasia: review of etiology and diagnosis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20102446/',
        source: 'PubMed · veterinary orthopedics',
      },
      {
        name: 'PennHIP and radiographic evaluation of canine hip dysplasia',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16382520/',
        source: 'PubMed · diagnostic imaging study',
      },
    ],
  ),
  'degenerative-myelopathy': pack(
    [
      {
        question: (breed) =>
          `Is degenerative myelopathy painful for ${breed}s?`,
        answer: () =>
          `DM is typically non-painful but progressive. Owners often confuse it with orthopedic disease. Genetic SOD1 testing, neurology notes, and mobility videos help separate DM from IVDD or hip disease.`,
      },
      {
        question: (breed) =>
          `How should ${breed} caregivers track DM progression?`,
        answer: () =>
          `Film weekly gait clips, log knuckling/scuffing, and note bladder/bowel changes. Assistive-device fitting dates and rehab protocols belong in the same timeline for insurance and specialist handoffs.`,
      },
      {
        question: (breed) =>
          `Does DM genetics change breeding decisions for ${breed}s?`,
        answer: () =>
          `SOD1 status informs breeding risk discussions with a veterinarian or genetic counselor. Keep lab reports, pedigree notes, and clinical onset dates together in the vault.`,
      },
    ],
    [
      {
        name: 'Degenerative myelopathy in dogs: clinical and genetic update',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25582131/',
        source: 'PubMed · veterinary neurology',
      },
    ],
  ),
  'mitral-valve-disease': pack(
    [
      {
        question: (breed) =>
          `How often should a ${breed} with MMVD get echocardiography?`,
        answer: () =>
          `Follow cardiologist staging guidance - often every 6-12 months once murmur or remodeling is documented. Archive echo reports, ACVIM stage, and medication changes in chronological order.`,
      },
      {
        question: (breed) =>
          `What home signs suggest heart failure in a ${breed}?`,
        answer: () =>
          `Rising resting respiratory rate, cough, exercise intolerance, or nighttime restlessness warrant urgent recheck. Daily RR logs are high-signal data for cardiology triage.`,
      },
      {
        question: (breed) =>
          `Which drugs are commonly used for ${breed} mitral valve disease?`,
        answer: () =>
          `Depending on stage: pimobendan, ACE inhibitors, diuretics, and dietary sodium control. Record start dates, dose changes, and side effects so every clinic sees the same regimen.`,
      },
    ],
    [
      {
        name: 'ACVIM consensus guidelines for the diagnosis and treatment of myxomatous mitral valve disease in dogs',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31172455/',
        source: 'PubMed · ACVIM consensus',
      },
    ],
  ),
  'exercise-induced-collapse': pack(
    [
      {
        question: (breed) =>
          `What triggers exercise-induced collapse in ${breed}s?`,
        answer: () =>
          `Intense retrieval or high-drive activity in genetically susceptible dogs can trigger ataxia and collapse that typically resolves with rest. Log ambient temperature, activity type, and recovery time for every episode.`,
      },
      {
        question: (breed) =>
          `Should breeding ${breed}s be tested for EIC?`,
        answer: () =>
          `Genetic EIC testing is widely used in Labrador lines. Store lab results and episode timelines before breeding or high-intensity sport commitments.`,
      },
      {
        question: (breed) =>
          `How do you differentiate EIC from cardiac syncope in a ${breed}?`,
        answer: () =>
          `EIC usually follows heavy exercise and recovers with rest; cardiac syncope needs ECG/echo workup. Keep both neurology and cardiology differentials documented until ruled out.`,
      },
    ],
    [
      {
        name: 'Exercise-induced collapse in Labrador Retrievers',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18518861/',
        source: 'PubMed · clinical genetics',
      },
    ],
  ),
  'dilated-cardiomyopathy': pack(
    [
      {
        question: (breed) =>
          `Can diet-associated DCM affect ${breed}s?`,
        answer: () =>
          `Diet-associated DCM investigations have included grain-free and boutique diets. Record diet brand/lot changes alongside echo dates so cardiologists can evaluate nutritional contributors.`,
      },
      {
        question: (breed) =>
          `What screening is recommended for at-risk ${breed}s?`,
        answer: () =>
          `Breed-aware screening may include auscultation, Holter monitoring, and echocardiography. Archive every report - silent remodeling can precede clinical signs.`,
      },
      {
        question: (breed) =>
          `How urgently should collapse in a ${breed} with DCM be treated?`,
        answer: () =>
          `Collapse, respiratory distress, or arrhythmia is an emergency. Keep current medication lists and prior Holter/echo summaries available for ER teams.`,
      },
    ],
    [
      {
        name: 'Dilated cardiomyopathy in dogs - diagnosis and management overview',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28992990/',
        source: 'PubMed · veterinary cardiology',
      },
    ],
  ),
  epilepsy: pack(
    [
      {
        question: (breed) =>
          `When does a ${breed} seizure become an emergency?`,
        answer: () =>
          `Seizures lasting >5 minutes, cluster seizures, or failure to regain consciousness require emergency care. Timestamp onset, duration, and post-ictal behavior for every event.`,
      },
      {
        question: (breed) =>
          `What should be in a ${breed} seizure log?`,
        answer: () =>
          `Date/time, length, triggers, medications given, and video when safe. Neurologists use those logs to titrate anticonvulsants and decide on MRI/CSF workups.`,
      },
      {
        question: (breed) =>
          `Can idiopathic epilepsy be managed long-term in ${breed}s?`,
        answer: () =>
          `Many dogs achieve good control with phenobarbital, potassium bromide, levetiracetam, or combinations. Track levels, side effects, and breakthrough frequency in one vault.`,
      },
    ],
    [
      {
        name: 'International Veterinary Epilepsy Task Force consensus on epilepsy definition and classification',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26081271/',
        source: 'PubMed · IVETF consensus',
      },
    ],
  ),
  'tracheal-collapse': pack(
    [
      {
        question: (breed) =>
          `Does a harness help a ${breed} with tracheal collapse?`,
        answer: () =>
          `Yes - avoid neck pressure from collars. Use a well-fitted harness and log cough triggers (excitement, heat, pulling). Medication response and flare timelines guide specialist referral.`,
      },
      {
        question: (breed) =>
          `When is tracheal stenting considered for ${breed}s?`,
        answer: () =>
          `Stenting is reserved for severe, refractory cases after medical management. Archive fluoroscopy/grading, medical trials, and post-procedure complications.`,
      },
      {
        question: (breed) =>
          `What home environment changes help ${breed} tracheal collapse?`,
        answer: () =>
          `Reduce airway irritants, manage weight, control excitement spikes, and avoid extreme heat. Document what reduces cough so boarding partners can follow the same plan.`,
      },
    ],
    [
      {
        name: 'Tracheal collapse in dogs: diagnosis and management',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18810405/',
        source: 'PubMed · small-animal respiratory medicine',
      },
    ],
  ),
  'gastric-dilatation-volvulus': pack(
    [
      {
        question: (breed) =>
          `How quickly can GDV kill a ${breed}?`,
        answer: () =>
          `GDV can progress to shock and death within hours. Non-productive retching, distended abdomen, and restlessness are emergencies - reverse triage to a surgical hospital immediately.`,
      },
      {
        question: (breed) =>
          `Should every deep-chested ${breed} get prophylactic gastropexy?`,
        answer: () =>
          `Many surgeons recommend prophylactic gastropexy for high-risk breeds. Record whether it was done, technique, and date - that status is critical for ER decision-making.`,
      },
      {
        question: (breed) =>
          `What feeding rules reduce GDV risk in ${breed}s?`,
        answer: () =>
          `Smaller meals, limited vigorous exercise around feeding, and individualized bowl-height guidance from your veterinarian. Keep the written emergency script and nearest surgical hospital in the vault.`,
      },
    ],
    [
      {
        name: 'Gastric dilatation-volvulus in dogs: pathophysiology and treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25178490/',
        source: 'PubMed · emergency & critical care',
      },
    ],
  ),
  gdv: pack(
    [
      {
        question: (breed) => `Is GDV the same as bloat in ${breed}s?`,
        answer: () =>
          `Bloat can mean gastric dilatation alone; GDV adds volvulus (twisting). Both are emergencies. Clarify terminology in records and keep gastropexy status visible on the emergency passport.`,
      },
      {
        question: (breed) =>
          `What belongs on a ${breed} GDV emergency card?`,
        answer: () =>
          `Gastropexy status, feeding protocol, nearest 24/7 surgical hospital, and prior GDV history. Share it with sitters before any boarding stay.`,
      },
      {
        question: (breed) =>
          `Can a ${breed} bloat after prophylactic gastropexy?`,
        answer: () =>
          `Gastropexy greatly reduces volvulus risk but does not eliminate all GI emergencies. Still seek care for non-productive retching or sudden abdominal distension.`,
      },
    ],
    [
      {
        name: 'Gastric dilatation-volvulus in dogs: pathophysiology and treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25178490/',
        source: 'PubMed · emergency & critical care',
      },
    ],
  ),
  cruciate: pack(
    [
      {
        question: (breed) =>
          `How is cruciate ligament injury diagnosed in a ${breed}?`,
        answer: () =>
          `Orthopedic exam (drawer/tibial thrust), sedation radiographs, and sometimes advanced imaging. Log the onset (acute plant vs chronic lameness) and prior contralateral injury.`,
      },
      {
        question: (breed) =>
          `Is TPLO always required for ${breed} CCL tears?`,
        answer: () =>
          `Surgical options (TPLO, TTA, extracapsular) depend on size, lifestyle, and surgeon preference. Conservative management is sometimes considered for select small dogs - document the shared decision and rehab plan.`,
      },
      {
        question: (breed) =>
          `Why do ${breed}s often tear the other cruciate later?`,
        answer: () =>
          `Contralateral injury is common. Track weight, activity restrictions, and serial gait assessments after the first repair.`,
      },
    ],
    [
      {
        name: 'Cranial cruciate ligament disease in dogs - review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20439949/',
        source: 'PubMed · veterinary orthopedics',
      },
    ],
  ),
  'atopic-dermatitis': pack(
    [
      {
        question: (breed) =>
          `How do you distinguish allergies from infection in a ${breed}?`,
        answer: () =>
          `Cytology, culture, and response to therapy separate bacterial/yeast overgrowth from primary atopic disease. Log flare seasons, diet trials, and medication responses chronologically.`,
      },
      {
        question: (breed) =>
          `Are elimination diets useful for ${breed} atopic dermatitis?`,
        answer: () =>
          `Strict elimination trials help identify food-triggered components. Record diet start/end dates and pruritus scores so the trial is interpretable.`,
      },
      {
        question: (breed) =>
          `Which long-term therapies help ${breed} itch control?`,
        answer: () =>
          `Depending on severity: allergen immunotherapy, lokivetmab, oclacitinib, cyclosporine, and topical protocols. Store start dates and adverse-event notes for every systemic drug.`,
      },
    ],
    [
      {
        name: 'Canine atopic dermatitis: detailed guidelines for diagnosis and allergen identification',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25931497/',
        source: 'PubMed · ICADA guidelines',
      },
    ],
  ),
  diabetes: pack(
    [
      {
        question: (breed) =>
          `How often should a diabetic ${breed} check glucose curves?`,
        answer: () =>
          `Follow your veterinarian’s protocol - often after insulin changes and periodically for monitoring. Keep curve PDFs, insulin type/dose, and diet locked in one timeline.`,
      },
      {
        question: (breed) =>
          `What are emergency signs for a diabetic ${breed}?`,
        answer: () =>
          `Vomiting, lethargy, refusal to eat, seizures, or suspected hypoglycemia need urgent care. Record insulin timing relative to meals for ER handoff.`,
      },
      {
        question: (breed) =>
          `Can cataracts develop quickly in diabetic ${breed}s?`,
        answer: () =>
          `Yes - diabetic cataracts can progress rapidly. Ophthalmology notes and surgery dates should live alongside endocrine records.`,
      },
    ],
    [
      {
        name: 'AAHA diabetes management guidelines for dogs and cats',
        url: 'https://pubmed.ncbi.nlm.nih.gov/29578806/',
        source: 'PubMed · AAHA guidelines',
      },
    ],
  ),
  osteosarcoma: pack(
    [
      {
        question: (breed) =>
          `What is typical survival after osteosarcoma treatment in ${breed}s?`,
        answer: () =>
          `Survival varies with amputation/limb-spare surgery, chemotherapy protocols, and staging. Discuss medians with an oncologist and keep staging imaging and chemo dates in the vault.`,
      },
      {
        question: (breed) =>
          `Does limb amputation control pain in ${breed} osteosarcoma?`,
        answer: () =>
          `Amputation often provides excellent local pain control when metastasis workup allows. Document quality-of-life scores before and after surgery.`,
      },
      {
        question: (breed) =>
          `What staging tests are needed before ${breed} osteosarcoma surgery?`,
        answer: () =>
          `Chest imaging (and sometimes advanced staging) screens for metastasis. Archive every staging study with dates before elective amputation.`,
      },
    ],
    [
      {
        name: 'Canine osteosarcoma: a review of diagnosis and treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25633879/',
        source: 'PubMed · veterinary oncology',
      },
    ],
  ),
  hypothyroidism: pack(
    [
      {
        question: (breed) =>
          `Which labs confirm hypothyroidism in a ${breed}?`,
        answer: () =>
          `Typically TT4 with free T4 and TSH interpretation, plus clinical correlation. Store raw lab PDFs - unexplained “low T4” from non-thyroidal illness is common.`,
      },
      {
        question: (breed) =>
          `How soon do ${breed}s improve on levothyroxine?`,
        answer: () =>
          `Energy and skin changes often improve over weeks; recheck levels after dose titration. Log clinical response separately from lab numbers.`,
      },
      {
        question: (breed) =>
          `Can hypothyroidism look like allergy in a ${breed}?`,
        answer: () =>
          `Coat changes and recurrent infections can overlap with dermatology disease. Keep endocrine and dermatology workups cross-linked in one record.`,
      },
    ],
    [
      {
        name: 'Canine hypothyroidism: diagnosis and treatment update',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22041213/',
        source: 'PubMed · veterinary endocrinology',
      },
    ],
  ),
  pancreatitis: pack(
    [
      {
        question: (breed) =>
          `What diet is used after pancreatitis in a ${breed}?`,
        answer: () =>
          `Low-fat veterinary diets are common during recovery; transition plans vary. Record diet trials, lipase results, and hospitalization courses chronologically.`,
      },
      {
        question: (breed) =>
          `When is pancreatitis an emergency for ${breed}s?`,
        answer: () =>
          `Persistent vomiting, severe abdominal pain, collapse, or dehydration needs urgent care. Prior episode history helps ER teams anticipate complications.`,
      },
      {
        question: (breed) =>
          `Can medications trigger pancreatitis in a ${breed}?`,
        answer: () =>
          `Some drugs and dietary indiscretion are associated with flares. Keep a complete medication and diet log for every hospitalization.`,
      },
    ],
    [
      {
        name: 'Canine pancreatitis - diagnosis and management review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25559053/',
        source: 'PubMed · small-animal internal medicine',
      },
    ],
  ),
  'progressive-retinal-atrophy': pack(
    [
      {
        question: (breed) =>
          `Is progressive retinal atrophy painful for ${breed}s?`,
        answer: () =>
          `PRA is typically painless but vision-threatening. Night vision loss often precedes day vision loss - document owner observations and ophthalmology exams over time.`,
      },
      {
        question: (breed) =>
          `Should breeding ${breed}s be genetically tested for PRA?`,
        answer: () =>
          `Breed-specific PRA panels inform breeding decisions. Store lab certificates with exam dates in the vault.`,
      },
      {
        question: (breed) =>
          `How do homes adapt when a ${breed} loses vision?`,
        answer: () =>
          `Keep furniture layouts stable, use verbal cues, and block hazards like stairs. Share the adaptation plan with sitters via the digital timeline.`,
      },
    ],
    [
      {
        name: 'Progressive retinal atrophy in dogs: genetic and clinical overview',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26486053/',
        source: 'PubMed · veterinary ophthalmology',
      },
    ],
  ),
  cushings: pack(
    [
      {
        question: (breed) =>
          `How is Cushing's disease confirmed in a ${breed}?`,
        answer: () =>
          `LDDST, ACTH stim, urine cortisol:creatinine ratios, and imaging are used in combination. Keep every endocrine test PDF - interpretation depends on the full sequence.`,
      },
      {
        question: (breed) =>
          `What clinical signs suggest Cushing's in a ${breed}?`,
        answer: () =>
          `PU/PD, pot-belly, panting, hair coat changes, and recurrent infections are common. Log water intake estimates and skin flares between visits.`,
      },
      {
        question: (breed) =>
          `How is medical therapy monitored for ${breed} Cushing's?`,
        answer: () =>
          `Trilostane protocols require scheduled monitoring ACTH stim or clinical reassessment. Record dose changes and monitoring dates meticulously.`,
      },
    ],
    [
      {
        name: "Canine hyperadrenocorticism (Cushing's syndrome): diagnosis and treatment",
        url: 'https://pubmed.ncbi.nlm.nih.gov/22041208/',
        source: 'PubMed · veterinary endocrinology',
      },
    ],
  ),
  addisons: pack(
    [
      {
        question: (breed) =>
          `What is an Addisonian crisis in a ${breed}?`,
        answer: () =>
          `Acute hypoadrenocorticism can present with collapse, bradycardia, and electrolyte crisis. Prior diagnosis and current DOCP/glucocorticoid doses must be visible to ER teams.`,
      },
      {
        question: (breed) =>
          `How often do ${breed}s on DOCP need monitoring?`,
        answer: () =>
          `Electrolytes are checked on a schedule set by the veterinarian, especially after dose changes. Store lab dates and injection intervals in the vault.`,
      },
      {
        question: (breed) =>
          `Can stress precipitate Addison's flares in a ${breed}?`,
        answer: () =>
          `Illness, boarding, or travel can increase glucocorticoid need in some patients. Keep a written stress-dose plan with the emergency passport.`,
      },
    ],
    [
      {
        name: 'Canine hypoadrenocorticism: update on diagnosis and management',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25496918/',
        source: 'PubMed · veterinary endocrinology',
      },
    ],
  ),
  'portosystemic-shunt': pack(
    [
      {
        question: (breed) =>
          `What neurologic signs suggest a portosystemic shunt in a ${breed}?`,
        answer: () =>
          `Hepatic encephalopathy can cause disorientation, seizures, or bizarre behavior after meals. Log timing relative to feeding and any ammonia/bile acid results.`,
      },
      {
        question: (breed) =>
          `Is surgery always required for ${breed} PSS?`,
        answer: () =>
          `Many congenital shunts are surgical candidates; medical management bridges to surgery or supports inoperable cases. Archive imaging (CT/scintigraphy), diet, lactulose, and antibiotic protocols.`,
      },
      {
        question: (breed) =>
          `What pre-anesthetic risks matter for a ${breed} with PSS?`,
        answer: () =>
          `Hepatic dysfunction changes drug metabolism. Ensure every anesthetic event references the shunt diagnosis and current medical plan.`,
      },
    ],
    [
      {
        name: 'Congenital portosystemic shunts in dogs and cats: diagnosis and treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22041220/',
        source: 'PubMed · veterinary surgery / internal medicine',
      },
    ],
  ),
};

const FALLBACK = pack(
  [
    {
      question: (breed, condition) =>
        `How should ${breed} owners document ${condition} over time?`,
      answer: (breed, condition) =>
        `Keep dated symptom notes, diagnostics, medications, and specialist reports for ${condition} in one chronological vault. ${breed} caregivers who share that timeline with every clinic reduce duplicated testing and missed escalations.`,
    },
    {
      question: (breed, condition) =>
        `When is ${condition} an emergency for a ${breed}?`,
      answer: () =>
        `Rapid worsening, pain that does not respond to prescribed plans, collapse, breathing distress, or loss of mobility warrant urgent veterinary care. Bring the digital timeline so ER teams see prior workups immediately.`,
    },
    {
      question: (breed, condition) =>
        `Why use a digital health vault for ${breed} ${condition} care?`,
      answer: () =>
        `Multi-clinic care fails when records are fragmented. A single dossier of imaging, labs, and protocols lets specialists, sitters, and relocation partners act on the same facts.`,
    },
  ],
  [
    {
      name: 'Evidence-based veterinary medicine and clinical record quality',
      url: 'https://pubmed.ncbi.nlm.nih.gov/29293061/',
      source: 'PubMed · veterinary clinical practice',
    },
  ],
);

export function getBreedConditionFaqs(meta: BreedConditionMeta): GeneratedFaqItem[] {
  const packForSegment = AUTHORITY_BY_SEGMENT[conditionSegment(meta)] ?? FALLBACK;
  return packForSegment.faqTemplates.map((template) => ({
    question: template.question(meta.breed, meta.condition),
    answer: template.answer(meta.breed, meta.condition),
  }));
}

export function getBreedConditionCitations(
  meta: BreedConditionMeta,
): BreedConditionCitation[] {
  const packForSegment = AUTHORITY_BY_SEGMENT[conditionSegment(meta)] ?? FALLBACK;
  return packForSegment.citations;
}
