import { useId, useState } from 'react';
import type { GeneratedFaqItem } from '@/types/generatedFaqs';
import { buildFaqPageSchema } from '@/seo/structuredDataSchemas';
import { JsonLd } from '@/seo/JsonLd';
import styles from './ClinicalFaqAccordion.module.css';

type ClinicalFaqAccordionProps = {
  faqs: GeneratedFaqItem[];
  pageUrl: string;
  heading?: string;
};

export function ClinicalFaqAccordion({
  faqs,
  pageUrl,
  heading = 'People also ask',
}: ClinicalFaqAccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs.length) return null;

  const schema = {
    '@context': 'https://schema.org' as const,
    ...buildFaqPageSchema(faqs, `${pageUrl}#faq`),
  };

  return (
    <section className={styles.section} aria-labelledby={`${baseId}-heading`}>
      <JsonLd id={`faq-${pageUrl.replace(/[^a-z0-9]+/gi, '-')}`} data={schema} />
      <p className={styles.kicker}>SERP-ready clinical FAQ</p>
      <h2 id={`${baseId}-heading`} className={styles.title}>
        {heading}
      </h2>
      <div className={styles.list}>
        {faqs.map((faq, index) => {
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-button-${index}`;
          const isOpen = openIndex === index;
          return (
            <div key={faq.question} className={styles.item}>
              <h3 className={styles.itemTitle}>
                <button
                  id={buttonId}
                  type="button"
                  className={styles.trigger}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className={styles.chevron} aria-hidden>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className={styles.panel}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
