import type {
  AgeTranslation,
  HealthFocus,
  LifeStage,
  PetAgeProfile,
  PetSpecies,
} from '@/types/ageTranslator';
import { LIFE_STAGE_INSIGHTS, GOLDEN_RETRIEVER_INSIGHTS } from '@/data/ageTranslatorData';
import type { LifeStageInsight, BreedInsight } from '@/types/ageTranslator';

/** Parse "4 years" or profile age string into years + months */
export function parseAgeString(age: string): { years: number; months: number } {
  const yearMatch = age.match(/(\d+)\s*year/i);
  const monthMatch = age.match(/(\d+)\s*month/i);
  return {
    years: yearMatch ? Number(yearMatch[1]) : 0,
    months: monthMatch ? Number(monthMatch[1]) : 0,
  };
}

export function computeHumanAge(profile: PetAgeProfile): number {
  const totalMonths = profile.ageYears * 12 + profile.ageMonths;
  const years = totalMonths / 12;

  if (profile.species === 'cat') {
    if (years <= 1) return Math.round(15 * years);
    if (years <= 2) return Math.round(24);
    return Math.round(24 + (years - 2) * 4);
  }

  if (profile.species === 'dog') {
    if (years <= 1) return Math.round(15 * years);
    if (years <= 2) return Math.round(12 + 9 * (years - 1));
    const breedSize = getBreedSize(profile.breed);
    const perYear = breedSize === 'large' ? 6 : breedSize === 'small' ? 4 : 5;
    return Math.round(24 + (years - 2) * perYear);
  }

  return Math.round(years * 7);
}

function getBreedSize(breed: string): 'small' | 'medium' | 'large' {
  const large = ['golden retriever', 'labrador', 'german shepherd', 'husky'];
  const small = ['chihuahua', 'pomeranian', 'yorkshire', 'maltese'];
  const lower = breed.toLowerCase();
  if (large.some((b) => lower.includes(b))) return 'large';
  if (small.some((b) => lower.includes(b))) return 'small';
  return 'medium';
}

export function determineLifeStage(profile: PetAgeProfile): LifeStage {
  const years = profile.ageYears + profile.ageMonths / 12;

  if (profile.species === 'cat') {
    if (years < 1) return 'puppy';
    if (years < 2) return 'young_adult';
    if (years < 7) return 'adult';
    if (years < 11) return 'mature';
    return 'senior';
  }

  if (years < 1) return 'puppy';
  if (years < 3) return 'young_adult';
  if (years < 7) return 'adult';
  if (years < 10) return 'mature';
  return 'senior';
}

const stageLabels: Record<LifeStage, string> = {
  puppy: 'Puppy',
  young_adult: 'Young Adult',
  adult: 'Adult',
  mature: 'Mature',
  senior: 'Senior',
};

const stageTaglines: Record<LifeStage, string> = {
  puppy: 'Every day is an adventure',
  young_adult: 'Full of energy and possibility',
  adult: 'In their prime years',
  mature: 'Graceful and wise',
  senior: 'Treasured golden years',
};

export function buildAgeTranslation(profile: PetAgeProfile): AgeTranslation {
  const humanEquivalent = computeHumanAge(profile);
  const lifeStage = determineLifeStage(profile);
  const lifeStageLabel = stageLabels[lifeStage];

  const petAgeLabel =
    profile.ageMonths > 0 && profile.ageYears < 2
      ? `${profile.ageYears}y ${profile.ageMonths}m`
      : `${profile.ageYears} ${profile.ageYears === 1 ? 'year' : 'years'}`;

  const shareMessage = `${profile.name} is ${humanEquivalent} in human years and ${stageTaglines[lifeStage].toLowerCase()}.`;
  const storyHeadline = `${profile.name} · ${humanEquivalent} human years`;

  return {
    petAge: {
      years: profile.ageYears,
      months: profile.ageMonths,
      label: petAgeLabel,
    },
    humanEquivalent,
    humanEquivalentLabel: `${humanEquivalent} years`,
    lifeStage,
    lifeStageLabel,
    lifeStageTagline: stageTaglines[lifeStage],
    shareMessage,
    storyHeadline,
  };
}

export function getLifeStageInsight(stage: LifeStage): LifeStageInsight {
  return LIFE_STAGE_INSIGHTS.find((i) => i.stage === stage) ?? LIFE_STAGE_INSIGHTS[2];
}

export function getBreedInsights(breed: string, _species: PetSpecies): BreedInsight[] {
  if (breed.toLowerCase().includes('golden retriever')) {
    return GOLDEN_RETRIEVER_INSIGHTS;
  }
  return GOLDEN_RETRIEVER_INSIGHTS.slice(0, 2).map((i) => ({
    ...i,
    id: `generic-${i.id}`,
    description: i.description.replace('Golden Retrievers', 'Active breeds'),
  }));
}

export function getHealthFocus(stage: LifeStage, _breed: string): HealthFocus[] {
  const insight = getLifeStageInsight(stage);
  return [
    {
      title: insight.carePriorities[0] ?? 'Preventative wellness',
      description: 'Your vet can help tailor a plan for this life stage.',
      priority: 'primary',
    },
    {
      title: insight.carePriorities[1] ?? 'Consistent routines',
      description: 'Regular habits support long-term wellbeing.',
      priority: 'secondary',
    },
  ];
}

export function buildShareUrl(message: string, format: 'whatsapp' | 'twitter' | 'general'): string {
  const encoded = encodeURIComponent(message);
  switch (format) {
    case 'whatsapp':
      return `https://wa.me/?text=${encoded}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encoded}`;
    default:
      return '';
  }
}
