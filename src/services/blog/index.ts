import type { BlogRepository } from './blogRepository';
import { canonicalBlogRepository } from './canonicalBlogRepository';
import { mockBlogRepository } from './mockBlogRepository';
import { supabaseBlogRepository } from './supabaseBlogRepository';

export type { BlogRepository } from './blogRepository';
export { mockBlogRepository, supabaseBlogRepository, canonicalBlogRepository };

/** Full catalog (26 posts) + long-form content; Supabase supplements slug lookup fallback */
export function getBlogRepository(): BlogRepository {
  return canonicalBlogRepository;
}
