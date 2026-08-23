export type EditorialPerson = {
  id: string;
  name: string;
  role: string;
  credentials?: string;
  specialty?: string;
  bio: string;
  url: string;
  sameAs?: string[];
  image?: string;
};

/**
 * Editorial board configuration.
 *
 * To add a licensed veterinary reviewer later:
 * {
 *   id: 'dr-jane-smith',
 *   name: 'Dr. Jane Smith',
 *   role: 'Veterinary Medical Reviewer',
 *   credentials: 'DVM',
 *   specialty: 'Small Animal Internal Medicine',
 *   bio: 'Dr. Smith is a licensed veterinarian practicing in [State].',
 *   url: '/about#dr-jane-smith',
 *   sameAs: ['https://www.avma.org/...'],
 *   image: '/images/team/dr-jane-smith.jpg',
 * }
 */
export const EDITORIAL_BOARD: EditorialPerson[] = [
  {
    id: 'petclues-clinical-editorial',
    name: 'PetClues Clinical Editorial Team',
    role: 'Clinical editorial standards',
    bio: 'Health content is synthesized from AVMA/AAHA-aligned public veterinary guidance and reviewed against clinical reference checklists. PetClues does not provide licensed medical advice — always consult your veterinarian for diagnosis or treatment.',
    url: '/about#editorial-standards',
  },
];

export function getPrimaryMedicalReviewer(): EditorialPerson {
  return EDITORIAL_BOARD[0];
}

export function getEditorialBoardForAbout(): EditorialPerson[] {
  return EDITORIAL_BOARD.filter((p) => p.url);
}

export const MEDICAL_CONTENT_LAST_REVIEWED = '2026-08-23';

export const MEDICAL_DISCLAIMER_SHORT =
  'This content is for informational purposes only and is not a substitute for professional veterinary care.';
