import type { BlogPost } from '@/types/blog';
import { LONG_FORM_BLOG_CONTENT } from './longFormBlogContent';

/** Prefer long-form SEO article body when available */
export function applyLongFormContent(post: BlogPost): BlogPost {
  const longForm = LONG_FORM_BLOG_CONTENT[post.slug];
  if (!longForm) return post;
  return { ...post, content: longForm };
}

export function applyLongFormToPosts(posts: BlogPost[]): BlogPost[] {
  return posts.map(applyLongFormContent);
}
