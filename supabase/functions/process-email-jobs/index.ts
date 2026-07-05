import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { isInternalCaller } from '../_shared/security/auth.ts';
import { canSendEmailType, mergeNotificationPreferences } from '../_shared/email/preferences.ts';
import { getAppBaseUrl, sendViaResend } from '../_shared/email/resendClient.ts';
import { subjectForEmail } from '../_shared/email/templates.ts';
import type { EmailType, SendEmailInput } from '../_shared/email/types.ts';
import {
  buildWeeklyPetSummaries,
  daysUntilDue,
  formatDueLabel,
  summarizeWeeklyTotals,
} from '../_shared/email/weeklySummaryData.ts';
import { buildPetCareScoreEmailSummary } from '../_shared/email/petCareScoreForEmail.ts';

/** Send upcoming emails on these days-before-due (UTC). Each fires once per reminder. */
const UPCOMING_REMINDER_DAYS = [7, 3, 1, 0] as const;
/** Overdue emails: once per day while overdue, up to this many days past due. */
const OVERDUE_MAX_DAYS = 30;
const WEEKLY_SUMMARY_DAY = 0; // Sunday

type ReminderRow = {
  id: string;
  pet_id: string;
  title: string;
  category: string;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  pets: { name: string; owner_id: string } | null;
};

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

function toIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDisplayDate(iso: string): string {
  const d = parseDate(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function normalizePhotoUrlForEmail(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) return null;
  if (trimmed.startsWith('https://')) return trimmed;
  return null;
}

async function alreadySent(
  supabase: ReturnType<typeof adminClient>,
  userId: string,
  emailType: EmailType,
  dedupKey: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('email_send_log')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .eq('dedup_key', dedupKey)
    .maybeSingle();

  return Boolean(data);
}

async function logSend(
  supabase: ReturnType<typeof adminClient>,
  userId: string,
  emailType: EmailType,
  dedupKey: string,
  recipientEmail: string,
  resendId?: string,
) {
  await supabase.from('email_send_log').insert({
    user_id: userId,
    email_type: emailType,
    dedup_key: dedupKey,
    recipient_email: recipientEmail,
    resend_id: resendId ?? null,
  });
}

async function deliverEmail(
  supabase: ReturnType<typeof adminClient>,
  userId: string,
  email: string,
  input: SendEmailInput,
  dedupKey: string,
): Promise<'sent' | 'skipped'> {
  if (await alreadySent(supabase, userId, input.type, dedupKey)) {
    return 'skipped';
  }

  const result = await sendViaResend({
    ...input,
    to: email,
    subject: input.subject || subjectForEmail(input),
  });

  if (!result.success) {
    throw new Error(result.error ?? 'Resend send failed');
  }

  await logSend(supabase, userId, input.type, dedupKey, email, result.resendId);
  return 'sent';
}

async function processPendingJobs(supabase: ReturnType<typeof adminClient>) {
  let sent = 0;
  let skipped = 0;
  let processed = 0;

  const { data: jobs } = await supabase
    .from('email_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50);

  for (const job of jobs ?? []) {
    processed += 1;
    await supabase.from('email_jobs').update({ status: 'processing' }).eq('id', job.id);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, notification_preferences')
        .eq('user_id', job.user_id)
        .single();

      if (!profile?.email) {
        await supabase
          .from('email_jobs')
          .update({ status: 'failed', last_error: 'No email on profile', processed_at: new Date().toISOString() })
          .eq('id', job.id);
        continue;
      }

      const prefs = mergeNotificationPreferences(profile.notification_preferences);
      if (!canSendEmailType(prefs, job.email_type as EmailType)) {
        await supabase
          .from('email_jobs')
          .update({ status: 'cancelled', processed_at: new Date().toISOString() })
          .eq('id', job.id);
        skipped += 1;
        continue;
      }

      const payload = job.payload as Record<string, unknown>;
      const input = { type: job.email_type as EmailType, payload } as SendEmailInput;
      const outcome = await deliverEmail(
        supabase,
        job.user_id,
        profile.email,
        input,
        `job:${job.id}`,
      );

      if (outcome === 'sent') sent += 1;
      else skipped += 1;

      await supabase
        .from('email_jobs')
        .update({ status: 'sent', processed_at: new Date().toISOString() })
        .eq('id', job.id);
    } catch (err) {
      await supabase
        .from('email_jobs')
        .update({
          status: 'failed',
          attempts: (job.attempts ?? 0) + 1,
          last_error: err instanceof Error ? err.message : 'Unknown error',
          processed_at: new Date().toISOString(),
        })
        .eq('id', job.id);
    }
  }

  return { processed, sent, skipped };
}

async function processReminderEmails(supabase: ReturnType<typeof adminClient>, today: Date) {
  let sent = 0;
  let skipped = 0;
  let processed = 0;
  const todayIso = toIsoDate(today);
  const baseUrl = getAppBaseUrl();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, email, name, notification_preferences');

  for (const profile of profiles ?? []) {
    if (!profile.email) continue;

    const prefs = mergeNotificationPreferences(profile.notification_preferences);
    const userId = profile.user_id as string;

    const { data: pets } = await supabase
      .from('pets')
      .select('id, name, species, breed, photo_url, birth_date, weight, gender')
      .eq('owner_id', userId);

    if (!pets?.length) continue;

    const petIds = pets.map((p) => p.id);
    const petNameById = Object.fromEntries(pets.map((p) => [p.id, p.name]));
    const petPhotoById = Object.fromEntries(
      pets.map((p) => [p.id, normalizePhotoUrlForEmail(p.photo_url)]),
    );

    const { data: reminders } = await supabase
      .from('reminders')
      .select('id, pet_id, title, category, due_date, completed, completed_at, pets(name, owner_id)')
      .in('pet_id', petIds)
      .eq('completed', false);

    for (const reminder of (reminders ?? []) as ReminderRow[]) {
      const days = daysUntilDue(reminder.due_date, today);

      // Upcoming: 7d, 3d, 1d before, and on due date (each once via dedup)
      if (
        (UPCOMING_REMINDER_DAYS as readonly number[]).includes(days) &&
        canSendEmailType(prefs, 'upcoming_reminder')
      ) {
        processed += 1;
        const dedupKey = `reminder:${reminder.id}:upcoming:${reminder.due_date}:d${days}`;
        const petName = petNameById[reminder.pet_id] ?? reminder.pets?.name ?? 'Your pet';

        const outcome = await deliverEmail(
          supabase,
          userId,
          profile.email,
          {
            type: 'upcoming_reminder',
            to: profile.email,
            subject: '',
            payload: {
              petName,
              petPhotoUrl: petPhotoById[reminder.pet_id] ?? null,
              reminderTitle: reminder.title,
              dueDate: reminder.due_date,
              dueLabel: formatDueLabel(reminder.due_date, today),
              category: reminder.category,
              remindersUrl: `${baseUrl}/reminders`,
            },
          },
          dedupKey,
        );

        if (outcome === 'sent') sent += 1;
        else skipped += 1;
      }

      // Overdue: one email per reminder per day, capped after OVERDUE_MAX_DAYS
      if (
        days < 0 &&
        Math.abs(days) <= OVERDUE_MAX_DAYS &&
        canSendEmailType(prefs, 'overdue_reminder')
      ) {
        processed += 1;
        const dedupKey = `reminder:${reminder.id}:overdue:${todayIso}`;
        const petName = petNameById[reminder.pet_id] ?? reminder.pets?.name ?? 'Your pet';

        const outcome = await deliverEmail(
          supabase,
          userId,
          profile.email,
          {
            type: 'overdue_reminder',
            to: profile.email,
            subject: '',
            payload: {
              petName,
              petPhotoUrl: petPhotoById[reminder.pet_id] ?? null,
              reminderTitle: reminder.title,
              dueDate: formatDisplayDate(reminder.due_date),
              daysOverdue: Math.abs(days),
              category: reminder.category,
              remindersUrl: `${baseUrl}/reminders`,
            },
          },
          dedupKey,
        );

        if (outcome === 'sent') sent += 1;
        else skipped += 1;
      }
    }

    // Weekly digest on Sunday (UTC) — check-ins, streak, care score insight, reminders
    if (
      today.getUTCDay() === WEEKLY_SUMMARY_DAY &&
      canSendEmailType(prefs, 'weekly_pet_summary')
    ) {
      processed += 1;
      const weekStart = todayIso;
      const dedupKey = `weekly:${weekStart}`;

      if (!(await alreadySent(supabase, userId, 'weekly_pet_summary', dedupKey))) {
        const weekAgo = new Date(today);
        weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
        const weekAgoIso = weekAgo.toISOString().slice(0, 10);

        const [
          { data: weekCheckIns },
          { data: streakCheckIns },
          { data: healthRecords },
          { data: documents },
          { data: scoreSnapshots },
          { data: allReminders },
        ] = await Promise.all([
          supabase
            .from('daily_check_ins')
            .select('pet_id, check_in_date')
            .in('pet_id', petIds)
            .gte('check_in_date', weekAgoIso),
          supabase
            .from('daily_check_ins')
            .select('pet_id, check_in_date')
            .in('pet_id', petIds),
          supabase
            .from('health_records')
            .select('pet_id, record_type, severity')
            .in('pet_id', petIds),
          supabase
            .from('pet_documents')
            .select('pet_id')
            .in('pet_id', petIds),
          supabase
            .from('pet_care_score_snapshots')
            .select('pet_id, score, factors_json, recorded_at')
            .in('pet_id', petIds)
            .order('recorded_at', { ascending: true }),
          supabase
            .from('reminders')
            .select('pet_id, due_date, completed_at')
            .in('pet_id', petIds),
        ]);

        const documentCountByPet = Object.fromEntries(
          petIds.map((id) => [
            id,
            (documents ?? []).filter((doc) => doc.pet_id === id).length,
          ]),
        );

        const careScoresByPetId: Record<string, ReturnType<typeof buildPetCareScoreEmailSummary>> = {};
        for (const pet of pets) {
          careScoresByPetId[pet.id] = buildPetCareScoreEmailSummary({
            pet,
            healthRecords: healthRecords ?? [],
            documentCount: documentCountByPet[pet.id] ?? 0,
            reminders: allReminders ?? [],
            checkIns: streakCheckIns ?? [],
            snapshots: (scoreSnapshots ?? []).map((row) => ({
              pet_id: row.pet_id,
              score: row.score,
              factors_json: (row.factors_json as Record<string, number> | null) ?? null,
              recorded_at: row.recorded_at,
            })),
            today,
          });
        }

        const petSummaries = buildWeeklyPetSummaries({
          pets,
          reminders: (reminders ?? []).map((r) => ({
            id: r.id,
            pet_id: r.pet_id,
            title: r.title,
            category: r.category,
            due_date: r.due_date,
          })),
          checkIns: weekCheckIns ?? [],
          streakCheckIns: streakCheckIns ?? [],
          careScoresByPetId,
          today,
          baseUrl,
        });
        const totals = summarizeWeeklyTotals(petSummaries);

        const weekLabel = today.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        });

        const outcome = await deliverEmail(
          supabase,
          userId,
          profile.email,
          {
            type: 'weekly_pet_summary',
            to: profile.email,
            subject: '',
            payload: {
              ownerName: profile.name ?? 'there',
              weekLabel,
              pets: petSummaries,
              totals,
              dashboardUrl: `${baseUrl}/dashboard`,
              remindersUrl: `${baseUrl}/reminders`,
              settingsUrl: `${baseUrl}/settings`,
            },
          },
          dedupKey,
        );

        if (outcome === 'sent') sent += 1;
        else skipped += 1;
      } else {
        skipped += 1;
      }
    }
  }

  return { processed, sent, skipped };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

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
    const today = new Date();

    const jobStats = await processPendingJobs(supabase);
    const reminderStats = await processReminderEmails(supabase, today);

    const result = {
      processed: jobStats.processed + reminderStats.processed,
      sent: jobStats.sent + reminderStats.sent,
      skipped: jobStats.skipped + reminderStats.skipped,
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
