import { countBlogWords } from './buildBlogArticle';

const LEGACY_EXPANSION_BY_SLUG: Record<string, string> = {
  'puppy-vaccination-schedule-2026': `
## Copy-paste puppy vaccine schedule (2026 baseline)

| Age | Core vaccines | Lifestyle / optional | Notes |
| --- | --- | --- | --- |
| 6–8 weeks | DHPP #1 | — | Confirm prior doses from breeder/shelter |
| 10–12 weeks | DHPP #2 | Bordetella, Lepto start | Daycare/boarding may require Bordetella |
| 14–16 weeks | DHPP #3, Rabies | Lepto booster | Many vets complete puppy series here |
| 12 months | DHPP booster | Lifestyle boosters per risk | Rabies per local law (1- or 3-year) |

## PetClues CTA
[Start your free PetClues account](/signup) to attach vaccine PDFs to each due date and receive **pet vaccination reminders** before boosters lapse.
`,
  'organize-pet-medical-records-online': `
## Records pet parents often forget
Radiology reports, dental charts, behavior notes, and insurance EOBs belong beside vaccines and prescriptions. Adding them once prevents repeated searches for years.

## PetClues CTA
Use PetClues as your **pet health records app** with vault storage, smart reminders, and shareable emergency passports. [Compare plans](/pricing) for multi-pet homes.
`,
};

export function expandLegacyBlogContent(slug: string, content: string): string {
  const expansion = LEGACY_EXPANSION_BY_SLUG[slug] ?? '';
  return `${content.trim()}${expansion ? `\n\n${expansion.trim()}` : ''}`;
}

export function assertLegacyWordCount(slug: string, content: string, minWords = 1500): void {
  const merged = expandLegacyBlogContent(slug, content);
  const words = countBlogWords(merged);
  if (words < minWords) {
    throw new Error(`Legacy blog article ${slug} is only ${words} words (minimum ${minWords})`);
  }
}
