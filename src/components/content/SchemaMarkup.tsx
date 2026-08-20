import { useMemo } from 'react';

export type SchemaMarkupType = 'Article' | 'FAQPage';

export type SchemaMarkupProps = {
  type: SchemaMarkupType;
  /** JSON-LD object without @context (added automatically) or a full graph. */
  data: Record<string, unknown>;
};

function withContext(type: SchemaMarkupType, data: Record<string, unknown>) {
  if (data['@context'] || data['@graph']) {
    return data;
  }
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
}

/** Outputs a JSON-LD script tag for Article or FAQPage schemas. */
export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const json = useMemo(() => JSON.stringify(withContext(type, data)), [type, data]);

  return (
    <script
      type="application/ld+json"
      // Content agents pass structured data; stringify is the only transform.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
