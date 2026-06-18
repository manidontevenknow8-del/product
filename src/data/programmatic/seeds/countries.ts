export type CountrySeed = {
  slug: string;
  name: string;
  region: string;
  rabiesRequired: boolean;
  microchipRequired: boolean;
  tapewormRequired: boolean;
  entrySummary: string;
};

export const COUNTRY_SEEDS: CountrySeed[] = [
  { slug: 'united-states', name: 'United States', region: 'North America', rabiesRequired: true, microchipRequired: false, tapewormRequired: false, entrySummary: 'Rabies certificate and health certificate commonly required; state rules vary.' },
  { slug: 'united-kingdom', name: 'United Kingdom', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'ISO microchip, rabies wait period, tapeworm treatment, and approved route required.' },
  { slug: 'canada', name: 'Canada', region: 'North America', rabiesRequired: true, microchipRequired: false, tapewormRequired: false, entrySummary: 'Rabies vaccination proof and health certificate typically required at entry.' },
  { slug: 'mexico', name: 'Mexico', region: 'North America', rabiesRequired: true, microchipRequired: false, tapewormRequired: false, entrySummary: 'Rabies certificate and parasite treatment documentation often requested.' },
  { slug: 'france', name: 'France', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'EU pet passport or endorsed health certificate with microchip and rabies timing.' },
  { slug: 'germany', name: 'Germany', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'EU-compliant microchip, rabies, and tapeworm rules for dogs entering Germany.' },
  { slug: 'spain', name: 'Spain', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'EU pet travel rules apply; airline and regional transit checks may add steps.' },
  { slug: 'italy', name: 'Italy', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'Microchip before rabies, waiting period, and endorsed certificate for entry.' },
  { slug: 'netherlands', name: 'Netherlands', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'EU pet passport pathway with strict rabies and identification sequencing.' },
  { slug: 'ireland', name: 'Ireland', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'Tapeworm treatment for dogs and approved entry routes are especially important.' },
  { slug: 'australia', name: 'Australia', region: 'Oceania', rabiesRequired: true, microchipRequired: true, tapewormRequired: false, entrySummary: 'Lengthy import permit process with quarantine, labs, and strict timelines.' },
  { slug: 'new-zealand', name: 'New Zealand', region: 'Oceania', rabiesRequired: true, microchipRequired: true, tapewormRequired: false, entrySummary: 'Permit-based import with quarantine and multiple veterinary milestones.' },
  { slug: 'japan', name: 'Japan', region: 'Asia', rabiesRequired: true, microchipRequired: true, tapewormRequired: false, entrySummary: 'Advance notification, microchip, rabies titers, and waiting periods apply.' },
  { slug: 'singapore', name: 'Singapore', region: 'Asia', rabiesRequired: true, microchipRequired: true, tapewormRequired: false, entrySummary: 'Import license, rabies serology, and quarantine planning required.' },
  { slug: 'united-arab-emirates', name: 'United Arab Emirates', region: 'Middle East', rabiesRequired: true, microchipRequired: true, tapewormRequired: false, entrySummary: 'Import permit, vaccinations, and endorsed health certificate needed.' },
  { slug: 'india', name: 'India', region: 'Asia', rabiesRequired: true, microchipRequired: false, tapewormRequired: false, entrySummary: 'No Objection Certificate and health certificate commonly required for import.' },
  { slug: 'thailand', name: 'Thailand', region: 'Asia', rabiesRequired: true, microchipRequired: true, tapewormRequired: false, entrySummary: 'Import permit, microchip, and vaccination records with timing rules.' },
  { slug: 'portugal', name: 'Portugal', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'EU pet travel documentation with microchip-first rabies sequencing.' },
  { slug: 'switzerland', name: 'Switzerland', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'EU-aligned pet travel rules with endorsed certificates for non-EU origin.' },
  { slug: 'greece', name: 'Greece', region: 'Europe', rabiesRequired: true, microchipRequired: true, tapewormRequired: true, entrySummary: 'Standard EU microchip, rabies, and tapeworm requirements for dogs.' },
];
