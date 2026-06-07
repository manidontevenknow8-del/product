import { getBlogImageForSlug } from '@/data/blogImages';

/** Each article has a dedicated local hero image keyed by slug */
export function resolveBlogFeaturedImage(
  slug: string,
  _featuredImage: string | null,
): string {
  return getBlogImageForSlug(slug);
}
