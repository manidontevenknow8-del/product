/**
 * Regenerate favicon / PWA raster assets from public/favicon.svg (vector source of truth).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

if (!fs.existsSync(svgPath)) {
  console.error('Missing public/favicon.svg');
  process.exit(1);
}

const svgBuffer = fs.readFileSync(svgPath);
const logo = sharp(svgBuffer, { density: 512 }).ensureAlpha();

async function writePng(size, filename) {
  const out = path.join(publicDir, filename);
  await logo.clone().resize(size, size, { fit: 'contain', background: '#FCF9F6' }).png().toFile(out);
  console.log(`Wrote ${filename} (${size}x${size})`);
}

async function writeLogoPng() {
  const out = path.join(publicDir, 'logo.png');
  await logo.clone().resize(512, 512, { fit: 'contain', background: '#FCF9F6' }).png().toFile(out);
  console.log('Wrote logo.png (512x512)');
}

async function writeIco() {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((size) =>
      logo.clone().resize(size, size, { fit: 'contain', background: '#FCF9F6' }).png().toBuffer(),
    ),
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
await writeLogoPng();
await writeIco();

console.log('Favicon generation complete.');
