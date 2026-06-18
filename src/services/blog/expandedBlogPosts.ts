import type { BlogPost } from '@/types/blog';
import {
  buildBlogArticleMarkdownWithMinWords,
  countBlogWords,
} from './buildBlogArticle';
import { EXPANDED_BLOG_CONFIGS } from './expandedBlogConfigs';
import { attachBlogImages } from './attachBlogImages';

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

const EXPANDED_BLOG_CANDIDATES = EXPANDED_BLOG_CONFIGS.map((config) => ({
  slug: config.slug,
  title: config.title,
  category: config.category,
  tags: config.tags,
  cluster: config.cluster,
}));

const EXPANDED_BLOG_POSTS_RAW: BlogPost[] = EXPANDED_BLOG_CONFIGS.map((config, index) => {
  const content = buildBlogArticleMarkdownWithMinWords(config, 1500, EXPANDED_BLOG_CANDIDATES);
  const wordCount = countBlogWords(content);

  if (wordCount < 1500) {
    throw new Error(`Blog article ${config.slug} is only ${wordCount} words`);
  }

  return {
    id: `expanded-${index + 1}`,
    title: config.title,
    slug: config.slug,
    excerpt: config.excerpt,
    content,
    category: config.category,
    tags: config.tags,
    author: 'PetClues Team',
    publishedAt: daysAgo(27 + index),
    featuredImage: '',
    status: 'published' as const,
    createdAt: daysAgo(27 + index),
    updatedAt: daysAgo(Math.max(1, index % 14)),
  };
});

export const EXPANDED_BLOG_POSTS: BlogPost[] = attachBlogImages(EXPANDED_BLOG_POSTS_RAW);

if (EXPANDED_BLOG_POSTS.length !== 74) {
  throw new Error(`Expected 74 expanded blog posts, got ${EXPANDED_BLOG_POSTS.length}`);
}
