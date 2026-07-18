/**
 * trigger-indexing.ts
 *
 * Pings the Google Indexing API (urlNotifications:publish) so Googlebot
 * re-crawls priority PetClues URLs after SEO schema / llm.txt deploys.
 *
 * Prerequisites:
 *  1. Enable "Web Search Indexing API" in the Google Cloud project.
 *  2. Service account JSON key at ./service_account.json OR set:
 *       GSC_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/key.json
 *       # or GOOGLE_APPLICATION_CREDENTIALS=...
 *  3. In Google Search Console → Settings → Users and permissions, add the
 *     service account client_email as an **Owner** of https://petclues.com/
 *     (Editor is not enough — Owner is required or you get HTTP 403).
 *
 * Run:
 *   npx tsx scripts/trigger-indexing.ts
 *   npm run google:trigger-indexing
 *
 * Optional:
 *   npx tsx scripts/trigger-indexing.ts --from-sitemap
 *   npx tsx scripts/trigger-indexing.ts --dry-run
 *
 * googleapis is already a project dependency. If missing:
 *   npm install googleapis
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
const REQUEST_DELAY_MS = 500;

// ANSI colors (no chalk dependency)
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// ── Env loading (tsx does not auto-load Vite env files) ───────────────────────

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

// ── Priority URLs (post–SEO schema / llm.txt deploy) ──────────────────────────

/**
 * High-ROI URLs to notify immediately after schema + llm.txt ship.
 *
 * Note: `/guides/ivdd-in-corgis` is not a live route. The IVDD MedicalWebPage
 * work lives on the blog URLs below (and related emergency / BOAS posts).
 *
 * To scale later — dynamically load every <loc> from sitemap.xml:
 *
 *   import { readFileSync } from 'node:fs';
 *   const xml = readFileSync('public/sitemap.xml', 'utf8');
 *   // or fetch('https://petclues.com/sitemap-index.xml') then each child sitemap
 *   const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
 *   // Then batch with REQUEST_DELAY_MS (Indexing API ~200 publishes/day/property).
 */
const PRIORITY_URLS: string[] = [
  'https://petclues.com',
  'https://petclues.com/llm.txt',
  'https://petclues.com/llms.txt',
  'https://petclues.com/guides',
  'https://petclues.com/digital-pet-passport',
  'https://petclues.com/pet-vaccination-records',
  'https://petclues.com/blog/corgi-spine-health-ivdd-ramps-reality',
  'https://petclues.com/blog/dog-dragging-back-legs-ivdd-emergency',
  'https://petclues.com/blog/french-bulldog-surgery-costs-boas-ivdd',
  // Invitation / auth surfaces (robots Disallow — still notify if you want GSC awareness)
  'https://petclues.com/genesis',
  'https://petclues.com/login',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function parseArgs(): { dryRun: boolean; fromSitemap: boolean } {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    fromSitemap: args.includes('--from-sitemap'),
  };
}

/** Pull <loc> values from local sitemap files (core + blog + guides + commercial + faq). */
function loadUrlsFromLocalSitemaps(): string[] {
  const files = [
    'public/sitemap-core.xml',
    'public/sitemap-blog.xml',
    'public/sitemap-guides.xml',
    'public/sitemap-commercial.xml',
    'public/sitemap-faq.xml',
  ];

  const urls = new Set<string>();
  for (const file of files) {
    const path = join(PROJECT_ROOT, file);
    if (!existsSync(path)) continue;
    const xml = readFileSync(path, 'utf8');
    for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
      urls.add(match[1].trim());
    }
  }

  return [...urls].sort();
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
    if (result.body) {
      console.log(`${c.dim}   ${JSON.stringify(result.body)}${c.reset}`);
    }
    return;
  }

  console.log(
    `${c.red}❌ [${result.status || 'ERR'}] Failed for:${c.reset} ${result.url}`,
  );
  if (result.errorMessage) {
    console.log(`${c.yellow}   ${result.errorMessage}${c.reset}`);
  }
  if (result.body) {
    console.log(`${c.dim}   ${JSON.stringify(result.body)}${c.reset}`);
  }
  if (result.status === 403) {
    console.log(
      `${c.yellow}   Hint: add the service account client_email as Owner in Search Console.${c.reset}`,
    );
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { dryRun, fromSitemap } = parseArgs();
  const keyPath = resolveCredentialsPath();
  const clientEmail = readServiceAccountEmail(keyPath);

  const urls = fromSitemap ? loadUrlsFromLocalSitemaps() : PRIORITY_URLS;

  console.log('');
  console.log(`${c.bold}${c.cyan}PetClues → Google Indexing API${c.reset}`);
  console.log(`${c.dim}Endpoint: ${PUBLISH_ENDPOINT}${c.reset}`);
  console.log(`${c.dim}Key file: ${keyPath}${c.reset}`);
  if (clientEmail) {
    console.log(`${c.dim}Service account: ${clientEmail}${c.reset}`);
    console.log(
      `${c.yellow}Reminder: this email must be an Owner in GSC for https://petclues.com/${c.reset}`,
    );
  }
  console.log(`${c.dim}URLs: ${urls.length} · delay: ${REQUEST_DELAY_MS}ms${c.reset}`);
  if (dryRun) console.log(`${c.yellow}Mode: DRY RUN (no API calls)${c.reset}`);
  console.log('');

  if (dryRun) {
    for (const url of urls) {
      console.log(`${c.cyan}→ would notify:${c.reset} ${url}`);
    }
    console.log('');
    console.log('Dry run complete.');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: [INDEXING_SCOPE],
  });

  const indexing = google.indexing({ version: 'v3', auth });

  let okCount = 0;
  let failCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const result = await publishUrlUpdated(indexing, url);
    logResult(result);

    if (result.ok) okCount += 1;
    else failCount += 1;

    if (i < urls.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  console.log('');
  console.log(
    `${c.bold}Done.${c.reset} ${c.green}${okCount} ok${c.reset} · ${failCount > 0 ? c.red : c.dim}${failCount} failed${c.reset}`,
  );

  if (failCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
