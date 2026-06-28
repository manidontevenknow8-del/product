/**
 * generate-blog-faqs.ts
 *
 * Loops published blog posts and uses OpenRouter (OpenAI-compatible API) to generate
 * exactly 3 high-intent FAQ Q&A pairs per post. Output: src/data/generated-faqs.json
 *
 * Prerequisites:
 *   OPENROUTER_API_KEY in .env.local
 *
 * Usage:
 *   npm run generate:blog-faqs
 *   npm run generate:blog-faqs -- --slug=corgi-spine-health-ivdd-ramps-reality
 *   npm run generate:blog-faqs -- --limit=5
 *   npm run generate:blog-faqs -- --striking-distance
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { MOCK_BLOG_POSTS } from '../src/services/blog/mockBlogPosts';
import type { GeneratedFaqsMap } from '../src/types/generatedFaqs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_FILE = join(PROJECT_ROOT, 'src/data/generated-faqs.json');
const STRIKING_DISTANCE_FILE = join(PROJECT_ROOT, 'src/data/striking-distance.json');

const DEFAULT_MODEL = process.env.OPENROUTER_FAQ_MODEL?.trim() || 'openai/gpt-4o-mini';
const CONTENT_CHAR_LIMIT = 12_000;
const REQUEST_DELAY_MS = Number.parseInt(process.env.FAQ_GENERATION_DELAY_MS ?? '400', 10);

function loadEnvFile(filename: string, options?: { override?: boolean }): void {
  const path = join(PROJECT_ROOT, filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (options?.override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local', { override: true });

function parseArgs(argv: string[]) {
  let slug: string | undefined;
  let limit: number | undefined;
  let force = false;
  let dryRun = false;
  let strikingDistanceOnly = false;

  for (const arg of argv) {
    if (arg === '--force') force = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--striking-distance') strikingDistanceOnly = true;
    else if (arg.startsWith('--slug=')) slug = arg.slice('--slug='.length).trim();
    else if (arg.startsWith('--limit=')) {
      const n = Number.parseInt(arg.slice('--limit='.length), 10);
      if (Number.isFinite(n) && n > 0) limit = n;
    }
  }

  return { slug, limit, force, dryRun, strikingDistanceOnly };
}

function loadStrikingDistanceSlugs(): string[] {
  const path = STRIKING_DISTANCE_FILE;
  if (!existsSync(path)) {
    throw new Error(`Missing striking-distance targets: ${path}`);
  }

  const entries = JSON.parse(readFileSync(path, 'utf8')) as { url: string }[];
  return entries
    .map((entry) => entry.url.replace(/^\/blog\//, '').replace(/\/+$/, '').trim())
    .filter(Boolean);
}

function truncateContent(content: string): string {
  const stripped = content.replace(/\s+/g, ' ').trim();
  if (stripped.length <= CONTENT_CHAR_LIMIT) return stripped;
  return `${stripped.slice(0, CONTENT_CHAR_LIMIT)}…`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireOpenRouterKey(): string {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'Missing OPENROUTER_API_KEY. Add it to .env.local (see .env.example).',
    );
  }
  return key;
}

function createOpenRouterClient(): OpenAI {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: requireOpenRouterKey(),
    defaultHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER?.trim() || 'https://petclues.com',
      'X-OpenRouter-Title': process.env.OPENROUTER_APP_TITLE?.trim() || 'PetClues FAQ Generator',
    },
  });
}

type FaqResponse = {
  faqs: { question: string; answer: string }[];
};

function normalizeFaqs(raw: unknown): { question: string; answer: string }[] {
  if (!raw || typeof raw !== 'object') return [];

  const record = raw as Record<string, unknown>;
  const list = Array.isArray(record.faqs)
    ? record.faqs
    : Array.isArray(raw)
      ? raw
      : [];

  const normalized: { question: string; answer: string }[] = [];

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const question = String(row.question ?? '').trim();
    const answer = String(row.answer ?? '').trim();
    if (!question || !answer) continue;
    normalized.push({ question, answer });
  }

  return normalized.slice(0, 3);
}

async function generateFaqsForPost(
  client: OpenAI,
  post: { slug: string; title: string; excerpt: string; content: string },
): Promise<{ question: string; answer: string }[]> {
  const body = truncateContent(post.content);

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'You are a senior SEO engineer for PetClues, a pet health records platform.',
          'Return valid JSON only.',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          `Blog title: ${post.title}`,
          `Excerpt: ${post.excerpt}`,
          `Article body (truncated): ${body}`,
          '',
          'Generate exactly 3 hyper-relevant, high-intent FAQ questions pet owners would search on Google.',
          'Each answer must be 2–4 factual sentences, specific to this article, no fluff, no "consult your vet" boilerplate.',
          'Questions must end with "?".',
          '',
          'Return JSON shape:',
          '{"faqs":[{"question":"...?","answer":"..."},{"question":"...?","answer":"..."},{"question":"...?","answer":"..."}]}',
        ].join('\n'),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('Empty LLM response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from model: ${text.slice(0, 200)}`);
  }

  const faqs = normalizeFaqs(parsed);
  if (faqs.length !== 3) {
    throw new Error(`Expected 3 FAQs, got ${faqs.length}`);
  }

  return faqs;
}

function loadExistingOutput(): GeneratedFaqsMap {
  if (!existsSync(OUTPUT_FILE)) return {};
  try {
    return JSON.parse(readFileSync(OUTPUT_FILE, 'utf8')) as GeneratedFaqsMap;
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  const { slug, limit, force, dryRun, strikingDistanceOnly } = parseArgs(process.argv.slice(2));

  let posts = MOCK_BLOG_POSTS.filter((p) => p.status === 'published');

  if (strikingDistanceOnly) {
    const targetSlugs = loadStrikingDistanceSlugs();
    posts = posts.filter((p) => targetSlugs.includes(p.slug));
    if (posts.length === 0) {
      throw new Error(
        `No published posts matched striking-distance slugs: ${targetSlugs.join(', ')}`,
      );
    }
    console.log(`Striking-distance targets: ${targetSlugs.join(', ')}\n`);
  }

  if (slug) {
    posts = posts.filter((p) => p.slug === slug);
    if (posts.length === 0) {
      throw new Error(`No published blog post found for slug: ${slug}`);
    }
  }

  if (limit) {
    posts = posts.slice(0, limit);
  }

  const existing = loadExistingOutput();
  const output: GeneratedFaqsMap = { ...existing };
  const client = createOpenRouterClient();

  console.log(`Model: ${DEFAULT_MODEL}`);
  console.log(`Posts to process: ${posts.length}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    if (!force && output[post.slug]?.length === 3) {
      skipped += 1;
      console.log(`· skip ${post.slug} (already has 3 FAQs)`);
      continue;
    }

    if (dryRun) {
      console.log(`· dry-run ${post.slug}`);
      continue;
    }

    try {
      const faqs = await generateFaqsForPost(client, post);
      output[post.slug] = faqs;
      generated += 1;
      console.log(`✓ ${post.slug}`);
      for (const faq of faqs) {
        console.log(`    Q: ${faq.question}`);
      }

      if (REQUEST_DELAY_MS > 0) {
        await sleep(REQUEST_DELAY_MS);
      }
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✗ ${post.slug}: ${message}`);
    }
  }

  if (!dryRun) {
    writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  }

  console.log(
    `\nDone. generated=${generated} skipped=${skipped} failed=${failed} totalKeys=${Object.keys(output).length}`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  main().catch((error) => {
    console.error('\nFAQ generation failed:\n');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
