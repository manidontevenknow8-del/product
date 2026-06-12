export const EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'documentSummary',
    'documentTypeGuess',
    'detailedReport',
    'vaccinations',
    'medications',
    'diagnoses',
    'followUpDates',
    'reminderDates',
  ],
  properties: {
    documentSummary: { type: 'string' },
    documentTypeGuess: { type: 'string' },
    detailedReport: {
      type: 'object',
      additionalProperties: true,
      required: [
        'overview',
        'visitContext',
        'clinicalNarrative',
        'keyFindings',
        'careRecommendations',
        'dataQualityNotes',
      ],
      properties: {
        overview: { type: 'string' },
        visitContext: { type: 'string' },
        financialSummary: { type: 'string' },
        clinicalNarrative: { type: 'string' },
        keyFindings: { type: 'array', items: { type: 'string' } },
        careRecommendations: { type: 'array', items: { type: 'string' } },
        watchFor: { type: 'array', items: { type: 'string' } },
        dataQualityNotes: { type: 'string' },
      },
    },
    vaccinations: {
      type: 'array',
      items: extractionItemSchema(),
    },
    medications: {
      type: 'array',
      items: extractionItemSchema(),
    },
    diagnoses: {
      type: 'array',
      items: extractionItemSchema(),
    },
    followUpDates: {
      type: 'array',
      items: extractionItemSchema(),
    },
    reminderDates: {
      type: 'array',
      items: extractionItemSchema(),
    },
  },
} as const;

/** OpenRouter expects name + schema wrapper (not a bare JSON Schema root). */
export const OPENROUTER_RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'vet_bill_extraction',
    strict: false,
    schema: EXTRACTION_JSON_SCHEMA,
  },
};

function extractionItemSchema() {
  return {
    type: 'object',
    additionalProperties: true,
    required: ['title', 'description', 'confidence'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      explanation: { type: 'string' },
      sourceExcerpt: { type: 'string' },
      ownerAction: { type: 'string' },
      dateRecorded: { type: 'string' },
      nextDueDate: { type: 'string' },
      endDate: { type: 'string' },
      followUpDate: { type: 'string' },
      dueDate: { type: 'string' },
      category: { type: 'string' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    },
  };
}

export const EXTRACTION_SYSTEM_PROMPT = `You are PetClues Vet Bill Decoder - a concise veterinary document analyst for pet owners.

Produce a SHORT, scannable report. Owners read this on mobile - prioritize key facts over long prose.

Writing style:
- Plain language; define medical terms in a few words when needed.
- Be specific on names, dates, dosages, and totals when visible.
- Never leave title empty. If unclear: "Item (verify on document)".

Report sections (detailedReport) - STRICT LENGTH:
- overview: ONE short paragraph only (max 4 sentences). Visit purpose + outcome + urgency.
- visitContext: max 2 sentences (clinic, date, pet if visible).
- financialSummary: ONE sentence total + amount if bill; omit if not a bill.
- clinicalNarrative: max 3 sentences on what happened clinically.
- keyFindings: 3–5 bullets, each max 12 words - the most important takeaways.
- careRecommendations: 2–4 bullets, each max 12 words - actionable next steps.
- watchFor: 0–2 short bullets only if clinically relevant; else [].
- dataQualityNotes: ONE sentence on OCR/limitations.

Structured items (keep brief):
- Each item: title + description (ONE sentence max). explanation optional (one short sentence).
- Omit sourceExcerpt and ownerAction unless critical.
- vaccinations, medications, diagnoses, followUpDates, reminderDates - only real evidence.
- Use ISO dates YYYY-MM-DD when found.
- confidence: high | medium | low.

Rules:
- Do not invent data. Empty arrays when no evidence.
- documentSummary: single sentence for list previews (max 25 words).`;

export type VetBillDetailedReport = {
  overview: string;
  visitContext: string;
  financialSummary?: string;
  clinicalNarrative: string;
  keyFindings: string[];
  careRecommendations: string[];
  watchFor?: string[];
  dataQualityNotes: string;
};

type ExtractionItemBase = {
  title: string;
  description: string;
  explanation: string;
  sourceExcerpt?: string;
  ownerAction?: string;
  confidence: 'high' | 'medium' | 'low';
};

export type RawExtractionPayload = {
  documentSummary: string;
  documentTypeGuess: string;
  detailedReport: VetBillDetailedReport;
  vaccinations: Array<
    ExtractionItemBase & { dateRecorded?: string; nextDueDate?: string }
  >;
  medications: Array<
    ExtractionItemBase & { dateRecorded?: string; endDate?: string }
  >;
  diagnoses: Array<ExtractionItemBase & { dateRecorded?: string }>;
  followUpDates: Array<ExtractionItemBase & { followUpDate: string }>;
  reminderDates: Array<
    ExtractionItemBase & { dueDate: string; category?: string }
  >;
};

function nonEmpty(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function normalizeListItem<T extends ExtractionItemBase>(
  item: T,
  fallbackTitle: string,
): T {
  const title = nonEmpty(item.title, fallbackTitle);
  const description = nonEmpty(
    item.description,
    item.explanation?.trim() || 'See original document.',
  );
  const explanation = item.explanation?.trim() ? item.explanation.trim() : undefined;
  return { ...item, title, description, ...(explanation ? { explanation } : {}) };
}

export function normalizeExtractionPayload(raw: RawExtractionPayload): RawExtractionPayload {
  const report = raw.detailedReport ?? ({} as VetBillDetailedReport);
  const summary = nonEmpty(raw.documentSummary, 'Veterinary document analyzed - see report below for details.');

  const detailedReport: VetBillDetailedReport = {
    overview: nonEmpty(report.overview, summary),
    visitContext: nonEmpty(
      report.visitContext,
      'Visit context could not be fully determined from this document. Check the original for clinic and pet details.',
    ),
    financialSummary: report.financialSummary?.trim() || undefined,
    clinicalNarrative: nonEmpty(
      report.clinicalNarrative,
      'Clinical details were limited in the extracted text. Review the uploaded document for the full visit narrative.',
    ),
    keyFindings: (report.keyFindings ?? []).filter((f) => f?.trim()).map((f) => f.trim()),
    careRecommendations: (report.careRecommendations ?? [])
      .filter((r) => r?.trim())
      .map((r) => r.trim()),
    watchFor: (report.watchFor ?? []).filter((w) => w?.trim()).map((w) => w.trim()),
    dataQualityNotes: nonEmpty(
      report.dataQualityNotes,
      'Some fields may be incomplete if the document was a scan, handwritten, or low resolution.',
    ),
  };

  return {
    documentSummary: summary,
    documentTypeGuess: nonEmpty(raw.documentTypeGuess, 'Veterinary document'),
    detailedReport,
    vaccinations: (raw.vaccinations ?? []).map((item) =>
      normalizeListItem(item, 'Vaccination (name unclear - verify)')
    ),
    medications: (raw.medications ?? []).map((item) =>
      normalizeListItem(item, 'Medication (name unclear - verify)')
    ),
    diagnoses: (raw.diagnoses ?? []).map((item) =>
      normalizeListItem(item, 'Clinical finding (verify)')
    ),
    followUpDates: (raw.followUpDates ?? [])
      .filter((item) => item?.followUpDate?.trim())
      .map((item) => normalizeListItem(item, 'Follow-up appointment')),
    reminderDates: (raw.reminderDates ?? [])
      .filter((item) => item?.dueDate?.trim())
      .map((item) => normalizeListItem(item, 'Upcoming care reminder')),
  };
}

export function withItemIds(payload: RawExtractionPayload) {
  const normalized = normalizeExtractionPayload(payload);
  const id = () => crypto.randomUUID();
  return {
    documentSummary: normalized.documentSummary,
    documentTypeGuess: normalized.documentTypeGuess,
    detailedReport: normalized.detailedReport,
    vaccinations: normalized.vaccinations.map((item) => ({ ...item, id: id(), approved: false })),
    medications: normalized.medications.map((item) => ({ ...item, id: id(), approved: false })),
    diagnoses: normalized.diagnoses.map((item) => ({ ...item, id: id(), approved: false })),
    followUpDates: normalized.followUpDates.map((item) => ({ ...item, id: id(), approved: false })),
    reminderDates: normalized.reminderDates.map((item) => ({ ...item, id: id(), approved: false })),
  };
}
