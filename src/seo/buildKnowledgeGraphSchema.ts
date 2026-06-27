import type {
  KnowledgeGraphConfig,
  KnowledgeGraphEntity,
} from '@/data/knowledgeGraphBlogEntities';
import {
  buildOrganizationSchema,
  buildSchemaGraph,
  buildWebSiteSchema,
  WEBSITE_ID,
} from '@/seo/structuredDataSchemas';

function wikidataUri(wikidataId: string): string {
  return `https://www.wikidata.org/wiki/${wikidataId}`;
}

function buildEntityNode(entity: KnowledgeGraphEntity, pageUrl: string) {
  const entityId = `${pageUrl}#entity-${entity.wikidataId}`;
  const sameAs = wikidataUri(entity.wikidataId);

  if (entity.icdCode) {
    return {
      '@type': 'MedicalCondition' as const,
      '@id': entityId,
      name: entity.name,
      description: entity.description,
      sameAs,
      code: {
        '@type': 'MedicalCode' as const,
        code: entity.icdCode,
        codingSystem: 'ICD-10',
      },
    };
  }

  return {
    '@type': 'Thing' as const,
    '@id': entityId,
    name: entity.name,
    description: entity.description,
    sameAs,
  };
}

/** Builds a Wikidata-anchored @graph for deep entity SEO on clinical blog posts. */
export function buildKnowledgeGraphSchema(config: KnowledgeGraphConfig) {
  const entityNodes = config.entities.map((entity) =>
    buildEntityNode(entity, config.pageUrl),
  );
  const entityRefs = entityNodes.map((node) => ({ '@id': node['@id'] }));

  return buildSchemaGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    {
      '@type': 'MedicalWebPage',
      '@id': `${config.pageUrl}#webpage`,
      url: config.pageUrl,
      name: config.pageTitle,
      about: entityRefs,
      mentions: entityRefs,
      isPartOf: { '@id': WEBSITE_ID },
    },
    ...entityNodes,
  );
}
