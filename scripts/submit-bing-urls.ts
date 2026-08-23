/**
 * submit-bing-urls.ts
 *
 * Submit URLs to Bing Webmaster Tools via the SubmitUrlBatch API.
 * Bing allows up to 10 URLs per batch, 10,000 URLs/day quota.
 *
 * Usage:
 *   npx tsx scripts/submit-bing-urls.ts --wave=1
 *   npx tsx scripts/submit-bing-urls.ts --all-waves
 *   npx tsx scripts/submit-bing-urls.ts --all-waves --limit=500
 *   npx tsx scripts/submit-bing-urls.ts --all-waves --dry-run
 *
 * npm script:
 *   npm run seo:bing-submit -- --wave=1
 *
 * Env: BING_WEBMASTER_API_KEY in .env or .env.local
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const SITE_URL = 'https://petclues.com';
const BING_SUBMIT_URL_BATCH = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=`;
const BING_BATCH_MAX = 10;

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const allWaves = args.includes('--all-waves');

  const waveArg = args.find((a) => a.startsWith('--wave='));
  const waveNum = waveArg ? Number(waveArg.split('=')[1]) : undefined;

  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;

  return { dryRun, allWaves, waveNum, limit };
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
  const { allWaves, waveNum } = opts;

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

  const cliUrls = process.argv.slice(2).filter((a) => !a.startsWith('--') && a.startsWith('http'));
  if (cliUrls.length > 0) return cliUrls;

  console.error(`${c.red}Provide --wave=N, --all-waves, or URL arguments.${c.reset}`);
  process.exit(1);
}

async function submitBatch(apiKey: string, urls: string[]): Promise<{ ok: boolean; status: number; body: string }> {
  const response = await fetch(`${BING_SUBMIT_URL_BATCH}${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteUrl: SITE_URL, urlList: urls }),
  });
  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

async function main(): Promise<void> {
  const opts = parseArgs();
  const apiKey = process.env.BING_WEBMASTER_API_KEY?.trim();

  if (!apiKey) {
    console.log(`${c.yellow}⚠ BING_WEBMASTER_API_KEY not set — skipping Bing URL submission.${c.reset}`);
    console.log(`${c.dim}Set it in .env.local or export BING_WEBMASTER_API_KEY=your-key${c.reset}`);
    return;
  }

  let urls = collectUrls(opts);
  if (opts.limit && opts.limit > 0) {
    urls = urls.slice(0, opts.limit);
  }

  console.log('');
  console.log(`${c.bold}${c.cyan}PetClues → Bing Webmaster URL Submit${c.reset}`);
  console.log(`${c.dim}Site: ${SITE_URL}${c.reset}`);
  console.log(`${c.dim}Total URLs: ${urls.length}${c.reset}`);
  console.log(`${c.dim}Batches (max ${BING_BATCH_MAX}/batch): ${Math.ceil(urls.length / BING_BATCH_MAX)}${c.reset}`);
  if (opts.dryRun) console.log(`${c.yellow}Mode: DRY RUN${c.reset}`);
  console.log('');

  if (opts.dryRun) {
    const preview = urls.slice(0, 15);
    for (const url of preview) console.log(`  ${c.cyan}→${c.reset} ${url}`);
    if (urls.length > 15) console.log(`  ${c.dim}… and ${urls.length - 15} more${c.reset}`);
    console.log(`\n${c.green}Dry run complete — would submit ${urls.length} URLs.${c.reset}`);
    return;
  }

  let accepted = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i += BING_BATCH_MAX) {
    const batch = urls.slice(i, i + BING_BATCH_MAX);
    const batchNum = Math.floor(i / BING_BATCH_MAX) + 1;

    const result = await submitBatch(apiKey, batch);
    if (result.ok) {
      console.log(`${c.green}  ✅ Batch ${batchNum}: ${batch.length} URLs accepted${c.reset}`);
      accepted += batch.length;
    } else {
      console.log(`${c.red}  ❌ Batch ${batchNum} [${result.status}]: ${result.body.slice(0, 200)}${c.reset}`);
      failed += batch.length;
    }

    if (i + BING_BATCH_MAX < urls.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log('');
  console.log(`${c.bold}Results: ${accepted} accepted, ${failed} failed.${c.reset}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
