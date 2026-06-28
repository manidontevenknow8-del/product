/**
 * request-google-index.ts
 *
 * Sends URL_UPDATED notifications to the Google Indexing API (not Search Console).
 *
 * Prerequisites:
 *  1. Google Cloud project with "Web Search Indexing API" enabled.
 *  2. Service account JSON key (same env vars as GSC scripts).
 *  3. In Google Search Console → Settings → Users and permissions, add the
 *     service account email as an **Owner** (required for Indexing API).
 *
 * Usage:
 *   npm run google:request-index -- https://petclues.com/blog/my-post
 *   npm run google:request-index -- url1 url2 url3
 *
 * Programmatic:
 *   import { requestGoogleIndex } from './scripts/request-google-index.js';
 *   await requestGoogleIndex('https://petclues.com/blog/my-post');
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import type { GaxiosError } from 'gaxios';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const PUBLISH_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

function loadEnvFile(filename: string): void {
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

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const SERVICE_ACCOUNT_KEY_PATH =
  process.env.GSC_SERVICE_ACCOUNT_KEY_PATH?.trim() ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

export type IndexNotificationType = 'URL_UPDATED' | 'URL_DELETED';

export type IndexRequestResult = {
  url: string;
  type: IndexNotificationType;
  /** Raw API response payload from urlNotifications.publish */
  data: unknown;
};

/** Thrown when Google returns quota / rate-limit errors (HTTP 429 or RESOURCE_EXHAUSTED). */
export class IndexingQuotaError extends Error {
  readonly code: number;
  readonly status: string;
  readonly retryAfterSeconds?: number;

  constructor(message: string, options: { code: number; status: string; retryAfterSeconds?: number }) {
    super(message);
    this.name = 'IndexingQuotaError';
    this.code = options.code;
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

function requireCredentialsPath(): string {
  if (!SERVICE_ACCOUNT_KEY_PATH) {
    throw new Error(
      [
        'Missing service account key path.',
        'Set GSC_SERVICE_ACCOUNT_KEY_PATH (or GOOGLE_APPLICATION_CREDENTIALS)',
        'to the absolute path of your Google Cloud service account JSON key.',
      ].join(' '),
    );
  }

  if (!existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
    throw new Error(`Service account key file not found: ${SERVICE_ACCOUNT_KEY_PATH}`);
  }

  return SERVICE_ACCOUNT_KEY_PATH;
}

function createAuth() {
  return new google.auth.GoogleAuth({
    keyFile: requireCredentialsPath(),
    scopes: [INDEXING_SCOPE],
  });
}

function parseRetryAfterSeconds(headers: Record<string, unknown> | undefined): number | undefined {
  const raw = headers?.['retry-after'];
  if (raw == null) return undefined;

  const value = Array.isArray(raw) ? raw[0] : String(raw);
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function isQuotaError(error: unknown): boolean {
  const gaxios = error as GaxiosError;
  const code = gaxios.response?.status ?? gaxios.code;
  const status = gaxios.response?.data?.error?.status ?? gaxios.response?.data?.error?.errors?.[0]?.reason;

  if (code === 429) return true;
  if (status === 'RESOURCE_EXHAUSTED') return true;
  if (status === 'RATE_LIMIT_EXCEEDED') return true;

  const message = (
    gaxios.response?.data?.error?.message ??
    gaxios.message ??
    ''
  ).toLowerCase();

  return message.includes('quota') || message.includes('rate limit');
}

function toIndexingQuotaError(error: unknown): IndexingQuotaError {
  const gaxios = error as GaxiosError;
  const apiError = gaxios.response?.data?.error;
  const code = apiError?.code ?? gaxios.response?.status ?? 429;
  const status = apiError?.status ?? 'RESOURCE_EXHAUSTED';
  const message =
    apiError?.message ??
    'Google Indexing API quota exceeded. Daily publish limits apply per property.';

  return new IndexingQuotaError(message, {
    code,
    status,
    retryAfterSeconds: parseRetryAfterSeconds(gaxios.response?.headers as Record<string, unknown>),
  });
}

function assertAbsoluteHttpUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`URL must use http or https: ${url}`);
  }
}

/**
 * Request Google to recrawl / reprocess a URL via the Indexing API.
 * Sends a URL_UPDATED notification to urlNotifications:publish.
 */
export async function requestGoogleIndex(
  url: string,
  type: IndexNotificationType = 'URL_UPDATED',
): Promise<IndexRequestResult> {
  assertAbsoluteHttpUrl(url);

  const auth = createAuth();
  const indexing = google.indexing({ version: 'v3', auth });

  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: { url, type },
    });

    return { url, type, data: response.data };
  } catch (error) {
    if (isQuotaError(error)) {
      throw toIndexingQuotaError(error);
    }
    throw error;
  }
}

/** @internal Documented endpoint constant for callers that prefer raw HTTP. */
export const GOOGLE_INDEXING_PUBLISH_URL = PUBLISH_ENDPOINT;

async function main(): Promise<void> {
  const urls = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));

  if (urls.length === 0) {
    console.error('Usage: npm run google:request-index -- <url> [url2 ...]');
    console.error(`Endpoint: ${PUBLISH_ENDPOINT}`);
    process.exit(1);
  }

  console.log(`Using service account key: ${requireCredentialsPath()}`);
  console.log(`Indexing API endpoint: ${PUBLISH_ENDPOINT}\n`);

  let failures = 0;

  for (const url of urls) {
    try {
      const result = await requestGoogleIndex(url);
      console.log(`✓ URL_UPDATED → ${result.url}`);
      if (result.data && typeof result.data === 'object') {
        console.log('  Response:', JSON.stringify(result.data));
      }
    } catch (error) {
      failures += 1;

      if (error instanceof IndexingQuotaError) {
        console.error(`✗ Quota limit for ${url}`);
        console.error(`  ${error.message}`);
        if (error.retryAfterSeconds != null) {
          console.error(`  Retry after: ${error.retryAfterSeconds}s`);
        }
        console.error('  Google Indexing API allows ~200 publish requests/day per property.');
        break;
      }

      const gaxios = error as GaxiosError;
      const apiMessage = gaxios.response?.data?.error?.message;
      console.error(`✗ Failed for ${url}`);
      console.error(`  ${apiMessage ?? (error instanceof Error ? error.message : String(error))}`);
    }
  }

  process.exit(failures > 0 ? 1 : 0);
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
