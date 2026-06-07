import type { Pet } from '@/types';

export type PetProfile = Pet & {
  diet: string;
  vaccinationStatus: string;
  allergies: string;
  microchipId: string | null;
  gender: string;
  dateOfBirth: string;
  color: string;
  conditionsNotes: string;
  photo: string | null;
};

export type HealthRecordEntry = {
  id: string;
  type: 'vaccine' | 'vet' | 'medication' | 'note';
  title: string;
  date: string;
  detail: string;
  status?: string;
};

export type VaultDocument = {
  id: string;
  name: string;
  category: 'bill' | 'prescription' | 'report' | 'image' | 'emergency';
  date: string;
  size: string;
};

export type ProfileStatus = {
  label: string;
  variant: 'success' | 'warning' | 'default' | 'accent';
};
