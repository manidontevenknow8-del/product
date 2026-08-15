import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';
import type { B2BSolution } from '@/data/b2bSolutions';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema } from './breadcrumbSchema';
import {
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';
import { formatMetaDescription, formatPageTitle } from './seoFormatters';
import { ROUTES } from '@/routes/paths';

export function getB2BSolutionSEO(solution: B2BSolution): SEOConfig {
  return {
    title: formatPageTitle(solution.title),
    description: formatMetaDescription(solution.subtitle),
    keywords: [
      solution.eyebrow,
      'white-label pet vault',
      'pet relocation software',
      'breeder handover portal',
      'PetClues Concierge',
    ].join(', '),
    canonical: `${SITE_META.siteUrl}${solution.path}`,
    ogType: 'website',
    ogTitle: formatPageTitle(solution.heroHeadline),
    ogDescription: formatMetaDescription(solution.heroLead),
    noIndex: false,
  };
}

export function getB2BSolutionStructuredData(solution: B2BSolution) {
  const pageUrl = `${SITE_META.siteUrl}${solution.path}`;
  const faqs = [
    {
      question: `What does ${solution.pricing[0].name} include?`,
      answer: solution.pricing[0].description,
    },
    {
      question: `What does the Unlimited Agency License cost?`,
      answer: `${solution.pricing[1].priceLabel}/month - ${solution.pricing[1].description}`,
    },
    {
      question: `Who is this portal for?`,
      answer: solution.coreSolution,
    },
  ];

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildWebPageSchema({
      url: pageUrl,
      name: solution.title,
      description: solution.subtitle,
    }),
    buildBreadcrumbListSchema([
      { name: 'Home', path: ROUTES.LANDING },
      { name: solution.title, path: solution.path },
    ]),
    buildFaqPageSchema(faqs, `${pageUrl}#faq`),
  );
}

export function B2BSolutionSEO({ solution }: { solution: B2BSolution }) {
  const config = getB2BSolutionSEO(solution);
  useJsonLd(`b2b-${solution.id}`, getB2BSolutionStructuredData(solution));
  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}
