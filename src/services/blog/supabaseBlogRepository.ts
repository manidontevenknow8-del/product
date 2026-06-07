import { getSupabaseClient } from '@/services/supabase/client';
import type { BlogPostRow } from '@/services/supabase/database.types';
import type { BlogPost, BlogPostListItem } from '@/types/blog';
import type { BlogCategoryId } from '@/data/blogCategories';
import type { BlogRepository } from './blogRepository';
import { applyLongFormContent } from './applyLongFormContent';

const LIST_COLUMNS =
  'id, title, slug, excerpt, category, tags, author, published_at, featured_image, status';

function mapRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category as BlogCategoryId,
    tags: row.tags ?? [],
    author: row.author,
    publishedAt: row.published_at,
    featuredImage: row.featured_image,
    status: row.status as BlogPost['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toListItem(row: Pick<
  BlogPostRow,
  'id' | 'title' | 'slug' | 'excerpt' | 'category' | 'tags' | 'author' | 'published_at' | 'featured_image'
>): BlogPostListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    category: row.category as BlogCategoryId,
    tags: row.tags ?? [],
    author: row.author,
    publishedAt: row.published_at,
    featuredImage: row.featured_image,
  };
}

export const supabaseBlogRepository: BlogRepository = {
  async listPublished(filters) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('blog_posts')
      .select(LIST_COLUMNS)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.tag) {
      query = query.contains('tags', [filters.tag]);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => toListItem(row as BlogPostRow));
  },

  async getPublishedBySlug(slug) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return applyLongFormContent(mapRow(data as BlogPostRow));
  },
};
