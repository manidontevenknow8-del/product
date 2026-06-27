/**
 * striking-distance.ts
 *
 * Pulls the last 30 days of Google Search Console data for petclues.com and
 * finds "Growth Band" URLs off page 1 (avg position > 10 through 30) — page 2 & 3
 * targets close enough to push onto page 1 with internal link authority.
 *
 * Prerequisites (one-time):
 *  1. Google Cloud project with "Google Search Console API" enabled.
 *  2. Service account + JSON key downloaded (never commit the key file).
 *  3. In GSC → Settings → Users & permissions, add the service account email
 *     (looks like my-sa@my-project.iam.gserviceaccount.com) with Full access.
 *  4. Set env vars (see .env.example) and run:
 *       npm run gsc:striking-distance
 *
 * Output: ./src/data/striking-distance.json
 *   [{ "url": "/blog/dog-mri-cost", "anchorText": "dog mri cost" }, ...]
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

// ── Load .env.local / .env (tsx does not auto-load Vite env files) ─────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

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

// ── Config (override via environment) ────────────────────────────────────────

/** Consumed at build time by DynamicAuthorityLinks (src/components/seo). */
const OUTPUT_FILE = join(PROJECT_ROOT, 'src/data/striking-distance.json');

/** GSC property URL — must match exactly what you see in Search Console. */
const GSC_SITE_URL =
  process.env.GSC_SITE_URL?.trim() || 'https://petclues.com/';

/** Path to the service account JSON key file on disk. */
const GSC_SERVICE_ACCOUNT_KEY_PATH =
  process.env.GSC_SERVICE_ACCOUNT_KEY_PATH?.trim() ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

/** How many high-potential targets to write (default 5). */
const TOP_N = Number.parseInt(process.env.GSC_TOP_N ?? '5', 10);

/** Growth Band: off page 1, but page 2–3 — close enough to push up (10.1–30.0). */
const GROWTH_BAND_MIN_EXCLUSIVE = 10.0;
const GROWTH_BAND_MAX = 30.0;

/** Lookback window in days. */
const LOOKBACK_DAYS = 30;

/** GSC returns max 25k rows per request; paginate until exhausted. */
const ROW_LIMIT = 25_000;

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

// ── Types ────────────────────────────────────────────────────────────────────

type StrikingDistanceTarget = {
  url: string;
  anchorText: string;
};

type PageAggregate = {
  /** Full URL as returned by GSC, e.g. https://petclues.com/blog/foo */
  pageUrl: string;
  /** Impression-weighted average position across all queries for this page. */
  avgPosition: number;
  /** Total impressions for the page in the date range. */
  impressions: number;
  /** Top query by impressions for this page (becomes anchorText). */
  topQuery: string;
  topQueryImpressions: number;
};

type GscRow = {
  keys?: string[] | null;
  clicks?: number | null;
  impressions?: number | null;
  ctr?: number | null;
  position?: number | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  // GSC data has ~2 day lag; end yesterday to avoid partial days.
  end.setUTCDate(end.getUTCDate() - 2);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - LOOKBACK_DAYS);

  return { startDate: formatDate(start), endDate: formatDate(end) };
}

/**
 * Convert a full GSC page URL into a site-relative path for internal linking.
 *   https://petclues.com/blog/dog-mri-cost  → /blog/dog-mri-cost
 *   https://petclues.com/                   → /
 */
function toRelativePath(fullUrl: string): string {
  try {
    const { pathname } = new URL(fullUrl);
    if (pathname === '/') return '/';
    return pathname.replace(/\/+$/, '') || '/';
  } catch {
    // GSC occasionally returns paths already relative — pass through.
    return fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`;
  }
}

function requireCredentialsPath(): string {
  if (!GSC_SERVICE_ACCOUNT_KEY_PATH) {
    throw new Error(
      [
        'Missing service account key path.',
        'Set GSC_SERVICE_ACCOUNT_KEY_PATH (or GOOGLE_APPLICATION_CREDENTIALS)',
        'to the absolute path of your Google Cloud service account JSON key.',
        'See .env.example for details.',
      ].join(' '),
    );
  }

  if (!existsSync(GSC_SERVICE_ACCOUNT_KEY_PATH)) {
    throw new Error(
      `Service account key file not found: ${GSC_SERVICE_ACCOUNT_KEY_PATH}`,
    );
  }

  return GSC_SERVICE_ACCOUNT_KEY_PATH;
}

// ── GSC fetch + aggregate ────────────────────────────────────────────────────

async function fetchAllPageQueryRows(
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<GscRow[]> {
  const auth = new google.auth.GoogleAuth({
    keyFile: requireCredentialsPath(),
    scopes: SCOPES,
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const allRows: GscRow[] = [];
  let startRow = 0;

  console.log(`Querying GSC for ${siteUrl}`);
  console.log(`  Date range: ${startDate} → ${endDate}`);
  console.log(`  Dimensions: page + query`);

  // Paginate — GSC caps each response at ROW_LIMIT rows.
  for (;;) {
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page', 'query'],
        rowLimit: ROW_LIMIT,
        startRow,
        // Web search only (exclude Discover/News unless you want those too).
        searchType: 'web',
      },
    });

    const rows = response.data.rows ?? [];
    if (rows.length === 0) break;

    allRows.push(...rows);
    console.log(`  Fetched rows ${startRow + 1}–${startRow + rows.length}`);

    startRow += rows.length;
    if (rows.length < ROW_LIMIT) break;
  }

  console.log(`  Total rows: ${allRows.length}`);
  return allRows;
}

/**
 * Roll page+query rows up to page-level stats.
 * Position is impression-weighted so high-volume queries dominate the average.
 */
function aggregateByPage(rows: GscRow[]): PageAggregate[] {
  /** pageUrl → running totals + best query tracker */
  const byPage = new Map<
    string,
    {
      weightedPosition: number;
      impressions: number;
      topQuery: string;
      topQueryImpressions: number;
    }
  >();

  for (const row of rows) {
    const pageUrl = row.keys?.[0];
    const query = row.keys?.[1];
    const impressions = row.impressions ?? 0;
    const position = row.position ?? 0;

    if (!pageUrl || !query || impressions <= 0) continue;

    const existing = byPage.get(pageUrl) ?? {
      weightedPosition: 0,
      impressions: 0,
      topQuery: query,
      topQueryImpressions: 0,
    };

    existing.weightedPosition += position * impressions;
    existing.impressions += impressions;

    if (impressions > existing.topQueryImpressions) {
      existing.topQuery = query;
      existing.topQueryImpressions = impressions;
    }

    byPage.set(pageUrl, existing);
  }

  const aggregates: PageAggregate[] = [];

  for (const [pageUrl, stats] of byPage) {
    if (stats.impressions === 0) continue;

    aggregates.push({
      pageUrl,
      avgPosition: stats.weightedPosition / stats.impressions,
      impressions: stats.impressions,
      topQuery: stats.topQuery,
      topQueryImpressions: stats.topQueryImpressions,
    });
  }

  return aggregates;
}

function pickStrikingDistanceTargets(
  pages: PageAggregate[],
  limit: number,
): { targets: StrikingDistanceTarget[]; usedFallback: boolean } {
  // Target pages off page 1, but close enough (page 2 & 3) to be pushed up.
  let candidates = pages.filter(
    (p) =>
      p.avgPosition > GROWTH_BAND_MIN_EXCLUSIVE &&
      p.avgPosition <= GROWTH_BAND_MAX,
  );

  let usedFallback = false;

  // If the growth band is empty (everything rank 50+), fall back to any page
  // not on page 1 — still sorted by impressions for highest leverage.
  if (candidates.length === 0) {
    candidates = pages.filter((p) => p.avgPosition > GROWTH_BAND_MIN_EXCLUSIVE);
    usedFallback = candidates.length > 0;
  }

  const targets = candidates
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit)
    .map((p) => ({
      url: toRelativePath(p.pageUrl),
      anchorText: p.topQuery,
    }));

  return { targets, usedFallback };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { startDate, endDate } = getDateRange();

  const rows = await fetchAllPageQueryRows(GSC_SITE_URL, startDate, endDate);
  const pageStats = aggregateByPage(rows);

  console.log(`\nAggregated ${pageStats.length} unique pages.`);

  const { targets: striking, usedFallback } = pickStrikingDistanceTargets(
    pageStats,
    TOP_N,
  );

  if (striking.length === 0) {
    console.warn(
      `\nNo pages found with avg position > ${GROWTH_BAND_MIN_EXCLUSIVE} (growth band or fallback).`,
    );
    console.warn('Check GSC_SITE_URL matches your property and that data exists for the date range.');
  } else {
    console.log(
      `\nTop ${striking.length} growth-band targets${usedFallback ? ' (fallback: all off page 1)' : ''}:\n`,
    );
    for (const [i, target] of striking.entries()) {
      const meta = pageStats.find((p) => toRelativePath(p.pageUrl) === target.url);
      console.log(
        `  ${i + 1}. ${target.url}`,
        meta
          ? `(pos ${meta.avgPosition.toFixed(1)}, ${meta.impressions} impr, query: "${target.anchorText}")`
          : '',
      );
    }
  }

  writeFileSync(OUTPUT_FILE, `${JSON.stringify(striking, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${OUTPUT_FILE}`);
}

main().catch((err: unknown) => {
  console.error('\nGSC striking-distance script failed:\n');
  if (err instanceof Error) {
    console.error(err.message);
    if (err.message.includes('403') || err.message.includes('permission')) {
      console.error(
        '\nTip: Add your service account email as a Full user on the GSC property.',
      );
    }
  } else {
    console.error(err);
  }
  process.exit(1);
});
