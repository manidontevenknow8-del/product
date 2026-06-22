import { BLOG_CATEGORIES, type BlogCategoryId } from '@/data/blogCategories';
import { ROUTES } from '@/routes/paths';
import { canonicalBlogRepository } from '@/services/blog/canonicalBlogRepository';
import type { PrerenderRouteData } from './types';

function parseBlogCategory(value: string | null): BlogCategoryId | undefined {
  if (!value) return undefined;
  return BLOG_CATEGORIES.some((category) => category.id === value)
    ? (value as BlogCategoryId)
    : undefined;
}

export async function loadPrerenderData(
  pathname: string,
  search: string,
): Promise<PrerenderRouteData> {
  if (pathname === ROUTES.BLOG) {
    const params = new URLSearchParams(search);
    const category = parseBlogCategory(params.get('category'));
    const tag = params.get('tag') ?? undefined;
    const query = params.get('q') ?? undefined;

    const posts = await canonicalBlogRepository.listPublished({
      ...(category ? { category } : {}),
      ...(tag ? { tag } : {}),
      ...(query ? { search: query } : {}),
    });

    return { blogIndex: { posts } };
  }

  if (pathname.startsWith(`${ROUTES.BLOG}/`)) {
    const slug = pathname.slice(ROUTES.BLOG.length + 1).replace(/\/$/, '');
    if (!slug || slug.includes('/')) {
      return {};
    }

    const [post, allPosts] = await Promise.all([
      canonicalBlogRepository.getPublishedBySlug(slug),
      canonicalBlogRepository.listPublished(),
    ]);

    return { blogPost: { slug, post, allPosts } };
  }

  return {};
}
