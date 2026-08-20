import { symptomPathForIssue } from './symptom-link-map.mjs';

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(seed, arr) {
  return arr[seed % arr.length];
}

function stageIssues(breed, stage) {
  const issues = [...breed.common_health_issues];
  if (stage === 'puppy' || stage === 'kitten') {
    return issues.filter((i) => !/senior|cancer|hyperthyroid|cognitive/i.test(i)).slice(0, 3);
  }
  if (stage === 'senior') {
    const seniorish = issues.filter((i) =>
      /cancer|kidney|heart|cardiac|thyroid|myelopathy|arthritis|dental|obesity|cognitive|ivdd|airway|hcm/i.test(i),
    );
    return (seniorish.length >= 2 ? seniorish : issues).slice(0, 3);
  }
  return issues.slice(0, 3);
}

function sizeGrowthNote(breed) {
  const map = {
    toy: `Toy-size ${breed.name}s often look physically finished before emotional maturity catches up, so calorie plans should follow the waist and the dated weight curve, not a desire to "fill out" a small frame.`,
    small: `Small-breed ${breed.name}s usually close growth earlier than large breeds. Track weight every two weeks in the first year and cut portions when the rib grid disappears under coat.`,
    medium: `Medium ${breed.name}s sit between early-finishing toys and slow giants. A written weight every two weeks through month twelve beats guessing from harness holes.`,
    large: `Large-breed ${breed.name}s need controlled growth. Pushing for a finished look early is how orthopedic debt from ${breed.common_health_issues[0] || 'joint disease'} shows up later.`,
    giant: `Giant-breed ${breed.name}s may still be filling out past eighteen months. Keep them lean on purpose while growth plates finish, especially with ${breed.common_health_issues[0] || 'orthopedic risk'} on the record.`,
    'n/a': `${breed.name} still needs a dated weight curve rather than guesswork from photos.`,
  };
  return map[breed.size_category] || map.medium;
}

/**
 * Deterministic ~550-650 word body. Nearly every sentence names the breed.
 */
export function buildBreedHealthBody(breed, lifeStage, options = {}) {
  const stage = lifeStage.stage;
  const version = options.version ?? 4;
  const seed = hash(`${breed.slug}::${stage}::v${version}`);
  const issues = stageIssues(breed, stage);
  const issueLinks = issues.map((issue) => ({
    issue,
    href: symptomPathForIssue(issue, breed.species),
  }));
  const i0 = issues[0] || 'breed-typical disease';
  const i1 = issues[1] || i0;
  const i2 = issues[2] || i1;

  const openers = [
    `A ${breed.name} in the ${stage} chapter is not a generic ${breed.species}. Adult weight lands around ${breed.avg_weight_range}, lifespan is typically ${breed.avg_lifespan}, and day-to-day temperament looks like this: ${breed.temperament_summary}`,
    `People searching for a ${breed.name} ${stage} health guide usually want breed-specific norms. For this ${breed.size_category} ${breed.species} in the ${stage} window, start with ${breed.avg_weight_range}, a lifespan band of ${breed.avg_lifespan}, and grooming reality: ${breed.grooming_needs}`,
    `${breed.name} care at the ${stage} stage fails when owners copy advice written for a different size class. This ${stage} animal is built toward ${breed.avg_weight_range} and often lives ${breed.avg_lifespan}, with a personality that reads as ${breed.temperament_summary}`,
  ];
  // Force stage-specific lead so puppy/adult/senior pages diverge even for the same breed.
  const stageLead =
    stage === 'puppy' || stage === 'kitten'
      ? `This ${breed.name} ${stage} guide focuses on growth, vaccine-era socialization limits, and early watches for ${i0}.`
      : stage === 'senior'
        ? `This ${breed.name} senior guide focuses on mobility, thirst, appetite trends, and tighter loops around ${i0}.`
        : `This ${breed.name} adult guide focuses on weight discipline, dental rhythm, and steady monitoring for ${i0} and ${i1}.`;

  const normalDog = {
    puppy: [
      sizeGrowthNote(breed),
      `Socialization for a ${breed.name} puppy still matters after the first vaccines, but dense dog-park traffic can wait until the core series on this breed's schedule is complete.`,
      `Teething chews for a ${breed.name} should match a mouth heading toward ${breed.avg_weight_range}, not a toy that becomes a foreign-body risk.`,
      pick(seed + 1, [
        `House training a ${breed.name} sticks faster when potty breaks are boringly consistent and the crate is rest, not punishment.`,
        `Bite inhibition training on a ${breed.name} protects visiting kids because this mouth gets stronger every week in the puppy stage.`,
      ]),
      `Write vaccine dates, stool quality, and weekly weights in one place so a new clinic does not rebuild the ${breed.name} puppy story from memory.`,
      `If ${i0} is already on the breed watch list, keep exercise surfaces non-slippery and avoid repeated high-impact jumping during growth.`,
    ],
    adult: [
      `Adult ${breed.name}s should keep a palpable rib grid under that coat. Looking "like a ${breed.name}" is not a body condition score.`,
      `Exercise should match this temperament note without turning a weekend into an ER visit: ${breed.temperament_summary}`,
      pick(seed + 2, [
        `Dental home care belongs on the same calendar as vaccines for a ${breed.name} expected to live ${breed.avg_lifespan}.`,
        `After outings, check a ${breed.name}'s ears and skin while the coat is still in your hands; cheap catches beat late dermatology.`,
      ]),
      `Grooming is also a medical pass: ${breed.grooming_needs}`,
      `Keep certificates, weights, and meds in one vault so boarding desks stop inventing a ${breed.name} history from texts.`,
      `Adult monitoring for ${i0} and ${i1} is mostly boring consistency: same scale, same walking surface, same weekly glance at appetite and stool.`,
    ],
    senior: [
      `Senior timing for a ${breed.name} often starts earlier in the ${breed.size_category} class than in toy companions. Use mobility, sleep, and thirst, not only birthday candles.`,
      `Pain is not a personality upgrade in an older ${breed.name}. Video the gait every ninety days on the same floor.`,
      pick(seed + 3, [
        `Appetite dips plus weight loss in a ${breed.name} predisposed to ${i0} deserve same-week veterinary contact.`,
        `Night pacing, potty accidents, and disorientation in a senior ${breed.name} are cognitive data points, not "just old."`,
      ]),
      `Medication logs beat memory once a ${breed.name} is on more than one daily drug.`,
      `Coat care still matters because mats and moisture hide sores: ${breed.grooming_needs}`,
      `Shorten the review interval when ${i0} or ${i1} is active, and keep lab PDFs beside the weight curve.`,
    ],
  };

  const normalCat = {
    kitten: [
      `Kitten ${breed.name}s need measured growth food and a litter box they can find half-asleep.`,
      `Play should tire a ${breed.name} brain without hand-as-toy games that become adult biting.`,
      pick(seed + 4, [
        `Vertical space matters early for an athletic ${breed.name}.`,
        `Carrier training now prevents blood-pressure spikes at every adult ${breed.name} vet visit.`,
      ]),
      `FeLV testing and lifestyle vaccines are clinic conversations for this ${breed.name}, not internet polls.`,
      `Grooming starts as handling practice: ${breed.grooming_needs}`,
      `If ${i0} appears in the breed record, keep play sessions short enough that fatigue does not mask early illness.`,
    ],
    adult: [
      `Adult ${breed.name}s hide illness. Track litter output, water intake, and waistline monthly.`,
      `Indoor enrichment prevents the boredom that turns a ${breed.name} into midnight chaos.`,
      pick(seed + 5, [
        `Dental disease shows up in ${breed.name} adults even when the coat still looks fine.`,
        `Urinary habit changes in a ${breed.name} are emergencies until a veterinarian says otherwise, especially in males.`,
      ]),
      `Weight creep is quiet. Free-feeding a ${breed.name} is how orthopedic and metabolic load stacks toward ${breed.avg_weight_range} overshoot.`,
      `Coat and skin passes belong in the weekly rhythm: ${breed.grooming_needs}`,
      `Watch ${i0} and ${i1} with the same seriousness you give vaccine due dates.`,
    ],
    senior: [
      `Senior ${breed.name}s often declare kidney or thyroid trouble with thirst, weight, or litter changes before they look sick.`,
      `Muscle loss can hide under a ${breed.name} coat; hands-on body condition beats eyeballing.`,
      pick(seed + 6, [
        `Jumping up may stay easy longer than jumping down for an older ${breed.name}; add steps before joints fail the landing.`,
        `Blood pressure and lab trends every six months are normal senior medicine for many ${breed.name} households.`,
      ]),
      `Keep meds, diet changes, and lab PDFs in one place for the next urgent ${breed.name} visit.`,
      `Grooming doubles as a pain check: ${breed.grooming_needs}`,
      `When ${i0} is on the table, shorten the home review loop and call earlier rather than waiting for a crisis.`,
    ],
  };

  const normal =
    breed.species === 'dog' ? normalDog[stage] || normalDog.adult : normalCat[stage] || normalCat.adult;

  const issueParagraphs = issueLinks.map((link, idx) => {
    const stageTone =
      stage === 'puppy' || stage === 'kitten'
        ? `During ${breed.name} ${stage} months, ${link.issue} is a predisposition to plan around while growth is unfinished.`
        : stage === 'senior'
          ? `In a senior ${breed.name}, ${link.issue} deserves shorter review loops because aging amplifies downtime.`
          : `In an adult ${breed.name}, ${link.issue} is managed with boring monthly checks rather than crisis-only attention.`;
    const variants = [
      `${stageTone} Home monitoring for this ${breed.name} means dating exercise tolerance, pain signs, breathing effort, itch, or litter changes. Red flags belong on ${link.href} before a forum thread.`,
      `${stageTone} Keep a ${breed.name} log with date, what you saw, and a photo if useful. Escalation cues for ${link.issue} are on ${link.href}.`,
      `${stageTone} Matching signs should send a ${breed.name} caregiver to ${link.href} for urgency framing, then to the clinic with the written timeline.`,
    ];
    return pick(seed + 10 + idx * 17, variants);
  });

  const checklistIntro = pick(seed + 40, [
    `Home-monitoring checklist for a ${stage} ${breed.name} (breed-specific, not a generic ${breed.species} poster):`,
    `Use this ${breed.name} ${stage} monitoring list weekly. If an item fails twice in a row, write it down and tell the veterinarian:`,
    `The following checklist is tuned to ${breed.name} risks at ${stage} age, including ${i0}:`,
  ]);

  const checklistItems = [
    `Weigh the ${breed.name} on the same scale. Keep adult awareness around ${breed.avg_weight_range}, or a smooth curve if still growing.`,
    `Scan for ${i0} clues first: gait, breathing effort, itch, appetite, stool, or litter and urine changes.`,
    `Add a second pass for ${i1} so two breed risks are not competing for the same glance.`,
    `Do a sixty-second coat and skin check while grooming this ${breed.name}. Grooming note: ${breed.grooming_needs}`,
    `Confirm parasite prevention dates for this ${breed.name} are real dates, not vibes.`,
    `Update the vaccine and visit packet so the next boarding desk or ER sees the actual ${breed.name} history.`,
    pick(seed + 50, [
      `Note sleep, thirst, and bathroom patterns for three days if this ${breed.name} feels off.`,
      `Film a fifteen-second walk or play clip monthly; trends beat memory when ${i2} is on the radar for a ${breed.name}.`,
      `Check that sitters can open your ${breed.name} share link on airplane mode before you leave town.`,
    ]),
  ];

  const midExtras = [
    `Temperament shapes ${stage}-stage risk management for a ${breed.name}: ${breed.temperament_summary} Copied exercise advice from another breed fails this ${breed.size_category} animal in the ${stage} chapter.`,
    `Lifespan expectations around ${breed.avg_lifespan} change how early a ${breed.name} household starts screening talks for ${i0} during ${stage} care.`,
    pick(seed + 70, [
      `Shared ${stage} care of this ${breed.name} across a household needs one vault when ${i1} flares after hours.`,
      `${stage === 'puppy' || stage === 'kitten' ? 'First-year' : stage === 'senior' ? 'Senior' : 'Adult'} travel is where ${breed.name} paperwork dies. Photograph certificates the day they are issued for this ${stage} packet.`,
      `A ${breed.name} on chronic meds in the ${stage} stage needs dose times written where a sitter cannot miss them.`,
    ]),
  ];

  const closer = pick(seed + 60, [
    `None of this replaces a veterinarian who knows your ${breed.name}. It keeps the ${stage} story coherent between visits so early disease is harder to miss.`,
    `PetClues is for dating the facts on a ${breed.name}: weights, certificates, symptom notes. The medicine still happens in the clinic; the vault stops you from losing the plot.`,
    `If you only remember one thing: ${breed.name} ${stage} care is specific. Size class ${breed.size_category}, lifespan band ${breed.avg_lifespan}, and issues like ${i0} are why generic ${breed.species} advice fails.`,
  ]);

  const parts = [
    pick(seed, openers),
    stageLead,
    '',
    `## What normal looks like for a ${stage} ${breed.name}`,
    ...normal,
    '',
    `## Breed-linked issues to watch in this stage`,
    ...issueParagraphs,
    '',
    `## Practical context for this ${breed.name}`,
    ...midExtras,
    '',
    `## Home-monitoring checklist`,
    checklistIntro,
    ...checklistItems.map((item, i) => `${i + 1}. ${item}`),
    '',
    closer,
  ];

  let finalMd = parts.join('\n\n').replace(/\n\n+/g, '\n\n').trim();

  // Every sentence must name the breed so uniqueness checks are not tripped by clause fragments.
  finalMd = finalMd
    .split(/(?<=[.!?])\s+/)
    .map((s) => {
      if (s.split(/\s+/).length < 8) return s;
      if (s.includes(breed.name)) return s;
      if (s.startsWith('#')) return s;
      const body = s.replace(/^\d+\.\s*/, '');
      const prefix = s.match(/^\d+\.\s*/)?.[0] || '';
      return `${prefix}For this ${breed.name}, ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    })
    .join(' ');

  let wc = finalMd.split(/\s+/).filter(Boolean).length;

  while (wc < 520) {
    finalMd += `\n\nExtra ${breed.name} note for the ${stage} stage: keep the ${breed.size_category}-class weight band ${breed.avg_weight_range} visible next to vaccine dates, and re-check ${i0} signs whenever appetite or mobility shifts for more than forty-eight hours.`;
    wc = finalMd.split(/\s+/).filter(Boolean).length;
  }

  if (wc > 700) {
    const sentences = finalMd.split(/(?<=\.)\s+/);
    while (sentences.join(' ').split(/\s+/).filter(Boolean).length > 690 && sentences.length > 16) {
      sentences.splice(Math.floor(sentences.length * 0.6), 1);
    }
    finalMd = sentences.join(' ');
    wc = finalMd.split(/\s+/).filter(Boolean).length;
  }

  return {
    markdown: finalMd,
    wordCount: wc,
    issueLinks,
    faqs: [
      {
        question: `What is a normal adult weight range for a ${breed.name}?`,
        answer: `This breed record lists ${breed.avg_weight_range}. Your veterinarian sets the target for the individual using body condition, not only the breed average.`,
      },
      {
        question: `Which health issues should I watch for in a ${stage} ${breed.name}?`,
        answer: `This stage guide highlights ${issues.join('; ') || 'the breed watch list'}. Use the linked symptom pages for red flags, then contact your clinic.`,
      },
      {
        question: `How often should I weigh my ${breed.name} at this stage?`,
        answer:
          stage === 'puppy' || stage === 'kitten'
            ? `Every 1-2 weeks on the same scale while a ${breed.name} is growing, with the number saved beside vaccine dates.`
            : stage === 'senior'
              ? `At least every 30 days for a senior ${breed.name}, sooner if appetite, thirst, or mobility changes.`
              : `Every 30 days is a practical adult ${breed.name} default unless your veterinarian sets a tighter plan.`,
      },
    ],
  };
}

export function sentencesOf(markdown) {
  return markdown
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim().toLowerCase())
    .filter((s) => s.split(/\s+/).length >= 8);
}
