/** LLM-generated FAQ pairs keyed by blog post slug. Regenerate via npm run generate:blog-faqs */
export type GeneratedFaqItem = {
  question: string;
  answer: string;
};

export type GeneratedFaqsMap = Record<string, GeneratedFaqItem[]>;
