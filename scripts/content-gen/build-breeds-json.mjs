import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BREED_SEED, dogVaccineSchedule, catVaccineSchedule } from './breed-catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '../../content-data/breeds.json');

const breeds = BREED_SEED.map((b) => ({
  slug: b.slug,
  name: b.name,
  species: b.species,
  size_category: b.size_category,
  avg_weight_range: b.avg_weight_range,
  avg_lifespan: b.avg_lifespan,
  common_health_issues: b.common_health_issues,
  core_vaccines_schedule: b.species === 'dog' ? dogVaccineSchedule() : catVaccineSchedule(),
  grooming_needs: b.grooming_needs,
  temperament_summary: b.temperament_summary,
  ...(b.NEEDS_VET_REVIEW ? { NEEDS_VET_REVIEW: true } : {}),
  source_notes:
    b.source_notes ||
    (b.species === 'dog'
      ? 'Core vaccines follow AAHA-style windows. Health issues are widely cited breed predispositions; not a diagnosis list.'
      : 'Core vaccines follow AAFP-style kitten windows. Health issues are widely cited breed predispositions; not a diagnosis list.'),
}));

fs.writeFileSync(out, `${JSON.stringify(breeds, null, 2)}\n`);
console.log('Wrote', breeds.length, 'breeds to', out);
console.log('NEEDS_VET_REVIEW', breeds.filter((b) => b.NEEDS_VET_REVIEW).length);
