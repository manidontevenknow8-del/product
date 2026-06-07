export type CaretakerPermission = 'view_only' | 'care_manager' | 'owner';

export type CaretakerStatus = 'active' | 'pending' | 'expired';

export type SharedPet = {
  id: string;
  name: string;
  species: string;
  avatarInitials: string;
};

export type Caretaker = {
  id: string;
  name: string;
  email: string;
  permission: CaretakerPermission;
  status: CaretakerStatus;
  sharedPetIds: string[];
  invitedAt: string;
  lastActiveAt: string | null;
};

export type InviteCaretakerInput = {
  email: string;
  name: string;
  permission: CaretakerPermission;
  petIds: string[];
};

export type PermissionDefinition = {
  level: CaretakerPermission;
  label: string;
  description: string;
  capabilities: string[];
};
