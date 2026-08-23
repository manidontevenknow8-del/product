/**
 * submit-indexnow-urls.ts
 *
 * Submit arbitrary URL lists to IndexNow (Bing, Yahoo, DuckDuckGo, ChatGPT Search, Yandex).
 *
 * Usage:
 *   npx tsx scripts/submit-indexnow-urls.ts https://petclues.com/blog/post1 https://petclues.com/blog/post2
 *   npx tsx scripts/submit-indexnow-urls.ts --wave=1
 *   npx tsx scripts/submit-indexnow-urls.ts --all-waves
 *   npx tsx scripts/submit-indexnow-urls.ts --file=urls.txt
 *   npx tsx scripts/submit-indexnow-urls.ts --dry-run --wave=3
 *
 * npm scripts:
 *   npm run seo:indexnow:waves         (submits all waves)
 *   npm run seo:indexnow:file -- --file=path/to/urls.txt
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
const MAX_URLS_PER_REQUEST = 10_000;

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

  const fileArg = args.find((a) => a.startsWith('--file='));
  const filePath = fileArg ? fileArg.split('=')[1] : undefined;

  const urls = args.filter((a) => !a.startsWith('--') && (a.startsWith('http://') || a.startsWith('https://')));

  return { dryRun, allWaves, waveNum, filePath, urls };
}

function loadWaveUrls(wave: number): string[] {
  const file = join(
    PROJECT_ROOT,
    'content-data/generated/publish-waves',
    `wave-${String(wave).padStart(2, '0')}-urls.txt`,
  );
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function loadManifest(): { waves: { wave: number; count: number }[] } | null {
  const path = join(PROJECT_ROOT, 'content-data/generated/publish-waves/manifest.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadFileUrls(filePath: string): string[] {
  const resolved = filePath.startsWith('/') ? filePath : join(PROJECT_ROOT, filePath);
  if (!existsSync(resolved)) {
    console.error(`${c.red}File not found: ${resolved}${c.reset}`);
    process.exit(1);
  }
  return readFileSync(resolved, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && l.startsWith('http'));
}

function collectUrls(opts: ReturnType<typeof parseArgs>): string[] {
  const { allWaves, waveNum, filePath, urls: cliUrls } = opts;

  if (allWaves) {
    const manifest = loadManifest();
    if (!manifest) {
      console.error(`${c.red}No publish-wave manifest found. Run: npm run prepare:publish-waves${c.reset}`);
      process.exit(1);
    }
    const all: string[] = [];
    for (const w of manifest.waves) {
      all.push(...loadWaveUrls(w.wave));
    }
    return [...new Set(all)];
  }

  if (waveNum !== undefined) {
    const urls = loadWaveUrls(waveNum);
    if (urls.length === 0) {
      console.error(`${c.red}No URLs found for wave ${waveNum}${c.reset}`);
      process.exit(1);
    }
    return urls;
  }

  if (filePath) {
    return loadFileUrls(filePath);
  }

  if (cliUrls.length > 0) {
    return cliUrls;
  }

  console.error(`${c.red}No URLs provided. Use --wave=N, --all-waves, --file=path, or pass URLs as arguments.${c.reset}`);
  process.exit(1);
}

async function submitChunk(urls: string[]): Promise<{ status: number; body: string }> {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  return { status: response.status, body: await response.text() };
}

async function main(): Promise<void> {
  const opts = parseArgs();
  const urls = collectUrls(opts);

  console.log('');
  console.log(`${c.bold}${c.cyan}PetClues → IndexNow (Batch Submit)${c.reset}`);
  console.log(`${c.dim}Endpoint: ${INDEXNOW_ENDPOINT}${c.reset}`);
  console.log(`${c.dim}Key: ${INDEXNOW_KEY}${c.reset}`);
  console.log(`${c.dim}Total URLs: ${urls.length}${c.reset}`);
  console.log(`${c.dim}Chunks needed: ${Math.ceil(urls.length / MAX_URLS_PER_REQUEST)}${c.reset}`);
  if (opts.dryRun) console.log(`${c.yellow}Mode: DRY RUN${c.reset}`);
  console.log('');

  if (opts.dryRun) {
    const preview = urls.slice(0, 20);
    for (const url of preview) {
      console.log(`  ${c.cyan}→${c.reset} ${url}`);
    }
    if (urls.length > 20) {
      console.log(`  ${c.dim}… and ${urls.length - 20} more${c.reset}`);
    }
    console.log('');
    console.log(`${c.green}Dry run complete — would submit ${urls.length} URLs in ${Math.ceil(urls.length / MAX_URLS_PER_REQUEST)} chunk(s).${c.reset}`);
    return;
  }

  let totalSuccess = 0;
  let totalFailed = 0;

  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    const chunk = urls.slice(i, i + MAX_URLS_PER_REQUEST);
    const chunkIdx = Math.floor(i / MAX_URLS_PER_REQUEST) + 1;
    const totalChunks = Math.ceil(urls.length / MAX_URLS_PER_REQUEST);

    console.log(`${c.dim}Submitting chunk ${chunkIdx}/${totalChunks} (${chunk.length} URLs)…${c.reset}`);
    const result = await submitChunk(chunk);

    if (result.status === 200 || result.status === 202) {
      console.log(`${c.green}  ✅ [${result.status}] Chunk ${chunkIdx} accepted${c.reset}`);
      totalSuccess += chunk.length;
    } else {
      console.log(`${c.red}  ❌ [${result.status}] Chunk ${chunkIdx} rejected${c.reset}`);
      if (result.body.trim()) console.log(`${c.yellow}     ${result.body.trim()}${c.reset}`);
      totalFailed += chunk.length;
    }
  }

  console.log('');
  console.log(`${c.bold}Results: ${totalSuccess} accepted, ${totalFailed} failed.${c.reset}`);
  if (totalFailed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
