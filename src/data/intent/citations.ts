import type { IntentCitation } from '@/types/intentPage';

/** Authoritative sources cited across intent pages (AVMA, USDA, AAHA, etc.). */
export const AUTHORITY_CITATIONS = {
  avmaRecords: {
    name: 'American Veterinary Medical Association (AVMA)',
    url: 'https://www.avma.org/resources-tools/pet-owners/petcare',
    context: 'AVMA guidance on maintaining complete veterinary medical records for continuity of care.',
  },
  aahaWellness: {
    name: 'American Animal Hospital Association (AAHA)',
    url: 'https://www.aaha.org/your-pet/',
    context: 'AAHA resources on preventive care schedules including vaccinations and wellness visits.',
  },
  usdaPetTravel: {
    name: 'USDA APHIS Pet Travel',
    url: 'https://www.aphis.usda.gov/pet-travel',
    context: 'USDA requirements for interstate and international pet travel health certificates.',
  },
  akcHealth: {
    name: 'American Kennel Club (AKC) – Dog Health',
    url: 'https://www.akc.org/expert-advice/health/',
    context: 'AKC expert guidance on vaccination timing and everyday dog health documentation.',
  },
  cdcRabies: {
    name: 'Centers for Disease Control and Prevention (CDC) – Rabies',
    url: 'https://www.cdc.gov/rabies/',
    context: 'CDC information on rabies vaccination importance for pets and public health.',
  },
  fdaAnimalHealth: {
    name: 'U.S. FDA – Animal & Veterinary',
    url: 'https://www.fda.gov/animal-veterinary',
    context: 'FDA resources on veterinary medications, prescriptions, and safe use.',
  },
  aspcaPoison: {
    name: 'ASPCA Animal Poison Control',
    url: 'https://www.aspca.org/pet-care/animal-poison-control',
    context: 'ASPCA guidance on poison exposure preparedness for pet households.',
  },
  hsusEmergency: {
    name: 'The Humane Society of the United States – Disaster Planning',
    url: 'https://www.humanesociety.org/resources/make-disaster-plan-your-pets',
    context: 'Humane Society recommendations for pet emergency and evacuation planning.',
  },
} as const satisfies Record<string, IntentCitation>;
