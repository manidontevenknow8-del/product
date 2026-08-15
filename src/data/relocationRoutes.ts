/**
 * B2B pet relocation customs matrix: origin airport × destination airport.
 * Engineered for IPATA agencies and high-ticket international moves.
 */

export type RelocationAirport = {
  code: string;
  city: string;
  country: string;
  /** Short region label for copy (e.g. UK, US, UAE) */
  region: string;
};

export type RelocationChecklistItem = {
  title: string;
  detail: string;
};

export type RelocationRouteMeta = {
  /** URL segment, e.g. `lhr-to-jfk` */
  slug: string;
  origin: RelocationAirport;
  destination: RelocationAirport;
  /** Primary search-intent headline fragment */
  routeLabel: string;
  quarantineDays: string;
  rabiesTiterWait: string;
  keyForms: string[];
  airlineNotes: string;
  checklist: RelocationChecklistItem[];
  urgencyNote: string;
};

const LHR: RelocationAirport = {
  code: 'LHR',
  city: 'London',
  country: 'United Kingdom',
  region: 'UK',
};
const JFK: RelocationAirport = {
  code: 'JFK',
  city: 'New York',
  country: 'United States',
  region: 'US',
};
const SIN: RelocationAirport = {
  code: 'SIN',
  city: 'Singapore',
  country: 'Singapore',
  region: 'SG',
};
const DXB: RelocationAirport = {
  code: 'DXB',
  city: 'Dubai',
  country: 'United Arab Emirates',
  region: 'UAE',
};
const LAX: RelocationAirport = {
  code: 'LAX',
  city: 'Los Angeles',
  country: 'United States',
  region: 'US',
};
const HND: RelocationAirport = {
  code: 'HND',
  city: 'Tokyo',
  country: 'Japan',
  region: 'JP',
};
const SYD: RelocationAirport = {
  code: 'SYD',
  city: 'Sydney',
  country: 'Australia',
  region: 'AU',
};
const CDG: RelocationAirport = {
  code: 'CDG',
  city: 'Paris',
  country: 'France',
  region: 'EU',
};
const FRA: RelocationAirport = {
  code: 'FRA',
  city: 'Frankfurt',
  country: 'Germany',
  region: 'EU',
};
const HKG: RelocationAirport = {
  code: 'HKG',
  city: 'Hong Kong',
  country: 'Hong Kong SAR',
  region: 'HK',
};
const NRT: RelocationAirport = {
  code: 'NRT',
  city: 'Tokyo Narita',
  country: 'Japan',
  region: 'JP',
};
const AUH: RelocationAirport = {
  code: 'AUH',
  city: 'Abu Dhabi',
  country: 'United Arab Emirates',
  region: 'UAE',
};
const SFO: RelocationAirport = {
  code: 'SFO',
  city: 'San Francisco',
  country: 'United States',
  region: 'US',
};
const MEL: RelocationAirport = {
  code: 'MEL',
  city: 'Melbourne',
  country: 'Australia',
  region: 'AU',
};
const DOH: RelocationAirport = {
  code: 'DOH',
  city: 'Doha',
  country: 'Qatar',
  region: 'QA',
};
const AMS: RelocationAirport = {
  code: 'AMS',
  city: 'Amsterdam',
  country: 'Netherlands',
  region: 'EU',
};

function route(
  slug: string,
  origin: RelocationAirport,
  destination: RelocationAirport,
  data: Omit<RelocationRouteMeta, 'slug' | 'origin' | 'destination' | 'routeLabel'>,
): RelocationRouteMeta {
  return {
    slug,
    origin,
    destination,
    routeLabel: `${origin.code} → ${destination.code}`,
    ...data,
  };
}

/**
 * Top international pet-relocation corridors. Rules are operational summaries
 * for dossier-building - always verify with official DEFRA / USDA / NVR / DAFF
 * sources before ticket issuance.
 */
export const RELOCATION_ROUTES: readonly RelocationRouteMeta[] = [
  route('lhr-to-jfk', LHR, JFK, {
    quarantineDays: 'No routine federal quarantine for qualifying dogs (CDC/USDA rules apply)',
    rabiesTiterWait: 'CDC dog import rules + valid rabies vaccination; titer only if required by pathway',
    keyForms: ['USDA endorsement (when required)', 'CDC dog import form / documentation', 'Airline live-animal acceptance', 'Health certificate (APHIS / endorsed)'],
    airlineNotes:
      'Confirm breed and crate IATA CR82 compliance. Summer embargos common for brachycephalics on US carriers.',
    urgencyNote:
      'US dog import rules tightened - incomplete CDC documentation is the #1 day-of-travel rejection.',
    checklist: [
      {
        title: 'Rabies vaccination timing',
        detail: 'Confirm current rabies certificate meets CDC age and validity rules for the dog’s origin country.',
      },
      {
        title: 'CDC documentation packet',
        detail: 'Assemble CDC dog import paperwork and any country-specific attestations before ticket issuance.',
      },
      {
        title: 'USDA / APHIS health certificate',
        detail: 'Book endorsed health certificate within the airline/US entry validity window.',
      },
      {
        title: 'Microchip ISO verification',
        detail: 'Scan and photograph ISO 11784/11785 microchip; include number on every form.',
      },
      {
        title: 'Airline acceptance letter',
        detail: 'Obtain written live-animal acceptance for LHR→JFK including crate dims and breed clearance.',
      },
      {
        title: 'Transit & connection plan',
        detail: 'Avoid long tarmac heat exposure; document contingency kennel if connection fails.',
      },
    ],
  }),
  route('lhr-to-sin', LHR, SIN, {
    quarantineDays: 'Singapore NParks/AVS pathway - often home quarantine or facility depending on category',
    rabiesTiterWait: 'FAVN/RFFIT titer typically required with multi-month wait before export for many origins',
    keyForms: ['AVS import licence', 'FAVN rabies serology', 'Veterinary health certificate', 'DEFRA export paperwork'],
    airlineNotes:
      'SIN is a high-compliance destination. Book cargo early; crate inspection photos reduce rejection risk.',
    urgencyNote:
      'Titer waiting periods make last-minute LHR→SIN moves impossible - start the vault 4-6+ months out.',
    checklist: [
      {
        title: 'AVS import licence',
        detail: 'Apply for Singapore import approval before booking irreversible flights.',
      },
      {
        title: 'Rabies titer (FAVN)',
        detail: 'Draw titer at an approved lab; diary the waiting period before export eligibility.',
      },
      {
        title: 'Microchip before vaccination',
        detail: 'Ensure microchip precedes rabies vaccine/titer draw per AVS sequence rules.',
      },
      {
        title: 'DEFRA export health certificate',
        detail: 'Schedule Official Veterinarian endorsement inside the validity window for SIN arrival.',
      },
      {
        title: 'Quarantine housing plan',
        detail: 'Confirm home vs facility quarantine category and prepare compliance logs.',
      },
      {
        title: 'Airline + IATA crate dossier',
        detail: 'Upload crate photos, ventilation evidence, and breed notes to the client vault.',
      },
    ],
  }),
  route('dxb-to-lhr', DXB, LHR, {
    quarantineDays: 'UK - no routine quarantine for compliant EU/listed-pathway pets; verify current DEFRA rules',
    rabiesTiterWait: 'Depends on UAE listing status and pathway; many moves still need titer planning',
    keyForms: ['UK pet travel documentation', 'Rabies certificate / titer if required', 'Airline pet acceptance', 'Microchip registration'],
    airlineNotes:
      'Gulf carriers are pet-experienced but documentation must match DEFRA exactly - Arabic/English bilingual packets help.',
    urgencyNote:
      'DXB→LHR fails when microchip/vaccine chronology is wrong. Sequence audits catch this before cargo day.',
    checklist: [
      {
        title: 'DEFRA pathway confirmation',
        detail: 'Confirm whether the dog qualifies under current UK entry rules from UAE.',
      },
      {
        title: 'Microchip + rabies chronology',
        detail: 'Audit that microchip implantation precedes rabies vaccination with documented dates.',
      },
      {
        title: 'Serology if required',
        detail: 'If titer is required, lock lab draw and waiting period into the relocation Gantt.',
      },
      {
        title: 'Export health certificate',
        detail: 'Arrange UAE export veterinary certificate timed to flight validity.',
      },
      {
        title: 'UK arrival plan',
        detail: 'Designate who meets the animal and holds digital copies of the full dossier.',
      },
      {
        title: 'Breed & heat controls',
        detail: 'Flag brachycephalic restrictions and summer ground-temperature policies.',
      },
    ],
  }),
  route('dxb-to-syd', DXB, SYD, {
    quarantineDays: 'Australia DAFF - mandatory quarantine facility stay for most dogs (duration by pathway)',
    rabiesTiterWait: 'Strict rabies serology + waiting periods before Australian eligibility',
    keyForms: ['DAFF import permit', 'Rabies neutralizing antibody titre', 'Veterinary certificates', 'Airline live-animal booking'],
    airlineNotes:
      'AU is among the hardest corridors. Incomplete titer timelines destroy move dates - digitize every lab PDF.',
    urgencyNote:
      'DXB→SYD is a 6-12 month compliance project for most dogs. Agencies win when the vault owns the critical path.',
    checklist: [
      {
        title: 'DAFF import permit',
        detail: 'Secure Australian import approval before irreversible titer or flight spend.',
      },
      {
        title: 'Rabies titre + waiting period',
        detail: 'Map FAVN/RFFIT draw, result, and waiting clock in the client timeline.',
      },
      {
        title: 'Parasite treatments',
        detail: 'Diary mandatory tapeworm/tick treatments inside the official windows.',
      },
      {
        title: 'Quarantine booking',
        detail: 'Reserve Australian quarantine facility space aligned to arrival slot.',
      },
      {
        title: 'Export certificate chain',
        detail: 'UAE export docs must mirror DAFF checklist line-by-line.',
      },
      {
        title: 'Post-arrival handoff',
        detail: 'Prepare owner briefing pack: quarantine visits, contact tree, document originals.',
      },
    ],
  }),
  route('lax-to-hnd', LAX, HND, {
    quarantineDays: 'Japan - quarantine length depends on titer/waiting compliance (0-180 day pathways)',
    rabiesTiterWait: 'FAVN titer + waiting period typically required for shortened quarantine',
    keyForms: ['Notification to Animal Quarantine Service', 'FAVN rabies serology', 'Health certificate (endorsed)', 'Microchip certificates'],
    airlineNotes:
      'Japan AQS is unforgiving on microchip/vaccine order. Digitize scans and lab letters before ticket purchase.',
    urgencyNote:
      'LAX→HND shortened quarantine is only available when the titer wait is already complete - start early.',
    checklist: [
      {
        title: 'AQS advance notification',
        detail: 'File arrival notification with Japan Animal Quarantine Service within required windows.',
      },
      {
        title: 'Microchip-first sequence',
        detail: 'Prove microchip predates rabies vaccination with veterinary records.',
      },
      {
        title: 'FAVN + waiting period',
        detail: 'Complete approved-lab titer and waiting period for reduced quarantine eligibility.',
      },
      {
        title: 'USDA endorsement',
        detail: 'Obtain endorsed health certificate timed to Japan arrival rules.',
      },
      {
        title: 'Quarantine contingency',
        detail: 'Brief clients on possible facility quarantine if paperwork fails inspection.',
      },
      {
        title: 'Airline CR82 crate pack',
        detail: 'IATA-compliant crate photos and acceptance letter stored in the vault.',
      },
    ],
  }),
  route('lax-to-nrt', LAX, NRT, {
    quarantineDays: 'Japan Narita AQS - same national rules as HND; facility logistics differ by airport',
    rabiesTiterWait: 'FAVN + waiting period for shortened quarantine pathway',
    keyForms: ['AQS notification', 'FAVN serology', 'USDA-endorsed health certificate', 'Flight acceptance'],
    airlineNotes:
      'NRT cargo ops may differ from HND - confirm ground handler and after-hours AQS coverage.',
    urgencyNote:
      'Narita arrivals still fail on microchip chronology. Sequence audit is non-negotiable.',
    checklist: [
      {
        title: 'Choose HND vs NRT deliberately',
        detail: 'Align arrival airport with AQS hours, handler, and client pickup logistics.',
      },
      {
        title: 'Titer dossier completeness',
        detail: 'Include lab letterhead, microchip number match, and draw dates.',
      },
      {
        title: 'USDA timing',
        detail: 'Endorsement must fall inside Japan’s acceptance window.',
      },
      {
        title: 'Cargo booking',
        detail: 'Secure live-animal allotment before peak season embargos.',
      },
      {
        title: 'Owner briefing',
        detail: 'Prepare Japanese/English packet for AQS inspection day.',
      },
      {
        title: 'Contingency kennel',
        detail: 'Document backup housing if inspection extends quarantine.',
      },
    ],
  }),
  route('lhr-to-syd', LHR, SYD, {
    quarantineDays: 'Australia DAFF quarantine facility - duration by approved pathway',
    rabiesTiterWait: 'Rabies serology + extended waiting period before export eligibility',
    keyForms: ['DAFF import permit', 'Rabies titre', 'DEFRA export health certificate', 'Parasite treatment records'],
    airlineNotes:
      'UK→AU pet moves are multi-month projects. Digital Gantt + document OCR beats spreadsheet chaos.',
    urgencyNote:
      'LHR→SYD is a classic IPATA revenue corridor - incomplete titer clocks are the agency’s largest refund risk.',
    checklist: [
      {
        title: 'DAFF permit first',
        detail: 'No permit, no credible flight plan.',
      },
      {
        title: 'Titer critical path',
        detail: 'Draw, result, wait - visualize each gate in the client vault.',
      },
      {
        title: 'Parasite window compliance',
        detail: 'Tapeworm/tick treatments must hit exact pre-export windows.',
      },
      {
        title: 'DEFRA OV endorsement',
        detail: 'Book Official Veterinarian slots early for peak season.',
      },
      {
        title: 'Quarantine reservation',
        detail: 'Hold AU facility space matched to ETA.',
      },
      {
        title: 'Client expectation pack',
        detail: 'Explain facility rules, visit policy, and document originals to carry.',
      },
    ],
  }),
  route('cdg-to-jfk', CDG, JFK, {
    quarantineDays: 'No routine US federal quarantine for qualifying dogs',
    rabiesTiterWait: 'CDC pathway dependent; EU rabies certificates usually central',
    keyForms: ['EU pet passport / health cert', 'CDC dog import docs', 'USDA as applicable', 'Airline acceptance'],
    airlineNotes:
      'EU→US still trips on CDC form errors. Mirror every passport page into the vault.',
    urgencyNote:
      'CDG→JFK agencies lose clients when CDC packets are incomplete 48 hours before departure.',
    checklist: [
      {
        title: 'EU passport audit',
        detail: 'Scan rabies pages, microchip, and vet stamps for legibility.',
      },
      {
        title: 'CDC packet',
        detail: 'Complete current US dog import documentation pathway.',
      },
      {
        title: 'Airline breed policy',
        detail: 'Clear brachycephalic and crate rules in writing.',
      },
      {
        title: 'Connection heat plan',
        detail: 'Avoid risky summer tarmac transfers.',
      },
      {
        title: 'US recipient briefing',
        detail: 'Who collects, which docs are printed vs digital.',
      },
      {
        title: 'Post-arrival vet slot',
        detail: 'Optional wellness exam booked for jet-lagged pets.',
      },
    ],
  }),
  route('fra-to-sin', FRA, SIN, {
    quarantineDays: 'Singapore AVS pathway - category-dependent quarantine',
    rabiesTiterWait: 'FAVN + waiting period common for EU→SG moves',
    keyForms: ['AVS licence', 'FAVN', 'EU health certificate / passport', 'Airline cargo booking'],
    airlineNotes:
      'FRA is a strong cargo hub - still require bilingual document clarity for SG inspectors.',
    urgencyNote:
      'FRA→SIN rewards agencies that run titer clocks in software, not email threads.',
    checklist: [
      {
        title: 'AVS licence',
        detail: 'Import approval before flight spend.',
      },
      {
        title: 'FAVN waiting clock',
        detail: 'Lock eligibility date in shared timeline.',
      },
      {
        title: 'EU certificate timing',
        detail: 'Endorsement inside SG arrival validity.',
      },
      {
        title: 'Microchip verification',
        detail: 'Scan day-of with photo evidence.',
      },
      {
        title: 'Crate compliance',
        detail: 'IATA photos + airline letter.',
      },
      {
        title: 'SG quarantine category',
        detail: 'Confirm home vs facility before arrival.',
      },
    ],
  }),
  route('hkg-to-syd', HKG, SYD, {
    quarantineDays: 'Australia DAFF quarantine - facility stay typical',
    rabiesTiterWait: 'Rabies serology + waiting period before AU eligibility',
    keyForms: ['DAFF permit', 'Rabies titre', 'HK export docs', 'Airline live-animal booking'],
    airlineNotes:
      'HKG→SYD is dense with corporate relocations - white-glove dossier UX wins RFPs.',
    urgencyNote:
      'Corporate HR buyers expect status dashboards; email PDFs no longer close deals.',
    checklist: [
      {
        title: 'DAFF permit',
        detail: 'Gate zero for the entire project.',
      },
      {
        title: 'Titre schedule',
        detail: 'Approved lab + waiting period visualization.',
      },
      {
        title: 'HK export veterinary chain',
        detail: 'Align export cert with DAFF checklist.',
      },
      {
        title: 'Parasite treatments',
        detail: 'Exact-window compliance diary.',
      },
      {
        title: 'Quarantine booking',
        detail: 'AU facility reservation tied to ETA.',
      },
      {
        title: 'Executive briefing pack',
        detail: 'One-pager for HR/relocation managers.',
      },
    ],
  }),
  route('sfo-to-hnd', SFO, HND, {
    quarantineDays: 'Japan AQS - shortened quarantine if titer pathway complete',
    rabiesTiterWait: 'FAVN + waiting period for reduced quarantine',
    keyForms: ['AQS notification', 'FAVN', 'USDA-endorsed certificate', 'Airline acceptance'],
    airlineNotes:
      'SFO→HND tech-relocations need polished digital dossiers for visa-tied move dates.',
    urgencyNote:
      'Visa start dates do not wait for titer clocks - start the vault at offer-accept.',
    checklist: [
      {
        title: 'AQS notification',
        detail: 'File within official windows.',
      },
      {
        title: 'Sequence audit',
        detail: 'Microchip → vaccine → titer chronology.',
      },
      {
        title: 'USDA endorsement',
        detail: 'Book inside Japan validity window.',
      },
      {
        title: 'Cargo allotment',
        detail: 'Reserve before seasonal embargos.',
      },
      {
        title: 'Brachycephalic check',
        detail: 'Airline policy letter on file.',
      },
      {
        title: 'Arrival logistics',
        detail: 'Handler + AQS hours + client pickup.',
      },
    ],
  }),
  route('auh-to-lhr', AUH, LHR, {
    quarantineDays: 'UK entry - verify current DEFRA rules for UAE origins',
    rabiesTiterWait: 'Pathway-dependent; plan titer early if required',
    keyForms: ['UK entry docs', 'Rabies certificate/titer', 'UAE export certificate', 'Airline acceptance'],
    airlineNotes:
      'AUH premium carriers market pet travel - documentation still decides acceptance.',
    urgencyNote:
      'AUH→LHR corporate moves fail when export and UK rules are reconciled too late.',
    checklist: [
      {
        title: 'DEFRA rule check',
        detail: 'Confirm current UAE→UK pet pathway.',
      },
      {
        title: 'Microchip/vaccine audit',
        detail: 'Chronology photos + certificates.',
      },
      {
        title: 'Export certificate',
        detail: 'UAE vet timing vs flight.',
      },
      {
        title: 'Airline acceptance',
        detail: 'Written confirmation in vault.',
      },
      {
        title: 'UK receiver plan',
        detail: 'Who meets the animal with docs.',
      },
      {
        title: 'Heat & breed flags',
        detail: 'Summer and brachycephalic policies.',
      },
    ],
  }),
  route('mel-to-lhr', MEL, LHR, {
    quarantineDays: 'UK - compliant pets typically no facility quarantine; verify pathway',
    rabiesTiterWait: 'AU→UK usually simpler on rabies than reverse, but confirm current rules',
    keyForms: ['UK entry documentation', 'Australian export papers', 'Airline acceptance', 'Health certificate'],
    airlineNotes:
      'Return moves MEL→LHR still need airline live-animal slots and crate compliance.',
    urgencyNote:
      'Reverse AU corridors are easier on quarantine but still lost to incomplete export packs.',
    checklist: [
      {
        title: 'UK entry confirmation',
        detail: 'Validate current rules for AU dogs.',
      },
      {
        title: 'Export veterinary certificate',
        detail: 'Australian export timing.',
      },
      {
        title: 'Airline booking',
        detail: 'Live-animal allotment + crate photos.',
      },
      {
        title: 'Microchip scan day-of',
        detail: 'Photo evidence in vault.',
      },
      {
        title: 'UK arrival logistics',
        detail: 'Receiver + contingency kennel.',
      },
      {
        title: 'Medical continuity',
        detail: 'Hand off chronic meds timeline.',
      },
    ],
  }),
  route('doh-to-jfk', DOH, JFK, {
    quarantineDays: 'US - no routine federal quarantine for qualifying dogs',
    rabiesTiterWait: 'CDC pathway rules; confirm origin-country requirements',
    keyForms: ['CDC dog import docs', 'Qatar export health certificate', 'Airline acceptance', 'Rabies certificate'],
    airlineNotes:
      'DOH is a major pet cargo hub - still reject on CDC packet gaps.',
    urgencyNote:
      'DOH→JFK volume is high; agencies differentiate with pre-built customs vaults.',
    checklist: [
      {
        title: 'CDC packet completeness',
        detail: 'Current US dog import pathway docs.',
      },
      {
        title: 'Export certificate',
        detail: 'Qatar veterinary export timing.',
      },
      {
        title: 'Rabies validity',
        detail: 'Match CDC age/validity rules.',
      },
      {
        title: 'Airline acceptance',
        detail: 'Written live-animal confirmation.',
      },
      {
        title: 'Crate IATA pack',
        detail: 'Photos + dimensions on file.',
      },
      {
        title: 'US handoff',
        detail: 'Receiver briefing + printed backups.',
      },
    ],
  }),
  route('ams-to-sin', AMS, SIN, {
    quarantineDays: 'Singapore AVS - category-dependent',
    rabiesTiterWait: 'FAVN + waiting period typically required',
    keyForms: ['AVS licence', 'FAVN', 'EU health certificate', 'Airline cargo booking'],
    airlineNotes:
      'AMS→SIN is popular for EU expats; titer education at intake prevents refunds.',
    urgencyNote:
      'Sell the waiting period on day one - AMS→SIN cannot be rushed ethically or legally.',
    checklist: [
      {
        title: 'AVS licence',
        detail: 'Before flight commitments.',
      },
      {
        title: 'FAVN clock',
        detail: 'Shared timeline with client.',
      },
      {
        title: 'EU certificate',
        detail: 'Validity window vs SIN ETA.',
      },
      {
        title: 'Microchip sequence',
        detail: 'Chip before vaccine/titer.',
      },
      {
        title: 'Quarantine category',
        detail: 'Home vs facility plan.',
      },
      {
        title: 'Cargo booking',
        detail: 'Allotment + breed policy letter.',
      },
    ],
  }),
  route('jfk-to-lhr', JFK, LHR, {
    quarantineDays: 'UK - no routine quarantine for compliant pets; verify DEFRA',
    rabiesTiterWait: 'US→UK typically relies on valid rabies vaccination + documentation pathway',
    keyForms: ['UK entry docs', 'USDA/APHIS health certificate', 'Airline acceptance', 'Rabies certificate'],
    airlineNotes:
      'JFK→LHR is a high-frequency corridor - digitize endorsement receipts to avoid day-of chaos.',
    urgencyNote:
      'US→UK still fails on expired health certificates. Validity countdown belongs in the vault.',
    checklist: [
      {
        title: 'DEFRA entry rules',
        detail: 'Confirm current US dog pathway to UK.',
      },
      {
        title: 'USDA endorsement window',
        detail: 'Book inside airline/UK validity.',
      },
      {
        title: 'Rabies certificate',
        detail: 'Valid dates + microchip match.',
      },
      {
        title: 'Airline acceptance',
        detail: 'Written confirmation + crate photos.',
      },
      {
        title: 'UK receiver',
        detail: 'Who meets flight with digital dossier.',
      },
      {
        title: 'Medical continuity',
        detail: 'Chronic condition timeline for UK vet.',
      },
    ],
  }),
] as const;

export function listRelocationRoutes(): readonly RelocationRouteMeta[] {
  return RELOCATION_ROUTES;
}

export function getRelocationRouteBySlug(slug: string | undefined): RelocationRouteMeta | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return RELOCATION_ROUTES.find((routeMeta) => routeMeta.slug === normalized) ?? null;
}

export function getRelocationPath(meta: RelocationRouteMeta): string {
  return `/relocation/${meta.slug}`;
}

export function isRelocationPath(pathname: string): boolean {
  if (!pathname.startsWith('/relocation/')) return false;
  const slug = pathname.slice('/relocation/'.length).split('/')[0];
  return getRelocationRouteBySlug(slug) != null;
}
