/**
 * Run Indexing API across publish waves until today's quota is used or all
 * PASS URLs are submitted. Respects Google's ~200/day publish limit and the
 * 24h cooldown in trigger-indexing.ts.
 *
 * Exit codes:
 *   0  — all wave URLs submitted
 *  10  — more URLs remain (ran today's batch, or already at daily cap)
 *  11  — cooldown / nothing to do yet today
 *   1  — error
 *
 * Usage:
 *   npx tsx scripts/run-indexing-waves.ts
 *   npx tsx scripts/run-indexing-waves.ts --limit=200
 *   npx tsx scripts/run-indexing-waves.ts --dry-run
 *   npx tsx scripts/run-indexing-waves.ts --force   # skip 24h gate (use sparingly)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const STATE_FILE = join(root, '.indexing-state.json');
const MANIFEST = join(root, 'content-data/generated/publish-waves/manifest.json');
const HARD_MAX_DAILY = 200;
const MIN_HOURS_BETWEEN_RUNS = 24;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force') || args.includes('--all');
const blastAll = args.includes('--all');
const limitArg = args.find((a) => a.startsWith('--limit='));
const dailyBudget = blastAll
  ? 2000
  : Math.min(
      force ? 2000 : HARD_MAX_DAILY,
      Math.max(1, Number(limitArg?.split('=')[1] ?? String(HARD_MAX_DAILY)) || HARD_MAX_DAILY),
    );

type IndexingState = {
  submitted?: string[];
  lastBatchDate?: string | null;
  lastBatchAt?: string | null;
  lastBatchCount?: number;
};

function loadState(): IndexingState {
  if (!existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as IndexingState;
  } catch {
    return {};
  }
}

function submittedCount(state = loadState()): number {
  return Array.isArray(state.submitted) ? state.submitted.length : 0;
}

function hoursSinceLastBatch(state = loadState()): number | null {
  if (!state.lastBatchAt) return null;
  const last = Date.parse(state.lastBatchAt);
  if (!Number.isFinite(last)) return null;
  return (Date.now() - last) / 3_600_000;
}

function loadWaveUrls(wave: number): string[] {
  const file = join(
    root,
    'content-data/generated/publish-waves',
    `wave-${String(wave).padStart(2, '0')}.json`,
  );
  if (!existsSync(file)) return [];
  const payload = JSON.parse(readFileSync(file, 'utf8')) as { urls: { url: string }[] };
  return payload.urls.map((u) => u.url);
}

if (!existsSync(MANIFEST)) {
  console.error('Missing publish waves. Run: npm run prepare:publish-waves');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as {
  waves: { wave: number; count: number }[];
};

const totalWaveUrls = manifest.waves.reduce((n, w) => n + w.count, 0);
const state = loadState();
const startSubmitted = submittedCount(state);
const submittedSet = new Set(state.submitted ?? []);

let pendingTotal = 0;
for (const wave of manifest.waves) {
  for (const url of loadWaveUrls(wave.wave)) {
    if (!submittedSet.has(url)) pendingTotal += 1;
  }
}

console.log(
  `Indexing waves · daily budget ${dailyBudget} · submitted ${startSubmitted}/${totalWaveUrls} · pending ${pendingTotal}`,
);
if (dryRun) console.log('DRY RUN mode');

if (pendingTotal === 0) {
  console.log('All publish-wave URLs already submitted via Indexing API.');
  process.exit(0);
}

const hours = hoursSinceLastBatch(state);
if (!dryRun && !force && hours !== null && hours < MIN_HOURS_BETWEEN_RUNS) {
  const waitH = (MIN_HOURS_BETWEEN_RUNS - hours).toFixed(1);
  console.log(
    `Cooldown active: last batch ${hours.toFixed(1)}h ago. Wait ~${waitH}h more (or pass --force).`,
  );
  process.exit(11);
}

let usedToday = 0;
let firstLiveWave = true;

for (const wave of manifest.waves) {
  const remainingBudget = dailyBudget - usedToday;
  if (remainingBudget <= 0) {
    console.log(`Daily budget exhausted after ${usedToday} notifies. Resume tomorrow.`);
    break;
  }

  const waveUrls = loadWaveUrls(wave.wave);
  const wavePending = waveUrls.filter((url) => !submittedSet.has(url)).length;
  if (wavePending === 0) {
    console.log(`Wave ${wave.wave}: already complete, skipping.`);
    continue;
  }

  const cmdArgs = [
    'tsx',
    'scripts/trigger-indexing.ts',
    `--wave=${wave.wave}`,
    `--limit=${remainingBudget}`,
  ];
  // First live wave of the session respects cooldown (already checked).
  // Later waves in the same session need --force so the just-updated lastBatchAt
  // does not block continuing today's remaining quota.
  if (force || (!firstLiveWave && !dryRun)) cmdArgs.push('--force');
  if (dryRun) cmdArgs.push('--dry-run');

  console.log(`\n=== Wave ${wave.wave} (pending ${wavePending}, up to ${remainingBudget}) ===`);
  const result = spawnSync('npx', cmdArgs, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0 && result.status !== null) {
    console.error(`Wave ${wave.wave} exited with ${result.status}; stopping.`);
    process.exit(result.status);
  }

  if (dryRun) {
    usedToday += Math.min(remainingBudget, wavePending);
    firstLiveWave = false;
    continue;
  }

  const afterState = loadState();
  const after = submittedCount(afterState);
  const gained = Math.max(0, after - startSubmitted - usedToday);
  usedToday = after - startSubmitted;
  for (const url of afterState.submitted ?? []) submittedSet.add(url);
  firstLiveWave = false;

  console.log(
    `Session progress: ${usedToday}/${dailyBudget} today · total submitted ${after}/${totalWaveUrls}`,
  );

  if (gained === 0) continue;
}

const finalSubmitted = submittedCount();
const remaining = Math.max(0, totalWaveUrls - finalSubmitted);

console.log(`\nDone. Session submitted ~${usedToday}. Total ${finalSubmitted}/${totalWaveUrls}.`);

if (remaining === 0) {
  console.log('All publish-wave URLs have Indexing API coverage.');
  process.exit(0);
}

console.log(
  `${remaining} URLs remain. Re-run after ≥${MIN_HOURS_BETWEEN_RUNS}h (daily cap ${HARD_MAX_DAILY}).`,
);
process.exit(usedToday > 0 || dryRun ? 10 : 11);
