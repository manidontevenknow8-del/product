export type Pet = {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  weight: string;
  avatarInitials: string;
};

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'health' | 'scan' | 'vet' | 'medication' | 'note';
};

export type ScanResult = {
  id: string;
  date: string;
  type: string;
  status: 'completed' | 'pending' | 'review';
  summary: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
};

export type NavItem = {
  label: string;
  path: string;
  icon?: string;
};

export type OnboardingStep = {
  id: number;
  title: string;
  description: string;
};
