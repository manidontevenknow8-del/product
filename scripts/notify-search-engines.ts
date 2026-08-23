/**
 * notify-search-engines.ts
 *
 * Post-publish hook: notify IndexNow + optionally Google Indexing API.
 *
 * Usage:
 *   npx tsx scripts/notify-search-engines.ts --wave=1
 *   npx tsx scripts/notify-search-engines.ts --all-waves
 *   npx tsx scripts/notify-search-engines.ts --all-waves --google-limit=10
 *   npx tsx scripts/notify-search-engines.ts https://petclues.com/page1 https://petclues.com/page2
 *   npx tsx scripts/notify-search-engines.ts --dry-run --wave=2
 *
 * npm:
 *   npm run seo:notify -- --wave=1
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INDEXNOW_KEY } from './trigger-indexnow';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = 'petclues.com';
const SITE = `https://${HOST}`;
const KEY_LOCATION = `${SITE}/${INDEXNOW_KEY}.txt`;
const MAX_INDEXNOW_CHUNK = 10_000;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const allWaves = args.includes('--all-waves');

  const waveArg = args.find((a) => a.startsWith('--wave='));
  const waveNum = waveArg ? Number(waveArg.split('=')[1]) : undefined;

  const googleLimitArg = args.find((a) => a.startsWith('--google-limit='));
  const googleLimit = googleLimitArg ? Number(googleLimitArg.split('=')[1]) : 0;

  const cliUrls = args.filter((a) => !a.startsWith('--') && a.startsWith('http'));

  return { dryRun, allWaves, waveNum, googleLimit, cliUrls };
}

function loadWaveUrls(wave: number): string[] {
  const file = join(
    PROJECT_ROOT,
    'content-data/generated/publish-waves',
    `wave-${String(wave).padStart(2, '0')}-urls.txt`,
  );
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
}

function loadManifest(): { waves: { wave: number; count: number }[] } | null {
  const path = join(PROJECT_ROOT, 'content-data/generated/publish-waves/manifest.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function collectUrls(opts: ReturnType<typeof parseArgs>): string[] {
  const { allWaves, waveNum, cliUrls } = opts;

  if (allWaves) {
    const manifest = loadManifest();
    if (!manifest) {
      console.error(`${c.red}No manifest. Run: npm run prepare:publish-waves${c.reset}`);
      process.exit(1);
    }
    const all: string[] = [];
    for (const w of manifest.waves) all.push(...loadWaveUrls(w.wave));
    return [...new Set(all)];
  }

  if (waveNum !== undefined) {
    const urls = loadWaveUrls(waveNum);
    if (urls.length === 0) {
      console.error(`${c.red}No URLs for wave ${waveNum}${c.reset}`);
      process.exit(1);
    }
    return urls;
  }

  if (cliUrls.length > 0) return cliUrls;

  console.error(`${c.red}Provide --wave=N, --all-waves, or URL arguments.${c.reset}`);
  process.exit(1);
}

async function submitIndexNow(urls: string[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i += MAX_INDEXNOW_CHUNK) {
    const chunk = urls.slice(i, i + MAX_INDEXNOW_CHUNK);
    const payload = { host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList: chunk };

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (response.status === 200 || response.status === 202) {
      success += chunk.length;
    } else {
      failed += chunk.length;
      console.log(`${c.red}  IndexNow chunk rejected [${response.status}]: ${(await response.text()).slice(0, 200)}${c.reset}`);
    }
  }

  return { success, failed };
}

async function submitGoogle(urls: string[], limit: number, dryRun: boolean): Promise<number> {
  if (limit <= 0) return 0;

  let requestGoogleIndex: ((url: string) => Promise<unknown>) | null = null;
  try {
    const mod = await import('./request-google-index');
    requestGoogleIndex = mod.requestGoogleIndex;
  } catch {
    console.log(`${c.yellow}  Google Indexing API module not loadable (missing credentials?). Skipping.${c.reset}`);
    return 0;
  }

  const subset = urls.slice(0, limit);
  let submitted = 0;

  for (const url of subset) {
    if (dryRun) {
      console.log(`${c.dim}  [dry-run] Google Indexing → ${url}${c.reset}`);
      submitted++;
      continue;
    }

    try {
      await requestGoogleIndex(url);
      console.log(`${c.green}  ✓ Google Indexing → ${url}${c.reset}`);
      submitted++;
      await new Promise((r) => setTimeout(r, 2500));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
        console.log(`${c.yellow}  ⚠ Google quota reached after ${submitted} requests. Stopping.${c.reset}`);
        break;
      }
      console.log(`${c.red}  ✗ Google Indexing failed for ${url}: ${msg}${c.reset}`);
    }
  }

  return submitted;
}

async function main(): Promise<void> {
  const opts = parseArgs();
  const urls = collectUrls(opts);

  console.log('');
  console.log(`${c.bold}${c.cyan}PetClues → Notify Search Engines${c.reset}`);
  console.log(`${c.dim}URLs: ${urls.length}${c.reset}`);
  console.log(`${c.dim}IndexNow: all URLs${c.reset}`);
  console.log(`${c.dim}Google Indexing API: first ${opts.googleLimit} (--google-limit)${c.reset}`);
  if (opts.dryRun) console.log(`${c.yellow}Mode: DRY RUN${c.reset}`);
  console.log('');

  // IndexNow
  console.log(`${c.bold}1. IndexNow${c.reset}`);
  if (opts.dryRun) {
    console.log(`${c.dim}  Would submit ${urls.length} URLs to IndexNow${c.reset}`);
  } else {
    const { success, failed } = await submitIndexNow(urls);
    console.log(`${c.green}  IndexNow: ${success} accepted, ${failed} failed${c.reset}`);
  }

  // Google Indexing API
  if (opts.googleLimit > 0) {
    console.log('');
    console.log(`${c.bold}2. Google Indexing API (limit: ${opts.googleLimit})${c.reset}`);
    const googleSubmitted = await submitGoogle(urls, opts.googleLimit, opts.dryRun);
    console.log(`${c.dim}  Google: ${googleSubmitted} submitted${c.reset}`);
  }

  console.log('');
  console.log(`${c.green}${c.bold}Done.${c.reset}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
