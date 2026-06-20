import type { BlogPost } from '@/types/blog';

/** Ensure every blog post has stable ISO dates for schema and sitemap. */
export function normalizeBlogPostDates(post: BlogPost): BlogPost {
  const fallback = post.createdAt ?? new Date().toISOString();
  const publishedAt = post.publishedAt ?? fallback;
  const updatedAt = post.updatedAt ?? publishedAt;

  return {
    ...post,
    publishedAt,
    updatedAt,
  };
}

export function normalizeBlogPosts(posts: BlogPost[]): BlogPost[] {
  return posts.map(normalizeBlogPostDates);
}
