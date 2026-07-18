import { useMemo } from 'react';
import type { KnowledgeGraphConfig } from '@/data/knowledgeGraphBlogEntities';
import { buildKnowledgeGraphSchema } from '@/seo/buildKnowledgeGraphSchema';
import { useJsonLd } from '@/seo/useJsonLd';

export type KnowledgeGraphProps = KnowledgeGraphConfig;

/**
 * Injects a deep entity @graph into document head (JSON-LD).
 * Wikidata sameAs + optional ICD-10 codes for medical entity disambiguation.
 */
export function KnowledgeGraph({ pageTitle, pageUrl, pageDescription, entities }: KnowledgeGraphProps) {
  const schema = useMemo(
    () => buildKnowledgeGraphSchema({ pageTitle, pageUrl, pageDescription, entities }),
    [pageTitle, pageUrl, pageDescription, entities],
  );

  const scriptId = useMemo(() => {
    try {
      return `knowledge-graph${new URL(pageUrl).pathname.replace(/\//g, '-')}`;
    } catch {
      return 'knowledge-graph';
    }
  }, [pageUrl]);

  useJsonLd(scriptId, schema);

  return null;
}
