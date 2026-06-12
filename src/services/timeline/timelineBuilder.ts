import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import { healthRecordTypeLabels } from '@/services/healthRecords/healthRecordTypes';
import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import type { Reminder } from '@/types/reminder';
import { categoryLabels } from '@/types/reminder';
import type { Milestone, TimelineEventItem, TimelineStats } from '@/types/timeline';
import { loadPetCareScoreHistory } from '@/services/petCareScore/petCareScoreEngine';

function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMonthGroup(isoDate: string): string {
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isImageDocument(doc: PetDocumentRecord): boolean {
  return doc.fileType.startsWith('image/');
}

function documentMeta(doc: PetDocumentRecord): string {
  if (isImageDocument(doc)) return 'Photo';
  if (doc.fileType === 'application/pdf') return 'PDF';
  return doc.fileName.split('.').pop()?.toUpperCase() ?? 'File';
}

function linkedDocument(
  documentId: string | null,
  documents: PetDocumentRecord[],
): PetDocumentRecord | null {
  if (!documentId) return null;
  return documents.find((d) => d.id === documentId) ?? null;
}

function healthRecordToEvent(
  record: HealthRecord,
  documents: PetDocumentRecord[],
  petName: string,
): TimelineEventItem {
  const linked = linkedDocument(record.sourceDocumentId, documents);
  const isVaccination = record.recordType === 'vaccination';
  const isWeight = record.recordType === 'weight';
  const type = isVaccination
    ? 'vaccination'
    : isWeight
      ? 'weight_milestone'
      : 'health_record';

  const typeLabel = healthRecordTypeLabels[record.recordType];
  const description =
    record.description?.trim() ||
    (isWeight
      ? `${petName}'s weight logged on ${formatDisplayDate(record.dateRecorded)}.`
      : `${typeLabel} entry added for ${petName} on ${formatDisplayDate(record.dateRecorded)}.`);

  return {
    id: `hr-${record.id}`,
    type,
    date: record.dateRecorded,
    displayDate: formatDisplayDate(record.dateRecorded),
    monthGroup: formatMonthGroup(record.dateRecorded),
    title: record.title,
    description,
    hasAttachment: Boolean(record.sourceDocumentId),
    attachmentName: record.sourceDocumentName ?? linked?.fileName,
    thumbnailDocumentId: linked && isImageDocument(linked) ? linked.id : undefined,
    sourceId: record.id,
    sourceKind: 'health_record',
    meta: typeLabel,
  };
}

function documentToEvent(doc: PetDocumentRecord, petName: string): TimelineEventItem {
  const image = isImageDocument(doc);
  const meta = documentMeta(doc);

  return {
    id: `doc-${doc.id}`,
    type: 'document_uploaded',
    date: doc.uploadedAt.slice(0, 10),
    displayDate: formatDisplayDate(doc.uploadedAt),
    monthGroup: formatMonthGroup(doc.uploadedAt),
    title: doc.fileName,
    description: image
      ? `Photo saved to ${petName}'s memory vault.`
      : `${meta} archived for ${petName} on ${formatDisplayDate(doc.uploadedAt)}.`,
    hasAttachment: true,
    attachmentName: doc.fileName,
    thumbnailDocumentId: image ? doc.id : undefined,
    sourceId: doc.id,
    sourceKind: 'document',
    meta,
  };
}

function reminderToEvent(reminder: Reminder): TimelineEventItem | null {
  if (!reminder.completedAt) return null;
  const date = reminder.completedAt.slice(0, 10);
  const category = categoryLabels[reminder.category];

  return {
    id: `rem-${reminder.id}`,
    type: 'reminder_completed',
    date,
    displayDate: formatDisplayDate(date),
    monthGroup: formatMonthGroup(date),
    title: reminder.title,
    description:
      reminder.notes?.trim() ||
      `${category} reminder marked complete for ${reminder.petName}.`,
    sourceId: reminder.id,
    sourceKind: 'reminder',
    meta: category,
  };
}

function adoptionEvent(pet: PetRecord): TimelineEventItem {
  const date = pet.birthDate ?? pet.createdAt.slice(0, 10);
  const breedPart = pet.breed ? ` - ${pet.breed}` : '';

  return {
    id: `adoption-${pet.id}`,
    type: 'adoption',
    date,
    displayDate: formatDisplayDate(date),
    monthGroup: formatMonthGroup(date),
    title: `Welcome home, ${pet.name}`,
    description: pet.birthDate
      ? `${pet.name} joined your family${breedPart}. Birth date on record.`
      : `${pet.name} joined your PetClues journey${breedPart}.`,
    imageUrl: pet.photoUrl ?? undefined,
    sourceId: pet.id,
    sourceKind: 'profile',
    meta: 'Origin story',
  };
}

function scoreMilestoneEvents(petId: string, petName: string): TimelineEventItem[] {
  const history = loadPetCareScoreHistory(petId);
  const events: TimelineEventItem[] = [];

  for (let i = 1; i < history.length; i += 1) {
    const prev = history[i - 1];
    const curr = history[i];
    const crossed86 = prev.score < 86 && curr.score >= 86;
    const crossed70 = prev.score < 70 && curr.score >= 70;

    if (!crossed86 && !crossed70) continue;

    events.push({
      id: `score-${curr.date}-${curr.score}`,
      type: 'petcare_score_milestone',
      date: curr.date,
      displayDate: formatDisplayDate(curr.date),
      monthGroup: formatMonthGroup(curr.date),
      title: `PetCare Score reached ${curr.score}`,
      description: crossed86
        ? `${petName}'s care organization hit ${curr.score} - records, reminders, and documents are aligned.`
        : `${petName}'s PetCare Score climbed to ${curr.score} as your care rhythm improved.`,
      sourceKind: 'score',
      meta: `Score ${curr.score}`,
    });
  }

  return events;
}

export type TimelineSourceInput = {
  pet: PetRecord;
  healthRecords: HealthRecord[];
  documents: PetDocumentRecord[];
  reminders: Reminder[];
};

const MILESTONE_TYPES = new Set([
  'adoption',
  'vaccination',
  'weight_milestone',
  'petcare_score_milestone',
]);

export function buildTimelineFromSources(input: TimelineSourceInput): {
  events: TimelineEventItem[];
  milestones: Milestone[];
  stats: TimelineStats;
} {
  const { pet } = input;

  const events: TimelineEventItem[] = [
    adoptionEvent(pet),
    ...input.healthRecords.map((r) => healthRecordToEvent(r, input.documents, pet.name)),
    ...input.documents.map((d) => documentToEvent(d, pet.name)),
    ...input.reminders.map(reminderToEvent).filter((e): e is TimelineEventItem => e !== null),
    ...scoreMilestoneEvents(pet.id, pet.name),
  ];

  events.sort((a, b) => b.date.localeCompare(a.date));

  const milestones: Milestone[] = events
    .filter((e) => MILESTONE_TYPES.has(e.type))
    .slice(0, 8)
    .map((e) => ({
      id: `ms-${e.id}`,
      title: e.title,
      date: e.displayDate,
      description: e.description,
      imageUrl: e.imageUrl,
      thumbnailDocumentId: e.thumbnailDocumentId,
      eventType: e.type,
    }));

  const uniqueDays = new Set(events.map((e) => e.date)).size;
  const careMoments = events.filter((e) =>
    ['health_record', 'vaccination', 'reminder_completed'].includes(e.type),
  ).length;
  const memoryMoments = events.filter((e) =>
    ['adoption', 'document_uploaded'].includes(e.type),
  ).length;

  const stats: TimelineStats = {
    totalMoments: events.length,
    milestones: milestones.length,
    documents: input.documents.length,
    daysRemembered: uniqueDays,
    careMoments,
    memoryMoments,
  };

  return { events, milestones, stats };
}
