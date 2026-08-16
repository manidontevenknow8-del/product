import type { LifecycleMatrixEntry } from './lifecycleMatrix';
import type { ResourceMatrixEntry } from './resourceMatrix';

/**
 * Page-specific body copy. Same stage/topic skeleton, but every URL gets
 * unique sentences from breed size/group/healthFocus or city climate/facility.
 * ASCII hyphens only.
 */

const SIZE_PUPPY: Record<string, string> = {
  toy: 'Toy-breed growth plates close earlier, hypoglycemia is a real puppy risk, and dental crowding starts before the adult teeth finish erupting. Do not copy a Labrador calorie chart onto a 4 lb dog.',
  small: 'Small-breed puppies mature faster than giants and still need controlled calcium. Jumping off couches during teething is how you buy an orthopedic invoice later.',
  medium: 'Medium-breed adolescents look finished before they are. Keep large-breed logic for joints if the adult weight will exceed 40 lb, and keep a biweekly weight log.',
  large: 'Large-breed puppies need large-breed growth diets, not extra calories to “fill out.” Fast growth is orthopedic debt. Close the growth window with a dated weight curve.',
  giant: 'Giant-breed puppies should stay lean through 18-24 months. Free-feeding a Great Dane puppy is how you get panosteitis, HOD debates, and a surgeon on speed dial.',
};

const SIZE_ADULT: Record<string, string> = {
  toy: 'Toy adults hide dental disease and tracheal irritability. A 2 lb swing is a large percentage of body weight. Weigh on a kitchen scale monthly.',
  small: 'Small adults gain fat in the ribcage before the owner notices. Body-condition score beats the number on a bag.',
  medium: 'Medium adults tolerate twice-daily meals. Weekend hunting or agility still needs a weekday calorie plan so Monday is not a crash.',
  large: 'Large adults tear cruciates when they are chubby and bored. Keep the waist. Keep the nail length. Keep the weight in the same app as the heartworm chew.',
  giant: 'Giant adults have a shorter fuse on joints and bloat. Meal spacing, slow feeders, and no zoomies immediately after dinner are medical advice, not folklore.',
};

const SIZE_SENIOR: Record<string, string> = {
  toy: 'Toy seniors can look “fine” with roaring dental disease and collapsing tracheas. Anesthesia planning starts with recent bloodwork and a realistic airway note.',
  small: 'Small seniors often need calories down and monitoring up: teeth, knees, heart murmurs. Function beats birthday.',
  medium: 'Medium seniors show arthritis as “slowing down.” Video the gait every 90 days. Pain is not a personality change.',
  large: 'Large seniors pay for every extra pound in elbows and hips. NSAIDs need kidney numbers. Do not add a grocery anti-inflammatory.',
  giant: 'Giant seniors are old at ages other breeds still consider midlife. Screen early, keep lean, and do not wait for a 10th birthday party to talk about quality of life.',
};

const GROUP_NOTE: Record<string, string> = {
  sporting: 'Sporting breeds were selected to work all day. Under-exercise plus grocery kibble is how you get obesity, otitis from swimming, and a restless household.',
  herding: 'Herding breeds need a job. MDR1 testing matters before you volunteer ivermectin folklore. Eye screens belong on the same calendar as vaccines for many of these dogs.',
  working: 'Working and guardian breeds carry bloat, orthopedic, and sometimes cardiac risk. Conditioning is not optional, and neither is a 2-hour empty-stomach rule after a big meal if your veterinarian has flagged GDV risk.',
  hound: 'Hounds follow their nose into ticks, garbage, and ear infections. Prevention calendars and ear logs are part of the medical record, not grooming trivia.',
  terrier: 'Terriers pick fights with skin, teeth, and small wildlife. Allergy and dental records will outlive the cute “feisty” story.',
  toy: 'Toy-group dogs live in laps and ER waiting rooms for hypoglycemia, luxating patellas, and dental extractions. Tiny patients need dated weights more than motivational quotes.',
  'non-sporting': 'This group is a mixed medical bag. Trust the breed healthFocus on this page more than the kennel-club cluster name.',
  companion: 'Companion-bred dogs still get breed disease. Treat the healthFocus as the watch list even if the dog’s job is the couch.',
};

function sizeBlurb(size: string, category: string): string {
  if (category === 'puppy') return SIZE_PUPPY[size] ?? SIZE_PUPPY.medium;
  if (category === 'senior') return SIZE_SENIOR[size] ?? SIZE_SENIOR.medium;
  if (category === 'diet' && (size === 'large' || size === 'giant')) return SIZE_PUPPY[size] ?? SIZE_PUPPY.large;
  return SIZE_ADULT[size] ?? SIZE_ADULT.medium;
}

export function healthFocusBrief(healthFocus: string, stageLabel: string): string {
  const text = healthFocus.toLowerCase();
  if (text.includes('ivdd') || text.includes('disc') || text.includes('spine')) {
    return `Because ${healthFocus} sits on this breed's chart, ${stageLabel.toLowerCase()} decisions should assume a spine that does not love stairs or sofa jumps. Log mobility the same week you change food or vaccines.`;
  }
  if (text.includes('heart') || text.includes('cardiac') || text.includes('valve') || text.includes('cardiomyopathy')) {
    return `Cardiac watch (${healthFocus}) means anesthesia, fluids, and intense exercise around this ${stageLabel.toLowerCase()} window need a veterinarian, not a forum. Keep murmur grade and echo dates in the vault.`;
  }
  if (text.includes('boas') || text.includes('airway') || text.includes('brachy')) {
    return `Airway risk (${healthFocus}) changes heat, travel crates, and vaccine-day stress. Do not plan a boarding drop-off on a 95 F afternoon as if this were a snouted sporting dog.`;
  }
  if (text.includes('mdr1')) {
    return `MDR1 sensitivity means some stock dewormers and sedatives are not casual. Put the genetic result next to this ${stageLabel.toLowerCase()} file before a new clinic "just gives a little extra ivermectin."`;
  }
  if (text.includes('bloat') || text.includes('gastric')) {
    return `GDV risk (${healthFocus}) is a minutes problem. Meal timing around this ${stageLabel.toLowerCase()} plan should avoid a huge dinner then a sprint.`;
  }
  if (text.includes('dental') || text.includes('tracheal')) {
    return `Dental and tracheal notes (${healthFocus}) belong on the same page as diet texture and collar vs harness choices during this ${stageLabel.toLowerCase()} stage.`;
  }
  if (text.includes('cancer') || text.includes('osteo') || text.includes('lymphoma')) {
    return `Cancer awareness (${healthFocus}) is not a reason to skip this ${stageLabel.toLowerCase()} work. It is a reason to date every lump photo and lab so a later oncologist is not guessing.`;
  }
  if (text.includes('kidney') || text.includes('renal')) {
    return `Renal risk (${healthFocus}) makes NSAIDs and dehydration during this ${stageLabel.toLowerCase()} period a documented conversation, not an afterthought.`;
  }
  if (text.includes('allerg') || text.includes('atopic') || text.includes('skin')) {
    return `Skin and allergy load (${healthFocus}) will confound every diet trial in this ${stageLabel.toLowerCase()} window if you change protein, parasite control, and laundry detergent in the same week.`;
  }
  if (text.includes('obes') || text.includes('weight') || text.includes('joint') || text.includes('hip')) {
    return `Joint and weight load (${healthFocus}) is the quiet multiplier. Keep a weekly weight beside this ${stageLabel.toLowerCase()} checklist.`;
  }
  return `Keep ${healthFocus} visible on the ${stageLabel.toLowerCase()} timeline so specialists do not treat this dog like a generic mixed-breed flowchart.`;
}

export function uniqueLifecycleParagraphs(entry: LifecycleMatrixEntry): string[] {
  const { breed, stage } = entry;
  const group = GROUP_NOTE[breed.group] ?? GROUP_NOTE['non-sporting'];
  const aliases = breed.aliases.length
    ? ` Searchers also use ${breed.aliases.map((alias) => `"${alias}"`).join(', ')} for this breed.`
    : '';

  return [
    `This is not a generic dog article with the word ${breed.name} pasted in the headline. It is a ${stage.label.toLowerCase()} plan for a ${breed.size} ${breed.group} dog whose adult weight is ${breed.adultWeight} and whose typical lifespan is ${breed.lifespanYears} years.${aliases}`,
    `The medical watch list that should sit next to this ${stage.kicker.toLowerCase()} work is ${breed.healthFocus}. If a paragraph on this site could apply equally to a Chihuahua and a Mastiff, it does not belong on this URL.`,
    sizeBlurb(breed.size, stage.category),
    group,
    healthFocusBrief(breed.healthFocus, stage.label),
    `Practical standard for this page: photograph every certificate the day it is issued, put the next due date in a shared reminder, and store the PDF beside weight and stool notes so a boarding desk, neurologist, or ER in a strange zip code can read the same ${breed.name} file.`,
    `If ${breed.healthFocus} is already active, do not start a new diet, supplement, or over-the-counter pain drug without putting the change on the timeline. Stacking treatments is how "we tried everything" becomes an unreadable chart.`,
  ];
}

export function uniqueResourceParagraphs(entry: ResourceMatrixEntry): string[] {
  const { city, topic } = entry;
  return [
    `${topic.label} in ${city.name}, ${city.stateAbbr} is a records problem wearing a local-services costume. ${city.facilityNote}`,
    `Climate and lifestyle in this metro: ${city.climateNote}. That changes parasite pressure, heat-risk notes, hurricane or blizzard go-bags, and how often Bordetella or fecal tests get asked at intake.`,
    `The packet you hand a ${city.name} desk should match the pet in front of them: name, microchip, rabies tag, and dates that do not contradict each other. A PDF on a different phone is why intake fails.`,
    `This ${topic.kicker.toLowerCase()} page is the ${city.region} version of that checklist. Use it to build one vault, then share a link with sitters and family instead of forwarding a 40-image text thread.`,
    `Keep prescription-diet authorizations, heartworm dates, and ER contacts in the same folder as the boarding vaccines. ${city.name} clinics will not reconstruct your Google Photos album at 1 a.m.`,
    `Search intent for this URL: ${topic.searchIntent}. If a ${city.name} form asks for something that is not in the checklist, photograph the form and add it to the vault the same day.`,
  ];
}
