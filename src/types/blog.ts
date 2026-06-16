import type { BlogCategoryId } from '@/data/blogCategories';

export type BlogPostStatus = 'draft' | 'published';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: BlogCategoryId;
  tags: string[];
  author: string;
  publishedAt: string | null;
  featuredImage: string | null;
  status: BlogPostStatus;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostListItem = Pick<
  BlogPost,
  'id' | 'title' | 'slug' | 'excerpt' | 'category' | 'tags' | 'author' | 'publishedAt' | 'featuredImage'
>;

export type BlogListFilters = {
  category?: BlogCategoryId;
  tag?: string;
  search?: string;
  limit?: number;
};

export type CreateBlogPostInput = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: BlogCategoryId;
  tags?: string[];
  author?: string;
  publishedAt?: string | null;
  featuredImage?: string | null;
  status?: BlogPostStatus;
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;
