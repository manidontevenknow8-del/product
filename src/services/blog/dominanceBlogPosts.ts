import type { BlogPost } from '@/types/blog';
import { attachBlogImages } from './attachBlogImages';
import { countBlogWords } from './buildBlogArticle';
import {
  buildDominanceArticleWithMinWords,
} from './dominance/buildDominanceArticle';
import { DOMINANCE_TOPICS } from './dominance/topics.generated';
import { sanitizeBlogTypography } from './sanitizeBlogTypography';

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

const DOMINANCE_CANDIDATES = DOMINANCE_TOPICS.map((topic) => ({
  slug: topic.slug,
  title: topic.title,
  category: topic.category,
  tags: topic.tags,
}));

const DOMINANCE_BLOG_POSTS_RAW: BlogPost[] = DOMINANCE_TOPICS.map((topic, index) => {
  const content = sanitizeBlogTypography(
    buildDominanceArticleWithMinWords(topic, 1500, DOMINANCE_CANDIDATES),
  );
  const wordCount = countBlogWords(content);

  if (wordCount < 1500) {
    throw new Error(`Dominance article ${topic.slug} is only ${wordCount} words`);
  }

  return {
    id: `dominance-${topic.num}`,
    title: topic.title,
    slug: topic.slug,
    excerpt: topic.excerpt,
    content,
    category: topic.category,
    tags: topic.tags,
    author: 'PetClues Team',
    publishedAt: daysAgo(1 + index),
    featuredImage: '',
    status: 'published' as const,
    createdAt: daysAgo(1 + index),
    updatedAt: daysAgo(Math.max(1, index % 21)),
  };
});

export const DOMINANCE_BLOG_POSTS: BlogPost[] = attachBlogImages(DOMINANCE_BLOG_POSTS_RAW);

if (DOMINANCE_BLOG_POSTS.length !== 150) {
  throw new Error(`Expected 150 dominance blog posts, got ${DOMINANCE_BLOG_POSTS.length}`);
}
