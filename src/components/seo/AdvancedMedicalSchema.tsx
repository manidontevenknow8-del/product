import { useMemo } from 'react';
import type { BreedConditionMeta } from '@/data/breedConditions';
import { getBreedConditionPath } from '@/data/breedConditions';
import { SITE_META } from '@/data/seoConfig';
import { JsonLd } from '@/seo/JsonLd';

const VETERINARY_MEDICINE_WIKIDATA = 'https://www.wikidata.org/wiki/Q170352';

type AdvancedMedicalSchemaProps = {
  data: BreedConditionMeta;
};

/** Condition slug segment (after `/`) → stable English Wikipedia veterinary article. */
const CONDITION_WIKI_TITLES: Record<string, string> = {
  boas: 'Brachycephalic_obstructive_airway_syndrome',
  'brachycephalic-airway-syndrome': 'Brachycephalic_obstructive_airway_syndrome',
  ivdd: 'Intervertebral_disc_disease',
  'hip-dysplasia': 'Hip_dysplasia_(canine)',
  'degenerative-myelopathy': 'Degenerative_myelopathy',
  'mitral-valve-disease': 'Myxomatous_mitral_valve_disease',
  'exercise-induced-collapse': 'Exercise-induced_collapse',
  'dilated-cardiomyopathy': 'Dilated_cardiomyopathy',
  epilepsy: 'Epilepsy_in_animals',
  'tracheal-collapse': 'Tracheal_collapse',
  'gastric-dilatation-volvulus': 'Gastric_dilatation_volvulus',
  gdv: 'Gastric_dilatation_volvulus',
  'progressive-retinal-atrophy': 'Progressive_retinal_atrophy',
  hypothyroidism: 'Hypothyroidism',
  diabetes: 'Diabetes_mellitus_in_dogs',
  'atopic-dermatitis': 'Atopic_dermatitis',
  cruciate: 'Cruciate_ligament_injury',
  osteosarcoma: 'Osteosarcoma',
  addisons: "Addison's_disease",
  cushings: "Cushing's_syndrome",
  pancreatitis: 'Pancreatitis',
  'portosystemic-shunt': 'Portosystemic_shunt',
};

/** Full `breed/condition` slug overrides — preserved for explicit breed–condition mappings. */
const SLUG_WIKI_OVERRIDES: Record<string, string> = {
  'french-bulldog/boas': CONDITION_WIKI_TITLES.boas,
  'pug/brachycephalic-airway-syndrome': CONDITION_WIKI_TITLES['brachycephalic-airway-syndrome'],
  'corgi/ivdd': CONDITION_WIKI_TITLES.ivdd,
  'dachshund/ivdd': CONDITION_WIKI_TITLES.ivdd,
  'golden-retriever/hip-dysplasia': CONDITION_WIKI_TITLES['hip-dysplasia'],
  'german-shepherd/degenerative-myelopathy': CONDITION_WIKI_TITLES['degenerative-myelopathy'],
  'cavalier-king-charles-spaniel/mitral-valve-disease':
    CONDITION_WIKI_TITLES['mitral-valve-disease'],
  'labrador-retriever/exercise-induced-collapse': CONDITION_WIKI_TITLES['exercise-induced-collapse'],
  'boxer/dilated-cardiomyopathy': CONDITION_WIKI_TITLES['dilated-cardiomyopathy'],
  'beagle/epilepsy': CONDITION_WIKI_TITLES.epilepsy,
  'yorkshire-terrier/tracheal-collapse': CONDITION_WIKI_TITLES['tracheal-collapse'],
  'great-dane/gastric-dilatation-volvulus': CONDITION_WIKI_TITLES['gastric-dilatation-volvulus'],
};

function conditionSegmentFromSlug(slug: string): string {
  const slash = slug.lastIndexOf('/');
  return slash === -1 ? slug : slug.slice(slash + 1);
}

/** Map scientific / colloquial names to stable English Wikipedia veterinary articles. */
function wikipediaUriForCondition(data: BreedConditionMeta): string {
  const conditionSegment = conditionSegmentFromSlug(data.slug);

  const wikiTitle =
    SLUG_WIKI_OVERRIDES[data.slug] ??
    CONDITION_WIKI_TITLES[conditionSegment] ??
    data.scientificName.trim().replace(/\s+/g, '_');

  return `https://en.wikipedia.org/wiki/${wikiTitle}`;
}

/**
 * Deep YMYL MedicalWebPage JSON-LD with Wikidata + Wikipedia entity linking.
 * Injected via textContent (useJsonLd) — no dangerouslySetInnerHTML / XSS surface.
 */
export function buildAdvancedMedicalSchema(data: BreedConditionMeta) {
  const path = getBreedConditionPath(data);
  const url = `${SITE_META.siteUrl}${path}`;
  const name = `${data.condition} in ${data.breed}s: Symptoms, Timeline & Digital Tracking`;
  const description = data.overview.slice(0, 320);
  const wikipediaUri = wikipediaUriForCondition(data);

  return {
    '@context': 'https://schema.org' as const,
    '@type': 'MedicalWebPage' as const,
    '@id': `${url}#medical-webpage`,
    name,
    description,
    url,
    about: [
      {
        '@type': 'MedicalCondition' as const,
        '@id': `${url}#condition`,
        name: data.condition,
        alternateName: data.scientificName,
        description: data.overview.slice(0, 240),
        sameAs: [data.wikidataUri, wikipediaUri],
        possibleTreatment: data.managementProtocol.slice(0, 3).map((step) => ({
          '@type': 'MedicalTherapy' as const,
          name: step,
        })),
        signOrSymptom: data.symptoms.slice(0, 5).map((symptom) => ({
          '@type': 'MedicalSignOrSymptom' as const,
          name: symptom,
        })),
      },
    ],
    specialty: {
      '@type': 'MedicalSpecialty' as const,
      name: 'Veterinary Medicine',
      sameAs: VETERINARY_MEDICINE_WIKIDATA,
    },
    audience: {
      '@type': 'Patient' as const,
      audienceType: 'Dog Owners, Veterinary Concierge Specialists',
    },
    lastReviewed: '2026-07-18',
    publisher: {
      '@type': 'Organization' as const,
      name: SITE_META.siteName,
      url: SITE_META.siteUrl,
    },
  };
}

/** Graph-node form (no @context) for composition into a parent @graph. */
export function buildAdvancedMedicalSchemaNode(data: BreedConditionMeta) {
  const { '@context': _context, ...node } = buildAdvancedMedicalSchema(data);
  return node;
}

/**
 * Programmatic deep entity schema for breed–condition pSEO landings.
 * Satisfies Google NLP entity disambiguation for YMYL veterinary pages.
 */
export function AdvancedMedicalSchema({ data }: AdvancedMedicalSchemaProps) {
  const schema = useMemo(() => buildAdvancedMedicalSchema(data), [data]);
  const scriptId = useMemo(
    () => `advanced-medical-${data.slug.replace(/\//g, '-')}`,
    [data.slug],
  );

  return <JsonLd id={scriptId} data={schema} />;
}
