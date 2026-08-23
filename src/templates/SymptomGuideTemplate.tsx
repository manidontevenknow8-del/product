import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SymptomGuidePageRecord, SymptomRecord } from '@content-types/symptom';
import { ROUTES } from '@/routes/paths';
import { getBreedBySlug } from '@/content/loadContentData';
import { ContentTemplateShell, type ContentFaq } from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import {
  getSymptomGuideRelated,
  resolveBreedHealthHref,
  resolveEmergencyHref,
} from './related/contentRelatedLinks';
import styles from './SymptomGuideTemplate.module.css';

export type SymptomGuideTemplateProps = {
  symptom: SymptomRecord;
  path: string;
  primaryKeyword: string;
  metaDescription: string;
  body: ReactNode;
  faqs?: ContentFaq[];
  ctaHref?: string;
  /** Override H1 when using generated SEO page payloads. */
  h1?: string;
  lead?: string;
  disclaimer?: string;
  page?: SymptomGuidePageRecord;
};

const DISCLAIMER =
  'This is general information, not a diagnosis. Contact your vet for anything urgent or unclear.';

function urgencyClass(level: SymptomRecord['urgency_level']): string {
  if (level === 'emergency') return styles.bannerEmergency;
  if (level === 'urgent') return styles.bannerUrgent;
  return styles.bannerMonitor;
}

function urgencyLabel(level: SymptomRecord['urgency_level']): string {
  if (level === 'emergency') return 'Emergency — time-sensitive';
  if (level === 'urgent') return 'Urgent — same-day veterinary guidance';
  return 'Monitor — watch closely and track patterns';
}

function breedLabel(slug: string): string {
  return getBreedBySlug(slug)?.name ?? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function renderGeneratedBody(page: SymptomGuidePageRecord): ReactNode {
  return (
    <>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
          {section.bullets && section.bullets.length > 0 ? (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.breedLinks && section.breedLinks.length > 0 ? (
            <ul>
              {section.breedLinks.map((slug) => {
                const href = resolveBreedHealthHref(slug, 'adult');
                if (!href) return null;
                return (
                  <li key={slug}>
                    <Link to={href}>{breedLabel(slug)} health guide</Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {section.emergencySlug ? (
            (() => {
              const href = resolveEmergencyHref(section.emergencySlug);
              if (!href) return null;
              return (
                <p>
                  <Link to={href}>
                    Open emergency guide: {section.emergencySlug.replace(/-/g, ' ')}
                  </Link>
                </p>
              );
            })()
          ) : null}
        </section>
      ))}
    </>
  );
}

export function SymptomGuideTemplate({
  symptom,
  path,
  primaryKeyword,
  metaDescription,
  body,
  faqs,
  ctaHref = ROUTES.SIGNUP,
  h1,
  lead,
  disclaimer = DISCLAIMER,
  page,
}: SymptomGuideTemplateProps) {
  const speciesHref = `/symptoms/${symptom.species === 'both' ? 'dog' : symptom.species}`;
  const resolvedLead =
    lead ??
    (page?.lead || `Urgency: ${symptom.urgency_level} · Species: ${symptom.species}`);
  const resolvedBody = page ? renderGeneratedBody(page) : body;
  const resolvedFaqs = faqs ?? page?.faqs;
  const emergencySlug =
    page?.related_emergency_slug ||
    (symptom.urgency_level === 'emergency' ? symptom.related_emergency_slug : undefined);

  return (
    <ContentTemplateShell
      meta={buildContentMeta({ primaryKeyword, description: metaDescription, path })}
      breadcrumbs={[
        { label: 'Home', href: ROUTES.LANDING },
        { label: 'Symptoms', href: '/symptoms' },
        {
          label: symptom.species === 'cat' ? 'Cat' : symptom.species === 'dog' ? 'Dog' : 'Pets',
          href: speciesHref,
        },
        { label: h1 ?? symptom.name },
      ]}
      h1={h1 ?? symptom.name}
      dataTitle="Symptom facts from the record"
      dataRows={[
        { label: 'Species', value: symptom.species },
        { label: 'Urgency', value: symptom.urgency_level },
        {
          label: 'Related breed predispositions',
          value:
            symptom.related_breed_predispositions.length > 0
              ? symptom.related_breed_predispositions.map(breedLabel).join(', ')
              : 'None listed',
        },
        ...(emergencySlug
          ? [{ label: 'Related emergency guide', value: emergencySlug }]
          : []),
      ]}
      dataLists={[
        { heading: 'Common causes', items: symptom.common_causes },
        { heading: 'See a vet immediately if', items: symptom.when_to_see_vet_immediately },
      ]}
      body={
        <>
          <aside
            className={`${styles.banner} ${urgencyClass(symptom.urgency_level)}`}
            role="status"
            aria-label={`Urgency: ${symptom.urgency_level}`}
          >
            <strong className={styles.bannerLabel}>{urgencyLabel(symptom.urgency_level)}</strong>
            <p className={styles.bannerText}>{resolvedLead}</p>
          </aside>

          <p className={styles.disclaimer} role="note">
            {disclaimer}
          </p>

          {resolvedBody}

          {symptom.related_breed_predispositions.length > 0 && !page ? (
            <section>
              <h2>Breed predispositions</h2>
              <ul>
                {symptom.related_breed_predispositions.map((slug) => {
                  const href = resolveBreedHealthHref(slug, 'adult');
                  if (!href) return null;
                  return (
                    <li key={slug}>
                      <Link to={href}>{breedLabel(slug)} health guide</Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {emergencySlug && !page ? (
            (() => {
              const href = resolveEmergencyHref(emergencySlug);
              if (!href) return null;
              return (
                <section>
                  <h2>Related emergency guide</h2>
                  <p>
                    <Link to={href}>Step-by-step: {emergencySlug.replace(/-/g, ' ')}</Link>
                  </p>
                </section>
              );
            })()
          ) : null}

          {!page ? (
            <p>
              Logging symptoms over time helps you and your vet spot patterns — that&apos;s what
              PetClues&apos; health timeline is for.
            </p>
          ) : null}

          <p className={styles.disclaimerFooter} role="note">
            {disclaimer}
          </p>
        </>
      }
      cta={{
        variant: 'trial',
        headline: 'Log symptoms with dates, not memory',
        subtext: 'Start a free trial to keep a timeline your vet can actually use.',
        buttonText: 'Start free trial',
        href: ctaHref,
      }}
      related={getSymptomGuideRelated(symptom, page)}
      relatedHeading="Related guides"
      faqs={resolvedFaqs}
      medicalReview
    />
  );
}
