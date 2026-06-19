import type { BlogPost } from '@/types/blog';
import { expandLegacyBlogContent } from './blogLegacyExpansion';
import { LONG_FORM_BLOG_CONTENT } from './longFormBlogContent';

/** Prefer hand-written long-form SEO body when available (no filler padding). */
export function applyLongFormContent(post: BlogPost): BlogPost {
  const longForm = LONG_FORM_BLOG_CONTENT[post.slug];
  if (!longForm) return post;

  return { ...post, content: expandLegacyBlogContent(post.slug, longForm) };
}

export function applyLongFormToPosts(posts: BlogPost[]): BlogPost[] {
  return posts.map(applyLongFormContent);
}
