import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.49.1';
import {
  planMeetsMinimum,
  resolveEffectivePlan,
  type CommercialPlan,
} from './entitlements.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ plan: CommercialPlan } | Response> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_tier, subscription_status')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    return new Response(JSON.stringify({ error: 'Profile not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return {
    plan: resolveEffectivePlan({
      subscriptionPlan: profile.subscription_plan,
      subscriptionTier: profile.subscription_tier,
      subscriptionStatus: profile.subscription_status,
    }),
  };
}

export async function requirePlanTier(
  supabase: SupabaseClient,
  userId: string,
  minimumPlan: CommercialPlan,
  featureLabel = 'This feature',
): Promise<Response | null> {
  const result = await getUserPlan(supabase, userId);
  if (result instanceof Response) return result;

  if (!planMeetsMinimum(result.plan, minimumPlan)) {
    const tierName = minimumPlan.charAt(0).toUpperCase() + minimumPlan.slice(1);
    return new Response(
      JSON.stringify({
        error: `${featureLabel} requires ${tierName} or above. Upgrade to unlock.`,
        code: 'plan_required',
        requiredPlan: minimumPlan,
      }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  return null;
}

/** @deprecated Use requirePlanTier(supabase, userId, 'plus', 'Vet Bill Decoder') */
export async function requirePremiumTier(
  supabase: SupabaseClient,
  userId: string,
): Promise<Response | null> {
  return requirePlanTier(supabase, userId, 'plus', 'Vet Bill Decoder');
}
