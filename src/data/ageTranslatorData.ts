import type { LifeStageInsight, BreedInsight, Milestone } from '@/types/ageTranslator';

export const LIFE_STAGE_INSIGHTS: LifeStageInsight[] = [
  {
    stage: 'puppy',
    title: 'Puppy',
    meaning:
      'The world is new and everything is a discovery. This is when foundations for health, behaviour, and trust are built.',
    carePriorities: [
      'Core vaccinations and parasite prevention',
      'Socialisation and gentle training',
      'Age-appropriate nutrition for growth',
    ],
    watchFor: [
      'Appetite and energy changes',
      'Teething and chewing habits',
      'Signs of anxiety in new environments',
    ],
    checkups: [
      'Puppy wellness visits every 3–4 weeks until 16 weeks',
      'Discuss spay/neuter timing with your vet',
    ],
  },
  {
    stage: 'young_adult',
    title: 'Young Adult',
    meaning:
      'Peak energy and curiosity. Your companion is building confidence, strength, and lifelong habits.',
    carePriorities: [
      'Consistent exercise and mental enrichment',
      'Dental care routines beginning',
      'Maintaining healthy weight',
    ],
    watchFor: [
      'Over-exertion during play',
      'Emerging behavioural patterns',
      'Joint stress in active breeds',
    ],
    checkups: [
      'Annual wellness exam',
      'Booster vaccinations as recommended',
    ],
  },
  {
    stage: 'adult',
    title: 'Adult',
    meaning:
      'The prime years — settled, capable, and full of personality. A wonderful time to deepen your bond through consistent care.',
    carePriorities: [
      'Preventative health screenings',
      'Balanced diet and regular activity',
      'Continued dental and coat care',
    ],
    watchFor: [
      'Subtle weight changes',
      'Changes in energy or mobility',
      'Skin and coat quality shifts',
    ],
    checkups: [
      'Annual comprehensive wellness exam',
      'Dental assessment',
      'Blood work baseline if recommended',
    ],
  },
  {
    stage: 'mature',
    title: 'Mature',
    meaning:
      'Grace and wisdom show through. Your pet may slow slightly, but still has plenty of joyful years ahead with thoughtful care.',
    carePriorities: [
      'Joint support and comfortable movement',
      'Adjusted exercise intensity',
      'Enhanced monitoring of appetite and hydration',
    ],
    watchFor: [
      'Stiffness after rest',
      'Changes in sleep patterns',
      'Vision or hearing differences',
    ],
    checkups: [
      'Wellness exams every 6 months',
      'Senior blood panel discussion',
    ],
  },
  {
    stage: 'senior',
    title: 'Senior',
    meaning:
      'Golden years filled with quiet companionship. Every day together is precious — gentle care keeps comfort high.',
    carePriorities: [
      'Pain management and mobility support',
      'Easily digestible, senior-appropriate nutrition',
      'Warm, accessible resting spaces',
    ],
    watchFor: [
      'Difficulty with stairs or jumping',
      'Increased thirst or urination',
      'Confusion or disorientation',
    ],
    checkups: [
      'Bi-annual senior wellness visits',
      'Regular blood work and urinalysis',
    ],
  },
];

export const GOLDEN_RETRIEVER_INSIGHTS: BreedInsight[] = [
  {
    id: 'gr-joints',
    category: 'joints',
    title: 'Joint health awareness',
    description:
      'Golden Retrievers are active dogs who love to run and play. Supporting joint health early helps maintain mobility into mature years.',
    tip: 'Consider low-impact activities like swimming alongside daily walks.',
  },
  {
    id: 'gr-weight',
    category: 'weight',
    title: 'Weight management',
    description:
      'This breed tends to enjoy food — keeping a healthy weight reduces stress on hips and extends active years.',
    tip: 'Measure meals and account for treats in daily calories.',
  },
  {
    id: 'gr-dental',
    category: 'dental',
    title: 'Dental care focus',
    description:
      'Regular dental hygiene prevents discomfort and supports overall wellbeing as your Golden ages.',
    tip: 'Introduce tooth brushing gradually with vet-approved products.',
  },
  {
    id: 'gr-activity',
    category: 'activity',
    title: 'Activity recommendations',
    description:
      'Goldens thrive with daily exercise and mental stimulation. A tired Golden is a happy Golden.',
    tip: 'Aim for 60–90 minutes of activity split across the day.',
  },
];

export const FUTURE_AGE_FEATURES = [
  {
    id: 'personality',
    title: 'AI personality reports',
    description: 'Personalised temperament insights based on breed, age, and behaviour patterns.',
  },
  {
    id: 'breed-compare',
    title: 'Breed comparison',
    description: 'See how your pet\'s life stage compares to similar breeds and sizes.',
  },
  {
    id: 'longevity',
    title: 'Longevity trends',
    description: 'Track wellness markers over time and understand your pet\'s unique aging journey.',
  },
  {
    id: 'monthly',
    title: 'Monthly life-stage updates',
    description: 'Gentle nudges when your pet approaches a new chapter of life.',
  },
];

export function getMilestonesForPet(
  name: string,
  ageYears: number,
  _lifeStage: string,
): Milestone[] {
  const nextBirthdayYears = ageYears + 1;
  return [
    {
      id: 'ms-birthday',
      title: `${name}'s ${nextBirthdayYears}${getOrdinal(nextBirthdayYears)} birthday`,
      description: 'A perfect moment to celebrate and schedule a wellness check.',
      eta: 'Coming soon',
      type: 'birthday',
    },
    {
      id: 'ms-senior',
      title: 'Senior life stage',
      description: 'Golden Retrievers typically enter senior years around age 8–10.',
      eta: ageYears >= 8 ? 'Current chapter' : `~${8 - ageYears} years away`,
      type: 'life_stage',
    },
    {
      id: 'ms-vaccine',
      title: 'Annual vaccination review',
      description: 'Keep core vaccines current with your veterinarian\'s schedule.',
      eta: 'Next annual visit',
      type: 'vaccine',
    },
    {
      id: 'ms-dental',
      title: 'Dental wellness check',
      description: 'Professional dental assessment recommended annually for adult dogs.',
      eta: 'Within 6 months',
      type: 'preventative',
    },
    {
      id: 'ms-mature',
      title: 'Mature transition',
      description: 'Around age 7, many dogs benefit from adjusted exercise and enhanced screening.',
      eta: ageYears >= 7 ? 'You\'re here' : `~${7 - ageYears} years away`,
      type: 'life_stage',
    },
  ];
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
