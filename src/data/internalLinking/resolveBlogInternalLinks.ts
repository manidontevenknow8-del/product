import type { BlogCategoryId } from '@/data/blogCategories';
import { getFaqItemBySlug } from '@/data/faq';
import { listFaqItems } from '@/data/faq';
import { getLearnArticleBySlug } from '@/data/learn';
import { listLearnArticles } from '@/data/learn';
import { ROUTES } from '@/routes/paths';
import {
  LANDING_SECTIONS,
  faqCategoryForBlog,
  inferBlogCluster,
  learnCategoryForBlog,
} from './mappings';
import { commercialLinkForCluster } from './commercialMappings';
import { hubPoolForCluster } from './hubMappings';
import type { BlogInternalLinkPlan, BlogLinkCandidate, InternalLink } from './types';

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickAt<T>(items: T[], slug: string, salt = ''): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from empty list');
  }
  const index = stableHash(`${slug}:${salt}`) % items.length;
  return items[index]!;
}

export function scoreRelatedBlog(
  current: BlogLinkCandidate,
  candidate: BlogLinkCandidate,
): number {
  if (candidate.slug === current.slug) return -1;

  const sharedTags = candidate.tags.filter((tag) => current.tags.includes(tag)).length;
  const sameCategory = candidate.category === current.category ? 3 : 0;
  const sameCluster =
    current.cluster && candidate.cluster && candidate.cluster === current.cluster ? 2 : 0;

  return sameCategory + sameCluster + sharedTags;
}

export function pickRelatedBlogs(
  current: BlogLinkCandidate,
  candidates: BlogLinkCandidate[],
  limit = 3,
): BlogLinkCandidate[] {
  const ranked = candidates
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => ({ candidate, score: scoreRelatedBlog(current, candidate) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.candidate.slug.localeCompare(b.candidate.slug);
    });

  const picked: BlogLinkCandidate[] = [];
  const seen = new Set<string>();

  for (const entry of ranked) {
    if (picked.length >= limit) break;
    if (seen.has(entry.candidate.slug)) continue;
    seen.add(entry.candidate.slug);
    picked.push(entry.candidate);
  }

  if (picked.length < limit) {
    const sorted = candidates
      .filter((candidate) => candidate.slug !== current.slug && !seen.has(candidate.slug))
      .sort((a, b) => a.slug.localeCompare(b.slug));

    for (const candidate of sorted) {
      if (picked.length >= limit) break;
      picked.push(candidate);
    }
  }

  return picked.slice(0, limit);
}

function toBlogLink(candidate: BlogLinkCandidate): InternalLink {
  return {
    kind: 'blog',
    label: candidate.title,
    href: `${ROUTES.BLOG}/${candidate.slug}`,
  };
}

function toLearnLink(slug: string): InternalLink {
  const article = getLearnArticleBySlug(slug);
  return {
    kind: 'learn',
    label: article?.title.replace(' | PetClues Learn', '') ?? slug.replace(/-/g, ' '),
    href: `${ROUTES.LEARN}/${slug}`,
  };
}

function toFaqLink(slug: string): InternalLink {
  const item = getFaqItemBySlug(slug);
  return {
    kind: 'faq',
    label: item?.question ?? slug.replace(/-/g, ' '),
    href: `${ROUTES.FAQ}/${slug}`,
  };
}

export function resolveBlogInternalLinks(
  post: {
    slug: string;
    title: string;
    category: BlogCategoryId;
    tags: string[];
  },
  allPosts: BlogLinkCandidate[],
): BlogInternalLinkPlan {
  const cluster = inferBlogCluster(post.category, post.tags);
  const current: BlogLinkCandidate = {
    slug: post.slug,
    title: post.title,
    category: post.category,
    tags: post.tags,
    cluster,
  };

  const relatedBlogs = pickRelatedBlogs(current, allPosts, 3).map(toBlogLink);

  const learnCategory = learnCategoryForBlog(post.category, cluster);
  const learnCandidates = listLearnArticles({ category: learnCategory }).map((article) => article.slug);
  const allLearn = listLearnArticles().map((article) => article.slug);
  const learnPool = learnCandidates.length > 0 ? learnCandidates : allLearn;
  const learnSlug = pickAt(learnPool.sort(), post.slug, 'learn');

  const faqCategory = faqCategoryForBlog(post.category, cluster);
  const faqCandidates = listFaqItems({ category: faqCategory }).map((item) => item.slug);
  const allFaq = listFaqItems().map((item) => item.slug);
  const faqPool = faqCandidates.length > 0 ? faqCandidates : allFaq;
  const faqSlug = pickAt(faqPool.sort(), post.slug, 'faq');

  const homepageSection = pickAt([...LANDING_SECTIONS], post.slug, 'home');
  const commercial = commercialLinkForCluster(cluster);
  const hubTarget = pickAt(hubPoolForCluster(cluster), post.slug, 'hub');

  return {
    slug: post.slug,
    blogs: relatedBlogs,
    learn: toLearnLink(learnSlug),
    faq: toFaqLink(faqSlug),
    pricing: {
      kind: 'pricing',
      label: 'PetClues pricing',
      href: ROUTES.PRICING,
    },
    commercial: {
      kind: 'commercial',
      label: commercial.label,
      href: commercial.href,
    },
    hub: {
      kind: 'hub',
      label: hubTarget.label,
      href: hubTarget.href,
    },
    homepage: {
      kind: 'homepage',
      label: homepageSection.label,
      href: homepageSection.path,
    },
  };
}

export function formatBlogInternalLinksMarkdown(plan: BlogInternalLinkPlan): string {
  const lines = [
    '## Keep exploring',
    '',
    '**Related articles**',
    ...plan.blogs.map((link) => `- [${link.label}](${link.href})`),
    '',
    '**Knowledge base**',
    `- [${plan.learn.label}](${plan.learn.href})`,
    '',
    '**FAQ**',
    `- [${plan.faq.label}](${plan.faq.href})`,
    '',
    '**Guides & tools**',
    `- [${plan.hub.label}](${plan.hub.href})`,
    '',
    '**Product**',
    `- [${plan.commercial.label}](${plan.commercial.href})`,
    `- [${plan.pricing.label}](${plan.pricing.href})`,
    `- [${plan.homepage.label}](${plan.homepage.href})`,
  ];

  return lines.join('\n');
}
