-- Referral share analytics (optional table - edge function degrades gracefully if missing)

create table if not exists public.referral_share_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('copy', 'whatsapp', 'instagram', 'twitter', 'email')),
  created_at timestamptz not null default now()
);

create index if not exists referral_share_events_user_id_idx
  on public.referral_share_events (user_id);

alter table public.referral_share_events enable row level security;

create policy "Users can read own share events"
  on public.referral_share_events
  for select
  using (auth.uid() = user_id);
