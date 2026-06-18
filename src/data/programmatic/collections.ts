import type { ProgrammaticCollectionId } from '@/types/programmaticPage';

export type ProgrammaticCollection = {
  id: ProgrammaticCollectionId;
  label: string;
  description: string;
  hubCardDescription: string;
};

export const PROGRAMMATIC_COLLECTIONS: ProgrammaticCollection[] = [
  {
    id: 'dog-vaccination-schedule',
    label: 'Dog vaccination schedules by breed',
    description:
      'Breed-aware puppy and adult dog vaccine timelines with core shots, boosters, and lifestyle vaccine notes.',
    hubCardDescription: 'Core puppy series, annual boosters, and breed-specific vaccine considerations for popular dog breeds.',
  },
  {
    id: 'cat-vaccination-schedule',
    label: 'Cat vaccination schedules by breed',
    description:
      'Indoor, outdoor, and multi-cat household vaccine plans tailored to popular cat breeds.',
    hubCardDescription: 'Kitten series, FVRCP boosters, rabies timing, and breed-relevant wellness notes for cats.',
  },
  {
    id: 'pet-travel-checklist',
    label: 'Pet travel checklists by country',
    description:
      'Entry documents, rabies windows, microchip rules, and pre-trip milestones for international pet travel.',
    hubCardDescription: 'Country-specific travel prep: certificates, vaccines, microchips, and airline-ready documentation.',
  },
  {
    id: 'pet-emergency-checklist',
    label: 'Pet emergency checklists by species',
    description:
      'Species-specific vital signs, first-aid kit items, and when-to-call-the-vet urgency signals.',
    hubCardDescription: 'Emergency readiness for dogs, cats, birds, rabbits, reptiles, and fish.',
  },
  {
    id: 'medication-tracking-template',
    label: 'Medication tracking templates',
    description:
      'Printable and digital-friendly medication logs for daily doses, chronic conditions, and post-surgery care.',
    hubCardDescription: 'Structured medication trackers for puppies, seniors, multi-pet homes, and prevention routines.',
  },
  {
    id: 'health-record-template',
    label: 'Health record templates',
    description:
      'Starter health record templates for puppies, kittens, adoptions, seniors, and multi-pet households.',
    hubCardDescription: 'Organize vaccines, vet visits, labs, and ownership paperwork from day one.',
  },
  {
    id: 'pet-care-checklist',
    label: 'Pet care checklist templates',
    description:
      'Reusable care checklists for new pets, annual wellness, boarding, travel, grooming, and senior care.',
    hubCardDescription: 'Practical checklists pet parents can run weekly, seasonally, or before major events.',
  },
];

const BY_ID = new Map(PROGRAMMATIC_COLLECTIONS.map((collection) => [collection.id, collection]));

export function getProgrammaticCollection(id: ProgrammaticCollectionId): ProgrammaticCollection {
  const collection = BY_ID.get(id);
  if (!collection) throw new Error(`Unknown programmatic collection: ${id}`);
  return collection;
}

export function listProgrammaticCollections(): ProgrammaticCollection[] {
  return PROGRAMMATIC_COLLECTIONS;
}
