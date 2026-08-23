import { ORGANIZATION_ID, WEBSITE_ID } from '@/seo/structuredDataSchemas';

export type MedicalWebPageAbout = {
  name: string;
  description?: string;
  /** Optional ICD-10 / coding system code. */
  code?: string;
  codingSystem?: string;
  possibleTreatment?: string;
  sameAs?: string;
};

export type BuildMedicalWebPageOptions = {
  url: string;
  name: string;
  description: string;
  about?: readonly MedicalWebPageAbout[];
  audienceType?: string;
  lastReviewed?: string;
  reviewedBy?: object;
};

/**
 * YMYL-oriented MedicalWebPage JSON-LD for veterinary / health guides.
 * Omits fabricated review ratings; focuses on condition, audience, and therapy signals.
 */
export function buildMedicalWebPageSchema(options: BuildMedicalWebPageOptions) {
  const about =
    options.about?.map((entity) => ({
      '@type': 'MedicalCondition' as const,
      name: entity.name,
      ...(entity.description ? { description: entity.description } : {}),
      ...(entity.sameAs ? { sameAs: entity.sameAs } : {}),
      ...(entity.code
        ? {
            code: {
              '@type': 'MedicalCode' as const,
              code: entity.code,
              codingSystem: entity.codingSystem ?? 'ICD-10',
            },
          }
        : {}),
      ...(entity.possibleTreatment
        ? {
            possibleTreatment: {
              '@type': 'MedicalTherapy' as const,
              name: entity.possibleTreatment,
            },
          }
        : {}),
    })) ?? undefined;

  return {
    '@type': 'MedicalWebPage' as const,
    '@id': `${options.url}#medical-webpage`,
    url: options.url,
    name: options.name,
    description: options.description,
    ...(about && about.length > 0 ? { about } : {}),
    audience: {
      '@type': 'PeopleAudience' as const,
      audienceType: options.audienceType ?? 'Dog Owners, Cat Owners, Veterinary Specialists',
    },
    ...(options.lastReviewed ? { lastReviewed: options.lastReviewed } : {}),
    ...(options.reviewedBy ? { reviewedBy: options.reviewedBy } : {}),
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}
