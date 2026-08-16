import { ROUTES } from '@/routes/paths';
import { SITE_META } from '@/data/seoConfig';

export type KnowledgeGraphEntity = {
  name: string;
  description: string;
  wikidataId: string;
  icdCode?: string;
  /** Optional therapy / management summary for MedicalCondition nodes. */
  possibleTreatment?: string;
};

export type KnowledgeGraphConfig = {
  pageTitle: string;
  pageUrl: string;
  /** Optional MedicalWebPage description override. */
  pageDescription?: string;
  entities: KnowledgeGraphEntity[];
};

const blogUrl = (slug: string) => `${SITE_META.siteUrl}${ROUTES.BLOG}/${slug}`;

const IVDD_TREATMENT =
  'Strict crate rest, anti-inflammatory medication, or surgical decompression when indicated by a veterinarian';

/** Deep entity graphs for high-leverage growth-band blog targets. */
export const KNOWLEDGE_GRAPH_BY_BLOG_SLUG: Record<string, KnowledgeGraphConfig> = {
  'corgi-spine-health-ivdd-ramps-reality': {
    pageTitle: 'Understanding IVDD in Corgis: Symptoms & Tracking',
    pageDescription:
      'Comprehensive guide on monitoring Intervertebral Disc Disease in Corgis using structured clinical health timelines.',
    pageUrl: blogUrl('corgi-spine-health-ivdd-ramps-reality'),
    entities: [
      {
        name: 'Intervertebral Disc Disease (IVDD)',
        description:
          'A condition where the cushioning discs between the vertebrae of the spinal column either bulge or burst into the spinal cord space.',
        wikidataId: 'Q1341142',
        icdCode: 'M51.2',
        possibleTreatment: IVDD_TREATMENT,
      },
      {
        name: 'Welsh Corgi',
        description:
          'A small type of herding dog that originated in Wales, known for achondroplastic dwarfism.',
        wikidataId: 'Q29099',
      },
    ],
  },
  'dog-dragging-back-legs-ivdd-emergency': {
    pageTitle: 'Dog Dragging Back Legs: IVDD Emergency Signs',
    pageDescription:
      'How to recognize urgent IVDD neurological signs, what to document before the ER, and how a structured health timeline supports triage.',
    pageUrl: blogUrl('dog-dragging-back-legs-ivdd-emergency'),
    entities: [
      {
        name: 'Intervertebral Disc Disease (IVDD)',
        description:
          'A spinal disc disease that can cause pain, ataxia, or paralysis requiring emergency veterinary assessment.',
        wikidataId: 'Q1341142',
        icdCode: 'M51.2',
        possibleTreatment: IVDD_TREATMENT,
      },
    ],
  },
  'french-bulldog-surgery-costs-boas-ivdd': {
    pageTitle: 'French Bulldog Surgery Costs: BOAS & IVDD',
    pageDescription:
      'Cost ranges and clinical context for French Bulldog airway (BOAS) and spinal (IVDD) surgeries, with record-keeping guidance for owners.',
    pageUrl: blogUrl('french-bulldog-surgery-costs-boas-ivdd'),
    entities: [
      {
        name: 'Brachycephalic Obstructive Airway Syndrome',
        description:
          'A set of upper airway abnormalities common in brachycephalic breeds that can require surgical correction.',
        wikidataId: 'Q4953578',
        possibleTreatment: 'Soft palate resection, stenotic nares correction, and perioperative airway management by a veterinarian',
      },
      {
        name: 'Intervertebral Disc Disease (IVDD)',
        description:
          'A condition where intervertebral discs degenerate or herniate, risking spinal cord compression.',
        wikidataId: 'Q1341142',
        icdCode: 'M51.2',
        possibleTreatment: IVDD_TREATMENT,
      },
    ],
  },
  'how-much-does-it-cost-to-clone-a-dog-2026': {
    pageTitle: 'How Much Does It Cost to Clone a Dog in 2026?',
    pageDescription:
      '2026 commercial dog cloning prices, what lab packages include, extra fees, and why a clone is a genetic copy rather than the same pet.',
    pageUrl: blogUrl('how-much-does-it-cost-to-clone-a-dog-2026'),
    entities: [
      {
        name: 'Cloning',
        description:
          'The process of producing individuals with identical or virtually identical DNA.',
        wikidataId: 'Q120877',
      },
      {
        name: 'Somatic cell nuclear transfer',
        description:
          'A laboratory strategy for creating a viable embryo from a body cell and an egg cell.',
        wikidataId: 'Q1140026',
      },
    ],
  },
  'how-common-is-ivdd-in-corgis': {
    pageTitle: 'How Common Is IVDD in Corgis?',
    pageDescription:
      'Prevalence context for intervertebral disc disease in Pembroke and Cardigan Welsh Corgis, emergency grades, and records neurologists use.',
    pageUrl: blogUrl('how-common-is-ivdd-in-corgis'),
    entities: [
      {
        name: 'Intervertebral Disc Disease (IVDD)',
        description:
          'A condition where the cushioning discs between the vertebrae of the spinal column either bulge or burst into the spinal cord space.',
        wikidataId: 'Q1341142',
        icdCode: 'M51.2',
        possibleTreatment: IVDD_TREATMENT,
      },
      {
        name: 'Welsh Corgi',
        description:
          'A small type of herding dog that originated in Wales, known for achondroplastic dwarfism.',
        wikidataId: 'Q29099',
      },
    ],
  },
  'ethics-pet-cloning-2026-costs-reality': {
    pageTitle: 'The Ethics & Costs of Pet Cloning in 2026',
    pageUrl: blogUrl('ethics-pet-cloning-2026-costs-reality'),
    entities: [
      {
        name: 'Cloning',
        description:
          'The process of producing individuals with identical or virtually identical DNA.',
        wikidataId: 'Q120877',
      },
      {
        name: 'Somatic cell nuclear transfer',
        description:
          'A laboratory strategy for creating a viable embryo from a body cell and an egg cell.',
        wikidataId: 'Q1140026',
      },
    ],
  },
};

export function getKnowledgeGraphConfigForBlogSlug(
  slug: string,
): KnowledgeGraphConfig | null {
  return KNOWLEDGE_GRAPH_BY_BLOG_SLUG[slug] ?? null;
}
