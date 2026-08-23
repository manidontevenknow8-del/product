/**
 * trigger-indexnow.ts
 *
 * Submits PetClues priority + pSEO URLs to the IndexNow protocol
 * (Bing, Yahoo, DuckDuckGo, ChatGPT Search, Yandex partners).
 *
 * Verification key (public):
 *   https://petclues.com/14ae7e11ba3258fc7b3cb61da7509164.txt
 *
 * Run:
 *   npx tsx scripts/trigger-indexnow.ts
 *   npm run seo:indexnow
 *
 * Optional:
 *   npx tsx scripts/trigger-indexnow.ts --dry-run
 */

import { PSEO_MATRIX } from '../src/data/breedConditions';
import { fileURLToPath } from 'node:url';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = 'petclues.com';
const SITE = `https://${HOST}`;

/** Must match public/{KEY}.txt contents exactly (no trailing markup). */
export const INDEXNOW_KEY = '14ae7e11ba3258fc7b3cb61da7509164';
const KEY_LOCATION = `${SITE}/${INDEXNOW_KEY}.txt`;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const STATIC_URLS: string[] = [
  SITE,
  `${SITE}/llms.txt`,
  `${SITE}/llm.txt`,
  `${SITE}/genesis`,
  `${SITE}/login`,
  `${SITE}/guides`,
  `${SITE}/digital-pet-passport`,
  `${SITE}/pet-vaccination-records`,
];

function buildUrlList(): string[] {
  const pseo = PSEO_MATRIX.map((entry) => `${SITE}/guides/${entry.slug}`);
  return [...new Set([...STATIC_URLS, ...pseo])];
}

async function verifyKeyIsPublic(): Promise<{ ok: boolean; status: number; body: string }> {
  const response = await fetch(KEY_LOCATION, { method: 'GET', redirect: 'follow' });
  const body = (await response.text()).trim();
  return {
    ok: response.ok && body === INDEXNOW_KEY,
    status: response.status,
    body,
  };
}

async function submitIndexNow(urlList: string[]): Promise<{ status: number; body: string }> {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  return { status: response.status, body };
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const urlList = buildUrlList();

  console.log('');
  console.log(`${c.bold}${c.cyan}PetClues → IndexNow${c.reset}`);
  console.log(`${c.dim}Endpoint: ${INDEXNOW_ENDPOINT}${c.reset}`);
  console.log(`${c.dim}Key: ${INDEXNOW_KEY}${c.reset}`);
  console.log(`${c.dim}Key location: ${KEY_LOCATION}${c.reset}`);
  console.log(`${c.dim}URLs queued: ${urlList.length}${c.reset}`);
  if (dryRun) console.log(`${c.yellow}Mode: DRY RUN${c.reset}`);
  console.log('');

  if (dryRun) {
    for (const url of urlList) {
      console.log(`${c.cyan}→${c.reset} ${url}`);
    }
    console.log('');
    console.log(`Dry run complete — would submit ${urlList.length} URLs.`);
    return;
  }

  console.log(`${c.dim}Checking public key file…${c.reset}`);
  const keyCheck = await verifyKeyIsPublic();
  if (!keyCheck.ok) {
    console.log(
      `${c.red}❌ Key verification failed [${keyCheck.status}]${c.reset} — expected exact key at ${KEY_LOCATION}`,
    );
    console.log(`${c.yellow}   Received: ${JSON.stringify(keyCheck.body.slice(0, 120))}${c.reset}`);
    console.log(
      `${c.yellow}   Deploy public/${INDEXNOW_KEY}.txt to production before IndexNow will accept submissions.${c.reset}`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(`${c.green}✅ Key file is publicly reachable and matches.${c.reset}`);
  console.log('');

  const result = await submitIndexNow(urlList);

  // IndexNow success codes: 200 (OK), 202 (Accepted)
  if (result.status === 200 || result.status === 202) {
    console.log(
      `${c.green}✅ [${result.status}] IndexNow accepted ${urlList.length} URLs for ${HOST}${c.reset}`,
    );
    if (result.body.trim()) {
      console.log(`${c.dim}   Response: ${result.body.trim()}${c.reset}`);
    }
    console.log('');
    console.log(`${c.bold}Submitted ${urlList.length} URLs.${c.reset}`);
    return;
  }

  console.log(
    `${c.red}❌ [${result.status}] IndexNow rejected submission (${urlList.length} URLs)${c.reset}`,
  );
  if (result.body.trim()) {
    console.log(`${c.yellow}   ${result.body.trim()}${c.reset}`);
  }
  process.exitCode = 1;
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
