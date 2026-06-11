import type {
  EditorialBreedMatch,
  EditorialMatchResult,
  EditorialQuizAnswers,
  EditorialQuizQuestion,
} from '@/types/petMatchEditorial';

export const EDITORIAL_PET_MATCH_QUESTIONS: EditorialQuizQuestion<keyof EditorialQuizAnswers>[] = [
  {
    key: 'livingSpace',
    prompt: 'Describe your sanctuary.',
    options: [
      {
        value: 'apartment',
        label: 'City apartment',
        hint: 'Compact, vertical living with shared walls',
      },
      {
        value: 'house_yard',
        label: 'House with yard',
        hint: 'Room to roam, garden, and breathe',
      },
    ],
  },
  {
    key: 'experience',
    prompt: 'Have you shared your home with a pet before?',
    options: [
      {
        value: 'first_time',
        label: 'First-time parent',
        hint: 'Ready to learn with gentle guidance',
      },
      {
        value: 'experienced',
        label: 'Experienced caregiver',
        hint: 'Comfortable with routines and nuance',
      },
    ],
  },
  {
    key: 'activity',
    prompt: 'How much time can you dedicate to activity?',
    options: [
      {
        value: 'couch',
        label: 'Couch potato',
        hint: 'Quiet evenings, short strolls, calm companionship',
      },
      {
        value: 'marathon',
        label: 'Marathon runner',
        hint: 'Daily movement, trails, and high energy',
      },
    ],
  },
  {
    key: 'budget',
    prompt: 'What monthly care budget feels sustainable?',
    options: [
      {
        value: 'lean',
        label: 'Mindful & lean',
        hint: 'Under ₹8,000 / month',
      },
      {
        value: 'balanced',
        label: 'Balanced comfort',
        hint: '₹8,000 – ₹15,000 / month',
      },
      {
        value: 'generous',
        label: 'Generous care',
        hint: '₹15,000+ / month',
      },
    ],
  },
];

type BreedProfile = Omit<EditorialBreedMatch, 'matchScore' | 'matchReason'> & {
  apartmentFit: number;
  houseFit: number;
  firstTimeFit: number;
  experiencedFit: number;
  couchFit: number;
  marathonFit: number;
  leanFit: number;
  balancedFit: number;
  generousFit: number;
};

const BREED_CATALOG: BreedProfile[] = [
  {
    id: 'golden-retriever',
    breed: 'Golden Retriever',
    species: 'dog',
    imageUrl:
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=900&q=80',
    careDifficulty: 'Moderate',
    monthlyCostLabel: '₹10,000 – ₹18,000',
    apartmentFit: 0.6,
    houseFit: 1,
    firstTimeFit: 0.85,
    experiencedFit: 1,
    couchFit: 0.5,
    marathonFit: 1,
    leanFit: 0.4,
    balancedFit: 0.9,
    generousFit: 1,
  },
  {
    id: 'maine-coon',
    breed: 'Maine Coon',
    species: 'cat',
    imageUrl:
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80',
    careDifficulty: 'Moderate',
    monthlyCostLabel: '₹6,000 – ₹12,000',
    apartmentFit: 0.85,
    houseFit: 1,
    firstTimeFit: 0.9,
    experiencedFit: 1,
    couchFit: 0.7,
    marathonFit: 0.55,
    leanFit: 0.7,
    balancedFit: 1,
    generousFit: 0.9,
  },
  {
    id: 'greyhound',
    breed: 'Greyhound',
    species: 'dog',
    imageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
    careDifficulty: 'Low',
    monthlyCostLabel: '₹7,000 – ₹13,000',
    apartmentFit: 1,
    houseFit: 0.8,
    firstTimeFit: 0.8,
    experiencedFit: 1,
    couchFit: 1,
    marathonFit: 0.45,
    leanFit: 0.85,
    balancedFit: 0.9,
    generousFit: 0.7,
  },
  {
    id: 'shih-tzu',
    breed: 'Shih Tzu',
    species: 'dog',
    imageUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    careDifficulty: 'Low',
    monthlyCostLabel: '₹5,000 – ₹10,000',
    apartmentFit: 1,
    houseFit: 0.75,
    firstTimeFit: 1,
    experiencedFit: 0.85,
    couchFit: 1,
    marathonFit: 0.3,
    leanFit: 1,
    balancedFit: 0.8,
    generousFit: 0.6,
  },
  {
    id: 'labrador',
    breed: 'Labrador Retriever',
    species: 'dog',
    imageUrl:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
    careDifficulty: 'Moderate',
    monthlyCostLabel: '₹9,000 – ₹16,000',
    apartmentFit: 0.55,
    houseFit: 1,
    firstTimeFit: 0.75,
    experiencedFit: 1,
    couchFit: 0.4,
    marathonFit: 1,
    leanFit: 0.35,
    balancedFit: 0.95,
    generousFit: 1,
  },
  {
    id: 'british-shorthair',
    breed: 'British Shorthair',
    species: 'cat',
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
    careDifficulty: 'Low',
    monthlyCostLabel: '₹5,500 – ₹11,000',
    apartmentFit: 1,
    houseFit: 0.85,
    firstTimeFit: 1,
    experiencedFit: 0.9,
    couchFit: 1,
    marathonFit: 0.25,
    leanFit: 0.95,
    balancedFit: 0.85,
    generousFit: 0.7,
  },
];

function matchReason(answers: EditorialQuizAnswers, breed: string): string {
  if (answers.activity === 'marathon' && breed.includes('Retriever')) {
    return 'Your active rhythm pairs beautifully with a breed built for joyful daily movement.';
  }
  if (answers.activity === 'couch' && (breed === 'Greyhound' || breed === 'British Shorthair')) {
    return 'A serene companion who treasures calm evenings as much as you do.';
  }
  if (answers.livingSpace === 'apartment' && breed === 'Maine Coon') {
    return 'Gentle giants who adapt gracefully to indoor sanctuaries with vertical space.';
  }
  if (answers.experience === 'first_time' && breed === 'Shih Tzu') {
    return 'Forgiving, affectionate, and wonderfully approachable for a first chapter together.';
  }
  if (answers.budget === 'generous' && breed.includes('Retriever')) {
    return 'Room in your budget for proactive vet care, nutrition, and enrichment they deserve.';
  }
  return 'A thoughtful alignment of temperament, space, and the life you described.';
}

function scoreBreed(profile: BreedProfile, answers: EditorialQuizAnswers): EditorialBreedMatch {
  let score = 0;

  score += answers.livingSpace === 'apartment' ? profile.apartmentFit : profile.houseFit;
  score += answers.experience === 'first_time' ? profile.firstTimeFit : profile.experiencedFit;
  score += answers.activity === 'couch' ? profile.couchFit : profile.marathonFit;

  if (answers.budget === 'lean') score += profile.leanFit;
  else if (answers.budget === 'balanced') score += profile.balancedFit;
  else score += profile.generousFit;

  const matchScore = Math.round((score / 4) * 100);

  return {
    id: profile.id,
    breed: profile.breed,
    species: profile.species,
    imageUrl: profile.imageUrl,
    careDifficulty: profile.careDifficulty,
    monthlyCostLabel: profile.monthlyCostLabel,
    matchReason: matchReason(answers, profile.breed),
    matchScore,
  };
}

export function runEditorialPetMatch(answers: EditorialQuizAnswers): EditorialMatchResult {
  const matches = BREED_CATALOG.map((profile) => scoreBreed(profile, answers))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return {
    matches,
    analyzedAt: new Date().toISOString(),
  };
}

export const PET_MATCH_SIGNUP_PATH = '/signup?from=pet-match';
