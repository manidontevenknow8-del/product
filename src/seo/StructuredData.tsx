import { LANDING_FAQ_SCHEMA_ITEMS } from '@/data/faqSchemaItems';
import {
  buildFaqPageSchema,
  buildLandingGraphSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { JsonLd } from './JsonLd';

export function OrganizationStructuredData() {
  return (
    <JsonLd
      id="organization"
      data={buildSchemaGraph(buildOrganizationSchema(), buildSoftwareApplicationSchema())}
    />
  );
}

export function WebSiteStructuredData() {
  return <JsonLd id="website" data={buildWebSiteSchema()} />;
}

export function SoftwareApplicationStructuredData() {
  return (
    <JsonLd
      id="software-application"
      data={{
        '@context': 'https://schema.org',
        ...buildSoftwareApplicationSchema(),
      }}
    />
  );
}

type FaqStructuredDataProps = {
  items: readonly { question: string; answer: string }[];
};

export function FaqStructuredData({ items }: FaqStructuredDataProps) {
  return <JsonLd id="faq-page" data={buildFaqPageSchema(items)} />;
}

export function LandingStructuredData() {
  return <JsonLd id="landing-graph" data={buildLandingGraphSchema(LANDING_FAQ_SCHEMA_ITEMS)} />;
}

type StructuredDataProps = {
  type?: 'Organization' | 'WebApplication' | 'FAQPage';
};

/** @deprecated Prefer specific structured data components from SEOProvider */
export function StructuredData({ type = 'WebApplication' }: StructuredDataProps) {
  if (type === 'FAQPage') {
    return <FaqStructuredData items={LANDING_FAQ_SCHEMA_ITEMS} />;
  }
  if (type === 'Organization') {
    return <OrganizationStructuredData />;
  }
  return <LandingStructuredData />;
}
