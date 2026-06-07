import { LANDING_FAQ_SCHEMA_ITEMS } from '@/data/faqSchemaItems';
import {
  buildFaqPageSchema,
  buildLandingGraphSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from './structuredDataSchemas';
import { useJsonLd } from './useJsonLd';

export function OrganizationStructuredData() {
  useJsonLd('organization', buildOrganizationSchema());
  return null;
}

export function WebSiteStructuredData() {
  useJsonLd('website', buildWebSiteSchema());
  return null;
}

type FaqStructuredDataProps = {
  items: readonly { question: string; answer: string }[];
};

export function FaqStructuredData({ items }: FaqStructuredDataProps) {
  useJsonLd('faq-page', buildFaqPageSchema(items));
  return null;
}

export function LandingStructuredData() {
  useJsonLd('landing-graph', buildLandingGraphSchema(LANDING_FAQ_SCHEMA_ITEMS));
  return null;
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
