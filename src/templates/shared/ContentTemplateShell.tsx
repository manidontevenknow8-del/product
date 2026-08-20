import type { ReactNode } from 'react';
import { MetaTags } from '@/seo/MetaTags';
import type { SEOConfig } from '@/data/seoConfig';
import {
  Breadcrumbs,
  CTABlock,
  RelatedLinks,
  SchemaMarkup,
  type BreadcrumbPathItem,
  type CTABlockProps,
  type RelatedLinkItem,
} from '@/components/content';
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
  /** Example routes stay noIndex; production content pillars set false. */
  noIndex?: boolean;
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
  noIndex = true,
}: ContentTemplateShellProps) {
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

      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs path={breadcrumbs} />
          <header className={styles.hero}>
            <h1 className={styles.h1}>{h1}</h1>
            {lead ? <p className={styles.lead}>{lead}</p> : null}
          </header>

          <DataFacts title={dataTitle} rows={dataRows} lists={dataLists} />

          <div className={styles.body}>{body}</div>

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
        </div>
      </div>
    </>
  );
}
