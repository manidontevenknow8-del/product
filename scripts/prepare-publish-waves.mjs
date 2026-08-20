/**
 * Split Agent 11 PASS list into 8 prioritized publish waves.
 *
 * Priority order (pools drained in sequence into equal-sized waves):
 *   1. compare
 *   2. vaccinations + emergency
 *   3. vault + life-logistics + tools
 *   4. symptoms
 *   5. breeds (last — largest / most programmatic)
 *
 * Run: node scripts/prepare-publish-waves.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const reportPath = path.join(
  root,
  'content-data/generated/reports/agent-11-qa-report.json',
);
const outDir = path.join(root, 'content-data/generated/publish-waves');
const WAVE_COUNT = 8;

if (!fs.existsSync(reportPath)) {
  console.error('Missing Agent 11 QA report. Run: node scripts/qa-pillar-publishability.mjs');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const pass = report.pass.filter((row) => !row.path.match(/^\/(breeds|symptoms|vaccinations|emergency|vault|life-logistics|compare|tools)$/));
const hubs = report.pass.filter((row) =>
  row.path.match(/^\/(breeds|symptoms|vaccinations|emergency|vault|life-logistics|compare|tools)$/),
);

const byPillar = (name) => pass.filter((r) => r.pillar === name);

const pools = [
  { name: 'compare', rows: byPillar('compare') },
  {
    name: 'vaccinations+emergency',
    rows: [...byPillar('vaccinations'), ...byPillar('emergency')],
  },
  {
    name: 'vault+life-logistics+tools',
    rows: [...byPillar('vault'), ...byPillar('life-logistics'), ...byPillar('tools')],
  },
  { name: 'symptoms', rows: byPillar('symptoms') },
  { name: 'breeds', rows: byPillar('breeds') },
];

const total = pools.reduce((n, p) => n + p.rows.length, 0);
const target = Math.ceil(total / WAVE_COUNT);

const waves = Array.from({ length: WAVE_COUNT }, (_, i) => ({
  wave: i + 1,
  targetSize: target,
  urls: /** @type {typeof pass} */ ([]),
  pillars: {},
  poolSources: [],
}));

let wi = 0;
for (const pool of pools) {
  for (const row of pool.rows) {
    while (wi < WAVE_COUNT - 1 && waves[wi].urls.length >= target) wi += 1;
    waves[wi].urls.push(row);
    waves[wi].pillars[row.pillar] = (waves[wi].pillars[row.pillar] || 0) + 1;
    if (!waves[wi].poolSources.includes(pool.name)) waves[wi].poolSources.push(pool.name);
  }
}

// Prepend high-priority hubs for wave 1 (crawl entry), compare first
const hubOrder = [
  '/compare',
  '/vaccinations',
  '/emergency',
  '/vault',
  '/life-logistics',
  '/tools',
  '/symptoms',
  '/breeds',
];
const wave1Paths = new Set(waves[0].urls.map((r) => r.path));
for (const path of [...hubOrder].reverse()) {
  const hub = hubs.find((h) => h.path === path);
  if (hub && !wave1Paths.has(hub.path)) {
    waves[0].urls.unshift(hub);
    waves[0].pillars[hub.pillar] = (waves[0].pillars[hub.pillar] || 0) + 1;
    wave1Paths.add(hub.path);
  }
}

fs.mkdirSync(outDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  sourceReport: 'content-data/generated/reports/agent-11-qa-report.json',
  totalPassLeaves: total,
  waveCount: WAVE_COUNT,
  targetPerWave: target,
  priorityPools: pools.map((p) => ({ name: p.name, count: p.rows.length })),
  waves: waves.map((w) => ({
    wave: w.wave,
    count: w.urls.length,
    pillars: w.pillars,
    poolSources: w.poolSources,
    file: `wave-${String(w.wave).padStart(2, '0')}.json`,
  })),
  indexingGuidance: {
    afterRecentLargePush: true,
    recentPushNote: 'Domain recently received ~6k pages. Prefer sitemap discovery; drip Indexing API slowly.',
    dailyCapDefault: 40,
    dailyCapHardMax: 100,
    requestDelayMs: 2500,
    minHoursBetweenRuns: 24,
    oneWaveSegmentPerDay: true,
    doNotSubmitFullWaveInOneDay: true,
  },
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

for (const w of waves) {
  const file = path.join(outDir, `wave-${String(w.wave).padStart(2, '0')}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        wave: w.wave,
        generatedAt: manifest.generatedAt,
        count: w.urls.length,
        pillars: w.pillars,
        poolSources: w.poolSources,
        urls: w.urls.map((r) => ({ path: r.path, url: r.url, pillar: r.pillar })),
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(outDir, `wave-${String(w.wave).padStart(2, '0')}-urls.txt`),
    w.urls.map((r) => r.url).join('\n') + '\n',
  );
}

const md = `# Publish waves (from Agent 11 PASS)

Generated: ${manifest.generatedAt}

PASS leaves: **${total}** → **${WAVE_COUNT}** waves (target ~${target}/wave)

## Priority pools
${manifest.priorityPools.map((p) => `1. **${p.name}** — ${p.count}`).join('\n')}

## Waves
${manifest.waves
  .map(
    (w) =>
      `### Wave ${w.wave} (${w.count} URLs)\n- Pools: ${w.poolSources.join(', ')}\n- Pillars: ${Object.entries(
        w.pillars,
      )
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')}\n- File: \`content-data/generated/publish-waves/${w.file}\``,
  )
  .join('\n\n')}

## Indexing API (sandbox-safe)
- Default **${manifest.indexingGuidance.dailyCapDefault}/day** (hard max ${manifest.indexingGuidance.dailyCapHardMax})
- **${manifest.indexingGuidance.requestDelayMs}ms** between requests
- **≥${manifest.indexingGuidance.minHoursBetweenRuns}h** between runs
- One wave segment per calendar day
- Sitemap remains the primary discovery path after the recent ~6k push

\`\`\`bash
npx tsx scripts/trigger-indexing.ts --wave=1 --dry-run
npx tsx scripts/trigger-indexing.ts --wave=1 --limit=40
\`\`\`
`;

fs.writeFileSync(path.join(outDir, 'README.md'), md);
console.log(JSON.stringify({ total, target, waves: manifest.waves.map((w) => w.count) }, null, 2));
console.log('Wrote', outDir);
