#!/usr/bin/env node
/**
 * Regenerate standard favicon sizes from public/logo.png (512×512).
 * Requires macOS `sips` or replace with sharp in CI if needed.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const logo = join(pub, 'logo.png');

if (!existsSync(logo)) {
  console.error('Missing public/logo.png');
  process.exit(1);
}

const sizes = [16, 32, 48, 96, 180, 192, 512];

for (const size of sizes) {
  const out =
    size === 180
      ? 'apple-touch-icon.png'
      : size === 192
        ? 'icon-192.png'
        : size === 512
          ? 'icon-512.png'
          : size === 32
            ? 'favicon-32x32.png'
            : `favicon-${size}.png`;

  execSync(`sips -z ${size} ${size} "${logo}" --out "${join(pub, out)}"`, {
    stdio: 'inherit',
  });
}

copyFileSync(join(pub, 'favicon-32x32.png'), join(pub, 'favicon.png'));
console.log('Favicon set generated from logo.png');
