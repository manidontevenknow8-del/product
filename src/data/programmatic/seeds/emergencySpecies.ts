export type EmergencySpeciesSeed = {
  slug: string;
  name: string;
  heartRate: string;
  respiratoryRate: string;
  temperature: string;
  uniqueRisk: string;
};

export const EMERGENCY_SPECIES_SEEDS: EmergencySpeciesSeed[] = [
  { slug: 'dog', name: 'Dog', heartRate: '60-140 bpm (varies by size)', respiratoryRate: '15-30 breaths/min', temperature: '101-102.5°F / 38.3-39.2°C', uniqueRisk: 'Bloat, heatstroke, toxin ingestion, and trauma' },
  { slug: 'cat', name: 'Cat', heartRate: '140-220 bpm', respiratoryRate: '20-30 breaths/min', temperature: '100.5-102.5°F / 38.1-39.2°C', uniqueRisk: 'Urinary blockage, hiding illness, lily toxicity' },
  { slug: 'bird', name: 'Bird', heartRate: '200-600 bpm (species-dependent)', respiratoryRate: 'Rapid; tail bobbing is abnormal', temperature: '105-108°F / 40.6-42.2°C', uniqueRisk: 'Airway distress, bleeding feathers, egg binding' },
  { slug: 'rabbit', name: 'Rabbit', heartRate: '120-150 bpm', respiratoryRate: '30-60 breaths/min', temperature: '101.3-104°F / 38.5-40°C', uniqueRisk: 'GI stasis, heat stress, back injury' },
  { slug: 'reptile', name: 'Reptile', heartRate: 'Highly species-dependent', respiratoryRate: 'Open-mouth breathing is urgent', temperature: 'Species-specific; gradient required', uniqueRisk: 'Improper husbandry, metabolic bone disease, egg retention' },
  { slug: 'fish', name: 'Fish', heartRate: 'Not practically measured at home', respiratoryRate: 'Gasping at surface signals distress', temperature: 'Tank-species dependent', uniqueRisk: 'Water quality crashes, rapid disease spread' },
];
