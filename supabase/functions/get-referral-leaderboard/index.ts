import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type LeaderboardPeriod = 'weekly' | 'alltime';

function userClient(authHeader: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) throw new Error('Supabase env vars missing');
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function maskName(name: string, isYou: boolean): string {
  const first = name.trim().split(/\s+/)[0] || 'Member';
  return isYou ? `${first} (you)` : `${first}.`;
}

function weekAgoIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

function todayStartIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = userClient(authHeader);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const period = (body.period === 'weekly' ? 'weekly' : 'alltime') as LeaderboardPeriod;
    const currentUserId = userData.user.id;
    const admin = adminClient();

    const { data: referrals, error: refError } = await admin
      .from('referrals')
      .select('inviter_user_id, status, signed_up_at')
      .in('status', ['signed_up', 'converted']);

    if (refError) throw new Error(refError.message);

    const weekCutoff = weekAgoIso();
    const counts = new Map<string, number>();

    for (const row of referrals ?? []) {
      if (period === 'weekly') {
        if (!row.signed_up_at || row.signed_up_at < weekCutoff) continue;
      }
      const id = row.inviter_user_id as string;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const userIds = [...new Set([...sorted.map(([id]) => id), currentUserId])];
    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, name')
      .in('user_id', userIds);

    const nameById = new Map(
      (profiles ?? []).map((p) => [p.user_id as string, (p.name as string) || 'Member']),
    );

    const entries = sorted.map(([userId, count], index) => ({
      rank: index + 1,
      name: maskName(nameById.get(userId) ?? 'Member', userId === currentUserId),
      referralCount: count,
      isCurrentUser: userId === currentUserId,
    }));

    const currentCount = counts.get(currentUserId) ?? 0;
    if (currentCount > 0 && !entries.some((e) => e.isCurrentUser)) {
      entries.push({
        rank: entries.length + 1,
        name: maskName(nameById.get(currentUserId) ?? 'Member', true),
        referralCount: currentCount,
        isCurrentUser: true,
      });
    }

    const todayStart = todayStartIso();
    const [{ count: memberCount }, { count: weekSignups }, { count: todaySignups }] =
      await Promise.all([
        admin.from('referral_codes').select('id', { count: 'exact', head: true }),
        admin
          .from('referrals')
          .select('id', { count: 'exact', head: true })
          .in('status', ['signed_up', 'converted'])
          .gte('signed_up_at', weekCutoff),
        admin
          .from('referrals')
          .select('id', { count: 'exact', head: true })
          .in('status', ['signed_up', 'converted'])
          .gte('signed_up_at', todayStart),
      ]);

    return new Response(
      JSON.stringify({
        entries,
        communityStats: {
          waitlistTotal: memberCount ?? 0,
          referralsThisWeek: weekSignups ?? 0,
          spotsClaimedToday: todaySignups ?? 0,
          countriesRepresented: (memberCount ?? 0) > 0 ? 1 : 0,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
