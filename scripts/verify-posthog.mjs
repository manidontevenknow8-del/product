/**
 * Verifies PostHog init, test event, and network requests to us.i.posthog.com.
 * Usage: node scripts/verify-posthog.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const baseUrl = process.argv[2] ?? 'http://localhost:5173/';
const POSTHOG_HOST = 'us.i.posthog.com';

const consoleLogs = [];
const posthogRequests = [];

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
});
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', (msg) => {
  const text = msg.text();
  if (text.includes('[POSTHOG DEBUG]') || text.includes('posthog')) {
    consoleLogs.push({ type: msg.type(), text });
  }
});

const recordPosthogTraffic = async (req, phase) => {
  const url = req.url();
  if (!url.includes('posthog')) return;
  const response = phase === 'response' ? req : await req.response();
  let body = '';
  try {
    body = response ? (await response.text()).slice(0, 300) : '';
  } catch {
    body = '(unreadable)';
  }
  posthogRequests.push({
    phase,
    url,
    method: req.method?.() ?? req.request?.().method?.() ?? 'GET',
    status: response?.status?.() ?? null,
    postData: req.postData?.()?.slice(0, 120) ?? req.request?.().postData?.()?.slice(0, 120) ?? null,
    body,
  });
};

page.on('request', (req) => {
  if (req.url().includes('posthog')) {
    posthogRequests.push({ phase: 'request', url: req.url(), method: req.method(), postData: req.postData()?.slice(0, 80) ?? null });
  }
});

page.on('response', async (res) => {
  if (res.url().includes('posthog')) await recordPosthogTraffic(res, 'response');
});

console.log(`\n=== PostHog verification: ${baseUrl} ===\n`);

await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(6000);

// Force any batched events to flush
await page.evaluate(async () => {
  const mod = await import('/src/analytics/posthog.ts');
  mod.capturePostHogEvent('posthog_verification_flush');
  mod.posthog.capture('$pageview', { path: '/', title: 'verification' });
  mod.posthog.capture('$snapshot', {});
});

await page.waitForTimeout(3000);

const state = await page.evaluate(() => {
  const phKeys = Object.keys(localStorage).filter((k) => k.includes('posthog') || k.startsWith('ph_'));
  return {
    posthogOnWindow: typeof window.posthog !== 'undefined',
    posthogLoaded: window.posthog?.__loaded ?? null,
    distinctId: window.posthog?.get_distinct_id?.() ?? null,
    localStorageKeys: phKeys,
  };
});

console.log('--- Console ([POSTHOG DEBUG]) ---');
if (consoleLogs.length === 0) {
  console.log('(none captured)');
} else {
  for (const log of consoleLogs) {
    console.log(`[${log.type}] ${log.text}`);
  }
}

console.log('\n--- PostHog client state ---');
console.log(JSON.stringify(state, null, 2));

console.log('\n--- Network (us.i.posthog.com) ---');
const responses = posthogRequests.filter((r) => r.phase === 'response');
if (responses.length === 0) {
  console.log('NO requests to us.i.posthog.com detected');
} else {
  for (const r of responses) {
    console.log(`${r.status} ${r.url}`);
    if (r.body) console.log(`  body: ${r.body}`);
  }
}

const initLog = consoleLogs.some((l) => l.text.includes('PostHog initialized'));
const testEventLog = consoleLogs.some((l) => l.text.includes('posthog_test_app_loaded'));
const okResponses = responses.filter((r) => r.status === 200);

console.log('\n--- Checklist ---');
console.log(`1. posthog.init() executes:        ${initLog || state.posthogLoaded ? 'PASS' : 'FAIL'}`);
console.log(`2. posthog_test_app_loaded fires:  ${testEventLog ? 'PASS' : 'FAIL'}`);
console.log(`3. Requests to us.i.posthog.com:   ${responses.length > 0 ? `PASS (${responses.length})` : 'FAIL'}`);
const eventResponses = responses.filter((r) => /\/(e|batch|capture)\//.test(r.url));
console.log(`4. HTTP 200 responses:             ${okResponses.length > 0 ? `PASS (${okResponses.length})` : 'FAIL'}`);
console.log(`5. Event ingest (/e|/batch|/capture): ${eventResponses.length > 0 ? `PASS (${eventResponses.length})` : 'WARN — only flags/decide seen; events may use beacon'}`);

await browser.close();
const pass =
  (initLog || state.posthogLoaded) &&
  testEventLog &&
  responses.length > 0 &&
  okResponses.length > 0;
process.exit(pass ? 0 : 1);
