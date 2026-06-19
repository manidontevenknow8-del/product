/**
 * Lightweight markdown subset for blog body (no extra dependency).
 * Future CMS adapters can return HTML instead and bypass this renderer.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/'/g, '&#39;');
}

function isSafeHref(href: string): boolean {
  if (!href || href.length > 2048) return false;
  if (/[\s"'<>]/.test(href)) return false;
  return href.startsWith('/') || href.startsWith('https://') || href.startsWith('http://');
}

function inlineFormat(text: string): string {
  let result = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
    const safeHref = isSafeHref(href.trim()) ? href.trim() : '#';
    return `@@LINK:${safeHref}::${label}@@`;
  });
  result = result.replace(/\*\*(.+?)\*\*/g, '@@BOLD::$1@@');
  result = escapeHtml(result);
  result = result.replace(
    /@@LINK:([^:]+)::([^@]+)@@/g,
    (_m, href: string, label: string) =>
      `<a href="${escapeAttr(href)}" rel="noopener noreferrer">${label}</a>`,
  );
  result = result.replace(/@@BOLD::([^@]+)@@/g, '<strong>$1</strong>');
  return result;
}

function headingClass(level: 'h2' | 'h3', text: string): string {
  const lower = text.toLowerCase();
  if (level === 'h2') {
    if (lower.includes('faq')) return ' class="blog-h2 blog-h2-faq"';
    if (lower.includes('related')) return ' class="blog-h2 blog-h2-related"';
    if (lower.includes('why this matters') || lower.startsWith('why ')) {
      return ' class="blog-h2 blog-h2-lead"';
    }
    if (lower.includes('step-by-step') || lower.includes('checklist') || lower.includes('timeline')) {
      return ' class="blog-h2 blog-h2-steps"';
    }
    return ' class="blog-h2"';
  }
  if (isMilestoneH3(text)) return ' class="blog-h3 blog-h3-milestone"';
  return ' class="blog-h3"';
}

function isMilestoneH3(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /^\d+[\u2013\-]/.test(text) ||
    /^step\s+\d/i.test(text) ||
    (/\bweeks?\b/.test(lower) && /^\d|week|month|year/i.test(text)) ||
    (/\bmonths?\b/.test(lower) && /^\d|week|month|year/i.test(text))
  );
}

function parseFaqParagraph(text: string): { question: string; answer: string } | null {
  const prefixed = text.match(/^\*\*Question\?\s*(.+?)\*\*\s*(.*)$/s);
  if (prefixed) {
    return { question: prefixed[1].trim(), answer: prefixed[2].trim() };
  }

  const classic = text.match(/^\*\*(.+?)\*\*\s*(.*)$/s);
  if (classic && classic[1].trim().endsWith('?')) {
    return { question: classic[1].trim(), answer: classic[2].trim() };
  }

  return null;
}

function isOrderedLine(line: string): boolean {
  return /^\d+\.\s/.test(line.trim());
}

function isTopLevelBulletLine(line: string): boolean {
  const trimmed = line.trim();
  return /^[-*]\s/.test(trimmed) && !/^\s+[-*]\s/.test(line);
}

function isNestedBulletLine(line: string): boolean {
  return /^\s+[-*]\s/.test(line);
}

type OrderedItem = {
  number: number;
  content: string;
  children: string[];
};

function isBlockquoteLine(line: string): boolean {
  return line.trim().startsWith('>');
}

function parseTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
  const cells = trimmed
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
  if (cells.length < 2) return null;
  return cells;
}

function isTableSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseImageLine(line: string): { alt: string; src: string; caption?: string } | null {
  const match = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)(.*)$/);
  if (!match) return null;
  const captionRaw = match[3].trim();
  return {
    alt: match[1],
    src: match[2].trim(),
    caption: captionRaw.startsWith('*') && captionRaw.endsWith('*') ? captionRaw.slice(1, -1) : undefined,
  };
}

type ContentBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: OrderedItem[] }
  | { type: 'faq'; question: string; answer: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'figure'; alt: string; src: string; caption?: string }
  | { type: 'cta'; lines: string[] };

/** Parse long-form markdown that uses single newlines between blocks */
function parseContentBlocks(content: string): ContentBlock[] {
  const lines = content.trim().split('\n');
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
      i++;
      continue;
    }

    if (isBlockquoteLine(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && isBlockquoteLine(lines[i])) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'cta', lines: quoteLines.filter(Boolean) });
      continue;
    }

    const image = parseImageLine(line);
    if (image && isSafeHref(image.src)) {
      blocks.push({ type: 'figure', ...image });
      i++;
      continue;
    }

    const tableRow = parseTableRow(line);
    if (tableRow) {
      const headers = tableRow;
      i++;
      if (i < lines.length) {
        const sep = parseTableRow(lines[i]);
        if (sep && isTableSeparator(sep)) {
          i++;
          const rows: string[][] = [];
          while (i < lines.length) {
            const row = parseTableRow(lines[i]);
            if (!row || isTableSeparator(row)) break;
            rows.push(row);
            i++;
          }
          blocks.push({ type: 'table', headers, rows });
          continue;
        }
      }
      blocks.push({ type: 'p', text: trimmed });
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(2) });
      i++;
      continue;
    }

    if (isOrderedLine(line)) {
      const items: OrderedItem[] = [];
      while (i < lines.length) {
        const current = lines[i];
        const currentTrimmed = current.trim();
        if (!currentTrimmed) {
          i++;
          break;
        }

        if (isOrderedLine(current)) {
          const match = currentTrimmed.match(/^(\d+)\.\s+(.*)/);
          if (match) {
            items.push({
              number: Number.parseInt(match[1], 10),
              content: match[2],
              children: [],
            });
          }
          i++;
          continue;
        }

        if (isNestedBulletLine(current) && items.length > 0) {
          items[items.length - 1].children.push(currentTrimmed.replace(/^[-*]\s/, ''));
          i++;
          continue;
        }

        break;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (isTopLevelBulletLine(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i];
        const currentTrimmed = current.trim();
        if (!currentTrimmed) {
          i++;
          break;
        }
        if (isTopLevelBulletLine(current)) {
          items.push(currentTrimmed.replace(/^[-*]\s/, ''));
          i++;
          continue;
        }
        break;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i];
      const currentTrimmed = current.trim();
      if (!currentTrimmed) {
        i++;
        break;
      }
      if (
        currentTrimmed.startsWith('### ') ||
        currentTrimmed.startsWith('## ') ||
        currentTrimmed.startsWith('# ') ||
        isOrderedLine(current) ||
        isTopLevelBulletLine(current) ||
        isBlockquoteLine(current) ||
        parseImageLine(current) ||
        parseTableRow(current)
      ) {
        break;
      }
      paragraphLines.push(currentTrimmed);
      i++;
    }
    if (paragraphLines.length) {
      blocks.push({ type: 'p', text: paragraphLines.join(' ') });
    }
  }

  return blocks;
}

function renderOrderedList(items: OrderedItem[]): string {
  const lis = items
    .map((item) => {
      const nested =
        item.children.length > 0
          ? `<ul class="blog-ul blog-nested-checklist">${item.children
              .map((child) => `<li>${inlineFormat(child)}</li>`)
              .join('')}</ul>`
          : '';
      return `<li data-step="${item.number}">${inlineFormat(item.content)}${nested}</li>`;
    })
    .join('');
  const start = items[0]?.number ?? 1;
  const startAttr = start > 1 ? ` start="${start}"` : '';
  return `<ol class="blog-ol blog-steps"${startAttr}>${lis}</ol>`;
}

function renderUnorderedList(items: string[]): string {
  const lis = items.map((item) => `<li>${inlineFormat(item)}</li>`).join('');
  return `<ul class="blog-ul blog-checklist">${lis}</ul>`;
}

function closeOpenWrappers(
  html: string[],
  state: { introOpen: boolean; sectionOpen: boolean },
): void {
  if (state.sectionOpen) {
    html.push('</section>');
    state.sectionOpen = false;
  }
  if (state.introOpen) {
    html.push('</div>');
    state.introOpen = false;
  }
}

function renderTable(headers: string[], rows: string[][]): string {
  const thead = `<thead><tr>${headers.map((h) => `<th scope="col">${inlineFormat(h)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${inlineFormat(cell)}</td>`).join('')}</tr>`,
    )
    .join('')}</tbody>`;
  return `<div class="blog-table-wrap"><table class="blog-table">${thead}${tbody}</table></div>`;
}

function renderFigure(alt: string, src: string, caption?: string): string {
  const cap = caption
    ? `<figcaption class="blog-figure-caption">${inlineFormat(caption)}</figcaption>`
    : '';
  return `<figure class="blog-figure"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async" />${cap}</figure>`;
}

function renderCta(lines: string[]): string {
  const inner = lines.map((line) => `<p class="blog-cta-line">${inlineFormat(line)}</p>`).join('');
  return `<aside class="blog-cta" role="note">${inner}</aside>`;
}

export function renderBlogMarkdown(content: string): string {
  const blocks = parseContentBlocks(content);
  const html: string[] = [];
  let inFaq = false;
  const state = { introOpen: false, sectionOpen: false };
  let seenFirstH2 = false;

  for (const block of blocks) {
    if (block.type === 'h3') {
      html.push(`<h3${headingClass('h3', block.text)}>${inlineFormat(block.text)}</h3>`);
      continue;
    }

    if (block.type === 'h2') {
      const lower = block.text.toLowerCase();
      if (lower.includes('faq')) inFaq = true;
      else if (inFaq && !lower.includes('faq')) inFaq = false;

      closeOpenWrappers(html, state);
      seenFirstH2 = true;

      html.push(`<h2${headingClass('h2', block.text)}>${inlineFormat(block.text)}</h2>`);
      html.push('<section class="blog-section">');
      state.sectionOpen = true;
      continue;
    }

    if (block.type === 'ol') {
      if (!seenFirstH2 && !state.introOpen) {
        html.push('<div class="blog-intro">');
        state.introOpen = true;
      }
      html.push(renderOrderedList(block.items));
      continue;
    }

    if (block.type === 'ul') {
      if (!seenFirstH2 && !state.introOpen) {
        html.push('<div class="blog-intro">');
        state.introOpen = true;
      }
      html.push(renderUnorderedList(block.items));
      continue;
    }

    if (block.type === 'table') {
      if (!seenFirstH2 && !state.introOpen) {
        html.push('<div class="blog-intro">');
        state.introOpen = true;
      }
      html.push(renderTable(block.headers, block.rows));
      continue;
    }

    if (block.type === 'figure') {
      html.push(renderFigure(block.alt, block.src, block.caption));
      continue;
    }

    if (block.type === 'cta') {
      html.push(renderCta(block.lines));
      continue;
    }

    if (block.type === 'p') {
      if (inFaq) {
        const faq = parseFaqParagraph(block.text);
        if (faq) {
          html.push(
            `<div class="blog-faq-item"><p class="blog-faq-q">${inlineFormat(faq.question)}</p>${
              faq.answer ? `<p class="blog-faq-a">${inlineFormat(faq.answer)}</p>` : ''
            }</div>`,
          );
          continue;
        }
      }

      if (!seenFirstH2 && !state.introOpen) {
        html.push('<div class="blog-intro">');
        state.introOpen = true;
      }

      html.push(`<p class="blog-p">${inlineFormat(block.text)}</p>`);
    }
  }

  closeOpenWrappers(html, state);
  return html.join('\n');
}
