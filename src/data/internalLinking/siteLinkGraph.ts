import type { BlogCategoryId } from '@/data/blogCategories';
import { getComparisonBySlug, listComparisonPages } from '@/data/comparisons';
import { listFaqItems } from '@/data/faq';
import { getLearnArticleBySlug, listLearnArticles } from '@/data/learn';
import { listIntentPages } from '@/data/intent';
import { listProgrammaticPages } from '@/data/programmatic';
import { listProgrammaticCollections } from '@/data/programmatic/collections';
import { FOOTER_LAUNCH_LINKS } from '@/data/footerLinks';
import { ROUTES } from '@/routes/paths';
import type { BlogLinkCandidate } from './types';
import { resolveBlogInternalLinks } from './resolveBlogInternalLinks';

export type SiteNode = {
  path: string;
  label: string;
  section: string;
};

export type OrphanReport = {
  orphans: SiteNode[];
  inboundCounts: Map<string, number>;
  totalNodes: number;
  totalEdges: number;
};

function normalizePath(href: string): string {
  if (href.startsWith('http')) return href;
  if (href.startsWith('/#')) return '/';
  const path = href.split('?')[0] ?? href;
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function addEdge(inbound: Map<string, number>, from: string, to: string) {
  if (from === to) return;
  inbound.set(to, (inbound.get(to) ?? 0) + 1);
}

export function buildSiteLinkGraph(blogCandidates: BlogLinkCandidate[]): OrphanReport {
  const inbound = new Map<string, number>();
  const nodes: SiteNode[] = [];
  let edges = 0;

  const register = (path: string, label: string, section: string) => {
    nodes.push({ path, label, section });
    if (!inbound.has(path)) inbound.set(path, 0);
  };

  register(ROUTES.LANDING, 'Home', 'core');
  register(ROUTES.PRICING, 'Pricing', 'core');
  register(ROUTES.BLOG, 'Blog index', 'blog');
  register(ROUTES.LEARN, 'Learn index', 'learn');
  register(ROUTES.FAQ, 'FAQ index', 'faq');
  register(ROUTES.COMPARE, 'Compare index', 'compare');
  register(ROUTES.BEST, 'Best index', 'best');
  register(ROUTES.GUIDES, 'Guides hub', 'guides');

  for (const link of FOOTER_LAUNCH_LINKS) {
    register(link.to, link.label, 'footer');
  }

  for (const post of blogCandidates) {
    register(`${ROUTES.BLOG}/${post.slug}`, post.title, 'blog');
  }

  for (const article of listLearnArticles()) {
    register(`${ROUTES.LEARN}/${article.slug}`, article.title, 'learn');
  }

  for (const item of listFaqItems()) {
    register(`${ROUTES.FAQ}/${item.slug}`, item.question, 'faq');
  }

  for (const page of listComparisonPages()) {
    register(`${ROUTES.COMPARE}/${page.slug}`, page.title, 'compare');
  }

  for (const page of listIntentPages()) {
    register(`${ROUTES.BEST}/${page.slug}`, page.title, 'best');
  }

  for (const collection of listProgrammaticCollections()) {
    register(`${ROUTES.GUIDES}/${collection.id}`, collection.label, 'guides');
  }

  for (const page of listProgrammaticPages()) {
    register(`${ROUTES.GUIDES}/${page.collectionId}/${page.slug}`, page.subjectName, 'guides');
  }

  const connect = (from: string, href: string) => {
    const to = normalizePath(href);
    addEdge(inbound, from, to);
    edges += 1;
  };

  for (const post of blogCandidates) {
    const from = `${ROUTES.BLOG}/${post.slug}`;
    const plan = resolveBlogInternalLinks(
      {
        slug: post.slug,
        title: post.title,
        category: post.category as BlogCategoryId,
        tags: post.tags,
      },
      blogCandidates,
    );

    for (const link of plan.blogs) connect(from, link.href);
    connect(from, plan.learn.href);
    connect(from, plan.faq.href);
    connect(from, plan.pricing.href);
    connect(from, plan.homepage.href);
  }

  for (const post of blogCandidates) {
    connect(ROUTES.BLOG, `${ROUTES.BLOG}/${post.slug}`);
    connect(ROUTES.LANDING, `${ROUTES.BLOG}/${post.slug}`);
  }

  for (const article of listLearnArticles()) {
    const from = `${ROUTES.LEARN}/${article.slug}`;
    connect(ROUTES.LEARN, from);
    const full = getLearnArticleBySlug(article.slug);
    if (!full) continue;
    for (const slug of full.relatedSlugs) {
      connect(from, `${ROUTES.LEARN}/${slug}`);
    }
    for (const slug of full.relatedBlogSlugs) {
      connect(from, `${ROUTES.BLOG}/${slug}`);
    }
    for (const slug of full.relatedCompareSlugs) {
      connect(from, `${ROUTES.COMPARE}/${slug}`);
    }
  }

  for (const item of listFaqItems()) {
    const from = `${ROUTES.FAQ}/${item.slug}`;
    connect(ROUTES.FAQ, from);
    for (const slug of item.relatedBlogSlugs) {
      connect(from, `${ROUTES.BLOG}/${slug}`);
    }
    for (const slug of item.relatedLearnSlugs) {
      connect(from, `${ROUTES.LEARN}/${slug}`);
    }
  }

  for (const page of listComparisonPages()) {
    const from = `${ROUTES.COMPARE}/${page.slug}`;
    connect(ROUTES.COMPARE, from);
    const full = getComparisonBySlug(page.slug);
    if (!full) continue;
    for (const slug of full.relatedBlogSlugs) {
      connect(from, `${ROUTES.BLOG}/${slug}`);
    }
  }

  for (const page of listIntentPages()) {
    connect(ROUTES.BEST, `${ROUTES.BEST}/${page.slug}`);
  }

  for (const collection of listProgrammaticCollections()) {
    connect(ROUTES.GUIDES, `${ROUTES.GUIDES}/${collection.id}`);
    const pages = listProgrammaticPages(collection.id);
    for (const page of pages) {
      connect(`${ROUTES.GUIDES}/${collection.id}`, `${ROUTES.GUIDES}/${page.collectionId}/${page.slug}`);
    }
  }

  for (const link of FOOTER_LAUNCH_LINKS) {
    connect(ROUTES.LANDING, link.to);
  }

  const orphans = nodes.filter((node) => (inbound.get(node.path) ?? 0) === 0);

  return {
    orphans,
    inboundCounts: inbound,
    totalNodes: nodes.length,
    totalEdges: edges,
  };
}
