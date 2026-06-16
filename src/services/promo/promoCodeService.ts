import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';

export type RedeemPromoCodeResult =
  | {
      success: true;
      plan: string;
      trialDays: number;
      trialEndsAt: string;
    }
  | {
      success: false;
      error: string;
    };

export async function redeemPromoCode(code: string): Promise<RedeemPromoCodeResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { success: false, error: 'Enter a promo code' };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Promo codes are available after connecting your account online.' };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('redeem_promo_code', { p_code: trimmed });

  if (error) {
    return { success: false, error: error.message };
  }

  const payload = data as {
    success?: boolean;
    error?: string;
    plan?: string;
    trialDays?: number;
    trialEndsAt?: string;
  } | null;

  if (!payload?.success) {
    return { success: false, error: payload?.error ?? 'Unable to redeem promo code' };
  }

  return {
    success: true,
    plan: payload.plan ?? 'pro',
    trialDays: payload.trialDays ?? 30,
    trialEndsAt: payload.trialEndsAt ?? '',
  };
}
