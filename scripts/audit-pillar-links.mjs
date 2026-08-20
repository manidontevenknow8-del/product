/**
 * Link-graph + RelatedLinks audit for the 8 content pillars.
 * Flags orphans (0 inbound) and pages with <3 outbound internal links.
 * Does NOT auto-fix — review-only report.
 *
 * Run: node scripts/audit-pillar-links.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const data = path.join(root, 'content-data');

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(data, rel), 'utf8'));
}

function loadGlobJson(dirRel, patternPrefix) {
  const dir = path.join(data, dirRel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(patternPrefix) && f.endsWith('.json'))
    .flatMap((f) => {
      const raw = readJson(path.join(dirRel, f).replace(/\\/g, '/'));
      if (Array.isArray(raw)) return raw;
      if (raw.pages) return raw.pages;
      return [raw];
    });
}

const LEGACY_SYMPTOM = {
  '/symptoms/limping-dog': '/symptoms/dog/limping-when-to-worry',
  '/symptoms/limping-cat': '/symptoms/cat/limping-when-to-worry',
  '/symptoms/lethargy-dog': '/symptoms/dog/lethargy-when-to-worry',
  '/symptoms/lethargy-cat': '/symptoms/cat/lethargy-when-to-worry',
  '/symptoms/vomiting-dog': '/symptoms/dog/vomiting-when-to-worry',
  '/symptoms/vomiting-cat': '/symptoms/cat/vomiting-when-to-worry',
  '/symptoms/difficulty-breathing-dog': '/symptoms/dog/difficulty-breathing-when-to-worry',
  '/symptoms/difficulty-breathing-cat': '/symptoms/cat/difficulty-breathing-when-to-worry',
  '/symptoms/dental-pain-dog': '/symptoms/dog/dental-pain-when-to-worry',
  '/symptoms/dental-pain-cat': '/symptoms/cat/dental-pain-when-to-worry',
  '/symptoms/weight-gain-dog': '/symptoms/dog/weight-gain-when-to-worry',
  '/symptoms/weight-gain-cat': '/symptoms/cat/weight-gain-when-to-worry',
  '/symptoms/weight-loss-dog': '/symptoms/dog/weight-loss-when-to-worry',
  '/symptoms/weight-loss-cat': '/symptoms/cat/weight-loss-when-to-worry',
  '/symptoms/ear-scratching-dog': '/symptoms/dog/ear-scratching-when-to-worry',
  '/symptoms/ear-scratching-cat': '/symptoms/cat/ear-scratching-when-to-worry',
  '/symptoms/itching-dog': '/symptoms/dog/itching-when-to-worry',
  '/symptoms/itching-cat': '/symptoms/cat/itching-when-to-worry',
  '/symptoms/excessive-thirst-dog': '/symptoms/dog/excessive-thirst-when-to-worry',
  '/symptoms/excessive-thirst-cat': '/symptoms/cat/excessive-thirst-when-to-worry',
  '/symptoms/straining-to-urinate-dog': '/symptoms/dog/straining-to-urinate-when-to-worry',
  '/symptoms/straining-to-urinate-cat': '/symptoms/cat/straining-to-urinate-when-to-worry',
  '/symptoms/red-eyes-dog': '/symptoms/dog/red-eyes-when-to-worry',
  '/symptoms/red-eyes-cat': '/symptoms/cat/red-eyes-when-to-worry',
  '/symptoms/seizures-dog': '/symptoms/dog/seizures-when-to-worry',
  '/symptoms/seizures-cat': '/symptoms/cat/seizures-when-to-worry',
  '/symptoms/lumps-bumps-dog': '/symptoms/dog/lumps-bumps-when-to-worry',
  '/symptoms/lumps-bumps-cat': '/symptoms/cat/lumps-bumps-when-to-worry',
};

const EMERGENCY_ALIAS = {
  'difficulty-breathing': 'choking',
  'urinary-blockage': 'cat-urinary-blockage',
};

function pickRingNeighbors(items, currentIndex, limit) {
  if (items.length <= 1 || limit <= 0 || currentIndex < 0) return [];
  const out = [];
  const n = items.length;
  let step = 1;
  while (out.length < limit && step < n) {
    const left = (currentIndex - step + n) % n;
    const right = (currentIndex + step) % n;
    if (left !== currentIndex) out.push(items[left]);
    if (out.length >= limit) break;
    if (right !== currentIndex && right !== left) out.push(items[right]);
    step += 1;
  }
  return out;
}

function hashKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}

function pickRingNeighborsByKey(items, keyOf, currentKey, limit) {
  if (!items.length || limit <= 0) return [];
  const sorted = [...items].sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
  let idx = sorted.findIndex((item) => keyOf(item) === currentKey);
  if (idx < 0) idx = hashKey(currentKey) % sorted.length;
  return pickRingNeighbors(sorted, idx, limit).filter((item) => keyOf(item) !== currentKey);
}

const breeds = readJson('breeds.json');
const symptoms = readJson('symptoms.json');
const comparisons = readJson('comparisons.json');
const tools = readJson('tools.json');
const breedIndex = readJson('generated/breed-health/index.json');
const vacManifest = readJson('generated/vaccinations/_manifest.json');
const vaultPages = readJson('generated/vault/pages.json');
const lifeLogistics = loadGlobJson('generated/life-logistics', 'batch-');
const emergencyPages = loadGlobJson('generated/emergencies', 'batch-');
const symptomPages = loadGlobJson('generated/symptoms', 'batch-');

const known = new Set([
  '/breeds',
  '/symptoms',
  '/vaccinations',
  '/emergency',
  '/vault',
  '/life-logistics',
  '/compare',
  '/tools',
]);

for (const e of breedIndex) known.add(e.path);
for (const p of symptomPages) known.add(p.path);
for (const p of vacManifest.pages) known.add(p.path);
for (const p of emergencyPages) known.add(`/emergency/${p.slug}`);
for (const p of vaultPages) known.add(`/guides/${p.slug}`);
for (const p of lifeLogistics) known.add(`/guides/${p.slug}`);
for (const c of comparisons) known.add(`/compare/petclues-vs-${c.slug}`);
for (const t of tools) known.add(`/tools/${t.slug}`);

function resolveSymptom(href) {
  if (LEGACY_SYMPTOM[href] && known.has(LEGACY_SYMPTOM[href])) return LEGACY_SYMPTOM[href];
  if (known.has(href)) return href;
  const short = href.match(/^\/symptoms\/([a-z0-9-]+)$/);
  if (short) {
    const slug = short[1];
    for (const species of ['dog', 'cat']) {
      if (slug.endsWith(`-${species}`)) {
        const base = slug.slice(0, -(species.length + 1));
        const c = `/symptoms/${species}/${base}-when-to-worry`;
        if (known.has(c)) return c;
      }
    }
  }
  return known.has(href) ? href : null;
}

function resolveEmergency(coreOrSlug) {
  if (!coreOrSlug) return null;
  const exact = emergencyPages.find((p) => p.slug === coreOrSlug);
  if (exact) return `/emergency/${exact.slug}`;
  const aliased = EMERGENCY_ALIAS[coreOrSlug] ?? coreOrSlug;
  const byCore = emergencyPages.find((p) => p.core_slug === aliased);
  if (byCore) return `/emergency/${byCore.slug}`;
  const fuzzy = emergencyPages.find(
    (p) => p.slug.includes(coreOrSlug) || p.core_slug.includes(coreOrSlug),
  );
  return fuzzy ? `/emergency/${fuzzy.slug}` : null;
}

function resolveBreed(slug, stage = 'adult') {
  const p = `/breeds/${slug}/${stage}-health-guide`;
  return known.has(p) ? p : null;
}

/** Edge list: from → to[] */
const outbound = new Map();
const inbound = new Map();
const emptyRelated = [];
const brokenTargets = [];
const relatedCounts = new Map();

function addEdge(from, to, context) {
  if (!to) return;
  if (!known.has(to)) {
    brokenTargets.push({ from, to, context });
    return;
  }
  if (!outbound.has(from)) outbound.set(from, new Set());
  if (!inbound.has(to)) inbound.set(to, new Set());
  outbound.get(from).add(to);
  inbound.get(to).add(from);
}

function setRelated(pathKey, links) {
  const valid = links.filter((h) => h && known.has(h));
  relatedCounts.set(pathKey, valid.length);
  if (valid.length === 0) emptyRelated.push(pathKey);
  for (const h of valid) addEdge(pathKey, h, 'related');
}

// Hub → every leaf
for (const e of breedIndex) addEdge('/breeds', e.path, 'hub');
for (const p of symptomPages) addEdge('/symptoms', p.path, 'hub');
for (const p of vacManifest.pages) addEdge('/vaccinations', p.path, 'hub');
for (const p of emergencyPages) addEdge('/emergency', `/emergency/${p.slug}`, 'hub');
for (const p of vaultPages) {
  addEdge('/vault', `/guides/${p.slug}`, 'hub');
  addEdge('/guides', `/guides/${p.slug}`, 'hub');
}
for (const p of lifeLogistics) {
  addEdge('/life-logistics', `/guides/${p.slug}`, 'hub');
  addEdge('/guides', `/guides/${p.slug}`, 'hub');
}
for (const c of comparisons) addEdge('/compare', `/compare/petclues-vs-${c.slug}`, 'hub');
for (const t of tools) addEdge('/tools', `/tools/${t.slug}`, 'hub');

// Home → hubs
for (const hub of [
  '/breeds',
  '/symptoms',
  '/vaccinations',
  '/emergency',
  '/vault',
  '/life-logistics',
  '/compare',
  '/tools',
]) {
  addEdge('/', hub, 'home');
}

// Breed pages: related = other stages + symptoms + peer breeds; issueLinks
const breedFiles = fs
  .readdirSync(path.join(data, 'generated/breed-health'))
  .filter((f) => f.endsWith('.json') && f !== 'index.json');

for (const file of breedFiles) {
  const page = readJson(`generated/breed-health/${file}`);
  if (!page.path) continue;
  const breed = breeds.find((b) => b.slug === page.breedSlug);
  const links = [];
  for (const e of breedIndex.filter((x) => x.breedSlug === page.breedSlug && x.path !== page.path)) {
    links.push(e.path);
  }
  for (const issue of page.issueLinks || []) {
    const href = resolveSymptom(issue.href);
    if (href) {
      links.push(href);
      addEdge(page.path, href, 'issueLink');
    } else {
      brokenTargets.push({ from: page.path, to: issue.href, context: 'issueLink' });
    }
  }
  if (breed) {
    const peers = breeds
      .filter((b) => b.slug !== breed.slug && b.species === breed.species)
      .slice(0, 3);
    for (const p of peers) {
      const href = resolveBreed(p.slug);
      if (href) links.push(href);
    }
  }
  setRelated(page.path, [...new Set(links)]);
}

// Symptom pages
const symptomBySlug = new Map(symptoms.map((s) => [s.slug, s]));
for (const page of symptomPages) {
  const record = symptomBySlug.get(page.symptomSlug || page.symptom_slug) || {
    slug: page.symptomSlug || page.symptom_slug,
    species: page.species,
    urgency_level: page.urgency_level,
    related_breed_predispositions: page.related_breed_predispositions || [],
    related_emergency_slug: page.related_emergency_slug,
  };
  const links = [];
  const urgency = page.urgency_level || record.urgency_level;
  const speciesPool = symptomPages
    .filter((p) => p.species === page.species)
    .sort((a, b) => {
      const aU = a.urgency_level === urgency ? 0 : 1;
      const bU = b.urgency_level === urgency ? 0 : 1;
      return aU - bU || a.path.localeCompare(b.path);
    });
  for (const p of pickRingNeighborsByKey(speciesPool, (x) => x.path, page.path, 3)) {
    links.push(p.path);
  }
  const breedSlugs =
    page.related_breed_predispositions?.length > 0
      ? page.related_breed_predispositions
      : record.related_breed_predispositions || [];
  for (const slug of breedSlugs.slice(0, 2)) {
    const href = resolveBreed(slug);
    if (href) links.push(href);
  }
  if (urgency === 'emergency') {
    const em = resolveEmergency(page.related_emergency_slug || record.related_emergency_slug);
    if (em) links.push(em);
  }
  setRelated(page.path, [...new Set(links)]);
}

// Vaccinations
for (const page of vacManifest.pages) {
  const links = [];
  if (page.breedSlug) {
    const health = resolveBreed(page.breedSlug);
    if (health) links.push(health);
    const puppy = resolveBreed(page.breedSlug, 'puppy') || resolveBreed(page.breedSlug, 'kitten');
    if (puppy) links.push(puppy);
  }
  const pool = vacManifest.pages
    .filter((p) => (page.breedSlug ? p.kind === 'breed' : p.kind === 'general'))
    .sort((a, b) => a.path.localeCompare(b.path));
  for (const o of pickRingNeighborsByKey(pool, (p) => p.path, page.path, 3)) {
    links.push(o.path);
  }
  setRelated(page.path, [...new Set(links)]);
}

// Emergencies
for (const page of emergencyPages) {
  const from = `/emergency/${page.slug}`;
  const sameCore = emergencyPages.filter((p) => p.core_slug === page.core_slug);
  const fromCore = pickRingNeighborsByKey(sameCore, (p) => p.slug, page.slug, 5);
  const need = 5 - fromCore.length;
  const fromAll =
    need > 0
      ? pickRingNeighborsByKey(emergencyPages, (p) => p.slug, page.slug, need + fromCore.length).filter(
          (p) => !fromCore.some((c) => c.slug === p.slug),
        )
      : [];
  setRelated(
    from,
    [...fromCore, ...fromAll].slice(0, 5).map((p) => `/emergency/${p.slug}`),
  );
}

// Vault
for (const page of vaultPages) {
  const from = `/guides/${page.slug}`;
  const same = vaultPages.filter((p) => p.cluster === page.cluster);
  const fromSame = pickRingNeighborsByKey(same, (p) => p.slug, page.slug, 5);
  const need = 5 - fromSame.length;
  const fromOthers =
    need > 0
      ? pickRingNeighborsByKey(
          vaultPages.filter((p) => p.cluster !== page.cluster),
          (p) => p.slug,
          page.slug,
          need,
        )
      : [];
  setRelated(
    from,
    [...fromSame, ...fromOthers].slice(0, 5).map((p) => `/guides/${p.slug}`),
  );
}

// Life logistics
for (const page of lifeLogistics) {
  const from = `/guides/${page.slug}`;
  const fromSame = pickRingNeighborsByKey(
    lifeLogistics.filter((p) => p.cluster === page.cluster),
    (p) => p.slug,
    page.slug,
    5,
  );
  const need = 5 - fromSame.length;
  const fromOthers =
    need > 0
      ? pickRingNeighborsByKey(
          lifeLogistics.filter((p) => p.cluster !== page.cluster),
          (p) => p.slug,
          page.slug,
          need,
        )
      : [];
  setRelated(
    from,
    [...fromSame, ...fromOthers].slice(0, 5).map((p) => `/guides/${p.slug}`),
  );
}

// Comparisons
for (const c of comparisons) {
  const from = `/compare/petclues-vs-${c.slug}`;
  const peers = pickRingNeighborsByKey(comparisons, (x) => x.slug, c.slug, 5).map(
    (x) => `/compare/petclues-vs-${x.slug}`,
  );
  setRelated(from, peers);
}

// Tools
for (const t of tools) {
  const from = `/tools/${t.slug}`;
  const sameFamily = tools.filter((x) => x.family === t.family);
  const fromFamily = pickRingNeighborsByKey(sameFamily, (x) => x.slug, t.slug, 5);
  const need = 5 - fromFamily.length;
  const fromOthers =
    need > 0
      ? pickRingNeighborsByKey(
          tools.filter((x) => x.family !== t.family),
          (x) => x.slug,
          t.slug,
          need,
        )
      : [];
  setRelated(
    from,
    [...fromFamily, ...fromOthers].slice(0, 5).map((x) => `/tools/${x.slug}`),
  );
}

const leafPages = [...known].filter(
  (p) =>
    !['/breeds', '/symptoms', '/vaccinations', '/emergency', '/vault', '/life-logistics', '/compare', '/tools', '/guides'].includes(
      p,
    ),
);

const orphans = leafPages.filter((p) => (inbound.get(p)?.size ?? 0) === 0);
const lowOutbound = leafPages.filter((p) => (outbound.get(p)?.size ?? 0) < 3);

const HUBS = new Set([
  '/',
  '/breeds',
  '/symptoms',
  '/vaccinations',
  '/emergency',
  '/vault',
  '/life-logistics',
  '/compare',
  '/tools',
  '/guides',
]);

const hubOnlyInbound = leafPages.filter((p) => {
  const ins = inbound.get(p);
  if (!ins || ins.size === 0) return false;
  return [...ins].every((from) => HUBS.has(from));
});

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    knownPaths: known.size,
    leafPages: leafPages.length,
    emptyRelatedLinks: emptyRelated.length,
    brokenTargets: brokenTargets.length,
    orphans: orphans.length,
    hubOnlyInbound: hubOnlyInbound.length,
    lowOutbound: lowOutbound.length,
    pillarCounts: {
      breeds: breedIndex.length,
      symptoms: symptomPages.length,
      vaccinations: vacManifest.pages.length,
      emergencies: emergencyPages.length,
      vault: vaultPages.length,
      lifeLogistics: lifeLogistics.length,
      comparisons: comparisons.length,
      tools: tools.length,
    },
  },
  emptyRelatedLinks: emptyRelated.sort(),
  brokenTargets: brokenTargets.slice(0, 200),
  brokenTargetsTruncated: brokenTargets.length > 200,
  orphans: orphans.sort(),
  hubOnlyInbound: hubOnlyInbound.sort(),
  lowOutbound: lowOutbound
    .map((p) => ({ path: p, outbound: outbound.get(p)?.size ?? 0, related: relatedCounts.get(p) ?? 0 }))
    .sort((a, b) => a.outbound - b.outbound || a.path.localeCompare(b.path)),
  note: 'Review-only. Do not auto-fix. Hub inbound counts toward orphans=0; hubOnlyInbound flags pages with no leaf-to-leaf inbound links.',
};

const outDir = path.join(data, 'generated/reports');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'link-graph-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

const md = `# Link-graph report

Generated: ${report.generatedAt}

## Summary

| Metric | Count |
| --- | ---: |
| Known pillar paths | ${report.summary.knownPaths} |
| Leaf pages | ${report.summary.leafPages} |
| Empty RelatedLinks | ${report.summary.emptyRelatedLinks} |
| Broken link targets | ${report.summary.brokenTargets} |
| Orphans (0 inbound) | ${report.summary.orphans} |
| Hub-only inbound | ${report.summary.hubOnlyInbound} |
| Low outbound (<3) | ${report.summary.lowOutbound} |

### Pillar counts
${Object.entries(report.summary.pillarCounts)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

## Orphans (0 inbound internal links)

${orphans.length === 0 ? '_None_' : orphans.map((p) => `- \`${p}\``).join('\n')}

## Hub-only inbound (no leaf-to-leaf inbound)

These are reachable from a pillar hub but not linked from any other content page. Review candidates for stronger cross-links.

${
  hubOnlyInbound.length === 0
    ? '_None_'
    : hubOnlyInbound
        .slice(0, 150)
        .map((p) => `- \`${p}\``)
        .join('\n') +
      (hubOnlyInbound.length > 150
        ? `\n\n…and ${hubOnlyInbound.length - 150} more in JSON.`
        : '')
}

## Low outbound (<3 internal links)

${
  report.lowOutbound.length === 0
    ? '_None_'
    : report.lowOutbound
        .slice(0, 100)
        .map((r) => `- \`${r.path}\` (outbound ${r.outbound}, related ${r.related})`)
        .join('\n') +
      (report.lowOutbound.length > 100
        ? `\n\n…and ${report.lowOutbound.length - 100} more in JSON.`
        : '')
}

## Empty RelatedLinks

${emptyRelated.length === 0 ? '_None_' : emptyRelated.map((p) => `- \`${p}\``).join('\n')}

## Broken targets (sample)

${
  brokenTargets.length === 0
    ? '_None_'
    : brokenTargets
        .slice(0, 50)
        .map((b) => `- \`${b.from}\` → \`${b.to}\` (${b.context})`)
        .join('\n')
}

_Flagged for review only — no auto-fixes applied._
`;

fs.writeFileSync(path.join(outDir, 'link-graph-report.md'), md);
console.log(JSON.stringify(report.summary, null, 2));
console.log('Wrote', outPath);
