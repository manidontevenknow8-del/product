import type { SEOConfig } from '@/data/seoConfig';
import { DEFAULT_OG_IMAGE, SITE_META } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from '@/seo/MetaTags';
import { buildBreadcrumbListSchema } from '@/seo/breadcrumbSchema';
import { buildMedicalWebPageSchema } from '@/seo/medicalWebPageSchema';
import {
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildSchemaGraph,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema,
  SOFTWARE_ID,
} from '@/seo/structuredDataSchemas';
import { useJsonLd } from '@/seo/useJsonLd';
import { formatMetaDescription, formatPageTitle } from '@/seo/seoFormatters';

export const VACCINE_SCHEDULER_PATH = ROUTES.TOOLS_VACCINE_SCHEDULER;

const PAGE_URL = `${SITE_META.siteUrl}${VACCINE_SCHEDULER_PATH}`;

const TITLE = 'Puppy & Kitten Vaccination Scheduler | Free Immunization Roadmap';
const DESCRIPTION =
  'Free puppy and kitten vaccination & booster scheduler. Enter species, date of birth, and lifestyle risk to generate a custom clinical immunization roadmap - then save reminders to PetClues.';

const FAQS = [
  {
    question: 'When should puppies get their first DHPP vaccine?',
    answer:
      'Most puppies begin the DHPP core series around 8 weeks of age, with boosters at roughly 12 weeks and a final dose near 16 weeks (sometimes later for large breeds). Always confirm timing with your veterinarian.',
  },
  {
    question: 'When do kittens get FVRCP and rabies?',
    answer:
      'Kittens typically start FVRCP around 8 weeks, continue at 12 weeks, and finish near 16 weeks. Rabies is commonly given around 12 weeks, subject to local licensing rules.',
  },
  {
    question: 'Do indoor pets still need vaccines?',
    answer:
      'Core vaccines (such as DHPP/FVRCP and rabies) are still recommended for most indoor pets because pathogens can enter the home and many jurisdictions require rabies. Non-core vaccines depend on lifestyle risk.',
  },
  {
    question: 'Is this schedule a veterinary prescription?',
    answer:
      'No. PetClues provides an educational planning roadmap. Your veterinarian should tailor products, intervals, and titers to your animal, region, and travel plans.',
  },
] as const;

export function getVaccineSchedulerSEO(): SEOConfig {
  return {
    title: formatPageTitle(TITLE),
    description: formatMetaDescription(DESCRIPTION, TITLE),
    keywords:
      'puppy vaccination schedule, kitten vaccination schedule, dog vaccine booster calculator, cat vaccine schedule, rabies vaccine puppy, FVRCP schedule, DHPP schedule',
    canonical: PAGE_URL,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues puppy and kitten vaccination scheduler',
    noIndex: false,
  };
}

function buildToolSoftwareApplicationSchema() {
  return {
    '@type': 'SoftwareApplication' as const,
    '@id': `${PAGE_URL}#vaccine-scheduler-app`,
    name: 'PetClues Puppy & Kitten Vaccination Scheduler',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    url: PAGE_URL,
    description: DESCRIPTION,
    offers: {
      '@type': 'Offer' as const,
      price: '0',
      priceCurrency: 'USD',
    },
    isPartOf: { '@id': SOFTWARE_ID },
  };
}

export function getVaccineSchedulerStructuredData() {
  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildSoftwareApplicationSchema(),
    buildToolSoftwareApplicationSchema(),
    buildMedicalWebPageSchema({
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      audienceType: 'Dog Owners, Cat Owners, New Puppy Parents, New Kitten Parents',
      about: [
        {
          name: 'Companion animal vaccination',
          description:
            'Core and lifestyle-based immunization planning for puppies and kittens, including DHPP, FVRCP, rabies, and booster intervals.',
          possibleTreatment: 'Preventive veterinary vaccination',
        },
        {
          name: 'Rabies prophylaxis in dogs and cats',
          description: 'Primary rabies vaccination and booster / titer planning for travel and licensing.',
        },
      ],
    }),
    buildFaqPageSchema([...FAQS], `${PAGE_URL}#faq`),
    buildBreadcrumbListSchema([
      { name: 'Home', path: ROUTES.LANDING },
      { name: 'Free Clinical Tools', path: VACCINE_SCHEDULER_PATH },
      { name: 'Vaccination Scheduler', path: VACCINE_SCHEDULER_PATH },
    ]),
  );
}

export function VaccineSchedulerSEO() {
  const config = getVaccineSchedulerSEO();
  useJsonLd('vaccine-scheduler', getVaccineSchedulerStructuredData());

  return (
    <>
      <MetaTags config={config} />
      <OpenGraph config={config} />
    </>
  );
}
