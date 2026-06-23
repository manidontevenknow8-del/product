/**
 * Regenerate favicon / PWA raster assets from public/logo-source.png.
 *
 * Pipeline mirrors the pre-change setup that worked for Google Search:
 * 1. Build a clean 512px master PNG
 * 2. Write favicon.svg (high-res embed, same link tag Google saw before)
 * 3. Rasterize from SVG at density 512 (vector pipeline; crisp downscales)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const sourcePath = path.join(publicDir, 'logo-source.png');
const svgPath = path.join(publicDir, 'favicon.svg');

const WHITE = '#FFFFFF';
const MASTER_SIZE = 512;
const SVG_DENSITY = 1024;

if (!fs.existsSync(sourcePath)) {
  console.error('Missing public/logo-source.png, add the master logo asset first.');
  process.exit(1);
}

/** Clean master: flatten to white, trim padding, fit in square canvas. */
async function buildMasterLogoPng() {
  return sharp(sourcePath)
    .ensureAlpha()
    .flatten({ background: WHITE })
    .median(3)
    .trim({ threshold: 12, background: WHITE })
    .resize(MASTER_SIZE, MASTER_SIZE, {
      fit: 'contain',
      background: WHITE,
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}

/** favicon.svg link must stay, Google indexing used this exact tag set. */
async function writeFaviconSvg(masterPng) {
  const base64 = masterPng.toString('base64');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${MASTER_SIZE} ${MASTER_SIZE}" role="img" aria-label="PetClues">
  <title>PetClues</title>
  <rect width="${MASTER_SIZE}" height="${MASTER_SIZE}" fill="${WHITE}"/>
  <image width="${MASTER_SIZE}" height="${MASTER_SIZE}" href="data:image/png;base64,${base64}"/>
</svg>`;
  await fs.promises.writeFile(svgPath, svg, 'utf8');
  console.log('Wrote favicon.svg');
}

function logoFromSvg() {
  return sharp(fs.readFileSync(svgPath), { density: SVG_DENSITY }).ensureAlpha();
}

async function writePng(logo, size, filename) {
  const out = path.join(publicDir, filename);
  const supersample = size <= 48 ? 16 : 4;
  const renderSize = size * supersample;

  const big = await logo
    .clone()
    .resize(renderSize, renderSize, {
      fit: 'contain',
      background: WHITE,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  await sharp(big)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toFile(out);
  console.log(`Wrote ${filename} (${size}x${size}, ${supersample}x supersample)`);
}

async function writeIco(logo) {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map(async (size) => {
      const supersample = 16;
      const renderSize = size * supersample;
      const big = await logo
        .clone()
        .resize(renderSize, renderSize, {
          fit: 'contain',
          background: WHITE,
          kernel: sharp.kernel.lanczos3,
        })
        .png()
        .toBuffer();
      return sharp(big)
        .resize(size, size, { kernel: sharp.kernel.lanczos3 })
        .png({ palette: false })
        .toBuffer();
    }),
  );
  const ico = await pngToIco(buffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  console.log(`Wrote favicon.ico (${sizes.join(', ')}px)`);
}

const masterPng = await buildMasterLogoPng();
await writeFaviconSvg(masterPng);

const logo = logoFromSvg();

await writePng(logo, 16, 'favicon-16x16.png');
await writePng(logo, 32, 'favicon-32x32.png');
await writePng(logo, 32, 'favicon.png');
await writePng(logo, 48, 'favicon-48.png');
await writePng(logo, 96, 'favicon-96.png');
await writePng(logo, 180, 'apple-touch-icon.png');
await writePng(logo, 192, 'icon-192.png');
await writePng(logo, 512, 'icon-512.png');
await writePng(logo, 512, 'logo.png');
await writeIco(logo);

console.log('Favicon generation complete.');
