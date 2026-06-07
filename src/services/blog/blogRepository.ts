import type {
  BlogListFilters,
  BlogPost,
  BlogPostListItem,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from '@/types/blog';

/**
 * CMS repository contract — swap Supabase for headless CMS (Sanity, Contentful, etc.)
 * without changing pages or SEO components.
 */
export interface BlogRepository {
  listPublished(filters?: BlogListFilters): Promise<BlogPostListItem[]>;
  getPublishedBySlug(slug: string): Promise<BlogPost | null>;
  /** Future admin CMS — not exposed in public UI yet */
  create?(input: CreateBlogPostInput): Promise<BlogPost>;
  update?(id: string, input: UpdateBlogPostInput): Promise<BlogPost>;
  delete?(id: string): Promise<void>;
}
