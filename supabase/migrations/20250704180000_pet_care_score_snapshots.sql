-- Pet Care Score history (replaces per-pet localStorage snapshots).

create table if not exists public.pet_care_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  factors_json jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create index if not exists pet_care_score_snapshots_pet_recorded_idx
  on public.pet_care_score_snapshots (pet_id, recorded_at asc);

alter table public.pet_care_score_snapshots enable row level security;

drop policy if exists "Household members can read score snapshots" on public.pet_care_score_snapshots;
drop policy if exists "Household editors can insert score snapshots" on public.pet_care_score_snapshots;
drop policy if exists "Household editors can delete score snapshots" on public.pet_care_score_snapshots;

create policy "Household members can read score snapshots"
  on public.pet_care_score_snapshots
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert score snapshots"
  on public.pet_care_score_snapshots
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can delete score snapshots"
  on public.pet_care_score_snapshots
  for delete
  using (public.can_write_pet(pet_id));
