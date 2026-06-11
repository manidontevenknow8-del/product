export type OnboardingPetData = {
  name: string;
  species: 'dog' | 'cat' | 'other' | '';
  breed: string;
  age: string;
  photo: string | null;
  photoName: string;
  vaccinationStatus: string;
  allergies: string;
  dietType: string;
  weight: string;
  conditionsNotes: string;
};

export const emptyOnboardingData = (): OnboardingPetData => ({
  name: '',
  species: '',
  breed: '',
  age: '',
  photo: null,
  photoName: '',
  vaccinationStatus: '',
  allergies: '',
  dietType: '',
  weight: '',
  conditionsNotes: '',
});

export type OnboardingStepId = 'portrait' | 'name' | 'species' | 'age';

export const ONBOARDING_STEPS: { id: OnboardingStepId; label: string }[] = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'name', label: 'Name' },
  { id: 'species', label: 'Companion' },
  { id: 'age', label: 'Age' },
];
