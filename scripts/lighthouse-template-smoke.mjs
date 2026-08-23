#!/usr/bin/env node
/**
 * lighthouse-template-smoke.mjs
 *
 * Run Lighthouse against a small set of production template URLs to verify
 * performance, accessibility, SEO, and best practices.
 *
 * Usage:
 *   node scripts/lighthouse-template-smoke.mjs
 *   node scripts/lighthouse-template-smoke.mjs --local
 *   node scripts/lighthouse-template-smoke.mjs --local --port=4173
 *
 * Output:
 *   content-data/generated/reports/lighthouse-smoke-summary.json
 *
 * Prerequisites:
 *   - lighthouse CLI: npm install -g lighthouse OR use via npx
 *   - Chrome/Chromium installed (headless mode)
 *
 * npm:
 *   npm run perf:lighthouse-smoke
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const REPORTS_DIR = join(PROJECT_ROOT, 'content-data/generated/reports');

const args = process.argv.slice(2);
const isLocal = args.includes('--local');
const portArg = args.find((a) => a.startsWith('--port='));
const port = portArg ? portArg.split('=')[1] : '4173';

const BASE = isLocal ? `http://localhost:${port}` : 'https://petclues.com';

const TEMPLATE_URLS = [
  { label: 'home', path: '/' },
  { label: 'breed-guide', path: '/guides/golden-retriever-hip-dysplasia' },
  { label: 'symptom-guide', path: '/guides/dog-vomiting-blood' },
  { label: 'emergency-guide', path: '/emergency' },
  { label: 'vaccination-guide', path: '/vaccinations' },
];

function hasLighthouse() {
  try {
    execSync('npx lighthouse --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function runLighthouse(url, label) {
  const tmpJson = join(REPORTS_DIR, `lighthouse-${label}.json`);
  const cmd = [
    'npx lighthouse',
    `"${url}"`,
    '--output=json',
    `--output-path="${tmpJson}"`,
    '--chrome-flags="--headless --no-sandbox"',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--quiet',
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 120_000, cwd: PROJECT_ROOT });

    if (existsSync(tmpJson)) {
      const raw = JSON.parse(readFileSync(tmpJson, 'utf8'));
      const scores = {};
      for (const [key, cat] of Object.entries(raw.categories || {})) {
        scores[key] = Math.round(cat.score * 100);
      }
      return { url, label, scores, error: null };
    }
  } catch (err) {
    return { url, label, scores: null, error: err.message?.slice(0, 200) || 'unknown error' };
  }

  return { url, label, scores: null, error: 'No output JSON produced' };
}

function main() {
  if (!hasLighthouse()) {
    console.log('⚠ Lighthouse CLI not found.');
    console.log('  Install: npm install -g lighthouse');
    console.log('  Or run:  npx lighthouse <url> --output=json');
    console.log('');
    console.log('Template URLs that would be tested:');
    for (const { label, path } of TEMPLATE_URLS) {
      console.log(`  ${label}: ${BASE}${path}`);
    }
    process.exit(0);
  }

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });

  console.log(`Lighthouse smoke test — base: ${BASE}`);
  console.log(`Testing ${TEMPLATE_URLS.length} template URLs…\n`);

  const results = [];

  for (const { label, path } of TEMPLATE_URLS) {
    const url = `${BASE}${path}`;
    console.log(`  Running: ${label} → ${url}`);
    const result = runLighthouse(url, label);
    results.push(result);

    if (result.scores) {
      const s = result.scores;
      console.log(`    Perf: ${s.performance ?? '?'} | A11y: ${s.accessibility ?? '?'} | BP: ${s['best-practices'] ?? '?'} | SEO: ${s.seo ?? '?'}`);
    } else {
      console.log(`    ❌ ${result.error}`);
    }
  }

  const summary = {
    timestamp: new Date().toISOString(),
    base: BASE,
    local: isLocal,
    results,
  };

  const outputPath = join(REPORTS_DIR, 'lighthouse-smoke-summary.json');
  writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`\nSummary written to: ${outputPath}`);
}

main();
