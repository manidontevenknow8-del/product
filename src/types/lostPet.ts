export type LostPetStatus = 'inactive' | 'active' | 'resolved';

export type RecoveryPhase = 'activated' | 'sharing' | 'monitoring' | 'found';

export type LostPetCase = {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  breed: string;
  avatarInitials: string;
  photoUrl?: string;
  status: LostPetStatus;
  lastSeenLocation: string;
  lastSeenAt: string;
  notes?: string;
  activatedAt: string;
  resolvedAt?: string;
  recoveryLink: string;
  sightingsCount: number;
  reportsReceived: number;
  lastUpdatedAt: string;
};

export type ActivateLostPetInput = {
  lastSeenLocation: string;
  lastSeenAt: string;
  notes?: string;
  photoUrl?: string;
  /** Filled by LostPetProvider from the active pet when activating. */
  petName?: string;
  breed?: string;
  avatarInitials?: string;
};

export type ReportSightingInput = {
  location: string;
  notes?: string;
  reporterName?: string;
  hasPhoto?: boolean;
};

export type Sighting = {
  id: string;
  caseId: string;
  location: string;
  reportedAt: string;
  notes?: string;
  hasPhoto: boolean;
  reporterName?: string;
  distance?: string;
  status: 'new' | 'reviewed' | 'verified';
};

export type RecoveryStats = {
  sightingsCount: number;
  reportsReceived: number;
  sharesCount: number;
  phase: RecoveryPhase;
  progressPercent: number;
};

export type EmergencyContact = {
  name: string;
  phone: string;
  role: string;
};
