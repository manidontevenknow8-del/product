import type { BlogPost } from '@/types/blog';
import { countBlogWords } from './buildBlogArticle';
import { expandLegacyBlogContent } from './blogLegacyExpansion';
import { LONG_FORM_BLOG_CONTENT } from './longFormBlogContent';

/** Prefer long-form SEO article body when available; expand legacy articles to 1500+ words */
export function applyLongFormContent(post: BlogPost): BlogPost {
  const longForm = LONG_FORM_BLOG_CONTENT[post.slug];
  if (!longForm) return post;

  const content = expandLegacyBlogContent(post.slug, longForm);
  if (countBlogWords(content) < 1500) {
    throw new Error(`Legacy blog article ${post.slug} is under 1500 words after expansion`);
  }

  return { ...post, content };
}

export function applyLongFormToPosts(posts: BlogPost[]): BlogPost[] {
  return posts.map(applyLongFormContent);
}
