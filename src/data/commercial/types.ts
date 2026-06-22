export type CommercialFeature = {
  title: string;
  body: string;
};

export type CommercialTrustPoint = {
  title: string;
  body: string;
};

export type CommercialFaq = {
  question: string;
  answer: string;
};

export type CommercialRelatedLink = {
  href: string;
  label: string;
};

export type CommercialProseSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type CommercialSchemaTopic = {
  topicName: string;
  topicWikidataUrl: string;
};

export type CommercialPageConfig = {
  path: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  title: string;
  metaDescription: string;
  /** Primary Wikidata-anchored topic for JSON-LD `about` on this money page. */
  schemaTopic: CommercialSchemaTopic;
  /** Optional secondary topics for pages spanning multiple entities. */
  additionalSchemaTopics?: CommercialSchemaTopic[];
  heroEyebrow: string;
  heroTitle: string;
  heroSubhead: string;
  heroImage: string;
  heroImageAlt: string;
  featuresTitle: string;
  features: CommercialFeature[];
  trustTitle: string;
  trustPoints: CommercialTrustPoint[];
  proseSections: CommercialProseSection[];
  faqs: CommercialFaq[];
  ctaTitle: string;
  ctaLead: string;
  relatedLinks: CommercialRelatedLink[];
};
