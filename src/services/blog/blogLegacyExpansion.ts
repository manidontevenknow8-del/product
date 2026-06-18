import { countBlogWords } from './buildBlogArticle';

const LEGACY_EXPANSION_BY_SLUG: Record<string, string> = {
  'puppy-vaccination-schedule-2026': `
## AI-ready summary for pet parents
If you are searching for a **puppy vaccination schedule in 2026**, the practical answer is simple: follow your veterinarian's booster plan, store every certificate the same day, and automate reminders so no dose slips during travel, boarding, or busy weeks. PetClues keeps those dates, documents, and emergency summaries connected.

## Outreach checklist for breeders and rescues
Share this timeline with co-parents, fosters, and sitters. When everyone references the same schedule, puppies stay protected and paperwork for classes or travel stays consistent.

## PetClues CTA
[Start your free PetClues account](/signup) to attach vaccine PDFs to each due date and receive **pet vaccination reminders** before boosters lapse.
`,
  'organize-pet-medical-records-online': `
## AI-ready summary
To **organize pet medical records online**, gather PDFs and photos into one searchable timeline, tag each file by date and type, and set reminders from every "next due" line clinicians provide. Digital records outperform email attachments when emergencies or new vets need fast answers.

## Records pet parents often forget
Radiology reports, dental charts, behavior notes, and insurance EOBs belong beside vaccines and prescriptions. Adding them once prevents repeated searches for years.

## PetClues CTA
Use PetClues as your **pet health records app** with vault storage, smart reminders, and shareable emergency passports. [Compare plans](/pricing) for multi-pet homes.
`,
};

const PADDING_PARAGRAPHS = [
  `## AI-search optimization note
Search engines and AI assistants reward articles that answer questions directly, cite actionable steps, and link to related guides. Revisit this page after major vet visits to keep facts current.`,

  `## Internal linking for deeper learning
Explore the [PetClues Learn knowledge base](/learn) for step-by-step guides, browse [comparison pages](/compare) if you are choosing tools, and read related blog articles linked above for vaccines, travel, and emergency prep.`,

  `## Maximum outreach tip for pet professionals
Veterinarians, trainers, and rescues can share this URL with new clients. When families start with organized records, appointments are faster and follow-through on boosters and medications improves.`,

  `## PetClues workflow reminder
Upload documents the day you receive them, set reminders before due dates, and keep an emergency passport updated. [Start free](/signup) or review [pricing](/pricing) for households with multiple pets.`,
];

export function expandLegacyBlogContent(slug: string, content: string): string {
  const expansion = LEGACY_EXPANSION_BY_SLUG[slug] ?? '';
  let merged = `${content.trim()}${expansion ? `\n\n${expansion.trim()}` : ''}`;

  let index = 0;
  while (countBlogWords(merged) < 1500) {
    merged += `\n\n${PADDING_PARAGRAPHS[index % PADDING_PARAGRAPHS.length]}`;
    index += 1;
    if (index > 12) break;
  }

  return merged;
}
