import type { BreedRecord } from '@content-types/breed';
import type { SymptomRecord } from '@content-types/symptom';
import type { LifeStageRecord } from '@content-types/life-stage';
import type { EmergencyRecord } from '@content-types/emergency';
import type { ComparisonRecord } from '@content-types/comparison';
import type { ToolFamily, ToolRecord } from '@content-types/tool';

import breedsJson from '@content-data/breeds.json';
import symptomsJson from '@content-data/symptoms.json';
import lifeStagesJson from '@content-data/life_stages.json';
import emergenciesJson from '@content-data/emergencies.json';
import comparisonsJson from '@content-data/comparisons.json';
import toolsJson from '@content-data/tools.json';

export {
  vaultPages,
  getVaultPageBySlug,
  listVaultPages,
  listVaultPagesByCluster,
  isVaultGuideSlug,
  getVaultRelatedPages,
} from './vaultPages';

export const breeds = breedsJson as BreedRecord[];
export const symptoms = symptomsJson as SymptomRecord[];
export const lifeStages = lifeStagesJson as LifeStageRecord[];
export const emergencies = emergenciesJson as EmergencyRecord[];
export const comparisons = comparisonsJson as ComparisonRecord[];
export const tools = toolsJson as ToolRecord[];

export function getBreedBySlug(slug: string): BreedRecord | undefined {
  return breeds.find((b) => b.slug === slug);
}

export function getSymptomBySlug(slug: string): SymptomRecord | undefined {
  return symptoms.find((s) => s.slug === slug);
}

export function getLifeStageBySlug(slug: string): LifeStageRecord | undefined {
  return lifeStages.find((s) => s.slug === slug);
}

export function getEmergencyBySlug(slug: string): EmergencyRecord | undefined {
  return emergencies.find((e) => e.slug === slug);
}

export function getComparisonBySlug(slug: string): ComparisonRecord | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function getToolBySlug(slug: string): ToolRecord | undefined {
  return tools.find((t) => t.slug === slug);
}

export function listToolsByFamily(family: ToolFamily): ToolRecord[] {
  return tools.filter((t) => t.family === family);
}

export function listTools(excludeSlug?: string): ToolRecord[] {
  return excludeSlug ? tools.filter((t) => t.slug !== excludeSlug) : tools;
}
