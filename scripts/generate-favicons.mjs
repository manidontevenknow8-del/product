/**
 * Regenerate favicon / PWA raster assets from public/logo-source.png (single source of truth).
 * Optimized for Google Search favicon clarity at 16x16 and 32x32.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const sourcePath = path.join(publicDir, 'logo-source.png');

const WHITE = '#FFFFFF';
const MASTER_SIZE = 1024;

/** Scale logo inside canvas — larger for tiny favicons so Google SERP stays legible. */
const SCALE_BY_SIZE = [
  [16, 0.94],
  [32, 0.92],
  [48, 0.9],
  [180, 0.88],
  [192, 0.88],
  [512, 0.86],
];

function scaleFor(size) {
  const match = SCALE_BY_SIZE.find(([s]) => size <= s);
  return match?.[1] ?? 0.86;
}

if (!fs.existsSync(sourcePath)) {
  console.error('Missing public/logo-source.png — add the master logo asset first.');
  process.exit(1);
}

/** Replace near-black outer canvas with pure white; keep logo colors intact. */
async function buildMasterLogo() {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .resize(MASTER_SIZE, MASTER_SIZE, { fit: 'contain', background: WHITE })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r < 40 && g < 40 && b < 40) {
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
    }
  }

  const trimmed = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 8, background: WHITE })
    .png()
    .toBuffer();

  const trimmedMeta = await sharp(trimmed).metadata();
  const logoSize = Math.round(Math.min(trimmedMeta.width, trimmedMeta.height) * 0.98);

  return sharp(trimmed)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function renderIcon(masterLogo, size, { sharpen = false } = {}) {
  const inner = Math.max(8, Math.round(size * scaleFor(size)));
  const logo = masterLogo.clone().resize(inner, inner, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3,
  });

  if (sharpen && size <= 32) {
    logo.sharpen({ sigma: 0.6, m1: 0.5, m2: 0.25 });
  }

  return logo
    .extend({
      top: Math.floor((size - inner) / 2),
      bottom: Math.ceil((size - inner) / 2),
      left: Math.floor((size - inner) / 2),
      right: Math.ceil((size - inner) / 2),
      background: WHITE,
    })
    .png({
      compressionLevel: 9,
      palette: size <= 48,
      colors: size <= 48 ? 256 : undefined,
      effort: 10,
    })
    .toBuffer();
}

async function writePng(masterLogo, size, filename) {
  const out = path.join(publicDir, filename);
  const buffer = await renderIcon(masterLogo, size, { sharpen: size <= 32 });
  await fs.promises.writeFile(out, buffer);
  console.log(`Wrote ${filename} (${size}x${size}, scale ${scaleFor(size)})`);
}

async function writeMaskablePng(masterLogo, size, filename) {
  const inner = Math.round(size * 0.72);
  const out = path.join(publicDir, filename);
  await masterLogo
    .clone()
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .extend({
      top: Math.floor((size - inner) / 2),
      bottom: Math.ceil((size - inner) / 2),
      left: Math.floor((size - inner) / 2),
      right: Math.ceil((size - inner) / 2),
      background: WHITE,
    })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(out);
  console.log(`Wrote ${filename} (${size}x${size}, maskable safe zone)`);
}

async function writeIco(masterLogo) {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((size) => renderIcon(masterLogo, size, { sharpen: size <= 32 })),
  );
  const ico = await pngToIco(buffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  console.log(`Wrote favicon.ico (${sizes.join(', ')}px)`);
}

const masterBuffer = await buildMasterLogo();
const masterLogo = sharp(masterBuffer);

await writePng(masterLogo, 16, 'favicon-16x16.png');
await writePng(masterLogo, 32, 'favicon-32x32.png');
await writePng(masterLogo, 32, 'favicon.png');
await writePng(masterLogo, 180, 'apple-touch-icon.png');
await writePng(masterLogo, 192, 'icon-192.png');
await writePng(masterLogo, 512, 'icon-512.png');
await writeMaskablePng(masterLogo, 512, 'icon-512-maskable.png');
await writePng(masterLogo, 512, 'logo.png');
await writeIco(masterLogo);

const obsolete = ['favicon.svg', 'favicon-48.png', 'favicon-96.png'];
for (const file of obsolete) {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Removed obsolete ${file}`);
  }
}

console.log('Favicon generation complete.');
