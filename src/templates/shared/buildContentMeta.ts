import type { SEOConfig } from '@/data/seoConfig';
import { SITE_META } from '@/data/seoConfig';

/** "{Primary Keyword} | PetClues" and description capped under 160 chars. */
export function buildContentMeta(args: {
  primaryKeyword: string;
  description: string;
  path: string;
}): Pick<SEOConfig, 'title' | 'description' | 'canonical' | 'ogTitle' | 'ogDescription' | 'ogType'> {
  const title = `${args.primaryKeyword} | PetClues`;
  const description =
    args.description.length > 157 ? `${args.description.slice(0, 157).trim()}...` : args.description;

  return {
    title,
    description,
    canonical: `${SITE_META.siteUrl}${args.path}`,
    ogType: 'article',
    ogTitle: title,
    ogDescription: description,
  };
}
