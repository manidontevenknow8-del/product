-- PetClues: email reminder infrastructure (Resend + scheduling)
-- Run via Supabase CLI: supabase db push

-- Notification preferences stored on profile (email + in-app)
alter table public.profiles
  add column if not exists notification_preferences jsonb not null default jsonb_build_object(
    'reminderNotifications', true,
    'upcomingCareAlerts', true,
    'lostPetAlerts', true,
    'productUpdates', false,
    'monthlyRecap', true,
    'emailUpcomingReminders', true,
    'emailOverdueReminders', true,
    'emailWeeklySummary', true
  );

-- Future-proof job queue for scheduled / deferred email sends
create table if not exists public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email_type text not null check (
    email_type in ('upcoming_reminder', 'overdue_reminder', 'weekly_pet_summary')
  ),
  payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'sent', 'failed', 'cancelled')
  ),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists email_jobs_status_scheduled_idx
  on public.email_jobs (status, scheduled_for)
  where status = 'pending';

create index if not exists email_jobs_user_id_idx on public.email_jobs (user_id);

-- Send log for deduplication and audit
create table if not exists public.email_send_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email_type text not null,
  dedup_key text not null,
  recipient_email text not null,
  resend_id text,
  sent_at timestamptz not null default now(),
  constraint email_send_log_dedup unique (user_id, email_type, dedup_key)
);

create index if not exists email_send_log_user_id_idx on public.email_send_log (user_id);

alter table public.email_jobs enable row level security;
alter table public.email_send_log enable row level security;

-- Users can read their own send history (optional transparency)
create policy "Users can read own email send log"
  on public.email_send_log
  for select
  using (auth.uid() = user_id);

-- Service role / edge functions bypass RLS for writes
