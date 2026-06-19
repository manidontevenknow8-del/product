import type { BlogLinkCandidate } from '@/data/internalLinking';
import {
  formatBlogInternalLinksMarkdown,
  resolveBlogInternalLinks,
} from '@/data/internalLinking';
import { countBlogWords } from '../buildBlogArticle';
import { getDominanceCtas } from './ctaBlocks';
import {
  bulletList,
  formatFaqs,
  formatImageBlock,
  formatMarkdownTable,
  injectInternalLinks,
  numberedList,
} from './markdownHelpers';
import type { DominanceSection, DominanceTopic } from './types';

function linkBlog(slug: string, label?: string): string {
  return `[${label ?? slug.replace(/-/g, ' ')}](/blog/${slug})`;
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item));
  return [String(value)];
}

function buildDepthSections(topic: DominanceTopic): DominanceSection[] {
  const facts = topic.facts ?? {};
  const lineItems = asStringArray(facts.lineItems);
  const clinical = asStringArray(facts.clinicalTerms);
  const symptoms = asStringArray(facts.symptoms);
  const differentials = asStringArray(facts.differentialDiagnoses);
  const whenEr = asStringArray(facts.whenToGoToER);
  const homeCare = asStringArray(facts.homeCare);
  const requirements = asStringArray(facts.requirements ?? facts.regulations);
  const products = asStringArray(facts.products);
  const breeds = Array.isArray(facts.breeds)
    ? facts.breeds.map((b) => (typeof b === 'object' && b && 'name' in b ? String((b as { name: string }).name) : String(b)))
    : [];

  const sections: DominanceSection[] = [];

  if (topic.engine === 1 && lineItems.length) {
    sections.push({
      heading: 'Line-by-line invoice review',
      paragraphs: [
        `When you receive an estimate for "${topic.title}", walk the document in the order services were delivered - not the order that maximizes clarity. Start with the exam fee, then anesthesia or sedation, then diagnostics, then therapeutics.`,
        `For each line below, ask whether it changes management today or is defensive documentation. Both can be valid; you are entitled to understand which is which before signing.`,
      ],
      bullets: lineItems.slice(0, 8).map(
        (item) =>
          `${item}: confirm units (per dose vs. per day), whether generic equivalents exist, and if follow-up is included`,
      ),
    });
  }

  if (topic.engine === 2) {
    sections.push({
      heading: 'Budget worksheet for year one',
      paragraphs: [
        `Owners researching "${topic.title}" should model three scenarios: best case (no emergencies), typical case (one minor illness), and stress case (specialist referral).`,
        breeds.length
          ? `Breeds in scope include ${breeds.slice(0, 5).join(', ')} - adjust food and insurance quotes for adult weight, not puppy marketing photos.`
          : 'Replace breeder quotes with local vet estimates for spay/neuter, vaccines, and parasite prevention before you commit.',
      ],
      ordered: [
        'Purchase or adoption fee (include transport)',
        'First-month supplies: crate, bowls, enrichment',
        'Veterinary setup: exam, vaccines, parasite control',
        'Insurance or emergency fund contribution',
        'Training and behavior support if needed',
      ],
    });
  }

  if (topic.engine === 3) {
    sections.push({
      heading: 'Observation log template (24-48 hours)',
      paragraphs: [
        `For ${symptoms[0] ?? 'this symptom'}, clinicians triage faster when you bring times, not adjectives. Use your phone notes app with five fields: time, event, severity (1-5), food/water intake, and bathroom output.`,
        differentials.length
          ? `Your vet will rule out ${differentials.slice(0, 4).join(', ')} in that order based on exam findings - not internet prevalence.`
          : 'Bring video if safe to capture; feline and small-dog symptoms are often intermittent in the exam room.',
      ],
      bullets: [
        ...(whenEr.length ? whenEr.slice(0, 4).map((item) => `ER now if: ${item}`) : []),
        ...(homeCare.length ? homeCare.slice(0, 4).map((item) => `Home window: ${item}`) : []),
      ],
    });
  }

  if (topic.engine === 4) {
    sections.push({
      heading: 'Paperwork timing mistakes that cause denials',
      paragraphs: [
        'Airlines and border agents reject paperwork for clock errors, not medical errors. Microchip must be scanned before rabies vaccination for many corridors; health certificates expire in 10-30 days depending on destination.',
        requirements.length
          ? `Confirm you have: ${requirements.slice(0, 5).join(', ')}.`
          : 'Confirm ISO microchip number matches every form exactly - transposed digits invalidate the packet.',
      ],
      ordered: [
        'Book vet appointment inside the valid certificate window',
        'Verify USDA endorsement if required',
        'Carry originals plus offline PDF backups',
        'Match carrier name to government ID',
      ],
    });
  }

  if (topic.engine === 5) {
    sections.push({
      heading: 'Buy vs. wait decision framework',
      paragraphs: [
        products.length
          ? `Products often compared for "${topic.title}" include ${products.slice(0, 5).join(', ')}. Hardware is rarely the bottleneck - consistent data capture is.`
          : 'Before buying hardware, define the clinical question: earlier diagnosis, adherence, or peace of mind?',
        clinical.length
          ? `Understand metrics: ${clinical.slice(0, 5).join(', ')}. Without baselines, alerts become noise.`
          : 'Run any gadget in parallel with existing routines for two weeks before trusting alerts.',
      ],
      bullets: [
        'Does my veterinarian want this data format?',
        'What subscription outlasts the device warranty?',
        'Can I export raw data if I switch platforms?',
        'What privacy policy governs cloud storage?',
      ],
    });
  }

  sections.push({
    heading: 'Documentation that protects you later',
    paragraphs: [
      `Save estimates, paid invoices, discharge instructions, and lab PDFs the same day you deal with "${topic.title.split('(')[0].trim()}". Future specialists should not repeat tests because records were lost.`,
      'If you dispute a charge or file insurance, chronological documentation matters more than emotional recall. PetClues timestamps uploads automatically when you photograph paperwork at the clinic.',
      `When a family member or sitter transports your pet, they should have the same PDFs you would bring - ${topic.excerpt}`,
    ],
    bullets: [
      'Photograph prescription labels before leaving the parking lot',
      'Note who you spoke with for phone triage',
      'Track weight, appetite, and thirst during recovery',
      'Store imaging CDs or portal download links in your vault',
    ],
  });

  return sections;
}

function buildKeyTakeaways(topic: DominanceTopic): string[] {
  const rows = topic.table.rows.slice(0, 4);
  const lines = [
    '## Key takeaways',
    `This guide on ${topic.title.split('(')[0].trim()} boils down to three money-and-safety rules:`,
    bulletList([
      rows[0] ? `${rows[0][0]}: budget ${rows[0][1]} (${rows[0][2] ?? 'verify locally'})` : topic.excerpt,
      rows[1] ? `${rows[1][0]} typically runs ${rows[1][1]}` : 'Always request written estimates before sedation or surgery',
      'Upload every invoice and lab PDF the day you receive it so appeals, insurance, and second opinions do not stall',
    ]),
    `If anything in this article conflicts with your veterinarian’s advice, follow your clinician’s instructions - this page is educational, not a substitute for hands-on care.`,
    '',
  ];
  return lines;
}

export function buildDominanceArticleMarkdown(
  topic: DominanceTopic,
  allCandidates?: BlogLinkCandidate[],
): string {
  const [ctaPrimary, ctaSecondary] = getDominanceCtas(topic.engine);
  const contextualImage = topic.images[0];
  const secondImage = topic.images[1];

  const sections: string[] = [
    injectInternalLinks(topic.hook, topic.internalLinks),
    '',
    formatMarkdownTable(topic.table),
    '',
    ctaPrimary,
    '',
  ];

  if (contextualImage) {
    sections.push(
      formatImageBlock(contextualImage.src, contextualImage.alt, contextualImage.caption),
      '',
    );
  }

  const allSections = [...topic.sections, ...buildDepthSections(topic)];
  const midpoint = Math.ceil(allSections.length / 2);
  allSections.forEach((section, index) => {
    sections.push(`## ${section.heading}`);
    for (const paragraph of section.paragraphs) {
      sections.push(injectInternalLinks(paragraph, topic.internalLinks));
    }
    if (section.bullets?.length) {
      sections.push('', bulletList(section.bullets));
    }
    if (section.ordered?.length) {
      sections.push('', numberedList(section.ordered));
    }
    sections.push('');

    if (index === midpoint - 1 && secondImage) {
      sections.push(
        formatImageBlock(secondImage.src, secondImage.alt, secondImage.caption),
        '',
        ctaSecondary,
        '',
      );
    }
  });

  if (topic.relatedSlugs.length > 0) {
    sections.push(
      '## Related guides',
      bulletList(topic.relatedSlugs.slice(0, 5).map((slug) => linkBlog(slug))),
      '',
    );
  }

  if (allCandidates && allCandidates.length > 0) {
    const plan = resolveBlogInternalLinks(
      {
        slug: topic.slug,
        title: topic.title,
        category: topic.category,
        tags: topic.tags,
      },
      allCandidates,
    );
    sections.push(formatBlogInternalLinksMarkdown(plan), '');
  }

  sections.push('## Practical next steps for this week');
  sections.push(
    numberedList([
      `Photograph or PDF your most recent invoice related to ${topic.title.split('(')[0].trim()}`,
      'Highlight line items you do not understand and ask the clinic billing desk for codes',
      'Compare against the table above; note variances over 30%',
      'Upload records to PetClues with today’s date',
      'Set a reminder for follow-up labs, rechecks, or refill dates',
      'Share read-only access with anyone who may transport your pet to care',
    ]),
  );
  sections.push('');

  sections.push(...buildKeyTakeaways(topic));

  sections.push('## FAQ', formatFaqs(topic.faqs));

  return sections.join('\n');
}

export function buildDominanceArticleWithMinWords(
  topic: DominanceTopic,
  minWords = 1500,
  allCandidates?: BlogLinkCandidate[],
): string {
  let content = buildDominanceArticleMarkdown(topic, allCandidates);
  const factLines = [
    ...asStringArray(topic.facts?.lineItems),
    ...asStringArray(topic.facts?.symptoms),
    ...asStringArray(topic.facts?.requirements),
    ...asStringArray(topic.facts?.products),
  ];

  let index = 0;
  while (countBlogWords(content) < minWords && index < factLines.length) {
    const line = factLines[index];
    content += `\n\n## Detail note: ${line}\nWhen budgeting for **${line}**, call two local providers and ask whether the quote includes follow-up, tax, and dispensing fees. Add the final numbers to your PetClues timeline so insurance appeals and second opinions start from facts - not memory.`;
    index += 1;
  }

  const words = countBlogWords(content);
  if (words < minWords) {
    throw new Error(
      `Dominance article ${topic.slug} is only ${words} words (minimum ${minWords})`,
    );
  }
  return content;
}
