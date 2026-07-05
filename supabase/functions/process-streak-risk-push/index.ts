import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { isInternalCaller } from '../_shared/security/auth.ts';
import {
  computeCheckInStreak,
  getLocalTimeParts,
  isInStreakPushWindow,
  isStreakAtRisk,
  streakRiskNotificationCopy,
} from '../_shared/push/streakRisk.ts';
import { sendStreakRiskPush } from '../_shared/push/webPush.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string;
  active_pet_id: string | null;
  last_streak_push_date: string | null;
};

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function pushStreakRemindersEnabled(preferences: unknown): boolean {
  if (!preferences || typeof preferences !== 'object') return false;
  return (preferences as Record<string, boolean>).pushStreakReminders === true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isInternalCaller(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = adminClient();
    const now = new Date();
    let processed = 0;
    let sent = 0;
    let skipped = 0;

    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth, timezone, active_pet_id, last_streak_push_date');

    if (subError) throw new Error(subError.message);

    const baseUrl = Deno.env.get('APP_BASE_URL') ?? 'https://petclues.com';

    for (const row of (subscriptions ?? []) as PushSubscriptionRow[]) {
      processed += 1;

      const { dateKey: localDate, hour: localHour } = getLocalTimeParts(row.timezone, now);
      if (!isInStreakPushWindow(localHour)) {
        skipped += 1;
        continue;
      }

      if (row.last_streak_push_date === localDate) {
        skipped += 1;
        continue;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('user_id', row.user_id)
        .maybeSingle();

      if (!pushStreakRemindersEnabled(profile?.notification_preferences)) {
        skipped += 1;
        continue;
      }

      let petId = row.active_pet_id;
      let petName = 'your pet';

      if (!petId) {
        const { data: pets } = await supabase
          .from('pets')
          .select('id, name')
          .eq('owner_id', row.user_id)
          .order('created_at', { ascending: true })
          .limit(1);
        petId = pets?.[0]?.id ?? null;
        petName = pets?.[0]?.name ?? petName;
      } else {
        const { data: pet } = await supabase
          .from('pets')
          .select('name')
          .eq('id', petId)
          .maybeSingle();
        if (pet?.name) petName = pet.name;
      }

      if (!petId) {
        skipped += 1;
        continue;
      }

      const { data: checkIns } = await supabase
        .from('daily_check_ins')
        .select('check_in_date')
        .eq('pet_id', petId);

      const dates = (checkIns ?? []).map((c) => c.check_in_date as string);
      if (!isStreakAtRisk(dates, localDate)) {
        skipped += 1;
        continue;
      }

      const streak = computeCheckInStreak(dates, localDate);
      const copy = streakRiskNotificationCopy(petName, streak);

      const result = await sendStreakRiskPush(
        { endpoint: row.endpoint, p256dh: row.p256dh, auth: row.auth },
        {
          title: copy.title,
          body: copy.body,
          url: `${baseUrl}/dashboard#ritual`,
          tag: `streak-risk:${localDate}`,
        },
      );

      if (result.ok) {
        sent += 1;
        await supabase
          .from('push_subscriptions')
          .update({
            last_streak_push_date: localDate,
            updated_at: now.toISOString(),
          })
          .eq('id', row.id);
      } else if (result.expired) {
        await supabase.from('push_subscriptions').delete().eq('id', row.id);
        skipped += 1;
      } else {
        skipped += 1;
      }
    }

    return new Response(JSON.stringify({ processed, sent, skipped }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
