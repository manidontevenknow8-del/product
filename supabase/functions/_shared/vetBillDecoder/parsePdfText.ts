import { extractText, getDocumentProxy } from 'npm:unpdf@1.1.0';

const MAX_TEXT_CHARS = 120_000;
/** Below this, prefer sending the PDF to a vision model (scans/handwriting). */
const GOOD_TEXT_THRESHOLD = 180;

export type ParsedPdfText = {
  text: string;
  totalPages: number;
  truncated: boolean;
  /** good = embedded text PDF; sparse = scan/handwriting likely */
  quality: 'good' | 'sparse';
};

/** Try to extract text; never throws - returns null if PDF.js cannot read the file. */
export async function tryParsePdfText(bytes: Uint8Array): Promise<ParsedPdfText | null> {
  try {
    const pdf = await getDocumentProxy(bytes);
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (normalized.length === 0) {
      return { text: '', totalPages, truncated: false, quality: 'sparse' };
    }

    const quality: ParsedPdfText['quality'] =
      normalized.length >= GOOD_TEXT_THRESHOLD ? 'good' : 'sparse';

    if (normalized.length <= MAX_TEXT_CHARS) {
      return { text: normalized, totalPages, truncated: false, quality };
    }

    const head = normalized.slice(0, 80_000);
    const tail = normalized.slice(-30_000);
    return {
      text: `${head}\n\n[… middle of document omitted …]\n\n${tail}`,
      totalPages,
      truncated: true,
      quality,
    };
  } catch {
    return null;
  }
}
