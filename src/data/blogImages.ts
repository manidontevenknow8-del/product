import { resolveBlogHeroImagePath } from './blogHeroImageResolver';

/** @deprecated Use attachBlogImages / resolveBlogHeroImagePath with title and tags */
export function getBlogImageForSlug(slug: string): string {
  return resolveBlogHeroImagePath(slug, slug.replace(/-/g, ' '), []);
}
