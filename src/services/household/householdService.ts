import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';
import type { HouseholdRole } from '@/services/household/householdTypes';

export type { HouseholdRole } from '@/services/household/householdTypes';
export {
  canEditHousehold,
  canEditHousehold as canEditHouseholdPet,
  canManageHouseholdMembers,
} from '@/services/household/householdTypes';

export async function getHouseholdRoleForPet(petId: string): Promise<HouseholdRole | null> {
  if (!isSupabaseConfigured()) {
    return 'owner';
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_my_household_role_for_pet', {
    p_pet_id: petId,
  });

  if (error) throw new Error(error.message);
  if (data === 'owner' || data === 'editor' || data === 'viewer') return data;
  return null;
}
