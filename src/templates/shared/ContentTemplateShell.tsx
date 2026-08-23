import type { ReactNode } from 'react';
import { MetaTags } from '@/seo/MetaTags';
import type { SEOConfig } from '@/data/seoConfig';
import {
  Breadcrumbs,
  CTABlock,
  ContinueReadingStrip,
  ContentEngagementBar,
  MedicalReviewByline,
  RelatedLinks,
  SchemaMarkup,
  type BreadcrumbPathItem,
  type CTABlockProps,
  type RelatedLinkItem,
} from '@/components/content';
import { buildMedicalWebPageSchema } from '@/seo/medicalWebPageSchema';
import { getPrimaryMedicalReviewer, MEDICAL_CONTENT_LAST_REVIEWED } from '@/data/editorialBoard';
import { buildReviewedBySchema } from '@/seo/buildPersonSchema';
import { ROUTES } from '@/routes/paths';
import { DataFacts, type DataFactRow } from './DataFacts';
import styles from './ContentTemplateShell.module.css';

export type ContentFaq = {
  question: string;
  answer: string;
};

export type ContentTemplateShellProps = {
  meta: Pick<SEOConfig, 'title' | 'description' | 'canonical' | 'ogTitle' | 'ogDescription' | 'ogType'>;
  breadcrumbs: BreadcrumbPathItem[];
  h1: string;
  lead?: string;
  dataTitle: string;
  dataRows: DataFactRow[];
  dataLists?: { heading: string; items: string[] }[];
  body: ReactNode;
  cta: CTABlockProps;
  related: RelatedLinkItem[];
  relatedHeading?: string;
  faqs?: ContentFaq[];
  afterCta?: ReactNode;
  /** Optional slot rendered between body and CTA for mid-content nudges. */
  engagementNudge?: ReactNode;
  /** Show/hide the sticky engagement bottom bar. Defaults true for indexed pages. */
  engagementBar?: boolean;
  /** Example routes stay noIndex; production content pillars set false. */
  noIndex?: boolean;
  /** Enable medical review byline + MedicalWebPage schema. Default false. */
  medicalReview?: boolean | { lastReviewed?: string };
};

export function ContentTemplateShell({
  meta,
  breadcrumbs,
  h1,
  lead,
  dataTitle,
  dataRows,
  dataLists,
  body,
  cta,
  related,
  relatedHeading,
  faqs,
  afterCta,
  engagementNudge,
  engagementBar,
  noIndex = true,
  medicalReview = false,
}: ContentTemplateShellProps) {
  const medicalReviewEnabled = !!medicalReview;
  const medicalLastReviewed =
    typeof medicalReview === 'object' && medicalReview.lastReviewed
      ? medicalReview.lastReviewed
      : MEDICAL_CONTENT_LAST_REVIEWED;

  const medicalSchema = medicalReviewEnabled
    ? buildMedicalWebPageSchema({
        url: meta.canonical ?? '',
        name: meta.title ?? h1,
        description: meta.description ?? '',
        lastReviewed: medicalLastReviewed,
        reviewedBy: buildReviewedBySchema(getPrimaryMedicalReviewer()),
      })
    : null;

  const showEngagementBar = engagementBar ?? !noIndex;

  const faqSchema =
    faqs && faqs.length > 0
      ? {
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <MetaTags config={{ ...meta, noIndex }} />
      {faqSchema ? <SchemaMarkup type="FAQPage" data={faqSchema} /> : null}
      {medicalSchema ? <SchemaMarkup type="MedicalWebPage" data={medicalSchema} /> : null}

      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs path={breadcrumbs} />
          <header className={styles.hero}>
            <h1 className={styles.h1}>{h1}</h1>
            {lead ? <p className={styles.lead}>{lead}</p> : null}
          </header>

          {medicalReviewEnabled ? (
            <MedicalReviewByline
              lastReviewed={medicalLastReviewed}
              variant="health"
            />
          ) : null}

          <DataFacts title={dataTitle} rows={dataRows} lists={dataLists} />

          <div className={styles.body}>{body}</div>

          {engagementNudge ? (
            <aside className={styles.nudge}>{engagementNudge}</aside>
          ) : !noIndex ? (
            <aside className={styles.nudge}>
              <p className={styles.nudgeText}>
                Save this guide to your pet's vault.{' '}
                <a href={ROUTES.SIGNUP} className={styles.nudgeLink}>
                  Create a free account
                </a>
              </p>
            </aside>
          ) : null}

          <div className={styles.ctaWrap}>
            <CTABlock {...cta} />
          </div>

          {afterCta}

          {faqs && faqs.length > 0 ? (
            <section className={styles.faq} aria-label="FAQ">
              <h2 className={styles.faqTitle}>FAQ</h2>
              <dl className={styles.faqList}>
                {faqs.map((faq) => (
                  <div key={faq.question} className={styles.faqItem}>
                    <dt>{faq.question}</dt>
                    <dd>{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <RelatedLinks items={related} heading={relatedHeading} />

          <ContinueReadingStrip items={related} heading="Next up" />
        </div>
      </div>

      {showEngagementBar && related.length > 0 ? (
        <ContentEngagementBar nextItem={related[0]} />
      ) : null}
    </>
  );
}
