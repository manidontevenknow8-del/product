/**
 * Generate long-tail records vault guide pages.
 * Usage: node scripts/generate-vault-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'content-data/generated/vault');
const outPath = path.join(outDir, 'pages.json');

const CTA_BUTTON = 'See Pro vault pricing';
const seeds = [
  {
    "slug": "how-to-organize-pet-vet-records",
    "primary_keyword": "how to organize pet vet records",
    "cluster": "organize",
    "pain": "buried proof for vet record packet",
    "docFocus": "vet record packet",
    "docs": [
      "vet record packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when someone asks for proof by email",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "how-to-organize-pet-medical-records-online",
    "primary_keyword": "how to organize pet medical records online",
    "cluster": "organize",
    "pain": "messy handoff around medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when you are away from the paper copy",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "best-way-to-store-pet-vaccination-records",
    "primary_keyword": "best way to store pet vaccination records",
    "cluster": "organize",
    "pain": "missing backup for vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits before the next admin deadline",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "digitize-paper-pet-medical-records",
    "primary_keyword": "digitize paper pet medical records",
    "cluster": "organize",
    "pain": "repeat searching for medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits before a same-day request",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "scan-pet-vaccine-card-to-phone",
    "primary_keyword": "scan pet vaccine card to phone",
    "cluster": "organize",
    "pain": "deadline stress around vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when someone asks for proof by email",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "pet-health-records-checklist-what-to-keep",
    "primary_keyword": "pet health records checklist what to keep",
    "cluster": "organize",
    "pain": "last-minute scramble for latest vaccine certificate",
    "docFocus": "latest vaccine certificate",
    "docs": [
      "latest vaccine certificate",
      "annual exam summary",
      "lab PDF"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when you are away from the paper copy",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "where-to-store-dog-vaccine-certificates",
    "primary_keyword": "where to store dog vaccine certificates",
    "cluster": "organize",
    "pain": "buried proof for vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits before the next admin deadline",
    "audience": "owners building a calmer record system with cat records that are easy to misplace",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "cat",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "how-to-keep-cat-medical-records-organized",
    "primary_keyword": "how to keep cat medical records organized",
    "cluster": "organize",
    "pain": "messy handoff around medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits before a same-day request",
    "audience": "owners building a calmer record system with cat records that are easy to misplace",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "cat",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "digital-pet-medical-records-folder-setup",
    "primary_keyword": "digital pet medical records folder setup",
    "cluster": "organize",
    "pain": "missing backup for medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when someone asks for proof by email",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "pet-document-vault-vs-paper-folder",
    "primary_keyword": "pet document vault vs paper folder",
    "cluster": "organize",
    "pain": "repeat searching for document packet",
    "docFocus": "document packet",
    "docs": [
      "document packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when you are away from the paper copy",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "how-to-name-pet-medical-pdf-files",
    "primary_keyword": "how to name pet medical PDF files",
    "cluster": "organize",
    "pain": "deadline stress around latest vaccine certificate",
    "docFocus": "latest vaccine certificate",
    "docs": [
      "latest vaccine certificate",
      "annual exam summary",
      "lab PDF"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits before the next admin deadline",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "cloud-storage-for-pet-vet-records",
    "primary_keyword": "cloud storage for pet vet records",
    "cluster": "organize",
    "pain": "last-minute scramble for vet record packet",
    "docFocus": "vet record packet",
    "docs": [
      "vet record packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits before a same-day request",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "backup-pet-vaccination-records-phone-lost",
    "primary_keyword": "backup pet vaccination records phone lost",
    "cluster": "organize",
    "pain": "buried proof for vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when someone asks for proof by email",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "multi-pet-household-medical-records-system",
    "primary_keyword": "multi pet household medical records system",
    "cluster": "organize",
    "pain": "messy handoff around medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "latest vaccine certificate",
      "annual exam summary"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits when you are away from the paper copy",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "pet-records-binder-alternatives-digital",
    "primary_keyword": "pet records binder alternatives digital",
    "cluster": "organize",
    "pain": "missing backup for latest vaccine certificate",
    "docFocus": "latest vaccine certificate",
    "docs": [
      "latest vaccine certificate",
      "annual exam summary",
      "lab PDF"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "the next vaccine, boarding, or emergency request hits before the next admin deadline",
    "audience": "owners building a calmer record system with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "lost-vaccination-records-what-to-do",
    "primary_keyword": "lost vaccination records what to do",
    "cluster": "lost",
    "pain": "replacing missing vaccine record without guessing",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today before a same-day request",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "lost-dog-rabies-certificate-how-to-replace",
    "primary_keyword": "lost dog rabies certificate how to replace",
    "cluster": "lost",
    "pain": "replacing missing rabies certificate without guessing",
    "docFocus": "rabies certificate",
    "docs": [
      "rabies certificate",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today when someone asks for proof by email",
    "audience": "owners trying to reconstruct a paper trail with cat records that are easy to misplace",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "cat",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "lost-cat-vaccine-records-request-from-vet",
    "primary_keyword": "lost cat vaccine records request from vet",
    "cluster": "lost",
    "pain": "replacing missing vaccine record without guessing",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today when you are away from the paper copy",
    "audience": "owners trying to reconstruct a paper trail with cat records that are easy to misplace",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "vet-closed-lost-my-pet-medical-records",
    "primary_keyword": "vet closed lost my pet medical records",
    "cluster": "lost",
    "pain": "replacing missing medical record packet without guessing",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today before the next admin deadline",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "how-to-get-copy-of-pet-medical-records",
    "primary_keyword": "how to get copy of pet medical records",
    "cluster": "lost",
    "pain": "replacing missing medical record packet without guessing",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today before a same-day request",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "request-pet-records-from-previous-vet",
    "primary_keyword": "request pet records from previous vet",
    "cluster": "lost",
    "pain": "replacing missing replacement request trail without guessing",
    "docFocus": "replacement request trail",
    "docs": [
      "replacement request trail",
      "last known vaccine proof",
      "clinic contact note"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today when someone asks for proof by email",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "missing-puppy-vaccine-card-adoption",
    "primary_keyword": "missing puppy vaccine card adoption",
    "cluster": "lost",
    "pain": "replacing missing vaccine record without guessing",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today when you are away from the paper copy",
    "audience": "owners trying to reconstruct a paper trail with dog paperwork that gets requested often",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "puppy",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "cant-find-pet-rabies-tag-paperwork",
    "primary_keyword": "can't find pet rabies tag paperwork",
    "cluster": "lost",
    "pain": "replacing missing rabies certificate without guessing",
    "docFocus": "rabies certificate",
    "docs": [
      "rabies certificate",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today before the next admin deadline",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "replace-lost-bordetella-certificate-dog",
    "primary_keyword": "replace lost Bordetella certificate dog",
    "cluster": "lost",
    "pain": "replacing missing Bordetella certificate without guessing",
    "docFocus": "Bordetella certificate",
    "docs": [
      "Bordetella certificate",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today before a same-day request",
    "audience": "owners trying to reconstruct a paper trail with cat records that are easy to misplace",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "cat",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "pet-medical-records-destroyed-in-flood-fire",
    "primary_keyword": "pet medical records destroyed in flood fire",
    "cluster": "lost",
    "pain": "replacing missing medical record packet without guessing",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today when someone asks for proof by email",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "vet-wont-email-vaccine-records-what-now",
    "primary_keyword": "vet won't email vaccine records what now",
    "cluster": "lost",
    "pain": "replacing missing vaccine record without guessing",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today when you are away from the paper copy",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "how-long-do-vets-keep-pet-medical-records",
    "primary_keyword": "how long do vets keep pet medical records",
    "cluster": "lost",
    "pain": "replacing missing medical record packet without guessing",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today before the next admin deadline",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "recreate-pet-vaccine-history-after-move",
    "primary_keyword": "recreate pet vaccine history after move",
    "cluster": "lost",
    "pain": "replacing missing vaccine record without guessing",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today before a same-day request",
    "audience": "owners trying to reconstruct a paper trail with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "lost-titer-test-results-dog-what-to-do",
    "primary_keyword": "lost titer test results dog what to do",
    "cluster": "lost",
    "pain": "replacing missing titer certificate without guessing",
    "docFocus": "titer certificate",
    "docs": [
      "titer certificate",
      "replacement request trail",
      "last known vaccine proof"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "a clinic, kennel, or landlord wants proof today when someone asks for proof by email",
    "audience": "owners trying to reconstruct a paper trail with dog paperwork that gets requested often",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "dog",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "switching-vets-record-transfer-checklist",
    "primary_keyword": "switching vets record transfer checklist",
    "cluster": "transfer",
    "pain": "last-minute scramble for transfer packet",
    "docFocus": "transfer packet",
    "docs": [
      "transfer packet",
      "current vaccine certificate",
      "visit history summary"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "the new clinic asks for history before the appointment when you are away from the paper copy",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "how-to-transfer-pet-records-to-new-vet",
    "primary_keyword": "how to transfer pet records to new vet",
    "cluster": "transfer",
    "pain": "buried proof for transfer packet",
    "docFocus": "transfer packet",
    "docs": [
      "transfer packet",
      "current vaccine certificate",
      "visit history summary"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "the new clinic asks for history before the appointment before the next admin deadline",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "new-vet-asking-for-old-medical-records",
    "primary_keyword": "new vet asking for old medical records",
    "cluster": "transfer",
    "pain": "messy handoff around medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "transfer packet",
      "current vaccine certificate"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "the new clinic asks for history before the appointment before a same-day request",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "what-records-to-bring-when-changing-veterinarians",
    "primary_keyword": "what records to bring when changing veterinarians",
    "cluster": "transfer",
    "pain": "missing backup for transfer packet",
    "docFocus": "transfer packet",
    "docs": [
      "transfer packet",
      "current vaccine certificate",
      "visit history summary"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "the new clinic asks for history before the appointment when someone asks for proof by email",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "pet-medical-records-transfer-authorization-form",
    "primary_keyword": "pet medical records transfer authorization form",
    "cluster": "transfer",
    "pain": "repeat searching for medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "transfer packet",
      "current vaccine certificate"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "the new clinic asks for history before the appointment when you are away from the paper copy",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "switching-clinics-keep-copies-of-vaccine-certificates",
    "primary_keyword": "switching clinics keep copies of vaccine certificates",
    "cluster": "transfer",
    "pain": "deadline stress around vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "transfer packet",
      "current vaccine certificate"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "the new clinic asks for history before the appointment before the next admin deadline",
    "audience": "families changing clinics or seeking a second opinion with cat records that are easy to misplace",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "cat",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "second-opinion-vet-share-medical-history",
    "primary_keyword": "second opinion vet share medical history",
    "cluster": "transfer",
    "pain": "last-minute scramble for transfer packet",
    "docFocus": "transfer packet",
    "docs": [
      "transfer packet",
      "current vaccine certificate",
      "visit history summary"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "the new clinic asks for history before the appointment before a same-day request",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "specialist-referral-records-to-bring",
    "primary_keyword": "specialist referral records to bring",
    "cluster": "transfer",
    "pain": "buried proof for specialist referral packet",
    "docFocus": "specialist referral packet",
    "docs": [
      "specialist referral packet",
      "transfer packet",
      "current vaccine certificate"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "the new clinic asks for history before the appointment when someone asks for proof by email",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "move-to-new-city-pet-vet-records-checklist",
    "primary_keyword": "move to new city pet vet records checklist",
    "cluster": "transfer",
    "pain": "messy handoff around vet record packet",
    "docFocus": "vet record packet",
    "docs": [
      "vet record packet",
      "transfer packet",
      "current vaccine certificate"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "the new clinic asks for history before the appointment when you are away from the paper copy",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "out-of-state-vet-records-transfer-dog",
    "primary_keyword": "out of state vet records transfer dog",
    "cluster": "transfer",
    "pain": "missing backup for vet record packet",
    "docFocus": "vet record packet",
    "docs": [
      "vet record packet",
      "transfer packet",
      "current vaccine certificate"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "the new clinic asks for history before the appointment before the next admin deadline",
    "audience": "families changing clinics or seeking a second opinion with dog paperwork that gets requested often",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "dog",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "how-to-share-pet-records-between-two-clinics",
    "primary_keyword": "how to share pet records between two clinics",
    "cluster": "transfer",
    "pain": "repeat searching for transfer packet",
    "docFocus": "transfer packet",
    "docs": [
      "transfer packet",
      "current vaccine certificate",
      "visit history summary"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "the new clinic asks for history before the appointment before a same-day request",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "keep-personal-copy-of-vet-records-before-transfer",
    "primary_keyword": "keep personal copy of vet records before transfer",
    "cluster": "transfer",
    "pain": "deadline stress around vet record packet",
    "docFocus": "vet record packet",
    "docs": [
      "vet record packet",
      "transfer packet",
      "current vaccine certificate"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "the new clinic asks for history before the appointment when someone asks for proof by email",
    "audience": "families changing clinics or seeking a second opinion with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "what-to-bring-to-first-vet-visit",
    "primary_keyword": "what to bring to first vet visit",
    "cluster": "new-pet",
    "pain": "last-minute scramble for adoption or breeder paperwork",
    "docFocus": "adoption or breeder paperwork",
    "docs": [
      "adoption or breeder paperwork",
      "starting vaccine record",
      "microchip details"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "the first few visits start building the permanent record when you are away from the paper copy",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "first-vet-visit-puppy-records-checklist",
    "primary_keyword": "first vet visit puppy records checklist",
    "cluster": "new-pet",
    "pain": "buried proof for adoption or breeder paperwork",
    "docFocus": "adoption or breeder paperwork",
    "docs": [
      "adoption or breeder paperwork",
      "starting vaccine record",
      "microchip details"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "the first few visits start building the permanent record before the next admin deadline",
    "audience": "new adopters, fosters, and breeder-purchase households with dog paperwork that gets requested often",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "puppy",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "first-vet-visit-kitten-paperwork-needed",
    "primary_keyword": "first vet visit kitten paperwork needed",
    "cluster": "new-pet",
    "pain": "messy handoff around paperwork packet",
    "docFocus": "paperwork packet",
    "docs": [
      "paperwork packet",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "the first few visits start building the permanent record before a same-day request",
    "audience": "new adopters, fosters, and breeder-purchase households with cat records that are easy to misplace",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "kitten",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "new-rescue-dog-medical-records-to-collect",
    "primary_keyword": "new rescue dog medical records to collect",
    "cluster": "new-pet",
    "pain": "missing backup for medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "the first few visits start building the permanent record when someone asks for proof by email",
    "audience": "new adopters, fosters, and breeder-purchase households with dog paperwork that gets requested often",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "dog",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "adoption-paperwork-vaccine-records-what-to-keep",
    "primary_keyword": "adoption paperwork vaccine records what to keep",
    "cluster": "new-pet",
    "pain": "repeat searching for vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "the first few visits start building the permanent record when you are away from the paper copy",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "breeder-vaccine-record-vs-official-certificate",
    "primary_keyword": "breeder vaccine record vs official certificate",
    "cluster": "new-pet",
    "pain": "deadline stress around vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "the first few visits start building the permanent record before the next admin deadline",
    "audience": "new adopters, fosters, and breeder-purchase households with cat records that are easy to misplace",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "cat",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "shelter-shot-records-incomplete-what-to-ask",
    "primary_keyword": "shelter shot records incomplete what to ask",
    "cluster": "new-pet",
    "pain": "last-minute scramble for adoption or breeder paperwork",
    "docFocus": "adoption or breeder paperwork",
    "docs": [
      "adoption or breeder paperwork",
      "starting vaccine record",
      "microchip details"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "the first few visits start building the permanent record before a same-day request",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "new-puppy-folder-what-documents-to-start",
    "primary_keyword": "new puppy folder what documents to start",
    "cluster": "new-pet",
    "pain": "buried proof for document packet",
    "docFocus": "document packet",
    "docs": [
      "document packet",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "the first few visits start building the permanent record when someone asks for proof by email",
    "audience": "new adopters, fosters, and breeder-purchase households with dog paperwork that gets requested often",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "puppy",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "kitten-health-certificate-from-shelter-store-where",
    "primary_keyword": "kitten health certificate from shelter store where",
    "cluster": "new-pet",
    "pain": "messy handoff around health certificate",
    "docFocus": "health certificate",
    "docs": [
      "health certificate",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "the first few visits start building the permanent record when you are away from the paper copy",
    "audience": "new adopters, fosters, and breeder-purchase households with cat records that are easy to misplace",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "kitten",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "rehomed-pet-no-medical-history-how-to-start",
    "primary_keyword": "rehomed pet no medical history how to start",
    "cluster": "new-pet",
    "pain": "missing backup for adoption or breeder paperwork",
    "docFocus": "adoption or breeder paperwork",
    "docs": [
      "adoption or breeder paperwork",
      "starting vaccine record",
      "microchip details"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "the first few visits start building the permanent record before the next admin deadline",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "foster-to-adopt-medical-records-handoff",
    "primary_keyword": "foster to adopt medical records handoff",
    "cluster": "new-pet",
    "pain": "repeat searching for medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "the first few visits start building the permanent record before a same-day request",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "microchip-paperwork-where-to-save",
    "primary_keyword": "microchip paperwork where to save",
    "cluster": "new-pet",
    "pain": "deadline stress around microchip paperwork",
    "docFocus": "microchip paperwork",
    "docs": [
      "microchip paperwork",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "the first few visits start building the permanent record when someone asks for proof by email",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "spay-neuter-discharge-papers-keep-forever",
    "primary_keyword": "spay neuter discharge papers keep forever",
    "cluster": "new-pet",
    "pain": "last-minute scramble for spay/neuter discharge papers",
    "docFocus": "spay/neuter discharge papers",
    "docs": [
      "spay/neuter discharge papers",
      "adoption or breeder paperwork",
      "starting vaccine record"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "the first few visits start building the permanent record when you are away from the paper copy",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "pet-purchase-contract-and-health-guarantee-storage",
    "primary_keyword": "pet purchase contract and health guarantee storage",
    "cluster": "new-pet",
    "pain": "buried proof for adoption or breeder paperwork",
    "docFocus": "adoption or breeder paperwork",
    "docs": [
      "adoption or breeder paperwork",
      "starting vaccine record",
      "microchip details"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "the first few visits start building the permanent record before the next admin deadline",
    "audience": "new adopters, fosters, and breeder-purchase households with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "pet-records-for-boarding-kennel",
    "primary_keyword": "pet records for boarding kennel",
    "cluster": "boarding",
    "pain": "messy handoff around boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "a facility asks for PDFs before drop-off before a same-day request",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "boarding-kennel-vaccination-requirements-checklist",
    "primary_keyword": "boarding kennel vaccination requirements checklist",
    "cluster": "boarding",
    "pain": "missing backup for boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "a facility asks for PDFs before drop-off when someone asks for proof by email",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "what-vaccine-proof-do-dog-daycare-need",
    "primary_keyword": "what vaccine proof do dog daycare need",
    "cluster": "boarding",
    "pain": "repeat searching for daycare vaccine packet before check-in",
    "docFocus": "daycare vaccine packet",
    "docs": [
      "daycare vaccine packet",
      "boarding vaccine packet",
      "rabies proof"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "a facility asks for PDFs before drop-off when you are away from the paper copy",
    "audience": "owners sending records to kennels, daycare, or groomers with dog paperwork that gets requested often",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "dog",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "bordetella-certificate-for-kennel-how-to-send",
    "primary_keyword": "Bordetella certificate for kennel how to send",
    "cluster": "boarding",
    "pain": "deadline stress around Bordetella certificate before check-in",
    "docFocus": "Bordetella certificate",
    "docs": [
      "Bordetella certificate",
      "boarding vaccine packet",
      "rabies proof"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "a facility asks for PDFs before drop-off before the next admin deadline",
    "audience": "owners sending records to kennels, daycare, or groomers with cat records that are easy to misplace",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "cat",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "dog-boarding-paperwork-last-minute",
    "primary_keyword": "dog boarding paperwork last minute",
    "cluster": "boarding",
    "pain": "last-minute scramble for boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "a facility asks for PDFs before drop-off before a same-day request",
    "audience": "owners sending records to kennels, daycare, or groomers with dog paperwork that gets requested often",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "dog",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "cat-boarding-vaccine-records-required",
    "primary_keyword": "cat boarding vaccine records required",
    "cluster": "boarding",
    "pain": "buried proof for boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "a facility asks for PDFs before drop-off when someone asks for proof by email",
    "audience": "owners sending records to kennels, daycare, or groomers with cat records that are easy to misplace",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "cat",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "groomer-asking-for-rabies-proof-email-pdf",
    "primary_keyword": "groomer asking for rabies proof email PDF",
    "cluster": "boarding",
    "pain": "messy handoff around rabies certificate before check-in",
    "docFocus": "rabies certificate",
    "docs": [
      "rabies certificate",
      "boarding vaccine packet",
      "rabies proof"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "a facility asks for PDFs before drop-off when you are away from the paper copy",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "dog-daycare-vaccine-expiration-tracking",
    "primary_keyword": "dog daycare vaccine expiration tracking",
    "cluster": "boarding",
    "pain": "missing backup for daycare vaccine packet before check-in",
    "docFocus": "daycare vaccine packet",
    "docs": [
      "daycare vaccine packet",
      "boarding vaccine packet",
      "rabies proof"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "a facility asks for PDFs before drop-off before the next admin deadline",
    "audience": "owners sending records to kennels, daycare, or groomers with dog paperwork that gets requested often",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "dog",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "kennel-wont-accept-expired-vaccine-card",
    "primary_keyword": "kennel won't accept expired vaccine card",
    "cluster": "boarding",
    "pain": "repeat searching for vaccine record before check-in",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "boarding vaccine packet",
      "rabies proof"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "a facility asks for PDFs before drop-off before a same-day request",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "boarding-health-form-and-vaccine-packet",
    "primary_keyword": "boarding health form and vaccine packet",
    "cluster": "boarding",
    "pain": "deadline stress around boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "a facility asks for PDFs before drop-off when someone asks for proof by email",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "overnight-boarding-what-medical-docs-to-pack",
    "primary_keyword": "overnight boarding what medical docs to pack",
    "cluster": "boarding",
    "pain": "last-minute scramble for boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "a facility asks for PDFs before drop-off when you are away from the paper copy",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "pet-hotel-check-in-vaccine-certificate-tips",
    "primary_keyword": "pet hotel check-in vaccine certificate tips",
    "cluster": "boarding",
    "pain": "buried proof for vaccine record before check-in",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "boarding vaccine packet",
      "rabies proof"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "a facility asks for PDFs before drop-off before the next admin deadline",
    "audience": "owners sending records to kennels, daycare, or groomers with cat records that are easy to misplace",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "cat",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "send-vaccine-records-to-boarding-from-phone",
    "primary_keyword": "send vaccine records to boarding from phone",
    "cluster": "boarding",
    "pain": "messy handoff around boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "a facility asks for PDFs before drop-off before a same-day request",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "doggie-daycare-enrollment-records-checklist",
    "primary_keyword": "doggie daycare enrollment records checklist",
    "cluster": "boarding",
    "pain": "missing backup for daycare vaccine packet before check-in",
    "docFocus": "daycare vaccine packet",
    "docs": [
      "daycare vaccine packet",
      "boarding vaccine packet",
      "rabies proof"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "a facility asks for PDFs before drop-off when someone asks for proof by email",
    "audience": "owners sending records to kennels, daycare, or groomers with dog paperwork that gets requested often",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "dog",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "boarding-kennel-flea-prevention-proof-needed",
    "primary_keyword": "boarding kennel flea prevention proof needed",
    "cluster": "boarding",
    "pain": "repeat searching for boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "a facility asks for PDFs before drop-off when you are away from the paper copy",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "multiple-boarding-facilities-same-vaccine-pdfs",
    "primary_keyword": "multiple boarding facilities same vaccine PDFs",
    "cluster": "boarding",
    "pain": "deadline stress around boarding vaccine packet before check-in",
    "docFocus": "boarding vaccine packet",
    "docs": [
      "boarding vaccine packet",
      "rabies proof",
      "facility form"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "a facility asks for PDFs before drop-off before the next admin deadline",
    "audience": "owners sending records to kennels, daycare, or groomers with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "pet-sitter-medical-records-to-leave",
    "primary_keyword": "pet sitter medical records to leave",
    "cluster": "sitter",
    "pain": "last-minute scramble for medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "caregiver handoff packet",
      "medication list"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "someone else may need to act for your pet quickly before a same-day request",
    "audience": "owners handing care to sitters, walkers, or relatives with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "house-sitter-vet-records-and-emergency-contacts",
    "primary_keyword": "house sitter vet records and emergency contacts",
    "cluster": "sitter",
    "pain": "buried proof for emergency visit summary",
    "docFocus": "emergency visit summary",
    "docs": [
      "emergency visit summary",
      "caregiver handoff packet",
      "medication list"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "someone else may need to act for your pet quickly when someone asks for proof by email",
    "audience": "owners handing care to sitters, walkers, or relatives with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "dog-walker-emergency-medical-info-card",
    "primary_keyword": "dog walker emergency medical info card",
    "cluster": "sitter",
    "pain": "messy handoff around emergency visit summary",
    "docFocus": "emergency visit summary",
    "docs": [
      "emergency visit summary",
      "caregiver handoff packet",
      "medication list"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "someone else may need to act for your pet quickly when you are away from the paper copy",
    "audience": "owners handing care to sitters, walkers, or relatives with dog paperwork that gets requested often",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "dog",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "share-pet-vaccine-records-with-pet-sitter",
    "primary_keyword": "share pet vaccine records with pet sitter",
    "cluster": "sitter",
    "pain": "missing backup for vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "caregiver handoff packet",
      "medication list"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "someone else may need to act for your pet quickly before the next admin deadline",
    "audience": "owners handing care to sitters, walkers, or relatives with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "vacation-pet-care-folder-what-to-include",
    "primary_keyword": "vacation pet care folder what to include",
    "cluster": "sitter",
    "pain": "repeat searching for caregiver handoff packet",
    "docFocus": "caregiver handoff packet",
    "docs": [
      "caregiver handoff packet",
      "medication list",
      "emergency contact sheet"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "someone else may need to act for your pet quickly before a same-day request",
    "audience": "owners handing care to sitters, walkers, or relatives with cat records that are easy to misplace",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "cat",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "rover-sitter-vaccine-proof-requirements",
    "primary_keyword": "Rover sitter vaccine proof requirements",
    "cluster": "sitter",
    "pain": "deadline stress around vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "caregiver handoff packet",
      "medication list"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "someone else may need to act for your pet quickly when someone asks for proof by email",
    "audience": "owners handing care to sitters, walkers, or relatives with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "leave-medication-list-and-vet-records-for-sitter",
    "primary_keyword": "leave medication list and vet records for sitter",
    "cluster": "sitter",
    "pain": "last-minute scramble for medication list",
    "docFocus": "medication list",
    "docs": [
      "medication list",
      "caregiver handoff packet",
      "emergency contact sheet"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "someone else may need to act for your pet quickly when you are away from the paper copy",
    "audience": "owners handing care to sitters, walkers, or relatives with cat records that are easy to misplace",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "emergency-contact-sheet-for-pets-while-traveling",
    "primary_keyword": "emergency contact sheet for pets while traveling",
    "cluster": "sitter",
    "pain": "buried proof for emergency visit summary",
    "docFocus": "emergency visit summary",
    "docs": [
      "emergency visit summary",
      "caregiver handoff packet",
      "medication list"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "someone else may need to act for your pet quickly before the next admin deadline",
    "audience": "owners handing care to sitters, walkers, or relatives with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "how-to-share-pet-medical-pdfs-securely",
    "primary_keyword": "how to share pet medical PDFs securely",
    "cluster": "sitter",
    "pain": "messy handoff around caregiver handoff packet",
    "docFocus": "caregiver handoff packet",
    "docs": [
      "caregiver handoff packet",
      "medication list",
      "emergency contact sheet"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "someone else may need to act for your pet quickly before a same-day request",
    "audience": "owners handing care to sitters, walkers, or relatives with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "temporary-caregiver-access-to-pet-health-docs",
    "primary_keyword": "temporary caregiver access to pet health docs",
    "cluster": "sitter",
    "pain": "missing backup for caregiver handoff packet",
    "docFocus": "caregiver handoff packet",
    "docs": [
      "caregiver handoff packet",
      "medication list",
      "emergency contact sheet"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "someone else may need to act for your pet quickly when someone asks for proof by email",
    "audience": "owners handing care to sitters, walkers, or relatives with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "where-to-keep-dog-rabies-certificate",
    "primary_keyword": "where to keep dog rabies certificate",
    "cluster": "document-type",
    "pain": "repeat searching for rabies certificate",
    "docFocus": "rabies certificate",
    "docs": [
      "rabies certificate",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "you need the exact file instead of a vague memory when you are away from the paper copy",
    "audience": "owners who want one critical file permanently easy to find with cat records that are easy to misplace",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "how-to-store-cat-rabies-vaccination-proof",
    "primary_keyword": "how to store cat rabies vaccination proof",
    "cluster": "document-type",
    "pain": "deadline stress around rabies certificate",
    "docFocus": "rabies certificate",
    "docs": [
      "rabies certificate",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "you need the exact file instead of a vague memory before the next admin deadline",
    "audience": "owners who want one critical file permanently easy to find with cat records that are easy to misplace",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "cat",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "keep-fvrcp-vaccine-certificate-organized",
    "primary_keyword": "keep FVRCP vaccine certificate organized",
    "cluster": "document-type",
    "pain": "last-minute scramble for FVRCP certificate",
    "docFocus": "FVRCP certificate",
    "docs": [
      "FVRCP certificate",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "you need the exact file instead of a vague memory before a same-day request",
    "audience": "owners who want one critical file permanently easy to find with cat records that are easy to misplace",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "cat",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "dhpp-vaccine-record-storage-tips",
    "primary_keyword": "DHPP vaccine record storage tips",
    "cluster": "document-type",
    "pain": "buried proof for DHPP record",
    "docFocus": "DHPP record",
    "docs": [
      "DHPP record",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "you need the exact file instead of a vague memory when someone asks for proof by email",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "leptospirosis-vaccine-certificate-for-boarding",
    "primary_keyword": "leptospirosis vaccine certificate for boarding",
    "cluster": "document-type",
    "pain": "messy handoff around leptospirosis certificate",
    "docFocus": "leptospirosis certificate",
    "docs": [
      "leptospirosis certificate",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "you need the exact file instead of a vague memory when you are away from the paper copy",
    "audience": "owners who want one critical file permanently easy to find with cat records that are easy to misplace",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "heartworm-test-results-where-to-save",
    "primary_keyword": "heartworm test results where to save",
    "cluster": "document-type",
    "pain": "missing backup for heartworm test result",
    "docFocus": "heartworm test result",
    "docs": [
      "heartworm test result",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "you need the exact file instead of a vague memory before the next admin deadline",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "felv-fiv-test-results-storage",
    "primary_keyword": "FeLV FIV test results storage",
    "cluster": "document-type",
    "pain": "repeat searching for FeLV/FIV test result",
    "docFocus": "FeLV/FIV test result",
    "docs": [
      "FeLV/FIV test result",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "you need the exact file instead of a vague memory before a same-day request",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "bloodwork-pdf-from-vet-how-to-file",
    "primary_keyword": "bloodwork PDF from vet how to file",
    "cluster": "document-type",
    "pain": "deadline stress around bloodwork PDF",
    "docFocus": "bloodwork PDF",
    "docs": [
      "bloodwork PDF",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "you need the exact file instead of a vague memory when someone asks for proof by email",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "x-ray-report-digital-copy-pet-records",
    "primary_keyword": "X-ray report digital copy pet records",
    "cluster": "document-type",
    "pain": "last-minute scramble for X-ray report",
    "docFocus": "X-ray report",
    "docs": [
      "X-ray report",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "you need the exact file instead of a vague memory when you are away from the paper copy",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "surgery-discharge-instructions-keep-forever",
    "primary_keyword": "surgery discharge instructions keep forever",
    "cluster": "document-type",
    "pain": "buried proof for surgery discharge papers",
    "docFocus": "surgery discharge papers",
    "docs": [
      "surgery discharge papers",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "you need the exact file instead of a vague memory before the next admin deadline",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "dental-cleaning-records-for-dogs-store",
    "primary_keyword": "dental cleaning records for dogs store",
    "cluster": "document-type",
    "pain": "messy handoff around dental cleaning record",
    "docFocus": "dental cleaning record",
    "docs": [
      "dental cleaning record",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "you need the exact file instead of a vague memory before a same-day request",
    "audience": "owners who want one critical file permanently easy to find with dog paperwork that gets requested often",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "dog",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "prescription-label-photo-for-refill-history",
    "primary_keyword": "prescription label photo for refill history",
    "cluster": "document-type",
    "pain": "missing backup for prescription label photo",
    "docFocus": "prescription label photo",
    "docs": [
      "prescription label photo",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "you need the exact file instead of a vague memory when someone asks for proof by email",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "allergy-test-results-pet-document-filing",
    "primary_keyword": "allergy test results pet document filing",
    "cluster": "document-type",
    "pain": "repeat searching for allergy test result",
    "docFocus": "allergy test result",
    "docs": [
      "allergy test result",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "you need the exact file instead of a vague memory when you are away from the paper copy",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "ultrasound-report-save-with-pet-records",
    "primary_keyword": "ultrasound report save with pet records",
    "cluster": "document-type",
    "pain": "deadline stress around ultrasound report",
    "docFocus": "ultrasound report",
    "docs": [
      "ultrasound report",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "you need the exact file instead of a vague memory before the next admin deadline",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "pathology-biopsy-report-storage-pet",
    "primary_keyword": "pathology biopsy report storage pet",
    "cluster": "document-type",
    "pain": "last-minute scramble for pathology or biopsy report",
    "docFocus": "pathology or biopsy report",
    "docs": [
      "pathology or biopsy report",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "you need the exact file instead of a vague memory before a same-day request",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "titer-test-certificate-for-travel-boarding",
    "primary_keyword": "titer test certificate for travel boarding",
    "cluster": "document-type",
    "pain": "buried proof for titer certificate",
    "docFocus": "titer certificate",
    "docs": [
      "titer certificate",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "you need the exact file instead of a vague memory when someone asks for proof by email",
    "audience": "owners who want one critical file permanently easy to find with cat records that are easy to misplace",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "cat",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "vaccine-titer-vs-certificate-which-to-keep",
    "primary_keyword": "vaccine titer vs certificate which to keep",
    "cluster": "document-type",
    "pain": "messy handoff around titer certificate",
    "docFocus": "titer certificate",
    "docs": [
      "titer certificate",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "you need the exact file instead of a vague memory when you are away from the paper copy",
    "audience": "owners who want one critical file permanently easy to find with cat records that are easy to misplace",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "specialist-letter-file-with-pet-records",
    "primary_keyword": "specialist letter file with pet records",
    "cluster": "document-type",
    "pain": "missing backup for specialist visit summary",
    "docFocus": "specialist visit summary",
    "docs": [
      "specialist visit summary",
      "document original",
      "backup PDF copy"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "you need the exact file instead of a vague memory before the next admin deadline",
    "audience": "owners who want one critical file permanently easy to find with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "emergency-vet-visit-what-records-to-bring",
    "primary_keyword": "emergency vet visit what records to bring",
    "cluster": "emergency",
    "pain": "sharing emergency visit summary fast when the clinic is waiting",
    "docFocus": "emergency visit summary",
    "docs": [
      "emergency visit summary",
      "grab-and-go medical packet",
      "current meds list"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "you have minutes, not hours, to share history before a same-day request",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "pet-emergency-go-bag-medical-documents",
    "primary_keyword": "pet emergency go bag medical documents",
    "cluster": "emergency",
    "pain": "sharing emergency visit summary fast when the clinic is waiting",
    "docFocus": "emergency visit summary",
    "docs": [
      "emergency visit summary",
      "grab-and-go medical packet",
      "current meds list"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "you have minutes, not hours, to share history when someone asks for proof by email",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "er-asks-for-vaccine-history-no-paperwork",
    "primary_keyword": "ER asks for vaccine history no paperwork",
    "cluster": "emergency",
    "pain": "sharing vaccine record fast when the clinic is waiting",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "grab-and-go medical packet",
      "current meds list"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "you have minutes, not hours, to share history when you are away from the paper copy",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "after-hours-clinic-share-medical-history-fast",
    "primary_keyword": "after hours clinic share medical history fast",
    "cluster": "emergency",
    "pain": "sharing grab-and-go medical packet fast when the clinic is waiting",
    "docFocus": "grab-and-go medical packet",
    "docs": [
      "grab-and-go medical packet",
      "current meds list",
      "emergency contact page"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "you have minutes, not hours, to share history before the next admin deadline",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "pet-emergency-contacts-and-meds-list-printable",
    "primary_keyword": "pet emergency contacts and meds list printable",
    "cluster": "emergency",
    "pain": "sharing medication list fast when the clinic is waiting",
    "docFocus": "medication list",
    "docs": [
      "medication list",
      "grab-and-go medical packet",
      "current meds list"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "you have minutes, not hours, to share history before a same-day request",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "hospitalize-pet-records-family-should-have",
    "primary_keyword": "hospitalize pet records family should have",
    "cluster": "emergency",
    "pain": "sharing grab-and-go medical packet fast when the clinic is waiting",
    "docFocus": "grab-and-go medical packet",
    "docs": [
      "grab-and-go medical packet",
      "current meds list",
      "emergency contact page"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "you have minutes, not hours, to share history when someone asks for proof by email",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "urgent-care-vet-no-prior-records-tips",
    "primary_keyword": "urgent care vet no prior records tips",
    "cluster": "emergency",
    "pain": "sharing grab-and-go medical packet fast when the clinic is waiting",
    "docFocus": "grab-and-go medical packet",
    "docs": [
      "grab-and-go medical packet",
      "current meds list",
      "emergency contact page"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "you have minutes, not hours, to share history when you are away from the paper copy",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "poison-control-call-keep-product-and-pet-records",
    "primary_keyword": "poison control call keep product and pet records",
    "cluster": "emergency",
    "pain": "sharing poison control notes fast when the clinic is waiting",
    "docFocus": "poison control notes",
    "docs": [
      "poison control notes",
      "grab-and-go medical packet",
      "current meds list"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "you have minutes, not hours, to share history before the next admin deadline",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "share-allergy-and-med-list-with-er-from-phone",
    "primary_keyword": "share allergy and med list with ER from phone",
    "cluster": "emergency",
    "pain": "sharing allergy test result fast when the clinic is waiting",
    "docFocus": "allergy test result",
    "docs": [
      "allergy test result",
      "grab-and-go medical packet",
      "current meds list"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "you have minutes, not hours, to share history before a same-day request",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "disaster-evacuation-pet-medical-records-kit",
    "primary_keyword": "disaster evacuation pet medical records kit",
    "cluster": "emergency",
    "pain": "sharing medical record packet fast when the clinic is waiting",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "grab-and-go medical packet",
      "current meds list"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "you have minutes, not hours, to share history when someone asks for proof by email",
    "audience": "owners preparing for urgent or after-hours care with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "pet-travel-health-certificate-where-to-store",
    "primary_keyword": "pet travel health certificate where to store",
    "cluster": "travel",
    "pain": "messy handoff around health certificate",
    "docFocus": "health certificate",
    "docs": [
      "health certificate",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "an airline, landlord, or destination wants proof fast when you are away from the paper copy",
    "audience": "owners who move, travel, rent, or register pets often with cat records that are easy to misplace",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "airline-pet-vaccine-records-checklist",
    "primary_keyword": "airline pet vaccine records checklist",
    "cluster": "travel",
    "pain": "missing backup for vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "an airline, landlord, or destination wants proof fast before the next admin deadline",
    "audience": "owners who move, travel, rent, or register pets often with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "interstate-travel-dog-health-papers-organize",
    "primary_keyword": "interstate travel dog health papers organize",
    "cluster": "travel",
    "pain": "repeat searching for travel document packet",
    "docFocus": "travel document packet",
    "docs": [
      "travel document packet",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "an airline, landlord, or destination wants proof fast before a same-day request",
    "audience": "owners who move, travel, rent, or register pets often with dog paperwork that gets requested often",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "dog",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "apartment-pet-application-vaccine-proof",
    "primary_keyword": "apartment pet application vaccine proof",
    "cluster": "travel",
    "pain": "deadline stress around pet application packet",
    "docFocus": "pet application packet",
    "docs": [
      "pet application packet",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "an airline, landlord, or destination wants proof fast when someone asks for proof by email",
    "audience": "owners who move, travel, rent, or register pets often with cat records that are easy to misplace",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "cat",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "landlord-requesting-pet-vaccination-records",
    "primary_keyword": "landlord requesting pet vaccination records",
    "cluster": "travel",
    "pain": "last-minute scramble for landlord vaccine packet",
    "docFocus": "landlord vaccine packet",
    "docs": [
      "landlord vaccine packet",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "an airline, landlord, or destination wants proof fast when you are away from the paper copy",
    "audience": "owners who move, travel, rent, or register pets often with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "hoa-pet-registration-documents-needed",
    "primary_keyword": "HOA pet registration documents needed",
    "cluster": "travel",
    "pain": "buried proof for HOA registration packet",
    "docFocus": "HOA registration packet",
    "docs": [
      "HOA registration packet",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "an airline, landlord, or destination wants proof fast before the next admin deadline",
    "audience": "owners who move, travel, rent, or register pets often with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "moving-with-pets-medical-records-checklist",
    "primary_keyword": "moving with pets medical records checklist",
    "cluster": "travel",
    "pain": "messy handoff around medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "an airline, landlord, or destination wants proof fast before a same-day request",
    "audience": "owners who move, travel, rent, or register pets often with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "international-pet-travel-document-packet",
    "primary_keyword": "international pet travel document packet",
    "cluster": "travel",
    "pain": "missing backup for travel document packet",
    "docFocus": "travel document packet",
    "docs": [
      "travel document packet",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "an airline, landlord, or destination wants proof fast when someone asks for proof by email",
    "audience": "owners who move, travel, rent, or register pets often with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "usda-health-certificate-copy-keep-after-trip",
    "primary_keyword": "USDA health certificate copy keep after trip",
    "cluster": "travel",
    "pain": "repeat searching for health certificate",
    "docFocus": "health certificate",
    "docs": [
      "health certificate",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "an airline, landlord, or destination wants proof fast when you are away from the paper copy",
    "audience": "owners who move, travel, rent, or register pets often with cat records that are easy to misplace",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "campground-pet-vaccine-requirements-proof",
    "primary_keyword": "campground pet vaccine requirements proof",
    "cluster": "travel",
    "pain": "deadline stress around vaccine record",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "an airline, landlord, or destination wants proof fast before the next admin deadline",
    "audience": "owners who move, travel, rent, or register pets often with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "road-trip-dog-vet-records-digital",
    "primary_keyword": "road trip dog vet records digital",
    "cluster": "travel",
    "pain": "last-minute scramble for vet record packet",
    "docFocus": "vet record packet",
    "docs": [
      "vet record packet",
      "travel packet",
      "health certificate copy"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "an airline, landlord, or destination wants proof fast before a same-day request",
    "audience": "owners who move, travel, rent, or register pets often with dog paperwork that gets requested often",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "dog",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "military-pcs-pet-records-transfer-checklist",
    "primary_keyword": "military PCS pet records transfer checklist",
    "cluster": "travel",
    "pain": "buried proof for travel packet",
    "docFocus": "travel packet",
    "docs": [
      "travel packet",
      "health certificate copy",
      "vaccine proof"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "an airline, landlord, or destination wants proof fast when someone asks for proof by email",
    "audience": "owners who move, travel, rent, or register pets often with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "pet-insurance-claim-documents-to-upload",
    "primary_keyword": "pet insurance claim documents to upload",
    "cluster": "insurance",
    "pain": "matching claim packet to the claim packet",
    "docFocus": "claim packet",
    "docs": [
      "claim packet",
      "invoice copy",
      "medical note attachment"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "a claim reviewer needs matching records and billing when you are away from the paper copy",
    "audience": "owners filing reimbursements or proving coverage details with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "keep-vet-invoices-for-insurance-reimbursement",
    "primary_keyword": "keep vet invoices for insurance reimbursement",
    "cluster": "insurance",
    "pain": "matching claim packet to the claim packet",
    "docFocus": "claim packet",
    "docs": [
      "claim packet",
      "invoice copy",
      "medical note attachment"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "a claim reviewer needs matching records and billing before the next admin deadline",
    "audience": "owners filing reimbursements or proving coverage details with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "pre-existing-condition-records-for-pet-insurance",
    "primary_keyword": "pre-existing condition records for pet insurance",
    "cluster": "insurance",
    "pain": "matching claim packet to the claim packet",
    "docFocus": "claim packet",
    "docs": [
      "claim packet",
      "invoice copy",
      "medical note attachment"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "a claim reviewer needs matching records and billing before a same-day request",
    "audience": "owners filing reimbursements or proving coverage details with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "organize-vet-receipts-for-tax-or-fsa",
    "primary_keyword": "organize vet receipts for tax or FSA",
    "cluster": "insurance",
    "pain": "matching payment receipt set to the claim packet",
    "docFocus": "payment receipt set",
    "docs": [
      "payment receipt set",
      "claim packet",
      "invoice copy"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "a claim reviewer needs matching records and billing when someone asks for proof by email",
    "audience": "owners filing reimbursements or proving coverage details with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "medical-history-packet-for-new-pet-insurance",
    "primary_keyword": "medical history packet for new pet insurance",
    "cluster": "insurance",
    "pain": "matching claim packet to the claim packet",
    "docFocus": "claim packet",
    "docs": [
      "claim packet",
      "invoice copy",
      "medical note attachment"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "a claim reviewer needs matching records and billing when you are away from the paper copy",
    "audience": "owners filing reimbursements or proving coverage details with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "denied-claim-missing-records-how-to-resubmit",
    "primary_keyword": "denied claim missing records how to resubmit",
    "cluster": "insurance",
    "pain": "matching claim packet to the claim packet",
    "docFocus": "claim packet",
    "docs": [
      "claim packet",
      "invoice copy",
      "medical note attachment"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "a claim reviewer needs matching records and billing before the next admin deadline",
    "audience": "owners filing reimbursements or proving coverage details with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "itemized-invoice-vs-vaccine-certificate-filing",
    "primary_keyword": "itemized invoice vs vaccine certificate filing",
    "cluster": "insurance",
    "pain": "matching itemized invoice to the claim packet",
    "docFocus": "itemized invoice",
    "docs": [
      "itemized invoice",
      "claim packet",
      "invoice copy"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "a claim reviewer needs matching records and billing before a same-day request",
    "audience": "owners filing reimbursements or proving coverage details with cat records that are easy to misplace",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "cat",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "store-estimate-and-paid-invoice-with-visit-notes",
    "primary_keyword": "store estimate and paid invoice with visit notes",
    "cluster": "insurance",
    "pain": "matching itemized invoice to the claim packet",
    "docFocus": "itemized invoice",
    "docs": [
      "itemized invoice",
      "claim packet",
      "invoice copy"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "a claim reviewer needs matching records and billing when someone asks for proof by email",
    "audience": "owners filing reimbursements or proving coverage details with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "share-pet-medical-records-with-spouse",
    "primary_keyword": "share pet medical records with spouse",
    "cluster": "sharing",
    "pain": "getting medical record packet to another adult without text-thread chaos",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "share-ready PDF",
      "household backup copy"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "another adult needs the same document without calling you when you are away from the paper copy",
    "audience": "households sharing access across partners, roommates, or family with mixed pet paperwork spread across sources",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "co-parenting-pet-vaccine-records-access",
    "primary_keyword": "divorced co-parenting pet vaccine records access",
    "cluster": "sharing",
    "pain": "getting vaccine record to another adult without text-thread chaos",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "share-ready PDF",
      "household backup copy"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "another adult needs the same document without calling you before the next admin deadline",
    "audience": "households sharing access across partners, roommates, or family with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "roommate-needs-pet-emergency-medical-info",
    "primary_keyword": "roommate needs pet emergency medical info",
    "cluster": "sharing",
    "pain": "getting emergency visit summary to another adult without text-thread chaos",
    "docFocus": "emergency visit summary",
    "docs": [
      "emergency visit summary",
      "share-ready PDF",
      "household backup copy"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "another adult needs the same document without calling you before a same-day request",
    "audience": "households sharing access across partners, roommates, or family with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "email-vaccine-pdf-vs-shareable-vault-link",
    "primary_keyword": "email vaccine PDF vs shareable vault link",
    "cluster": "sharing",
    "pain": "getting vaccine record to another adult without text-thread chaos",
    "docFocus": "vaccine record",
    "docs": [
      "vaccine record",
      "share-ready PDF",
      "household backup copy"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "another adult needs the same document without calling you when someone asks for proof by email",
    "audience": "households sharing access across partners, roommates, or family with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "how-to-send-rabies-certificate-from-phone-quickly",
    "primary_keyword": "how to send rabies certificate from phone quickly",
    "cluster": "sharing",
    "pain": "getting rabies certificate to another adult without text-thread chaos",
    "docFocus": "rabies certificate",
    "docs": [
      "rabies certificate",
      "share-ready PDF",
      "household backup copy"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "another adult needs the same document without calling you when you are away from the paper copy",
    "audience": "households sharing access across partners, roommates, or family with cat records that are easy to misplace",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "family-members-who-can-open-pet-health-documents",
    "primary_keyword": "family members who can open pet health documents",
    "cluster": "sharing",
    "pain": "getting document packet to another adult without text-thread chaos",
    "docFocus": "document packet",
    "docs": [
      "document packet",
      "share-ready PDF",
      "household backup copy"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "another adult needs the same document without calling you before the next admin deadline",
    "audience": "households sharing access across partners, roommates, or family with mixed pet paperwork spread across sources",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "stop-digging-through-email-for-rabies-certificate",
    "primary_keyword": "stop digging through email for rabies certificate",
    "cluster": "sharing",
    "pain": "getting rabies certificate to another adult without text-thread chaos",
    "docFocus": "rabies certificate",
    "docs": [
      "rabies certificate",
      "share-ready PDF",
      "household backup copy"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "another adult needs the same document without calling you before a same-day request",
    "audience": "households sharing access across partners, roommates, or family with cat records that are easy to misplace",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "cat",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "one-place-for-all-pet-vet-pdfs-and-photos",
    "primary_keyword": "one place for all pet vet PDFs and photos",
    "cluster": "sharing",
    "pain": "getting share-ready PDF to another adult without text-thread chaos",
    "docFocus": "share-ready PDF",
    "docs": [
      "share-ready PDF",
      "household backup copy",
      "access note"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "another adult needs the same document without calling you when someone asks for proof by email",
    "audience": "households sharing access across partners, roommates, or family with mixed pet paperwork spread across sources",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "senior-dog-medication-list-and-lab-history-file",
    "primary_keyword": "senior dog medication list and lab history file",
    "cluster": "chronic",
    "pain": "last-minute scramble for medication list",
    "docFocus": "medication list",
    "docs": [
      "medication list",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "multiple visits need the same history stitched together when you are away from the paper copy",
    "audience": "owners managing long-running treatment plans and specialist loops with cat records that are easy to misplace",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "diabetic-cat-records-glucose-and-insulin-log-store",
    "primary_keyword": "diabetic cat records glucose and insulin log store",
    "cluster": "chronic",
    "pain": "buried proof for glucose log",
    "docFocus": "glucose log",
    "docs": [
      "glucose log",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "multiple visits need the same history stitched together before the next admin deadline",
    "audience": "owners managing long-running treatment plans and specialist loops with cat records that are easy to misplace",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "cat",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "seizure-dog-medication-and-er-history-packet",
    "primary_keyword": "seizure dog medication and ER history packet",
    "cluster": "chronic",
    "pain": "messy handoff around medication list",
    "docFocus": "medication list",
    "docs": [
      "medication list",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "multiple visits need the same history stitched together before a same-day request",
    "audience": "owners managing long-running treatment plans and specialist loops with cat records that are easy to misplace",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "cat",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "ckd-cat-lab-trends-storage",
    "primary_keyword": "chronic kidney disease cat lab trends storage",
    "cluster": "chronic",
    "pain": "missing backup for lab history",
    "docFocus": "lab history",
    "docs": [
      "lab history",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "multiple visits need the same history stitched together when someone asks for proof by email",
    "audience": "owners managing long-running treatment plans and specialist loops with cat records that are easy to misplace",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "cat",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "cancer-treatment-records-for-pet-oncology-visits",
    "primary_keyword": "cancer treatment records for pet oncology visits",
    "cluster": "chronic",
    "pain": "repeat searching for oncology summary",
    "docFocus": "oncology summary",
    "docs": [
      "oncology summary",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "multiple visits need the same history stitched together when you are away from the paper copy",
    "audience": "owners managing long-running treatment plans and specialist loops with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "heart-murmur-dog-cardiology-report-filing",
    "primary_keyword": "heart murmur dog cardiology report filing",
    "cluster": "chronic",
    "pain": "deadline stress around cardiology report",
    "docFocus": "cardiology report",
    "docs": [
      "cardiology report",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "mixing old and current versions with unclear filenames",
    "whenNeeded": "multiple visits need the same history stitched together before the next admin deadline",
    "audience": "owners managing long-running treatment plans and specialist loops with dog paperwork that gets requested often",
    "faqAngles": [
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof"
    ],
    "pet": "dog",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "allergy-immunotherapy-records-keep-with-vaccines",
    "primary_keyword": "allergy immunotherapy records keep with vaccines",
    "cluster": "chronic",
    "pain": "last-minute scramble for allergy test result",
    "docFocus": "allergy test result",
    "docs": [
      "allergy test result",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "waiting until the deadline day to check what is missing",
    "whenNeeded": "multiple visits need the same history stitched together before a same-day request",
    "audience": "owners managing long-running treatment plans and specialist loops with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "physical-therapy-notes-for-dog-store-digitally",
    "primary_keyword": "physical therapy notes for dog store digitally",
    "cluster": "chronic",
    "pain": "buried proof for timeline summary",
    "docFocus": "timeline summary",
    "docs": [
      "timeline summary",
      "latest specialist note",
      "monitoring log"
    ],
    "mistake": "relying on an inbox search instead of a named folder",
    "whenNeeded": "multiple visits need the same history stitched together when someone asks for proof by email",
    "audience": "owners managing long-running treatment plans and specialist loops with dog paperwork that gets requested often",
    "faqAngles": [
      "which version of the file matters most",
      "who should get access before a deadline",
      "what to do if only a phone photo exists"
    ],
    "pet": "dog",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "behavioral-medication-history-for-vet-consult",
    "primary_keyword": "behavioral medication history for vet consult",
    "cluster": "chronic",
    "pain": "messy handoff around medication list",
    "docFocus": "medication list",
    "docs": [
      "medication list",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "saving the photo but not the official PDF or summary",
    "whenNeeded": "multiple visits need the same history stitched together when you are away from the paper copy",
    "audience": "owners managing long-running treatment plans and specialist loops with cat records that are easy to misplace",
    "faqAngles": [
      "whether the paper original still needs to be kept",
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice"
    ],
    "pet": "cat",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  },
  {
    "slug": "specialist-visit-summary-link-to-primary-vet-copy",
    "primary_keyword": "specialist visit summary link to primary vet copy",
    "cluster": "chronic",
    "pain": "missing backup for specialist visit summary",
    "docFocus": "specialist visit summary",
    "docs": [
      "specialist visit summary",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "keeping the latest copy on one phone with no backup",
    "whenNeeded": "multiple visits need the same history stitched together before the next admin deadline",
    "audience": "owners managing long-running treatment plans and specialist loops with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to name scans so they stay readable later",
      "when to archive older copies instead of deleting them",
      "which version of the file matters most"
    ],
    "pet": "pet",
    "sectionHints": [
      "bundle the proof",
      "version confusion",
      "family backups"
    ]
  },
  {
    "slug": "end-of-life-pet-medical-records-what-to-keep",
    "primary_keyword": "end of life pet medical records what to keep",
    "cluster": "chronic",
    "pain": "repeat searching for medical record packet",
    "docFocus": "medical record packet",
    "docs": [
      "medical record packet",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "sending a cropped screenshot when the full document is required",
    "whenNeeded": "multiple visits need the same history stitched together before a same-day request",
    "audience": "owners managing long-running treatment plans and specialist loops with mixed pet paperwork spread across sources",
    "faqAngles": [
      "who should get access before a deadline",
      "what to do if only a phone photo exists",
      "whether the paper original still needs to be kept"
    ],
    "pet": "pet",
    "sectionHints": [
      "back up the latest version",
      "single-device risk",
      "urgent after-hours sharing"
    ]
  },
  {
    "slug": "hospice-pet-care-documents-and-meds-list",
    "primary_keyword": "hospice pet care documents and meds list",
    "cluster": "chronic",
    "pain": "deadline stress around medication list",
    "docFocus": "medication list",
    "docs": [
      "medication list",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "forgetting to pair the certificate with the supporting visit note",
    "whenNeeded": "multiple visits need the same history stitched together when someone asks for proof by email",
    "audience": "owners managing long-running treatment plans and specialist loops with mixed pet paperwork spread across sources",
    "faqAngles": [
      "how to bundle supporting documents with the main proof",
      "how to avoid resending the same paperwork twice",
      "how to name scans so they stay readable later"
    ],
    "pet": "pet",
    "sectionHints": [
      "save first",
      "deadline panic",
      "boarding desks"
    ]
  },
  {
    "slug": "multi-specialist-pet-care-document-timeline",
    "primary_keyword": "multi specialist pet care document timeline",
    "cluster": "chronic",
    "pain": "last-minute scramble for specialist visit summary",
    "docFocus": "specialist visit summary",
    "docs": [
      "specialist visit summary",
      "timeline summary",
      "latest specialist note"
    ],
    "mistake": "assuming the clinic will always resend the same file instantly",
    "whenNeeded": "multiple visits need the same history stitched together when you are away from the paper copy",
    "audience": "owners managing long-running treatment plans and specialist loops with mixed pet paperwork spread across sources",
    "faqAngles": [
      "when to archive older copies instead of deleting them",
      "which version of the file matters most",
      "who should get access before a deadline"
    ],
    "pet": "pet",
    "sectionHints": [
      "rename clearly",
      "email archaeology",
      "new clinics"
    ]
  }
];

const CLUSTER_BENEFITS = {
  organize: 'build one orderly vault instead of paper piles and camera-roll backups',
  lost: 'keep a replacement-ready backup before the next record disappears',
  transfer: 'hand clinics a cleaner packet without losing your own copy',
  'new-pet': 'turn a messy handoff into a dependable starter file',
  boarding: 'send the exact packet facilities ask for without deadline panic',
  sitter: 'leave caregivers the records they need without oversharing everything',
  'document-type': 'keep a single high-value document easy to pull up anytime',
  emergency: 'share key history fast when every minute feels shorter',
  travel: 'carry proof that is easy to show from your phone or vault link',
  insurance: 'pair billing and records so claim paperwork is easier to defend',
  sharing: 'let the right people open the same files without digging through email',
  chronic: 'keep long treatment timelines readable across many visits',
};

const ROW_LABELS = [
  ['Main pain', 'Best first file', 'Usually needed', 'Vault benefit'],
  ['Pain to solve', 'Start with', 'Deadline moment', 'Why vault helps'],
  ['What goes wrong', 'Anchor document', 'Needed when', 'Cleaner outcome'],
  ['Pain point', 'Core file', 'Request moment', 'Storage payoff'],
];

const LEAD_TEMPLATES = [
  (seed) => `The stress in ${seed.primary_keyword} usually shows up when ${seed.whenNeeded.toLowerCase()} and the file is trapped in the wrong place. This guide helps you keep ${seed.docFocus.toLowerCase()} with the rest of the packet in one PetClues vault so the next request feels routine instead of frantic.`,
  (seed) => `With ${seed.primary_keyword}, the pain is rarely the document itself; it is the scramble caused by scattered copies, vague filenames, or no backup at all. PetClues gives you one place to save ${seed.docs.map((d) => d.toLowerCase()).join(', ')} so you can stop re-creating the same search every time.`,
  (seed) => `Owners dealing with ${seed.primary_keyword} often discover that the paperwork exists, but not where it can be used quickly. This page shows how to organize ${seed.docFocus.toLowerCase()} into a PetClues vault that is easier to search, share, and trust under pressure.`,
  (seed) => `The real problem behind ${seed.primary_keyword} is the administrative delay: someone needs proof, but the right version is buried in email, paper folders, or one phone. A PetClues vault turns that loose paperwork into a packet you can pull up without guesswork.`,
];

const SECTION_ONE_HEADINGS = [
  (seed) => `What belongs with ${seed.docFocus}`,
  (seed) => `Build a cleaner packet for ${seed.primary_keyword}`,
  (seed) => `Start the file with the right documents`,
  (seed) => `Set up a vault around ${seed.docFocus.toLowerCase()}`,
];

const SECTION_TWO_HEADINGS = [
  (seed) => `Avoid the repeat scramble`,
  (seed) => `Fix the filing mistake that causes delays`,
  (seed) => `How to prevent version confusion`,
  (seed) => `Stop losing time to messy storage`,
];

const SECTION_THREE_HEADINGS = [
  (seed) => `Share it faster when the request arrives`,
  (seed) => `Make the next handoff easier`,
  (seed) => `Use the vault for the deadline moment`,
  (seed) => `Keep the packet ready for real life`,
];

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function titleCase(keyword) {
  const upper = new Set(['PDF', 'PDFs', 'USDA', 'FVRCP', 'DHPP', 'FeLV', 'FIV', 'ER', 'HOA', 'PCS']);
  return keyword
    .split(' ')
    .map((word) => {
      const bare = word.replace(/[^A-Za-z]/g, '');
      const upperMatch = [...upper].find((item) => item.toLowerCase() === bare.toLowerCase());
      if (upperMatch) return word.replace(bare, upperMatch);
      if (word.includes("'")) {
        return word
          .split("'")
          .map((part, index) => index === 0 ? capitalize(part) : part.toLowerCase())
          .join("'");
      }
      return capitalize(word);
    })
    .join(' ');
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function clipMeta(text, max = 156) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}.`;
}

function joinNatural(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function metaDescription(seed) {
  const base = `${seed.primary_keyword} guide for storing, finding, and sharing proof fast with a PetClues vault backup.`;
  return clipMeta(base, 157);
}

function checklistHeading(seed, h) {
  const choices = [
    `Quick vault checklist for ${h}`,
    `What to save for ${h}`,
    `5-step setup for ${h}`,
    `Get ${h.toLowerCase()} organized`,
  ];
  return choices[hashSlug(seed.slug) % choices.length];
}

function buildChecklist(seed) {
  const h = hashSlug(seed.slug);
  return [
    `Save the current ${seed.docFocus.toLowerCase()} as a clear PDF or phone scan.` ,
    `Rename it with your pet name, document type, and date so ${seed.audience.toLowerCase()} can spot the right version fast.` ,
    `Store ${seed.docs[1].toLowerCase()} beside ${seed.docs[0].toLowerCase()} so the packet still makes sense when shared.` ,
    `Add a note about ${seed.mistake.toLowerCase()} so the same filing problem does not come back.` ,
    `Test the packet before ${seed.whenNeeded.toLowerCase()} by opening it from your phone, not your desk.` ,
    `Share read-only access with anyone who may need it before the next request.` ,
  ].slice(0, 4 + (h % 3));
}

function sectionOne(seed, h) {
  return {
    heading: SECTION_ONE_HEADINGS[h % SECTION_ONE_HEADINGS.length](seed),
    paragraphs: [
      `For ${seed.primary_keyword}, use ${seed.docFocus.toLowerCase()} as the anchor file and keep ${joinNatural(seed.docs.slice(1).map((d) => d.toLowerCase()))} attached to the same vault entry. That structure matters because the next person asking for records usually needs context, not just a single screenshot.`,
      `A clean setup starts with one predictable home, one filename pattern, and one current version. PetClues helps ${seed.audience.toLowerCase()} keep ${seed.docFocus.toLowerCase()} separate from old duplicates, while still preserving earlier paperwork when it explains how the record was created.` ,
    ],
  };
}

function sectionTwo(seed, h) {
  const openers = [
    'The most common delay is not medical; it is administrative drift.',
    'Most record problems come from small filing shortcuts that compound later.',
    'Owners usually lose time because the document trail was never finished.',
    'The bottleneck here is almost always a preventable storage habit.',
  ];
  return {
    heading: SECTION_TWO_HEADINGS[(h >>> 2) % SECTION_TWO_HEADINGS.length](seed),
    paragraphs: [
      `${openers[(h >>> 3) % openers.length]} With ${seed.primary_keyword}, that often looks like ${seed.mistake.toLowerCase()}. The result is extra emailing, re-scanning, or uncertainty over whether you are sending the latest acceptable copy.`,
      `Instead, treat each update as a packet refresh: replace the front-facing file, archive the prior copy if it still matters, and keep a short note about why the new version supersedes the old one. That simple habit is what turns ${seed.pain.toLowerCase()} into a one-minute lookup instead of another evening of searching.` ,
    ],
  };
}

function sectionThree(seed, h) {
  const closers = [
    'A shareable link is usually easier than hunting attachments across several inboxes.',
    'Phone-first access matters because the request rarely happens while you are at a laptop.',
    'The calmest systems are the ones that can be opened by another trusted adult when needed.',
    'A vault only helps if the packet is current before the deadline arrives.',
  ];
  return {
    heading: SECTION_THREE_HEADINGS[(h >>> 4) % SECTION_THREE_HEADINGS.length](seed),
    paragraphs: [
      `When ${seed.whenNeeded.toLowerCase()}, the winning move is not writing another explanatory email; it is opening one complete packet with ${seed.docFocus.toLowerCase()} ready to go. PetClues keeps the file, the supporting documents, and the backup access path together so you are not improvising while someone waits.`,
      `${closers[(h >>> 5) % closers.length]} That is especially useful for ${seed.primary_keyword}, where ${CLUSTER_BENEFITS[seed.cluster]} and remove the need to remember which device, inbox, or paper folder held the last acceptable version.`,
    ],
  };
}

function buildFaqs(seed) {
  return [
    {
      question: `For ${seed.primary_keyword}, which copy should I treat as the main file?`,
      answer: `Use the clearest current version of the ${seed.docFocus.toLowerCase()} as the main file, then keep supporting items like ${joinNatural(seed.docs.slice(1).map((d) => d.toLowerCase()))} beside it. The goal is one obvious source of truth, not several near-matches.` ,
    },
    {
      question: `Do I still need the paper original for ${seed.primary_keyword} after I scan it?`,
      answer: `Keep the paper original if it is the only signed or stamped copy you have, but still upload a readable digital version to PetClues. A vault copy is what saves time when you are away from the filing cabinet and need to share proof quickly.` ,
    },
    {
      question: `Who should have access to my ${seed.primary_keyword} packet?`,
      answer: `Give access to anyone who may need to act without you, such as a spouse, co-parent, sitter, or family backup. Read-only sharing is usually enough, and it is much cleaner than forwarding the same attachment every time a request repeats.` ,
    },
  ];
}

function dataRows(seed) {
  const labels = ROW_LABELS[hashSlug(seed.slug) % ROW_LABELS.length];
  return [
    { label: labels[0], value: seed.pain },
    { label: labels[1], value: seed.docFocus },
    { label: labels[2], value: seed.whenNeeded },
    { label: labels[3], value: CLUSTER_BENEFITS[seed.cluster] },
  ];
}

function cta(seed) {
  return {
    headline: `Stop ${seed.pain}`,
    subtext: `Upload ${seed.docFocus.toLowerCase()} once, keep the packet together, and share it from PetClues before the next request turns urgent.`,
    button_text: CTA_BUTTON,
  };
}

function buildPage(seed) {
  const h = hashSlug(seed.slug);
  const h1 = titleCase(seed.primary_keyword);
  return {
    slug: seed.slug,
    cluster: seed.cluster,
    primary_keyword: seed.primary_keyword,
    h1,
    meta_description: metaDescription(seed),
    lead: LEAD_TEMPLATES[h % LEAD_TEMPLATES.length](seed),
    pain_point: seed.pain,
    data_rows: dataRows(seed),
    checklist_heading: checklistHeading(seed, h1),
    checklist: buildChecklist(seed),
    sections: [sectionOne(seed, h), sectionTwo(seed, h), sectionThree(seed, h)],
    faqs: buildFaqs(seed),
    cta: cta(seed),
  };
}

function validatePage(page) {
  if (page.data_rows.length !== 4) throw new Error(`Expected 4 data rows for ${page.slug}`);
  if (new Set(page.data_rows.map((row) => `${row.label}:${row.value}`)).size !== 4) throw new Error(`Duplicate data rows for ${page.slug}`);
  if (page.sections.length !== 3) throw new Error(`Expected 3 sections for ${page.slug}`);
  if (!page.sections.every((section) => section.paragraphs.length === 2)) throw new Error(`Expected 2 paragraphs per section for ${page.slug}`);
  if (page.faqs.length !== 3) throw new Error(`Expected 3 FAQs for ${page.slug}`);
  if (page.checklist.length < 4 || page.checklist.length > 6) throw new Error(`Checklist length out of range for ${page.slug}`);
  if (page.meta_description.length > 157) throw new Error(`Meta too long for ${page.slug}`);
}

const pages = seeds.map(buildPage);

if (pages.length !== 150) throw new Error(`Expected 150 pages, got ${pages.length}`);
if (new Set(pages.map((page) => page.slug)).size !== pages.length) throw new Error('Duplicate slugs detected');
pages.forEach(validatePage);

fs.writeFileSync(outPath, JSON.stringify(pages, null, 2) + "\n", "utf8");
console.log(`Wrote ${pages.length} vault pages to ${outPath}`);
