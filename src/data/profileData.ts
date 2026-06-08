import type { PetProfile, HealthRecordEntry, VaultDocument, ProfileStatus } from '@/types/profile';

export const mockPetProfile: PetProfile = {
  id: '1',
  name: 'Luna',
  species: 'dog',
  breed: 'Golden Retriever',
  age: '4 years',
  weight: '28 kg',
  avatarInitials: 'LU',
  diet: 'Mixed - dry & wet',
  vaccinationStatus: 'Up to date',
  allergies: 'None recorded',
  microchipId: '985112004567890',
  gender: 'Female',
  dateOfBirth: 'May 2022',
  color: 'Golden',
  conditionsNotes: 'No chronic conditions. Active and healthy.',
  photo: null,
};

export const mockProfileStatus: ProfileStatus = {
  label: 'Records current',
  variant: 'success',
};

export const mockHealthRecords: HealthRecordEntry[] = [
  {
    id: '1',
    type: 'vaccine',
    title: 'Rabies booster',
    date: 'Mar 12, 2026',
    detail: 'Administered at Westside Veterinary Clinic',
    status: 'Current',
  },
  {
    id: '2',
    type: 'vaccine',
    title: 'DHPP annual',
    date: 'Mar 12, 2026',
    detail: 'Combined distemper, hepatitis, parvovirus, parainfluenza',
    status: 'Current',
  },
  {
    id: '3',
    type: 'vet',
    title: 'Annual wellness check',
    date: 'May 28, 2026',
    detail: 'Dr. Sarah Chen - all vitals normal, weight stable',
    status: 'Recent',
  },
  {
    id: '4',
    type: 'medication',
    title: 'Flea prevention',
    date: 'May 1, 2026',
    detail: 'Monthly topical treatment - next due Jun 3',
    status: 'Active',
  },
  {
    id: '5',
    type: 'note',
    title: 'Care note',
    date: 'Apr 20, 2026',
    detail: 'Increased activity levels noted - monitor for 2 weeks',
  },
];

export const mockVaultDocuments: VaultDocument[] = [
  {
    id: '1',
    name: 'Wellness check report',
    category: 'report',
    date: 'May 28, 2026',
    size: '1.2 MB',
  },
  {
    id: '2',
    name: 'Vaccination certificate',
    category: 'report',
    date: 'Mar 12, 2026',
    size: '840 KB',
  },
  {
    id: '3',
    name: 'Flea prevention prescription',
    category: 'prescription',
    date: 'May 1, 2026',
    size: '320 KB',
  },
  {
    id: '4',
    name: 'Clinic invoice - May visit',
    category: 'bill',
    date: 'May 28, 2026',
    size: '156 KB',
  },
  {
    id: '5',
    name: 'Coat scan image',
    category: 'image',
    date: 'May 15, 2026',
    size: '2.4 MB',
  },
  {
    id: '6',
    name: 'Emergency care summary',
    category: 'emergency',
    date: 'Jan 10, 2026',
    size: '480 KB',
  },
];

export const profileDetailFields = [
  { key: 'gender', label: 'Gender' },
  { key: 'dateOfBirth', label: 'Date of birth' },
  { key: 'color', label: 'Coat color' },
  { key: 'species', label: 'Species' },
  { key: 'weight', label: 'Weight' },
  { key: 'conditionsNotes', label: 'Conditions & notes' },
] as const;
