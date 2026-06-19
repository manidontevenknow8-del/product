/**
 * Converts public/images PNG assets to WebP, generates responsive hero variants,
 * writes dimension manifest, and removes source PNGs.
 *
 * Run: node scripts/optimize-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const imagesRoot = path.join(root, 'public', 'images');
const manifestPath = path.join(root, 'src', 'data', 'imageManifest.json');

const HERO_FILES = new Set(['landing-hero.webp']);

const MAX_WIDTH_BY_FOLDER = {
  landing: 1400,
  blog: 800,
  scan: 1200,
  app: 1200,
  auth: 1200,
  profile: 1200,
  reminders: 1200,
};

const RESPONSIVE_WIDTHS = [640, 1024, 1920];

function walkPngFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPngFiles(full, acc);
      continue;
    }
    if (/\.png$/i.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function publicPath(absPath) {
  return `/${path.relative(path.join(root, 'public'), absPath).split(path.sep).join('/')}`;
}

function webpPathFor(pngPath) {
  return pngPath.replace(/\.png$/i, '.webp');
}

function folderKey(absPath) {
  const rel = path.relative(imagesRoot, absPath);
  return rel.split(path.sep)[0] ?? 'default';
}

function isHeroSource(pngPath) {
  return path.basename(pngPath) === 'landing-hero.png';
}

async function optimizeImage(pngPath, manifest) {
  const beforeBytes = fs.statSync(pngPath).size;
  const outPath = webpPathFor(pngPath);
  const folder = folderKey(pngPath);
  const maxWidth = MAX_WIDTH_BY_FOLDER[folder] ?? 1200;
  const baseName = path.basename(outPath, '.webp');
  const outDir = path.dirname(outPath);

  const image = sharp(pngPath);
  const metadata = await image.metadata();
  const targetWidth = Math.min(metadata.width ?? maxWidth, maxWidth);

  await sharp(pngPath)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: folder === 'blog' ? 78 : 82, effort: 4 })
    .toFile(outPath);

  const afterBytes = fs.statSync(outPath).size;
  const pub = publicPath(outPath);

  const entry = {
    width: targetWidth,
    height: Math.round((metadata.height ?? targetWidth) * (targetWidth / (metadata.width ?? targetWidth))),
    variants: {},
  };

  if (isHeroSource(pngPath)) {
    for (const width of RESPONSIVE_WIDTHS) {
      const variantName = `${baseName}-${width}w.webp`;
      const variantPath = path.join(outDir, variantName);
      const w = Math.min(width, metadata.width ?? width);
      await sharp(pngPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(variantPath);
      entry.variants[width] = publicPath(variantPath);
    }
    entry.sizes = '100vw';
    entry.srcSet = RESPONSIVE_WIDTHS.map((w) => `${entry.variants[w]} ${w}w`).join(', ');
  }

  manifest[pub] = entry;
  fs.unlinkSync(pngPath);

  return { pngPath, outPath, beforeBytes, afterBytes };
}

async function main() {
  if (!fs.existsSync(imagesRoot)) {
    console.error('Missing public/images');
    process.exit(1);
  }

  const pngFiles = walkPngFiles(imagesRoot);
  const manifest = {};
  const report = [];
  let totalBefore = 0;
  let totalAfter = 0;

  for (const pngPath of pngFiles) {
    const result = await optimizeImage(pngPath, manifest);
    totalBefore += result.beforeBytes;
    totalAfter += result.afterBytes;
    report.push({
      image: path.relative(root, result.outPath),
      beforeKb: Math.round(result.beforeBytes / 1024),
      afterKb: Math.round(result.afterBytes / 1024),
      savedKb: Math.round((result.beforeBytes - result.afterBytes) / 1024),
    });
  }

  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), images: manifest }, null, 2),
  );

  const optimizationReport = {
    generatedAt: new Date().toISOString(),
    imageCount: report.length,
    totalBeforeMb: (totalBefore / (1024 * 1024)).toFixed(2),
    totalAfterMb: (totalAfter / (1024 * 1024)).toFixed(2),
    totalSavedMb: ((totalBefore - totalAfter) / (1024 * 1024)).toFixed(2),
    images: report.sort((a, b) => b.savedKb - a.savedKb),
  };

  fs.writeFileSync(
    path.join(root, 'IMAGE_OPTIMIZATION_REPORT.json'),
    JSON.stringify(optimizationReport, null, 2),
  );

  console.log(`Optimized ${report.length} images`);
  console.log(`Before: ${optimizationReport.totalBeforeMb} MB → After: ${optimizationReport.totalAfterMb} MB`);
  console.log(`Saved: ${optimizationReport.totalSavedMb} MB`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
