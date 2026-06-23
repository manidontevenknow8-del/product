import type { BlogCategoryId } from '@/data/blogCategories';
import type { BlogLinkCandidate } from '@/data/internalLinking';
import {
  formatBlogInternalLinksMarkdown,
  resolveBlogInternalLinks,
} from '@/data/internalLinking';

export type BlogArticleCluster =
  | 'vaccinations'
  | 'health-records'
  | 'medical-history'
  | 'pet-passports'
  | 'pet-travel'
  | 'medication-management'
  | 'emergency-preparedness'
  | 'pet-organization'
  | 'breed-specific-care'
  | 'senior-pet-care'
  | 'new-pet-owner-guides'
  | 'exotic-pets';

export type ExpandedBlogConfig = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategoryId;
  tags: string[];
  cluster: BlogArticleCluster;
  focus: string;
  audience: string;
  keyDocuments: string[];
  relatedSlugs: string[];
  relatedLearnSlugs?: string[];
  faqs: { question: string; answer: string }[];
};

const CLUSTER_LABELS: Record<BlogArticleCluster, string> = {
  vaccinations: 'pet vaccinations',
  'health-records': 'pet health records',
  'medical-history': 'pet medical history',
  'pet-passports': 'pet passports',
  'pet-travel': 'pet travel',
  'medication-management': 'pet medication management',
  'emergency-preparedness': 'pet emergency preparedness',
  'pet-organization': 'pet care organization',
  'breed-specific-care': 'breed-specific pet care',
  'senior-pet-care': 'senior pet care',
  'new-pet-owner-guides': 'new pet owner guides',
  'exotic-pets': 'exotic pet care',
};

function link(slug: string, label?: string): string {
  return `[${label ?? slug.replace(/-/g, ' ')}](/blog/${slug})`;
}

function linkLearn(slug: string, label?: string): string {
  return `[${label ?? slug.replace(/-/g, ' ')}](/learn/${slug})`;
}

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

function formatFaqs(faqs: { question: string; answer: string }[]): string {
  return faqs.map((faq) => `**Question? ${faq.question}** ${faq.answer}`).join('\n\n');
}

export function countBlogWords(content: string): number {
  return content.split(/\s+/).filter(Boolean).length;
}

function clusterScheduleTable(cluster: BlogArticleCluster, focus: string): string {
  if (cluster === 'vaccinations') {
    return `### Copy-paste schedule reference

| Milestone | What to record | Reminder lead time |
| --- | --- | --- |
| First visit | Vaccine name, lot, date | 7 days before next due |
| Booster due | Certificate PDF + clinic phone | 7 days |
| Lifestyle vaccine | Bordetella / Lepto / Lyme as advised | 3-7 days |
| Annual wellness | Exam notes + weight | 14 days |
| Boarding/travel gate | Proof uploaded to vault | Day of booking |`;
  }
  if (cluster === 'medication-management') {
    return `### Medication tracking matrix

| Field | Example | Why it matters |
| --- | --- | --- |
| Drug name | Apoquel 16 mg | Prevents duplicate prescriptions |
| Dose & time | 1 tab AM with food | Sitter accuracy |
| Start date | 2026-03-01 | Side-effect correlation |
| Prescriber | Dr. Lee, Maple Vet | Refill authorization |
| Refill due | 2026-04-01 | Avoid gaps |`;
  }
  if (cluster === 'pet-travel') {
    return `### Travel document checklist

| Document | Typical validity | Where stored |
| --- | --- | --- |
| Rabies certificate | 1-3 years | Vault PDF |
| Health certificate | 10-30 days | Travel folder |
| Microchip proof | Lifetime | Profile card |
| Medication list | Updated per trip | Emergency passport |`;
  }
  return `### ${focus}, at-a-glance tracker

| Item | Status | Next action |
| --- | --- | --- |
| Latest vet summary | On file / missing | Upload after visit |
| Active medications | Listed / incomplete | Photo prescription label |
| Emergency contacts | Verified / stale | Confirm phone annually |
| Next due date | Scheduled / unknown | Set reminder now |`;
}

export function buildBlogArticleMarkdown(
  config: ExpandedBlogConfig,
  allCandidates?: BlogLinkCandidate[],
): string {
  const clusterLabel = CLUSTER_LABELS[config.cluster];
  const docs = config.keyDocuments.join(', ');
  const relatedBlog = config.relatedSlugs.slice(0, 4).map((slug) => link(slug));
  const relatedLearn = (config.relatedLearnSlugs ?? []).slice(0, 2).map((slug) => linkLearn(slug));

  const deepDiveSections = [
    {
      heading: `Understanding ${config.focus} in everyday pet care`,
      paragraphs: [
        `${config.focus} is not a one-time task for ${config.audience}. It is an ongoing habit that connects vet visits, home routines, and the paperwork you may need when boarding, traveling, or handing care to someone else.`,
        `When ${clusterLabel} are organized, you spend less time searching email threads and more time noticing real changes in appetite, energy, mobility, or behavior. That shift is especially valuable when symptoms are subtle or when multiple people help care for the same pet.`,
      ],
    },
    {
      heading: `What documents and details belong in your system`,
      paragraphs: [
        `At minimum, keep ${docs} in one searchable place. Add short owner notes after each update: what changed, what the clinician recommended, and what follow-up is still open.`,
        `Photos of prescription labels, vaccine certificates, and discharge summaries are often enough when PDFs are unavailable. Date each upload the same day you receive it so your timeline stays trustworthy.`,
      ],
    },
    {
      heading: `How ${clusterLabel} support better decisions`,
      paragraphs: [
        `Complete records help you answer vet questions without guessing. They also make it easier to compare trends across months - weight, lab values, medication responses, or flare-up frequency.`,
        `For ${config.audience}, a clear history reduces duplicate tests, prevents missed boosters, and makes emergency visits calmer because allergies, medications, and prior diagnoses are already documented.`,
      ],
    },
  ];

  const howSteps = [
    `Audit what you already have for ${config.focus}: paper folders, email attachments, clinic portals, and photos on your phone.`,
    `Choose one home for ${clusterLabel}. A dedicated pet health app beats scattered folders because reminders and documents stay linked.`,
    `Upload or photograph ${docs}. Name files by date and type so future-you can scan quickly.`,
    `Turn every "next due" date into a reminder with a 7-day early alert for vaccines, refills, or follow-up labs.`,
    `Add a short summary card with emergency contacts, allergies, active medications, and microchip ID.`,
    `Review records after each vet visit while details are fresh. Note what improved, what worsened, and what to watch.`,
    `Share access with anyone who may care for your pet: partners, sitters, walkers, or family nearby.`,
    `Run a monthly 10-minute check: upcoming due dates, missing documents, and any unexplained symptom patterns.`,
  ];

  const bestPractices = [
    `Store originals and add plain-language notes so non-vets understand context.`,
    `Set reminders at the clinic checkout desk, not days later at home.`,
    `Keep vaccination certificates separate from invoices for faster boarding and travel prep.`,
    `Track reactions, side effects, and "off days" next to the medication or vaccine that preceded them.`,
    `Use one timeline per pet in multi-pet homes to avoid mixing histories.`,
    `Export or screenshot records before travel, moves, or emergency boarding requests.`,
  ];

  const commonMistakes = [
    `Assuming the clinic will always have complete history when you switch vets.`,
    `Saving documents without dates, making timelines impossible to reconstruct.`,
    `Relying on memory for medication names, doses, or last booster dates.`,
    `Waiting until an emergency to compile allergies and prescription details.`,
    `Using multiple apps or folders without a single source of truth.`,
    `Skipping sitter or family access until the night before a trip.`,
  ];

  const workflowSteps = [
    `Create a pet profile and upload your latest ${docs.split(',')[0] ?? 'vet document'}.`,
    `Add upcoming due dates as smart reminders with email nudges.`,
    `Build an emergency passport with contacts, allergies, and active medications.`,
    `Share read-only access with sitters or co-parents when needed.`,
    `Review PetCare Score monthly to spot gaps in vaccines, records, or preventive care.`,
  ];

  const vetSignals = [
    `Sudden appetite, thirst, or bathroom habit changes lasting more than 24 hours.`,
    `Repeated vomiting, diarrhea, coughing, or labored breathing.`,
    `Limping, collapse, seizures, or trauma even if your pet seems to recover quickly.`,
    `Medication side effects that are new, severe, or worsening.`,
    `Any concern where having ${config.focus} documented would help the clinic act faster.`,
  ];

  const quickAnswer = [
    `**Quick answer:** ${config.title} works best when ${config.focus} is stored in one dated timeline with reminders for every next due item. ${config.audience} should keep ${docs}, set alerts before deadlines, and maintain an emergency summary for sitters, travel, and after-hours care.`,
  ];

  const sections = [
    config.excerpt,
    '',
    ...quickAnswer,
    '',
    `## Why this matters`,
    `${config.audience} juggle daily care, unexpected symptoms, and paperwork that arrives at the worst moments. Without a system for ${clusterLabel}, small gaps become expensive delays - missed boosters, duplicate labs, or frantic searches before boarding.`,
    `Strong ${config.focus} habits also improve communication. When everyone sees the same timeline, questions about doses, vaccine timing, or prior treatments get answered in seconds instead of arguments.`,
    `PetClues is built for this exact workflow: documents, reminders, and emergency-ready summaries in one calm place.`,
    '',
    `## What you need to know about ${config.focus}`,
    `${config.focus} is the practice of keeping ${docs} accurate, dated, and easy to share. It is part of ${clusterLabel} and directly supports safer everyday decisions.`,
    `You do not need perfect records on day one. Start with the most recent visit, then backfill older files when you have time. Consistency beats completeness at the start.`,
    `Digital records outperform paper for search, sharing, and reminders - especially when multiple adults or professionals touch your pet's care.`,
    '',
    clusterScheduleTable(config.cluster, config.focus),
    '',
    `## Step-by-step guide`,
    numberedList(howSteps),
    '',
    ...deepDiveSections.flatMap((section) => [
      `## ${section.heading}`,
      ...section.paragraphs,
      '',
    ]),
    `## Best practices`,
    bulletList(bestPractices),
    '',
    `## Common mistakes to avoid`,
    bulletList(commonMistakes),
    '',
    `## PetClues workflow`,
    `PetClues helps ${config.audience} turn ${config.focus} into an automated system instead of a stressful chore.`,
    numberedList(workflowSteps),
    '',
    `## Scenario walkthrough`,
    `Imagine you get a boarding request at 8 p.m. for tomorrow morning. With ${config.focus} organized, you open one timeline, export vaccine proof, confirm ${docs.split(',')[0] ?? 'records'} are current, and share a read-only link. Without that system, you search email, find a blurry photo from last year, and miss a Bordetella booster that denies entry.`,
    `The same preparation helps urgent care: clinicians trust dated documentation over memory when choosing safe medications.`,
    `For ${config.audience}, the highest-leverage upgrade is photographing every discharge summary at the clinic door and setting reminders from the "recheck" line before you reach the parking lot.`,
    '',
    `## Red flags worth a same-day call`,
    bulletList(vetSignals),
    '',
    `## Export and sharing checklist`,
    `Before travel, boarding, or a specialist referral, export a PDF that includes ${docs} and verify recipients can open it on mobile:`,
    bulletList([
      'Vaccine names with lot numbers and clinic phone',
      'Active prescriptions with mg/kg dosing if available',
      'Recent lab trends (not just "normal" verbal summaries)',
      'Allergy and adverse reaction history',
      'Emergency contacts authorized to make medical decisions',
    ]),
    '',
    `Set a recurring calendar event to confirm ${config.focus} is current:`,
    bulletList([
      'Upcoming reminders still fire with a 7-day lead',
      'Latest vet PDFs are uploaded and dated',
      'Emergency contacts and microchip ID match physical tags',
      'Medication list matches what is in the cabinet',
      'Insurance or wellness plan balances are noted',
    ]),
    '',
  ];

  if (allCandidates && allCandidates.length > 0) {
    const plan = resolveBlogInternalLinks(
      {
        slug: config.slug,
        title: config.title,
        category: config.category,
        tags: config.tags,
      },
      allCandidates,
    );
    sections.push('', formatBlogInternalLinksMarkdown(plan));
  } else if (relatedBlog.length > 0 || relatedLearn.length > 0) {
    sections.push(
      '',
      `## Related guides`,
      bulletList([...relatedBlog, ...relatedLearn]),
    );
  }

  sections.push(
    '',
    `## FAQ`,
    formatFaqs(config.faqs),
    '',
    `## Start organizing with PetClues`,
    `Ready to put ${config.focus} on autopilot? PetClues keeps ${clusterLabel}, vaccination reminders, medication schedules, and emergency pet passports in one free account for your first pet. [Create your free account](/signup) or explore [PetClues pricing](/pricing) for multi-pet households.`,
  );

  return sections.join('\n');
}

export function buildBlogArticleMarkdownWithMinWords(
  config: ExpandedBlogConfig,
  minWords = 1500,
  allCandidates?: BlogLinkCandidate[],
): string {
  const content = buildBlogArticleMarkdown(config, allCandidates);
  const words = countBlogWords(content);

  if (words < minWords) {
    throw new Error(
      `Blog article ${config.slug} is only ${words} words (minimum ${minWords}). Add long-form content override.`,
    );
  }

  return content;
}
