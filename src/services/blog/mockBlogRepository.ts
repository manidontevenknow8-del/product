import type { BlogPost, BlogPostListItem } from '@/types/blog';
import type { BlogRepository } from './blogRepository';
import { applyLongFormContent } from './applyLongFormContent';
import { MOCK_BLOG_POSTS } from './mockBlogPosts';

function toListItem(post: BlogPost): BlogPostListItem {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags,
    author: post.author,
    publishedAt: post.publishedAt,
    featuredImage: post.featuredImage,
  };
}

function sortByPublished(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}

export const mockBlogRepository: BlogRepository = {
  async listPublished(filters) {
    let posts = sortByPublished(MOCK_BLOG_POSTS.filter((p) => p.status === 'published'));

    if (filters?.category) {
      posts = posts.filter((p) => p.category === filters.category);
    }
    if (filters?.tag) {
      const tag = filters.tag.toLowerCase();
      posts = posts.filter((p) => p.tags.some((t) => t.toLowerCase() === tag));
    }
    if (filters?.limit) {
      posts = posts.slice(0, filters.limit);
    }

    return posts.map(toListItem);
  },

  async getPublishedBySlug(slug) {
    const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug && p.status === 'published');
    return post ? applyLongFormContent(post) : null;
  },
};
