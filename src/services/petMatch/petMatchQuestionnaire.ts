import type { PetMatchAnswers, PetMatchQuestion } from '@/types/petMatch';

export const PET_MATCH_QUESTIONS: PetMatchQuestion<keyof PetMatchAnswers>[] = [
  {
    key: 'homeType',
    prompt: 'Do you live in an apartment or a house?',
    options: [
      { value: 'apartment', label: 'Apartment', hint: 'Compact and shared walls' },
      { value: 'house', label: 'House', hint: 'More space, yard possible' },
    ],
  },
  {
    key: 'children',
    prompt: 'Do you have children at home?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'existingPets',
    prompt: 'Do you already have pets?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'experienceLevel',
    prompt: 'How experienced are you with pet care?',
    options: [
      { value: 'first_time', label: 'First-time owner' },
      { value: 'some_experience', label: 'Some experience' },
      { value: 'experienced', label: 'Very experienced' },
    ],
  },
  {
    key: 'budget',
    prompt: 'What monthly pet budget feels comfortable?',
    options: [
      { value: 'low', label: 'Low (budget-conscious)' },
      { value: 'medium', label: 'Medium (balanced)' },
      { value: 'high', label: 'High (premium care)' },
    ],
  },
  {
    key: 'freeTime',
    prompt: 'How much daily free time can you dedicate?',
    options: [
      { value: 'low', label: 'Under 1 hour/day' },
      { value: 'medium', label: '1-2 hours/day' },
      { value: 'high', label: '2+ hours/day' },
    ],
  },
  {
    key: 'activityLevel',
    prompt: 'What activity level fits your lifestyle?',
    options: [
      { value: 'low', label: 'Calm and low activity' },
      { value: 'moderate', label: 'Moderate activity' },
      { value: 'high', label: 'Very active lifestyle' },
    ],
  },
  {
    key: 'noiseTolerance',
    prompt: 'How much noise can you tolerate?',
    options: [
      { value: 'low', label: 'Low (prefer quiet)' },
      { value: 'medium', label: 'Moderate' },
      { value: 'high', label: 'High (noise is fine)' },
    ],
  },
  {
    key: 'travelFrequency',
    prompt: 'How often do you travel?',
    options: [
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
    ],
  },
  {
    key: 'preferredPetSize',
    prompt: 'What pet size do you prefer?',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'any', label: 'No preference' },
    ],
  },
];
