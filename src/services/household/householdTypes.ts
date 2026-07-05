export type HouseholdRole = 'owner' | 'editor' | 'viewer';

export type InviteRole = 'editor' | 'viewer';

export type HouseholdSummary = {
  id: string;
  name: string;
  planTier: string;
  billingOwnerUserId: string;
  myRole: HouseholdRole;
};

export type HouseholdMember = {
  userId: string;
  role: HouseholdRole;
  joinedAt: string;
  name: string;
  email: string;
};

export type HouseholdInvite = {
  id: string;
  invitedEmail: string;
  role: InviteRole;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  createdAt: string;
  expiresAt: string;
  token?: string;
};

export type IncomingHouseholdInvite = HouseholdInvite & {
  token: string;
  householdId: string;
  householdName: string;
  inviterName: string;
};

export type HouseholdInvitePreview = {
  householdName: string;
  role: InviteRole;
  invitedEmail: string;
  inviterName: string;
  expiresAt: string;
  status: string;
};

export function canEditHousehold(role: HouseholdRole | null): boolean {
  return role === 'owner' || role === 'editor';
}

export function canManageHouseholdMembers(role: HouseholdRole | null): boolean {
  return role === 'owner';
}

export const HOUSEHOLD_ROLE_LABELS: Record<HouseholdRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const INVITE_ROLE_LABELS: Record<InviteRole, string> = {
  editor: 'Editor — can update records and reminders',
  viewer: 'Viewer — read-only access',
};
