import type { GeneratedFaqItem, GeneratedFaqsMap } from '@/types/generatedFaqs';
import generatedFaqs from '@/data/generated-faqs.json';
import { extractBlogFaqs } from '@/services/blog/extractBlogFaqs';

const FAQS_BY_SLUG = generatedFaqs as GeneratedFaqsMap;

/** Generated LLM FAQs for a slug (empty array when none). */
export function getGeneratedFaqsForSlug(slug: string): GeneratedFaqItem[] {
  const items = FAQS_BY_SLUG[slug];
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) =>
      item &&
      typeof item.question === 'string' &&
      item.question.trim().length > 0 &&
      typeof item.answer === 'string' &&
      item.answer.trim().length > 0,
  );
}

/**
 * FAQs for schema injection: prefer generated (exactly 3 high-intent Q&As),
 * then markdown ## FAQ section, capped at 3 for FAQPage rich results.
 */
export function resolveBlogFaqs(slug: string, content: string): GeneratedFaqItem[] {
  const generated = getGeneratedFaqsForSlug(slug);
  if (generated.length >= 3) return generated.slice(0, 3);

  const fromMarkdown = extractBlogFaqs(content);
  if (fromMarkdown.length > 0) return fromMarkdown.slice(0, 3);

  return generated.slice(0, 3);
}

export function hasBlogFaqs(slug: string, content: string): boolean {
  return resolveBlogFaqs(slug, content).length > 0;
}
