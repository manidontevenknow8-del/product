/** Extract FAQ pairs from blog markdown (## FAQ section). */
export function extractBlogFaqs(content: string): { question: string; answer: string }[] {
  const faqStart = content.search(/^## FAQ\b/m);
  if (faqStart === -1) return [];

  const afterFaq = content.slice(faqStart);
  const nextSection = afterFaq.search(/^## (?!FAQ)/m);
  const faqBlock = nextSection === -1 ? afterFaq : afterFaq.slice(0, nextSection);

  const faqs: { question: string; answer: string }[] = [];
  const paragraphs = faqBlock.split('\n').map((line) => line.trim()).filter(Boolean);

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith('##')) continue;

    const prefixed = paragraph.match(/^\*\*Question\?\s*(.+?)\*\*\s*(.*)$/s);
    if (prefixed) {
      faqs.push({ question: prefixed[1].trim(), answer: prefixed[2].trim() });
      continue;
    }

    const classic = paragraph.match(/^\*\*(.+?)\*\*\s*(.*)$/s);
    if (classic && classic[1].trim().endsWith('?')) {
      faqs.push({ question: classic[1].trim(), answer: classic[2].trim() });
    }
  }

  return faqs;
}
