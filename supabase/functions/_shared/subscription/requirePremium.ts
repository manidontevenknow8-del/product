import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function requirePremiumTier(
  supabase: SupabaseClient,
  userId: string,
): Promise<Response | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('user_id', userId)
    .single();

  if (error || !profile) {
    return new Response(JSON.stringify({ error: 'Profile not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const isPremium =
    profile.subscription_status === 'active' ||
    ['premium', 'family'].includes(profile.subscription_tier);

  if (!isPremium) {
    return new Response(
      JSON.stringify({
        error: 'Vet Bill Decoder requires Pro. Upgrade to unlock AI document decoding.',
        code: 'premium_required',
      }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  return null;
}
