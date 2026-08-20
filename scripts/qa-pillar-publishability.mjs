/**
 * Agent 11 style publishability QA for the 8 content pillars.
 * Writes PASS/FAIL lists used by sitemap waves + Indexing API drip-feed.
 *
 * Run: node scripts/qa-pillar-publishability.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const data = path.join(root, 'content-data');
const SITE = process.env.VITE_SITE_URL ?? 'https://petclues.com';

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(data, rel), 'utf8'));
}

function loadBatches(dirRel, prefix) {
  const dir = path.join(data, dirRel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .flatMap((f) => {
      const raw = readJson(path.join(dirRel, f).replace(/\\/g, '/'));
      if (Array.isArray(raw)) return raw;
      if (raw?.pages) return raw.pages;
      return [];
    });
}

function abs(pathname) {
  return new URL(pathname, SITE).href;
}

const breeds = readJson('breeds.json');
const breedBySlug = new Map(breeds.map((b) => [b.slug, b]));
const symptoms = readJson('symptoms.json');
const symptomBySlug = new Map(symptoms.map((s) => [s.slug, s]));
const comparisons = readJson('comparisons.json');
const tools = readJson('tools.json');
const breedIndex = readJson('generated/breed-health/index.json');
const vacManifest = readJson('generated/vaccinations/_manifest.json');
const vaultPages = readJson('generated/vault/pages.json');
const lifeLogistics = loadBatches('generated/life-logistics', 'batch-');
const emergencies = loadBatches('generated/emergencies', 'batch-');
const symptomPages = loadBatches('generated/symptoms', 'batch-');

/** @typedef {{ path: string; url: string; pillar: string; reason?: string }} QaRow */

const pass = /** @type {QaRow[]} */ ([]);
const fail = /** @type {QaRow[]} */ ([]);

function mark(pillar, pathname, ok, reason) {
  const row = { path: pathname, url: abs(pathname), pillar, ...(reason ? { reason } : {}) };
  (ok ? pass : fail).push(row);
}

function hasText(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

// Comparisons
for (const c of comparisons) {
  const pathname = `/compare/petclues-vs-${c.slug}`;
  if (c.NEEDS_VET_REVIEW) {
    mark('compare', pathname, false, 'NEEDS_VET_REVIEW');
    continue;
  }
  const features = c.features ?? [];
  const complete =
    features.length > 0 &&
    features.every((f) => hasText(f.feature) && hasText(f.value) && hasText(f.source));
  if (!complete || !hasText(c.name) || !hasText(c.slug)) {
    mark('compare', pathname, false, 'incomplete comparison record');
    continue;
  }
  mark('compare', pathname, true);
}

// Vaccinations
for (const p of vacManifest.pages) {
  if (!hasText(p.path) || !hasText(p.slug)) {
    mark('vaccinations', p.path || `/vaccinations/${p.slug}`, false, 'missing path/slug');
    continue;
  }
  if (p.breedSlug) {
    const breed = breedBySlug.get(p.breedSlug);
    if (!breed) {
      mark('vaccinations', p.path, false, 'unknown breedSlug');
      continue;
    }
    if (breed.NEEDS_VET_REVIEW) {
      mark('vaccinations', p.path, false, 'breed NEEDS_VET_REVIEW');
      continue;
    }
  }
  mark('vaccinations', p.path, true);
}

// Emergencies
for (const p of emergencies) {
  const pathname = `/emergency/${p.slug}`;
  if (!hasText(p.slug) || !hasText(p.h1) || !hasText(p.core_slug)) {
    mark('emergency', pathname, false, 'missing slug/h1/core_slug');
    continue;
  }
  if (p.NEEDS_VET_REVIEW) {
    mark('emergency', pathname, false, 'NEEDS_VET_REVIEW');
    continue;
  }
  mark('emergency', pathname, true);
}

// Vault
for (const p of vaultPages) {
  const pathname = `/guides/${p.slug}`;
  if (!hasText(p.slug) || !hasText(p.h1) || !hasText(p.meta_description)) {
    mark('vault', pathname, false, 'missing slug/h1/meta');
    continue;
  }
  if (p.NEEDS_VET_REVIEW) {
    mark('vault', pathname, false, 'NEEDS_VET_REVIEW');
    continue;
  }
  mark('vault', pathname, true);
}

// Life logistics
for (const p of lifeLogistics) {
  const pathname = `/guides/${p.slug}`;
  if (!hasText(p.slug) || !hasText(p.h1) || !hasText(p.meta_description)) {
    mark('life-logistics', pathname, false, 'missing slug/h1/meta');
    continue;
  }
  mark('life-logistics', pathname, true);
}

// Tools
for (const t of tools) {
  const pathname = `/tools/${t.slug}`;
  if (!hasText(t.slug) || !hasText(t.h1) || !hasText(t.meta_description)) {
    mark('tools', pathname, false, 'missing slug/h1/meta');
    continue;
  }
  if (t.NEEDS_VET_REVIEW) {
    mark('tools', pathname, false, 'NEEDS_VET_REVIEW');
    continue;
  }
  mark('tools', pathname, true);
}

// Symptoms
for (const p of symptomPages) {
  const pathname = p.path;
  if (!hasText(pathname) || !hasText(p.h1)) {
    mark('symptoms', pathname || '/symptoms/unknown', false, 'missing path/h1');
    continue;
  }
  const record = symptomBySlug.get(p.symptomSlug || p.symptom_slug);
  if (record?.NEEDS_VET_REVIEW) {
    mark('symptoms', pathname, false, 'symptom NEEDS_VET_REVIEW');
    continue;
  }
  mark('symptoms', pathname, true);
}

// Breeds
for (const e of breedIndex) {
  const pathname = e.path;
  const breed = breedBySlug.get(e.breedSlug);
  if (!breed) {
    mark('breeds', pathname, false, 'unknown breedSlug');
    continue;
  }
  if (breed.NEEDS_VET_REVIEW) {
    mark('breeds', pathname, false, 'breed NEEDS_VET_REVIEW');
    continue;
  }
  if (!hasText(pathname) || !hasText(e.stage)) {
    mark('breeds', pathname, false, 'missing path/stage');
    continue;
  }
  mark('breeds', pathname, true);
}

// Hubs (always include in PASS for crawl entry)
for (const [pillar, pathname] of [
  ['breeds', '/breeds'],
  ['symptoms', '/symptoms'],
  ['vaccinations', '/vaccinations'],
  ['emergency', '/emergency'],
  ['vault', '/vault'],
  ['life-logistics', '/life-logistics'],
  ['compare', '/compare'],
  ['tools', '/tools'],
]) {
  mark(pillar, pathname, true);
}

pass.sort((a, b) => a.path.localeCompare(b.path));
fail.sort((a, b) => a.path.localeCompare(b.path));

const byPillar = {};
for (const row of pass) {
  byPillar[row.pillar] = (byPillar[row.pillar] || 0) + 1;
}

const report = {
  agent: 11,
  title: 'Pillar publishability QA',
  generatedAt: new Date().toISOString(),
  summary: {
    pass: pass.length,
    fail: fail.length,
    byPillar,
  },
  pass,
  fail,
  note: 'PASS pages are eligible for pillar sitemaps and Indexing API waves. FAIL pages stay out of publish waves.',
};

const outDir = path.join(data, 'generated/reports');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'agent-11-qa-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, 'agent-11-pass-urls.txt'),
  pass.map((r) => r.url).join('\n') + '\n',
);

const md = `# Agent 11 QA report — pillar publishability

Generated: ${report.generatedAt}

| Status | Count |
| --- | ---: |
| PASS | ${report.summary.pass} |
| FAIL | ${report.summary.fail} |

## PASS by pillar
${Object.entries(byPillar)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

## FAIL (excluded from publish waves)
${
  fail.length === 0
    ? '_None_'
    : fail
        .slice(0, 100)
        .map((r) => `- \`${r.path}\` — ${r.reason}`)
        .join('\n') + (fail.length > 100 ? `\n\n…and ${fail.length - 100} more in JSON.` : '')
}
`;

fs.writeFileSync(path.join(outDir, 'agent-11-qa-report.md'), md);
console.log(JSON.stringify(report.summary, null, 2));
console.log('Wrote', path.join(outDir, 'agent-11-qa-report.json'));
