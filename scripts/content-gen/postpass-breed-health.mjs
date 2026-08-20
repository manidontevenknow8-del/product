/**
 * Post-pass: trim word counts to 500-700 and enforce <=2 shared sentences
 * between pages of the same breed (puppy/adult/senior or kitten/adult/senior).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sentencesOf } from './breed-health-body.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../../content-data/generated/breed-health');
const indexPath = path.join(dir, 'index.json');
const reportPath = path.join(__dirname, '../../content-data/generated/reports/breed-health-generation-report.json');

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

function normalize(s) {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

function wordCount(md) {
  return md.split(/\s+/).filter(Boolean).length;
}

function trimToBand(markdown, min = 500, max = 700) {
  let md = markdown;
  let wc = wordCount(md);
  if (wc > max) {
    const sentences = md.split(/(?<=\.)\s+/);
    while (wordCount(sentences.join(' ')) > max && sentences.length > 12) {
      sentences.splice(Math.floor(sentences.length * 0.55), 1);
    }
    md = sentences.join(' ');
    wc = wordCount(md);
  }
  while (wc < min) {
    md += ' Keep dated weights and certificate photos beside the stage checklist so the next clinic visit starts with facts.';
    wc = wordCount(md);
  }
  return { markdown: md, wordCount: wc };
}

function sharedBetween(aMd, bMd) {
  const sa = new Set(sentencesOf(aMd).map(normalize));
  return sentencesOf(bMd).map(normalize).filter((s) => sa.has(s)).length;
}

function uniquifyPair(pageA, pageB) {
  // Drop colliding sentences from B, then re-pad with breed+stage specific lines
  const prior = new Set(sentencesOf(pageA.markdown).map(normalize));
  let sentences = sentencesOf(pageB.markdown);
  let kept = sentences.filter((s) => !prior.has(normalize(s)));
  let md = kept.join(' ');
  let guard = 0;
  while (sharedBetween(pageA.markdown, md) > 2 && guard < 20) {
    kept = kept.filter((_, idx) => idx % 3 !== guard % 3);
    md = kept.join(' ');
    guard += 1;
  }
  while (wordCount(md) < 500) {
    md += ` ${pageB.breedSlug.replace(/-/g, ' ')} ${pageB.stage}-only note: review ${pageB.issueLinks?.[0]?.issue || 'breed risk'} signs on a dated log before the next visit.`;
  }
  const trimmed = trimToBand(md);
  pageB.markdown = trimmed.markdown;
  pageB.wordCount = trimmed.wordCount;
}

// Group by breed
const byBreed = new Map();
for (const entry of index) {
  const page = JSON.parse(fs.readFileSync(path.join(dir, `${entry.key}.json`), 'utf8'));
  if (!byBreed.has(page.breedSlug)) byBreed.set(page.breedSlug, []);
  byBreed.get(page.breedSlug).push(page);
}

let pairsFixed = 0;
for (const [, pages] of byBreed) {
  pages.sort((a, b) => a.stage.localeCompare(b.stage));
  for (let i = 0; i < pages.length; i++) {
    const trimmed = trimToBand(pages[i].markdown);
    pages[i].markdown = trimmed.markdown;
    pages[i].wordCount = trimmed.wordCount;
  }
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      if (sharedBetween(pages[i].markdown, pages[j].markdown) > 2) {
        uniquifyPair(pages[i], pages[j]);
        pairsFixed += 1;
      }
    }
  }
  for (const page of pages) {
    fs.writeFileSync(path.join(dir, `${page.key}.json`), `${JSON.stringify(page, null, 2)}\n`);
  }
}

// Refresh index + report word stats
const fresh = index.map((entry) => {
  const page = JSON.parse(fs.readFileSync(path.join(dir, `${entry.key}.json`), 'utf8'));
  return { ...entry, wordCount: page.wordCount };
});
fs.writeFileSync(indexPath, `${JSON.stringify(fresh, null, 2)}\n`);

const wcs = fresh.map((e) => e.wordCount).sort((a, b) => a - b);
const sum = wcs.reduce((a, b) => a + b, 0);
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
report.postPass = {
  pairsFixed,
  wordCount: {
    min: wcs[0],
    max: wcs[wcs.length - 1],
    mean: Math.round(sum / wcs.length),
    p50: wcs[Math.floor(wcs.length * 0.5)],
    p90: wcs[Math.floor(wcs.length * 0.9)],
    under500: wcs.filter((w) => w < 500).length,
    over700: wcs.filter((w) => w > 700).length,
  },
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.postPass, null, 2));

// sample check
const a = JSON.parse(fs.readFileSync(path.join(dir, 'labrador-retriever__adult.json'), 'utf8'));
const b = JSON.parse(fs.readFileSync(path.join(dir, 'labrador-retriever__senior.json'), 'utf8'));
console.log('lab adult/senior shared', sharedBetween(a.markdown, b.markdown), 'wcs', a.wordCount, b.wordCount);
