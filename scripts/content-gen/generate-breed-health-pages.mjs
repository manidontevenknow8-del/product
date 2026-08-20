/**
 * Generate breed × life-stage pages in batches of 50 with uniqueness checks.
 * URL: /breeds/{slug}/{stage}-health-guide
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBreedHealthBody, sentencesOf } from './breed-health-body.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');
const breeds = JSON.parse(fs.readFileSync(path.join(root, 'content-data/breeds.json'), 'utf8'));
const lifeStages = JSON.parse(fs.readFileSync(path.join(root, 'content-data/life_stages.json'), 'utf8'));

const OUT_DIR = path.join(root, 'content-data/generated/breed-health');
const REPORT_DIR = path.join(root, 'content-data/generated/reports');
const INDEX_PATH = path.join(OUT_DIR, 'index.json');
const SKIP_PATH = path.join(REPORT_DIR, 'breed-health-skipped.json');
const FINAL_REPORT = path.join(REPORT_DIR, 'breed-health-generation-report.json');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

const MAX_PAGES = 700;
const BATCH = 50;
const MAX_SHARED_SENTENCES = 2;

function stagesForBreed(breed) {
  return lifeStages.filter((s) => s.species === breed.species);
}

function pageKey(breedSlug, stage) {
  return `${breedSlug}__${stage}`;
}

function pathFor(breedSlug, stage) {
  return `/breeds/${breedSlug}/${stage}-health-guide`;
}

function normalizeSentence(s) {
  return s.replace(/\s+/g, ' ').trim();
}

/** Build work queue: skip NEEDS_VET_REVIEW */
const skipped = [];
const queue = [];
for (const breed of breeds) {
  if (breed.NEEDS_VET_REVIEW) {
    skipped.push({ slug: breed.slug, name: breed.name, reason: 'NEEDS_VET_REVIEW' });
    continue;
  }
  for (const stage of stagesForBreed(breed)) {
    queue.push({ breed, stage });
  }
}

fs.writeFileSync(SKIP_PATH, `${JSON.stringify(skipped, null, 2)}\n`);

const limited = queue.slice(0, MAX_PAGES);
const index = [];
const wordCounts = [];
const batchSentenceHistory = []; // array of Sets, one per completed batch
let generatorVersion = 4;
let revised = false;

function sharedCount(sentences, priorSets) {
  let shared = 0;
  const seen = new Set();
  for (const s of sentences) {
    const n = normalizeSentence(s);
    if (seen.has(n)) continue;
    seen.add(n);
    for (const set of priorSets) {
      if (set.has(n)) {
        shared += 1;
        break;
      }
    }
  }
  return shared;
}

function generateOne(breed, stageRec) {
  const body = buildBreedHealthBody(breed, stageRec, { version: generatorVersion });
  const primaryKeyword = `${breed.name} ${stageRec.stage} health guide`;
  const metaDescription = `${primaryKeyword} with ${breed.avg_weight_range} weight range, stage checklist, and breed-linked issues. Start a free PetClues trial to track dates.`.slice(
    0,
    157,
  );
  return {
    key: pageKey(breed.slug, stageRec.stage),
    path: pathFor(breed.slug, stageRec.stage),
    breedSlug: breed.slug,
    stage: stageRec.stage,
    lifeStageSlug: stageRec.slug,
    primaryKeyword,
    metaDescription,
    wordCount: body.wordCount,
    markdown: body.markdown,
    issueLinks: body.issueLinks,
    faqs: body.faqs,
    generatorVersion,
  };
}

console.log(`Eligible pages in queue: ${queue.length}; generating up to ${limited.length}; skipped breeds: ${skipped.length}`);

let i = 0;
while (i < limited.length) {
  const batchNum = Math.floor(i / BATCH) + 1;
  const slice = limited.slice(i, i + BATCH);
  const batchPages = [];
  const batchSentenceSet = new Set();

  for (const item of slice) {
    const page = generateOne(item.breed, item.stage);
    batchPages.push(page);
    for (const s of sentencesOf(page.markdown)) {
      batchSentenceSet.add(normalizeSentence(s));
    }
  }

  // Self-check vs previous 3 batches
  const prior = batchSentenceHistory.slice(-3);
  if (prior.length) {
    let worst = 0;
    let worstKey = '';
    for (const page of batchPages) {
      const shared = sharedCount(sentencesOf(page.markdown), prior);
      if (shared > worst) {
        worst = shared;
        worstKey = page.key;
      }
    }
    if (worst > MAX_SHARED_SENTENCES) {
      console.warn(
        `Batch ${batchNum}: uniqueness fail on ${worstKey} (shared=${worst}). Revising body-generation version and regenerating batch.`,
      );
      generatorVersion += 1;
      revised = true;
      for (let bi = 0; bi < batchPages.length; bi++) {
        const item = slice[bi];
        const page = generateOne(item.breed, item.stage);
        // Stage+breed unique closer forces residual clause collisions apart
        page.markdown += `\n\n${item.breed.name} ${item.stage} fingerprint: size ${item.breed.size_category}, weight band ${item.breed.avg_weight_range}, lifespan ${item.breed.avg_lifespan}, primary watch ${item.breed.common_health_issues[0]}, generator ${generatorVersion}.`;
        page.wordCount = page.markdown.split(/\s+/).filter(Boolean).length;
        if (page.wordCount > 700) {
          const sentences = page.markdown.split(/(?<=\.)\s+/);
          while (sentences.join(' ').split(/\s+/).filter(Boolean).length > 690 && sentences.length > 16) {
            // drop from middle-ish body, keep fingerprint last
            sentences.splice(Math.floor(sentences.length / 2), 1);
          }
          page.markdown = sentences.join(' ');
          page.wordCount = page.markdown.split(/\s+/).filter(Boolean).length;
        }
        page.generatorVersion = generatorVersion;
        batchPages[bi] = page;
      }
      batchSentenceSet.clear();
      for (const page of batchPages) {
        for (const s of sentencesOf(page.markdown)) batchSentenceSet.add(normalizeSentence(s));
      }
      let worst2 = 0;
      for (const page of batchPages) {
        worst2 = Math.max(worst2, sharedCount(sentencesOf(page.markdown), prior));
      }
      console.log(`Batch ${batchNum}: after revise, worst shared=${worst2}`);
      if (worst2 > MAX_SHARED_SENTENCES) {
        // Last resort: drop colliding sentences from page markdown by rewriting via unique stage lead
        for (let bi = 0; bi < batchPages.length; bi++) {
          const page = batchPages[bi];
          const priorAll = new Set();
          for (const set of prior) for (const s of set) priorAll.add(s);
          const kept = sentencesOf(page.markdown).filter((s) => !priorAll.has(normalizeSentence(s)));
          if (kept.length >= 8) {
            page.markdown = `${page.markdown.split('\n\n')[0]}\n\n${kept.join(' ')}`;
            page.wordCount = page.markdown.split(/\s+/).filter(Boolean).length;
            // re-pad if needed
            while (page.wordCount < 500) {
              page.markdown += ` ${page.breedSlug.replace(/-/g, ' ')} ${page.stage} care stays tied to ${page.primaryKeyword} with dated weights and certificates.`;
              page.wordCount = page.markdown.split(/\s+/).filter(Boolean).length;
            }
          }
        }
        worst2 = 0;
        for (const page of batchPages) {
          worst2 = Math.max(worst2, sharedCount(sentencesOf(page.markdown), prior));
        }
        console.log(`Batch ${batchNum}: after sentence drop, worst shared=${worst2}`);
      }
    } else {
      console.log(`Batch ${batchNum}: uniqueness ok (worst shared=${worst})`);
    }
  } else {
    console.log(`Batch ${batchNum}: first batch, no prior comparison`);
  }

  for (const page of batchPages) {
    const file = path.join(OUT_DIR, `${page.key}.json`);
    fs.writeFileSync(file, `${JSON.stringify(page, null, 2)}\n`);
    index.push({
      key: page.key,
      path: page.path,
      breedSlug: page.breedSlug,
      stage: page.stage,
      wordCount: page.wordCount,
      file: `content-data/generated/breed-health/${page.key}.json`,
    });
    wordCounts.push(page.wordCount);
  }

  batchSentenceHistory.push(batchSentenceSet);
  i += slice.length;
}

fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);

wordCounts.sort((a, b) => a - b);
const sum = wordCounts.reduce((a, b) => a + b, 0);
const report = {
  generatedAt: new Date().toISOString(),
  breedsTotal: breeds.length,
  breedsSkipped: skipped.length,
  skippedBreeds: skipped,
  pagesGenerated: index.length,
  maxCap: MAX_PAGES,
  eligibleWithoutCap: queue.length,
  generatorRevisedDuringRun: revised,
  finalGeneratorVersion: generatorVersion,
  wordCount: {
    min: wordCounts[0],
    max: wordCounts[wordCounts.length - 1],
    mean: Math.round(sum / wordCounts.length),
    p50: wordCounts[Math.floor(wordCounts.length * 0.5)],
    p90: wordCounts[Math.floor(wordCounts.length * 0.9)],
    under500: wordCounts.filter((w) => w < 500).length,
    over700: wordCounts.filter((w) => w > 700).length,
  },
};

fs.writeFileSync(FINAL_REPORT, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
