import { normalizeExtractionPayload, type RawExtractionPayload } from './schema.ts';

function stripMarkdownFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/im);
  if (fenced) return fenced[1].trim();

  const inline = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (inline) return inline[1].trim();

  return trimmed;
}

function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i++) {
    const char = raw[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(start, i + 1);
      }
    }
  }

  return null;
}

function repairCommonJsonIssues(raw: string): string {
  return raw
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2018|\u2019/g, "'");
}

export function parseModelJson(raw: string): RawExtractionPayload {
  const candidates = [
    stripMarkdownFence(raw),
    extractJsonObject(raw),
    extractJsonObject(stripMarkdownFence(raw)),
  ].filter((value): value is string => Boolean(value?.trim()));

  const unique = [...new Set(candidates)];
  let lastError: Error | null = null;

  for (const candidate of unique) {
    for (const attempt of [candidate, repairCommonJsonIssues(candidate)]) {
      try {
        const parsed = JSON.parse(attempt) as RawExtractionPayload;
        return normalizeExtractionPayload(parsed);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw new Error(
    `Model returned invalid JSON${lastError ? `: ${lastError.message}` : ''}. Retrying with document vision.`,
  );
}

export function isInvalidJsonError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('invalid json') || lower.includes('json.parse');
}
