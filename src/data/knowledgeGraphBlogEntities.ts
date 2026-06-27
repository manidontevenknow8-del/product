import { ROUTES } from '@/routes/paths';
import { SITE_META } from '@/data/seoConfig';

export type KnowledgeGraphEntity = {
  name: string;
  description: string;
  wikidataId: string;
  icdCode?: string;
};

export type KnowledgeGraphConfig = {
  pageTitle: string;
  pageUrl: string;
  entities: KnowledgeGraphEntity[];
};

const blogUrl = (slug: string) => `${SITE_META.siteUrl}${ROUTES.BLOG}/${slug}`;

/** Deep entity graphs for high-leverage growth-band blog targets. */
export const KNOWLEDGE_GRAPH_BY_BLOG_SLUG: Record<string, KnowledgeGraphConfig> = {
  'corgi-spine-health-ivdd-ramps-reality': {
    pageTitle: 'Corgi Spine Health & IVDD: 2026 Reality',
    pageUrl: blogUrl('corgi-spine-health-ivdd-ramps-reality'),
    entities: [
      {
        name: 'Intervertebral Disc Disease',
        description:
          'A condition where the cushioning discs between the vertebrae of the spinal column either bulge or burst into the spinal cord space.',
        wikidataId: 'Q1341142',
        icdCode: 'M51.2',
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
