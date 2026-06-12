export type PassportIdentity = {
  petName: string;
  breed: string;
  age: string;
  species: string;
  gender: string | null;
  weight: string | null;
  avatarInitials: string;
  photo: string | null;
  lastUpdated: string;
  secureLink: string;
};

/** @deprecated Legacy mock shape - use PassportIdentity + PassportData */
export type PassportMeta = {
  petName: string;
  breed: string;
  age: string;
  avatarInitials: string;
  photo: string | null;
  lastUpdated: string;
  secureLink: string;
};

/** @deprecated Replaced by real health record sections */
export type EmergencySummary = {
  bloodType: string | null;
  allergies: string;
  currentMedications: string;
  chronicConditions: string;
  emergencyNotes: string;
};

/** @deprecated Replaced by real health record sections */
export type MedicalInfo = {
  vaccineStatus: string;
  recentTreatments: string;
  importantRecords: string;
  nextCareEvent: string;
};

/** @deprecated No contact table yet */
export type VetContact = {
  vetName: string;
  clinic: string;
  phone: string;
  emergencyHotline: string;
};

/** @deprecated No contact table yet */
export type OwnerContact = {
  primaryOwner: { name: string; phone: string; email: string };
  secondaryContact: { name: string; phone: string; relationship: string };
  emergencyContact: { name: string; phone: string; relationship: string };
};
