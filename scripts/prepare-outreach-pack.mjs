#!/usr/bin/env node
/**
 * prepare-outreach-pack.mjs
 *
 * Verifies that all growth outreach template files exist and prints their paths.
 *
 * Usage:
 *   node scripts/prepare-outreach-pack.mjs
 *
 * npm:
 *   npm run growth:outreach-pack
 */

import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const GROWTH_DIR = join(PROJECT_ROOT, 'content-data/growth');

const REQUIRED_FILES = [
  'haro-response-template.md',
  'vet-clinic-partnership-email.md',
  'directory-listing-checklist.md',
  'reddit-engagement-guidelines.md',
  'digital-pr-data-story-brief.md',
];

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

console.log('');
console.log(`${c.bold}${c.cyan}PetClues — Growth Outreach Pack${c.reset}`);
console.log(`${c.dim}Directory: ${relative(PROJECT_ROOT, GROWTH_DIR)}/${c.reset}`);
console.log('');

let allOk = true;

for (const file of REQUIRED_FILES) {
  const fullPath = join(GROWTH_DIR, file);
  const relPath = relative(PROJECT_ROOT, fullPath);

  if (existsSync(fullPath)) {
    console.log(`  ${c.green}✓${c.reset} ${relPath}`);
  } else {
    console.log(`  ${c.red}✗${c.reset} ${relPath} ${c.red}(MISSING)${c.reset}`);
    allOk = false;
  }
}

console.log('');

if (allOk) {
  console.log(`${c.green}${c.bold}All ${REQUIRED_FILES.length} outreach templates present.${c.reset}`);
} else {
  console.log(`${c.red}Some templates are missing. Create them in content-data/growth/.${c.reset}`);
  process.exitCode = 1;
}
