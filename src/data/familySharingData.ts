import type {
  Caretaker,
  PermissionDefinition,
  SharedPet,
} from '@/types/familySharing';

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    level: 'view_only',
    label: 'View only',
    description: 'See pet information without making changes.',
    capabilities: [
      'View pet profile',
      'View timeline',
      'View emergency passport',
    ],
  },
  {
    level: 'care_manager',
    label: 'Care manager',
    description: 'Help with day-to-day care tasks and records.',
    capabilities: [
      'Everything in View only',
      'Manage reminders',
      'Add health records',
      'Update timeline',
    ],
  },
  {
    level: 'owner',
    label: 'Owner',
    description: 'Full access including permission management.',
    capabilities: [
      'Everything in Care manager',
      'Manage permissions',
      'Remove caretakers',
      'Full account control',
    ],
  },
];

export const mockSharedPets: SharedPet[] = [
  { id: 'pet-luna', name: 'Luna', species: 'Dog', avatarInitials: 'LU' },
];

export function buildMockCaretakers(): Caretaker[] {
  return [
    {
      id: 'c1',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      permission: 'care_manager',
      status: 'active',
      sharedPetIds: ['pet-luna'],
      invitedAt: '2026-04-12T10:00:00.000Z',
      lastActiveAt: '2026-05-29T14:30:00.000Z',
    },
    {
      id: 'c2',
      name: 'James Rivera',
      email: 'james.r@email.com',
      permission: 'view_only',
      status: 'pending',
      sharedPetIds: ['pet-luna'],
      invitedAt: '2026-05-28T09:00:00.000Z',
      lastActiveAt: null,
    },
  ];
}

export const FUTURE_ACCESS_TYPES = [
  { id: 'vet', title: 'Vet access', description: 'Grant temporary access for clinic visits' },
  { id: 'groomer', title: 'Groomer access', description: 'Share grooming notes and preferences' },
  { id: 'boarding', title: 'Boarding facility', description: 'Emergency contacts and care instructions' },
  { id: 'emergency', title: 'Emergency temporary access', description: 'Time-limited full access in crises' },
  { id: 'household', title: 'Household pet groups', description: 'Manage multiple pets under one household' },
];
