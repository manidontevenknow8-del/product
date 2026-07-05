import { isSupabaseConfigured } from '@/services/supabase/config';
import { getSupabaseClient } from '@/services/supabase/client';
import type {
  HouseholdInvite,
  HouseholdInvitePreview,
  HouseholdMember,
  HouseholdSummary,
  IncomingHouseholdInvite,
  InviteRole,
} from './householdTypes';

export interface IHouseholdService {
  getPrimaryHousehold(): Promise<HouseholdSummary | null>;
  listMembers(householdId: string): Promise<HouseholdMember[]>;
  listOutgoingInvites(householdId: string): Promise<HouseholdInvite[]>;
  listIncomingInvites(): Promise<IncomingHouseholdInvite[]>;
  createInvite(householdId: string, email: string, role: InviteRole): Promise<HouseholdInvite>;
  revokeInvite(inviteId: string): Promise<void>;
  acceptInvite(token: string): Promise<{ householdId: string; alreadyMember: boolean }>;
  declineInvite(token: string): Promise<void>;
  updateMemberRole(householdId: string, userId: string, role: InviteRole): Promise<void>;
  removeMember(householdId: string, userId: string): Promise<void>;
  getInvitePreview(token: string): Promise<HouseholdInvitePreview | null>;
  countMemberSlots(householdId: string): Promise<number>;
}

function mapHouseholdSummary(payload: Record<string, unknown> | null): HouseholdSummary | null {
  if (!payload || typeof payload.id !== 'string') return null;
  return {
    id: payload.id,
    name: String(payload.name ?? 'Household'),
    planTier: String(payload.planTier ?? 'free'),
    billingOwnerUserId: String(payload.billingOwnerUserId ?? ''),
    myRole: payload.myRole as HouseholdSummary['myRole'],
  };
}

function mapMember(row: Record<string, unknown>): HouseholdMember {
  return {
    userId: String(row.userId),
    role: row.role as HouseholdMember['role'],
    joinedAt: String(row.joinedAt),
    name: String(row.name ?? 'Member'),
    email: String(row.email ?? ''),
  };
}

function mapInvite(row: Record<string, unknown>): HouseholdInvite {
  return {
    id: String(row.id),
    invitedEmail: String(row.invitedEmail),
    role: row.role as HouseholdInvite['role'],
    status: row.status as HouseholdInvite['status'],
    createdAt: String(row.createdAt),
    expiresAt: String(row.expiresAt),
    token: row.token ? String(row.token) : undefined,
  };
}

function mapIncomingInvite(row: Record<string, unknown>): IncomingHouseholdInvite {
  return {
    ...mapInvite(row),
    token: String(row.token),
    householdId: String(row.householdId),
    householdName: String(row.householdName ?? 'Household'),
    inviterName: String(row.inviterName ?? 'Household owner'),
  };
}

export const supabaseHouseholdService: IHouseholdService = {
  async getPrimaryHousehold() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_my_primary_household');
    if (error) throw new Error(error.message);
    return mapHouseholdSummary(data as Record<string, unknown> | null);
  },

  async listMembers(householdId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('list_household_members', {
      p_household_id: householdId,
    });
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.map((row) => mapMember(row as Record<string, unknown>)) : [];
  },

  async listOutgoingInvites(householdId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('list_household_invites', {
      p_household_id: householdId,
    });
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.map((row) => mapInvite(row as Record<string, unknown>)) : [];
  },

  async listIncomingInvites() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('list_my_pending_household_invites');
    if (error) throw new Error(error.message);
    return Array.isArray(data)
      ? data.map((row) => mapIncomingInvite(row as Record<string, unknown>))
      : [];
  },

  async createInvite(householdId, email, role) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('create_household_invite', {
      p_household_id: householdId,
      p_email: email,
      p_role: role,
    });
    if (error) throw new Error(error.message);
    return mapInvite(data as Record<string, unknown>);
  },

  async revokeInvite(inviteId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('revoke_household_invite', {
      p_invite_id: inviteId,
    });
    if (error) throw new Error(error.message);
  },

  async acceptInvite(token) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('accept_household_invite', {
      p_token: token,
    });
    if (error) throw new Error(error.message);
    const payload = data as { householdId?: string; alreadyMember?: boolean };
    return {
      householdId: String(payload.householdId ?? ''),
      alreadyMember: Boolean(payload.alreadyMember),
    };
  },

  async declineInvite(token) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('decline_household_invite', {
      p_token: token,
    });
    if (error) throw new Error(error.message);
  },

  async updateMemberRole(householdId, userId, role) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('update_household_member_role', {
      p_household_id: householdId,
      p_user_id: userId,
      p_role: role,
    });
    if (error) throw new Error(error.message);
  },

  async removeMember(householdId, userId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('remove_household_member', {
      p_household_id: householdId,
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },

  async getInvitePreview(token) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_household_invite_preview', {
      p_token: token,
    });
    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') return null;
    const payload = data as Record<string, unknown>;
    return {
      householdName: String(payload.householdName ?? 'Household'),
      role: payload.role as HouseholdInvitePreview['role'],
      invitedEmail: String(payload.invitedEmail ?? ''),
      inviterName: String(payload.inviterName ?? 'Household owner'),
      expiresAt: String(payload.expiresAt ?? ''),
      status: String(payload.status ?? 'pending'),
    };
  },

  async countMemberSlots(householdId) {
    const [members, invites] = await Promise.all([
      supabaseHouseholdService.listMembers(householdId),
      supabaseHouseholdService.listOutgoingInvites(householdId),
    ]);
    return members.filter((member) => member.role !== 'owner').length + invites.length;
  },
};

const STORAGE_MEMBERS = 'petclues_household_members';
const STORAGE_INVITES = 'petclues_household_invites';
const STORAGE_HOUSEHOLD = 'petclues_household';

type StoredHousehold = {
  id: string;
  name: string;
  plan_tier: string;
  billing_owner_user_id: string;
};

type StoredMember = {
  household_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  name: string;
  email: string;
};

type StoredInvite = {
  id: string;
  household_id: string;
  invited_email: string;
  role: 'editor' | 'viewer';
  invited_by_user_id: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  created_at: string;
  expires_at: string;
  household_name?: string;
  inviter_name?: string;
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureMockHousehold(userId: string, email: string, name: string): StoredHousehold {
  const households = loadJson<StoredHousehold[]>(STORAGE_HOUSEHOLD, []);
  let household = households.find((row) => row.billing_owner_user_id === userId);
  if (!household) {
    household = {
      id: crypto.randomUUID(),
      name: `${name || 'My'} Household`,
      plan_tier: 'plus',
      billing_owner_user_id: userId,
    };
    households.push(household);
    saveJson(STORAGE_HOUSEHOLD, households);
  }

  const members = loadJson<StoredMember[]>(STORAGE_MEMBERS, []);
  if (!members.some((row) => row.household_id === household!.id && row.user_id === userId)) {
    members.push({
      household_id: household.id,
      user_id: userId,
      role: 'owner',
      joined_at: new Date().toISOString(),
      name: name || 'Owner',
      email,
    });
    saveJson(STORAGE_MEMBERS, members);
  }

  return household;
}

export const mockHouseholdService: IHouseholdService = {
  async getPrimaryHousehold() {
    const userId = localStorage.getItem('petclues_mock_user_id') ?? 'mock-user';
    const email = localStorage.getItem('petclues_mock_user_email') ?? 'owner@example.com';
    const name = localStorage.getItem('petclues_mock_user_name') ?? 'Owner';
    const household = ensureMockHousehold(userId, email, name);
    const members = loadJson<StoredMember[]>(STORAGE_MEMBERS, []);
    const mine = members.find((row) => row.user_id === userId);
    if (!mine) return null;
    return {
      id: household.id,
      name: household.name,
      planTier: household.plan_tier,
      billingOwnerUserId: household.billing_owner_user_id,
      myRole: mine.role,
    };
  },

  async listMembers(householdId) {
    return loadJson<StoredMember[]>(STORAGE_MEMBERS, [])
      .filter((row) => row.household_id === householdId)
      .map((row) => ({
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
        name: row.name,
        email: row.email,
      }));
  },

  async listOutgoingInvites(householdId) {
    return loadJson<StoredInvite[]>(STORAGE_INVITES, [])
      .filter((row) => row.household_id === householdId && row.status === 'pending')
      .map((row) => ({
        id: row.id,
        invitedEmail: row.invited_email,
        role: row.role,
        status: row.status,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        token: row.token,
      }));
  },

  async listIncomingInvites() {
    const email = (localStorage.getItem('petclues_mock_user_email') ?? '').toLowerCase();
    return loadJson<StoredInvite[]>(STORAGE_INVITES, [])
      .filter((row) => row.status === 'pending' && row.invited_email === email)
      .map((row) => ({
        id: row.id,
        invitedEmail: row.invited_email,
        role: row.role,
        status: row.status,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        token: row.token,
        householdId: row.household_id,
        householdName: row.household_name ?? 'Household',
        inviterName: row.inviter_name ?? 'Household owner',
      }));
  },

  async createInvite(householdId, email, role) {
    const userId = localStorage.getItem('petclues_mock_user_id') ?? 'mock-user';
    const rows = loadJson<StoredInvite[]>(STORAGE_INVITES, []);
    const created: StoredInvite = {
      id: crypto.randomUUID(),
      household_id: householdId,
      invited_email: email.trim().toLowerCase(),
      role,
      invited_by_user_id: userId,
      token: crypto.randomUUID().replace(/-/g, ''),
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      household_name: loadJson<StoredHousehold[]>(STORAGE_HOUSEHOLD, []).find((h) => h.id === householdId)?.name,
      inviter_name: localStorage.getItem('petclues_mock_user_name') ?? 'Owner',
    };
    rows.push(created);
    saveJson(STORAGE_INVITES, rows);
    return {
      id: created.id,
      invitedEmail: created.invited_email,
      role: created.role,
      status: created.status,
      createdAt: created.created_at,
      expiresAt: created.expires_at,
      token: created.token,
    };
  },

  async revokeInvite(inviteId) {
    const rows = loadJson<StoredInvite[]>(STORAGE_INVITES, []);
    const index = rows.findIndex((row) => row.id === inviteId);
    if (index >= 0) {
      rows[index] = { ...rows[index]!, status: 'revoked' };
      saveJson(STORAGE_INVITES, rows);
    }
  },

  async acceptInvite(token) {
    const userId = localStorage.getItem('petclues_mock_user_id') ?? 'mock-user';
    const email = (localStorage.getItem('petclues_mock_user_email') ?? '').toLowerCase();
    const name = localStorage.getItem('petclues_mock_user_name') ?? 'Member';
    const rows = loadJson<StoredInvite[]>(STORAGE_INVITES, []);
    const invite = rows.find((row) => row.token === token && row.status === 'pending');
    if (!invite) throw new Error('Invite not found or no longer valid.');
    if (invite.invited_email !== email) {
      throw new Error('This invite was sent to a different email address.');
    }

    const members = loadJson<StoredMember[]>(STORAGE_MEMBERS, []);
    const alreadyMember = members.some(
      (row) => row.household_id === invite.household_id && row.user_id === userId,
    );
    if (!alreadyMember) {
      members.push({
        household_id: invite.household_id,
        user_id: userId,
        role: invite.role,
        joined_at: new Date().toISOString(),
        name,
        email,
      });
      saveJson(STORAGE_MEMBERS, members);
    }

    invite.status = 'accepted';
    saveJson(STORAGE_INVITES, rows);
    return { householdId: invite.household_id, alreadyMember };
  },

  async declineInvite(token) {
    const rows = loadJson<StoredInvite[]>(STORAGE_INVITES, []);
    const invite = rows.find((row) => row.token === token && row.status === 'pending');
    if (!invite) throw new Error('Invite not found or no longer valid.');
    invite.status = 'declined';
    saveJson(STORAGE_INVITES, rows);
  },

  async updateMemberRole(householdId, userId, role) {
    const members = loadJson<StoredMember[]>(STORAGE_MEMBERS, []);
    const index = members.findIndex(
      (row) => row.household_id === householdId && row.user_id === userId,
    );
    if (index >= 0 && members[index]!.role !== 'owner') {
      members[index] = { ...members[index]!, role };
      saveJson(STORAGE_MEMBERS, members);
    }
  },

  async removeMember(householdId, userId) {
    const members = loadJson<StoredMember[]>(STORAGE_MEMBERS, []).filter(
      (row) => !(row.household_id === householdId && row.user_id === userId && row.role !== 'owner'),
    );
    saveJson(STORAGE_MEMBERS, members);
  },

  async getInvitePreview(token) {
    const invite = loadJson<StoredInvite[]>(STORAGE_INVITES, []).find(
      (row) => row.token === token && row.status === 'pending',
    );
    if (!invite) return null;
    return {
      householdName: invite.household_name ?? 'Household',
      role: invite.role,
      invitedEmail: invite.invited_email,
      inviterName: invite.inviter_name ?? 'Household owner',
      expiresAt: invite.expires_at,
      status: invite.status,
    };
  },

  async countMemberSlots(householdId) {
    const members = await mockHouseholdService.listMembers(householdId);
    const invites = await mockHouseholdService.listOutgoingInvites(householdId);
    return members.filter((member) => member.role !== 'owner').length + invites.length;
  },
};

export function getHouseholdService(): IHouseholdService {
  return isSupabaseConfigured() ? supabaseHouseholdService : mockHouseholdService;
}

export function countMockHouseholdMemberSlots(householdId: string): number {
  const members = loadJson<StoredMember[]>(STORAGE_MEMBERS, []).filter(
    (row) => row.household_id === householdId && row.role !== 'owner',
  );
  const invites = loadJson<StoredInvite[]>(STORAGE_INVITES, []).filter(
    (row) => row.household_id === householdId && row.status === 'pending',
  );
  return members.length + invites.length;
}
