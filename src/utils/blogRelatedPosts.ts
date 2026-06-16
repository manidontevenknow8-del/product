import type { BlogPost, BlogPostListItem } from '@/types/blog';

export function getRelatedBlogPosts(
  current: Pick<BlogPost, 'slug' | 'category' | 'tags'>,
  candidates: BlogPostListItem[],
  limit = 3,
): BlogPostListItem[] {
  return candidates
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => current.tags.includes(tag)).length;
      const score = (post.category === current.category ? 3 : 0) + sharedTags;
      return { post, score };
    })
    .sort((a, b) => b.score - a.score || a.post.title.localeCompare(b.post.title))
    .slice(0, limit)
    .map(({ post }) => post);
}
