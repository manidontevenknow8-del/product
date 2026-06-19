/**
 * Converts catalog entries into full dominance topic payloads with hooks, tables, sections, and FAQs.
 */
import { pickDominanceImages } from './imageMap.mjs';

function pickImages(_engine, _num, title, slug) {
  return pickDominanceImages(slug, title);
}

function formatRange(range) {
  if (!range) return null;
  if (typeof range === 'string') return range;
  if (range.low != null && range.high != null) return `$${range.low}-$${range.high}`;
  return null;
}

function buildLineItemTable(entry, engine) {
  const facts = entry.facts ?? {};
  const lineItems = facts.lineItems ?? facts.products ?? facts.requirements ?? facts.checklistItems ?? [];
  const headers = engine === 1 ? ['Line item', 'Typical 2026 range', 'What it covers'] : ['Item', 'Typical cost / detail', 'Notes'];
  const rows = [];

  if (Array.isArray(facts.lineItems)) {
    for (const item of facts.lineItems) {
      if (typeof item === 'object' && item.item) {
        rows.push([item.item, item.range ?? item.cost ?? 'Varies', item.notes ?? 'Ask for estimate before procedure']);
      } else {
        rows.push([String(item), formatRange(facts.priceRange) ?? 'Varies by region', 'Confirm with your clinic']);
      }
    }
  }

  if (rows.length < 4 && facts.breeds) {
    for (const breed of facts.breeds.slice(0, 6)) {
      rows.push([
        breed.name ?? breed,
        breed.cost ?? formatRange(facts.firstYearRange) ?? 'Varies',
        breed.note ?? breed.traits?.[0] ?? 'Lifestyle-dependent',
      ]);
    }
  }

  if (rows.length < 4 && facts.symptoms) {
    for (const s of facts.symptoms.slice(0, 5)) {
      rows.push([s, 'Monitor 24-48h', 'Escalate if worsening or paired with lethargy']);
    }
  }

  if (rows.length < 4 && facts.products) {
    for (const p of facts.products.slice(0, 6)) {
      rows.push([
        typeof p === 'string' ? p : p.name,
        typeof p === 'object' ? (p.price ?? 'Varies') : 'Varies',
        typeof p === 'object' ? (p.note ?? 'Compare warranties') : 'Check vet compatibility',
      ]);
    }
  }

  while (rows.length < 5 && lineItems.length > rows.length) {
    const item = lineItems[rows.length];
    rows.push([String(item), 'Varies', 'Request written estimate']);
  }

  if (rows.length === 0) {
    rows.push(['Primary service', formatRange(facts.priceRange) ?? 'Varies', entry.excerpt]);
    rows.push(['Follow-up / monitoring', '$0-$150', 'Depends on severity']);
    rows.push(['Medications', '$25-$200', 'Generic options may reduce cost']);
    rows.push(['Diagnostics', '$75-$400', 'Bundled panels often cheaper']);
    rows.push(['After-hours surcharge', '+$50-$200', 'Common at emergency clinics']);
  }

  return {
    title: engine === 1 ? '2026 price breakdown (US averages)' : 'Quick-reference parameters',
    headers,
    rows: rows.slice(0, 8),
  };
}

function buildHook(entry, engine) {
  const facts = entry.facts ?? {};
  const year = facts.year ?? 2026;
  const region = facts.region ?? 'United States';

  if (engine === 1) {
    const anchor =
      formatRange(facts.routineExamRange) ??
      formatRange(facts.cbcRange) ??
      formatRange(facts.priceRange) ??
      formatRange(facts.emergencyExamFee) ??
      '$75-$350';
    return `${entry.excerpt} In ${year} ${region} pricing, most owners should budget ${anchor} for the primary service described in "${entry.title}" - before medications, follow-up visits, or specialist referral. Corporate chains, urgent-care hospitals, and independent clinics price differently: exam fees are fixed, but diagnostics scale with severity. Use the table below as a negotiation checklist, not a quote. If your invoice exceeds these ranges by more than 30%, ask for itemized codes and whether any test can be deferred without compromising safety.`;
  }

  if (engine === 2) {
    const cost =
      formatRange(facts.firstYearRange) ??
      formatRange(facts.annualVetRange) ??
      formatRange(facts.purchaseRange) ??
      '$1,500-$4,500';
    return `${entry.excerpt} First-year and lifetime costs for breeds in this guide typically land near ${cost} when you include food, preventive care, insurance, and realistic vet surprises - not just purchase price. Apartment size, work hours, grooming frequency, and regional vet pricing move that number more than coat color. The matrix below translates breed marketing into budget lines you can compare before you sign an adoption contract or breeder deposit.`;
  }

  if (engine === 3) {
    const primary = facts.symptoms?.[0] ?? 'the symptom in question';
    return `${entry.excerpt} When a pet shows ${primary}, the decision is not "Google vs. panic" - it is whether red-flag signs (collapse, repeated vomiting, non-weight-bearing lameness, labored breathing, or gums that look pale or gray) are present within your observation window. This page maps likely differentials, documents what you can safely try at home for less than 12 hours, and lists the triggers that should move you to same-day veterinary care. Record onset time, frequency, and photos/video for your clinic - patterns matter more than a single snapshot.`;
  }

  if (engine === 4) {
    return `${entry.excerpt} Travel rules change by carrier, corridor, and species - ${year} filings emphasize microchip ISO compliance, rabies timing, and health certificate windows measured in days, not weeks. Treat airline pet policies and border forms as part of your medical prep: missing one signature can cost more than the flight. The checklist table below is designed to print or share digitally with sitters, boarders, and customs agents.`;
  }

  return `${entry.excerpt} Consumer pet tech in ${year} ranges from genuinely useful clinical adjuvants to expensive noise. The comparison table anchors hardware, subscription, and vet-labor costs so you can judge whether a device changes outcomes - or just notifications. Pair any gadget with documented baselines (weight, thirst, litter volume, activity) so your veterinarian can interpret trends instead of anecdotes.`;
}

function buildSections(entry, engine) {
  const facts = entry.facts ?? {};
  const sections = [];
  const clinical = facts.clinicalTerms ?? facts.vetRisks ?? facts.symptoms ?? [];

  const glossarySection = {
    heading: 'Terms you will see on invoices and discharge papers',
    paragraphs: [
      clinical.length
        ? `Key vocabulary for this topic: ${clinical.slice(0, 6).join(', ')}. Knowing these labels helps you compare estimates apples-to-apples when calling other clinics.`
        : 'Ask clinicians to define abbreviations on your estimate before authorizing care.',
      'Request digital copies of imaging, lab reports, and anesthesia monitoring records - they belong in your permanent archive, not a folder you lose during a move.',
    ],
    bullets: clinical.slice(0, 5).map((term) => `${term}: ask how results change today’s treatment plan`),
  };

  const regionalSection = {
    heading: 'How metro, suburban, and rural pricing diverges',
    paragraphs: [
      'Emergency hospitals in major metros often add facility fees of $80-$180 before treatment. Suburban independents may bundle monitoring into surgery quotes. Rural clinics can be cheaper for exams yet refer complex imaging to specialty centers that bill separately.',
      'Always confirm whether quoted ranges include tax, post-op medications, and recheck exams - those three lines can add 15-25% to the sticker price.',
    ],
    ordered: [
      'Collect two estimates for any procedure over $1,000',
      'Ask what happens if complications extend hospitalization',
      'Confirm who reads after-hours pages if your pet boards overnight',
      'Save pre-authorization numbers from insurers before surgery',
    ],
  };

  if (engine === 1) {
    sections.push({
      heading: 'What actually drives the total',
      paragraphs: [
        `Clinics separate professional services (exam, surgery, anesthesia) from consumables (fluids, sutures, culture plates) and overhead (equipment leases, overnight staffing). "${entry.title}" often looks expensive because three billing categories hit one invoice.`,
        `Ask for CPT-style descriptions in plain language. If ${(facts.clinicalTerms ?? ['diagnostics']).slice(0, 2).join(' or ')} appear, confirm whether results change treatment today or are screening for future visits.`,
      ],
      bullets: [
        'Request written estimate before sedation or surgery',
        'Ask if reference-lab fees are marked up',
        'Compare dispensing fee vs. human pharmacy fill (where legal)',
        'Check whether follow-up rechecks are bundled',
      ],
    });
    sections.push({
      heading: 'Regional and clinic-type variation',
      paragraphs: [
        'Urban emergency hospitals charge facility fees that independents may fold into the exam. Corporate wellness plans can lower per-visit cost while increasing annual commitment.',
        'Payment plans, CareCredit, and nonprofit grants (RedRover, The Pet Fund) exist - but require applications before procedures in many cases.',
      ],
    });
    sections.push({
      heading: 'Insurance and out-of-pocket math',
      paragraphs: [
        'Most accident/illness policies reimburse after deductible with annual caps. Wellness riders rarely cover emergencies that drive bankruptcy-level bills.',
        'Keep every invoice PDF; reimbursement depends on diagnosis codes matching policy exclusions.',
      ],
      ordered: [
        'Upload invoice within 48 hours',
        'Highlight line items your policy excludes',
        'Track remaining annual benefit',
        'Appeal denials with clinician letters when medically necessary',
      ],
    });
    sections.push({
      heading: 'Questions to ask before you pay',
      paragraphs: [
        'A five-minute billing conversation can remove duplicate panels or dispensed drugs you already own.',
        'If sticker shock hits, ask which items are urgent vs. deferrable without risking harm.',
      ],
      bullets: [
        'Can any lab be run in stages?',
        'Is generic medication available?',
        'Do you offer itemized codes for insurance?',
        'Is there a cash discount?',
      ],
    });
  }

  if (engine === 2) {
    sections.push({
      heading: 'Lifetime cost beyond the sticker price',
      paragraphs: [
        `Food, grooming, training, and ${(facts.vetRisks ?? ['orthopedic screening']).slice(0, 2).join(', ')} scale with breed physiology - not Instagram aesthetics.`,
        'Insurance underwriters price breeds by claim history; "hypoallergenic" does not mean low-maintenance.',
      ],
    });
    sections.push({
      heading: 'Lifestyle fit checklist',
      paragraphs: [
        `Traits like ${(facts.traits ?? ['energy level', 'noise', 'prey drive']).slice(0, 3).join(', ')} determine whether a breed thrives in your home or develops expensive behavior problems.`,
      ],
      bullets: facts.traits ?? ['Daily exercise budget', 'Grooming tolerance', 'Alone-time capacity', 'Children/other pets'],
    });
    sections.push({
      heading: 'Vet risks to budget early',
      paragraphs: [
        `Screen for ${(facts.vetRisks ?? ['hip dysplasia', 'allergic skin disease']).join(', ')} before problems become surgical emergencies.`,
      ],
    });
    sections.push({
      heading: 'Where to adopt or buy responsibly',
      paragraphs: [
        'Shelter adoption fees often include vaccines and spay/neuter - subtract those from breeder "savings."',
        'Request parent health testing documentation for genetic conditions common in the breed.',
      ],
    });
  }

  if (engine === 3) {
    sections.push({
      heading: 'Likely differentials your vet will consider',
      paragraphs: [
        `Differentials include ${(facts.differentialDiagnoses ?? ['gastroenteritis', 'dietary indiscretion', 'systemic disease']).slice(0, 4).join(', ')}. Home observation cannot replace exam findings - temperature, hydration, and pain score still require hands-on assessment.`,
      ],
    });
    sections.push({
      heading: 'Safe home monitoring (short window)',
      paragraphs: [
        `If you are within a cautious window, ${(facts.homeCare ?? ['withhold food 4-6 hours', 'offer small water volumes', 'track stool quality']).slice(0, 2).join('; ')}.`,
        'Write down times: onset, vomits per hour, urinations, willingness to walk.',
      ],
      bullets: facts.homeCare ?? ['Photo gums for color', 'Note capillary refill if trained', 'Avoid human meds unless directed'],
    });
    sections.push({
      heading: 'Go to the vet today if you see',
      paragraphs: [
        `Escalate immediately when ${(facts.whenToGoToER ?? ['repeated vomiting', 'collapse', 'distended abdomen']).slice(0, 4).join(', ')}.`,
      ],
    });
    sections.push({
      heading: 'What to bring to triage',
      paragraphs: [
        'Video beats adjectives. Bring diet history, toxin access, medication list, and prior lab work.',
        'If contagious disease is possible, call from the parking lot for isolation protocols.',
      ],
    });
  }

  if (engine === 4) {
    sections.push({
      heading: 'Documents and deadlines',
      paragraphs: [
        `Requirements often include ${(facts.requirements ?? facts.regulations ?? ['ISO microchip', 'rabies certificate', 'health exam']).slice(0, 4).join(', ')}.`,
        `Timeline: ${facts.timeline ?? 'start 30-180 days before departure depending on destination'}.`,
      ],
    });
    sections.push({
      heading: 'Carrier and corridor specifics',
      paragraphs: [
        'Cabin vs. cargo is not a comfort choice alone - brachycephalic breeds face heat-stress bans.',
        'International moves may need USDA endorsement after your accredited vet signs forms.',
      ],
      bullets: facts.risks ?? ['Heat embargoes', 'Sedation contraindications', 'Quarantine fees'],
    });
    sections.push({
      heading: 'Digital handoff for sitters and boarders',
      paragraphs: [
        'Share vaccination PDFs, emergency contacts, and authorized treatments in one link - not scattered texts.',
      ],
    });
    sections.push({
      heading: 'Emergency on the road',
      paragraphs: [
        'Save nearest 24-hour clinics along your route. Pet insurance hotlines can direct you - but cannot replace triage.',
      ],
    });
  }

  if (engine === 5) {
    sections.push({
      heading: 'What the evidence actually shows',
      paragraphs: [
        `Clinical terms you will see: ${(facts.clinicalTerms ?? ['wearable accelerometry', 'tele-triage']).slice(0, 4).join(', ')}.`,
        `Evidence level: ${facts.evidence ?? 'mixed - promising for monitoring, weak for standalone diagnosis'}.`,
      ],
    });
    sections.push({
      heading: 'Cost of ownership (device + time)',
      paragraphs: [
        `Budget ${formatRange(facts.priceRange) ?? '$100-$600'} hardware plus subscriptions where applicable.`,
        'Factor vet interpretation time - data without context creates false reassurance.',
      ],
    });
    sections.push({
      heading: 'Vet guidance before you buy',
      paragraphs: [
        typeof facts.vetGuidance === 'string'
          ? facts.vetGuidance
          : 'Ask whether the device changes a diagnosis or only notifies you after clinical signs are obvious.',
      ],
    });
    sections.push({
      heading: 'Integration with medical records',
      paragraphs: [
        'Export CSV/PDF trends into your pet health archive so new clinicians see baselines.',
        'Avoid parallel paper notebooks that never reach the exam room.',
      ],
    });
  }

  sections.push(glossarySection, regionalSection);
  return sections;
}

function buildFaqs(entry, engine) {
  const facts = entry.facts ?? {};
  const base = [
    {
      question: `How much should I budget for "${entry.title.split(':')[0]}"?`,
      answer: `${entry.excerpt} Add 20-30% contingency for after-hours surcharges or unexpected diagnostics.`,
    },
    {
      question: 'Does pet insurance cover this?',
      answer:
        engine === 1
          ? 'Accident/illness policies often reimburse diagnostics and surgery after deductible; wellness plans usually do not cover emergencies. Read exclusion lists for breed-specific conditions and bilateral clauses (e.g., cruciate ligament on the second knee).'
          : 'Coverage depends on policy tier and pre-existing condition clauses. Submit pre-authorization when available and keep SOAP notes for appeals.',
    },
    {
      question: 'When should I get a second opinion?',
      answer:
        'Seek a second opinion for elective surgery quotes over $2,000, unclear diagnoses, or when recovery stalls beyond the timeline your vet provided. Bring CDs/USB of imaging and lab PDFs to avoid repeat charges.',
    },
    {
      question: 'What should I upload to my pet health vault tonight?',
      answer: `At minimum: latest estimate, paid invoice, discharge summary, and medication labels related to "${entry.title.split('(')[0].trim()}". Date-stamped photos are acceptable when portals fail.`,
    },
    {
      question: 'How does PetClues help?',
      answer:
        engine === 1
          ? 'Upload invoices to AI Vet Bill Decoder, store estimates, and compare line items across visits.'
          : engine === 2
            ? 'Use the Pet Match quiz and cost trackers to model breed fit before commitment.'
            : engine === 3
              ? 'Log symptoms with timestamps and share triage summaries with your clinic.'
              : engine === 4
                ? 'Build a shareable Emergency Passport with vaccines and contacts.'
                : 'Archive device data, labs, and milestones in a searchable Living Archive.',
    },
    {
      question: 'Can I negotiate payment timing without compromising care?',
      answer:
        'Many hospitals offer zero-interest internal plans or third-party financing. Nonprofits may pay a portion of emergency bills if you apply before the procedure when possible. Ask the billing desk - silence is not policy.',
    },
  ];
  return base;
}

export function buildTopicFromCatalog(entry, engine) {
  return {
    num: entry.num,
    slug: entry.slug,
    title: entry.title,
    engine,
    category: entry.category,
    excerpt: entry.excerpt,
    tags: entry.tags,
    hook: buildHook(entry, engine),
    table: buildLineItemTable(entry, engine),
    sections: buildSections(entry, engine),
    images: pickImages(engine, entry.num, entry.title, entry.slug),
    faqs: buildFaqs(entry, engine),
    relatedSlugs: entry.relatedSlugs ?? [],
    internalLinks: entry.internalLinks ?? [],
    facts: entry.facts ?? {},
  };
}
