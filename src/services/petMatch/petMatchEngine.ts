import type {
  BreedRecommendation,
  CareDifficulty,
  PetMatchAnswers,
  PetMatchResult,
  Species,
} from '@/types/petMatch';

type BreedProfile = {
  breed: string;
  species: Species;
  preferredHome: 'apartment' | 'house' | 'any';
  familyFriendly: boolean;
  petFriendly: boolean;
  minExperience: 0 | 1 | 2;
  budgetNeed: 0 | 1 | 2;
  timeNeed: 0 | 1 | 2;
  activityNeed: 0 | 1 | 2;
  noiseLevel: 0 | 1 | 2;
  travelFlexibility: 0 | 1 | 2;
  size: 'small' | 'medium' | 'large';
  careDifficulty: CareDifficulty;
  monthlyCost: { min: number; max: number };
};

const BREED_PROFILES: BreedProfile[] = [
  {
    breed: 'Cavalier King Charles Spaniel',
    species: 'dog',
    preferredHome: 'apartment',
    familyFriendly: true,
    petFriendly: true,
    minExperience: 0,
    budgetNeed: 1,
    timeNeed: 1,
    activityNeed: 1,
    noiseLevel: 1,
    travelFlexibility: 1,
    size: 'small',
    careDifficulty: 'Moderate',
    monthlyCost: { min: 120, max: 240 },
  },
  {
    breed: 'Labrador Retriever',
    species: 'dog',
    preferredHome: 'house',
    familyFriendly: true,
    petFriendly: true,
    minExperience: 1,
    budgetNeed: 1,
    timeNeed: 2,
    activityNeed: 2,
    noiseLevel: 1,
    travelFlexibility: 0,
    size: 'large',
    careDifficulty: 'Moderate',
    monthlyCost: { min: 180, max: 320 },
  },
  {
    breed: 'Shih Tzu',
    species: 'dog',
    preferredHome: 'apartment',
    familyFriendly: true,
    petFriendly: true,
    minExperience: 0,
    budgetNeed: 1,
    timeNeed: 1,
    activityNeed: 0,
    noiseLevel: 0,
    travelFlexibility: 1,
    size: 'small',
    careDifficulty: 'Low',
    monthlyCost: { min: 100, max: 210 },
  },
  {
    breed: 'Domestic Shorthair',
    species: 'cat',
    preferredHome: 'any',
    familyFriendly: true,
    petFriendly: true,
    minExperience: 0,
    budgetNeed: 0,
    timeNeed: 0,
    activityNeed: 0,
    noiseLevel: 0,
    travelFlexibility: 2,
    size: 'small',
    careDifficulty: 'Low',
    monthlyCost: { min: 70, max: 150 },
  },
  {
    breed: 'Ragdoll',
    species: 'cat',
    preferredHome: 'any',
    familyFriendly: true,
    petFriendly: true,
    minExperience: 0,
    budgetNeed: 1,
    timeNeed: 1,
    activityNeed: 0,
    noiseLevel: 0,
    travelFlexibility: 1,
    size: 'medium',
    careDifficulty: 'Low',
    monthlyCost: { min: 90, max: 180 },
  },
  {
    breed: 'Maine Coon',
    species: 'cat',
    preferredHome: 'house',
    familyFriendly: true,
    petFriendly: true,
    minExperience: 1,
    budgetNeed: 1,
    timeNeed: 1,
    activityNeed: 1,
    noiseLevel: 1,
    travelFlexibility: 1,
    size: 'large',
    careDifficulty: 'Moderate',
    monthlyCost: { min: 110, max: 220 },
  },
  {
    breed: 'Mini Lop',
    species: 'rabbit',
    preferredHome: 'apartment',
    familyFriendly: true,
    petFriendly: false,
    minExperience: 0,
    budgetNeed: 0,
    timeNeed: 1,
    activityNeed: 0,
    noiseLevel: 0,
    travelFlexibility: 1,
    size: 'small',
    careDifficulty: 'Moderate',
    monthlyCost: { min: 60, max: 140 },
  },
];

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function normalizeLevel(value: string): 0 | 1 | 2 {
  if (value === 'high' || value === 'experienced' || value === 'often') return 2;
  if (value === 'medium' || value === 'some_experience' || value === 'sometimes') return 1;
  return 0;
}

function scoreBreed(profile: BreedProfile, answers: PetMatchAnswers): BreedRecommendation {
  let points = 50;
  const reasons: string[] = [];

  if (profile.preferredHome === 'any' || profile.preferredHome === answers.homeType) {
    points += 10;
    reasons.push(`Fits your ${answers.homeType} living setup`);
  } else {
    points -= 12;
  }

  if (answers.children === 'yes') {
    if (profile.familyFriendly) {
      points += 8;
      reasons.push('Good family-friendly temperament');
    } else {
      points -= 8;
    }
  }

  if (answers.existingPets === 'yes') {
    if (profile.petFriendly) {
      points += 8;
      reasons.push('Known to adapt well with existing pets');
    } else {
      points -= 12;
    }
  }

  const experience = normalizeLevel(answers.experienceLevel);
  if (experience >= profile.minExperience) {
    points += 7;
  } else {
    points -= 10;
  }

  const budget = normalizeLevel(answers.budget);
  if (budget >= profile.budgetNeed) {
    points += 6;
  } else {
    points -= 10;
  }

  const freeTime = normalizeLevel(answers.freeTime);
  if (freeTime >= profile.timeNeed) {
    points += 7;
    reasons.push('Daily care time aligns with this breed');
  } else {
    points -= 10;
  }

  const activity = normalizeLevel(answers.activityLevel);
  if (Math.abs(activity - profile.activityNeed) <= 1) {
    points += 7;
  } else {
    points -= 8;
  }

  const noiseTolerance = normalizeLevel(answers.noiseTolerance);
  if (noiseTolerance >= profile.noiseLevel) {
    points += 5;
  } else {
    points -= 8;
  }

  const travel = normalizeLevel(answers.travelFrequency);
  if (travel <= profile.travelFlexibility + 1) {
    points += 5;
  } else {
    points -= 8;
  }

  if (answers.preferredPetSize !== 'any') {
    if (answers.preferredPetSize === profile.size) {
      points += 8;
      reasons.push(`Matches your ${answers.preferredPetSize} size preference`);
    } else {
      points -= 6;
    }
  }

  const matchScore = clampScore(points);
  return {
    breed: profile.breed,
    species: profile.species,
    matchScore,
    reasons: reasons.slice(0, 3),
    careDifficulty: profile.careDifficulty,
    estimatedMonthlyCost: profile.monthlyCost,
  };
}

function averageCost(items: BreedRecommendation[]): { min: number; max: number } {
  const min = Math.round(items.reduce((sum, item) => sum + item.estimatedMonthlyCost.min, 0) / items.length);
  const max = Math.round(items.reduce((sum, item) => sum + item.estimatedMonthlyCost.max, 0) / items.length);
  return { min, max };
}

function dominantDifficulty(items: BreedRecommendation[]): CareDifficulty {
  const weights = items.reduce<Record<CareDifficulty, number>>(
    (acc, item) => ({ ...acc, [item.careDifficulty]: (acc[item.careDifficulty] ?? 0) + 1 }),
    { Low: 0, Moderate: 0, High: 0 },
  );
  if (weights.High >= weights.Moderate && weights.High >= weights.Low) return 'High';
  if (weights.Moderate >= weights.Low) return 'Moderate';
  return 'Low';
}

function summaryForAnswers(answers: PetMatchAnswers): string[] {
  const notes: string[] = [];
  notes.push(
    answers.activityLevel === 'high'
      ? 'You have an active routine, so energetic companions rank higher.'
      : 'Your activity profile favors companions that are easier to maintain daily.',
  );
  notes.push(
    answers.travelFrequency === 'often'
      ? 'Frequent travel weights recommendations toward adaptable or lower-maintenance pets.'
      : 'Lower travel frequency enables recommendations that need stronger daily continuity.',
  );
  notes.push(
    answers.budget === 'high'
      ? 'Higher budget unlocks broader breed options and proactive care plans.'
      : 'Budget-aware matching prioritizes high-fit options with sustainable monthly costs.',
  );
  return notes;
}

export function runPetMatchEngine(answers: PetMatchAnswers): PetMatchResult {
  const scored = BREED_PROFILES.map((profile) => scoreBreed(profile, answers))
    .sort((a, b) => b.matchScore - a.matchScore);

  const top = scored.slice(0, 3);
  const speciesScore = top.reduce<Record<Species, number>>(
    (acc, item) => ({ ...acc, [item.species]: (acc[item.species] ?? 0) + item.matchScore }),
    { dog: 0, cat: 0, rabbit: 0 },
  );
  const recommendedSpecies = (Object.entries(speciesScore).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'dog') as Species;

  const compatibilityScore = Math.round(top.reduce((sum, item) => sum + item.matchScore, 0) / top.length);

  return {
    compatibilityScore,
    recommendedSpecies,
    recommendedBreeds: top,
    careDifficulty: dominantDifficulty(top),
    estimatedMonthlyCost: averageCost(top),
    fitSummary: summaryForAnswers(answers),
  };
}
