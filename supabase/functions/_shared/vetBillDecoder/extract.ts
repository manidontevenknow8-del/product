import { tryParsePdfText } from './parsePdfText.ts';
import { isInvalidJsonError, parseModelJson } from './parseModelJson.ts';
import {
  EXTRACTION_SYSTEM_PROMPT,
  OPENROUTER_RESPONSE_FORMAT,
  type RawExtractionPayload,
} from './schema.ts';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_OUTPUT_TOKENS = 8192;

/**
 * Cheapest OpenRouter models that accept PDF files and/or images.
 * gemini-2.5-flash-lite: lowest-cost multimodal Gemini on OpenRouter.
 */
const DEFAULT_DOCUMENT_MODEL = 'google/gemini-2.5-flash-lite';
const DOCUMENT_MODEL_FALLBACKS = [
  DEFAULT_DOCUMENT_MODEL,
  'openai/gpt-4o-mini',
];

const PROMPT_JSON_SUFFIX = `

CRITICAL: Reply with ONE raw JSON object only. No markdown fences. No text before or after the JSON.
Include detailedReport (overview, visitContext, clinicalNarrative, keyFindings, careRecommendations, dataQualityNotes).
Each list item needs title, description, and confidence. Add explanation when possible.
Use empty arrays [] when a category has no evidence.`;

type ResponseFormatMode = 'none' | 'json_object' | 'json_schema';

type OpenRouterMessage = {
  role: 'system' | 'user';
  content: string | Array<Record<string, unknown>>;
};

function getApiKey(): string {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not configured on the Edge Function');
  }
  return key;
}

function resolveDocumentModels(): string[] {
  const configured =
    Deno.env.get('VET_BILL_DECODER_DOCUMENT_MODEL')?.trim() ??
    Deno.env.get('VET_BILL_DECODER_IMAGE_MODEL')?.trim() ??
    Deno.env.get('VET_BILL_DECODER_TEXT_MODEL')?.trim() ??
    Deno.env.get('VET_BILL_DECODER_PDF_MODEL')?.trim();

  if (configured) {
    return [configured, ...DOCUMENT_MODEL_FALLBACKS.filter((m) => m !== configured)];
  }
  return DOCUMENT_MODEL_FALLBACKS;
}

function parseOpenRouterError(status: number, body: unknown): string {
  if (body && typeof body === 'object') {
    const err = (body as { error?: { message?: string; metadata?: { raw?: string } } }).error;
    const parts = [err?.message, err?.metadata?.raw].filter(Boolean);
    if (parts.length) {
      return `OpenRouter ${status}: ${parts.join(' — ')}`;
    }
  }
  return `OpenRouter ${status}: Provider returned error`;
}

function isRetryableProviderError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    isInvalidJsonError(message) ||
    lower.includes('provider returned error') ||
    lower.includes('no endpoints found') ||
    lower.includes('json_schema') ||
    lower.includes('response_format') ||
    lower.includes('unsupported') ||
    lower.includes('empty extraction') ||
    lower.includes('404') ||
    lower.includes('400')
  );
}

async function openRouterRequest(body: Record<string, unknown>): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': Deno.env.get('OPENROUTER_HTTP_REFERER') ?? 'https://petclues.app',
      'X-Title': 'PetClues Vet Bill Decoder',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(parseOpenRouterError(res.status, json));
  }

  const content = (json as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]
    ?.message?.content;
  if (!content?.trim()) {
    throw new Error('OpenRouter returned empty extraction');
  }
  return content;
}

function applyResponseFormat(
  body: Record<string, unknown>,
  mode: ResponseFormatMode,
): void {
  if (mode === 'json_object') {
    body.response_format = { type: 'json_object' };
    return;
  }
  if (mode === 'json_schema') {
    body.response_format = OPENROUTER_RESPONSE_FORMAT;
  }
}

async function callTextModel(
  model: string,
  documentText: string,
  formatMode: ResponseFormatMode,
): Promise<RawExtractionPayload> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: formatMode === 'none'
        ? EXTRACTION_SYSTEM_PROMPT + PROMPT_JSON_SUFFIX
        : EXTRACTION_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: `Analyze this veterinary document text and produce the full PetClues decode report as JSON.

--- DOCUMENT TEXT ---
${documentText}
--- END DOCUMENT TEXT ---`,
    },
  ];

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.1,
    max_tokens: MAX_OUTPUT_TOKENS,
  };
  applyResponseFormat(body, formatMode);

  const content = await openRouterRequest(body);
  return parseModelJson(content);
}

async function callPdfFileModel(
  model: string,
  base64: string,
  formatMode: ResponseFormatMode,
): Promise<RawExtractionPayload> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: formatMode === 'none'
        ? EXTRACTION_SYSTEM_PROMPT + PROMPT_JSON_SUFFIX
        : EXTRACTION_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text:
            'Analyze this veterinary PDF (including handwriting and scanned pages) and produce the full PetClues decode report as JSON.',
        },
        {
          type: 'file',
          file: {
            filename: 'vet-document.pdf',
            file_data: `data:application/pdf;base64,${base64}`,
          },
        },
      ],
    },
  ];

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.1,
    max_tokens: MAX_OUTPUT_TOKENS,
    plugins: [{ id: 'file-parser', pdf: { engine: 'native' } }],
  };
  applyResponseFormat(body, formatMode);

  const content = await openRouterRequest(body);
  return parseModelJson(content);
}

async function callVisionModel(
  model: string,
  base64: string,
  mimeType: string,
  formatMode: ResponseFormatMode,
): Promise<RawExtractionPayload> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: formatMode === 'none'
        ? EXTRACTION_SYSTEM_PROMPT + PROMPT_JSON_SUFFIX
        : EXTRACTION_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text:
            'Analyze this veterinary document photo (including handwriting) and produce the full PetClues decode report as JSON.',
        },
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64}` },
        },
      ],
    },
  ];

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.1,
    max_tokens: MAX_OUTPUT_TOKENS,
  };
  applyResponseFormat(body, formatMode);

  const content = await openRouterRequest(body);
  return parseModelJson(content);
}

const FORMAT_MODES: ResponseFormatMode[] = ['none', 'json_object', 'json_schema'];

async function extractWithModelFallbacks(
  models: string[],
  run: (model: string, formatMode: ResponseFormatMode) => Promise<RawExtractionPayload>,
): Promise<{ payload: RawExtractionPayload; model: string }> {
  let lastError: Error | null = null;

  for (const model of models) {
    for (const formatMode of FORMAT_MODES) {
      try {
        const payload = await run(model, formatMode);
        return { payload, model: `${model} (${formatMode})` };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (!isRetryableProviderError(lastError.message)) {
          throw lastError;
        }
      }
    }
  }

  throw lastError ?? new Error('Vet document extraction failed');
}

async function extractFromPdf(
  bytes: Uint8Array,
): Promise<{ payload: RawExtractionPayload; model: string }> {
  const models = resolveDocumentModels();
  const parsed = await tryParsePdfText(bytes);
  const base64 = bytesToBase64(bytes);

  // Fast path: PDFs with good embedded text → cheap text-only call (no file upload).
  if (parsed?.quality === 'good' && parsed.text.length >= 180) {
    try {
      const result = await extractWithModelFallbacks(models, (model, formatMode) =>
        callTextModel(model, parsed.text, formatMode)
      );
      return {
        payload: result.payload,
        model: `${result.model} (pdf-text${parsed.truncated ? ',truncated' : ''})`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!isRetryableProviderError(message)) throw err;
    }
  }

  // Scanned PDFs, handwriting, sparse text, or text path failed → send PDF to model directly.
  const result = await extractWithModelFallbacks(models, (model, formatMode) =>
    callPdfFileModel(model, base64, formatMode)
  );
  const suffix = parsed?.quality === 'sparse' ? ',pdf-native-scan' : ',pdf-native';
  return { payload: result.payload, model: `${result.model}${suffix}` };
}

async function extractFromImageVision(
  base64: string,
  mimeType: string,
): Promise<{ payload: RawExtractionPayload; model: string }> {
  const models = resolveDocumentModels();
  return extractWithModelFallbacks(models, (model, formatMode) =>
    callVisionModel(model, base64, mimeType, formatMode)
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function isPdfMime(fileType: string): boolean {
  const lower = fileType.toLowerCase();
  return lower === 'application/pdf' || lower.endsWith('/pdf');
}

export async function extractVetDocument(
  bytes: Uint8Array,
  fileType: string,
): Promise<{ payload: RawExtractionPayload; model: string }> {
  const mimeType = fileType === 'image/jpg' ? 'image/jpeg' : fileType;

  if (isPdfMime(mimeType)) {
    return extractFromPdf(bytes);
  }

  if (mimeType.startsWith('image/')) {
    return extractFromImageVision(bytesToBase64(bytes), mimeType);
  }

  throw new Error(`Unsupported file type for decoding: ${fileType}`);
}
