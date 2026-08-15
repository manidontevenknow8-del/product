/**
 * trigger-indexing.ts
 *
 * Drip-feeds URL_UPDATED payloads to the Google Indexing API from
 * `public/sitemap-lifecycle.xml` at a hard cap of 200 URLs per run
 * (Google's daily quota). State is persisted in `.indexing-state.json`
 * so the next run continues at URL 201.
 *
 * Prerequisites:
 *  1. Enable "Web Search Indexing API" in the Google Cloud project.
 *  2. Service account JSON key at ./service_account.json OR set:
 *       GSC_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/key.json
 *       # or GOOGLE_APPLICATION_CREDENTIALS=...
 *  3. In Google Search Console → Settings → Users and permissions, add the
 *     service account client_email as an **Owner** of https://petclues.com/
 *     (Editor is not enough - Owner is required or you get HTTP 403).
 *
 * Run:
 *   npx tsx scripts/trigger-indexing.ts
 *   npx tsx scripts/trigger-indexing.ts --batch=0
 *   npx tsx scripts/trigger-indexing.ts --dry-run
 *   npm run google:trigger-indexing
 *
 * googleapis is already a project dependency. If missing:
 *   npm install googleapis
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import type { GaxiosError } from 'gaxios';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const PUBLISH_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const REQUEST_DELAY_MS = 750;
const DAILY_LIMIT = 200;
const LIFECYCLE_SITEMAP = 'public/sitemap-lifecycle.xml';
const RESOURCES_SITEMAP = 'public/sitemap-resources.xml';
const STATE_FILE = join(PROJECT_ROOT, '.indexing-state.json');

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

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

type IndexingState = {
  updatedAt: string;
  submitted: string[];
  lastBatchDate: string | null;
  lastBatchCount: number;
  lastCursor: number;
};

function emptyState(): IndexingState {
  return {
    updatedAt: new Date().toISOString(),
    submitted: [],
    lastBatchDate: null,
    lastBatchCount: 0,
    lastCursor: 0,
  };
}

function loadState(): IndexingState {
  if (!existsSync(STATE_FILE)) return emptyState();
  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, 'utf8')) as Partial<IndexingState>;
    return {
      ...emptyState(),
      ...parsed,
      submitted: Array.isArray(parsed.submitted) ? parsed.submitted : [],
    };
  } catch {
    return emptyState();
  }
}

function saveState(state: IndexingState): void {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function resolveCredentialsPath(): string {
  const candidates = [
    process.env.GSC_SERVICE_ACCOUNT_KEY_PATH?.trim(),
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
    join(PROJECT_ROOT, 'service_account.json'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error(
    [
      'Missing Google service account JSON key.',
      'Place service_account.json at the project root, or set',
      'GSC_SERVICE_ACCOUNT_KEY_PATH / GOOGLE_APPLICATION_CREDENTIALS.',
      'Also ensure that client_email is an Owner in Search Console for https://petclues.com/',
    ].join(' '),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(): { dryRun: boolean; batch: number | null } {
  const args = process.argv.slice(2);
  const batchArg = args.find((arg) => arg.startsWith('--batch=')) ?? (args.includes('--batch') ? '--batch=0' : null);
  const batchValue = batchArg ? Number(batchArg.split('=')[1] ?? '0') : NaN;

  return {
    dryRun: args.includes('--dry-run'),
    batch: Number.isFinite(batchValue) ? batchValue : null,
  };
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim()).filter(Boolean);
}

function loadPrioritySitemapUrls(): string[] {
  const files = [RESOURCES_SITEMAP, LIFECYCLE_SITEMAP];
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const path = join(PROJECT_ROOT, file);
    if (!existsSync(path)) {
      throw new Error(`Missing ${file}. Run: npx tsx scripts/generate-sitemaps.ts`);
    }
    for (const url of extractLocs(readFileSync(path, 'utf8'))) {
      if (seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }
  }

  return urls;
}

function readServiceAccountEmail(keyPath: string): string | null {
  try {
    const raw = JSON.parse(readFileSync(keyPath, 'utf8')) as { client_email?: string };
    return raw.client_email ?? null;
  } catch {
    return null;
  }
}

function selectBatch(allUrls: string[], state: IndexingState, batch: number | null): string[] {
  if (batch !== null) {
    const start = batch * DAILY_LIMIT;
    return allUrls.slice(start, start + DAILY_LIMIT);
  }

  const submitted = new Set(state.submitted);
  return allUrls.filter((url) => !submitted.has(url)).slice(0, DAILY_LIMIT);
}

function assertDailyCap(urls: string[]): void {
  if (urls.length > DAILY_LIMIT) {
    throw new Error(
      `Refusing to send ${urls.length} URL_UPDATED payloads in one run. Google Indexing API limit is ${DAILY_LIMIT}/day. This hard stop protects the domain from SpamBrain flags.`,
    );
  }
}

type PublishResult = {
  url: string;
  ok: boolean;
  status: number;
  body: unknown;
  errorMessage?: string;
};

async function publishUrlUpdated(
  indexing: ReturnType<typeof google.indexing>,
  url: string,
): Promise<PublishResult> {
  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type: 'URL_UPDATED',
      },
    });

    return {
      url,
      ok: true,
      status: response.status ?? 200,
      body: response.data,
    };
  } catch (error) {
    const gaxios = error as GaxiosError;
    const status = gaxios.response?.status ?? (Number(gaxios.code) || 0);
    const apiError = gaxios.response?.data?.error;
    const errorMessage =
      apiError?.message ??
      (error instanceof Error ? error.message : String(error));

    return {
      url,
      ok: false,
      status,
      body: gaxios.response?.data ?? null,
      errorMessage,
    };
  }
}

function logResult(result: PublishResult): void {
  if (result.ok) {
    console.log(
      `${c.green}✅ [${result.status}] Successfully notified Google to index:${c.reset} ${result.url}`,
    );
    return;
  }

  console.log(
    `${c.red}❌ [${result.status || 'ERR'}] Failed for:${c.reset} ${result.url}`,
  );
  if (result.errorMessage) {
    console.log(`${c.yellow}   ${result.errorMessage}${c.reset}`);
  }
  if (result.status === 403) {
    console.log(
      `${c.yellow}   Hint: add the service account client_email as Owner in Search Console.${c.reset}`,
    );
  }
  if (result.status === 429) {
    console.log(
      `${c.yellow}   Rate limit hit. Stopping this run so remaining quota is not burned.${c.reset}`,
    );
  }
}

async function main(): Promise<void> {
  const { dryRun, batch } = parseArgs();
  const allUrls = loadPrioritySitemapUrls();
  const state = loadState();
  const urls = selectBatch(allUrls, state, batch);

  assertDailyCap(urls);

  const keyPath = dryRun ? '(dry-run)' : resolveCredentialsPath();
  const clientEmail = dryRun ? null : readServiceAccountEmail(keyPath);

  console.log('');
  console.log(`${c.bold}${c.cyan}PetClues → Google Indexing API (200/day drip-feed)${c.reset}`);
  console.log(`${c.dim}Endpoint: ${PUBLISH_ENDPOINT}${c.reset}`);
  console.log(`${c.dim}Sitemaps: ${RESOURCES_SITEMAP}, ${LIFECYCLE_SITEMAP}${c.reset}`);
  console.log(`${c.dim}State: ${STATE_FILE}${c.reset}`);
  console.log(`${c.dim}Catalog: ${allUrls.length} · already submitted: ${state.submitted.length}${c.reset}`);
  console.log(`${c.dim}This run: ${urls.length} (hard cap ${DAILY_LIMIT}) · delay: ${REQUEST_DELAY_MS}ms${c.reset}`);
  if (batch !== null) {
    console.log(`${c.dim}Batch index: ${batch} (URLs ${batch * DAILY_LIMIT + 1}-${batch * DAILY_LIMIT + urls.length})${c.reset}`);
  }
  if (clientEmail) {
    console.log(`${c.dim}Service account: ${clientEmail}${c.reset}`);
    console.log(
      `${c.yellow}Reminder: this email must be an Owner in GSC for https://petclues.com/${c.reset}`,
    );
  }
  if (dryRun) console.log(`${c.yellow}Mode: DRY RUN (no API calls, state not written)${c.reset}`);
  console.log('');

  if (urls.length === 0) {
    console.log('No un-indexed resource or lifecycle URLs remaining.');
    return;
  }

  if (dryRun) {
    for (const url of urls) {
      console.log(`${c.cyan}→ would notify:${c.reset} ${url}`);
    }
    console.log('');
    console.log(`Dry run complete. ${urls.length} URL_UPDATED payloads queued for the next live run.`);
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: [INDEXING_SCOPE],
  });

  const indexing = google.indexing({ version: 'v3', auth });

  let okCount = 0;
  let failCount = 0;
  const succeeded: string[] = [];
  let abortedForRateLimit = false;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const result = await publishUrlUpdated(indexing, url);
    logResult(result);

    if (result.ok) {
      okCount += 1;
      succeeded.push(url);
    } else {
      failCount += 1;
      if (result.status === 429) {
        abortedForRateLimit = true;
        break;
      }
    }

    if (i < urls.length - 1 && !abortedForRateLimit) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const submitted = [...new Set([...state.submitted, ...succeeded])];
  saveState({
    updatedAt: new Date().toISOString(),
    submitted,
    lastBatchDate: new Date().toISOString().slice(0, 10),
    lastBatchCount: succeeded.length,
    lastCursor: submitted.length,
  });

  console.log('');
  console.log(
    `${c.bold}Done.${c.reset} ${c.green}${okCount} ok${c.reset} · ${failCount > 0 ? c.red : c.dim}${failCount} failed${c.reset} · state saved (${submitted.length}/${allUrls.length} submitted)`,
  );
  if (abortedForRateLimit) {
    console.log(`${c.yellow}Stopped early after HTTP 429. Re-run tomorrow; failed URLs were not marked submitted.${c.reset}`);
  }

  if (failCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
