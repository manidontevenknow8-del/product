import type { Sighting } from '@/types/lostPet';

export const LOST_PET_EMERGENCY_CONTACTS = [
  { name: 'Alex Morgan', phone: '+1 (555) 123-4567', role: 'Primary owner' },
  { name: 'Dr. Sarah Chen', phone: '+1 (555) 234-8901', role: 'Veterinarian' },
  { name: 'Jordan Morgan', phone: '+1 (555) 123-8901', role: 'Secondary contact' },
];

export const FUTURE_INTEGRATIONS = [
  {
    id: 'geo',
    title: 'Geo notifications',
    description: 'Alert nearby PetClues users when a pet is reported missing in their area.',
  },
  {
    id: 'shelters',
    title: 'Local shelter integration',
    description: 'Automatically notify participating shelters with your recovery poster.',
  },
  {
    id: 'vets',
    title: 'Vet clinic alerts',
    description: 'Send missing pet alerts to clinics in your pet\'s care network.',
  },
  {
    id: 'network',
    title: 'Community recovery network',
    description: 'Connect with verified volunteers and pet recovery groups.',
  },
  {
    id: 'map',
    title: 'Real-time map',
    description: 'Live sighting map with privacy-safe location sharing.',
  },
];

/** Demo sightings shown when case is first activated */
export function getSeedSightings(caseId: string): Sighting[] {
  return [
    {
      id: 'sig-1',
      caseId,
      location: 'Maple Street dog park, north entrance',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      notes: 'Golden retriever matching description, wearing blue collar. Heading east.',
      hasPhoto: false,
      reporterName: 'Community member',
      distance: '0.3 mi',
      status: 'new',
    },
    {
      id: 'sig-2',
      caseId,
      location: 'Corner of Oak Ave & 3rd St',
      reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      notes: 'Seen resting under a bench. Appeared calm but alone.',
      hasPhoto: true,
      reporterName: 'Neighbour',
      distance: '0.8 mi',
      status: 'reviewed',
    },
  ];
}
