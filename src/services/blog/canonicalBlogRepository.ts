import type { BlogRepository } from './blogRepository';
import { mockBlogRepository } from './mockBlogRepository';
import { supabaseBlogRepository } from './supabaseBlogRepository';
import { isSupabaseConfigured } from '@/services/supabase/config';

/**
 * Mock catalog holds all 26 SEO articles with long-form content.
 * Supabase seed may only include 6 legacy rows — mock is canonical for listing.
 */
export const canonicalBlogRepository: BlogRepository = {
  listPublished(filters) {
    return mockBlogRepository.listPublished(filters);
  },

  async getPublishedBySlug(slug) {
    const mock = await mockBlogRepository.getPublishedBySlug(slug);
    if (mock) return mock;

    if (isSupabaseConfigured()) {
      return supabaseBlogRepository.getPublishedBySlug(slug);
    }

    return null;
  },
};
