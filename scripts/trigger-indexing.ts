/**
 * trigger-indexing.ts
 *
 * Sandbox-safe drip-feed of URL_UPDATED to the Google Indexing API,
 * driven by Agent 11 PASS publish waves.
 *
 * After a recent ~6k page push, defaults are intentionally conservative:
 *   - 40 URLs/day (hard max 100)
 *   - 2.5s between requests
 *   - ≥24h between live runs
 *   - one wave segment per day
 *
 * Sitemap discovery remains the primary crawl path. This API is a slow
 * priority nudge for the current wave only.
 *
 * Prerequisites:
 *  1. Enable "Web Search Indexing API" in the Google Cloud project.
 *  2. Service account JSON at ./service_account.json OR
 *       GSC_SERVICE_ACCOUNT_KEY_PATH / GOOGLE_APPLICATION_CREDENTIALS
 *  3. Service account client_email as Owner of https://petclues.com/ in GSC.
 *  4. Waves prepared:
 *       node scripts/qa-pillar-publishability.mjs
 *       node scripts/prepare-publish-waves.mjs
 *
 * Run:
 *   npx tsx scripts/trigger-indexing.ts --wave=1 --dry-run
 *   npx tsx scripts/trigger-indexing.ts --wave=1
 *   npx tsx scripts/trigger-indexing.ts --wave=1 --limit=20
 *   npx tsx scripts/trigger-indexing.ts --wave=2 --force   # skip 24h gate (use sparingly)
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

/** Conservative after a large recent push. Override with --limit=N (capped). */
const DEFAULT_DAILY_LIMIT = 40;
const HARD_MAX_DAILY = 100;
const REQUEST_DELAY_MS = 2500;
const MIN_HOURS_BETWEEN_RUNS = 24;

const WAVES_DIR = join(PROJECT_ROOT, 'content-data/generated/publish-waves');
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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

type IndexingState = {
  updatedAt: string;
  submitted: string[];
  lastBatchDate: string | null;
  lastBatchAt: string | null;
  lastBatchCount: number;
  lastWave: number | null;
  lastCursor: number;
  waveProgress: Record<string, number>;
};

function emptyState(): IndexingState {
  return {
    updatedAt: new Date().toISOString(),
    submitted: [],
    lastBatchDate: null,
    lastBatchAt: null,
    lastBatchCount: 0,
    lastWave: null,
    lastCursor: 0,
    waveProgress: {},
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
      waveProgress:
        parsed.waveProgress && typeof parsed.waveProgress === 'object'
          ? parsed.waveProgress
          : {},
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

type CliArgs = {
  dryRun: boolean;
  force: boolean;
  wave: number;
  limit: number;
};

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const waveArg = args.find((a) => a.startsWith('--wave='));
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const wave = waveArg ? Number(waveArg.split('=')[1]) : NaN;
  let limit = limitArg ? Number(limitArg.split('=')[1]) : DEFAULT_DAILY_LIMIT;

  if (!Number.isFinite(wave) || wave < 1 || wave > 8) {
    throw new Error(
      'Required: --wave=N (1-8). Example: npx tsx scripts/trigger-indexing.ts --wave=1 --dry-run',
    );
  }
  if (!Number.isFinite(limit) || limit < 1) {
    throw new Error('--limit must be a positive number');
  }
  if (limit > HARD_MAX_DAILY) {
    console.warn(
      `${c.yellow}Clamping --limit=${limit} to hard max ${HARD_MAX_DAILY}/day (sandbox-safe).${c.reset}`,
    );
    limit = HARD_MAX_DAILY;
  }

  return {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    wave,
    limit,
  };
}

function loadWaveUrls(wave: number): string[] {
  const file = join(WAVES_DIR, `wave-${String(wave).padStart(2, '0')}.json`);
  if (!existsSync(file)) {
    throw new Error(
      `Missing ${file}. Run: node scripts/qa-pillar-publishability.mjs && node scripts/prepare-publish-waves.mjs`,
    );
  }
  const payload = JSON.parse(readFileSync(file, 'utf8')) as {
    urls: { url: string }[];
  };
  return payload.urls.map((u) => u.url);
}

function assertCooldown(state: IndexingState, force: boolean): void {
  if (force || !state.lastBatchAt) return;
  const last = Date.parse(state.lastBatchAt);
  if (!Number.isFinite(last)) return;
  const hours = (Date.now() - last) / 3_600_000;
  if (hours < MIN_HOURS_BETWEEN_RUNS) {
    throw new Error(
      `Refusing live run: last Indexing API batch was ${hours.toFixed(1)}h ago ` +
        `(minimum ${MIN_HOURS_BETWEEN_RUNS}h). Re-run later or pass --force only if intentional.`,
    );
  }
}

function assertWaveOrder(state: IndexingState, wave: number, force: boolean): void {
  if (force || wave === 1) return;
  const prevKey = String(wave - 1);
  const prevFile = join(WAVES_DIR, `wave-${String(wave - 1).padStart(2, '0')}.json`);
  if (!existsSync(prevFile)) return;
  const prev = JSON.parse(readFileSync(prevFile, 'utf8')) as { urls: unknown[] };
  const submitted = new Set(loadState().submitted);
  const prevUrls = (JSON.parse(readFileSync(prevFile, 'utf8')) as { urls: { url: string }[] }).urls;
  const prevDone = prevUrls.filter((u) => submitted.has(u.url)).length;
  const prevTotal = prev.urls.length;
  // Require at least 50% of previous wave submitted before advancing (sitemap covers the rest).
  if (prevDone < Math.ceil(prevTotal * 0.5)) {
    throw new Error(
      `Wave ${wave} blocked: wave ${wave - 1} only has ${prevDone}/${prevTotal} Indexing API submits. ` +
        `Finish more of wave ${wave - 1} (or wait for sitemap crawl), or pass --force.`,
    );
  }
  void prevKey;
}

function readServiceAccountEmail(keyPath: string): string | null {
  try {
    const raw = JSON.parse(readFileSync(keyPath, 'utf8')) as { client_email?: string };
    return raw.client_email ?? null;
  } catch {
    return null;
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
      requestBody: { url, type: 'URL_UPDATED' },
    });
    return { url, ok: true, status: response.status ?? 200, body: response.data };
  } catch (error) {
    const gaxios = error as GaxiosError;
    const status = gaxios.response?.status ?? (Number(gaxios.code) || 0);
    const apiError = gaxios.response?.data?.error;
    const errorMessage =
      apiError?.message ?? (error instanceof Error ? error.message : String(error));
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
      `${c.green}✅ [${result.status}] notified:${c.reset} ${result.url}`,
    );
    return;
  }
  console.log(`${c.red}❌ [${result.status || 'ERR'}] failed:${c.reset} ${result.url}`);
  if (result.errorMessage) console.log(`${c.yellow}   ${result.errorMessage}${c.reset}`);
  if (result.status === 403) {
    console.log(
      `${c.yellow}   Hint: add the service account as Owner in Search Console.${c.reset}`,
    );
  }
  if (result.status === 429) {
    console.log(
      `${c.yellow}   Rate limit — stopping this run to protect remaining quota.${c.reset}`,
    );
  }
}

async function main(): Promise<void> {
  const { dryRun, force, wave, limit } = parseArgs();
  const state = loadState();
  const allWaveUrls = loadWaveUrls(wave);
  const submitted = new Set(state.submitted);
  const pending = allWaveUrls.filter((url) => !submitted.has(url));
  const urls = pending.slice(0, limit);

  if (!dryRun) {
    assertCooldown(state, force);
    assertWaveOrder(state, wave, force);
  }

  const keyPath = dryRun ? '(dry-run)' : resolveCredentialsPath();
  const clientEmail = dryRun ? null : readServiceAccountEmail(keyPath);

  console.log('');
  console.log(
    `${c.bold}${c.cyan}PetClues → Google Indexing API (wave drip-feed)${c.reset}`,
  );
  console.log(`${c.dim}Endpoint: ${PUBLISH_ENDPOINT}${c.reset}`);
  console.log(`${c.dim}Wave: ${wave} · catalog ${allWaveUrls.length} · pending ${pending.length}${c.reset}`);
  console.log(
    `${c.dim}This run: ${urls.length} (cap ${limit}, hard max ${HARD_MAX_DAILY}) · delay ${REQUEST_DELAY_MS}ms${c.reset}`,
  );
  console.log(
    `${c.dim}Cooldown: ≥${MIN_HOURS_BETWEEN_RUNS}h between live runs · after ~6k push keep daily volume low${c.reset}`,
  );
  console.log(`${c.dim}State: ${STATE_FILE}${c.reset}`);
  if (clientEmail) {
    console.log(`${c.dim}Service account: ${clientEmail}${c.reset}`);
  }
  if (dryRun) console.log(`${c.yellow}Mode: DRY RUN (no API calls)${c.reset}`);
  if (force) console.log(`${c.yellow}Mode: --force (cooldown / wave-order gates skipped)${c.reset}`);
  console.log('');

  if (urls.length === 0) {
    console.log(`Wave ${wave} has no unsubmitted URLs remaining.`);
    return;
  }

  if (dryRun) {
    for (const url of urls) console.log(`${c.cyan}→ would notify:${c.reset} ${url}`);
    console.log('');
    console.log(
      `Dry run complete. ${urls.length} of ${pending.length} pending URLs in wave ${wave} queued.`,
    );
    console.log(
      `${c.dim}Next live step: npx tsx scripts/trigger-indexing.ts --wave=${wave} --limit=${Math.min(limit, DEFAULT_DAILY_LIMIT)}${c.reset}`,
    );
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
    const url = urls[i]!;
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
    if (i < urls.length - 1 && !abortedForRateLimit) await sleep(REQUEST_DELAY_MS);
  }

  const nextSubmitted = [...new Set([...state.submitted, ...succeeded])];
  const waveKey = String(wave);
  const waveDone = allWaveUrls.filter((u) => nextSubmitted.includes(u)).length;

  saveState({
    updatedAt: new Date().toISOString(),
    submitted: nextSubmitted,
    lastBatchDate: new Date().toISOString().slice(0, 10),
    lastBatchAt: new Date().toISOString(),
    lastBatchCount: succeeded.length,
    lastWave: wave,
    lastCursor: nextSubmitted.length,
    waveProgress: { ...state.waveProgress, [waveKey]: waveDone },
  });

  console.log('');
  console.log(
    `${c.bold}Done.${c.reset} ${c.green}${okCount} ok${c.reset} · ${failCount > 0 ? c.red : c.dim}${failCount} failed${c.reset} · wave ${wave} progress ${waveDone}/${allWaveUrls.length}`,
  );
  if (abortedForRateLimit) {
    console.log(
      `${c.yellow}Stopped early after HTTP 429. Wait ≥24h before the next live run.${c.reset}`,
    );
  } else if (waveDone < allWaveUrls.length) {
    console.log(
      `${c.dim}Continue tomorrow: npx tsx scripts/trigger-indexing.ts --wave=${wave} --limit=${DEFAULT_DAILY_LIMIT}${c.reset}`,
    );
  } else {
    const next = wave < 8 ? wave + 1 : null;
    console.log(
      next
        ? `${c.dim}Wave ${wave} complete via API drip. Wait ≥24h, then: --wave=${next}${c.reset}`
        : `${c.dim}All 8 waves have Indexing API coverage (sitemap still primary).${c.reset}`,
    );
  }

  if (failCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
