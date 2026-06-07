import type {
  Caretaker,
  InviteCaretakerInput,
  SharedPet,
} from '@/types/familySharing';
import { buildMockCaretakers, mockSharedPets } from '@/data/familySharingData';

const STORAGE_KEY = 'petclues_caretakers';

/**
 * Family sharing service — swap for Supabase invitations + RLS policies.
 *
 * Backend requirements:
 * - Invitation emails with secure accept tokens
 * - Role-based access control (view_only, care_manager, owner)
 * - Pet-level permission scoping for multi-pet households
 * - Audit log for permission changes
 * - Temporary access grants (vet, groomer, boarding, emergency)
 * - Revoke access and pending invitation management
 */
export interface IFamilySharingService {
  getSharedPets(userId: string): Promise<SharedPet[]>;
  getCaretakers(userId: string): Promise<Caretaker[]>;
  inviteCaretaker(userId: string, input: InviteCaretakerInput): Promise<Caretaker>;
  updatePermission(
    userId: string,
    caretakerId: string,
    permission: Caretaker['permission'],
  ): Promise<Caretaker>;
  removeCaretaker(userId: string, caretakerId: string): Promise<void>;
  resendInvitation(userId: string, caretakerId: string): Promise<void>;
}

export const mockFamilySharingService: IFamilySharingService = {
  async getSharedPets(_userId) {
    return mockSharedPets;
  },

  async getCaretakers(userId) {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) return JSON.parse(stored) as Caretaker[];
    return buildMockCaretakers();
  },

  async inviteCaretaker(userId, input) {
    const caretakers = await this.getCaretakers(userId);
    const newCaretaker: Caretaker = {
      id: `c-${Date.now()}`,
      name: input.name,
      email: input.email,
      permission: input.permission,
      status: 'pending',
      sharedPetIds: input.petIds,
      invitedAt: new Date().toISOString(),
      lastActiveAt: null,
    };
    const updated = [...caretakers, newCaretaker];
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    return newCaretaker;
  },

  async updatePermission(userId, caretakerId, permission) {
    const caretakers = await this.getCaretakers(userId);
    const updated = caretakers.map((c) =>
      c.id === caretakerId ? { ...c, permission } : c,
    );
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    return updated.find((c) => c.id === caretakerId)!;
  },

  async removeCaretaker(userId, caretakerId) {
    const caretakers = await this.getCaretakers(userId);
    const updated = caretakers.filter((c) => c.id !== caretakerId);
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  },

  async resendInvitation(_userId, _caretakerId) {
    // Mock: no-op, backend would trigger email
  },
};
