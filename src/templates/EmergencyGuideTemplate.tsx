import type { ReactNode } from 'react';
import type { EmergencyRecord, EmergencyGuidePageRecord } from '@content-types/emergency';
import { ROUTES } from '@/routes/paths';
import { ContentTemplateShell, type ContentFaq } from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import { getRelatedEmergencyPages } from './related/contentRelatedLinks';

/** Same disclaimer Agent 3 uses on symptom pages — required on every emergency URL. */
export const EMERGENCY_HEALTH_DISCLAIMER =
  'This is general information, not a diagnosis. Contact your vet for anything urgent or unclear.';

export type EmergencyGuideTemplateProps = {
  emergency: EmergencyRecord;
  path: string;
  primaryKeyword: string;
  metaDescription: string;
  body: ReactNode;
  faqs?: ContentFaq[];
  ctaHref?: string;
  /** Page H1 when different from the core emergency name (long-tail variants). */
  h1?: string;
  lead?: string;
  /** Override action steps / triage line for angle-specific pages. */
  page?: Pick<
    EmergencyGuidePageRecord,
    'immediate_action_steps' | 'when_to_call_vet_vs_poison_control' | 'slug'
  >;
  /** Production /emergency pages are indexable; example routes stay noIndex. */
  noIndex?: boolean;
  breadcrumbs?: { label: string; href?: string }[];
};

export function EmergencyGuideTemplate({
  emergency,
  path,
  primaryKeyword,
  metaDescription,
  body,
  faqs,
  ctaHref = ROUTES.SIGNUP,
  h1,
  lead,
  page,
  noIndex = true,
  breadcrumbs,
}: EmergencyGuideTemplateProps) {
  const actionSteps = page?.immediate_action_steps ?? emergency.immediate_action_steps;
  const triageLine =
    page?.when_to_call_vet_vs_poison_control ?? emergency.when_to_call_vet_vs_poison_control;
  const relatedSlug = page?.slug ?? emergency.slug;

  return (
    <ContentTemplateShell
      meta={buildContentMeta({ primaryKeyword, description: metaDescription, path })}
      noIndex={noIndex}
      breadcrumbs={
        breadcrumbs ?? [
          { label: 'Home', href: ROUTES.LANDING },
          { label: 'Emergency guides', href: '/emergency' },
          { label: h1 ?? emergency.name },
        ]
      }
      h1={h1 ?? emergency.name}
      lead={lead}
      dataTitle="Do this first"
      dataRows={[
        { label: 'Scenario', value: emergency.name },
        {
          label: 'Vet vs poison control vs ER',
          value: triageLine,
        },
      ]}
      dataLists={[{ heading: 'Immediate action steps', items: actionSteps }]}
      body={body}
      cta={{
        variant: 'trial',
        headline: 'Set up your Emergency Passport before you need it',
        subtext:
          "Store your vet's number and your pet's allergies here so you're not searching for them mid-crisis.",
        buttonText: 'Build Emergency Passport',
        href: ctaHref,
      }}
      related={getRelatedEmergencyPages(relatedSlug, emergency.slug)}
      relatedHeading="Related emergency guides"
      faqs={faqs}
      afterCta={
        <p role="note" style={{ marginTop: '1.25rem', fontSize: '0.95rem', lineHeight: 1.5, opacity: 0.9 }}>
          {EMERGENCY_HEALTH_DISCLAIMER}
        </p>
      }
    />
  );
}
