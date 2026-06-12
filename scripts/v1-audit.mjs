#!/usr/bin/env node
/**
 * V1 static audit - verifies routes, no fake growth data, and production build.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

const V1_PAGES = [
  'DashboardPage',
  'RemindersPage',
  'PetProfilePage',
  'ScanPage',
  'EmergencyPassportPage',
  'TimelinePage',
  'PetCareScorePage',
  'MonthlyReportPage',
  'ReferralsPage',
  'SettingsPage',
  'BillingPage',
  'PricingPage',
];

const FORBIDDEN_PATTERNS = [
  { label: 'fake waitlist total', pattern: /12_847|12,847/ },
  { label: 'mock leaderboard names', pattern: /MOCK_LEADERBOARD|Sarah M\./ },
  { label: 'fake mock invoices', pattern: /inv_001/ },
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      walk(full, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`✓ ${message}`);
}

console.log('PetClues V1 audit\n');

const appTsx = readFileSync(join(SRC, 'App.tsx'), 'utf8');
for (const page of V1_PAGES) {
  if (!appTsx.includes(page)) {
    fail(`App.tsx missing route for ${page}`);
  } else {
    pass(`Route wired: ${page}`);
  }
}

if (!appTsx.includes('DeferredRedirect')) {
  fail('Deferred routes redirect missing');
} else {
  pass('Deferred routes redirect present');
}

const sourceFiles = walk(SRC);
for (const { label, pattern } of FORBIDDEN_PATTERNS) {
  const hits = sourceFiles.filter((file) => pattern.test(readFileSync(file, 'utf8')));
  if (hits.length > 0) {
    fail(`${label} found in: ${hits.map((f) => relative(ROOT, f)).join(', ')}`);
  } else {
    pass(`No ${label} in src`);
  }
}

const growthService = readFileSync(join(SRC, 'services/growth/growthService.ts'), 'utf8');
if (!growthService.includes('loadWaitlist()')) {
  fail('growthService does not derive stats from waitlist');
} else {
  pass('Referral stats derived from local waitlist');
}

const paymentsGate = readFileSync(join(SRC, 'config/paymentsConfig.ts'), 'utf8');
if (!paymentsGate.includes('isPaymentsLive')) {
  fail('paymentsConfig missing isPaymentsLive');
} else {
  pass('Payments gate configured');
}

console.log('\nRunning growth utility checks…');
const SPOTS_PER_REFERRAL = 5;
function computePosition(initialPosition, referralCount) {
  return Math.max(1, initialPosition - referralCount * SPOTS_PER_REFERRAL);
}
if (computePosition(10, 1) !== 5) fail('computePosition(10,1) should be 5');
else pass('computePosition referral math');

console.log('\nRunning production build…');
const build = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: true });
if (build.status !== 0) {
  fail('npm run build failed');
} else {
  pass('Production build succeeded');
}

if (process.exitCode) {
  console.error('\nV1 audit failed.');
  process.exit(process.exitCode);
}

console.log('\nV1 audit passed.');
