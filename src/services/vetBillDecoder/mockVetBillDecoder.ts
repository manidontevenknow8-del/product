import type { VetBillExtractionResult } from './vetBillDecoderTypes';

export function buildMockExtraction(fileName: string): VetBillExtractionResult {
  const id = () => crypto.randomUUID();
  const isVaccine = /vaccin|immun/i.test(fileName);
  const isBill = /bill|invoice|receipt/i.test(fileName);

  return {
    documentSummary:
      'Annual wellness visit with rabies and DHPP vaccines administered, flea prevention prescribed, and a recheck recommended in 12 months. Total invoice $186.50.',
    documentTypeGuess: isVaccine ? 'Vaccination record' : isBill ? 'Veterinary invoice' : 'Medical report',
    detailedReport: {
      overview: isBill
        ? 'This appears to be a veterinary invoice from a routine wellness visit. Your pet received core vaccinations, a general physical exam, and a prescription for ongoing flea prevention. The document shows payment was processed and lists specific due dates for future boosters.'
        : 'This document records veterinary care including vaccinations and preventive medications. The visit appears routine with no urgent concerns flagged. Review the itemized sections below before saving anything to your pet timeline.',
      visitContext:
        'Clinic: Sunny Paws Veterinary Clinic · Visit date: March 12, 2026 · Document type: itemized invoice and treatment summary. Pet name and owner details should be verified on the original upload.',
      financialSummary: isBill
        ? 'Line items include wellness exam ($65), rabies vaccine ($35), DHPP booster ($42), and 6-month flea prevention supply ($44.50). Subtotal $186.50 with no outstanding balance noted on the receipt.'
        : undefined,
      clinicalNarrative:
        'During the visit, the veterinarian performed a routine wellness examination. Rabies and DHPP vaccines were administered. Flea prevention was dispensed for six months. No acute illness was documented; the visit is classified as preventive care.',
      keyFindings: [
        'Rabies vaccine administered - booster typically due in 1–3 years depending on local regulations and vaccine type.',
        'DHPP (distemper combination) booster given - maintain schedule for core puppy/adult vaccines.',
        'Flea prevention prescribed for 6 months - set a refill reminder before supply runs out.',
        'Annual wellness recheck suggested - good opportunity to review weight, dental health, and diet.',
      ],
      careRecommendations: [
        'Confirm exact booster due dates with your clinic if not clearly printed on the document.',
        'Mark your calendar for the annual wellness visit.',
        'Administer flea prevention on the schedule shown on the product label.',
        'Keep this invoice for insurance or tax records if applicable.',
      ],
      watchFor: [
        'Mild lethargy or soreness for 24–48 hours after vaccination is common - contact your vet if symptoms worsen or persist.',
      ],
      dataQualityNotes:
        'Mock extraction for demo. Real documents may have partial text if scanned or photographed at an angle.',
    },
    vaccinations: [
      {
        id: id(),
        title: 'Rabies vaccine (1-year)',
        description:
          'Rabies vaccination administered during the March 12, 2026 visit. Required by law in most areas for dogs and cats.',
        explanation:
          'Listed on the invoice as a vaccine line item with a next-due date printed on the certificate section.',
        sourceExcerpt: 'Rabies Vaccine - 1yr - administered 03/12/2026',
        ownerAction: 'Schedule the next rabies booster before the due date on your certificate.',
        dateRecorded: '2026-03-12',
        nextDueDate: '2027-03-12',
        confidence: 'high',
        approved: false,
      },
    ],
    medications: [
      {
        id: id(),
        title: 'Flea prevention (6-month supply)',
        description:
          'Topical or oral flea/tick preventive dispensed for six months. Dosage should match your pet’s weight per the product label.',
        explanation:
          'Appears as a pharmacy line item with quantity and end date on the invoice.',
        sourceExcerpt: 'Flea/Tick Prevention - 6 mo supply',
        ownerAction: 'Set a reminder to refill before September 2026.',
        dateRecorded: '2026-03-12',
        endDate: '2026-09-12',
        confidence: 'high',
        approved: false,
      },
    ],
    diagnoses: [
      {
        id: id(),
        title: 'Routine wellness exam - no acute concerns',
        description:
          'General physical examination completed. Document indicates preventive visit rather than illness treatment.',
        explanation:
          'Exam fee and “wellness visit” language on the invoice support this finding.',
        dateRecorded: '2026-03-12',
        confidence: 'medium',
        approved: false,
      },
    ],
    followUpDates: [
      {
        id: id(),
        title: 'Annual wellness recheck',
        description: 'Recommended return visit for routine health assessment.',
        explanation: 'Follow-up date noted in the discharge or reminder section of the document.',
        followUpDate: '2027-03-12',
        ownerAction: 'Book the appointment 2–4 weeks before the suggested date.',
        confidence: 'medium',
        approved: false,
      },
    ],
    reminderDates: [
      {
        id: id(),
        title: 'Rabies booster due',
        description: 'Legal and health requirement - do not let this lapse.',
        explanation: 'Next due date extracted from the vaccination certificate or invoice footer.',
        dueDate: '2027-03-12',
        category: 'vaccinations',
        ownerAction: 'Add to your calendar and enable PetClues reminders.',
        confidence: 'high',
        approved: false,
      },
    ],
  };
}

export function buildMockExtractionRecord(
  documentId: string,
  petId: string,
  userId: string,
  fileName: string,
) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    petId,
    documentId,
    status: 'saved' as const,
    extractionResult: buildMockExtraction(fileName),
    approvedSnapshot: null,
    modelUsed: 'google/gemini-2.5-flash-lite (mock)',
    createdAt: now,
    reviewedAt: null,
  };
}
