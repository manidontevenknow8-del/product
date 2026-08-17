/**
 * Regenerates richer lifecycle + resource builder bodies.
 * Run: node scripts/expand-pseo-builders.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const LIFECYCLE_IMAGES = {
  'puppy-vaccination-schedule': '/images/blog/blog-puppy-vaccination.webp',
  'puppy-nutrition-guide': '/images/blog/blog-life-stage-care.webp',
  'teething-and-dental-care': '/images/blog/blog-dog-dental-care.webp',
  'spay-neuter-recovery-timeline': '/images/blog/blog-puppy-checklist.webp',
  'adolescent-growth-diet': '/images/blog/blog-dog-weight-tracker.webp',
  'adult-weight-management': '/images/blog/blog-labrador-joint-care.webp',
  'best-food-for-allergies': '/images/blog/blog-pet-allergy-tracker.webp',
  'working-dog-fueling-plan': '/images/blog/blog-daily-checkin.webp',
  'breeding-pregnancy-diet': '/images/blog/blog-life-stage-care.webp',
  'postpartum-recovery-care': '/images/blog/blog-puppy-checklist.webp',
  'adult-heart-health-screening': '/images/blog/blog-best-pet-health-app.webp',
  'senior-joint-care': '/images/blog/blog-dachshund-mobility.webp',
  'senior-kidney-support-diet': '/images/blog/blog-senior-dog.webp',
  'senior-cognitive-care': '/images/blog/blog-senior-dog.webp',
  'end-of-life-comfort-care': '/images/blog/blog-emergency-passport.webp',
};

const RESOURCE_IMAGES = {
  'dog-boarding-vaccine-requirements': '/images/blog/blog-pet-boarding.webp',
  'cat-boarding-vaccine-requirements': '/images/blog/blog-cat-vaccination.webp',
  'dog-daycare-shot-records': '/images/blog/blog-dog-vaccination-guide.webp',
  'pet-sitter-medical-handoff': '/images/blog/blog-pet-sitter-instructions.webp',
  'emergency-vet-records-kit': '/images/blog/blog-emergency-passport.webp',
  'rabies-certificate-copy': '/images/blog/blog-pet-records.webp',
  'titer-records-for-travel': '/images/blog/blog-travel-pets.webp',
  'puppy-class-vaccine-proof': '/images/blog/blog-puppy-vaccination.webp',
  'airline-pet-health-certificate': '/images/blog/blog-flying-with-cats.webp',
  'lost-pet-qr-id': '/images/blog/blog-microchip-registration.webp',
  'new-puppy-health-folder': '/images/blog/blog-puppy-checklist.webp',
  'new-kitten-health-folder': '/images/blog/blog-new-kitten-checklist.webp',
  'senior-dog-medication-log': '/images/blog/blog-medication-reminder.webp',
  'multi-pet-household-records': '/images/blog/blog-pet-records-timeline.webp',
  'groomer-vaccine-proof': '/images/blog/blog-poodle-grooming-health.webp',
  'dog-park-vaccine-rules': '/images/blog/blog-dog-vaccination-guide.webp',
  'foster-intake-records': '/images/blog/blog-pet-records.webp',
  'moving-with-pets-documents': '/images/blog/blog-travel-pets.webp',
  'pet-insurance-claim-packet': '/images/blog/blog-vet-bill-organizer.webp',
  'after-hours-emergency-card': '/images/blog/blog-emergency-passport.webp',
};

function patchLifecycle() {
  const path = join(root, 'src/data/lifecycleContent.ts');
  let text = readFileSync(path, 'utf8');

  if (!text.includes('heroImage?: string')) {
    text = text.replace(
      '  faqs: LifecycleFaq[];\n  uniqueParagraphs: string[];',
      '  faqs: LifecycleFaq[];\n  heroImage: string;\n  uniqueParagraphs: string[];',
    );
  }

  text = text.replace(
    "Omit<LifecyclePageContent, 'title' | 'uniqueParagraphs' | 'library'>",
    "Omit<LifecyclePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>",
  );

  // Inject heroImage into getLifecyclePageContent return
  if (!text.includes('heroImage: LIFECYCLE_HERO')) {
    text = text.replace(
      'import { uniqueLifecycleParagraphs } from \'./pseoUniqueCopy\';',
      `import { uniqueLifecycleParagraphs } from './pseoUniqueCopy';

const LIFECYCLE_HERO: Record<string, string> = ${JSON.stringify(LIFECYCLE_IMAGES, null, 2)};`,
    );
    text = text.replace(
      `  return {
    title: article(entry),
    ...rest,
    uniqueParagraphs: uniqueLifecycleParagraphs(entry),
    library: libraryLinksForLifecycle(entry.breed.slug, entry.stage.slug, entry.breed.healthFocus),
  };`,
      `  return {
    title: article(entry),
    ...rest,
    heroImage: LIFECYCLE_HERO[entry.stage.slug] ?? '/images/blog/blog-life-stage-care.webp',
    uniqueParagraphs: uniqueLifecycleParagraphs(entry),
    library: libraryLinksForLifecycle(entry.breed.slug, entry.stage.slug, entry.breed.healthFocus),
  };`,
    );
  }

  // Expand each builder: add checklist item, protocol items, diet notes, faqs if short
  const expansions = {
    'puppy-vaccination-schedule': {
      checklistExtra: `{ id: 'board', label: \`Boarding/daycare policy PDF saved for this \${breed.name} household\`, urgency: 'routine' as const }`,
      protocolExtra: [
        '`Keep a backup printout in the car glove box for clinics that still want paper.`',
        '`Share the vaccine timeline with any roommate who might take the puppy in.`',
      ],
      dietExtra: '`If the puppy is on a prescription GI diet already, say so at the vaccine desk so they do not offer a treat that breaks the trial.`',
      faqsExtra: [
        `{ question: \`What if my \${breed.name} has a vaccine reaction?\`, answer: \`Note the time, the product, and what you saw (face swelling, vomiting, hives). Call the clinic. Store that note in the vault so the next visit is premedicated on purpose, not by surprise.\` }`,
        `{ question: \`Do \${breed.name} puppies need Bordetella?\`, answer: \`If you plan daycare, boarding, or busy training classes, yes. Lifestyle vaccines follow the household, not the breed name. Keep the certificate beside DHPP.\` }`,
      ],
      overviewSuffix: ` Write the next due date before you leave the parking lot. That habit is what separates a complete \${breed.name} file from a drawer of faded cards.`,
    },
  };

  // Broader enrichment: append overview sentences and expand short FAQs via post-processing helper
  if (!text.includes('function expandLifecycleBuilder')) {
    const helper = `
function expandLifecycleBuilder(
  entry: LifecycleMatrixEntry,
  base: Omit<LifecyclePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>,
): Omit<LifecyclePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'> {
  const { breed, stage } = entry;
  const sizeBit =
    breed.size === 'toy'
      ? \`Toy-breed \${breed.name}s chill fast, hide dental pain, and can drop blood sugar if a meal is skipped around clinic day.\`
      : breed.size === 'giant'
        ? \`Giant-breed \${breed.name}s need growth-aware handling: lean muscle, careful jumps, and anesthesia plans that respect their size.\`
        : \`For a \${breed.size} \${breed.name}, keep portions honest and write down what the clinic actually did, not what you meant to ask.\`;

  const focusBit = \`Because this breed watches \${breed.healthFocus}, put that line on the same page as this \${stage.label.toLowerCase()} plan so a new veterinarian is not guessing.\`;

  const extraChecklist = [
    { id: 'vault', label: \`PetClues (or equivalent) vault updated the same day for this \${breed.name}\`, urgency: 'routine' as const },
    { id: 'share', label: 'Sitter or co-parent has read-only access to the current packet', urgency: 'routine' as const },
  ].filter((item) => !base.checklist.some((existing) => existing.id === item.id));

  const extraProtocol = [
    \`Note the clinic name and city every time. \${breed.name} families move; portals do not travel with them.\`,
    \`If \${breed.healthFocus} changes handling (heat, stairs, sedation), write that in the visit note before you forget.\`,
    'Export a PDF before boarding, relocation, or a specialist referral.',
  ].filter((line) => !base.protocol.includes(line));

  const extraDiet = [
    sizeBit,
    \`Do not start a new protein, supplement, or "joint chew" the same week you change this \${stage.label.toLowerCase()} plan. You will not know what caused a flare.\`,
    focusBit,
  ].filter((line) => !base.dietNotes.includes(line));

  const extraFaqs = [
    {
      question: \`What should I bring to a \${breed.name} appointment about \${stage.label.toLowerCase()}?\`,
      answer: \`The last certificates, the current food bag photo, a weight, and a short list of meds. If you use PetClues, open the timeline on your phone. Clinics work faster when they are not reconstructing history from memory.\`,
    },
    {
      question: \`How is this \${breed.name} page different from a generic dog article?\`,
      answer: \`It is built around a \${breed.size} \${breed.group} dog at \${breed.adultWeight}, lifespan \${breed.lifespanYears} years, with \${breed.healthFocus} on the watch list. If a tip would fit a Chihuahua and a Mastiff the same way, it does not belong here.\`,
    },
  ].filter((faq) => !base.faqs.some((existing) => existing.question === faq.question));

  return {
    ...base,
    overview: \`\${base.overview} \${sizeBit} \${focusBit}\`,
    checklist: [...base.checklist, ...extraChecklist].slice(0, 8),
    protocol: [...base.protocol, ...extraProtocol].slice(0, 8),
    dietNotes: [...base.dietNotes, ...extraDiet].slice(0, 6),
    faqs: [...base.faqs, ...extraFaqs].slice(0, 6),
  };
}
`;
    text = text.replace(
      'const BUILDERS:',
      `${helper}\nconst BUILDERS:`,
    );
    text = text.replace(
      '  const rest = builder ? builder(entry) : BUILDERS[\'adult-weight-management\'](entry);\n  return {',
      '  const raw = builder ? builder(entry) : BUILDERS[\'adult-weight-management\'](entry);\n  const rest = expandLifecycleBuilder(entry, raw);\n  return {',
    );
  }

  writeFileSync(path, text);
  console.log('Patched lifecycleContent.ts');
}

function patchResource() {
  const path = join(root, 'src/data/resourceContent.ts');
  let text = readFileSync(path, 'utf8');

  if (!text.includes('heroImage?: string') && !text.includes('heroImage: string')) {
    text = text.replace(
      '  faqs: ResourceFaq[];\n  uniqueParagraphs: string[];',
      '  faqs: ResourceFaq[];\n  heroImage: string;\n  uniqueParagraphs: string[];',
    );
  }

  text = text.replace(
    "Omit<ResourcePageContent, 'title' | 'uniqueParagraphs' | 'library'>",
    "Omit<ResourcePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>",
  );

  if (!text.includes('RESOURCE_HERO')) {
    text = text.replace(
      "import { uniqueResourceParagraphs } from './pseoUniqueCopy';",
      `import { uniqueResourceParagraphs } from './pseoUniqueCopy';

const RESOURCE_HERO: Record<string, string> = ${JSON.stringify(RESOURCE_IMAGES, null, 2)};`,
    );
  }

  if (!text.includes('function expandResourceBuilder')) {
    const helper = `
function expandResourceBuilder(
  entry: ResourceMatrixEntry,
  base: Omit<ResourcePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'>,
): Omit<ResourcePageContent, 'title' | 'uniqueParagraphs' | 'library' | 'heroImage'> {
  const { city, topic } = entry;
  const climate = city.climateNote.endsWith('.') ? city.climateNote : \`\${city.climateNote}.\`;
  const facility = city.facilityNote.endsWith('.') ? city.facilityNote : \`\${city.facilityNote}.\`;

  const extraChecklist = [
    \`Written policy or email from the \${city.name} facility saved as a PDF\`,
    'Backup contact who can open the same vault if your phone dies',
    \`County or city license steps for \${city.state} if they apply to this packet\`,
  ].filter((item) => !base.checklist.includes(item));

  const extraSteps = [
    {
      title: 'Name the file like a human',
      detail: \`Use dates and the pet name, not IMG_4421. A \${city.name} desk will not sort your camera roll.\`,
    },
    {
      title: 'Test the link offline',
      detail: 'Open the packet on airplane mode once. If it fails in your kitchen, it will fail in their lobby.',
    },
  ].filter((step) => !base.steps.some((existing) => existing.title === step.title));

  const extraFaqs = [
    {
      question: \`Why does this \${topic.label.toLowerCase()} page mention \${city.name} climate?\`,
      answer: \`Because \${climate} That changes parasite pressure, heat notes, storm go-bags, and how often desks ask for Bordetella or fecals. A generic national checklist misses that.\`,
    },
    {
      question: \`What do \${city.name} facilities usually want first?\`,
      answer: \`\${facility} Start with rabies and core vaccines, then add whatever this \${topic.kicker.toLowerCase()} packet lists. Put the PDFs in one vault before drop-off day.\`,
    },
    {
      question: \`Can I keep this packet for more than one pet in \${city.name}?\`,
      answer: \`Yes, as separate profiles in one household. Sitters and clinics still need the right animal matched to the right certificate. Shared folders without names are how mix-ups start.\`,
    },
  ].filter((faq) => !base.faqs.some((existing) => existing.question === faq.question));

  return {
    ...base,
    overview: \`\${base.overview} Households in \${city.name}, \${city.stateAbbr} (\${city.region}) lose the most time when certificates live in three inboxes. Build the packet once, then reuse it for every \${topic.kicker.toLowerCase()} ask.\`,
    localNote: \`\${base.localNote} Search intent people type for this page includes: \${topic.searchIntent}.\`,
    checklist: [...base.checklist, ...extraChecklist].slice(0, 9),
    steps: [...base.steps, ...extraSteps].slice(0, 6),
    faqs: [...base.faqs, ...extraFaqs].slice(0, 6),
    ctaBody: \`\${base.ctaBody} When a \${city.name} desk asks for proof, you should be able to open it in under thirty seconds.\`,
  };
}
`;
    text = text.replace('const BUILDERS:', `${helper}\nconst BUILDERS:`);
  }

  text = text.replace(
    `export function getResourcePageContent(entry: ResourceMatrixEntry): ResourcePageContent {
  const builder = BUILDERS[entry.topic.slug] ?? BUILDERS['dog-boarding-vaccine-requirements'];
  return {
    title: titleFor(entry),
    ...builder(entry),
    uniqueParagraphs: uniqueResourceParagraphs(entry),
    library: libraryLinksForResource(entry.city.slug, entry.topic.slug),
  };
}`,
    `export function getResourcePageContent(entry: ResourceMatrixEntry): ResourcePageContent {
  const builder = BUILDERS[entry.topic.slug] ?? BUILDERS['dog-boarding-vaccine-requirements'];
  const rest = expandResourceBuilder(entry, builder(entry));
  return {
    title: titleFor(entry),
    ...rest,
    heroImage: RESOURCE_HERO[entry.topic.slug] ?? '/images/blog/blog-pet-records.webp',
    uniqueParagraphs: uniqueResourceParagraphs(entry),
    library: libraryLinksForResource(entry.city.slug, entry.topic.slug),
  };
}`,
  );

  writeFileSync(path, text);
  console.log('Patched resourceContent.ts');
}

patchLifecycle();
patchResource();
