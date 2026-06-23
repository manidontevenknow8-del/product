import { SITE_META } from '@/data/seoConfig';
import { JsonLd } from './JsonLd';
import { ORGANIZATION_ID, SOFTWARE_ID, WEBSITE_ID } from './structuredDataSchemas';

export type CommercialSchemaTopic = {
  topicName: string;
  topicWikidataUrl: string;
};

export type CommercialPageSchemaProps = {
  /** Canonical page URL (e.g. https://petclues.com/digital-pet-passport). */
  pageUrl: string;
  /** WebPage name, typically the SEO title. */
  name: string;
  /** WebPage description: typically the meta description. */
  description: string;
  /** Primary entity the page is about (display name). */
  topicName: string;
  /** Wikidata URI anchoring the primary topic for Knowledge Graph disambiguation. */
  topicWikidataUrl: string;
  /** Optional secondary topics (e.g. vaccination + health records). */
  additionalTopics?: readonly CommercialSchemaTopic[];
};

export function buildCommercialPageWebPageSchema({
  pageUrl,
  name,
  description,
  topicName,
  topicWikidataUrl,
  additionalTopics = [],
}: CommercialPageSchemaProps) {
  const about = [
    {
      '@type': 'Thing' as const,
      name: topicName,
      sameAs: topicWikidataUrl,
    },
    ...additionalTopics.map((topic) => ({
      '@type': 'Thing' as const,
      name: topic.topicName,
      sameAs: topic.topicWikidataUrl,
    })),
  ];

  return {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    about,
    mainEntity: {
      '@type': 'SoftwareApplication',
      '@id': SOFTWARE_ID,
    },
  };
}

function schemaScriptId(pageUrl: string): string {
  try {
    return `commercial-page${new URL(pageUrl).pathname.replace(/\//g, '-')}`;
  } catch {
    return 'commercial-page';
  }
}

/**
 * Injects commercial money-page WebPage JSON-LD with topic entity binding
 * and SoftwareApplication mainEntity.
 */
export function CommercialPageSchema(props: CommercialPageSchemaProps) {
  return <JsonLd id={schemaScriptId(props.pageUrl)} data={buildCommercialPageWebPageSchema(props)} />;
}

/** Resolve a commercial path to its absolute URL. */
export function commercialPageUrl(path: string): string {
  return `${SITE_META.siteUrl}${path}`;
}
