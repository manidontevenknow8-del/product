import type { DominanceTable } from './types';

export function formatMarkdownTable(table: DominanceTable): string {
  const header = `| ${table.headers.join(' | ')} |`;
  const separator = `| ${table.headers.map(() => '---').join(' | ')} |`;
  const rows = table.rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return `### ${table.title}\n\n${header}\n${separator}\n${rows}`;
}

export function formatImageBlock(src: string, alt: string, caption?: string): string {
  const cap = caption ? `\n*${caption}*` : '';
  return `![${alt}](${src})${cap}`;
}

export function injectInternalLinks(
  text: string,
  links: Array<{ phrase: string; slug: string }>,
): string {
  let result = String(text ?? '');
  const used = new Set<string>();

  for (const link of links) {
    if (used.has(link.slug)) continue;
    const pattern = new RegExp(`\\b(${escapeRegExp(link.phrase)})\\b(?!\\])`, 'i');
    if (pattern.test(result)) {
      result = result.replace(pattern, `[$1](/blog/${link.slug})`);
      used.add(link.slug);
    }
  }

  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatFaqs(faqs: Array<{ question: string; answer: string }>): string {
  return faqs.map((faq) => `**Question? ${faq.question}** ${faq.answer}`).join('\n\n');
}

export function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

export function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}
