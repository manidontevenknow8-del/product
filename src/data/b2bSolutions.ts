/**
 * B2B vertical solutions for IPATA relocation agencies and luxury breeders.
 * White-label digital handover vaults for client pets.
 */

export type B2BVerticalId = 'agency' | 'breeder';

export type B2BPricingTier = {
  id: 'handover' | 'unlimited';
  name: string;
  priceLabel: string;
  priceAmount: number;
  billing: 'one-time' | 'monthly';
  description: string;
  highlights: string[];
};

export type B2BWorkflowStep = {
  step: string;
  oldWay: string;
  conciergeWay: string;
};

export type B2BSolution = {
  id: B2BVerticalId;
  path: string;
  aliasPaths: string[];
  eyebrow: string;
  title: string;
  subtitle: string;
  heroHeadline: string;
  heroLead: string;
  painPoints: string[];
  coreSolution: string;
  calculatorLabel: string;
  hoursPerPet: number;
  errorReductionBase: number;
  workflow: B2BWorkflowStep[];
  pricing: B2BPricingTier[];
  formCta: string;
  sandboxNote: string;
};

export const B2B_PRICING_HANDOVER: B2BPricingTier = {
  id: 'handover',
  name: 'White-Glove Handover Setup',
  priceLabel: '$150',
  priceAmount: 150,
  billing: 'one-time',
  description:
    'One-time per pet - manual record digitization and a branded client portal ready at handover.',
  highlights: [
    'Manual digitization of vet PDFs, titers, and imaging',
    'Custom-branded client vault at delivery',
    'Lifetime archive the buyer keeps after the move or sale',
  ],
};

export const B2B_PRICING_UNLIMITED: B2BPricingTier = {
  id: 'unlimited',
  name: 'Unlimited Agency License',
  priceLabel: '$299',
  priceAmount: 299,
  billing: 'monthly',
  description:
    'Flat monthly - unlimited client vaults plus priority API access for your operations stack.',
  highlights: [
    'Unlimited client vaults under your brand',
    'Priority API access for CRM / logistics sync',
    'Dedicated onboarding for IPATA / kennel workflows',
  ],
};

export const AGENCY_SOLUTION: B2BSolution = {
  id: 'agency',
  path: '/for-agencies',
  aliasPaths: ['/relocation-partners'],
  eyebrow: 'IPATA · Pet Relocation Agencies',
  title: 'White-label customs vaults for every client move',
  subtitle:
    'Stop chasing messy PDFs. Deploy a permanent branded digital sanctuary for every origin → destination corridor.',
  heroHeadline: 'Close high-ticket relocation clients with a pre-built Customs Vault',
  heroLead:
    'IPATA agencies lose deals when documentation lives in email threads. PetClues Concierge gives every shipper a white-label handover vault - titers, DEFRA/USDA packs, and quarantine clocks in one place.',
  painPoints: [
    'Chasing messy PDFs from clients across WhatsApp, email, and Dropbox',
    'Day-of-travel rejections from incomplete CDC / DEFRA / AVS packets',
    'No durable client archive after the move - zero retention leverage',
    'Staff hours burned rebuilding the same corridor checklist per booking',
  ],
  coreSolution:
    'A white-label digital handover vault: your brand on the outside, PetClues Concierge ops on the inside - customs dossiers, titer clocks, and client-facing portals that survive the flight.',
  calculatorLabel: 'Monthly pets you relocate',
  hoursPerPet: 2.4,
  errorReductionBase: 38,
  workflow: [
    {
      step: '01 · Intake',
      oldWay: 'Messy email threads and scattered vaccine scans',
      conciergeWay: 'Branded intake vault with required docs checklist',
    },
    {
      step: '02 · Compliance',
      oldWay: 'Spreadsheets guessing titer waits and form windows',
      conciergeWay: 'Corridor dossier with dated critical-path gates',
    },
    {
      step: '03 · Handover',
      oldWay: 'ZIP file dumped on the owner at landing',
      conciergeWay: 'Permanent branded sanctuary the client keeps for life',
    },
  ],
  pricing: [B2B_PRICING_HANDOVER, B2B_PRICING_UNLIMITED],
  formCta: 'Claim Agency Sandbox & Allocation',
  sandboxNote:
    'Submit to open your assigned agency sandbox instantly - no password wall. Explore a live vault, then lock your allocation.',
};

export const BREEDER_SOLUTION: B2BSolution = {
  id: 'breeder',
  path: '/for-breeders',
  aliasPaths: ['/breeder-partners'],
  eyebrow: 'Luxury · High-End Breeders',
  title: 'Puppy handover that feels like a private bank vault',
  subtitle:
    'Replace cheap paper folders with a white-label digital sanctuary buyers show off - and come back to for life.',
  heroHeadline: 'Elevate every puppy handover into a branded lifetime vault',
  heroLead:
    'High-end breeders lose brand equity when medical history leaves in a manila folder. PetClues Concierge digitizes the litter record and hands buyers a permanent, branded portal.',
  painPoints: [
    'Cheap paper folders at puppy handover that get lost in week one',
    'Buyers texting for vaccine dates you already printed twice',
    'No polished digital touchpoint after a five-figure placement',
    'Fragmented litter records across notebooks, clinics, and email',
  ],
  coreSolution:
    'White-label litter and puppy vaults: your kennel brand, digitized health timelines, and a buyer portal that becomes the forever medical home - not a forgotten PDF.',
  calculatorLabel: 'Monthly puppies / placements',
  hoursPerPet: 1.8,
  errorReductionBase: 42,
  workflow: [
    {
      step: '01 · Litter record',
      oldWay: 'Manila folders and clinic printouts in a tote bag',
      conciergeWay: 'Digitized litter dossier with vaccines, microchips, genetics',
    },
    {
      step: '02 · Buyer briefing',
      oldWay: 'Verbal instructions that evaporate after pickup',
      conciergeWay: 'Branded portal with care protocol and reminder schedule',
    },
    {
      step: '03 · Lifetime bond',
      oldWay: 'Radio silence until the next emergency text',
      conciergeWay: 'Permanent sanctuary that keeps your kennel top-of-mind',
    },
  ],
  pricing: [B2B_PRICING_HANDOVER, B2B_PRICING_UNLIMITED],
  formCta: 'Claim Breeder Sandbox & Allocation',
  sandboxNote:
    'Submit to open your assigned breeder sandbox instantly - tour a live handover vault, then claim your allocation.',
};

export const B2B_SOLUTIONS: readonly B2BSolution[] = [AGENCY_SOLUTION, BREEDER_SOLUTION];

export function getB2BSolution(id: B2BVerticalId): B2BSolution {
  return id === 'agency' ? AGENCY_SOLUTION : BREEDER_SOLUTION;
}

/** Hours saved + document error reduction from monthly volume. */
export function calculateAgencyAllocation(volume: number, solution: B2BSolution) {
  const pets = Math.max(1, Math.min(200, Math.round(volume)));
  const hoursSaved = Math.round(pets * solution.hoursPerPet * 10) / 10;
  const errorReduction = Math.min(
    92,
    Math.round(solution.errorReductionBase + Math.log2(pets + 1) * 8),
  );
  const staffDays = Math.round((hoursSaved / 8) * 10) / 10;
  return { pets, hoursSaved, errorReduction, staffDays };
}
