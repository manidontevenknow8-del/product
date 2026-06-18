import type { LearnArticle, LearnArticleListItem } from '@/types/learn';
import type { LearnCategoryId } from './categories';
import { buildLearnArticle } from './buildArticle';
import { LEARN_ARTICLE_CONFIGS } from './articleConfigs';

const LEARN_ARTICLES: LearnArticle[] = LEARN_ARTICLE_CONFIGS.map(buildLearnArticle);

const BY_SLUG = new Map(LEARN_ARTICLES.map((article) => [article.slug, article]));

export function listLearnArticles(filters?: {
  category?: LearnCategoryId;
}): LearnArticleListItem[] {
  let articles = LEARN_ARTICLES;

  if (filters?.category) {
    articles = articles.filter((a) => a.categoryId === filters.category);
  }

  return articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    categoryId: article.categoryId,
    excerpt: article.excerpt,
    metaDescription: article.metaDescription,
    updatedAt: article.updatedAt,
    readMinutes: article.readMinutes,
  }));
}

export function getLearnArticleBySlug(slug: string): LearnArticle | null {
  return BY_SLUG.get(slug) ?? null;
}

export function getRelatedLearnArticles(article: LearnArticle, limit = 4): LearnArticle[] {
  const picked = new Set<string>();
  const related: LearnArticle[] = [];

  for (const relatedSlug of article.relatedSlugs) {
    const match = BY_SLUG.get(relatedSlug);
    if (match && !picked.has(match.slug)) {
      picked.add(match.slug);
      related.push(match);
    }
    if (related.length >= limit) return related;
  }

  for (const candidate of LEARN_ARTICLES) {
    if (candidate.slug === article.slug || picked.has(candidate.slug)) continue;
    if (candidate.categoryId !== article.categoryId) continue;
    related.push(candidate);
    if (related.length >= limit) break;
  }

  for (const candidate of LEARN_ARTICLES) {
    if (candidate.slug === article.slug || picked.has(candidate.slug)) continue;
    related.push(candidate);
    if (related.length >= limit) break;
  }

  return related;
}

export const LEARN_ARTICLE_COUNT = LEARN_ARTICLES.length;
