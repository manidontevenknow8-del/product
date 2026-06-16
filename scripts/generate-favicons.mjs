/**
 * Regenerate favicon / PWA assets from public/logo.png (single source of truth).
 * favicon.svg embeds a lossless 512x512 render of logo.png for a pixel-accurate match.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

if (!fs.existsSync(logoPath)) {
  console.error('Missing public/logo.png');
  process.exit(1);
}

const logo = sharp(logoPath).ensureAlpha();

async function writePng(size, filename) {
  const out = path.join(publicDir, filename);
  await logo.clone().resize(size, size, { fit: 'cover' }).png().toFile(out);
  console.log(`Wrote ${filename} (${size}x${size})`);
}

async function writeSvg() {
  const pngBuffer = await logo
    .clone()
    .resize(512, 512, { fit: 'cover' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  const base64 = pngBuffer.toString('base64');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" role="img" aria-label="PetClues">
  <title>PetClues</title>
  <desc>PetClues brand mark: P monogram with pet silhouette and sparkle.</desc>
  <image width="512" height="512" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${base64}" />
</svg>
`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg);
  console.log(`Wrote favicon.svg (${Math.round(fs.statSync(path.join(publicDir, 'favicon.svg')).size / 1024)} KB)`);
}

async function writeIco() {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((size) => logo.clone().resize(size, size, { fit: 'cover' }).png().toBuffer()),
  );
  const ico = await pngToIco(buffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  console.log(`Wrote favicon.ico (${sizes.join(', ')}px)`);
}

await writePng(16, 'favicon-16x16.png');
await writePng(32, 'favicon-32x32.png');
await writePng(32, 'favicon.png');
await writePng(48, 'favicon-48.png');
await writePng(96, 'favicon-96.png');
await writePng(180, 'apple-touch-icon.png');
await writePng(192, 'icon-192.png');
await writePng(512, 'icon-512.png');
await writeIco();
await writeSvg();

console.log('Favicon generation complete.');
