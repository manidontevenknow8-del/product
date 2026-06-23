import type { DominanceCtaKind, DominanceEngine } from './types';

const CTA_BY_ENGINE: Record<DominanceEngine, [DominanceCtaKind, DominanceCtaKind]> = {
  1: ['vet-bill-decoder', 'vet-bill-decoder'],
  2: ['pet-match', 'pet-match'],
  3: ['health-foresight', 'health-foresight'],
  4: ['emergency-passport', 'emergency-passport'],
  5: ['digital-pet-os', 'digital-pet-os'],
};

const CTA_COPY: Record<DominanceCtaKind, { title: string; body: string; action: string }> = {
  'vet-bill-decoder': {
    title: 'Stop guessing what your vet bill means',
    body:
      'Upload an invoice and PetClues AI Vet Bill Decoder flags duplicate line items, explains CBC/Chem panels in plain English, and benchmarks charges against typical 2026 pricing in your region.',
    action: '[Decode your next vet bill free →](/signup)',
  },
  'pet-match': {
    title: 'Match a breed to your real life, not Instagram',
    body:
      'Apartment size, work hours, allergy risk, and lifetime vet spend matter more than coat color. The PetClues Pet Match Engine scores breeds against your budget and lifestyle in under three minutes.',
    action: '[Take the Pet Match quiz →](/pet-match)',
  },
  'health-foresight': {
    title: 'Turn symptom notes into a timeline your vet can use',
    body:
      'PetClues Pro Health Foresight AI logs vomiting episodes, limping, water intake, and medication responses, then surfaces patterns before they become ER visits.',
    action: '[Start symptom tracking →](/signup)',
  },
  'emergency-passport': {
    title: 'One link. Every vaccine, allergy, and emergency contact.',
    body:
      'PetClues Plus Emergency Passport generates a shareable medical profile for sitters, boarders, and border agents, updated the moment you upload a new record.',
    action: '[Build your Emergency Passport →](/signup)',
  },
  'digital-pet-os': {
    title: 'Your pet deserves more than a shoebox of receipts',
    body:
      'PetClues Digital Pet OS stores labs, imaging, behavior notes, and milestones in a searchable Living Archive, built for 15-year care arcs, not single appointments.',
    action: '[Create your Living Archive →](/signup)',
  },
};

export function formatDominanceCta(kind: DominanceCtaKind): string {
  const copy = CTA_COPY[kind];
  return `> **${copy.title}**
>
> ${copy.body}
>
> ${copy.action}`;
}

export function getDominanceCtas(engine: DominanceEngine): [string, string] {
  const [first, second] = CTA_BY_ENGINE[engine];
  return [formatDominanceCta(first), formatDominanceCta(second)];
}
