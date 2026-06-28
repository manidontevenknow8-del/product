import { useMemo } from 'react';
import { buildFaqPageSchema } from '@/seo/structuredDataSchemas';
import type { GeneratedFaqItem } from '@/types/generatedFaqs';

export type DynamicFAQProps = {
  faqs: GeneratedFaqItem[];
  /** Canonical page URL for FAQPage @id — optional but recommended */
  pageUrl?: string;
};

function serializeFaqPageSchema(faqs: GeneratedFaqItem[], pageUrl?: string): string {
  const schema = {
    '@context': 'https://schema.org',
    ...buildFaqPageSchema(faqs, pageUrl ? `${pageUrl}#faq` : undefined),
  };

  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

/**
 * FAQPage JSON-LD in the DOM plus human-readable editorial FAQ block.
 * Crawlers read the inline script instantly via prerender / edge bot routing.
 */
export function DynamicFAQ({ faqs, pageUrl }: DynamicFAQProps) {
  const schemaJson = useMemo(() => {
    if (!faqs || faqs.length === 0) return null;
    return serializeFaqPageSchema(faqs, pageUrl);
  }, [faqs, pageUrl]);

  if (!faqs || faqs.length === 0 || !schemaJson) return null;

  return (
    <div className="mt-16 border-t border-zinc-200 pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJson }}
      />

      <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-8 font-mono">
        [ Clinical Inquiries ]
      </h3>

      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question} className="border-b border-zinc-100 pb-6 last:border-0">
            <h4 className="font-serif text-lg md:text-xl text-zinc-900 mb-3 tracking-tight">
              {faq.question}
            </h4>
            <p className="font-sans text-sm text-zinc-500 leading-relaxed max-w-3xl">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Standalone FAQPage object for prerender head injection when needed. */
export function buildDynamicFaqPageSchema(faqs: GeneratedFaqItem[], pageUrl: string) {
  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    ...buildFaqPageSchema(faqs, `${pageUrl}#faq`),
  };
}
