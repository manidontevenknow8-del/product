import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';

export type DossierOwnerContact = {
  name: string;
  email: string;
  phone?: string | null;
};

export type DossierVaccineRow = {
  title: string;
  dateRecorded: string;
  nextDueDate: string | null;
  clinic: string | null;
  batchNumber: string | null;
  notes: string | null;
};

export type DossierClinicalRow = {
  title: string;
  dateRecorded: string;
  severity: string | null;
  notes: string | null;
};

export type HealthDossierData = {
  petName: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  microchipId: string;
  bloodType: string;
  gender: string;
  weight: string;
  photoUrl: string | null;
  owner: DossierOwnerContact;
  vaccinations: DossierVaccineRow[];
  surgeries: DossierClinicalRow[];
  conditions: DossierClinicalRow[];
  medications: DossierClinicalRow[];
  allergies: DossierClinicalRow[];
  generatedAtLabel: string;
  yearStamp: string;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractBatch(description: string | null): string | null {
  if (!description) return null;
  const match = description.match(/\b(?:batch|lot)\s*[#:.]?\s*([A-Za-z0-9-]+)/i);
  return match?.[1] ?? null;
}

function extractClinic(record: HealthRecord): string | null {
  if (record.sourceDocumentName) {
    return record.sourceDocumentName.replace(/\.[a-z0-9]+$/i, '');
  }
  if (!record.description) return null;
  const match = record.description.match(/\b(?:clinic|hospital|vet(?:erinarian)?)\s*[:|-]\s*([^\n,;]+)/i);
  return match?.[1]?.trim() ?? null;
}

function toClinicalRow(record: HealthRecord): DossierClinicalRow {
  return {
    title: record.title,
    dateRecorded: formatDate(record.dateRecorded),
    severity: record.severity ? titleCase(record.severity) : null,
    notes: record.description,
  };
}

/**
 * Compile pet + health records into a dossier payload for PDF rendering.
 */
export function buildHealthDossierData(
  pet: PetRecord,
  records: HealthRecord[],
  owner: DossierOwnerContact,
): HealthDossierData {
  const petRecords = records
    .filter((record) => record.petId === pet.id)
    .slice()
    .sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded));

  const vaccinations: DossierVaccineRow[] = petRecords
    .filter((record) => record.recordType === 'vaccination')
    .map((record) => ({
      title: record.title,
      dateRecorded: formatDate(record.dateRecorded),
      nextDueDate: record.nextDueDate ? formatDate(record.nextDueDate) : null,
      clinic: extractClinic(record),
      batchNumber: extractBatch(record.description),
      notes: record.description,
    }));

  const now = new Date();

  return {
    petName: pet.name,
    species: titleCase(pet.species),
    breed: pet.breed?.trim() || 'Not recorded',
    dateOfBirth: formatDate(pet.birthDate),
    microchipId: pet.microchipId?.trim() || 'Not recorded',
    bloodType: 'Not recorded',
    gender: pet.gender ? titleCase(pet.gender) : 'Not recorded',
    weight: pet.weight?.trim() || 'Not recorded',
    photoUrl: pet.photoUrl,
    owner: {
      name: owner.name.trim() || 'Pet guardian',
      email: owner.email.trim() || '-',
      phone: owner.phone?.trim() || null,
    },
    vaccinations,
    surgeries: petRecords.filter((r) => r.recordType === 'surgery').map(toClinicalRow),
    conditions: petRecords
      .filter((r) => r.recordType === 'diagnosis' || r.recordType === 'wellness')
      .map(toClinicalRow),
    medications: petRecords.filter((r) => r.recordType === 'medication').map(toClinicalRow),
    allergies: petRecords.filter((r) => r.recordType === 'allergy').map(toClinicalRow),
    generatedAtLabel: now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
    yearStamp: String(now.getFullYear()),
  };
}

export function buildDossierFileName(petName: string, yearStamp: string): string {
  const safe = petName.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'Pet';
  return `${safe}_Health_Dossier_${yearStamp}.pdf`;
}
